# Showing Notes — Real-Time Showing Notes via Omi AI

**For real estate buyer's agents.**

Stop typing notes into your phone during showings. Wear your Omi, walk through the property normally, talk about what you're seeing and what the buyer is saying. Showing Notes does the rest.

---

## What you get after every showing

- 🔥 **Interest level** — Hot / Warm / Neutral / Cold with reasoning
- ✅ **What they loved** — Specific features the buyer reacted positively to
- ⚠️ **Concerns raised** — Objections and questions that need answers
- 🚫 **Deal breakers** — Hard stops that could kill the deal
- 💰 **Price signals** — Any offer or price commentary captured
- ❓ **Open questions** — Buyer questions that need follow-up answers
- 🏡 **Lifestyle context** — Family situation, commute, lifestyle fit
- 📋 **Action items** — What you need to do next and who does it
- ✉️ **Draft follow-up email** — Ready-to-send personalized email to the buyer

---

## How it works

```
Omi device (mic) → Deepgram STT → transcript_processed webhook → Claude → Structured notes + CRM push
```

---

## Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/new)

1. Push this repo to GitHub
2. Connect Railway to your GitHub repo
3. Set `ANTHROPIC_API_KEY` in Railway Variables
4. Get your Railway URL → paste into `omi-app-config.json`
5. Submit to Omi marketplace at h.omi.me

---

## Get the Omi device

**[omi.me](https://omi.me?ref=ekawough)** — starts at $17

---

## API Reference

### `POST /webhook`
Receives Omi `transcript_processed` events. Responds immediately.

### `POST /notes`
Generates HTML notes report from accumulated session.

```json
{
  "session_id": "abc123",
  "agent_name": "Sarah Chen",
  "buyer_name": "The Martins",
  "property_address": "4521 Maple Drive, Austin TX 78704",
  "mls_number": "TX8849210",
  "crm_webhook": "https://app.followupboss.com/v1/events" 
}
```

`crm_webhook` is optional — if provided, pushes structured buyer data to that URL automatically.

### `POST /notes/json`
Returns raw JSON — for custom CRM integrations.

### `GET /sessions`
Lists active sessions.

### `DELETE /sessions/:id`
Clears a session.

---

## CRM Webhook Payload

When `crm_webhook` is provided, Showing Notes POSTs this to your CRM:

```json
{
  "source": "showing-notes-omi",
  "session_id": "abc123",
  "agent": "Sarah Chen",
  "buyer": "The Martins",
  "property": "4521 Maple Drive",
  "mls_number": "TX8849210",
  "overall_interest": "warm",
  "must_haves_met": true,
  "deal_breakers": ["Master closet too small"],
  "follow_up_action": "schedule_second_showing",
  "note_summary": "Buyers loved the kitchen and backyard...",
  "generated_at": "2026-04-25T14:30:00Z"
}
```

---

## Local Setup

```bash
npm install
cp .env.example .env
# Add ANTHROPIC_API_KEY
npm run dev
```

Test:

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-001",
    "transcript": "She really loved the kitchen, kept saying wow, and the backyard was a big hit because of the pool. But she immediately asked about the neighbors when she saw the fence damage, and said the master closet was way too small. She asked if they would take 410 and mentioned they saw a better-priced house on Oak Street last week."
  }'

curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-001",
    "agent_name": "Sarah Chen",
    "buyer_name": "The Martinez Family",
    "property_address": "4521 Maple Drive, Austin TX"
  }'
```
