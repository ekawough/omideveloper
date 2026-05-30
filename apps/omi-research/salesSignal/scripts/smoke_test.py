"""End-to-end smoke test without the Omi device.

Generates a fake diarized transcript + silence audio, POSTs it to the agent
pipeline, verifies the response shape. Use this before demoing.
"""

from __future__ import annotations

import os
import sys

import requests

PIPELINE = os.environ.get("AGENT_PIPELINE_URL", "http://localhost:8000")

FAKE_TRANSCRIPT = (
    "Hi, I'm with Sunrise Solar. Do you own the home? "
    "Yeah I own it. My wife and I have been here seven years. "
    "Great. How much is your electric bill running? "
    "About two hundred and thirty a month, but it's been creeping up. "
    "We can usually cut that by sixty to eighty percent. "
    "Honestly I've talked to three companies already. "
    "I hear that. What was the hesitation with the others? "
    "Price mostly. And one of them had terrible reviews. "
    "Makes sense. Can I swing by Thursday evening to show you our numbers? "
    "Thursday works. Around six-thirty."
)

FAKE_SEGMENTS = [
    {"speaker": 0, "start": 0.0,  "end": 3.0,  "text": "Hi, I'm with Sunrise Solar. Do you own the home?"},
    {"speaker": 1, "start": 3.2,  "end": 6.5,  "text": "Yeah I own it. My wife and I have been here seven years."},
    {"speaker": 0, "start": 6.8,  "end": 8.8,  "text": "Great. How much is your electric bill running?"},
    {"speaker": 1, "start": 9.0,  "end": 12.5, "text": "About two hundred and thirty a month, but it's been creeping up."},
    {"speaker": 0, "start": 12.7, "end": 15.5, "text": "We can usually cut that by sixty to eighty percent."},
    {"speaker": 1, "start": 15.7, "end": 18.0, "text": "Honestly I've talked to three companies already."},
    {"speaker": 0, "start": 18.2, "end": 20.0, "text": "I hear that. What was the hesitation with the others?"},
    {"speaker": 1, "start": 20.2, "end": 23.5, "text": "Price mostly. And one of them had terrible reviews."},
    {"speaker": 0, "start": 23.7, "end": 27.5, "text": "Makes sense. Can I swing by Thursday evening to show you our numbers?"},
    {"speaker": 1, "start": 27.7, "end": 29.5, "text": "Thursday works. Around six-thirty."},
]


def main() -> int:
    r = requests.post(
        f"{PIPELINE}/process",
        json={
            "session_id": "smoke-test",
            "uid": "rep-demo-1",
            "transcript": FAKE_TRANSCRIPT,
            "segments": FAKE_SEGMENTS,
            "audio_path": None,
            "sample_rate": 16000,
            "duration_ms": 30_000,
        },
        timeout=120,
    )
    print(r.status_code, r.text[:500])
    r.raise_for_status()
    data = r.json()
    assert 1 <= data.get("lead_score", 0) <= 10, "lead_score out of range"
    print("smoke test passed in", data.get("duration_s"), "s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
