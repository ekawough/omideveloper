// ============================================================
// OMI CONNECT — TESLA
// Railway Webhook Server — Production
// ============================================================
// Stack: Railway (this) + Vercel (frontend) + Supabase (sessions)
//        + VPS (Tesla VCP proxy at port 4443 — never moves)
//
// Wake word: "Tesla, [command]"
// Examples: "Tesla, unlock my car"
//           "Tesla, open the trunk"  
//           "Tesla, start climate"
// ============================================================

const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ── ENV VARS (set in Railway dashboard) ─────────────────────
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;
const TESLA_CLIENT_ID = process.env.TESLA_CLIENT_ID;
const TESLA_CLIENT_SECRET = process.env.TESLA_CLIENT_SECRET;
const OMI_API_KEY = process.env.OMI_API_KEY;

// VPS Tesla VCP Proxy — this never changes
// The proxy runs on your VPS at port 4443 and signs all commands
const VCP_PROXY = process.env.VCP_PROXY_URL || 'https://connect.omideveloper.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================================
// WAKE WORD DETECTION
// User must say "Tesla" first before any command fires
// Just like "Hey Siri" or "Alexa"
// ============================================================
function hasTeslaWakeWord(text) {
  const normalized = text.toLowerCase().trim();
  // Accept: "Tesla", "Hey Tesla", "Ok Tesla", "Yo Tesla"
  return /\b(hey\s+)?tesla\b/i.test(normalized) ||
         /\b(ok\s+)?tesla\b/i.test(normalized) ||
         /\byo\s+tesla\b/i.test(normalized);
}

function stripWakeWord(text) {
  return text
    .replace(/\b(hey\s+|ok\s+|yo\s+)?tesla[,.]?\s*/i, '')
    .trim();
}

// ============================================================
// COMMAND MAP — what fires after wake word detected
// ============================================================
const COMMANDS = {
  // UNLOCK
  'unlock': { cmd: 'door_unlock', msg: '🔓 Unlocked.' },
  'unlock my car': { cmd: 'door_unlock', msg: '🔓 Unlocked.' },
  'unlock the car': { cmd: 'door_unlock', msg: '🔓 Unlocked.' },
  'unlock car': { cmd: 'door_unlock', msg: '🔓 Unlocked.' },
  'open up': { cmd: 'door_unlock', msg: '🔓 Unlocked.' },
  'open the doors': { cmd: 'door_unlock', msg: '🔓 Unlocked.' },
  'open doors': { cmd: 'door_unlock', msg: '🔓 Unlocked.' },

  // LOCK
  'lock': { cmd: 'door_lock', msg: '🔒 Locked.' },
  'lock up': { cmd: 'door_lock', msg: '🔒 Locked.' },
  'lock it': { cmd: 'door_lock', msg: '🔒 Locked.' },
  'lock the car': { cmd: 'door_lock', msg: '🔒 Locked.' },
  'lock my car': { cmd: 'door_lock', msg: '🔒 Locked.' },
  'lock car': { cmd: 'door_lock', msg: '🔒 Locked.' },
  'lock it up': { cmd: 'door_lock', msg: '🔒 Locked.' },

  // TRUNK
  'open trunk': { cmd: 'actuate_trunk', params: { which_trunk: 'rear' }, msg: '🧳 Trunk open.' },
  'open the trunk': { cmd: 'actuate_trunk', params: { which_trunk: 'rear' }, msg: '🧳 Trunk open.' },
  'close trunk': { cmd: 'actuate_trunk', params: { which_trunk: 'rear' }, msg: '🧳 Trunk closed.' },
  'close the trunk': { cmd: 'actuate_trunk', params: { which_trunk: 'rear' }, msg: '🧳 Trunk closed.' },
  'pop trunk': { cmd: 'actuate_trunk', params: { which_trunk: 'rear' }, msg: '🧳 Trunk popped.' },
  'pop the trunk': { cmd: 'actuate_trunk', params: { which_trunk: 'rear' }, msg: '🧳 Trunk popped.' },

  // FRUNK
  'open frunk': { cmd: 'actuate_trunk', params: { which_trunk: 'front' }, msg: '📦 Frunk open.' },
  'open the frunk': { cmd: 'actuate_trunk', params: { which_trunk: 'front' }, msg: '📦 Frunk open.' },
  'pop frunk': { cmd: 'actuate_trunk', params: { which_trunk: 'front' }, msg: '📦 Frunk popped.' },
  'pop the frunk': { cmd: 'actuate_trunk', params: { which_trunk: 'front' }, msg: '📦 Frunk popped.' },

  // CLIMATE
  'start climate': { cmd: 'auto_conditioning_start', msg: '❄️ Climate on.' },
  'turn on climate': { cmd: 'auto_conditioning_start', msg: '❄️ Climate on.' },
  'climate on': { cmd: 'auto_conditioning_start', msg: '❄️ Climate on.' },
  'start ac': { cmd: 'auto_conditioning_start', msg: '❄️ AC on.' },
  'turn on ac': { cmd: 'auto_conditioning_start', msg: '❄️ AC on.' },
  'ac on': { cmd: 'auto_conditioning_start', msg: '❄️ AC on.' },
  'heat the car': { cmd: 'auto_conditioning_start', msg: '🔥 Heating on.' },
  'heat up': { cmd: 'auto_conditioning_start', msg: '🔥 Heating on.' },
  'warm up': { cmd: 'auto_conditioning_start', msg: '🔥 Warming up.' },
  'cool down': { cmd: 'auto_conditioning_start', msg: '❄️ Cooling on.' },
  'precondition': { cmd: 'auto_conditioning_start', msg: '❄️ Preconditioning.' },
  'stop climate': { cmd: 'auto_conditioning_stop', msg: '⏹ Climate off.' },
  'turn off climate': { cmd: 'auto_conditioning_stop', msg: '⏹ Climate off.' },
  'climate off': { cmd: 'auto_conditioning_stop', msg: '⏹ Climate off.' },
  'turn off ac': { cmd: 'auto_conditioning_stop', msg: '⏹ AC off.' },
  'ac off': { cmd: 'auto_conditioning_stop', msg: '⏹ AC off.' },

  // CHARGING
  'start charging': { cmd: 'charge_start', msg: '⚡ Charging started.' },
  'charge': { cmd: 'charge_start', msg: '⚡ Charging started.' },
  'charge it': { cmd: 'charge_start', msg: '⚡ Charging started.' },
  'begin charging': { cmd: 'charge_start', msg: '⚡ Charging started.' },
  'stop charging': { cmd: 'charge_stop', msg: '⏹ Charging stopped.' },
  'end charging': { cmd: 'charge_stop', msg: '⏹ Charging stopped.' },
  'open charge port': { cmd: 'charge_port_door_open', msg: '🔌 Charge port open.' },
  'open charging port': { cmd: 'charge_port_door_open', msg: '🔌 Charge port open.' },
  'close charge port': { cmd: 'charge_port_door_close', msg: '🔌 Charge port closed.' },
  'close charging port': { cmd: 'charge_port_door_close', msg: '🔌 Charge port closed.' },

  // ALERTS
  'flash lights': { cmd: 'flash_lights', msg: '💡 Lights flashed.' },
  'flash the lights': { cmd: 'flash_lights', msg: '💡 Lights flashed.' },
  'find my car': { cmd: 'flash_lights', msg: '💡 Flashing to find your car.' },
  'where are you': { cmd: 'flash_lights', msg: '💡 Flashing to find your car.' },
  'honk': { cmd: 'honk_horn', msg: '📣 Honked.' },
  'honk horn': { cmd: 'honk_horn', msg: '📣 Honked.' },
  'honk the horn': { cmd: 'honk_horn', msg: '📣 Honked.' },
  'beep': { cmd: 'honk_horn', msg: '📣 Honked.' },
};

function matchCommand(text) {
  const clean = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Direct match
  if (COMMANDS[clean]) return COMMANDS[clean];

  // Substring match
  for (const [phrase, command] of Object.entries(COMMANDS)) {
    if (clean.includes(phrase)) return command;
  }
  return null;
}

// ============================================================
// AI INTENT — natural speech after wake word
// "Tesla, my hands are full" → unlock
// "Tesla, it's freezing" → climate on
// ============================================================
async function detectIntent(text) {
  if (!ANTHROPIC_API_KEY) return null;

  const res = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      system: `Tesla voice command detector. User already said "Tesla" as wake word.
Respond ONLY with JSON. No other text.

If command detected: {"cmd":"COMMAND","params":{},"msg":"Short confirmation."}
If unclear: {"cmd":null}

Commands: door_unlock, door_lock, 
actuate_trunk (params: {"which_trunk":"rear"} or {"which_trunk":"front"}),
auto_conditioning_start, auto_conditioning_stop,
charge_start, charge_stop, charge_port_door_open, charge_port_door_close,
flash_lights, honk_horn

Context clues:
- hands full / carrying things / approaching = door_unlock
- leaving / walking away / done = door_lock  
- loading bags / groceries / stuff in back = actuate_trunk rear
- it's hot/cold / freezing / burning up = auto_conditioning_start
- parking lot / can't find car = flash_lights`,
      messages: [{ role: 'user', content: `"${text}"` }],
    },
    {
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
    }
  );

  const result = JSON.parse(res.data.content[0].text.trim());
  if (!result.cmd) return null;

  return {
    cmd: result.cmd,
    params: result.params || {},
    msg: result.msg || 'Done.',
  };
}

// ============================================================
// EXECUTE TESLA COMMAND
// Routes through VCP proxy on VPS — the proxy signs the command
// This is the same proxy already running at connect.omideveloper.com
// ============================================================
async function executeCommand(session, commandName, params = {}) {
  const { access_token, vin } = session;

  // Wake vehicle first
  try {
    await axios.post(
      `${VCP_PROXY}/api/1/vehicles/${vin}/wake_up`,
      {},
      {
        headers: { Authorization: `Bearer ${access_token}` },
        timeout: 8000,
      }
    );
    await new Promise(r => setTimeout(r, 2500));
  } catch {
    // Already awake — continue
  }

  // Fire command through VCP proxy (same proxy your working app uses)
  const res = await axios.post(
    `${VCP_PROXY}/api/1/vehicles/${vin}/command/${commandName}`,
    params,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );

  return res.data;
}

// ============================================================
// SUPABASE — session management
// ============================================================
async function getSession(uid) {
  const { data, error } = await supabase
    .from('tesla_sessions')
    .select('*')
    .eq('uid', uid)
    .single();

  if (error || !data) return null;
  return data;
}

// ============================================================
// NOTIFY USER via Omi push notification
// ============================================================
async function notify(uid, message) {
  if (!OMI_API_KEY) return;
  try {
    await axios.post(
      `https://api.omi.me/v1/apps/notify`,
      { uid, message },
      {
        headers: {
          Authorization: `Bearer ${OMI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    // Notifications are best-effort
    console.log(`[notify] failed: ${err.message}`);
  }
}

// ============================================================
// RATE LIMITING — 20 requests per 30 seconds per uid
// ============================================================
const rateLimits = new Map();
function isRateLimited(uid) {
  const now = Date.now();
  const window = 30000;
  const max = 20;
  const calls = (rateLimits.get(uid) || []).filter(t => now - t < window);
  calls.push(now);
  rateLimits.set(uid, calls);
  return calls.length > max;
}

// ============================================================
// DEDUPLICATION — 5 second cooldown per command per session
// ============================================================
const recentCmds = new Map();
function isDuplicate(sessionId, cmd) {
  const key = `${sessionId}:${cmd}`;
  const last = recentCmds.get(key);
  if (!last) return false;
  if (Date.now() - last < 5000) return true;
  return false;
}
function markCmd(sessionId, cmd) {
  recentCmds.set(`${sessionId}:${cmd}`, Date.now());
}

// ============================================================
// MAIN WEBHOOK
// Omi sends real-time transcript segments here
// POST /webhook?uid=USER_ID&session_id=SESSION_ID
// ============================================================
app.post('/webhook', async (req, res) => {
  // Always respond instantly — never block Omi transcription
  res.status(200).json({ status: 'ok' });

  const uid = req.query.uid;
  const sessionId = req.query.session_id || uid;
  const body = req.body;

  if (!uid) return;

  // Handle both real-time segments (array) and post-conversation (object)
  let segments = [];
  if (Array.isArray(body)) {
    segments = body;
  } else if (body?.transcript_segments) {
    segments = body.transcript_segments;
  } else if (body?.segments) {
    segments = body.segments;
  }

  if (segments.length === 0) return;
  if (isRateLimited(uid)) {
    console.log(`[rate limited] uid=${uid}`);
    return;
  }

  const fullText = segments.map(s => s.text || '').join(' ').trim();
  if (!fullText || fullText.length < 3) return;

  // ── WAKE WORD CHECK ─────────────────────────────────────
  // Must say "Tesla" before any command fires
  if (!hasTeslaWakeWord(fullText)) return;

  const commandText = stripWakeWord(fullText);
  if (!commandText) return;

  console.log(`[wake] uid=${uid} | "${fullText}"`);
  console.log(`[cmd text] "${commandText}"`);

  try {
    let commandName = null;
    let commandParams = {};
    let confirmMsg = '';

    // Tier 1: exact match
    const exact = matchCommand(commandText);
    if (exact) {
      commandName = exact.cmd;
      commandParams = exact.params || {};
      confirmMsg = exact.msg;
      console.log(`[exact] ${commandName}`);
    }

    // Tier 2: AI intent
    if (!commandName) {
      const ai = await detectIntent(commandText);
      if (ai) {
        commandName = ai.cmd;
        commandParams = ai.params || {};
        confirmMsg = ai.msg;
        console.log(`[ai] ${commandName}`);
      }
    }

    if (!commandName) {
      console.log(`[no match] "${commandText}"`);
      return;
    }

    // Deduplicate
    if (isDuplicate(sessionId, commandName)) {
      console.log(`[skip] duplicate ${commandName}`);
      return;
    }
    markCmd(sessionId, commandName);

    // Get session from Supabase
    const session = await getSession(uid);
    if (!session) {
      console.log(`[no session] uid=${uid} not connected`);
      await notify(uid, '⚠️ Tesla not connected. Open Omi Connect to set up.');
      return;
    }

    // Execute command through VCP proxy
    const result = await executeCommand(session, commandName, commandParams);
    console.log(`[success] uid=${uid} | ${commandName} | ${JSON.stringify(result)}`);

    // Log to Supabase
    await supabase.from('command_log').insert({
      uid,
      command: commandName,
      trigger_text: fullText,
      success: true,
      created_at: new Date().toISOString(),
    });

    // Push notification to Omi
    await notify(uid, confirmMsg);

  } catch (err) {
    console.error(`[error] uid=${uid} | ${err.message}`);
    await supabase.from('command_log').insert({
      uid,
      command: 'unknown',
      trigger_text: fullText,
      success: false,
      error: err.message,
      created_at: new Date().toISOString(),
    }).catch(() => {});
  }
});

// ============================================================
// SESSION STORE — called by Vercel after Tesla OAuth
// POST /session
// ============================================================
app.post('/session', async (req, res) => {
  const { uid, access_token, refresh_token, expires_in, vin, vehicle_name, secret } = req.body;

  if (secret !== INTERNAL_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const expires_at = new Date(Date.now() + (expires_in || 28800) * 1000).toISOString();

  const { error } = await supabase.from('tesla_sessions').upsert({
    uid,
    access_token,
    refresh_token,
    expires_at,
    vin,
    vehicle_name: vehicle_name || 'My Tesla',
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[session] Supabase error:', error);
    return res.status(500).json({ error: 'Failed to store session' });
  }

  console.log(`[session] stored uid=${uid} vin=${vin}`);
  res.json({ status: 'ok' });
});

// ============================================================
// SETUP CHECK — Omi calls this to verify user connected
// GET /setup-check?uid=USER_ID
// ============================================================
app.get('/setup-check', async (req, res) => {
  const uid = req.query.uid;
  if (!uid) return res.json({ is_setup_completed: false });

  const session = await getSession(uid);
  res.json({ is_setup_completed: !!session });
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.floor(process.uptime()), version: '2.0.0' });
});

app.listen(PORT, () => {
  console.log(`Omi Connect Tesla running on :${PORT}`);
});
