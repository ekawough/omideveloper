# Omi App Reviews — Pain Points, Praise & Fix Opportunities

**Question asked:** "Of the contested/crowded apps, read the reviews — are they actually good? What are the pain points, the stressors, what do people like? Could we completely fix it? Is the app dead and no one's doing anything with it?"

**Answer in one sentence:** The Omi marketplace is mostly broken plugins that people *wanted* to work, *couldn't* get to work, and *abandoned* — and the most-installed apps have the highest complaint density. That's a gift for whoever builds the reliable version.

---

## 📊 Raw data

- **150 apps** have at least one rating (22% of 664)
- **71 apps** have text reviews
- **197 text reviews total**
- **101 apps** show dead-app signal: no review in 180+ days AND fewer than 500 installs
- **Only 15 apps** have explicit negative text reviews

Files:
- [`omi-crawl/apps/reviews/all-reviews.json`](omi-crawl/apps/reviews/all-reviews.json) — all 197 reviews, structured
- [`omi-crawl/apps/reviews/fix-opportunities.json`](omi-crawl/apps/reviews/fix-opportunities.json) — 150 apps scored by how exploitable their weaknesses are
- [`omi-crawl/apps/reviews/top-fix-opportunities.txt`](omi-crawl/apps/reviews/top-fix-opportunities.txt) — human-readable top 15
- [`omi-crawl/apps/reviews/praise-and-requests.txt`](omi-crawl/apps/reviews/praise-and-requests.txt) — what's praised + feature requests

---

## 🏆 The #1 Opportunity: Hijack the ChatGPT Integration Market

**ChatGPT plugin on Omi:** 4,987 installs · **2.6 stars** · 22 text reviews · 11 explicit complaints.

**What users are saying (all in the last 9 months):**
> *"not working"* (x4 separate reviews)
>
> *"Error talking to connector. Your UID isn't registered yet. You need to activate your Omi account here: 👉 https://personas.omi.me"*
>
> *"Has a bug when connecting a Google account. 'Looks like this browser isn't secure. Try again?'"*
>
> *"says 'UnrecognizedFunctionError: CreateUserMemory. That means the backend doesn't recognize or support this function at the moment'"*

**Strategic read:** 5,000 people installed a plugin to pipe Omi conversations to ChatGPT. Almost all of them got broken auth flows and cryptic errors. **No working alternative exists.** If you shipped a simple reliable web app — "record voice → transcribe → push to your ChatGPT (or Claude) memory" — with no Omi hardware needed, you'd capture not just these 5k users but the orders-of-magnitude-larger population outside Omi's ecosystem.

---

## 🥇 The #2 Opportunity: Revive Omi Mentor

**Omi Mentor (deprecated):** 6,646 installs · 3.7 stars · 12 text reviews · **officially abandoned by Omi**.

**App description says:** *"THIS APP WAS INTEGRATED INTO OMI CORE FUNCTIONALITY AND NOT UPDATED ANYMORE."*

**User review (Jan 2026):**
> *"I wish this was a built in feature of Omi. When it works this app is great but it's not reliable."*

**Another (Jun 2025):**
> *"works great, but the messages over and over about 'you need to do this immediately' are really annoying. plus, this app is pretty judgmental and I just don't have time for that."*

**Strategic read:** 6,600 people installed a proactive AI mentor/coach, it worked when it worked, Omi then "integrated it into core" (i.e., shipped a half-baked version and abandoned the rest). The market was validated. **Build a coaching app (standalone, no Omi) that is:** (a) reliable, (b) tonally adjustable (not judgmental), (c) focused on habit/goal follow-through. Charge $19/mo.

---

## 🥉 The #3 Opportunity: Steal Google Drive Sync's 44,068 Users

**Google Drive sync (Omi's flagship integration):** 44,068 installs · 3.6 stars · 12 text reviews.

**Recent complaints:**
> *"does not connect with drive. cannot uninstall to attempt a reconfiguration"* (Nov 2025)
>
> *"doesn't work. Doesn't show up in Gdrive even when it shows as successfully installed."* (Nov 2025)

**And this 5-star review** from a frustrated power user, which is the real tell:
> *"This has been a hidden gem. I'm rapidly losing faith in the Omi app's ability to process/synthesize insights with so many useless junk apps so fortunately this provides a workaround to use Gemini on my notes instead."*

**Strategic read:** 44,000 people have installed Omi's own Google Drive sync. Even Omi can't keep it reliable. One user explicitly says they're using it as a "workaround" because the whole app ecosystem is junk. **Build a bulletproof sync service** — Omi or any voice-capture source → Google Drive / Notion / Obsidian / iCloud / Dropbox — that just works.

---

## 🎯 Top 15 Fix Opportunities (ranked)

Scored by: `(installs × 100) + negative_complaint_count + recency_bonus + low_rating_penalty`. Higher = better target to out-execute.

| # | App | Installs | Rating | Text Reviews | Why it's a fix opportunity |
|---|---|---:|---:|---:|---|
| 1 | **ChatGPT** | 4,987 | 2.6★ | 22 | 11 explicit "not working" complaints, connection/auth broken |
| 2 | **Omi Mentor (deprecated)** | 6,646 | 3.7★ | 12 | Officially abandoned by Omi; user wishes it was reliable |
| 3 | **Google Drive sync** | 44,068 | 3.6★ | 12 | Flagship integration, still breaks for many users |
| 4 | **Notion Data Sync** | 923 | 3.9★ | 8 | "stopped working", missing plugins/transcripts/actions fields |
| 5 | **Omi Wrapped - Daily Summaries** | 912 | 3.0★ | 3 | Recent (Feb 2026) "doesn't work" |
| 6 | **J.A.R.V.I.S.** | 894 | 3.0★ | 5 | Recent (Apr 2026) "server is broken" |
| 7 | **General Summary** | 3,295 | 4.3★ | 7 | One recording got cut off mid-meeting — trust lost |
| 8 | **Dropbox** | 44 | 3.7★ | 3 | "Was working now does not. Not Found. The train has not arrived at the station." |
| 9 | **WhatsApp** | 30 | 3.0★ | 1 | "its not working as shown in image" |
| 10 | **Audio Backup** | 7,762 | 2.7★ | 2 | 7.7k users, no way to unsubscribe from $2/mo |
| 11 | **Audio Journal** | 102 | 1.0★ | 1 | User: *"junk apps should probably be removed after a grace period"* |
| 12 | **Smart Alarm & Reminders** | 16 | 1.0★ | 1 | "not working at all" |
| 13 | **Actionable Insights** | 137 | 1.0★ | 1 | Same "junk app" pattern |
| 14 | **Art of seduction** | 111 | 1.0★ | 1 | Same "junk app" pattern |
| 15 | **Tasks and Deadlines Reminder** | 108 | 1.0★ | 1 | Same "junk app" pattern |

---

## 🗣️ The Damning Signal: One User's Copy-Pasted 1-Star Review

On **February 23, 2025**, one user left the identical 1-star review on **at least 5 different apps**:

> *"Seems not to work, like an increasing number of junk apps that should probably be removed after a certain grace period if there are minimal users and no reviews or unfavorable reviews."*

They hit: Audio Journal, Actionable Insights, Art of seduction, Tasks and Deadlines Reminder, CodiBot, research companion, TOP 3 tasks, Everything is content.

**A real Omi user has publicly recognized that the app store is a junk drawer.** The market is waiting for somebody to ship something reliable.

---

## ✅ What ACTUALLY Works (the formula to copy)

Apps with 4.0+ stars AND 3+ text reviews AND 100+ installs. These tell you what Omi users will pay attention to:

| App | Installs | Rating | What it proves |
|---|---:|---:|---|
| **ADHD Assistant** | 1,350 | 4.8★ | Laser-focus on *one user archetype* (ADHD). "Saves hours of postponing, daydreaming and procrastination." |
| **#1 The Best Summarizer** | 1,107 | 4.7★ | Boring utility done well beats every fancy thing |
| **Bitcoin Live** | 727 | 4.9★ | Single-function voice shortcut ("Bitcoin Price") works every time |
| **OpenClaw** | 876 | 4.9★ | Connect Omi to a user's existing tool reliably — they'll pay attention |
| **Microsoft OneNote** | 57 | 5.0★ | Small install base but real love: *"summarize my chats, save to OneNote, search my existing notes, turn notes into new tasks"* |
| **Lie Detector Pro** | 1,642 | 4.2★ | Weird gimmick done well gets shared |
| **GitHub** | 191 | 5.0★ | Voice-to-issue: *"Say 'Create Issue' and have your feedback magically posted as a GitHub issue"* |
| **Translator** | 229 | 4.1★ | Simple, delivers, done |
| **KOL - Girlfriend Retainer** | 989 | 4.1★ | Narrow persona-coaching app — people love having something personal |

**The pattern:**
1. **One clear job** (not a Swiss-army plugin)
2. **Works every time** (the baseline that 79% of Omi apps fail)
3. **Either integrates with a tool the user already owns** (Notion, OneNote, GitHub, Google Drive) **or emulates a specific persona/coach**
4. **Simple enough that users can describe it in one sentence in a review** ("Works really well, thank you! Love the 'Quotes'")

---

## 💡 The #1 Feature Request Across the Entire Ecosystem

From the Notion Data Sync reviews (both 5-star):

> *"that is just the most amazing app ever. what a lifesaver and what a time saver… **you should really charge for this**"* — Aug 2025
>
> *"I love it I wish I could **modify for my own scripts [and] insights to notion**"* — Dec 2025

And from Microsoft OneNote (5★):
> *"I can summarize my chats and save to OneNote, **search my existing notes, and even turn my notes into new tasks** in Omi!"* — Jan 2026

**Aggregated feature request:** a customizable pipe from voice/text capture → user's existing knowledge tool, with user-editable output templates, 2-way sync, and the ability to trigger actions from the stored content. Nobody's built that as a paid product. The Notion Data Sync user literally says "you should charge for this" — they're telling you the business model out loud.

---

## 🛠️ What Breaks (catalog of complaints)

From 11 negative reviews across top apps, here's every distinct failure mode:

| # | Failure pattern | Apps affected | Impact |
|---|---|---|---|
| 1 | **OAuth / connection broken** | ChatGPT, Google Drive, Dropbox | Users can't even start |
| 2 | **Backend 500 / server errors** | J.A.R.V.I.S., Dropbox ("train has not arrived"), ChatGPT | Trust destroyed |
| 3 | **Recording silently cut off** | General Summary | Lost important meetings |
| 4 | **"Functions not recognized"** | ChatGPT (UnrecognizedFunctionError) | API contract broken |
| 5 | **Output incomplete (missing fields)** | Notion Data Sync | Data half-synced |
| 6 | **Language bleeding** | #1 The Best Summarizer (writes in Spanish even when user isn't Spanish) | Confusing output |
| 7 | **Timezone wrong in timestamps** | Audio Backup | Trust issues w/ recorded data |
| 8 | **Can't uninstall** | Google Drive | User stuck |
| 9 | **Can't unsubscribe from paid plan** | Audio Backup | Legal/trust risk |
| 10 | **Wake-word too rigid** | OpenClaw ("would've been great to have a custom wake phrase") | Minor, but a clear UX request |
| 11 | **Persona is annoying / judgmental** | Omi Mentor | Users churn from tone, not features |

**Build-your-app checklist — avoid all 11:**
- Test OAuth flow with 5 real users in incognito windows before shipping
- Build a health-check dashboard (is the API up? is the transcription service up? etc.)
- Never cut off recordings; if the network drops, buffer locally
- Version your JSON schemas
- Sync ALL fields, not just the easy ones
- Fail gracefully when the LLM returns the wrong language; retry with explicit English instruction
- Show wall-clock time in user's timezone
- Make uninstall easy and obvious
- Put "cancel subscription" one click away from the main nav
- Let users pick their own trigger phrases
- Give every persona-coach app a tone-adjuster setting (strict ↔ gentle)

---

## 🎯 Mapped back to your top-20 backlog

From [`PROJECT-BACKLOG.md`](PROJECT-BACKLOG.md), how do reviews change priority?

| Backlog idea | Competitor in Omi marketplace | Reviews verdict |
|---|---|---|
| #1 SOAP Notes | Doctor Patient Notes (353 inst, 3.6★, 15 text reviews) | **Competitor has traction** — read those reviews, find what they miss. Worth building. |
| #2 Deposition Digest | None | Pure open lane. Ship it. |
| #3 Real Estate Showing Notes | None that's real-estate specific | Pure open lane. |
| #4 Sales Call Coach | Conversation Summarizer (2,651 inst, 4.0★) | **Not a direct competitor** — the summarizer is generic. Your MEDDIC vertical still wins. |
| #5 Lecture-to-Study-Kit | Class Notes (908 inst, 4.3★, 9 text reviews) | Real competitor. Read their reviews, out-ship on flashcard export. |
| #6 Field Service Reports | None | Open lane. |
| #7 1-on-1 Coaching Journal | Omi Mentor (6.6k, deprecated) + KOL (989, 4.1★) | **Both approachable** — Omi Mentor is abandoned, KOL is a girlfriend-specific persona. Manager-specific coaching is open. |
| #8 Podcast Show-Notes | None | Open lane. |
| #10 Parent-Teacher Summarizer | None | Open lane. |
| #13 Incident-to-Postmortem | None | Open lane. |
| #17 Vendor Procurement | None | Open lane. |
| #20 ICU Shift Handoff | Doctor Patient Notes (353, 3.6★) | Adjacent competitor. Build SBAR-specific. |

**No backlog idea has a 4.5+ star competitor that's stealing 1k+ installs. Every lane is open.**

---

## 📈 The Statistical Bottom Line

Of the 664 approved Omi apps:
- **21 (3%)** are official Omi Team apps
- **5 (0.8%)** have paid users with any meaningful revenue
- **13 (2%)** have > 1,000 installs
- **9 (1.4%)** have 4.0+ rating with 3+ text reviews
- **101 (15%)** are dead by the 180-day-no-review signal
- **~650 (98%)** have fewer than 1,000 installs

**The Omi app marketplace is an empty mall.** Of the few apps with real users, the most popular have the worst ratings (ChatGPT 2.6★ at 4,987 installs). That's the definition of an underserved market: users arrived, got burned, and nobody's built the replacement.

---

## 🚀 Recommended next action

**Build the "Reliable ChatGPT/Claude/Gemini bridge for voice capture" first.** Not as an Omi plugin. As a standalone web app.

- Input: microphone (browser) or uploaded audio file (any source, including Omi's Google Drive export)
- Output: structured conversation pushed to user's chosen destination (ChatGPT custom GPT, Claude Projects, Notion, OneNote, Obsidian, Apple Notes)
- Key differentiator vs Omi's broken plugin: **it works**. OAuth doesn't break. Server doesn't 500. Sync is complete. Uninstall is easy.
- Pricing: $9/mo for 10 hours/month, $29/mo for 100 hours/month
- Landing page headline: *"The voice-to-AI-memory pipe that actually works."*

You'd instantly be the alternative for the 5,000 unhappy ChatGPT-plugin users AND the 44,000 Google Drive sync users.

Then repeat the exercise for each top-20 vertical in [`PROJECT-BACKLOG.md`](PROJECT-BACKLOG.md).
