# Omi Connect — Tesla
## Deploy Guide + Omi Store Submission

---

## THE STACK

```
GitHub (ekawough/omi-apps)
  ├── railway/     → Railway auto-deploys this
  └── vercel/      → Vercel auto-deploys this

Railway  = webhook server (receives Omi transcripts, fires commands)
Vercel   = connect.omideveloper.com (OAuth pages, user-facing)
Supabase = user sessions (persistent database)
VPS      = Tesla VCP proxy ONLY (already running, never touch it)
```

Every future Omi app = new Railway service + new Vercel project + same Supabase.
Push to GitHub → auto-deploys. Never SSH again.

---

## STEP 1 — Supabase (5 min)

Already have project ID: hmnuhxhtjxgoznvzykcf

1. Go to supabase.com → your project
2. SQL Editor → paste `railway/supabase-schema.sql` → Run
3. Settings → API → copy:
   - Project URL → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

---

## STEP 2 — Push to GitHub (2 min)

```bash
# In your omi-apps repo
cp -r railway/ /path/to/ekawough/omi-apps/tesla-railway/
cp -r vercel/  /path/to/ekawough/omi-apps/tesla-vercel/
git add . && git commit -m "omi connect tesla v2" && git push
```

---

## STEP 3 — Railway (5 min)

1. railway.app → New Project → Deploy from GitHub
2. Select `ekawough/omi-apps` → Root Directory: `tesla-railway`
3. Add env vars:

```
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://hmnuhxhtjxgoznvzykcf.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
TESLA_CLIENT_ID=0670aab3-1e65-4609-8373-db93c7c28193
TESLA_CLIENT_SECRET=ta-secret.6nJAx05t-PmIl*VG
INTERNAL_SECRET=[generate random 32 char string]
OMI_API_KEY=sk_cf6eb237f922573fe1981500e7c7f649
VCP_PROXY_URL=https://connect.omideveloper.com
PORT=3000
```

4. Railway gives you: `https://omi-tesla-production.railway.app` (or similar)

---

## STEP 4 — Vercel + connect.omideveloper.com (10 min)

1. vercel.com → New Project → Import `ekawough/omi-apps`
   Root Directory: `tesla-vercel`
2. Add env vars:

```
TESLA_CLIENT_ID=0670aab3-1e65-4609-8373-db93c7c28193
TESLA_CLIENT_SECRET=ta-secret.6nJAx05t-PmIl*VG
APP_URL=https://connect.omideveloper.com
RAILWAY_URL=https://your-railway-url.railway.app
INTERNAL_SECRET=[same string as Railway]
```

3. Domains → Add `connect.omideveloper.com`
4. In Hostinger DNS: Add CNAME record
   - Name: `connect`
   - Value: `cname.vercel-dns.com`
   (Vercel gives you exact DNS values)

---

## STEP 5 — Update Tesla Developer Portal

Go to developer.tesla.com → your app (Client ID: 0670aab3...)
Update redirect URI to:
`https://connect.omideveloper.com/api/auth/callback`

---

## STEP 6 — Submit to Omi Store

In Omi app → Explore → Submit App (update your existing submission):

| Field | Value |
|---|---|
| App Name | Omi Connect — Tesla |
| Category | Utilities |
| Capability | Real-time Transcript |
| Webhook URL | `https://your-railway-url.railway.app/webhook` |
| Auth URL | `https://connect.omideveloper.com/api/auth/tesla` |
| Setup Check URL | `https://your-railway-url.railway.app/setup-check` |

**Description:**
> Control your Tesla by voice through your Omi wearable. Just say "Tesla" followed by any command — unlock doors, open the trunk, start climate, manage charging. No app switching. No Siri. Just talk.

**Setup Instructions:**
> 1. Tap Connect Your Tesla and sign in with your Tesla account
> 2. Authorize Omi Connect
> 3. Say "Tesla, unlock my car" — that's it

---

## WAKE WORD — HOW IT WORKS

User says "Tesla" first, then their command.
Just like Siri needs "Hey Siri" — Tesla needs "Tesla"

```
✅ "Tesla, unlock my car"
✅ "Tesla, open the trunk"
✅ "Tesla, start climate"
✅ "Tesla, my hands are full"   ← AI detects intent = unlock
✅ "Hey Tesla, honk"
✅ "Tesla start charging"

❌ "unlock my car"              ← no wake word, ignored
❌ "open the trunk"             ← ignored
```

---

## TEST COMMANDS (after deploy)

```bash
# Health check
curl https://your-railway-url.railway.app/health

# Simulate Omi saying "Tesla, unlock my car"  
curl -X POST "https://your-railway-url.railway.app/webhook?uid=PX9VVe5qaYR9viuILXWJAx6ghV02&session_id=test1" \
  -H "Content-Type: application/json" \
  -d '[{"text":"Tesla, unlock my car","is_user":true,"start":0,"end":3}]'

# Setup check
curl https://your-railway-url.railway.app/setup-check?uid=PX9VVe5qaYR9viuILXWJAx6ghV02
```

---

## YOUR KNOWN CREDENTIALS

- Tesla Client ID: `0670aab3-1e65-4609-8373-db93c7c28193`
- Omi App ID: `01KM10QJRAHMSEBD5WZK319KXY`
- Omi API Key: `sk_cf6eb237f922573fe1981500e7c7f649`
- Your Omi UID: `PX9VVe5qaYR9viuILXWJAx6ghV02`
- VIN: `7SAYGDEE0NF463195`
- VCP Proxy: `https://connect.omideveloper.com` (port 4443 internally)
- Supabase Project: `hmnuhxhtjxgoznvzykcf`
- GitHub: `ekawough/omi-apps`

---

## OMI APP PROMPT (paste in submission)

You are Omi Connect, a Tesla voice controller for Omi.
You run silently. You only act when the user says "Tesla" as a wake word.

After "Tesla" is detected, execute the appropriate command:
- unlock / open up → unlock doors
- lock / lock it up → lock doors  
- open trunk / pop the trunk → rear trunk
- open frunk / pop the frunk → front trunk
- start climate / heat up / cool down / warm up → climate on
- stop climate / ac off → climate off
- start charging / charge it → charge start
- stop charging → charge stop
- open charge port → charge port open
- flash lights / find my car → flash lights
- honk / beep → honk horn

Natural intent after "Tesla":
- "my hands are full" / "carrying stuff" → unlock
- "it's freezing" / "it's hot" → climate on
- "I can't find it" / "where is it" → flash lights

Rules:
- ONLY act if "Tesla" was said. Ignore everything else.
- Confirm with one short message only: "Unlocked." / "Trunk open." etc.
- Never double-fire. Never explain.
