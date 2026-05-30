"""FastAPI service: webhook posts here at end-of-conversation.

Flow:
  1. Pull audio from Supabase Storage (if provided).
  2. Run SenseVoice/emotion2vec/SpeechBrain per diarized segment.
  3. Fuse with Deepgram text sentiment.
  4. Run the three-agent CrewAI pipeline (Parser → Scorer → CRM Writer).
  5. Push contact to GHL and HubSpot.
  6. Update Supabase; admin panel gets a realtime event.

Runs crew.kickoff() inside asyncio.to_thread() so we don't block the event loop.
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import time
from typing import Any, Optional

from crewai import Crew, Process
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .tasks import make_crm_task, make_parse_task, make_score_task
from .tools import emotion_analyzer, ghl_crm, hubspot_crm, notifier
from .tools.sentiment_fusion import fuse, summarize

app = FastAPI(title="SalesSignal agent pipeline")

# --- field sanitizers (quality checklist #4) --------------------------------
_PHONE_RE = re.compile(r"[\d\+\-\(\)\s\.]{7,20}")
_EMAIL_RE = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$")
_JUNK_PHRASES = {"not sure", "didn't say", "unknown", "n/a", "none", "null"}


def _sanitize_str(v: Any) -> Optional[str]:
    """Return None for empty, whitespace-only, or obviously junk LLM outputs."""
    if not v or not isinstance(v, str):
        return None
    v = v.strip()
    if not v or v.lower() in _JUNK_PHRASES:
        return None
    return v


def _sanitize_phone(v: Any) -> Optional[str]:
    v = _sanitize_str(v)
    if not v:
        return None
    digits = re.sub(r"[^\d+]", "", v)
    if len(digits) < 7 or len(digits) > 15:
        return None  # too short/long to be a real number
    return v  # keep original formatting for CRM display


def _sanitize_email(v: Any) -> Optional[str]:
    v = _sanitize_str(v)
    if not v:
        return None
    if not _EMAIL_RE.match(v):
        return None
    # Block obviously hallucinated emails
    if any(x in v.lower() for x in ("example.com", "test.com", "placeholder")):
        return None
    return v


class ProcessRequest(BaseModel):
    session_id: Optional[str] = None
    uid: str
    transcript: str
    segments: list[dict] = []           # Deepgram diarized segments
    audio_path: Optional[str] = None     # supabase storage path
    sample_rate: int = 16_000
    duration_ms: int = 0
    deepgram_sentiment: Optional[dict] = None


@app.get("/health")
def health():
    return {"ok": True, "emotion_backend": emotion_analyzer.EmotionAnalyzer.get().backend}


def _strip_fences(s: str) -> str:
    """Llama 3.1 sometimes wraps JSON in ```json fences despite instructions."""
    s = s.strip()
    s = re.sub(r"^```(?:json)?\s*", "", s)
    s = re.sub(r"\s*```$", "", s)
    return s.strip()


def _parse_json(raw: str, default: dict | None = None) -> dict[str, Any]:
    try:
        return json.loads(_strip_fences(raw))
    except Exception:
        # Last-ditch: find the first {...} block.
        m = re.search(r"\{.*\}", raw, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                pass
        return default or {}


def _run_crew(transcript: str, fused_summary: dict) -> dict[str, Any]:
    """Synchronous — called inside asyncio.to_thread()."""
    parse_task = make_parse_task(transcript, fused_summary)
    crew1 = Crew(agents=[parse_task.agent], tasks=[parse_task], process=Process.sequential, verbose=False)
    parse_raw = str(crew1.kickoff())
    parsed = _parse_json(parse_raw, {})

    score_task = make_score_task(json.dumps(parsed), fused_summary)
    crew2 = Crew(agents=[score_task.agent], tasks=[score_task], process=Process.sequential, verbose=False)
    score_raw = str(crew2.kickoff())
    scored = _parse_json(score_raw, {"lead_score": 5, "score_rationale": "fallback"})

    crm_task = make_crm_task(json.dumps(parsed), json.dumps(scored))
    crew3 = Crew(agents=[crm_task.agent], tasks=[crm_task], process=Process.sequential, verbose=False)
    crm_raw = str(crew3.kickoff())
    crm_pack = _parse_json(crm_raw, {"crm_note": scored.get("conversation_summary", ""), "tags": []})

    return {"parsed": parsed, "scored": scored, "crm": crm_pack}


@app.post("/process")
async def process(req: ProcessRequest):
    t0 = time.time()
    session_id = req.session_id or ""

    if session_id:
        notifier.mark_processing(session_id)

    # --- 1. Emotion per segment ---------------------------------------
    audio_bytes = b""
    if req.audio_path:
        try:
            audio_bytes = notifier.load_audio(req.audio_path)
        except Exception as e:
            print(f"[pipeline] audio load failed: {e}")

    emotion_segments: list[dict] = []
    if audio_bytes and req.segments:
        try:
            emotion_segments = await asyncio.to_thread(
                emotion_analyzer.analyze_segments,
                audio_bytes, req.sample_rate, req.segments,
            )
        except Exception as e:
            print(f"[pipeline] emotion failed: {e}")

    # --- 2. Fuse with Deepgram text sentiment -------------------------
    fused = fuse(req.segments, req.deepgram_sentiment, emotion_segments)
    fused_summary = summarize(fused)

    # --- 3. Crew ------------------------------------------------------
    try:
        crew_out = await asyncio.to_thread(_run_crew, req.transcript, fused_summary)
    except Exception as e:
        msg = f"crew: {e}"
        print(f"[pipeline] {msg}")
        if session_id:
            notifier.mark_error(session_id, msg)
        raise HTTPException(status_code=500, detail=msg)

    parsed  = crew_out["parsed"]
    scored  = crew_out["scored"]
    crm_pack = crew_out["crm"]

    # --- 4. CRM push --------------------------------------------------
    ghl_id: Optional[str] = None
    hs_id:  Optional[str] = None
    crm_errors: list[str] = []

    name = (parsed.get("homeowner_name") or "Unknown").strip() or "Unknown"
    phone = _sanitize_phone(parsed.get("homeowner_phone"))
    email = _sanitize_email(parsed.get("homeowner_email"))
    addr  = _sanitize_str(parsed.get("property_address"))
    score = max(1, min(10, int(scored.get("lead_score") or 5)))
    note  = crm_pack.get("crm_note") or scored.get("conversation_summary") or ""
    tags  = crm_pack.get("tags") or []

    if os.environ.get("GHL_API_TOKEN"):
        try:
            g = await asyncio.to_thread(
                ghl_crm.push_lead, name, phone, email, addr, score, note, tags,
            )
            ghl_id = g.get("contact_id")
        except Exception as e:
            crm_errors.append(f"ghl: {e}")

    if os.environ.get("HUBSPOT_ACCESS_TOKEN"):
        try:
            h = await asyncio.to_thread(
                hubspot_crm.push_lead, name, phone, email, addr, score, note,
            )
            hs_id = h.get("contact_id")
        except Exception as e:
            crm_errors.append(f"hubspot: {e}")

    # --- 5. Notify ----------------------------------------------------
    if session_id:
        notifier.mark_completed(
            session_id=session_id,
            lead_score=score,
            crew_output={"parsed": parsed, "scored": scored, "crm": crm_pack, "crm_errors": crm_errors},
            fused_timeline=fused,
            emotion_analysis=emotion_segments,
            sentiment_scores=req.deepgram_sentiment,
            ghl_contact_id=ghl_id,
            hubspot_contact_id=hs_id,
        )

    return {
        "ok": True,
        "session_id": session_id,
        "lead_score": score,
        "ghl_contact_id": ghl_id,
        "hubspot_contact_id": hs_id,
        "crm_errors": crm_errors,
        "duration_s": round(time.time() - t0, 3),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "agents.pipeline:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000)),
        reload=False,
    )
