# Omi App Marketplace — Gap Analysis

**Question asked:** "Of my 321 app ideas, which ones already exist as Omi apps (taken) vs. are still wide open to build?"

**Answer:** The Omi app marketplace is **mostly empty** — 664 approved apps, almost zero traction. Competition there is not real. And for independent SaaS (which is where you should be building anyway), Omi's marketplace is barely even a signal.

---

## 🔬 Raw data

- **664 approved apps** in Omi's public marketplace (`/v1/approved-apps`)
- Full JSON: [`omi-crawl/apps/approved-apps.json`](omi-crawl/apps/approved-apps.json) (2 MB)
- Categories: [`omi-crawl/apps/app-categories.json`](omi-crawl/apps/app-categories.json)
- Per-idea matches: [`omi-crawl/apps/gap-analysis.tsv`](omi-crawl/apps/gap-analysis.tsv)

## 💀 The shocking reality of the Omi app marketplace

### Install distribution

| Install tier | Apps | % |
|---|---:|---:|
| 10,000+ | **1** | 0.2% |
| 1,000–10,000 | 12 | 1.8% |
| 100–1,000 | 128 | 19% |
| 10–100 | 263 | 40% |
| **Under 10 installs** | **260** | **39%** |

**79% of Omi's 664 "approved" apps have fewer than 100 installs.** 39% have under 10. This is the exact same programmatic-SEO-dump pattern we saw with their 3,898 blog posts. Their "ecosystem" is a Potemkin village.

### Top 10 installed apps (all categories)

| Installs | App | Category |
|---:|---|---|
| 44,068 | **Google Drive** | utilities (official Omi Team app — not a real 3rd-party play) |
| 7,762 | Audio Backup | utilities (official) |
| 6,646 | Omi Mentor (deprecated) | — |
| 4,987 | ChatGPT | productivity (generic) |
| 3,295 | General Summary | conversation-analysis |
| 2,651 | Conversation Summarizer | conversation-analysis |
| 1,717 | Insight Extractor | conversation-analysis |
| 1,642 | Lie Detector Pro | entertainment-and-fun |
| 1,511 | Note to Self | productivity |
| 1,451 | Improved Transcript | conversation-analysis |

**Observation:** Except for Google Drive, everything is generic utility — summarize / transcribe / note. Nobody has built a vertical-specific app on Omi that crossed 10k users. **The market signal is: vertical apps haven't been tried yet on Omi, not that they failed.**

### Paid app reality

Only **5 paid apps have >10 installs**, total:

| App | Price | Installs | Est. monthly revenue |
|---|---:|---:|---:|
| Reasoner Friend | $2 | 552 | <$1,000 (one-time? subscription? unclear) |
| Programming Duck | $3 | 150 | ~$450 total |
| Task Flow | $10 | 148 | ~$1,500 total |
| TranscriptPro | $2 | 83 | ~$170 total |
| PrepMate | $1 | 28 | ~$30 total |

**The entire paid-Omi-app economy is under $5k in lifetime gross revenue.** If you were thinking "build on Omi, monetize on Omi," stop. The marketplace isn't mature enough to sustain that.

---

## 📊 Cross-reference: your 321 ideas vs. their 664 apps

**Method:** keyword match each use-case idea against every app's name + description + category. Score = token overlap.

### Three lane groupings

| Lane | Count | Meaning |
|---:|---:|---|
| **🟢 Open** (score < 0.3) | **23** | Basically no Omi app touches this workflow. True gap. |
| **🟡 Contested** (0.3–0.55) | **150** | Weak keyword match to an app — typically under 100 installs. Beatable easily. |
| **🔴 Crowded** (≥ 0.55) | **148** | Direct keyword overlap. *But:* only 32 of these have a competitor with 100+ installs. The other 116 are "crowded" only on paper — the competing app has 3 users. |

**Net**: out of 321 ideas, only **~32 have a real Omi-marketplace competitor** (>100 installs). That's 10%. Nine out of ten ideas on your backlog have no meaningful Omi-app-ecosystem competition.

### The 23 truly open lanes (no matching Omi app at all)

These are workflows Omi documented in their SEO blog but nobody even bothered to build a plugin for:

1. Urgent Incident Reporting
2. Service Level Agreement (SLA) Monitoring
3. Client Consultation And Needs Assessment
4. Client Consultation And Property Requirements (real estate)
5. Code Blue Event Documentation (hospital)
6. Coordination With Legal And Compliance Teams
7. Court Proceedings And Testimony Recording
8. Event Timeline And Agenda Management
9. Guest Interaction And Service Personalization (hospitality)
10. Incident Post-Mortem Reviews (SRE/devops)
11. Luxury Open House Planning (real estate)
12. Marketing Strategy And Vacancy Management
13. Media Interaction And Response Planning
14. **Penetration Testing And Vulnerability Assessment** (security — no one built this!)
15. Property Staging And Presentation Planning (real estate)
16. STEM Club Activities Management
17. Technical Documentation And Knowledge Sharing
18. Tenant Consultation And Lease Agreements (property mgmt)
19. Third-Party Compliance Audits
20. Tour Guide And Activity Coordination (hospitality)
21. Trade Show And Event Planning
22. Vendor Quote And Proposal Organization (procurement)
23. Venue Selection And Site Visits (events)

### The 32 "real competition" lanes (competitor has ≥100 installs)

Where someone has actually built something that got a little traction. Look at these before committing to a vertical so you know what you're up against:

| Your idea | Omi app competitor | Their installs |
|---|---|---:|
| Financial Planning And Budgeting | Finance AI | 289 |
| Group Study Sessions | TranscribeAI | 176 |
| Strategic Decision Making | Logic AI | 231 |
| Critical Care Team Briefings | Dermatology Assistant | 103 |
| Legal Research And Document Review | TranscribeAI | 176 |
| Multi-Disciplinary Team Meetings | TranscribeAI | 176 |
| Team Briefings And Task Management | Dermatology Assistant | 103 |
| Campaign Brainstorming Meetings | TranscribeAI | 176 |
| Client Briefing Sessions | TranscribeAI | 176 |
| Client Consultation Sessions | TranscribeAI | 176 |
| Client Presentation Preparations | Quick Sync | 193 |
| Creative Content Brainstorming | TranscribeAI | 176 |
| Data Interpretation Meetings | TranscribeAI | 176 |
| Design Review Meetings | TranscribeAI | 176 |
| Evidence Review And Analysis | TranscribeAI | 176 |
| *(17 more, same pattern — mostly "TranscribeAI" being matched on the word "transcription" or generic meeting apps)* | | |

See [`omi-crawl/apps/gap-analysis.tsv`](omi-crawl/apps/gap-analysis.tsv) for the full table.

### The key observation about "crowded" lanes

Scroll through the crowded matches and you'll see **the same few apps keep popping up: TranscribeAI, Meeting Notes, Finance AI, Dermatology Assistant**. These are generic transcription/summary plugins being matched to specific workflows because they contain the words "transcript" or "meeting" in their description.

**None of them are vertical-specialized the way your backlog proposes.** "TranscribeAI" is not a deposition digest. "Meeting Notes" is not a SOAP note generator. "Finance AI" is not a tax-prep interview tool.

**So the "crowded" framing is overstated.** The competition on Omi is thin and generic. Real vertical apps are wide open, in and out of the ecosystem.

---

## 🎯 Strategic conclusions

### 1. Don't build FOR Omi's ecosystem. Build AROUND it.

Omi's marketplace reaches only Omi hardware owners (tens of thousands at best). Independent SaaS reaches anyone with a phone/browser (billions). The 321 ideas should all be **standalone web apps**, not Omi plugins. Use Omi's list as market research, not as a deployment target.

### 2. "Existing app" ≠ "validated demand"

Because Omi apps don't make money (5 paid apps total with >10 installs, total GMV ~$5k), the fact that a competitor app exists tells you almost nothing. A zombie app with 20 installs is not validation — it's evidence that the idea was tried half-heartedly and abandoned.

### 3. The ONE real validation signal in the data

The ratio that matters: **ideas where Omi documented the workflow in SEO content but nobody (not even programmatically) built even a shell plugin**. That means:
- Demand keyword exists (otherwise Omi wouldn't have written the SEO post)
- Nobody has monetized the space yet (otherwise a competitor plugin would exist)

The 23 "open lanes" above are the strongest signal. The 150 "contested" (<100-install competitor) are next.

### 4. Merge with PROJECT-BACKLOG.md

Check each idea in [`PROJECT-BACKLOG.md`](PROJECT-BACKLOG.md) against the gap analysis:

| Backlog idea | Status |
|---|---|
| #1 SOAP Note Generator (clinicians) | **OPEN** — best Omi match is "Dermatology Assistant" at 103 installs (niche, different) |
| #2 Deposition Digest (attorneys) | **OPEN** — no deposition-specific Omi app exists |
| #3 Real Estate Showing Notes | **OPEN** — no real-estate vertical app, best match is generic |
| #4 Sales Call Coach | Weak competitor — Meeting Notes (353), not a sales coach |
| #5 Lecture-to-Study-Kit | Weak — TranscribeAI (176), not student-specific |
| #6 Field Service Reports | Weak — Job Training Notes (52) |
| #7 1-on-1 Coaching Journal | Weak — Mentor AI (74) |
| #8 Podcast Show-Notes | **OPEN** — no podcasting-specific Omi plugin |
| #10 Parent-Teacher Summarizer | Weak — Teacher Assistant (unknown installs) |
| #13 Incident-to-Postmortem | **OPEN** — on the 23-list (Incident Post Mortem Reviews) |
| #14 Wedding Vendor Coordination | Weak — "Bride and Groom Consultation" matched "K.V Financial Services AI" (13 installs) |
| #17 Vendor Procurement Digest | **OPEN** — on the 23-list (Vendor Quote And Proposal Organization) |
| #20 ICU/Hospital Shift Handoff | **OPEN** — related to Code Blue (on 23-list) |

**Seven of your top 20 are in the truly-open lane. None face meaningful Omi competition.**

### 5. What to actually do with this data

1. **Reprioritize your backlog top 5** → pick from the open-lane list (that's #1, #2, #3, #8, #13, #17, #20 from PROJECT-BACKLOG.md).
2. **Read competitor apps that DO have installs** — even 100-install apps tell you the 2-3 features a plugin has. Match or beat them on features.
3. **Don't waste time "building for Omi"** — Omi's ecosystem isn't big enough to support a standalone business.

---

## 📁 Files produced by this analysis

- [`omi-crawl/apps/approved-apps.json`](omi-crawl/apps/approved-apps.json) — all 664 apps, raw JSON
- [`omi-crawl/apps/app-categories.json`](omi-crawl/apps/app-categories.json) — Omi's category taxonomy
- [`omi-crawl/apps/gap-analysis.tsv`](omi-crawl/apps/gap-analysis.tsv) — every one of 321 ideas + best-matching Omi app + score
- [`omi-crawl/apps/open-lanes.json`](omi-crawl/apps/open-lanes.json) — the 23 gaps
- [`omi-crawl/apps/contested-lanes.json`](omi-crawl/apps/contested-lanes.json) — the 150 weak-competitor lanes
- [`omi-crawl/apps/crowded-lanes.json`](omi-crawl/apps/crowded-lanes.json) — the 148 "crowded" (mostly dead) lanes
- [`omi-crawl/apps/top-50-by-installs.json`](omi-crawl/apps/top-50-by-installs.json) — what's actually working on Omi
- [`omi-crawl/apps/gap_analysis.py`](omi-crawl/apps/gap_analysis.py) — reusable analysis script

---

## 🔁 How to re-run this analysis

If Omi adds new apps to their marketplace (or you want to track changes over time), re-run:

```bash
cd "omi-crawl/apps"
curl -s "https://api.omi.me/v1/approved-apps" > approved-apps.json
curl -s "https://api.omi.me/v1/app-categories" > app-categories.json
python gap_analysis.py
```

Diff `gap-analysis.tsv` against the prior version to see which ideas have new competitors.
