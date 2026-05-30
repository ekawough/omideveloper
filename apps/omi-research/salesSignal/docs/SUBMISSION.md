# lablab.ai submission copy

Fill in the URL/video fields last.

## Title
SalesSignal — multi-agent AI that turns D2D sales conversations into CRM workflows with acoustic emotion detection.

## Tagline (≤160 char)
Wearable → diarized transcript → CrewAI on AMD MI300X → GHL + HubSpot, in under 5 seconds, with a sentiment timeline the other guys can't see.

## Short description (≤600 char)
Door-to-door reps wear an Omi device. Our pipeline transcribes with
Deepgram, runs SenseVoice acoustic-emotion per speaker, fuses with text
sentiment to catch suppressed objections, and drives a three-agent CrewAI
crew on Llama 3.1 8B (AMD MI300X via vLLM) that scores the lead 1-10 and
writes it into GoHighLevel AND HubSpot simultaneously. Built-in consent
compliance keeps you on the right side of two-party recording laws.
CRM-agnostic, $0.24/conversation, live in five seconds.

## Long description
**The problem.** 2.3M US D2D reps, ~60 conversations a day, near-zero AI at
the field-rep layer. Reps forget details. Managers review nothing. The
best lead of the day dies in a shaky iPhone voice memo. Siro raised $75M
and Rilla charges $4-5K/user/year for text-only NLP that doesn't auto-write
contacts to the CRM.

**What we built.** A CRM-agnostic multi-agent pipeline:

1. **Capture.** Omi DevKit 2 over BLE → iPhone → our Node webhook.
2. **Transcribe.** Deepgram Nova-2 with speaker diarization, live.
3. **Feel.** SenseVoice-Small per diarized segment — is the homeowner
   actually happy, or saying "sounds good" through clenched teeth?
4. **Fuse.** Per-segment text sentiment × acoustic emotion. Flag
   `suppressed_objection`, `enthusiastic`, `sarcasm_or_resignation`.
5. **Reason.** Three CrewAI agents on Llama 3.1 8B hosted on AMD MI300X via
   vLLM: Parser → Scorer+Analyst → CRM Writer.
6. **Act.** Contact + note + deal land in GoHighLevel AND HubSpot in
   parallel. Sentiment timeline appears in the admin panel in real time.
7. **Comply.** Geo-aware consent capture (one-party / two-party / BIPA)
   writes to an immutable audit log.

**Why it wins.**
- *Five models in one multimodal pipeline on AMD silicon* — not a ChatGPT
  wrapper.
- *CRM-agnostic* — no migration; $0 vs. $750/mo routing tax.
- *Acoustic emotion + text sentiment fusion* — catches suppressed
  objections that every text-only competitor misses entirely.
- *Built-in compliance* — Siro/Rilla treat consent as the customer's
  problem; we ship a geo-aware consent form and an audit trail.
- *$0.24/conversation* — versus $3-5K/user/year.

**Built for AMD.** Llama 3.1 8B Instruct running on vLLM 0.19.0 via the
official `vllm/vllm-openai-rocm` image on a Developer Cloud MI300X. AITer
attention kernels enabled; MXFP4 bmm disabled (it's broken on MI300X,
Gotcha #4 in our research notes).

## Tags
`ai-agents`, `crewai`, `amd`, `mi300x`, `rocm`, `vllm`, `llama-3.1`,
`deepgram`, `sensevoice`, `omi`, `wearable`, `sales`, `crm`, `hubspot`,
`gohighlevel`, `supabase`, `multimodal`

## Links
- **Demo video:** (upload to YouTube; paste link)
- **Slides (PDF):** (link)
- **GitHub repo:** https://github.com/ekawough/salesSignal
- **Live admin panel:** (Vercel URL)
- **Cover image:** (PNG 1920×1080)

## Team
Ethan Kawough — solo.
