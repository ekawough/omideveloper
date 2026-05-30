# Quick Wins — MVPs You Can Ship This Weekend

The minimum viable slice of each top-ranked idea that you can actually ship in **1–3 days**. Goal: something you can show a real user by Monday.

## 🎯 The Universal Weekend Stack

Every app below uses the same core — learn it once, ship 20 apps.

```
┌─────────────────────────────────────────────┐
│ Frontend:  Next.js 14 (app router) + Tailwind + shadcn/ui │
│ Auth:      Supabase Auth (email magic link)              │
│ DB:        Supabase Postgres                             │
│ Storage:   Supabase Storage (for audio blobs)            │
│ Transcribe: Deepgram Nova-3 (fast) OR OpenAI Whisper    │
│ LLM:       Claude Haiku 4.5 (cheap) / Sonnet 4.6 (quality)│
│ Payments:  Stripe Checkout                               │
│ Deploy:    Vercel (free tier fine until you have users)  │
└─────────────────────────────────────────────┘
```

**Hello-world flow** (every app is a variation of this):
1. User hits "Record" → mic input captured via browser `MediaRecorder`
2. Audio uploaded to Supabase Storage
3. Deepgram/Whisper transcribes → returns text + timestamps
4. Claude API processes transcript with a **domain-specific system prompt** → structured JSON output
5. Render output in a vertical-appropriate UI (SOAP note / scorecard / checklist)
6. "Copy to clipboard" or "Export PDF" → done

**The only thing that changes between apps is the system prompt + output UI.**

---

## 1. 🩺 SOAP Note Generator (Weekend 1)

**Weekend goal:** Upload a 5-minute sample patient interview → get a formatted SOAP note.

- Skip: HIPAA compliance, EHR integrations, auth (just localhost for now)
- Ship: a single-page app where you upload an audio file, it transcribes, and outputs SOAP.
- System prompt: *"You are a clinical documentation assistant. Given this patient interview transcript, output a SOAP note in this exact format: Subjective: [...] / Objective: [...] / Assessment: [...] / Plan: [...]. Use clinical shorthand where appropriate. Do not fabricate findings not stated in the transcript."*
- **Demo to:** your own doctor, a friend in PT/OT/therapy, a small vet clinic. Any of them will tell you within 5 minutes if the output is good enough.
- **Hardest part:** getting a real 5-minute sample. Ask anyone who does patient consults if you can record one (with consent).

## 2. ⚖️ Deposition Digest (Weekend 1)

**Weekend goal:** Upload depo video → get timestamped transcript + key-admission list.

- Skip: exhibit numbering, court-compliant PDF export
- Ship: upload → AssemblyAI speaker-diarization → Claude extracts admissions with timestamps
- System prompt: *"You are a legal research assistant. Given this deposition transcript with speakers labeled as DEPONENT and COUNSEL, extract every DEPONENT statement that could be used as an admission. For each, output: timestamp, speaker, exact quote, and why it's significant. Do not paraphrase."*
- **Demo to:** a solo / small-firm attorney you know, or post in a subreddit (r/LawFirm). They'll tell you in 2 minutes if it saves them the 4 hours they currently spend reading.

## 3. 🏠 Showing Notes App (Weekend 1)

**Weekend goal:** Agent records voice note after a showing → structured note.

- Skip: MLS/CRM integration, team features
- Ship: PWA that records voice, transcribes, extracts {property address, buyer feedback, concerns, next-step}, saves to a simple "My Showings" list
- System prompt: *"You are a real-estate assistant. Extract: property address, buyer positive comments, buyer negative comments, deal-breakers, requested follow-ups, and estimated likelihood of offer (high/med/low)."*
- **Demo to:** one agent on Zillow. Agents are extremely online and respond to cold DMs.

## 4. 🧑‍💼 Sales Call Coach (Weekend 2)

**Weekend goal:** Upload Zoom recording → get MEDDIC scorecard.

- Skip: CRM auto-sync, multi-rep dashboards
- Ship: upload Zoom .mp4 → Deepgram → Claude with MEDDIC prompt → scorecard + 3 top coaching notes
- System prompt: *"You are a sales coach trained in MEDDIC. Score this call on Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion. Rate each 1–5 with evidence quotes. Then give the rep the 3 most important coaching points."*
- **Demo to:** any SDR / AE on LinkedIn. Sales people love tools that make them look good.

## 5. 🎓 Lecture-to-Flashcards (Weekend 1)

**Weekend goal:** Upload lecture → get Anki-compatible flashcard .csv.

- Skip: payments, accounts. Just make it work.
- Ship: upload audio → transcript → Claude generates {front, back} flashcards → download .csv for Anki import
- System prompt: *"You are a study-guide generator. From this lecture transcript, generate 20–40 flashcards in Q/A format. Focus on testable concepts, not filler. Skip the professor's tangents."*
- **Demo to:** literally any college student. Post in r/college or r/GetStudying. You'll have 100 users by Monday.

## 6. 💼 1-on-1 Journal (Weekend 1)

**Weekend goal:** Manager pastes notes from 1:1 → app remembers the person across sessions.

- Skip: audio capture for v1, just let people paste notes
- Ship: per-report timeline, Claude summarizes "last 3 1:1s with Sarah" on demand
- System prompt: *"You're a management assistant. Given this 1:1 note, extract: (a) direct-report commitments, (b) manager commitments, (c) concerns raised, (d) growth topics discussed. Timeline across sessions."*
- **Demo to:** any eng manager. Post in r/managers.

## 7. 🎙️ Podcast Show-Notes (Weekend 1)

**Weekend goal:** Drop .mp3 → get chapters, notes, tweet thread.

- This is the easiest to ship — almost no domain knowledge needed.
- System prompt: *"Generate: (1) timestamped chapters every ~5 min, (2) 250-word show description, (3) 5-tweet thread promoting this episode, (4) Apple Podcasts description under 4k chars, (5) 5 pull-quotes."*
- **Demo to:** podcast discord servers, r/podcasting, Podcast Movement.

---

## 🏁 Pick One. Ship By Sunday.

Don't try to build all 20. The trap is doing Weekend 1 on 3 different ideas and shipping zero. **Pick the vertical where you know someone in that field** — that's who you demo to first.

### My ranking if you want me to pick for you:

1. **If you know any college students** → #5 (Lecture-to-Flashcards). Easiest, largest user base, fastest feedback loop.
2. **If you know any doctors/therapists/PTs** → #1 (SOAP Notes). Highest revenue per user, deepest moat.
3. **If you know any real-estate agents** → #3 (Showing Notes). Agents pay for tools, decision-maker is one person.
4. **If you don't know anyone in any of these** → #7 (Podcast Show-Notes). Easiest to build, easiest to find users (Twitter/podcast discords).

---

## ⚡ The 1-Hour Spike Test (before committing a weekend)

Before you build, spike for 1 hour:

1. Write the **system prompt** for the app you're considering
2. Take 1 sample audio recording (or find one on YouTube)
3. Transcribe with a free tool (Whisper.cpp locally, or trial Deepgram)
4. Paste transcript + prompt into Claude.ai directly
5. **Look at the output. Is it actually useful?**

If the output looks great, build it. If the output is garbage, iterate on the prompt for 30 more minutes. If it's still garbage, pick a different idea.

This is the single highest-leverage thing you can do. A weekend wasted on building UI for a garbage AI output is a weekend wasted. A prompt that already works means the app is 80% already done.

---

## 🛑 What Not To Build

Avoid these tempting-but-doomed ideas:

- ❌ **"Omi for X" generic AI wearable** — Omi already exists. They have hardware. Don't compete where they're strong.
- ❌ **Enterprise compliance (SOC 2, HIPAA as a service)** — too slow to close, need legal team, long sales cycles.
- ❌ **Anything requiring a hardware device** — you're a software person (presumably). Stay there.
- ❌ **Anything needing FDA / medical-device clearance** — 18-month minimum to ship.
- ❌ **"ChatGPT wrapper" with no vertical focus** — commodity, race to the bottom.

Keep it boring: one vertical, one killer output format, one integration. Ship. Iterate.
