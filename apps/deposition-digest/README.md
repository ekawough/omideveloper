# Deposition Digest — Real-Time AI Deposition Analysis via Omi

**For civil litigation attorneys.**

Every competitor (Dodonai, SmartDepo, Lexis+, Westlaw) requires the deposition to end, the transcript to arrive from the court reporter (sometimes days later), then manual upload. Deposition Digest captures live — the attorney sees flagged admissions **while the witness is still on the stand**.

That's the moat.

---

## What it extracts

- 📋 **Key admissions** — flagged by strength (strong / moderate / weak) with significance
- ⚔️ **Contradictions** — internal inconsistencies with usage guidance
- ✅ **Favorable testimony** — statements to use at trial
- 📎 **Exhibit references** — everything the witness said about documents
- ❓ **Follow-up questions** — gaps and openings in testimony
- 🚨 **Red flags** — evasion patterns, potential perjury, credibility issues
- 🕐 **Timestamped transcript** — color-coded by admission / contradiction / favorable / exhibit
- 👤 **Witness profile** — role, credibility signals, demeanor

---

## How it works

```
Omi device (mic) → Deepgram STT → transcript_processed webhook →
Accumulate by session_id → POST /report → Claude analysis → HTML report
```

The attorney wears their Omi. After each witness answer (5-10 second silence window), Omi fires the webhook and the segment is stored. When the attorney calls `/report`, Claude analyzes the full accumulated transcript.

---

## Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/new)

1. Push to GitHub: `git push origin main`
2. Connect Railway → your GitHub repo → auto-deploys
3. Set `ANTHROPIC_API_KEY` in Railway Variables
4. Get Railway URL (e.g. `https://deposition-digest.up.railway.app`)
5. Paste into `omi-app-config.json` → `webhook_url`
6. Submit to Omi marketplace at h.omi.me

---

## Get the Omi device

**[omi.me](https://omi.me?ref=ekawough)** — starts at $17

---

## API Reference

### `POST /webhook`
Omi fires this automatically after each speech segment. Responds 200 immediately.

Payload from Omi:
```json
{
  "uid": "userUID",
  "session_id": "abc123",
  "segments": [{"text": "I was not present at the location", "speaker": "SPEAKER_00"}],
  "transcript": "I was not present at the location"
}
```

### `POST /report`
Generate HTML analysis report.
```json
{ "session_id": "abc123", "case_label": "Smith v. Jones — Dr. Williams Depo" }
```

### `POST /report/json`
Same analysis as raw JSON — for integrations.

### `POST /report/text`
Plain-text export — paste directly into Clio, MyCase, or any case management system.

### `GET /sessions`
List all active sessions.

### `DELETE /sessions/:id`
Clear a session.

---

## Local Setup

```bash
npm install
cp .env.example .env
# Add ANTHROPIC_API_KEY to .env
npm run dev

# Test with a sample deposition segment
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-001",
    "transcript": "Q: Were you present at the warehouse on March 15th? A: No, I was not there that day. Q: But you signed the delivery receipt dated March 15th, did you not? A: I may have signed it but I was not physically present."
  }'

# Get the report
curl -X POST http://localhost:3000/report \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test-001", "case_label": "Test Depo"}'
```

---

## Pricing

- **Free**: basic transcript + 3 key moments flagged
- **Pro ($49/mo)**: full admissions flagging, contradictions, follow-up questions, PDF export, multi-case file

Why $49: Dodonai charges $1/page. A 200-page depo = $200. Your $49/mo is a bargain for any litigating attorney who deposes monthly.

---

## Vertical content targets

- r/lawyers
- r/legaladvice
- r/paralegal
- r/LawSchool
- Product Hunt (launch as separate product)
- HN "Show HN: AI deposition analysis in real time via a $26 wearable"
