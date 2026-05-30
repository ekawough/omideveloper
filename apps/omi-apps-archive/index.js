require('dotenv').config({ path: process.env.ENV_PATH || '/opt/omi-connect/.env' });
const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const https = require('https');

const app = express();
app.use(express.json({ limit: '10kb' })); // prevent oversized payloads

const PORT = process.env.PORT || 3458;
const DB_PATH = process.env.DB_PATH || '/opt/omi-connect/db.json';
const TESLA_CLIENT_ID = process.env.TESLA_CLIENT_ID;
const TESLA_CLIENT_SECRET = process.env.TESLA_CLIENT_SECRET;
const TESLA_REDIRECT_URI = process.env.TESLA_REDIRECT_URI;
const OMI_APP_ID = process.env.OMI_APP_ID;
const OMI_APP_SECRET = process.env.OMI_APP_SECRET;
const ENCRYPT_KEY = process.env.ENCRYPT_KEY; // 32-char secret for token encryption
const TESLA_AUTH_URL = 'https://auth.tesla.com/oauth2/v3/authorize';
const TESLA_TOKEN_URL = 'https://auth.tesla.com/oauth2/v3/token';
const TESLA_AUDIENCE = 'https://fleet-api.prd.na.vn.cloud.tesla.com';
const FREE_MONTHLY_LIMIT = 50;
const WAKE_TIMEOUT_MS = 8000; // 8s for sleeping Teslas

// \u2500\u2500 Startup validation \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const REQUIRED_ENV = ['TESLA_CLIENT_ID', 'TESLA_CLIENT_SECRET', 'TESLA_REDIRECT_URI', 'OMI_APP_ID', 'OMI_APP_SECRET', 'ENCRYPT_KEY'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) { console.error(`[startup] MISSING required env var: ${key}`); process.exit(1); }
}
if (process.env.ENCRYPT_KEY.length !== 32) { console.error('[startup] ENCRYPT_KEY must be exactly 32 characters'); process.exit(1); }

// \u2500\u2500 Token encryption \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPT_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  try {
    const [ivHex, encHex] = text.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPT_KEY), Buffer.from(ivHex, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]).toString();
  } catch { return null; }
}

// \u2500\u2500 DB (flat file with encrypted tokens) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function loadDB() { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; } }
function saveDB(db) { fs.mkdirSync(path.dirname(DB_PATH), { recursive: true }); fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

function getUser(uid) {
  const raw = loadDB()[uid];
  if (!raw) return null;
  // Decrypt tokens on read
  return {
    ...raw,
    tesla_access_token: raw.tesla_access_token ? decrypt(raw.tesla_access_token) : null,
    tesla_refresh_token: raw.tesla_refresh_token ? decrypt(raw.tesla_refresh_token) : null,
  };
}

function saveUser(uid, data) {
  const db = loadDB();
  const existing = db[uid] || {};
  const toSave = { ...existing, ...data, omi_uid: uid };
  // Encrypt tokens on write
  if (data.tesla_access_token) toSave.tesla_access_token = encrypt(data.tesla_access_token);
  if (data.tesla_refresh_token) toSave.tesla_refresh_token = encrypt(data.tesla_refresh_token);
  db[uid] = toSave;
  saveDB(db);
  return getUser(uid);
}

// \u2500\u2500 OAuth state (persisted to disk so restarts don't break auth) \u2500\u2500\u2500\u2500\u2500\u2500
const STATE_PATH = process.env.STATE_PATH || '/opt/omi-connect/states.json';
function loadStates() { try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); } catch { return {}; } }
function saveStates(s) { fs.writeFileSync(STATE_PATH, JSON.stringify(s)); }
function saveState(s, uid) { const states = loadStates(); states[s] = { uid, ts: Date.now() }; saveStates(states); }
function getState(s) {
  const states = loadStates();
  const entry = states[s];
  if (!entry) return null;
  if (Date.now() - entry.ts > 10 * 60 * 1000) { delete states[s]; saveStates(states); return null; } // 10min expiry
  return entry;
}
function deleteState(s) { const states = loadStates(); delete states[s]; saveStates(states); }

// \u2500\u2500 Rate limiting (in-memory, per uid) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const webhookHits = new Map();
function isRateLimited(uid) {
  const now = Date.now();
  const hits = webhookHits.get(uid) || [];
  const recent = hits.filter(t => now - t < 5000); // max 3 commands per 5s
  if (recent.length >= 3) return true;
  recent.push(now);
  webhookHits.set(uid, recent);
  return false;
}

// \u2500\u2500 Usage tracking \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function checkUsage(uid) {
  const user = getUser(uid);
  if (!user || !user.tesla_access_token) return { allowed: false, reason: 'not_connected' };
  if (user.is_premium) return { allowed: true, remaining: 'unlimited' };
  const month = new Date().toISOString().slice(0, 7);
  const used = user.month_reset === month ? (user.monthly_commands || 0) : 0;
  if (used >= FREE_MONTHLY_LIMIT) return { allowed: false, reason: 'limit_reached' };
  return { allowed: true, remaining: FREE_MONTHLY_LIMIT - used - 1 };
}

function incrementUsage(uid) {
  const user = getUser(uid);
  if (!user || user.is_premium) return;
  const month = new Date().toISOString().slice(0, 7);
  const used = user.month_reset === month ? (user.monthly_commands || 0) : 0;
  saveUser(uid, { monthly_commands: used + 1, month_reset: month });
}

// \u2500\u2500 Tesla API \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
async function refreshTeslaToken(user) {
  const r = await axios.post(TESLA_TOKEN_URL, {
    grant_type: 'refresh_token',
    client_id: TESLA_CLIENT_ID,
    refresh_token: user.tesla_refresh_token
  });
  const { access_token, refresh_token, expires_in } = r.data;
  saveUser(user.omi_uid, {
    tesla_access_token: access_token,
    tesla_refresh_token: refresh_token,
    tesla_token_expiry: Math.floor(Date.now() / 1000) + expires_in
  });
  return access_token;
}

async function getToken(user) {
  if (user.tesla_token_expiry && user.tesla_token_expiry - Math.floor(Date.now() / 1000) < 300) {
    return refreshTeslaToken(user);
  }
  return user.tesla_access_token;
}

async function getVehicleInfo(token) {
  const r = await axios.get(`${TESLA_AUDIENCE}/api/1/vehicles`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const v = r.data.response[0];
  return { id_s: v?.id_s, vin: v?.vin };
}

async function wakeVehicle(token, vehicleId) {
  try {
    const state = await axios.get(`${TESLA_AUDIENCE}/api/1/vehicles/${vehicleId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });
    if (state.data?.response?.state === 'online') return;
  } catch {}
  try {
    await axios.post(`${TESLA_AUDIENCE}/api/1/vehicles/${vehicleId}/wake_up`, {},
      { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
    );
  } catch {}
  await new Promise(r => setTimeout(r, WAKE_TIMEOUT_MS));
}

async function sendCommand(token, vehicleId, vin, command, params = {}) {
  // Try VCP proxy first (required for newer vehicles with signed commands)
  if (vin) {
    try {
      return await axios.post(
        `https://localhost:4443/api/1/vehicles/${vin}/command/${command}`,
        params,
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          timeout: 10000
        }
      );
    } catch (e) {
      console.log('[sendCommand] VCP proxy failed, falling back to direct API:', e.message);
    }
  }
  // Fallback to direct Fleet API
  return axios.post(
    `${TESLA_AUDIENCE}/api/1/vehicles/${vehicleId}/command/${command}`,
    params,
    { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
  );
}

async function getVehicleData(token, vehicleId) {
  const r = await axios.get(
    `${TESLA_AUDIENCE}/api/1/vehicles/${vehicleId}/vehicle_data?endpoints=charge_state%3Bdrive_state`,
    { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
  );
  return r.data.response;
}

async function notify(uid, message) {
  console.log(`[notify] ${uid}: ${message}`);
  if (!OMI_APP_ID || !OMI_APP_SECRET) { console.log('[notify] missing OMI_APP_ID or OMI_APP_SECRET'); return; }
  try {
    const r = await axios.post(
      `https://api.omi.me/v2/integrations/${OMI_APP_ID}/notification`,
      null,
      { params: { uid, message }, headers: { Authorization: `Bearer ${OMI_APP_SECRET}` }, timeout: 8000 }
    );
    console.log('[notify] sent:', r.status);
  } catch (e) { console.error('[notify error]', e.response?.data || e.message); }
}

// \u2500\u2500 Command detection \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const COMMANDS = {
  unlock:     { patterns: ['unlock','open the car','open my car','unlock my tesla','unlock my car','unlock the car'], action: 'door_unlock', message: '\ud83d\udd13 Unlocked!' },
  lock:       { patterns: ['lock','lock the car','lock my car','lock my tesla','lock it up','lock the tesla'], action: 'door_lock', message: '\ud83d\udd12 Locked!' },
  start:      { patterns: ['remote start','start the car','start my car','warm up the car','start my tesla','warm up my tesla'], action: 'remote_start_drive', message: '\ud83d\ude97 Remote start activated!' },
  horn:       { patterns: ['honk','honk the horn','beep the car','honk my tesla','beep my tesla'], action: 'honk_horn', message: '\ud83d\udcef Honked!' },
  flash:      { patterns: ['flash the lights','flash lights','flash my tesla','blink the lights'], action: 'flash_lights', message: '\ud83d\udca1 Lights flashed!' },
  ac_on:      { patterns: ['turn on the ac','turn on ac','cool the car','heat the car','climate on','turn on climate','start the ac','start ac'], action: 'auto_conditioning_start', message: '\u2744\ufe0f Climate started!' },
  ac_off:     { patterns: ['turn off the ac','turn off ac','climate off','stop climate','stop the ac'], action: 'auto_conditioning_stop', message: '\u26d4 Climate stopped!' },
  open_trunk: { patterns: ['open the trunk','open trunk','pop the trunk','pop trunk'], action: 'actuate_trunk', params: { which_trunk: 'rear' }, message: '\ud83d\udeaa Trunk opened!' },
  open_frunk: { patterns: ['open the frunk','open frunk','pop the frunk','pop frunk'], action: 'actuate_trunk', params: { which_trunk: 'front' }, message: '\ud83d\udeaa Frunk opened!' },
  battery:    { patterns: ['battery level','how much charge','how much battery','how much range','check battery','battery status','check my battery'], action: 'vehicle_data', key: 'battery' },
  locate:     { patterns: ["where's my car","where is my car","find my tesla","locate my car","where is my tesla","find my car"], action: 'vehicle_data', key: 'locate' },
};

function detectCommand(text) {
  if (!text || typeof text !== 'string') return null;
  const t = text.toLowerCase().trim().substring(0, 500); // cap input length
  for (const [key, cmd] of Object.entries(COMMANDS)) {
    if (cmd.patterns.some(p => t.includes(p))) return { key, ...cmd };
  }
  return null;
}

// \u2500\u2500 Routes \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

app.get('/.well-known/appspecific/com.tesla.3p.public-key.pem', (req, res) => {
  const keyPath = '/var/www/connect-omideveloper/.well-known/appspecific/com.tesla.3p.public-key.pem';
  if (fs.existsSync(keyPath)) res.type('text/plain').send(fs.readFileSync(keyPath, 'utf8'));
  else res.status(404).send('Not found');
});

app.get(['/', '/connect'], (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Omi Connect \u2014 Tesla Voice Control</title>
<style>
*{box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#000;color:#fff;text-align:center;padding:60px 20px;max-width:520px;margin:0 auto}
h1{color:#e2001a;font-size:2.6em;margin-bottom:6px;letter-spacing:-.02em}
.sub{color:#888;font-size:1.05em;margin-bottom:36px}
.btn{display:inline-block;background:#e2001a;color:#fff;padding:16px 44px;border-radius:12px;text-decoration:none;font-size:1.1em;font-weight:700;margin-bottom:36px;transition:opacity .2s}
.btn:hover{opacity:.85}
.cmds{text-align:left;background:#111;border-radius:14px;padding:22px 26px;margin-bottom:28px}
.cmds h3{color:#e2001a;margin:0 0 14px;font-size:.82em;text-transform:uppercase;letter-spacing:.1em}
ul{margin:0;padding:0;list-style:none}
li{color:#bbb;margin:9px 0;font-size:.93em}
.badge{display:inline-block;background:#1a1a1a;border:1px solid #333;border-radius:6px;padding:4px 10px;font-size:.78em;color:#666;margin-top:20px}
.privacy{margin-top:24px;font-size:.78em;color:#444}
.privacy a{color:#666;text-decoration:underline}
</style></head>
<body>
<h1>Omi Connect</h1>
<p class="sub">Voice control your Tesla \u2014 hands free</p>
<a href="/auth/tesla?uid=web" class="btn">Connect Your Tesla</a>
<div class="cmds">
  <h3>Say any of these</h3>
  <ul>
    <li>\ud83d\udd13 "Unlock my car"</li>
    <li>\ud83d\udd12 "Lock my car"</li>
    <li>\u2744\ufe0f "Turn on AC"</li>
    <li>\ud83d\udcef "Honk the horn"</li>
    <li>\ud83d\udeaa "Open the trunk" / "Open the frunk"</li>
    <li>\ud83d\udd0b "Check my battery"</li>
    <li>\ud83d\udccd "Where's my car?"</li>
    <li>\ud83d\ude80 "Remote start"</li>
    <li>\ud83d\udca1 "Flash the lights"</li>
  </ul>
</div>
<span class="badge">Free: ${FREE_MONTHLY_LIMIT} commands/month</span>
<p class="privacy">
  By using this app you agree to our <a href="/privacy">Privacy Policy</a>.<br>
  We store only what's needed to control your car. We never sell your data.
</p>
</body></html>`);
});

app.get('/privacy', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Privacy Policy \u2014 Omi Connect</title>
<style>body{font-family:-apple-system,sans-serif;background:#000;color:#ccc;max-width:680px;margin:0 auto;padding:60px 24px;line-height:1.7}h1{color:#fff;font-size:1.8em}h2{color:#e2001a;font-size:1.1em;margin-top:32px}a{color:#e2001a}p,li{color:#aaa;font-size:.95em}.back{display:inline-block;margin-bottom:32px;color:#666;text-decoration:none;font-size:.9em}</style></head>
<body>
<a href="/" class="back">\u2190 Back</a>
<h1>Privacy Policy</h1>
<p><strong>Last updated: March 2026</strong></p>
<p>Omi Connect ("we", "our", "the app") is a voice control integration for Tesla vehicles, built for the Omi AI wearable. This policy explains what data we collect, how we use it, and how we protect it.</p>

<h2>What We Collect</h2>
<ul>
  <li><strong>Your Omi user ID</strong> \u2014 provided by the Omi platform when you install the app. Used to link your Tesla account to your Omi device.</li>
  <li><strong>Tesla OAuth tokens</strong> \u2014 encrypted access and refresh tokens that authorize us to send commands to your vehicle. We never store your Tesla password.</li>
  <li><strong>Vehicle ID and VIN</strong> \u2014 required to send commands to the correct vehicle.</li>
  <li><strong>Command usage count</strong> \u2014 to enforce the free tier limit (${FREE_MONTHLY_LIMIT} commands/month).</li>
  <li><strong>Voice transcripts</strong> \u2014 we receive transcripts from Omi to detect commands. We do <strong>not</strong> store transcripts. They are processed in memory and discarded immediately.</li>
</ul>

<h2>What We Do NOT Collect</h2>
<ul>
  <li>Your name, email, or personal identity</li>
  <li>Your location or driving history</li>
  <li>Audio recordings</li>
  <li>Any data beyond what is listed above</li>
</ul>

<h2>How We Protect Your Data</h2>
<ul>
  <li>Tesla tokens are encrypted at rest using AES-256 before being written to disk.</li>
  <li>All communication uses HTTPS/TLS.</li>
  <li>OAuth state tokens expire after 10 minutes.</li>
  <li>We do not share your data with any third party except Tesla (to execute your commands) and Omi (to send you notifications).</li>
</ul>

<h2>Data Retention</h2>
<p>Your data is stored for as long as your account is active. You can request deletion at any time by contacting us. Deleting the app from Omi does not automatically delete your stored tokens \u2014 please contact us to purge your data.</p>

<h2>Third-Party Services</h2>
<ul>
  <li><strong>Tesla Fleet API</strong> \u2014 commands are sent to Tesla's servers on your behalf.</li>
  <li><strong>Omi API</strong> \u2014 notifications are delivered through Omi's platform.</li>
</ul>

<h2>Contact</h2>
<p>Questions? Email us at <a href="mailto:privacy@kawough.com">privacy@kawough.com</a> or open an issue at <a href="https://github.com/ekawough/omi-apps" target="_blank">github.com/ekawough/omi-apps</a>.</p>

<h2>Changes</h2>
<p>We may update this policy. Changes will be posted at this URL. Continued use of the app after changes constitutes acceptance.</p>
</body></html>`);
});

app.get('/auth/tesla', (req, res) => {
  const uid = req.query.uid;
  if (!uid) return res.status(400).send('Missing uid \u2014 please open this link from the Omi app.');
  const state = crypto.randomBytes(16).toString('hex');
  saveState(state, uid);
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: TESLA_CLIENT_ID,
    redirect_uri: TESLA_REDIRECT_URI,
    scope: 'openid offline_access vehicle_device_data vehicle_cmds vehicle_charging_cmds',
    state,
    audience: TESLA_AUDIENCE
  });
  res.redirect(`${TESLA_AUTH_URL}?${params}`);
});

app.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  const fail = (msg) => res.send(`<!DOCTYPE html><html><body style="background:#000;color:#fff;text-align:center;padding:60px;font-family:sans-serif"><h2>\u274c ${msg}</h2><p style="color:#888">Close this tab and try reconnecting from the Omi app.</p></body></html>`);
  const ok = (msg) => res.send(`<!DOCTYPE html><html><body style="background:#000;color:#fff;text-align:center;padding:60px;font-family:sans-serif"><h2>\u2705 ${msg}</h2><p style="color:#888">You can close this tab. Say "unlock my car" to test.</p></body></html>`);

  if (error) return fail(`Tesla auth error: ${error}`);
  if (!code || !state) return fail('Invalid callback \u2014 missing parameters.');

  const sr = getState(state);
  if (!sr) return fail('Link expired or already used. Please reconnect from the Omi app.');
  const uid = sr.uid;
  deleteState(state);

  try {
    const tr = await axios.post(TESLA_TOKEN_URL, {
      grant_type: 'authorization_code',
      client_id: TESLA_CLIENT_ID,
      client_secret: TESLA_CLIENT_SECRET,
      code,
      redirect_uri: TESLA_REDIRECT_URI,
      audience: TESLA_AUDIENCE
    });
    const { access_token, refresh_token, expires_in } = tr.data;
    const { id_s, vin } = await getVehicleInfo(access_token);
    saveUser(uid, {
      tesla_access_token: access_token,
      tesla_refresh_token: refresh_token,
      tesla_token_expiry: Math.floor(Date.now() / 1000) + expires_in,
      vehicle_id: id_s,
      vehicle_vin: vin, // store per-user VIN
      monthly_commands: 0,
      month_reset: new Date().toISOString().slice(0, 7),
      is_premium: false,
      connected_at: new Date().toISOString()
    });
    await notify(uid, '\u2705 Tesla connected! Say "unlock my car" to test.');
    return ok('Tesla connected successfully!');
  } catch (e) {
    console.error('[callback error]', e.response?.data || e.message);
    return fail('Failed to connect Tesla. Please try again.');
  }
});

app.post('/webhook', async (req, res) => {
  // Always respond 200 immediately \u2014 Omi requires fast response
  res.json({ message: 'ok' });

  try {
    const uid = req.query.uid || req.headers['x-uid'];
    if (!uid || typeof uid !== 'string' || uid.length > 128) return;

    // Rate limit
    if (isRateLimited(uid)) {
      console.log(`[webhook] rate limited: ${uid}`);
      return;
    }

    const { segments } = req.body;
    if (!segments?.length) return;

    const transcript = segments.map(s => (s.text || '')).join(' ');
    const command = detectCommand(transcript);
    if (!command) return;

    console.log(`[webhook] uid=${uid} command=${command.key} transcript="${transcript.substring(0, 80)}"`);

    const usage = checkUsage(uid);
    if (!usage.allowed) {
      if (usage.reason === 'not_connected') {
        await notify(uid, `\u26a0\ufe0f Connect your Tesla first: connect.omideveloper.com/auth/tesla?uid=${uid}`);
      } else {
        await notify(uid, `\u26a0\ufe0f Monthly limit reached (${FREE_MONTHLY_LIMIT} free commands). Upgrade at connect.omideveloper.com`);
      }
      return;
    }

    const user = getUser(uid);
    const token = await getToken(user);
    await wakeVehicle(token, user.vehicle_id);
    incrementUsage(uid);

    if (command.action === 'vehicle_data') {
      const data = await getVehicleData(token, user.vehicle_id);
      let msg = '';
      if (command.key === 'battery') {
        const c = data.charge_state;
        msg = `\ud83d\udd0b ${c.battery_level}% \u2014 ${Math.round(c.battery_range)}mi range`;
        if (c.charging_state === 'Charging') msg += ` (charging, ${c.minutes_to_full_charge}min to full)`;
      } else if (command.key === 'locate') {
        const d = data.drive_state;
        msg = `\ud83d\udccd ${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)}`;
      }
      await notify(uid, msg);
    } else {
      // Use per-user VIN (not env var) for VCP proxy
      await sendCommand(token, user.vehicle_id, user.vehicle_vin, command.action, command.params || {});
      await notify(uid, command.message);
    }
  } catch (err) {
    console.error('[webhook error]', err.message);
    try {
      const uid = req.query.uid || req.headers['x-uid'];
      if (uid) await notify(uid, `\u274c Something went wrong. Try again.`);
    } catch {}
  }
});

app.get('/status/:uid', (req, res) => {
  const uid = req.params.uid;
  if (!uid || uid.length > 128) return res.status(400).json({ error: 'invalid uid' });
  const user = getUser(uid);
  if (!user) return res.json({ connected: false });
  const month = new Date().toISOString().slice(0, 7);
  const used = user.month_reset === month ? (user.monthly_commands || 0) : 0;
  res.json({
    connected: !!user.tesla_access_token,
    is_premium: !!user.is_premium,
    commands_used: used,
    commands_remaining: user.is_premium ? 'unlimited' : Math.max(0, FREE_MONTHLY_LIMIT - used),
    connected_at: user.connected_at || null
  });
});

app.get('/disconnect/:uid', async (req, res) => {
  const uid = req.params.uid;
  if (!uid) return res.status(400).json({ error: 'missing uid' });
  const db = loadDB();
  delete db[uid];
  saveDB(db);
  res.json({ message: 'disconnected' });
});

app.get('/health', (req, res) => res.json({
  status: 'ok',
  uptime: Math.round(process.uptime()),
  version: require('./package.json').version || '1.0.0'
}));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'not found' }));

app.listen(PORT, () => console.log(`[startup] Omi Connect v1.0.0 running on port ${PORT}`));
