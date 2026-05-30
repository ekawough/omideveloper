# webhook — Omi audio receiver

Node 20 / Express service that receives raw PCM16 from the Omi DevKit, streams
to Deepgram Nova-2 with diarization, buffers the full audio for acoustic
emotion analysis, and dispatches to the Python agent pipeline at
end-of-conversation.

## Run locally

```bash
cp .env.template .env        # fill in values
npm install
npm start
```

Verify it is up:

```bash
curl -s http://localhost:3000/health
```

## Omi device config

In the Omi app → Developer mode → Realtime audio bytes:

    https://YOUR_DOMAIN/webhook/audio?token=WEBHOOK_TOKEN&uid=REP_UID&sample_rate=16000

Omi sends raw PCM16 as `application/octet-stream`, NOT base64. We handle this
with `express.raw({ type: '*/*' })`.

## End-of-session triggers

We consider the conversation over when any of these fire:

1. 30 seconds of no chunks from the device (`IDLE_TIMEOUT_MS`)
2. 20 minutes hard cap (`MAX_SESSION_MS`)
3. `POST /webhook/end?token=…` with `{uid}` (Omi memory_created backup)
4. SIGTERM from Railway on redeploy (flushes all live sessions)

On end: we flush Deepgram, pull batch sentiment on the transcript, upload the
PCM blob to `audio-recordings` bucket, then POST to the agent pipeline.
