"""Fuse Deepgram text sentiment with acoustic emotion, per segment.

The interesting signal is *discrepancy*: text is polite but voice is angry —
"suppressed objection." Plain text-based systems (Siro, Rilla) cannot see this.

Output per segment:
  - sentiment_text      float in [-1, 1] from Deepgram
  - emotion_acoustic    label from SenseVoice/emotion2vec/SpeechBrain
  - fused_mood          one of: positive, neutral, negative, conflicted
  - flag                'suppressed_objection' | 'enthusiastic' | None
"""

from __future__ import annotations

from typing import Any, Iterable

NEGATIVE_EMOTIONS = {"angry", "sad", "fearful", "disgusted"}
POSITIVE_EMOTIONS = {"happy", "surprised"}


def _text_bucket(score: float) -> str:
    if score is None:   return "neutral"
    if score >=  0.25:  return "positive"
    if score <= -0.25:  return "negative"
    return "neutral"


def fuse(
    deepgram_segments: list[dict],
    deepgram_sentiment: dict | None,
    emotion_segments: list[dict],
) -> list[dict]:
    """Zip three aligned lists by index. Tolerant of missing inputs.

    deepgram_segments: [{speaker, text, start, end}, …]
    deepgram_sentiment: result from Deepgram /v1/read analyze with
        `segments: [{text, sentiment, sentiment_score}, …]` or None.
    emotion_segments: output of emotion_analyzer.analyze_segments().
    """
    # Index Deepgram sentiment by the text substring it matched against.
    sent_by_text = {}
    if deepgram_sentiment and isinstance(deepgram_sentiment, dict):
        for s in deepgram_sentiment.get("segments", []):
            t = (s.get("text") or "").strip().lower()
            if t:
                sent_by_text[t] = float(s.get("sentiment_score") or 0.0)

    emotion_by_idx = {i: e for i, e in enumerate(emotion_segments or [])}

    out: list[dict] = []
    for i, seg in enumerate(deepgram_segments or []):
        txt = (seg.get("text") or "").strip().lower()
        score_text = sent_by_text.get(txt, 0.0)
        emo_info = emotion_by_idx.get(i, {})
        emo = emo_info.get("emotion", "unknown")

        text_bucket = _text_bucket(score_text)
        acoustic_bucket = (
            "positive" if emo in POSITIVE_EMOTIONS
            else "negative" if emo in NEGATIVE_EMOTIONS
            else "neutral"
        )

        flag = None
        fused = "neutral"
        if text_bucket == "positive" and acoustic_bucket == "negative":
            fused = "conflicted"
            flag  = "suppressed_objection"
        elif text_bucket == "negative" and acoustic_bucket == "positive":
            fused = "conflicted"
            flag  = "sarcasm_or_resignation"
        elif text_bucket == acoustic_bucket:
            fused = text_bucket
            if text_bucket == "positive":
                flag = "enthusiastic"
        else:
            # One neutral, one not — take the non-neutral side.
            fused = text_bucket if text_bucket != "neutral" else acoustic_bucket

        out.append({
            "speaker":            seg.get("speaker"),
            "text":               seg.get("text"),
            "start":              seg.get("start"),
            "end":                seg.get("end"),
            "sentiment_text":     score_text,
            "emotion_acoustic":   emo,
            "emotion_confidence": emo_info.get("emotion_confidence", 0.0),
            "fused_mood":         fused,
            "flag":               flag,
        })
    return out


def summarize(fused: Iterable[dict]) -> dict[str, Any]:
    """Aggregate-level metrics the Scorer agent uses in prompts."""
    fused = list(fused)
    if not fused:
        return {"count": 0}

    by_speaker: dict[Any, dict[str, int]] = {}
    flags: dict[str, int] = {}
    text_scores: list[float] = []
    for s in fused:
        sp = s["speaker"]
        by_speaker.setdefault(sp, {"positive": 0, "neutral": 0, "negative": 0, "conflicted": 0})
        by_speaker[sp][s["fused_mood"]] = by_speaker[sp].get(s["fused_mood"], 0) + 1
        if s.get("flag"):
            flags[s["flag"]] = flags.get(s["flag"], 0) + 1
        text_scores.append(s["sentiment_text"])

    return {
        "count": len(fused),
        "by_speaker": by_speaker,
        "flags": flags,
        "avg_text_sentiment": sum(text_scores) / len(text_scores) if text_scores else 0.0,
        "sentiment_trajectory": [s["sentiment_text"] for s in fused],  # for plotting
    }
