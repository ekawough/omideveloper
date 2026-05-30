# Project Backlog — Apps To Actually Build

**Source:** Harvested from Omi's own sitemap — they've published 321 "use case" pages + 19 vertical pages + 20 workflow pages. Most are programmatic SEO placeholders. **Nothing stops you from actually building the apps.**

**Strategy:** Pick a vertical → build one vertical-specific capture+workflow app → charge SaaS pricing. Don't compete with Omi's general-purpose product. Compete by being *specialized* where Omi is *generic*.

**Tech stack (recommended default):**
- **Capture:** browser/mobile audio capture (Web Speech API → Whisper API, or live Deepgram/AssemblyAI stream)
- **Processing:** OpenAI/Anthropic API for summarization + structured extraction (Claude Haiku 4.5 for cost; Claude Sonnet 4.6 for quality)
- **Storage:** Supabase (postgres + auth + file storage)
- **Frontend:** Next.js or Remix + Tailwind + shadcn
- **Deployment:** Vercel + Cloudflare (cheap, fast, scalable)
- **Payments:** Stripe

**Moat tactic:** vertical-specific output formats (not just "a summary" — a *SOAP note*, a *deposition digest*, a *SOC 2 evidence entry*). That's what Omi doesn't do.

---

## 🏆 Top 20 Ranked by Buildability × Market Size

Ranked by an honest gut check: how hard to ship an MVP × how likely someone will pay.

### 1. 🩺 **SOAP Note Generator for Private-Practice Clinicians**
Omi has `/pages/healthcare` but sells "a recorder." Clinicians want **structured SOAP notes** that paste into their EHR.

- **Capture:** live consultation audio (iPhone app or Chrome tab)
- **Output:** Subjective / Objective / Assessment / Plan note in EHR-ready format
- **Integrations:** Copy to clipboard → paste into Epic/Athena/DrChrono/SimplePractice
- **Pricing:** $49–$99/mo/clinician
- **Moat:** HIPAA compliance baked in (BAA with AWS/Azure), specialty-specific templates (therapy, dermatology, dental)
- **MVP time:** 2 weekends
- **Competition:** Freed, Heidi, Nabla — but all are expensive enterprise plays. Leave the solo/small-practice lane open.

### 2. ⚖️ **Deposition Digest for Solo / Small-Firm Attorneys**
From Omi's use-cases: deposition planning, witness interview, cross-examination, testimony recording.

- **Capture:** upload deposition audio/video OR record live
- **Output:** timestamped transcript + auto-generated exhibit index + key admission extraction + Q&A outline
- **Pricing:** $199/mo per attorney, or $29 per deposition
- **Moat:** court-compliant formatting, PDF exhibit export with proper numbering
- **MVP time:** 1 weekend (transcript + timestamps) + 1 week (exhibit extraction)
- **Competition:** TranscriptPad ($99/once), Veritext (enterprise). Nobody owns the "cheap, fast, AI" lane.

### 3. 🏠 **Showing Notes for Real Estate Agents**
Omi has 12+ real-estate use-cases in the sitemap. Nobody built the app.

- **Capture:** agent talks into phone during property tour
- **Output:** per-property notes auto-synced to MLS / CRM (Compass, Sierra Interactive, Follow Up Boss)
- **Bonus:** buyer-preference extraction across multiple showings ("she keeps asking about schools")
- **Pricing:** $29/mo/agent, team plans at $199/mo
- **Moat:** CRM integrations + buyer-profile persistence across sessions
- **MVP time:** 1 weekend + 1 week for first CRM integration

### 4. 🧑‍💼 **Sales Call Coach (SDR/AE-focused, Low-Cost Alternative to Gong)**
Gong costs $1.5k+/seat. Most sales teams can't afford it.

- **Capture:** Zoom/Meet/Teams recording upload OR live capture
- **Output:** call scorecard (MEDDIC/SPICED), objection log, follow-up email draft, deal-risk flags
- **Pricing:** $79/mo/rep (vs Gong's $1,500)
- **Moat:** sales methodology templates (MEDDIC / SPICED / BANT / Challenger), CRM auto-sync
- **MVP time:** 2 weekends
- **Competition:** Gong, Chorus (enterprise). Leave under-$100/seat lane open.

### 5. 🔧 **Field Service Reports for HVAC / Plumbing / Electrical**
Omi has `/pages/technicians` but it's generic. Technicians need **invoice-ready service reports**.

- **Capture:** technician talks into phone during service call
- **Output:** service report PDF with parts used, labor hours, recommendations, photos
- **Integrations:** ServiceTitan, Housecall Pro, Jobber export
- **Pricing:** $39/mo/tech, team plans at $29/mo/tech (5+)
- **Moat:** invoice-ready output format, parts/labor database
- **MVP time:** 2 weekends

### 6. 📋 **SOC 2 / HIPAA Compliance Evidence Collector**
From use-cases: compliance meetings, audit prep, regulatory filing, compliance documentation.

- **Capture:** auto-record compliance meetings, link to Drata/Vanta/Secureframe
- **Output:** meeting notes tagged to specific SOC 2 controls, evidence artifacts auto-uploaded
- **Pricing:** $199/mo/org (small-business tier)
- **Moat:** pre-mapped control → meeting type relationships
- **MVP time:** 3 weekends (need to learn control framework)

### 7. 🎓 **Lecture-to-Study-Kit for College Students**
Omi has this as a workflow (`/blogs/workflows/lecture-to-study-kit-workflow`) but no app.

- **Capture:** record lecture on phone
- **Output:** transcript + outline + flashcards (Anki export) + quiz questions + study guide
- **Pricing:** $9.99/mo (student-tier) or $49/semester
- **Moat:** Anki / Quizlet export; course-organized storage by subject
- **MVP time:** 1 weekend
- **Competition:** Otter (general), Glean (expensive). Own the $10 lane.

### 8. 💼 **1-on-1 Coaching Journal for Managers**
Omi has `/pages/coaching` but buried. Managers do weekly 1:1s and forget context.

- **Capture:** record 1:1 meetings (or paste notes)
- **Output:** per-report timeline of goals/concerns/follow-ups; aging-alerts when a commitment lapses
- **Pricing:** $19/mo/manager
- **Moat:** per-report context persistence (remembers every 1:1 for 2+ years)
- **MVP time:** 1 weekend

### 9. 🎙️ **Podcast Episode Show-Notes & Chapter Generator**
Creators spend 2+ hours per episode on show notes.

- **Capture:** upload .mp3 / .wav / .mp4
- **Output:** chaptered timestamps, show notes, tweet thread, Apple Podcasts description, YouTube description
- **Pricing:** $29/mo for 10 episodes, $99/mo unlimited
- **Moat:** multi-format output (one click → 8 channels), guest-bio auto-fetch
- **MVP time:** 1 weekend
- **Competition:** Castmagic, Swell. Beat on speed + price.

### 10. 👨‍👩‍👧 **Parent-Teacher Conference Summarizer**
From use-cases: parent-teacher conference documentation, student progress reviews.

- **Capture:** teacher records conference (with consent)
- **Output:** parent-ready summary email in plain language + action items for home
- **Pricing:** $9/mo/teacher or $299/year/school
- **Moat:** school-friendly output tone, FERPA-compliant storage
- **MVP time:** 1 weekend

### 11. 🏗️ **Construction Site Walk-Through Documentation**
From use-cases: inspection, installation, field service, site visits. Construction project managers walk sites 3x/week.

- **Capture:** PM records voice + takes photos on iPhone
- **Output:** daily site report (DSR) with timestamped issues, photos, assignee, due dates → Procore / Buildertrend
- **Pricing:** $49/mo/PM, $299/mo/team
- **Moat:** Procore/Buildertrend integrations; insurance-audit-ready PDF export
- **MVP time:** 2 weekends

### 12. 🎨 **Creative Brief from Kickoff Meeting**
From use-cases: creative content brainstorming, campaign brainstorming, creative concept development.

- **Capture:** agency records kickoff call with client
- **Output:** creative brief template (objectives, audience, deliverables, timelines) auto-populated
- **Pricing:** $49/mo/agency seat
- **Moat:** agency-standard brief formats (Figma/Notion templates)
- **MVP time:** 1 weekend

### 13. 🔐 **Incident-to-Postmortem Generator for SRE / DevOps Teams**
Omi has `/blogs/workflows/incident-response-to-postmortem` as a workflow. Build it.

- **Capture:** record war-room call or paste Slack transcript
- **Output:** blameless postmortem doc (Google SRE format) with timeline, root cause, action items → auto-file JIRA tickets
- **Pricing:** $99/mo/team
- **Moat:** Slack + PagerDuty + JIRA integration
- **MVP time:** 2 weekends
- **Competition:** incident.io, Rootly — but those are expensive enterprise. Own the SMB SRE lane.

### 14. 💍 **Wedding Vendor Coordination for Brides & Planners**
Omi has 10+ wedding-related use-cases.

- **Capture:** bride/planner records vendor meetings
- **Output:** master vendor checklist, payment schedule, ceremony-of-events doc auto-built
- **Pricing:** $99 one-time per wedding (flat fee)
- **Moat:** wedding-specific templates, shared-with-fiancé account
- **MVP time:** 1 weekend

### 15. 🧑‍🔬 **Research Interview to Insights (UX Research)**
Omi has this as a workflow. Build the app.

- **Capture:** Zoom/in-person research interview
- **Output:** theme extraction, verbatim quote library, affinity-mapping-ready export (Dovetail, Airtable)
- **Pricing:** $79/mo/researcher
- **Moat:** Dovetail/Lookback integrations, affinity-mapping ontology
- **MVP time:** 2 weekends
- **Competition:** Dovetail. Beat on price.

### 16. 💰 **Tax Prep Interview for CPA / EA Firms**
From use-cases: tax planning, financial advisory, client consultation + finance.

- **Capture:** CPA records client interview (during 1040 prep)
- **Output:** pre-filled 1040 checklist + missing-doc list + follow-up email
- **Pricing:** $39/mo/CPA, $199/mo/firm
- **Moat:** Drake/Lacerte/UltraTax export format
- **MVP time:** 2 weekends (tax domain complexity)

### 17. 🛒 **Vendor Procurement Meeting Digest for SMB Buyers**
Omi has `/blogs/workflows/vendor-procurement-meeting` as a workflow.

- **Capture:** record vendor pitches
- **Output:** head-to-head scoring matrix, pricing comparison, reference-check questions, contract red-flag list
- **Pricing:** $49/mo/buyer
- **Moat:** procurement scoring templates (RFP rubrics)
- **MVP time:** 1 weekend

### 18. 🎬 **Film Set Supervisor Notes**
Use-cases: on-location filming, production coordination, script continuity, post-production review.

- **Capture:** script supervisor records on set
- **Output:** per-shot continuity log, slate info auto-captured, edit-ready breakdown
- **Pricing:** $199/mo/production
- **Moat:** ScriptE / Movie Magic export
- **MVP time:** 3 weekends (indie niche, higher ACV)

### 19. 🧾 **Month-End Close Log for Accounting Teams**
Omi has `/blogs/workflows/month-end-close-log`. Build it.

- **Capture:** record close meetings + capture JIRA/Asana tickets
- **Output:** close checklist completion status, audit-ready SOX documentation
- **Pricing:** $199/mo/finance team
- **Moat:** NetSuite / Sage Intacct integration
- **MVP time:** 2 weekends

### 20. 🏥 **ICU / Hospital Shift Handoff Tool**
Omi has `/blogs/workflows/shift-handoff-workflow`. Shift handoffs are where medical errors happen.

- **Capture:** outgoing nurse records handoff
- **Output:** SBAR-format (Situation / Background / Assessment / Recommendation) handoff note per patient
- **Pricing:** $99/mo/unit or $5k/year/hospital
- **Moat:** Epic / Cerner integration; FHIR compliance
- **MVP time:** 3 weekends (healthcare complexity + compliance)

---

## 📌 Why These Specifically Win Over Omi's Generic App

| Lever | Omi generic app | Your vertical app |
|---|---|---|
| **Output format** | "Here's a summary" | SOAP note / deposition digest / DSR / SOC 2 evidence |
| **Integrations** | None / API only | Direct push to Epic / Compass / Procore / Drata |
| **Pricing** | $179 hardware + $14/mo | $29–$199/mo SaaS (no hardware) |
| **Target** | Consumers / prosumers | A specific job title with $ budget |
| **Moat** | Hardware + app | Domain-specific vocabulary + compliance + integrations |

## 🧩 Starter Files You Should Create Next

- See [`PROJECT-STARTER.md`](PROJECT-STARTER.md) for the tech scaffold you can reuse across all 20 ideas
- See [`QUICK-WINS.md`](QUICK-WINS.md) for the subset you can ship in 1 weekend
- See [`omi-crawl/use-cases-by-vertical.md`](omi-crawl/use-cases-by-vertical.md) for the full 321 use-case list if you want ideas beyond this top-20
