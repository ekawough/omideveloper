# Execution Plan — From Current State to Running Business

> **What this is.** The concrete, ordered task list for the full Kawough Marketing
> LLC empire: the Omi ecosystem (4 revenue lanes) AND TikTok Shop (Stream 2).
> Two separate tracks that share tools, content infrastructure, and the same
> agent system. Every task has a clear deliverable, who does it (you or Claude
> Code), and what it unblocks.

---

## Current State (Audit, April 16 2026)

### What's DONE — Omi Ecosystem (Stream 1/3/4/5 in empire)
- SalesSignal codebase: 100% complete (webhook, agents, tools, admin, consent)
- Supabase schema: deployed and verified
- Pitch deck: 12 slides, committed
- GitHub repo: pushed to remote
- Affiliate teardown: top 5 competitors analyzed, keyword gaps documented
- Multi-agent marketing strategy: full doc with CrewAI architecture
- Affiliate strategy: content pillars + schedule documented
- All docs: RUNBOOK, ARCHITECTURE, LEGAL_COMPLIANCE, OUTREACH, SLIDES, etc.
- Voice reference: docs/VOICE_REFERENCE.md created
- License: BSL 1.1

### What's DONE — TikTok Shop (Stream 2 in empire)
- LLC, EIN, business license, tax exemption: all filed and live
- Business bank account: open
- TikTok Shop seller account: approved
- 4 sub-accounts: live
- 5 products researched with margins validated (65%+ each)
- 5 store / 25 account architecture designed
- Content engine architecture designed (clone + faceless accounts)
- Compliance isolation rules documented
- HeyGen Creator ($29/mo): active
- ElevenLabs Creator ($22/mo): active
- GoHighLevel: active (CRM + Social Planner)

### What's NOT done — Omi
- Webhook not deployed to Railway
- Agents not deployed to Railway
- vLLM not running on AMD MI300X
- No smoke test run
- No Omi device paired
- No demo video recorded
- Not submitted to lablab.ai (deadline: May 19)
- omideveloper.com not set up
- Zero affiliate content published
- Zero videos published
- No second app built
- No agency landing page
- No multi-agent marketing stack coded
- Git has uncommitted files (new docs, LICENSE)

### What's NOT done — TikTok Shop
- HeyGen avatar footage NOT filmed (persistent bottleneck across everything)
- Zero products listed in Store 1
- Zero product videos filmed
- Content engine not built
- CJDropshipping not signed up (free)
- Anti-detect browser not set up (AdsPower or Multilogin)
- Residential proxies not purchased
- Stores 2 through 5 not opened
- GHL affiliate enrollment blocked (sub-account issue)

---

## PHASE A — Ship SalesSignal (the flagship)

**Why first:** Everything downstream references SalesSignal as proof.
No affiliate page, agency pitch, or case study works without a working product.

### A1. Commit and push all current work
**Who:** Claude Code
**Time:** 5 min
**Do:**
```
git add .gitignore LICENSE README.md admin/ agents/ docs/ scripts/ supabase/ webhook/
git commit -m "Complete SalesSignal codebase + docs"
git push salesSignal master
```
**Delivers:** Clean repo ready for Railway deploy.

### A2. Deploy webhook to Railway
**Who:** YOU (Railway dashboard requires browser auth)
**Time:** 20 min
**Steps:**
1. Railway → New Project → Deploy from GitHub repo
2. Set Root Directory: `salesSignal/webhook`
3. Add environment variables (paste from `webhook/.env.template`):
   - `DEEPGRAM_API_KEY` — from deepgram.com dashboard
   - `SUPABASE_URL` — from Supabase Settings → API
   - `SUPABASE_SERVICE_ROLE_KEY` — from Supabase Settings → API
   - `WEBHOOK_TOKEN` — generate: `openssl rand -hex 32`
   - `AGENT_PIPELINE_URL` — leave blank for now
   - `PORT` — `3000`
4. Deploy. Wait for green.
5. Test: `curl https://<your-domain>.railway.app/health`
**Delivers:** Live webhook endpoint ready to receive Omi audio.
**Unblocks:** A4 (agents need webhook URL for end-to-end test)

### A3. Boot vLLM on AMD MI300X
**Who:** YOU (SSH access to AMD Dev Cloud)
**Time:** 45 min
**Steps:**
1. Get AMD Dev Cloud instance at devcloud.amd.com ($100 free credit)
2. SSH in:
   ```bash
   git clone https://github.com/<your-user>/salesSignal.git
   cd salesSignal/scripts
   export HF_TOKEN=hf_xxx  # your Hugging Face token
   bash run_amd_inference.sh
   ```
3. Wait 3-5 min for weight loading
4. Verify: `curl http://localhost:8000/v1/models` → shows Llama-3.1-8B-Instruct
5. Note the instance's public IP (or set up a tunnel)
6. Optional: `bash setup_emotion_model.sh` to pre-warm emotion models
**Delivers:** Running LLM endpoint for the agent pipeline.
**Unblocks:** A4 (agents need AMD_INFERENCE_URL)

### A4. Deploy agents to Railway
**Who:** YOU (Railway dashboard)
**Time:** 30 min
**Steps:**
1. Railway → New Service in same project → Root Directory: `salesSignal/agents`
2. Add environment variables (paste from `agents/.env.template`):
   - `AMD_INFERENCE_URL` — `http://<AMD_PUBLIC_IP>:8000/v1`
   - `AMD_API_KEY` — `not-needed` (vLLM doesn't require one by default)
   - `LLAMA_MODEL` — `meta-llama/Llama-3.1-8B-Instruct`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — same as webhook
   - `GHL_API_TOKEN` — from GoHighLevel Settings → Integrations → Private
   - `GHL_LOCATION_ID` — from GHL URL or API
   - `HUBSPOT_ACCESS_TOKEN` — from HubSpot Developer → Private App
   - `PORT` — `8000`
3. Deploy. Wait for green (takes longer — heavy Python deps).
4. Test: `curl https://<agents-domain>.railway.app/health`
5. **CRITICAL:** Copy the agents service's Railway internal URL
   (e.g., `http://agents.railway.internal:8000`) → paste into the webhook
   service's `AGENT_PIPELINE_URL` variable → redeploy webhook.
**Delivers:** Full pipeline connected: webhook → agents → CRM.
**Unblocks:** A5 (smoke test)

### A5. Run smoke test
**Who:** YOU (or Claude Code if you share the URLs)
**Time:** 10 min
**Steps:**
```bash
cd salesSignal/scripts
AGENT_PIPELINE_URL=https://<agents-domain>.railway.app python smoke_test.py
```
**Expected:** `lead_score` in [1, 10], `ghl_contact_id` and `hubspot_contact_id` present.
**Delivers:** Confirmed working end-to-end pipeline.
**Unblocks:** A6 (Omi pairing), A7 (demo video)

### A6. Deploy admin panel
**Who:** YOU
**Time:** 10 min
**Steps:**
```bash
cd salesSignal/admin
npx vercel --prod
```
Open deployed URL → Settings → paste Supabase URL + anon key → Save.
Run smoke test again → verify session appears in real-time.
**Delivers:** Live admin dashboard for demos.

### A7. Pair Omi device + live test
**Who:** YOU (physical device)
**Time:** 15 min
**Steps:**
1. Omi app → Settings → Developer mode → enable
2. Set Realtime audio bytes URL:
   ```
   https://<webhook-domain>.railway.app/webhook/audio?token=<WEBHOOK_TOKEN>&uid=rep-1&sample_rate=16000
   ```
3. Wear the Omi, have a conversation
4. Verify: session appears in admin panel, contacts land in GHL + HubSpot
**Delivers:** Full proof-of-concept with real hardware.
**Unblocks:** A8 (demo video)

### A8. Record demo video
**Who:** YOU
**Time:** 1-2 hours
**Steps:**
1. Record 5-minute video showing:
   - Omi device on neck
   - Simulated doorstep sales conversation
   - Real-time transcription in admin panel
   - Lead appearing in CRM (GHL or HubSpot)
   - Sentiment timeline
2. Edit in CapCut or DaVinci Resolve
3. Upload to YouTube (unlisted for submission, public later for marketing)
**Delivers:** Demo video for hackathon submission AND first YouTube content.

### A9. Submit to lablab.ai
**Who:** YOU
**Time:** 30 min
**Steps:**
1. Go to lablab.ai submission page
2. Fill using `docs/SUBMISSION.md` (already drafted)
3. Attach: GitHub URL, demo video, deck (SalesSignal-Deck.pptx), live demo URL
4. Submit before May 4-10 deadline (hackathon runs May 4-10, 2026 — submit within this window)
**Delivers:** Hackathon entry. Potential prize. Portfolio piece regardless.

---

## PHASE B — Affiliate Foundation (START IN PARALLEL WITH A)

**Why parallel:** No dependency on SalesSignal being deployed. You can publish
affiliate content from day one because your credibility comes from BUILDING
on the platform, not from the product being live.

### B1. Set up omideveloper.com
**Who:** Claude Code builds the site, YOU handles DNS/hosting
**Time:** 1-2 days
**Options (pick one):**
- **WordPress on Bluehost/SiteGround** ($3-12/mo) — best for SEO, plugin ecosystem
- **Next.js on Vercel** (free) — developer cred, fast, but needs custom blog setup
- **Ghost** ($9/mo or self-hosted) — clean blog-first CMS, good SEO
- **Notion + Super.so** ($12/mo) — fastest to launch, decent SEO
**Recommendation:** WordPress. Best SEO out of the box. Yoast plugin.
Affiliate link management with ThirstyAffiliates. You're publishing 10+
articles — WordPress is built for this.
**Delivers:** Live domain ready for content.
**Unblocks:** B2 (content publishing)

### B2. Publish Week 1 affiliate content (3 articles)
**Who:** Claude Code drafts, YOU reviews and publishes
**Time:** 2-3 days

**Article 1:** "Omi AI Review 2026: A Developer Who Built 10 Apps Tells the Truth"
- 2,500 words, honest pros/cons from real dev experience
- All 4 lanes: affiliate link + code, app store links, agency mention
- Target keyword: "omi ai review"

**Article 2:** "Omi Discount Code 2026: ETHANJOHNKAWOUG — Save 10%"
- 800-1,000 words, clean discount page
- Target keyword: "omi discount code", "omi promo code"

**Article 3:** "Omi for Sales Reps: How SalesSignal Auto-Fills Your CRM"
- 2,000 words, SalesSignal as the hero product
- Target keyword: "omi for sales reps"

Each article follows the 3-CTA template from the Master Plan.
**Delivers:** First organic traffic. First affiliate earnings potential.
**Unblocks:** Everything — this is the foundation for all content.

### B3. First YouTube video
**Who:** YOU record, Claude Code writes script
**Time:** 1 day

### ⚠️ HeyGen Policy: Real Face vs Avatar
- REAL FACE required: Omi device reviews, SalesSignal demos, app tutorials,
  anything where technical credibility is the product. Viewers need to see
  that you're a real developer who built real things. This is your moat
  the competition cannot fake.
- HEYGEN AVATAR OK: TikTok Shop clone accounts, repetitive product explainers,
  faceless content, volume content where you need 5 videos/day. HeyGen saves
  time on content that doesn't rely on your personal credibility.
- RULE: If the video's value comes from "I built this and here's what broke,"
  shoot it with your real face. If the video's value is "here's a product
  that solves X," the avatar is fine.

**Script:** "I Built 10 Apps on an AI Wearable — Here's What I Learned"
- 5-8 minutes
- Shows the device, shows 2-3 apps, honest take
- Affiliate link + code in description
- Embed in the review article (B2, Article 1)
**Delivers:** YouTube presence in an uncontested space.

### B4. First 3 TikToks
**Who:** YOU record, Claude Code writes scripts
**Time:** Half day
**Scripts:**
1. "This $179 AI necklace just auto-filled my CRM" (SalesSignal demo)
2. "I built 10 apps on an AI wearable" (ecosystem hook)
3. "Omi unboxing + first impression from a developer" (simple, relatable)
**Delivers:** TikTok presence. Zero competition.

### B5. Set up email capture
**Who:** Claude Code configures, YOU creates account
**Time:** 2 hours
- ConvertKit or Resend free tier
- Email capture form on every omideveloper.com article
- Lead magnet: "The Omi Developer's Toolkit" (free PDF, Claude Code writes)
- Welcome sequence: 5 emails over 10 days (Claude Code drafts)
**Delivers:** List building from day one.

---

## PHASE C — Ship App #2: Real Estate Showing Notes

**Why this one:** Simplest build (2-4 weeks). Follow Up Boss API is clean.
1.45M NAR agents, zero competition in voice-to-showing-notes. Validates
the "universal pipeline pattern" — same core, different output adapter.

### C1. Clone the SalesSignal pipeline
**Who:** Claude Code
**Time:** 1 week
**Do:**
- New directory: `showingNotes/`
- Copy webhook handler (same Omi PCM16 → Deepgram flow)
- New extraction prompt: property address, buyer reactions, features,
  concerns, follow-up items, price opinions
- New output adapter: Follow Up Boss REST API (`api.followupboss.com/v1`)
- New Supabase tables: `showings`, `properties`, `agents`
- Simple admin panel showing recent showings
**Delivers:** Second app proving the universal pipeline.

### C2. Ship to Omi marketplace
**Who:** YOU (Omi app → Explore → Create an App)
**Time:** 30 min
- Free tier: 3 showings/month
- Paid tier: unlimited, $29/month
**Delivers:** Second app in the store. Two apps = portfolio.

### C3. Publish showing notes content
**Who:** Claude Code drafts, YOU publishes
**Time:** 2 days
- "Omi for Real Estate Agents: Automatic Showing Notes" on omideveloper.com
- TikTok: "This AI necklace writes my showing notes for me"
- LinkedIn: story post about building it
**Delivers:** Real estate vertical content. New audience. New keywords.

---

## PHASE D — Agency Landing Page + First Outreach

### D1. Set up kawough.com (or chosen domain)
**Who:** Claude Code builds, YOU handles DNS
**Time:** 1-2 days
- Simple landing page: what we do, which apps, packages, case study
- SalesSignal as the hero case study
- Package pricing table (Starter / Growth / Enterprise / Marketing / Full Stack)
- "Book a call" CTA → Calendly or Cal.com
**Delivers:** Agency brand exists. Prospects have somewhere to land.

### D2. Run first outreach campaign
**Who:** Claude Code drafts messages, YOU sends
**Time:** 1 week ongoing
- Target: 15 D2D companies in SoCal (from OUTREACH.md)
- Sequence: 3 emails over 10 days (already templated)
- LinkedIn: connection requests to D2D sales managers
- Omi Discord: helpful engagement in sales-related channels
**Delivers:** First pipeline of potential agency clients.

---

## PHASE E — Multi-Agent Marketing Stack

**When:** After Phase A shipped, Phase B content live, Phase C app #2 shipped.
NOT before — the Master Plan is explicit: "build the agent stack after
SalesSignal is deployed, three affiliate pages are live, and at least one
other app has shipped."

### E1. Code the CrewAI Flow
**Who:** Claude Code
**Time:** 1-2 weeks
- Project: `kawough-agents/` (separate from app codebases)
- 10 agents from MULTI_AGENT_MARKETING.md
- CrewAI Flows with `@human_feedback` gates
- Tools: Notion API, WordPress API, Buffer API, GSC API, ConvertKit API
- Deploy on Railway with cron schedule

### E2. Validate manually first
**Who:** YOU
**Time:** 2 weeks of manual runs
- Run each agent prompt manually in Claude
- Validate output quality before automating
- Refine prompts based on what works
- THEN code the CrewAI Flow against validated prompts

---

## PHASE F — Clone Apps 3-10

Each follows the same template. Priority order from Master Plan:

| # | App | Est. Build Time | Deploy After |
|---|---|---|---|
| 3 | SOAP Note Generator | 6-8 weeks | Phase C done |
| 4 | Sales Call Coach | 8-12 weeks | SOAP Notes shipped |
| 5 | Creative Brief Generator | 3-4 weeks | Can parallel with 4 |
| 6 | Voice-to-AI Bridge | 4-6 weeks | After 5 |
| 7 | Deposition Digest | 6-8 weeks | After 6 |
| 8 | 1-on-1 Coaching Journal | 4-6 weeks | After 7 |
| 9 | Field Service Reports | 4-8 weeks | After 8 |
| 10 | Lecture-to-Study-Kit | 4-6 weeks | Last |

Each app launch creates:
- +1 app in Omi store (Lane 1)
- +1 landing page on omideveloper.com or product subdomain (Lane 3)
- +3-5 blog posts (all lanes)
- +1 agency service line (Lane 4)
- +10-15 social posts
- +1 outreach vertical
- More affiliate sales from the new audience (Lane 2)

---

## PHASE O — Omi Ambassador Program (IMMEDIATE, unlocks free devices)

**Why first among parallel tracks:** Free devices eliminate the biggest cost
and friction across everything: agency pilots, demo content, beta testing.
You already qualify for Sergeant rank with 3+ apps built. Getting approved
unlocks 5 free devices per month immediately.

### O1. Get noticed in Omi Discord (this week)
**Who:** YOU
**Time:** 30 min/day for 1 week
**Steps:**
1. Join Omi Discord (discord.com/invite/MTF9zHJQAJ)
2. Post in the developer channel showing your 3+ live apps
3. Help answer questions from other developers
4. Share SalesSignal architecture overview (technical credibility)
5. Engage genuinely for 5-7 days so you're a known name
**Delivers:** Visibility with the Omi team before you reapply.

### O2. Reapply for Ambassador with proof (end of week 1)
**Who:** YOU
**Time:** 1 hour
**Steps:**
1. Email team@basedhardware.com with:
   - Subject: "Ambassador Application: Developer with 3+ Live Omi Apps"
   - List your apps with Omi store links and install counts
   - Link to your GitHub repo
   - Link to omideveloper.com (once live from Phase B)
   - Mention you're building 10 vertical apps on the platform
   - Reference your Discord activity from O1
2. Also DM founding team members through Discord
3. Follow up once after 5 days if no response
**Delivers:** Ambassador approval at Sergeant rank.

### O3. Ambassador benefits once approved (Sergeant rank)
**What you get immediately:**
- 5 free Omi devices per month
- 50% off additional devices (~$90 each instead of $179)
- 10% affiliate bonus (on top of the base 30%)
- Unique Discord role (more visibility)
- Direct access to private chats with founding team

**How free devices feed every revenue stream:**

| Use case | Devices/month | Stream served |
|---|---|---|
| Agency client pilots (no upfront cost = easier close) | 2-3 | Lane 4 |
| Demo content (multiple setups, use cases, videos) | 1 | Lane 1, 2, 3 |
| Beta testers for new app feedback | 1 | Lane 1, 3 |
| Buy at 50% off, clients buy through affiliate at full price | Additional | Lane 2 |

### O4. Path to Captain rank (month 3-4 target)
**Requirements:** 1 IRL event with 30+ attendees + 2 apps or 2 videos
**You already have:** 3+ apps (done), videos coming from Phase B
**The event:** Host a "Build on Omi" developer meetup in SoCal
- Use Meetup.com + local dev communities
- Give away 3-5 free devices (from your Sergeant allocation) as prizes
- 30 attendees is doable in the IE/LA dev community
**Captain benefits:** 10 free devices/month, 20% affiliate bonus, factory visit,
early access to new hardware, manage Sergeants

### O5. "Official Omi Ambassador" branding
Once approved, add to:
- omideveloper.com homepage ("Official Omi Ambassador")
- Kawough Marketing agency page ("Official Omi Ambassador Partner")
- All content bio/about sections
- LinkedIn headline
- Email signature
**Delivers:** Instant credibility across everything.

---

## PHASE T — TikTok Shop (PARALLEL TRACK — runs alongside everything)

**Why parallel:** TikTok Shop shares zero code dependencies with the Omi
ecosystem. Different product, different platform, different buyer. But they
share: GHL (CRM + Social Planner), Supabase (analytics), Notion (command
center), HeyGen (avatar videos), ElevenLabs (voice), and eventually the
multi-agent marketing stack. The revenue compounds independently.

**The bottleneck across EVERYTHING is filming HeyGen avatar footage.** 10
minutes of iPhone 4K video. This single recording unlocks: TikTok Shop clone
accounts, Omi affiliate YouTube/TikTok content, and agency brand videos.
Film it FIRST.

### T0. Film HeyGen avatar footage (THE UNLOCK)
**Who:** YOU
**Time:** 10 minutes of recording, then upload to HeyGen
**Do:**
- iPhone, 4K, good lighting, plain background
- Look at camera, natural expressions, varied head movements
- Say 30-60 seconds of speech (HeyGen needs lip/voice training data)
- Upload to HeyGen → create Instant Avatar
- Upload voice sample to ElevenLabs → create Voice Clone
**Delivers:** Your digital clone. Usable for TikTok Shop clone accounts,
Omi demo videos, agency pitch videos, affiliate content. This ONE action
unblocks content production across the entire empire.
**Unblocks:** T3 (clone account videos), B3 (Omi YouTube), B4 (Omi TikToks)

### T1. Sign up CJDropshipping + list 5 products
**Who:** YOU signs up, Claude Code prepares listings
**Time:** 2-3 hours
**Steps:**
1. Sign up CJDropshipping (free)
2. Connect TikTok Shop seller account
3. List 5 products with US warehouse fulfillment:

| Product | Retail | Source |
|---|---|---|
| Bluetooth Posture Sensor | $39.99 | Amazon/CJ US warehouse |
| LED Galaxy/Sunset Projector | $24.99 | Amazon/CJ US warehouse |
| Wireless Vacuum Food Sealer | $29.99 | Amazon/CJ US warehouse |
| Magnetic Cable Management Kit | $36.99 | Amazon/CJ US warehouse |
| Reusable Magnetic Lash Kit | $32.99 | Amazon/CJ US warehouse |

4. Each listing needs unique images, unique description (Claude Code writes)
5. Verify all ship within 3 days (TikTok requirement)
**Delivers:** Store 1 is live with products. Can start selling.
**Unblocks:** T3 (need products to make videos about)

### T2. Set up account isolation infrastructure
**Who:** YOU
**Time:** 2-3 hours
**Steps:**
1. Download AdsPower (anti-detect browser) or Multilogin
2. Create 5 browser profiles (one per TikTok account)
3. Purchase 5 residential proxies (one unique IP per account)
4. Assign: 1 proxy per browser profile per TikTok account
5. Get 5 unique phone numbers (TextNow or Google Voice for 3 faceless,
   physical SIMs preferred for 2 clone accounts)
6. Create 5 dedicated Gmail accounts (one per TikTok account)
**Delivers:** Isolation infrastructure. No cross-contamination between accounts.
**Critical:** Skip this and TikTok links your accounts and bans all 5.

### T3. Build content engine for Store 1
**Who:** Claude Code builds scripts/templates, YOU records clone footage
**Time:** 1 week to establish, then ongoing

### ⚠️ HeyGen Policy: Real Face vs Avatar
- REAL FACE required: Omi device reviews, SalesSignal demos, app tutorials,
  anything where technical credibility is the product. Viewers need to see
  that you're a real developer who built real things. This is your moat
  the competition cannot fake.
- HEYGEN AVATAR OK: TikTok Shop clone accounts, repetitive product explainers,
  faceless content, volume content where you need 5 videos/day. HeyGen saves
  time on content that doesn't rely on your personal credibility.
- RULE: If the video's value comes from "I built this and here's what broke,"
  shoot it with your real face. If the video's value is "here's a product
  that solves X," the avatar is fine.

**Steps:**

**Clone accounts (1 & 2) — trust engine:**
1. Claude Code pulls winning hooks from TikTok Creative Center
2. Claude Code writes unique script per video (problem → solution → CTA)
3. YOU sends scripts to HeyGen for avatar rendering (45-90 min queue each)
4. ElevenLabs voice varies expressiveness per video
5. Toggle AI-Generated Content label on publish
6. Schedule via GHL Social Planner with 90+ min stagger between accts 1 & 2
7. Target: 3 videos/day (acct 1) + 2 videos/day (acct 2) = 5 clone videos/day

**Faceless accounts (3, 4, 5) — volume engine:**
1. Claude Code generates fresh scripts + text overlay copy for each account
2. Each account has unique audio identity (aesthetic/ASMR, trending viral, lofi)
3. Fresh visual assets every render, NEVER reuse across accounts
4. Minimum 45-minute stagger between all faceless posts
5. Target: 6 + 5 + 3-4 = 14-15 faceless videos/day

**Total Store 1: ~19-21 videos/day, ~600/month**
**Delivers:** Content machine running. Revenue starts.

### T4. Monitor and optimize (ongoing)
**Who:** YOU (15-min daily check), Claude Code (analytics)
**Time:** Daily
**Monitor:**
- Shop Performance Score (SPS) — must stay above 3.0
- Any product >5.5% return rate → auto-pause listing
- Shipping speed — any supplier averaging 4+ days → re-route via CJDropshipping
- Video completion rate — any format hitting 60%+ → replicate within 24 hrs
- Videos hitting 5K views in 2 hours → flag for paid boost decision
**Delivers:** Continuous optimization. Protects SPS score.

### T5. Open Store 2 (Month 2, after Store 1 proves model)
**Who:** Claude Code prepares, YOU executes
**Trigger:** Store 1 SPS above 3.5 consistently
**Store 2:** Health & Wellness (Posture Sensor as hero, bridges from Store 1)
- Repeat T1-T4 for new store
- 5 new accounts with full isolation
- New product listings (different images/descriptions even for shared products)
**Delivers:** Second revenue stream within TikTok.

### T6-T8. Stores 3, 4, 5 (Months 3-5)
Each store follows the same playbook. Sequential, not parallel. Each one
only opens when all existing stores have SPS 3.5+.

---

## SHARED TOOLS — What's Used Where

| Tool | Omi Ecosystem | TikTok Shop | Notes |
|---|---|---|---|
| GoHighLevel | CRM for agency clients | Social Planner for TikTok scheduling | Same account |
| Supabase | App data, sessions, auth | Analytics tracking | Same project or separate |
| Notion | Content pipeline, product DB | Session logs, empire status | Same workspace |
| HeyGen | Omi demo videos, affiliate content | Clone account TikToks | Same avatar |
| ElevenLabs | Omi video voiceovers | Clone account voice | Same voice clone |
| Claude/CrewAI | Multi-agent marketing stack | TikTok script generation | Separate agents but same framework |
| Hostinger VPS | Available for hosting | Available for automation | Same server |
| Railway | Webhook + agents hosting | Not used | Omi only |
| CJDropshipping | Not used | Product fulfillment (free) | TikTok only |
| AdsPower | Not used | Account isolation | TikTok only |
| Deepgram | Audio transcription | Not used | Omi only |
| WordPress | omideveloper.com blog | Not used | Omi only |

**The HeyGen avatar is the single shared bottleneck.** One 10-minute filming
session creates the avatar used for: TikTok Shop clone accounts, Omi YouTube
reviews, Omi TikTok demos, agency pitch videos, and affiliate content. Film
it once, use it everywhere.

---

## IMMEDIATE NEXT ACTIONS (Today)

These are the things to do RIGHT NOW. Two parallel tracks.

### TRACK 1: YOU (physical actions nobody else can do)

**Action 0: Join Omi Discord and start engaging (15 min now, then 15 min/day)**
Post your apps, help others, become visible. This starts the Ambassador
pipeline immediately. No cost, no dependencies, just show up.

**Action 1: Film HeyGen avatar footage (10 min)**
This is the unlock for EVERYTHING. TikTok clone accounts, Omi videos,
agency content. iPhone, 4K, good lighting, plain background. Upload to
HeyGen + ElevenLabs immediately after. Do this TODAY.

**Action 2: Gather API keys for SalesSignal deploy (30 min)**

| Key | Where to get it | Status |
|---|---|---|
| DEEPGRAM_API_KEY | deepgram.com → Dashboard → API Keys | ? |
| SUPABASE_URL | Supabase project → Settings → API | Already have |
| SUPABASE_SERVICE_ROLE_KEY | Same place | Already have |
| WEBHOOK_TOKEN | Generate: `openssl rand -hex 32` | Generate now |
| GHL_API_TOKEN | GoHighLevel → Settings → Integrations → Private | ? |
| GHL_LOCATION_ID | GoHighLevel URL bar or API | ? |
| HUBSPOT_ACCESS_TOKEN | HubSpot → Developer → Private App | ? |
| HF_TOKEN | huggingface.co → Settings → Access Tokens | ? |

Paste directly into Railway dashboard. Never share in chat.

**Action 3: Deploy webhook to Railway (20 min)**
Follow Phase A2.

**Action 4: Sign up CJDropshipping + connect TikTok Shop (30 min, free)**
Free plan. Connect seller account. I'll have the 5 product
listings ready for you to paste in.

### TRACK 2: CLAUDE CODE (parallel, no dependencies on you)

**Action 1: Git commit all current work (2 min)**

**Action 2: Draft 3 affiliate articles for omideveloper.com**
**PREREQUISITE:** Read docs/VOICE_REFERENCE.md before drafting ANY content.
If Ethan has filled in the "## Ethan's Own Words" section, use it as the
primary voice reference. Reject any draft that uses: "revolutionary,"
"game-changing," "cutting-edge," or leads with a product description
instead of a problem or personal experience.
- "Omi AI Review 2026: A Developer Who Built 10 Apps Tells the Truth"
- "Omi Discount Code 2026: ETHANJOHNKAWOUG"
- "Omi for Sales Reps: How SalesSignal Auto-Fills Your CRM"

**Action 3: Write 5 TikTok Shop product listings**
Unique descriptions, unique angles for each of the 5 products.
Ready to paste into AutoDS when you connect.

**Action 4: Write first 5 TikTok Shop video scripts**
Clone account format (Problem Solver persona). One per product.
Ready for HeyGen rendering once your avatar is created.

**Action 5: Draft TikTok scripts for Omi content**
3 scripts for Omi TikToks (SalesSignal demo, ecosystem hook, unboxing).
Ready to film or render through HeyGen clone.

---

## Revenue Timeline (Conservative, Both Tracks)

| Month | Omi Affiliate | App Subs | Agency | TikTok Shop | Total |
|---|---|---|---|---|---|
| 1 | $100 | $0 | $0 | $200-800 | $300-900 |
| 2 | $300 | $200 | $0 | $800-2,500 | $1,300-3,000 |
| 3 | $500 | $600 | $300 | $2,000-6,000 | $3,400-7,400 |
| 4 | $800 | $1,200 | $600 | $3,000-8,000 | $5,600-10,600 |
| 5 | $1,000 | $2,000 | $1,000 | $4,000-10,000 | $8,000-14,000 |
| 6 | $1,200 | $3,000 | $1,500 | $5,000-12,000 | $10,700-17,700 |
| 7-12 | $1,500/mo | $4,500/mo | $2,500/mo | $6,000-15,000/mo | $14,500-23,500/mo |
| **Year 1** | **$12,000** | **$28,000** | **$16,000** | **$40,000-100,000** | **$96,000-156,000** |

TikTok Shop range is wide because it depends on content volume and viral
hits. The low end assumes Store 1 only. The high end assumes Stores 1-3
running by month 5. The Omi numbers are more predictable because they're
subscription based.

**Combined monthly operating costs:**

| Item | Monthly |
|---|---|
| Railway (Omi services) | $10-20 |
| Supabase (shared) | $25 |
| Claude API (agents) | $20-30 |
| WordPress (omideveloper.com) | $12-20 |
| HeyGen | $29 |
| ElevenLabs | $22 |
| Anti-detect browser | $10-30 |
| Residential proxies (5) | $25-50 |
| Email (ConvertKit) | $0-29 |
| Social scheduling (Buffer or GHL) | $0-15 |
| **Total** | **$180-270/mo** |

---

## Dependencies Map

```
═══════════════ AMBASSADOR TRACK ══════════════════

O1 (Discord engagement, this week) ──► O2 (reapply with proof)
                                            │
                                            ▼
                                       O3 (approved = 5 free devices/mo)
                                            │
                                            ├──► Agency pilots use free devices
                                            ├──► Demo content with real hardware
                                            └──► O4 (Captain rank, month 3-4)

═══════════════════ OMI TRACK ═══════════════════

A1 (git commit) ──────────────────────────────────────────────►
A2 (webhook deploy) ──► A4 (agents deploy) ──► A5 (smoke test)
A3 (AMD vLLM) ─────────► A4                        │
                                                     ▼
                                               A6 (admin panel)
                                               A7 (Omi pairing)
                                               A8 (demo video) ──► A9 (submit)
                                                     │
B1 (omideveloper.com) ──► B2 (3 articles) ──► B3 (YouTube)
                                              B4 (TikToks)     [PARALLEL WITH A]
                                              B5 (email capture)
                                                     │
                                                     ▼
C1 (Showing Notes build) ──► C2 (Omi store) ──► C3 (content)
                                                     │
                                                     ▼
D1 (agency site) ──► D2 (outreach)
                          │
                          ▼
                    E1 (marketing agents) ──► E2 (validate)
                                                     │
                                                     ▼
                                        F (clone apps 3-10)

═══════════════════ TIKTOK TRACK ══════════════════

T0 (film HeyGen) ──────────────────────────────────────────────
        │                                                       │
        ├──► T3 (clone account videos)                          │
        ├──► B3 (Omi YouTube — uses same avatar)                │
        └──► B4 (Omi TikToks — uses same avatar)                │
                                                                │
T1 (CJDropshipping + list products) ──► T3 (content engine)             │
T2 (account isolation) ────────► T3                             │
                                  │                             │
                                  ▼                             │
                            T4 (monitor + optimize)             │
                                  │                             │
                                  ▼                             │
                            T5 (Store 2, month 2)               │
                                  │                             │
                                  ▼                             │
                            T6-T8 (Stores 3-5, months 3-5)     │

═══════════════════ SHARED ════════════════════════

T0 (HeyGen avatar) unlocks content on BOTH tracks.
GHL Social Planner schedules for BOTH tracks.
CrewAI agents (Phase E) eventually manage BOTH tracks.
Notion is the command center for BOTH tracks.
```

**Three things run in parallel from day one:**
1. Phase A (SalesSignal deploy) — you on Railway + AMD
2. Phase B (affiliate content) — Claude Code writes articles
3. Phase T (TikTok Shop) — you film avatar + list products

**The single most important action:** Film the HeyGen avatar footage. It
unblocks content production across the ENTIRE empire. 10 minutes of
recording. Everything else is downstream.
