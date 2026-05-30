"""Acoustic emotion detection, speaker-aware.

Three-tier fallback:
  1. SenseVoice-Small (FunASR) — 7 emotion classes, ~70ms per 10s of audio.
     *Must* read the <|EMOTION|> tags from the raw output BEFORE calling
     rich_transcription_postprocess(), which strips them. This burned the
     reference implementation repeatedly.
  2. emotion2vec+ large — MUST use the `plus` variant. The `base` variant only
     returns raw features, not labels. Slower but more accurate.
  3. SpeechBrain wav2vec2-IEMOCAP — only option with verified AMD ROCm support
     right now (Apr 2026). 4 classes only but robust.

Returns one emotion prediction per *segment* we're given (speaker-tagged
segments from Deepgram diarization).
"""

from __future__ import annotations

import io
import os
import re
from dataclasses import dataclass
from typing import Optional

import numpy as np

try:
    import torch
except Exception:      # torch is heavy; let callers degrade gracefully
    torch = None       # type: ignore

SENSEVOICE_EMOTION_TAGS = {
    "HAPPY":   "happy",
    "SAD":     "sad",
    "ANGRY":   "angry",
    "NEUTRAL": "neutral",
    "FEARFUL": "fearful",
    "DISGUST": "disgusted",
    "SURPRISE": "surprised",
}
TAG_RE = re.compile(r"<\|([A-Z_]+)\|>")


@dataclass
class EmotionResult:
    emotion: str                 # mapped label
    confidence: float
    backend: str                 # "sensevoice" | "emotion2vec" | "speechbrain"


class EmotionAnalyzer:
    """Singleton. Loads the first backend that succeeds."""

    _instance: Optional["EmotionAnalyzer"] = None

    def __init__(self):
        self.backend: str = "none"
        self.model = None
        self._try_sensevoice() or self._try_emotion2vec() or self._try_speechbrain()

    @classmethod
    def get(cls) -> "EmotionAnalyzer":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # ------------------------------------------------------------------ backends
    def _try_sensevoice(self) -> bool:
        try:
            from funasr import AutoModel                 # type: ignore
            self.model = AutoModel(
                model="iic/SenseVoiceSmall",
                trust_remote_code=True,
                device="cuda" if torch and torch.cuda.is_available() else "cpu",
            )
            self.backend = "sensevoice"
            print("[emotion] loaded SenseVoice-Small")
            return True
        except Exception as e:
            print(f"[emotion] SenseVoice load failed: {e}")
            return False

    def _try_emotion2vec(self) -> bool:
        try:
            from funasr import AutoModel                 # type: ignore
            self.model = AutoModel(
                # `plus` variant — base variant only returns features, not labels.
                model="iic/emotion2vec_plus_large",
                trust_remote_code=True,
            )
            self.backend = "emotion2vec"
            print("[emotion] loaded emotion2vec+ large")
            return True
        except Exception as e:
            print(f"[emotion] emotion2vec load failed: {e}")
            return False

    def _try_speechbrain(self) -> bool:
        try:
            from speechbrain.inference.interfaces import foreign_class  # type: ignore
            self.model = foreign_class(
                source="speechbrain/emotion-recognition-wav2vec2-IEMOCAP",
                pymodule_file="custom_interface.py",
                classname="CustomEncoderWav2vec2Classifier",
            )
            self.backend = "speechbrain"
            print("[emotion] loaded SpeechBrain wav2vec2-IEMOCAP")
            return True
        except Exception as e:
            print(f"[emotion] SpeechBrain load failed: {e}")
            return False

    # ------------------------------------------------------------------ predict
    def predict(self, pcm16: bytes, sample_rate: int = 16_000) -> EmotionResult:
        """PCM16 mono bytes → single emotion label for the clip."""
        if self.backend == "none" or self.model is None:
            return EmotionResult("unknown", 0.0, "none")

        # int16 → float32 [-1, 1]
        arr = np.frombuffer(pcm16, dtype=np.int16).astype(np.float32) / 32768.0

        if self.backend == "sensevoice":
            try:
                res = self.model.generate(
                    input=arr,
                    cache={},
                    language="en",
                    use_itn=True,
                    batch_size_s=60,
                )
                # IMPORTANT: read the tagged raw text BEFORE postprocess().
                raw = (res[0].get("text") or "") if res else ""
                m = TAG_RE.findall(raw)
                emo = "neutral"
                for tag in m:
                    if tag in SENSEVOICE_EMOTION_TAGS:
                        emo = SENSEVOICE_EMOTION_TAGS[tag]
                        break
                return EmotionResult(emo, 0.8, "sensevoice")
            except Exception as e:
                print(f"[emotion] sensevoice predict failed: {e}")
                return EmotionResult("unknown", 0.0, "sensevoice")

        if self.backend == "emotion2vec":
            try:
                res = self.model.generate(arr, granularity="utterance", extract_embedding=False)
                item = res[0] if res else {}
                labels = item.get("labels") or []
                scores = item.get("scores") or []
                if labels and scores:
                    i = int(np.argmax(scores))
                    return EmotionResult(str(labels[i]).lower(), float(scores[i]), "emotion2vec")
            except Exception as e:
                print(f"[emotion] emotion2vec predict failed: {e}")
            return EmotionResult("unknown", 0.0, "emotion2vec")

        if self.backend == "speechbrain":
            try:
                # SpeechBrain wants a path or tensor — wrap in temp file.
                import tempfile, soundfile as sf            # type: ignore
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                    sf.write(f.name, arr, sample_rate)
                    _, _, _, label = self.model.classify_file(f.name)  # type: ignore
                return EmotionResult(str(label).lower(), 0.7, "speechbrain")
            except Exception as e:
                print(f"[emotion] speechbrain predict failed: {e}")
                return EmotionResult("unknown", 0.0, "speechbrain")

        return EmotionResult("unknown", 0.0, self.backend)


def analyze_segments(
    pcm16_full: bytes,
    sample_rate: int,
    segments: list[dict],
) -> list[dict]:
    """For each diarized segment, slice the PCM and run emotion inference.

    segments is the list emitted by the Node webhook: [{speaker, text, start, end}, …]
    """
    analyzer = EmotionAnalyzer.get()
    bytes_per_sec = sample_rate * 2  # PCM16 mono
    out: list[dict] = []

    for seg in segments:
        start_b = max(0, int(seg.get("start", 0) * bytes_per_sec))
        end_b   = min(len(pcm16_full), int(seg.get("end", 0) * bytes_per_sec))
        if end_b - start_b < bytes_per_sec // 2:   # <0.5s, skip
            out.append({**seg, "emotion": "neutral", "emotion_confidence": 0.0, "backend": analyzer.backend})
            continue
        clip = pcm16_full[start_b:end_b]
        r = analyzer.predict(clip, sample_rate)
        out.append({
            **seg,
            "emotion": r.emotion,
            "emotion_confidence": r.confidence,
            "backend": r.backend,
        })
    return out
