# Conversation intelligence — what Layer 2 actually does

## The thesis

Text-only sales analytics (Gong, Siro, Rilla) see what was said. They can
tell you the rep mentioned price at 4:32. They cannot tell you the
homeowner's voice went cold when she said "sounds good."

Voice-only emotion APIs (Hume, Symbl) see how it was said but lose the
semantic thread. They can tell you someone sounded anxious for a stretch;
they don't know what triggered it.

SalesSignal fuses both, speaker-aware, per segment. The interesting signal
is the *discrepancy* — polite words delivered in a negative tone — because
that's what actually predicts the lead cooling off.

## Three inputs, one timeline

For every diarized segment Deepgram produces, we build a row:

```
{
  speaker:              0 | 1,
  text:                 "Sounds great, I'll think about it.",
  start, end:           2.1, 3.8,     // seconds from conversation start

  sentiment_text:       +0.4,         // Deepgram /v1/read, -1 … +1
  emotion_acoustic:     "angry",      // SenseVoice|emotion2vec|SpeechBrain
  emotion_confidence:   0.83,

  fused_mood:           "conflicted", // agreement classifier, below
  flag:                 "suppressed_objection"
}
```

### Fusion rules (see `agents/tools/sentiment_fusion.py`)

| Text bucket | Acoustic bucket | fused_mood | flag |
|---|---|---|---|
| positive | positive | positive   | enthusiastic |
| positive | negative | conflicted | **suppressed_objection** |
| negative | positive | conflicted | sarcasm_or_resignation |
| negative | negative | negative   | — |
| neutral  | any      | (acoustic) | — |
| any      | neutral  | (text)     | — |

Buckets come from thresholds ±0.25 on `sentiment_text`; emotions are
grouped `{happy, surprised} → positive`, `{angry, sad, fearful, disgusted}
→ negative`.

### Why we do not blend into a single scalar

We tested a weighted mean (0.6 × text + 0.4 × emotion → one number) and
lost the suppressed-objection signal, which is *the* most actionable piece
for a sales manager. A rep whose conversation averaged +0.2 but hit
"suppressed_objection" three times is a different coaching conversation
than a flat +0.2 with no discrepancies.

## Model choice and fallback chain

1. **SenseVoice-Small (FunASR)** — primary. Seven emotion classes, ~70 ms
   per 10 s of audio on an MI300X. MIT license. The gotcha: emotion tags
   come out wrapped in `<|TAG|>` markers in the *raw* output, and
   `rich_transcription_postprocess()` strips them. Read the raw string
   first.
2. **emotion2vec+ large** — backup. Must use the `plus` variant; the `base`
   variant returns embeddings only. Better calibration on negative
   emotions, slower.
3. **SpeechBrain wav2vec2-IEMOCAP** — final fallback. Only four classes
   (neutral / happy / angry / sad) but the only option with verified AMD
   ROCm 6.x support as of April 2026. Apache 2.0.

`EmotionAnalyzer.__init__` tries them in order at import time and logs
which backend it picked. The fallback is a deployment-time concern, not a
per-request concern — once an instance is up, you know which backend is
serving.

## What the admin panel shows

Per completed session:

- A single line chart of `sentiment_text` over time with flag annotations
  (red dots at `suppressed_objection` timestamps).
- The raw per-segment table exposed via `fusion_timeline` JSONB on the
  `sessions` row, so power users can drill in.
- A two-sentence summary from the Scorer agent ("Homeowner engaged early;
  sentiment cooled sharply after pricing at 4:32, with suppressed
  objections on value. Appointment secured anyway — follow up before
  Thursday to reinforce ROI.").

## What we deliberately don't ship in Layer 2

Prosodic feature extraction (openSMILE eGeMAPSv02, 88 features) runs on
CPU and is what Layer 3 coaching will use to generate rep-specific
insights ("your vocal energy drops in the last 90 seconds of a call"). We
wired the dependency into `requirements.txt` but do not run it in the
hackathon pipeline. That's the roadmap slide.
