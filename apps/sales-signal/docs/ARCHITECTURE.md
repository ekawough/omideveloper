# Architecture

## One-paragraph overview

A rep wearing an Omi DevKit 2 streams raw PCM16 audio over BLE to their phone.
The Omi app forwards it to our Node webhook at `/webhook/audio`. The webhook
bridges the stream into Deepgram Nova-2 for diarized live transcription, and
buffers the full PCM for acoustic-emotion analysis. When the rep walks away
(30s of silence), the webhook closes the Deepgram stream, runs Deepgram's
batch sentiment on the transcript, uploads the PCM to Supabase Storage, and
fires a single `POST /process` at the Python agent pipeline. That pipeline
runs SenseVoice / emotion2vec / SpeechBrain per diarized segment, fuses with
the text sentiment, and kicks a three-agent CrewAI crew on Llama 3.1 8B
served from AMD MI300X via vLLM. The agents produce a structured lead, a 1-10
score with reasoning, and a CRM note, which the pipeline pushes into
GoHighLevel AND HubSpot in parallel. Supabase records everything; the React
admin panel picks up the update over Realtime.

## Physical topology

```
 ┌──────────────────┐       ┌──────────────────────────┐
 │ Omi DevKit 2 BLE │──PCM→│ iPhone/iPad — Omi app     │
 └──────────────────┘       └─────────┬────────────────┘
                                      │ HTTPS POST (octet-stream)
                                      ▼
 ┌────────────────────────── Railway project ──────────────────────────┐
 │                                                                     │
 │  ┌────────────────────────┐        ┌────────────────────────────┐   │
 │  │ webhook (Node 20)      │──WSS──▶│ Deepgram Nova-2 (streaming)│   │
 │  │  express.raw PCM       │        └────────────────────────────┘   │
 │  │  per-uid session map   │                                         │
 │  │  30s idle → end        │◀──HTTPS── Deepgram /v1/read (batch)      │
 │  │  uploads PCM           │                                         │
 │  └──────────┬─────────────┘                                         │
 │             │ private network                                       │
 │             ▼                                                       │
 │  ┌────────────────────────┐        ┌───────────────────────────┐    │
 │  │ agents (FastAPI/Py)    │──────▶│ GoHighLevel                │    │
 │  │  CrewAI                │──────▶│ HubSpot                    │    │
 │  │  emotion (SenseVoice…) │        └───────────────────────────┘    │
 │  │  fusion                │                                         │
 │  └──────────┬─────────────┘                                         │
 └─────────────┼───────────────────────────────────────────────────────┘
               │ OpenAI-compatible HTTP
               ▼
 ┌────────────────── AMD Developer Cloud (MI300X) ───────────────────┐
 │   vllm/vllm-openai-rocm:v0.19.0                                   │
 │   Llama 3.1 8B Instruct, bfloat16                                 │
 └───────────────────────────────────────────────────────────────────┘
               ▲
               │
 ┌─────────────┴─── Supabase Pro ──────────────────────────────────┐
 │  Postgres: sessions, reps, consent_log, org_settings            │
 │  Storage:  audio-recordings/ (30-day retention)                 │
 │  Realtime: sessions → admin panel                                │
 └─────────────────────────────────────────────────────────────────┘
               ▲
               │ REST + Realtime WebSocket
               │
 ┌─────────────┴────────────┐
 │ Admin panel (static SPA) │
 │  recharts sentiment line │
 └──────────────────────────┘
```

## Latency budget (end-of-conversation to CRM write)

| Step                    | Target  | Notes |
|-------------------------|---------|-------|
| Deepgram finalize       | 800 ms  | last chunks + grace window |
| Batch sentiment         | 500 ms  | `/v1/read` on ~300 words |
| Supabase upload PCM     | 400 ms  | ~2-5 MB |
| HTTP dispatch → agents  | 50 ms   | Railway private network |
| Emotion (SenseVoice)    | 700 ms  | 10 segments × 70 ms |
| Parser agent            | 700 ms  | Llama 3.1 8B bfloat16 |
| Scorer agent            | 800 ms  | ~600 output tokens |
| CRM Writer agent        | 700 ms  | ~400 output tokens |
| GHL + HubSpot (parallel)| 700 ms  | upsert + note + deal |
| **Total**               | **~5 s**| within the advertised budget |

## Idempotency and failure modes

- **Omi retries on 5xx.** We return `200 {dropped:true}` on malformed frames
  so Omi doesn't hammer us with a duplicate stream.
- **Deepgram stream drop.** Session in memory keeps the PCM; when we finally
  finalize we still have full audio. We log `dg error` and continue.
- **AMD vLLM unreachable.** Parser task returns None → we mark session `error`
  with a clear message. No CRM write.
- **GHL down but HubSpot up** (or vice versa). Each CRM push is independently
  try/except'd. Session rows record `crm_errors` array.
- **Partial data.** If the parser returns `homeowner_name: null` we still
  create a contact named "Unknown" so the rep has a record. The score and
  note reveal why it is low.
- **Graceful shutdown.** SIGTERM triggers flush of all live sessions before
  exit — nothing lost on Railway redeploy.

## Security posture

- PCM audio lives in a private Supabase bucket; default retention 30 days.
- Deepgram and Anthropic-free (we don't route transcripts anywhere outside
  our own infrastructure once Llama is hot).
- `WEBHOOK_TOKEN` shared secret scopes the Omi endpoint; any unknown caller
  hits 401.
- Service-role key only lives in the webhook/agents containers — never in
  the browser. The admin panel uses the public anon key and RLS policies.
