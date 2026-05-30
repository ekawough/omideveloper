# SalesSignal

> Multi-agent AI that turns D2D sales conversations into CRM workflows with acoustic emotion detection.

Rep wears Omi. Homeowner talks. In under 5 seconds: contact lands in
GoHighLevel and HubSpot, lead scored 1-10, with a sentiment timeline
showing where the call warmed up or cooled off. Built for the AMD ×
lablab.ai hackathon, May 2026.

## Layout

```
salesSignal/
├── webhook/       Node 20 — Omi receiver, Deepgram bridge, dispatcher
├── agents/        Python — FastAPI + CrewAI + emotion + CRM clients
├── admin/         Static React SPA (CDN-based) for the operator
├── scripts/       AMD vLLM launcher, emotion pre-warm, smoke test
├── supabase/      Schema + RLS + realtime + storage bucket
└── docs/          Architecture, legal, conversation intelligence, runbook,
                   slides outline, video script, submission copy
```

## Start here

1. Read `docs/RUNBOOK.md` — step-by-step from empty laptop to live demo.
2. Read `docs/ARCHITECTURE.md` — one-paragraph overview and the box diagram.
3. Read `docs/CONVERSATION_INTELLIGENCE.md` — how the sentiment fusion works.

## Tech, in one line each

- **Audio** — Omi DevKit 2 (BLE), raw PCM16 at 16 kHz over HTTPS.
- **Transcription** — Deepgram Nova-2 streaming with diarization + batch
  `/v1/read` for text sentiment.
- **Acoustic emotion** — SenseVoice-Small (primary), emotion2vec+ large
  (backup), SpeechBrain wav2vec2-IEMOCAP (fallback).
- **LLM** — Llama 3.1 8B Instruct on AMD MI300X via `vllm-openai-rocm:v0.19.0`.
- **Orchestration** — CrewAI 1.14 (no litellm).
- **CRM** — GoHighLevel and HubSpot direct APIs in parallel.
- **Persistence** — Supabase Pro (Postgres + Realtime + Storage).
- **Deploy** — Railway, two services, private networking.

## Cost

~$0.24 per conversation. Competitors charge $3-5K/user/year for a subset
of the features.

## License

All original code: MIT. Third-party model licenses vary (SenseVoice MIT,
emotion2vec MIT, SpeechBrain Apache 2.0, Llama 3.1 Meta Community).
