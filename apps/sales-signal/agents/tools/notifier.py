"""Supabase notifier — writes results back for the admin panel's realtime sub."""

from __future__ import annotations

import os
from typing import Any, Optional

from supabase import Client, create_client


def _client() -> Optional[Client]:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return None
    return create_client(url, key)


def mark_processing(session_id: str) -> None:
    c = _client()
    if not c or not session_id:
        return
    c.table("sessions").update({"status": "processing"}).eq("id", session_id).execute()


def mark_completed(
    session_id: str,
    lead_score: int,
    crew_output: dict[str, Any],
    fused_timeline: list[dict],
    emotion_analysis: list[dict],
    sentiment_scores: dict | None,
    ghl_contact_id: Optional[str],
    hubspot_contact_id: Optional[str],
) -> None:
    c = _client()
    if not c or not session_id:
        return
    c.table("sessions").update({
        "status": "completed",
        "lead_score": int(max(1, min(10, lead_score))),
        "crew_output": crew_output,
        "fusion_timeline": fused_timeline,
        "emotion_analysis": emotion_analysis,
        "sentiment_scores": sentiment_scores,
        "ghl_contact_id": ghl_contact_id,
        "hubspot_contact_id": hubspot_contact_id,
        "completed_at": "now()",
    }).eq("id", session_id).execute()


def mark_error(session_id: str, msg: str) -> None:
    c = _client()
    if not c or not session_id:
        return
    c.table("sessions").update({
        "status": "error",
        "error_message": msg[:1000],
    }).eq("id", session_id).execute()


def load_audio(storage_path: str) -> bytes:
    c = _client()
    if not c or not storage_path:
        return b""
    return c.storage.from_("audio-recordings").download(storage_path)
