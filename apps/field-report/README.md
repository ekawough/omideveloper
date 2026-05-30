# Field Report — Voice-to-Invoice Reports via Omi AI

**For HVAC, plumbing, and electrical technicians.**

Speak your job notes for 60 seconds → Field Report generates a complete, professional work order. Parts used, diagnosis, work performed, follow-up recommendations — all extracted and formatted automatically.

**No typing. No tablet fumbling. Just talk.**

---

## How it works

```
Omi device (mic) → Deepgram STT → transcript_processed webhook → Claude → Structured work order
```

The tech walks to their truck after a job, speaks naturally: "replaced the run capacitor on the condenser, 45/5 MFD, part number CR45X5, also told the customer the contactor looked worn so I gave them a quote for that, about 35 bucks in parts, took me about 45 minutes total."

Field Report returns:

- ✅ Job summary
- ✅ Problem reported vs. actual diagnosis
- ✅ Work performed checklist
- ✅ Parts table with quantities and part numbers
- ✅ Follow-up recommendations with urgency level
- ✅ Customer notes
- ✅ Invoice/billing notes
- ✅ Safety/code flags
- ✅ Photos recommended list
- ✅ Signature lines for paper backup

---

## Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/new)

1. Push this repo to GitHub
2. Connect Railway to your GitHub repo
3. Set environment variable: `ANTHROPIC_API_KEY`
4. Railway auto-deploys — get your URL
5. Paste the Railway URL into `omi-app-config.json` as `webhook_url`
6. Submit to Omi marketplace at h.omi.me

---

## Get the Omi device

Field Report requires an Omi AI wearable. Get yours:

**[omi.me](https://omi.me?ref=ekawough)** — starts at $17

---

## API Reference

### `POST /webhook`
Receives Omi `transcript_processed` events. Responds immediately with `200`. Accumulates transcript by `session_id`.

### `POST /report`
Generates HTML work order from accumulated session.

```json
{
  "session_id": "abc123",
  "tech_name": "Mike Torres",
  "job_type": "HVAC Repair",
  "customer_name": "Johnson Residence",
  "address": "1234 Oak St"
}
```

### `POST /report/json`
Same as `/report` but returns raw JSON — useful for pushing to ServiceTitan or Jobber via their APIs.

### `GET /sessions`
Lists all active sessions.

### `DELETE /sessions/:id`
Clears a session from memory.

---

## Local Setup

```bash
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm run dev
```

Test with sample webhook payload:

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "user123",
    "session_id": "test-001",
    "transcript": "replaced the run capacitor on the Carrier condenser unit, it was a 45/5 MFD cap, part number CR45X5L, also noticed the contactor looked worn and pitted so I showed the customer and gave her a quote for that, should be done soon before next summer. Took me about 45 minutes total on site."
  }'

curl -X POST http://localhost:3000/report \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-001",
    "tech_name": "Mike Torres",
    "job_type": "HVAC Repair",
    "customer_name": "Sarah Johnson",
    "address": "1234 Oak Street, Austin TX"
  }'
```

---

## Vertical subreddit targets

- r/HVAC
- r/Plumbing
- r/electricians
- r/HomeImprovement (contractor perspective)
- r/smallbusiness

---

## Roadmap

- [ ] ServiceTitan API push (auto-create work order)
- [ ] Jobber API push
- [ ] Customer-facing summary email
- [ ] Photo upload + AI description
- [ ] Stripe billing ($29/mo Pro)
