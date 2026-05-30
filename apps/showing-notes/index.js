require('dotenv').config({ path: '/opt/showing-notes/.env' });
const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 3462;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── RFC-1918 / link-local SSRF guard ─────────────────────────────────────────
const PRIVATE_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
];
function isSafeUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname;
    if (PRIVATE_RANGES.some(r => r.test(host))) return false;
    return true;
  } catch { return false; }
}

// ── UID validation ────────────────────────────────────────────────────────────
const UID_RE = /^[a-zA-Z0-9_-]{4,64}$/;

// ── Token generator ───────────────────────────────────────────────────────────
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ── Upsert user (INSERT on first hit, token immutable after) ──────────────────
async function getOrCreateUser(uid) {
  const token = generateToken();
  // INSERT ... ON CONFLICT DO NOTHING — existing token stays intact
  await supabase
    .from('showing_notes_users')
    .insert({ uid, token })
    .select()
    .maybeSingle();

  const { data, error } = await supabase
    .from('showing_notes_users')
    .select('*')
    .eq('uid', uid)
    .single();
  if (error) throw error;
  return data;
}

// ── Claude extraction ─────────────────────────────────────────────────────────
async function extractShowingData(structured, transcript) {
  const transcriptText = (transcript || [])
    .slice(0, 50)
    .map(s => `${s.speaker || 'SPEAKER'}: ${(s.text || '').slice(0, 400)}`)
    .join('\n');

  const prompt = `You are analyzing a real estate showing conversation. Extract the following from the memory below and return ONLY valid JSON matching the schema — no markdown, no explanation.

Schema:
{
  "property_address": "string or null",
  "buyer_positive_reactions": ["string"],
  "buyer_concerns": ["string"],
  "budget_discussion": "string or null",
  "agent_follow_ups": ["string"]
}

Memory title: ${structured?.title || ''}
Overview: ${structured?.overview || ''}
Action items: ${(structured?.action_items || []).join('; ')}

Transcript:
${transcriptText || '(none)'}`;

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  let raw = msg.content[0]?.text?.trim() || '{}';
  // Strip markdown code fences if model adds them
  if (raw.startsWith('```')) { raw = raw.split('\n').slice(1).join('\n').replace(/```\s*$/, '').trim(); }
  return JSON.parse(raw);
}

// ── Log delivery ──────────────────────────────────────────────────────────────
async function logDelivery(uid, memory_id, crm_url, status, response_code) {
  await supabase.from('showing_notes_delivery_log').insert({
    uid, memory_id, crm_url, status, response_code,
  });
}

// ── Omi notification ──────────────────────────────────────────────────────────
async function fireOmiNotification(uid, message) {
  const appId = process.env.OMI_APP_ID;
  const appSecret = process.env.OMI_APP_SECRET;
  if (!appId || !appSecret) return; // fill in after Omi app registration
  try {
    await axios.post(
      'https://api.omi.me/v2/integrations/' + appId + '/notification',
      null,
      { params: { uid, message }, headers: { Authorization: 'Bearer ' + appSecret }, timeout: 8000 }
    );
  } catch (err) {
    console.error('[showing-notes] Omi notification failed:', (err.response && err.response.data) || err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE: POST /showing-notes/webhook
// ─────────────────────────────────────────────────────────────────────────────
app.post('/showing-notes/webhook', async (req, res) => {
  res.status(200).json({ ok: true }); // Always ack first

  const { uid, memory_id, structured, transcript } = req.body || {};

  if (!uid || !UID_RE.test(uid)) {
    console.error('[showing-notes] invalid uid:', uid);
    return;
  }

  // Idempotency — skip if memory_id already processed
  if (memory_id) {
    const { data: existing } = await supabase
      .from('showing_notes_delivery_log')
      .select('id')
      .eq('memory_id', memory_id)
      .maybeSingle();
    if (existing) {
      console.log(`[showing-notes] duplicate memory_id ${memory_id} — skipped`);
      return;
    }
  }

  try {
    const user = await getOrCreateUser(uid);
    const settingsUrl = `https://omideveloper.com/showing-notes/settings?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(user.token)}`;

    if (!user.webhook_url) {
      // No CRM configured — extract anyway and send recap via Omi notification
      console.log(`[showing-notes] no CRM webhook for uid ${uid} — extracting for Omi notification only`);
      try {
        const extracted = await extractShowingData(structured, transcript);
        const addr = extracted.property_address || 'property';
        const followups = (extracted.agent_follow_ups || []).slice(0, 2).join('; ') || 'none';
        await fireOmiNotification(uid,
          `Showing recap: ${addr}. Follow-ups: ${followups}. Add CRM at ${settingsUrl}`
        );
      } catch (e) {
        await fireOmiNotification(uid, `Showing captured. Add CRM webhook at ${settingsUrl}`);
      }
      await logDelivery(uid, memory_id, null, 'notified_no_crm', null);
      return;
    }

    // Extract via Claude
    let extracted;
    try {
      extracted = await extractShowingData(structured, transcript);
    } catch (err) {
      console.error('[showing-notes] extraction failed:', err.message);
      await supabase.from('showing_notes_pending').insert({
        uid, memory_id,
        raw_overview: structured?.overview,
        transcript: transcript || [],
        error: err.message,
      });
      await logDelivery(uid, memory_id, user.webhook_url, 'extraction_failed', null);
      return;
    }

    // Build CRM payload
    const payload = {
      app: 'showing_notes',
      memory_id,
      uid,
      property_address: extracted.property_address || null,
      buyer_positive_reactions: extracted.buyer_positive_reactions || [],
      buyer_concerns: extracted.buyer_concerns || [],
      budget_discussion: extracted.budget_discussion || null,
      agent_follow_ups: extracted.agent_follow_ups || [],
      raw_overview: structured?.overview || '',
      timestamp: new Date().toISOString(),
    };

    // POST to CRM with one retry
    let status = 'failed';
    let responseCode = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const r = await axios.post(user.webhook_url, payload, { timeout: 10000 });
        responseCode = r.status;
        status = 'sent';
        break;
      } catch (err) {
        responseCode = err.response?.status || null;
        console.error(`[showing-notes] CRM POST attempt ${attempt} failed:`, err.message);
        if (attempt === 1) await new Promise(r => setTimeout(r, 5000));
      }
    }

    await logDelivery(uid, memory_id, user.webhook_url, status, responseCode);

    if (status === 'sent') {
      await fireOmiNotification(uid, `Showing recap sent. Property: ${extracted.property_address || 'logged'}`);
    }
  } catch (err) {
    console.error('[showing-notes] unhandled error:', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE: GET /showing-notes/settings
// ─────────────────────────────────────────────────────────────────────────────
app.get('/showing-notes/settings', async (req, res) => {
  const { uid, token } = req.query;
  if (!uid || !token || !UID_RE.test(uid)) {
    return res.status(400).send(settingsPage(null, 'Invalid link. Trigger a showing in the Omi app to get your settings link.'));
  }

  const { data: user } = await supabase
    .from('showing_notes_users')
    .select('*')
    .eq('uid', uid)
    .eq('token', token)
    .maybeSingle();

  if (!user) {
    return res.status(403).send(settingsPage(null, 'Link expired or invalid. Trigger a showing to get a new settings link.'));
  }

  res.send(settingsPage(user, null));
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE: POST /showing-notes/settings
// ─────────────────────────────────────────────────────────────────────────────
app.post('/showing-notes/settings', async (req, res) => {
  const { uid, token, webhook_url } = req.body || {};

  if (!uid || !token || !UID_RE.test(uid)) {
    return res.status(400).send(settingsPage(null, 'Invalid request.'));
  }

  // Empty webhook_url is allowed — clears the CRM destination
  if (webhook_url && !isSafeUrl(webhook_url)) {
    const { data: user } = await supabase.from('showing_notes_users').select('*').eq('uid', uid).eq('token', token).maybeSingle();
    return res.status(400).send(settingsPage(user, 'Invalid webhook URL. Must be https:// and not a private/local address.'));
  }

  const { data: user, error } = await supabase
    .from('showing_notes_users')
    .update({ webhook_url, updated_at: new Date().toISOString() })
    .eq('uid', uid)
    .eq('token', token)
    .select()
    .maybeSingle();

  if (error || !user) {
    return res.status(403).send(settingsPage(null, 'Could not save — link may be expired.'));
  }

  res.send(settingsPage(user, null, true));
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE: GET /showing-notes/health
// ─────────────────────────────────────────────────────────────────────────────
app.get('/showing-notes/health', (_, res) => res.json({ ok: true, app: 'showing-notes' }));

// ─────────────────────────────────────────────────────────────────────────────
// Settings page HTML
// ─────────────────────────────────────────────────────────────────────────────
function settingsPage(user, error, saved = false) {
  const currentWebhook = user?.webhook_url || '';
  const uid = user?.uid || '';
  const token = user?.token || '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Showing Notes — Settings</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #050714; color: #e5e7eb; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 36px; max-width: 480px; width: 100%; }
    h1 { font-size: 22px; font-weight: 700; color: #00e5a0; margin-bottom: 6px; }
    p.sub { font-size: 14px; color: #9ca3af; margin-bottom: 28px; }
    label { display: block; font-size: 13px; font-weight: 600; color: #d1d5db; margin-bottom: 6px; }
    input[type=url] { width: 100%; padding: 10px 14px; background: #1f2937; border: 1px solid #374151; border-radius: 8px; color: #f9fafb; font-size: 14px; outline: none; }
    input[type=url]:focus { border-color: #00e5a0; }
    button { margin-top: 18px; width: 100%; padding: 12px; background: #00e5a0; color: #050714; font-weight: 700; font-size: 15px; border: none; border-radius: 8px; cursor: pointer; }
    button:hover { background: #00c98d; }
    .msg { margin-top: 16px; padding: 12px 14px; border-radius: 8px; font-size: 14px; }
    .msg.error { background: #450a0a; border: 1px solid #7f1d1d; color: #fca5a5; }
    .msg.success { background: #052e16; border: 1px solid #14532d; color: #86efac; }
    .hint { margin-top: 12px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
<div class="card">
  <h1>Showing Notes</h1>
  <p class="sub">Paste your CRM webhook URL below to forward showing recaps automatically. Leave blank if you only want Omi notifications.</p>
  ${error ? `<div class="msg error">${error}</div>` : ''}
  ${saved ? '<div class="msg success">Saved! Your next showing recap will go to this webhook.</div>' : ''}
  <form method="POST" action="/showing-notes/settings">
    <input type="hidden" name="uid" value="${uid}">
    <input type="hidden" name="token" value="${token}">
    <label for="webhook_url">CRM Webhook URL</label>
    <input type="url" id="webhook_url" name="webhook_url" placeholder="https://hooks.zapier.com/hooks/catch/... (optional)" value="${currentWebhook}">
    <button type="submit">Save Webhook URL</button>
  </form>
  <p class="hint">Works with GoHighLevel, Zapier, Make, n8n, or any https:// webhook.</p>
</div>
</body>
</html>`;
}

app.listen(PORT, () => console.log(`[showing-notes] listening on port ${PORT}`));
