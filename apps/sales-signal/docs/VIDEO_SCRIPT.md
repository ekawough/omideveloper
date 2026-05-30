# 5-minute demo video script

Aim for 4:45 to leave headroom. Record in one pass if you can; edit only
to trim dead air. Use OBS or Loom.

## Setup shot list
- You on camera (laptop webcam is fine)
- Screen recording of:
  1. The admin panel (`/index.html`)
  2. The consent form (`/consent.html`)
  3. A GHL contact detail view
  4. A HubSpot contact detail view
  5. A terminal showing the AMD vLLM logs (optional, adds credibility)
- One Omi DevKit 2 with mic, paired to your phone

---

### 0:00 — 0:20  Intro (on camera)
> "I'm Ethan. I'm building SalesSignal, an AI sales assistant for the 2.3
> million door-to-door reps in the US who — today — have literally zero AI
> at the point where they talk to a homeowner. In the next five minutes
> I'll show you how we fix that, and why it works on any CRM."

### 0:20 — 0:50  The problem (slide 2)
> "Reps do 50 to 60 conversations a day. They forget names. They forget
> what the homeowner's electric bill was. The best lead of the day lives
> in a shaky iPhone voice memo and dies there. Siro raised $75M doing
> text-only analytics. Rilla charges four to five thousand dollars a user
> and locks you into ServiceTitan. Nobody's actually at the field rep."

### 0:50 — 1:30  What we built (slide 4 → 5)
> "SalesSignal runs on an Omi wearable. It captures the conversation.
> Streams it to Deepgram for a live diarized transcript. Runs
> SenseVoice on the homeowner's voice — seven acoustic emotion classes.
> Fuses text sentiment with voice emotion, per segment. That's the
> breakthrough: text says 'sounds good', voice says angry — we flag it as
> a suppressed objection. Three CrewAI agents on Llama 3.1 8B,
> running on an AMD MI300X — they parse, score, and write the lead into
> the CRM. All in under five seconds."

### 1:30 — 3:30  Live demo
Switch to screen share.

**1:30-1:45 — Consent flow.** Open `consent.html` on an iPad frame or a
phone emulator.
> "Before we record, the rep's tablet shows this. Geolocation tells it
> we're in a two-party state — the rep's name, California. The homeowner
> confirms. Every consent gets logged with a timestamp, GPS, and script
> snapshot. That's legally airtight; the other guys skip it."

**1:45-2:30 — Live conversation.** Talk into the Omi for 45 seconds as if
you're the rep pitching a homeowner.
> "Hi, I'm with Sunrise Solar. Do you own the home? … How much is your
> bill? … We can usually cut that by 60 to 80 percent. … Great, can I
> swing by Thursday?"

**2:30-3:00 — Processing.** Switch to the admin panel. Point at the
session row turning `active → processing → completed`.
> "There it is — active, processing, completed in about 4 seconds. Lead
> score seven out of ten. Let me open it."

**3:00-3:30 — Detail view.** Click the row. Sentiment timeline. Point at
a flag if there is one.
> "Sentiment timeline, per speaker, over the course of the call. If the
> homeowner had cooled off at pricing, you'd see it right here. Transcript
> below. Structured lead data, agent reasoning, and —"

### 3:30 — 4:15  Both CRMs
> "— the contact is already in GoHighLevel…" (open GHL tab) "…and in
> HubSpot." (open HubSpot tab) "Same lead. One conversation. Zero data
> entry. This is what CRM-agnostic actually looks like."

### 4:15 — 4:45  Numbers + roadmap
> "Twenty-four cents per conversation. Compare that to Rilla at four to
> five grand per user per year. On the roadmap, we aggregate across fifty
> conversations per rep to generate personalized coaching — ‘your vocal
> energy drops after 90 seconds, practice pacing’. We already capture
> those prosodic features."

### 4:45 — 5:00  Close
> "SalesSignal. Wearable to CRM in five seconds, with emotion awareness
> nobody else has, running on AMD MI300X. GitHub link in the
> description. Thanks."

---

## Backup plan

If the Omi hardware or the network misbehaves at the venue, substitute
the live conversation (1:45-2:30) with a pre-recorded playback of the
same audio and a disclosure: "This audio was recorded at my desk
earlier." The rest of the demo still lands.
