# Runbook — from empty laptop to live demo

Every step that needs a human is in this file. Everything else is code. Read
top-to-bottom.

## 0. Accounts (30 min, Apr 15)

| Service | URL | What to grab |
|---|---|---|
| Deepgram | deepgram.com | API key ($200 free credit) |
| Supabase | supabase.com | Project URL, anon key, service_role key |
| Railway | railway.app | Hobby or Pro plan |
| AMD Dev Cloud | devcloud.amd.com | $100 credit, MI300X instance |
| GoHighLevel | app.gohighlevel.com | Private Integration Token + Location ID |
| HubSpot | developers.hubspot.com | Private App Access Token |
| Hugging Face | huggingface.co | Token (needed to pull Llama 3.1 weights) |
| Omi | omi.me | DevKit 2 in hand + app configured |

## 1. Supabase schema (5 min, Apr 15)

1. Open your Supabase project → **SQL Editor → New query**.
2. Paste everything in `supabase/schema.sql`. Run.
3. Verify: **Table Editor → sessions, reps, consent_log, org_settings** all
   present.
4. **Database → Replication** → confirm `sessions` is in `supabase_realtime`
   publication (the SQL script adds it but double-check).
5. Copy the **Project URL**, **anon public key**, and **service_role key**
   (Settings → API) into the respective `.env` files below.

## 2. Webhook (Railway service #1, 20 min, Apr 17)

1. In Railway → **New Project → Deploy from repo** → pick this repo, set
   **Root directory** to `salesSignal/webhook`.
2. Variables (copy from `webhook/.env.template`):
   - `DEEPGRAM_API_KEY`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `WEBHOOK_TOKEN` (generate a long random string)
   - `AGENT_PIPELINE_URL` (leave blank for now — you'll fill it in after step 4)
3. Deploy. Test: `curl https://<railway-domain>/health` → `{ok:true}`.

## 3. AMD vLLM (AMD Dev Cloud, 45 min, Apr 21)

On the MI300X instance:

```bash
git clone <this repo> && cd salesSignal/scripts
export HF_TOKEN=hf_xxx                    # needed to pull Llama-3.1 weights
bash run_amd_inference.sh
```

Expect 3-5 minutes of "loading weights" output, then a steady state. In
another terminal on the same box:

```bash
curl http://localhost:8000/v1/models
```

Should list `meta-llama/Llama-3.1-8B-Instruct`. Note the instance's
**public IP** — the agents service on Railway needs to reach port 8000.

Optional, same box: `bash setup_emotion_model.sh` pre-warms the
acoustic-emotion weights.

## 4. Agents (Railway service #2, 30 min, Apr 28)

1. Railway → **New service** in the same project, **Root directory**
   `salesSignal/agents`.
2. Variables (from `agents/.env.template`):
   - `AMD_INFERENCE_URL=http://AMD_PUBLIC_IP:8000/v1`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `GHL_API_TOKEN`, `GHL_LOCATION_ID`
   - `HUBSPOT_ACCESS_TOKEN`
3. Deploy. Test: `curl https://<agents-railway-domain>/health` → lists the
   emotion backend.
4. Copy the agent service's **private** Railway URL (ends in
   `.railway.internal`) into the webhook service's `AGENT_PIPELINE_URL`
   variable and redeploy the webhook.
5. Smoke test end-to-end from your laptop:
   ```bash
   cd salesSignal/scripts
   AGENT_PIPELINE_URL=https://<agents-railway-domain> python smoke_test.py
   ```
   Expect `lead_score` in `[1, 10]`, `ghl_contact_id` and
   `hubspot_contact_id` present.

## 5. Admin panel (May 2)

The admin panel is a static SPA. Cheapest path: host on Vercel.

```bash
cd salesSignal/admin
# No build required — it's a single HTML file with CDN React.
# Drop to Vercel:
npx vercel --prod
```

Open the deployed URL → **Settings** → paste Supabase URL + anon key. Save.

The **Pipeline** tab now shows any sessions. Run the smoke test again —
you should see the new session appear in real time.

## 6. Omi config (May 3)

In the Omi app on the rep's phone:

1. **Settings → Developer mode** → enable.
2. **Realtime audio bytes** → URL:
   ```
   https://<webhook-railway-domain>/webhook/audio?token=<WEBHOOK_TOKEN>&uid=rep-1&sample_rate=16000
   ```
3. Leave the Omi DevKit connected. Speak into it. Session should appear in
   the admin panel within seconds.

## 7. Pre-demo checklist (May 16)

- [ ] `curl /health` on both Railway services: green
- [ ] `curl /v1/models` on AMD box: returns Llama
- [ ] Run `smoke_test.py`: green, <8s total
- [ ] End-to-end with real Omi: session appears, contacts land in GHL AND
      HubSpot, sentiment timeline renders
- [ ] Consent form loads on iPad, geolocation works
- [ ] Record a backup demo video in case wifi at the venue is bad

## 8. Submission (May 17)

`docs/SUBMISSION.md` has the lablab.ai form copy already drafted. Plug in
the video, slides, GitHub URL, demo URL, done.

---

## Troubleshooting

- **vLLM segfaults on first request.** You forgot `VLLM_ROCM_USE_AITER_FP4BMM=0`.
- **Deepgram stream closes after 10 s.** Add/verify the `keepAlive` timer in
  `webhook/deepgram.js` (it's there by default).
- **Parser agent returns `None` / empty.** Llama 3.1 struggles with
  `output_pydantic`. We use `output_json` + tolerant `_parse_json()` — if
  you see `{}` in crew output, the model returned fenced markdown; check
  the logs.
- **HubSpot deal creation 404.** The default pipeline/stage doesn't exist
  in your account. Either create one named exactly `default` with stage
  `appointmentscheduled`, or edit `hubspot_crm.create_deal` defaults.
- **GHL 401.** Private Integration Token is different from the legacy API
  key. Regenerate from Settings → Integrations → Private.
- **Admin panel empty after connecting.** Check browser console for CORS
  errors. Supabase → Authentication → URL Configuration → add your Vercel
  domain.
