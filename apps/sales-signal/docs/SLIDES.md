# 12-slide deck outline

Build these in Keynote/Slides. Export PDF for submission, keep the live
version open during the demo to flip between slides and the actual app.

Each slide has a one-line **headline** (big type) and a **body** (what the
slide should show). Speaker notes live at the end.

---

### 1. Title
- **Headline:** SalesSignal
- **Body:** "The AI sales assistant for door-to-door reps." Logo. Name.
  Hackathon name.

### 2. The problem
- **Headline:** 2.3M field reps, zero AI
- **Body:** Stats: ~60 conversations/rep/day. Best lead of the day lives
  in a voice memo and dies there. Managers review nothing. Screenshot of
  a messy iPhone voice-memo list.

### 3. What already exists (and why it isn't enough)
- **Headline:** Text-only analytics can't hear a homeowner cool off
- **Body:** Siro ($75M raised) and Rilla ($4-5K/user/year) — AssemblyAI +
  NLP on text. No acoustic emotion. No auto-write to CRM. No consent
  tooling. Competitor logos.

### 4. What we built
- **Headline:** Wearable → 5 models → CRM, in under 5 seconds
- **Body:** Pipeline diagram from ARCHITECTURE.md. Point out the five AI
  models (Deepgram stream, Deepgram sentiment, SenseVoice, Llama x3
  agents).

### 5. The breakthrough — sentiment fusion
- **Headline:** Text says "sounds good." Voice says angry. That's a dead lead.
- **Body:** Example segment — "Sounds great, I'll think about it." Text
  +0.4, acoustic emotion `angry`, fused label `suppressed_objection`.
  Screenshot of sentiment timeline from the admin panel.

### 6. Multi-agent architecture
- **Headline:** Three specialists beat one generalist
- **Body:** Diagram: Parser → Scorer+Analyst → CRM Writer. Each with a
  one-line "they do X" caption. All three are Llama 3.1 8B on AMD MI300X,
  different system prompts.

### 7. AMD MI300X
- **Headline:** Built on the biggest GPU memory on the market
- **Body:** vLLM 0.19.0 ROCm image. Llama 3.1 8B, bfloat16. 80-100 token/s
  at 8K context. AITer attention on, MXFP4 bmm off (we dug up the gotcha
  so you don't have to). Latency chart: parser 700ms, scorer 800ms, writer
  700ms.

### 8. CRM-agnostic (the business moat)
- **Headline:** Same contact, both CRMs, one conversation
- **Body:** Split screen — same contact card in GoHighLevel and HubSpot.
  "No migration. No routing tax. Native API for each." Contrast: Rilla is
  ServiceTitan-only with a 5-seat minimum.

### 9. Built-in compliance
- **Headline:** Geo-aware consent, audit trail, BIPA-aware
- **Body:** Screenshot of consent.html on an iPad mockup. State chip
  ("CA • two-party"). Compliance list: one-party vs. two-party vs. BIPA.
  Contrast: "Siro and Rilla make consent your problem."

### 10. Live demo
- **Headline:** (no headline — jump to the app)
- **Body:** This slide is a placeholder. At this moment, switch to the
  admin panel live.

### 11. Roadmap — Layer 3 coaching
- **Headline:** 50 conversations in, we coach your rep personally
- **Body:** Aggregate across sessions: "Your vocal energy drops after 90 s
  — practice pacing." Tie to openSMILE eGeMAPSv02 features we already
  capture. Not built yet; that's the pitch.

### 12. Ask
- **Headline:** SalesSignal
- **Body:** "$0.24/conversation. CRM-agnostic. Compliance built in.
  Ready for pilots." Name, email, GitHub URL.

---

## Speaker notes

- Slide 2: Don't recite numbers. Tell the anecdote of the rep forgetting
  whether the homeowner said "two kids" or "three kids." That's the hook.
- Slide 5: Play a 10-second audio clip if possible — genuinely angry vs.
  genuinely happy saying the same words. It lands the point instantly.
- Slide 10: Keep the demo under 90 seconds. Plant a stopwatch somewhere.
- Slide 11: Be explicit — "this is on the roadmap, we're showing you the
  data path today." Judges respect honesty here.
