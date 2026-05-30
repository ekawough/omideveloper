# Omi Takeover Project — Complete Briefing Document
## Paste this into any new Claude.ai chat for full context

---

## What this project is

I crawled the entire omi.me website (3,965 URLs), scraped their app marketplace (664 apps via public API), pulled all 197 user reviews, and identified 321 use-case workflows Omi has documented but never built apps for. This briefing is everything I found, condensed so you can work with it in any Claude conversation.

---

## Who is Omi

- **Company:** Based Hardware Inc., 81 Lafayette St, San Francisco, CA 94103
- **Website:** omi.me (Shopify storefront + GemPages builder)
- **GitHub:** github.com/BasedHardware/omi (open-source)
- **Product:** AI wearable necklace ($179) + smart glasses dev kit ($499) + app
- **What it does:** Records conversations, transcribes, summarizes, creates action items and memories
- **Enterprise sales CTA:** cal.com/aaravgarg/enterprise
- **Compliance:** SOC 2 + HIPAA (trust.delve.co/omi)

## Omi's stated mission and roadmap (from their /pages/manifesto)

**Mission:** "Make humans 1,000x more productive."
**Thesis:** "The next AI moat isn't intelligence. It's personal context."

**4-phase roadmap:**

| Phase | Form factor | Milestone to move on |
|---|---|---|
| 1. Desktop software (current) | Mac/Windows/browser | 200k users / ~$100k MRR |
| 2. Necklace | $179 wearable | 100k units sold (will kill necklace after glasses) |
| 3. Glasses | Always-on camera+audio eyewear | 1M units ("3B people already wear glasses") |
| 4. Brain/BCI | Silent speech → non-invasive → invasive | 7B devices ("connect all humans into a single network") |

**How they say they'll win:** "By collecting ALL data about the user. To achieve it, we commit to privacy and open-source. Use the data to give the maximum personalization."

## Omi's product catalog (as of April 2026)

| Product | Sale price | Regular | Notes |
|---|---|---|---|
| Omi (wearable necklace) | $179 | $179 | Flagship product |
| Omi Glass Dev Kit | $499 | $799 | Smart glasses, also "Buy Now for $299" in one spot (possible price inconsistency) |
| Omi Firmware Developer Kit | $59.99 | $99.99 | SEGGER J-Link debugger for devs |
| Omi Unlimited Yearly Plan | $199 | $240 | Software subscription bundle |
| Omi Watch Band | $29.99 | $49.99 | Accessory |
| Omi Wireless Charger | $29.99 | $49.99 | Accessory |
| Omi Gift Card | $150/$300/$500 | — | All variants "sold out or unavailable" |

## Omi's vertical plays (landing pages that exist)

| Vertical | URL | In main nav? |
|---|---|---|
| Sales teams | /pages/sales | Yes |
| Healthcare | /pages/healthcare | Yes |
| Technicians / field service | /pages/technicians | Yes |
| Coaches | /pages/coaching | NO — missing from nav, hidden page |
| Enterprise | /pages/enterprise | Not in main nav |
| Competitors comparison | /pages/switch | Not in nav (vs plaud, friend, limitless, fieldy, bee) |

## Omi's tech/marketing stack (detected client-side)

**Installed:** Google Analytics, Hotjar, Facebook Pixel, HubSpot, Intercom, Omnisend (email), Avada SEO (Shopify), ShareThis, hCaptcha, Apple/Google/Shop Pay

**Conspicuously absent:** No Ahrefs, Semrush, Moz, Screaming Frog, or any active site-crawler. No one is monitoring the site for broken links.

---

## Site audit findings (10 issues found)

1. **CRITICAL: Broken "Order now" CTA** on /pages/product → /cart/53309819715876:1 returns "Link no longer exists." Stale Shopify variant ID. Direct revenue leak.
2. **Hard 404 in sitemap:** /pages/notify_me_request/mini_coming_soon_glass_7le — deleted page still indexed.
3. **Stale duplicate:** /pages/download-old vs /pages/download — should 301 redirect.
4. **Mismatched content:** /pages/checkout-page-persona has title "Refer a friend" — internal/test page publicly indexed.
5. **Leaked Shopify-app pages:** /pages/tag (Avada SEO), /pages/swym-wishlist (Swym), /collections/frontpage (Shopify internal).
6. **Nav gap:** /pages/coaching exists but isn't in the Use Cases dropdown.
7. **Content credibility gap:** 3,898 blog posts but only 2 case studies, 1 product-updates post. 85% is programmatic SEO.
8. **Duplicate blog taxonomy:** /blogs/use-cases (19 posts) AND /blogs/usecases (325 posts) both exist.
9. **Possibly dead product:** /products/omi-gift-card — all variants "sold out or unavailable."
10. **Price inconsistency:** Omi Glass shows $499 sale / $799 regular in one spot, "$299" in another.

---

## Content strategy finding (the big one)

Omi has **3,898 blog posts** across 29 sections. Distribution is wildly skewed:

| Section | Posts | What it is |
|---|---:|---|
| ai-integrations | 665 | Programmatic SEO ("how to integrate X with Y") |
| api-guides | 598 | Dev long-tail SEO |
| iot-devices-faq | 465 | Consumer-tech SEO |
| firmware-guides | 454 | Dev SEO |
| smart-home-devices-faq | 401 | Consumer-tech SEO |
| usecases | 325 | "X with friend-ai-necklace" templates |
| next-js-errors / flutter-errors / tensorflow-errors | ~300 total | Classic programmatic SEO for dev error messages |
| **case-studies** | **2** | Only 2 case studies |
| **product-updates** | **1** | 1 product update post |
| **healthcare-ai-necklace** | **5** | 5 posts for the healthcare vertical they're selling into |

**85% of content is programmatic long-tail SEO. The trust-building content (case studies, product updates) is almost empty.** For a company selling into enterprise/healthcare/sales, this is upside-down.

---

## Omi app marketplace reality (664 approved apps, public API)

**Install distribution of all 664 apps:**

| Tier | Apps | % |
|---|---:|---:|
| 10,000+ installs | 1 | 0.2% (Google Drive — official) |
| 1,000–10,000 | 12 | 1.8% |
| 100–1,000 | 128 | 19% |
| 10–100 | 263 | 40% |
| Under 10 installs | 260 | 39% |

**Only 5 paid apps have >10 installs.** Entire paid-app economy is ~$5k lifetime GMV. The marketplace is a Potemkin village — same pattern as their 3,898 blog posts.

**Top 10 apps by installs:**
1. Google Drive (44k, official)
2. Audio Backup (7.7k, official)
3. Omi Mentor — DEPRECATED (6.6k)
4. ChatGPT (5k, **2.6 stars — 11 complaints**)
5. General Summary (3.3k)
6. Conversation Summarizer (2.7k)
7. Insight Extractor (1.7k)
8. Lie Detector Pro (1.6k)
9. Note to Self (1.5k)
10. Improved Transcript (1.5k)

---

## Review analysis (197 text reviews mined)

### Top 3 fix opportunities

**#1 ChatGPT plugin (4,987 installs, 2.6 stars, 11 complaints):**
All recent complaints are "not working," "Error talking to connector," "UID isn't registered," broken OAuth. 5,000 people wanted a ChatGPT bridge for voice notes and all got burned. Nobody built a working alternative.

**#2 Omi Mentor — deprecated (6,646 installs, 3.7 stars):**
App literally says "THIS APP WAS INTEGRATED INTO OMI CORE FUNCTIONALITY AND NOT UPDATED ANYMORE." User review: "I wish this was a built in feature. When it works it's great but it's not reliable." Also: "pretty judgmental and I just don't have time for that." 6,600 people validated the AI-coaching use case, Omi abandoned it.

**#3 Google Drive sync (44,068 installs, 3.6 stars):**
Even the flagship integration is broken for many. Users: "does not connect with drive, cannot uninstall" and "doesn't show up in Gdrive." One power user: "I'm rapidly losing faith in the Omi app's ability to process insights with so many useless junk apps."

### The "junk app" callout
One user (Feb 2025) left identical 1-star reviews on 8+ apps: "Seems not to work, like an increasing number of junk apps that should probably be removed after a certain grace period."

### What users actually love (from 4+ star apps)
- ADHD Assistant (1,350, 4.8 stars) — "saves hours of postponing, daydreaming and procrastination"
- Best Summarizer (1,107, 4.7 stars) — boring done well beats fancy
- Bitcoin Live (727, 4.9 stars) — one voice command, always works
- GitHub (191, 5.0 stars) — "Say 'Create Issue' and it magically posts"

**Pattern that works:** ONE clear job, works every time, integrates with a tool they already own.

### The #1 feature request (verbatim from Notion Data Sync reviews)
> "that is just the most amazing app ever. what a lifesaver... **you should really charge for this**"
> "I love it I wish I could **modify for my own scripts/insights** to notion"

---

## Gap analysis: 321 use-case ideas vs 664 existing apps

I extracted 321 unique workflow ideas from Omi's /blogs/usecases/ URLs and cross-referenced against all 664 apps:

- **23 truly open lanes** — no Omi app even exists (incident postmortem, deposition, real estate showing notes, vendor procurement, code blue, SLA monitoring, penetration testing, etc.)
- **150 contested** — a keyword-matching app exists but has <100 installs (dead)
- **148 "crowded"** — BUT only 32 have a competitor with 100+ installs. The other 116 are crowded only on paper.

**Of 321 ideas, only ~32 (10%) have a real Omi-marketplace competitor. 90% are wide open.**

### The 321 ideas categorized by vertical

| Vertical | Count |
|---|---:|
| Sales & Client-Facing | 45 |
| Legal & Compliance | 38 |
| Healthcare & Medical | 32 |
| Education & Research | 29 |
| Engineering / Product / IT | 26 |
| Finance & Accounting | 22 |
| HR & People Ops | 21 |
| Marketing & Content | 15 |
| Field Service & Operations | 14 |
| Real Estate & Property | 12 |
| Events & Weddings | 10 |
| Creative / Media Production | 10 |
| Security & Investigations | 5 |
| Coaching / Personal | 3 |

---

## My top 20 app ideas (ranked by buildability x market size)

1. **SOAP Note Generator** — clinicians, $49-99/mo, 2 weekends to MVP
2. **Deposition Digest** — attorneys, $199/mo or $29/depo, 1 weekend + 1 week
3. **Real Estate Showing Notes** — agents, $29/mo, 1 weekend + 1 week
4. **Sales Call Coach** (cheap Gong alternative) — $79/mo/rep, 2 weekends
5. **Field Service Reports** — HVAC/plumbing/electrical, $39/mo, 2 weekends
6. **SOC 2/HIPAA Compliance Evidence Collector** — $199/mo/org, 3 weekends
7. **Lecture-to-Study-Kit** — students, $9.99/mo, 1 weekend
8. **1-on-1 Coaching Journal** — managers, $19/mo, 1 weekend
9. **Podcast Show-Notes Generator** — creators, $29/mo, 1 weekend
10. **Parent-Teacher Conference Summarizer** — teachers, $9/mo, 1 weekend
11. Construction Site Walk-Through Documentation
12. Creative Brief from Kickoff Meeting
13. **Incident-to-Postmortem Generator** — SRE/DevOps, $99/mo
14. Wedding Vendor Coordination
15. UX Research Interview to Insights
16. Tax Prep Interview for CPAs
17. Vendor Procurement Meeting Digest
18. Film Set Supervisor Notes
19. Month-End Close Log for Accounting
20. **ICU/Hospital Shift Handoff** — SBAR format, $99/mo/unit

**The key lever vs Omi:** vertical-specific output formats (SOAP note, deposition digest, DSR, SOC 2 evidence) that their generic "here's a summary" app can never match. Plus integrations to tools those verticals already use (Epic, Compass, Procore, Drata, etc.).

---

## Recommended universal tech stack for building these

- **Frontend:** Next.js 14 + Tailwind + shadcn/ui
- **Auth:** Supabase Auth
- **DB:** Supabase Postgres
- **Audio storage:** Supabase Storage
- **Transcription:** Deepgram Nova-3 (fast) or OpenAI Whisper
- **LLM:** Claude Haiku 4.5 (cheap) / Claude Sonnet 4.6 (quality)
- **Payments:** Stripe
- **Deploy:** Vercel

**The only thing that changes between apps is the system prompt + the output UI template.**

---

## Strategic conclusion

Don't build FOR Omi's ecosystem (their marketplace reaches only Omi hardware owners — tens of thousands at best). Build AROUND it — standalone web/mobile SaaS that reaches anyone with a browser/phone. Use Omi's 321-item SEO list as validated demand signals, their 197 reviews as pain-point research, and their broken marketplace as proof that nobody's built the reliable version yet.

**Recommended first build:** "The reliable voice-to-AI-memory pipe" — standalone web app, microphone or uploaded audio → transcribe → push to ChatGPT/Claude/Notion/OneNote/Obsidian. Differentiator: it works. Pricing: $9/mo (10 hrs) / $29/mo (100 hrs). Immediately captures the 5,000 unhappy ChatGPT-plugin users + 44,000 Google Drive sync users.

---

## Files in the backup zips

**omi-project-docs.zip (1.1 MB) — portable, share anywhere:**
- README.md, PROJECT-BACKLOG.md, QUICK-WINS.md, PROJECT-STARTER.md
- OMI-APPS-GAP-ANALYSIS.md, OMI-REVIEWS-INSIGHTS.md
- omi-outreach-email.md, omi-audit-report.md
- omi-crawl/OMI-VISION.md, INDEX.md, use-cases-by-vertical.md
- All Python scripts (crawlers, analyzers)
- omi-crawl/apps/ (664-app JSON + reviews + gap analysis)
- Cleaned markdown of pages, products, collections, blog sections

**omi-project-full.zip (399 MB) — complete forensic archive:**
- Everything in docs.zip PLUS
- 3,897 cleaned blog post markdown files
- 3,964 raw HTML files of every omi.me page (the evidence backup)

**GitHub private repo:** github.com/ekawough/omi-takeover (docs + scripts, excludes bulky archives)
