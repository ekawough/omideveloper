const express = require('express');
const { WebSocketServer } = require('ws');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('@notionhq/client');
const http = require('http');
const { Readable } = require('stream');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/audio' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const AUDIO_LOG_PAGE = process.env.NOTION_AUDIO_LOG_PAGE || '33b14f5176d081b4b6caf98de3f5104f';
const APP_URL = process.env.APP_URL || 'https://audio.omideveloper.com';

const TARGET_DURATION_SECS = 45;
const SILENCE_THRESHOLD = 300;
const SPEECH_RATIO_MIN = 0.3;
const DEFAULT_SAMPLE_RATE = 16000;

// uid -> { chunks, totalSamples, sampleRate, startTime }
const sessions = new Map();

// ─── Google OAuth (per-user) ──────────────────────────────────────────────────

function makeOAuth2() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

async function loadTokens(uid) {
  const { data } = await supabase
    .from('audio_vault_tokens')
    .select('tokens')
    .eq('uid', uid)
    .single();
  return data?.tokens || null;
}

async function saveTokens(uid, tokens) {
  await supabase.from('audio_vault_tokens').upsert(
    { uid, tokens, updated_at: new Date().toISOString() },
    { onConflict: 'uid' }
  );
}

async function getAuthedDrive(uid) {
  const tokens = await loadTokens(uid);
  if (!tokens) throw new Error('No Google tokens for uid=' + uid);
  const auth = makeOAuth2();
  auth.setCredentials(tokens);
  auth.on('tokens', async (fresh) => saveTokens(uid, { ...tokens, ...fresh }));
  return google.drive({ version: 'v3', auth });
}

// ─── VAD ─────────────────────────────────────────────────────────────────────

function hasSpeech(pcmBuf) {
  const frameSize = 160;
  let speech = 0, total = 0;
  for (let i = 0; i < pcmBuf.length - frameSize * 2; i += frameSize * 2) {
    let sq = 0;
    for (let j = i; j < i + frameSize * 2; j += 2) {
      const s = pcmBuf.readInt16LE(j);
      sq += s * s;
    }
    if (Math.sqrt(sq / frameSize) > SILENCE_THRESHOLD) speech++;
    total++;
  }
  return total > 0 && speech / total >= SPEECH_RATIO_MIN;
}

// ─── WAV ──────────────────────────────────────────────────────────────────────

function pcmToWav(pcm, sampleRate) {
  const ch = 1, bps = 16;
  const buf = Buffer.alloc(44 + pcm.length);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + pcm.length, 4);
  buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(ch, 22); buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * ch * bps / 8, 28);
  buf.writeUInt16LE(ch * bps / 8, 32); buf.writeUInt16LE(bps, 34);
  buf.write('data', 36); buf.writeUInt32LE(pcm.length, 40);
  pcm.copy(buf, 44);
  return buf;
}

// ─── Drive upload ─────────────────────────────────────────────────────────────

async function getOrCreateFolder(drive, name, parentId) {
  const q = `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
  const res = await drive.files.list({ q, fields: 'files(id)' });
  if (res.data.files.length) return res.data.files[0].id;
  const f = await drive.files.create({
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
    fields: 'id'
  });
  return f.data.id;
}

async function uploadToDrive(uid, wavBuf, filename, date) {
  const drive = await getAuthedDrive(uid);
  const dateStr = date.toISOString().split('T')[0];

  const rootRes = await drive.files.list({
    q: "name='Omi Audio' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false",
    fields: 'files(id)'
  });
  const rootId = rootRes.data.files.length
    ? rootRes.data.files[0].id
    : (await drive.files.create({ requestBody: { name: 'Omi Audio', mimeType: 'application/vnd.google-apps.folder' }, fields: 'id' })).data.id;

  const folderId = await getOrCreateFolder(drive, dateStr, rootId);

  const stream = new Readable();
  stream.push(wavBuf);
  stream.push(null);

  const file = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType: 'audio/wav', body: stream },
    fields: 'id, webViewLink'
  });
  return file.data.webViewLink;
}

// ─── Flush session to Drive ───────────────────────────────────────────────────

async function flushSession(uid, session) {
  if (!session.chunks.length) return;
  const durationSecs = Math.round(session.totalSamples / session.sampleRate);
  if (durationSecs < 5) return;

  const combined = Buffer.concat(session.chunks);
  const wav = pcmToWav(combined, session.sampleRate);
  const now = new Date();
  const filename = 'voice_' + now.toISOString().replace(/[:.]/g, '-').slice(0, 19) + '.wav';

  try {
    const driveUrl = await uploadToDrive(uid, wav, filename, now);
    await updateSummary(uid, now, durationSecs, driveUrl);
    console.log('[AUDIO] Saved ' + filename + ' (' + durationSecs + 's) uid=' + uid);
  } catch (err) {
    console.error('[AUDIO] Flush error uid=' + uid + ':', err.message);
  }
}

// ─── Daily summary ────────────────────────────────────────────────────────────

async function updateSummary(uid, date, durationSecs, driveUrl) {
  const dateStr = date.toISOString().split('T')[0];
  const { data } = await supabase
    .from('audio_vault_summary')
    .select('total_secs, clips')
    .eq('uid', uid).eq('date', dateStr)
    .single()
    .catch(() => ({ data: null }));

  const totalSecs = (data?.total_secs || 0) + durationSecs;
  const clips = (data?.clips || 0) + 1;

  await supabase.from('audio_vault_summary').upsert(
    { uid, date: dateStr, total_secs: totalSecs, clips, last_drive_url: driveUrl, updated_at: new Date().toISOString() },
    { onConflict: 'uid,date' }
  );

  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const goalPct = Math.min(100, Math.round((totalSecs / 1800) * 100));
  const line = `${dateStr} — ${mins}m ${secs}s (${clips} clips) — ${goalPct}% of 30min goal`;

  await notion.blocks.children.append({
    block_id: AUDIO_LOG_PAGE,
    children: [{ object: 'block', type: 'paragraph', paragraph: {
      rich_text: [{ type: 'text', text: { content: line, link: driveUrl ? { url: driveUrl } : null } }]
    }}]
  }).catch(e => console.log('[AUDIO] Notion error:', e.message));
}

// ─── WebSocket ────────────────────────────────────────────────────────────────

wss.on('connection', (ws, req) => {
  const params = new URL(req.url, 'http://x').searchParams;
  const uid = params.get('uid') || 'default';
  const sampleRate = parseInt(params.get('sample_rate')) || DEFAULT_SAMPLE_RATE;

  if (!sessions.has(uid)) {
    sessions.set(uid, { chunks: [], totalSamples: 0, sampleRate, startTime: new Date() });
  }
  console.log('[WS] Connected uid=' + uid);

  ws.on('message', (data) => {
    if (!Buffer.isBuffer(data)) return;
    if (!hasSpeech(data)) return;

    const s = sessions.get(uid);
    s.chunks.push(data);
    s.totalSamples += data.length / 2;

    if (s.totalSamples / s.sampleRate >= TARGET_DURATION_SECS) {
      const toFlush = { chunks: s.chunks, totalSamples: s.totalSamples, sampleRate: s.sampleRate };
      sessions.set(uid, { chunks: [], totalSamples: 0, sampleRate, startTime: new Date() });
      flushSession(uid, toFlush);
    }
  });

  ws.on('close', () => {
    console.log('[WS] Disconnected uid=' + uid);
    const s = sessions.get(uid);
    if (s?.chunks.length) {
      flushSession(uid, { ...s });
      sessions.set(uid, { chunks: [], totalSamples: 0, sampleRate, startTime: new Date() });
    }
  });

  ws.on('error', (err) => console.error('[WS] Error uid=' + uid + ':', err.message));
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/auth/google', (req, res) => {
  const uid = req.query.uid;
  if (!uid) return res.status(400).send('Missing uid');
  const url = makeOAuth2().generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
    prompt: 'consent',
    state: uid
  });
  res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
  const { state: uid, code } = req.query;
  if (!uid || !code) return res.status(400).send('Invalid callback');
  try {
    const { tokens } = await makeOAuth2().getToken(code);
    await saveTokens(uid, tokens);
    res.send(`<!DOCTYPE html><html><head><title>Connected!</title>
<style>body{font-family:-apple-system,sans-serif;max-width:500px;margin:60px auto;padding:20px;background:#0a0a0a;color:#fff;text-align:center;}</style>
</head><body><h1>✅ Connected!</h1>
<p>Your Google Drive is linked to Omi Voice Vault.</p>
<p style="color:#aaa;">Start speaking while wearing Omi — clips will save automatically.</p>
<p style="color:#666;font-size:12px;">You can close this tab.</p></body></html>`);
  } catch (err) { res.status(500).send('Auth failed: ' + err.message); }
});

app.get('/status', async (req, res) => {
  const uid = req.query.uid;
  if (!uid) return res.json({ error: 'Missing uid' });
  const tokens = await loadTokens(uid);
  const s = sessions.get(uid);
  res.json({
    authorized: !!tokens,
    buffered_secs: s ? Math.round(s.totalSamples / s.sampleRate) : 0,
    ws_url: 'wss://' + req.hostname + '/audio?uid=' + uid
  });
});

app.get('/', (req, res) => {
  const uid = req.query.uid || '';
  res.send(`<!DOCTYPE html><html>
<head><title>Omi Voice Vault</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:-apple-system,sans-serif;max-width:600px;margin:40px auto;padding:20px;background:#0a0a0a;color:#fff;}
h1{font-size:28px;margin-bottom:8px;}.btn{display:block;width:100%;padding:16px;background:#2563eb;color:#fff;border:none;border-radius:12px;font-size:16px;cursor:pointer;text-decoration:none;text-align:center;margin:20px 0;}
p{color:#aaa;line-height:1.6;}.box{background:#111;border-radius:12px;padding:16px;margin:12px 0;}.box h3{margin:0 0 4px;font-size:14px;color:#666;}</style>
</head><body>
<h1>🎙️ Omi Voice Vault</h1>
<p>Captures your voice from Omi, filters silence, and uploads clean WAV clips to your Google Drive.</p>
${uid
  ? `<a href="/auth/google?uid=${uid}" class="btn">Connect Google Drive</a>`
  : '<p style="color:#f87171;">Open from the Omi app to connect your Drive.</p>'}
<div class="box"><h3>HOW IT WORKS</h3><p style="font-size:14px;">Buffers 45s of real speech, skips silence automatically, saves WAV to Google Drive by date — ready for ElevenLabs voice cloning.</p></div>
<div class="box"><h3>VERSION</h3><p style="font-size:18px;font-weight:bold;color:#fff;">v3.0.0</p></div>
</body></html>`);
});

app.get('/health', (req, res) => res.json({
  status: 'ok',
  ws_connections: wss.clients.size,
  active_sessions: sessions.size,
  uptime: Math.floor(process.uptime())
}));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log('[AUDIO] Voice Vault v3.0.0 on port ' + PORT));
