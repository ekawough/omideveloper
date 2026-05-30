// SalesSignal webhook — Omi audio receiver + Deepgram streaming bridge.
//
// Gotchas handled:
//   • Omi sends raw PCM16 bytes, NOT base64. express.raw({ type: '*/*' }).
//   • Respond 200 immediately; Omi drops the device if we're slow.
//   • 30s idle timeout = end of conversation (no explicit signal from Omi).
//   • keepAlive every 3s so Deepgram doesn't close the stream.
//   • Deepgram SDK v5: use `new DeepgramClient(key)`, NOT createClient.

import express from 'express';
import rateLimit from 'express-rate-limit';
import { createClient as createSupabase } from '@supabase/supabase-js';
import { DeepgramSession } from './deepgram.js';
import fetch from 'node-fetch';

// ---- config ----------------------------------------------------------------
const PORT              = Number(process.env.PORT || 3000);
const WEBHOOK_TOKEN     = process.env.WEBHOOK_TOKEN || '';
const SUPABASE_URL      = process.env.SUPABASE_URL || '';
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const AGENT_PIPELINE_URL = process.env.AGENT_PIPELINE_URL || 'http://localhost:8000';
const IDLE_TIMEOUT_MS   = Number(process.env.IDLE_TIMEOUT_MS || 30_000);
const MAX_SESSION_MS    = Number(process.env.MAX_SESSION_MS  || 20 * 60_000);

if (!WEBHOOK_TOKEN) console.warn('[warn] WEBHOOK_TOKEN not set — open endpoint');
if (!SUPABASE_URL || !SUPABASE_KEY) console.warn('[warn] Supabase not configured');

const supabase = SUPABASE_URL
  ? createSupabase(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
  : null;

// ---- per-uid session map ---------------------------------------------------
/** @type {Map<string, SessionState>} */
const sessions = new Map();

/**
 * @typedef SessionState
 * @property {string} uid           Omi device uid
 * @property {string} sessionId     Supabase sessions.id
 * @property {DeepgramSession} dg   active Deepgram streaming client
 * @property {Buffer[]} audioChunks full-fidelity PCM16 for emotion analysis
 * @property {number} bytesReceived
 * @property {NodeJS.Timeout} idleTimer
 * @property {NodeJS.Timeout} maxTimer
 * @property {number} startedAt
 * @property {number} lastChunkAt
 * @property {number} sampleRate
 */

async function getOrCreateSession(uid, sampleRate) {
  let s = sessions.get(uid);
  if (s) return s;

  // Create Supabase row up-front so the admin panel sees `active`.
  let sessionId = null;
  if (supabase) {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ status: 'active' })
      .select('id')
      .single();
    if (error) console.error('[supabase] insert session failed:', error.message);
    else sessionId = data.id;
  }

  const dg = new DeepgramSession({
    apiKey: process.env.DEEPGRAM_API_KEY || '',
    sampleRate,
    onTranscript: (t) => console.log(`[dg ${uid}] ${t.speaker ?? '?'}: ${t.text}`),
    onError:      (e) => console.error(`[dg ${uid}] error:`, e),
  });
  await dg.start();

  s = {
    uid,
    sessionId,
    dg,
    audioChunks: [],
    bytesReceived: 0,
    idleTimer: null,
    maxTimer: null,
    startedAt: Date.now(),
    lastChunkAt: Date.now(),
    sampleRate,
  };

  s.maxTimer = setTimeout(() => endSession(uid, 'max_duration'), MAX_SESSION_MS);
  resetIdle(s);
  sessions.set(uid, s);

  console.log(`[session] start uid=${uid} sessionId=${sessionId} sr=${sampleRate}`);
  return s;
}

function resetIdle(s) {
  if (s.idleTimer) clearTimeout(s.idleTimer);
  s.idleTimer = setTimeout(() => endSession(s.uid, 'idle'), IDLE_TIMEOUT_MS);
}

async function endSession(uid, reason) {
  const s = sessions.get(uid);
  if (!s) return;
  sessions.delete(uid);

  if (s.idleTimer) clearTimeout(s.idleTimer);
  if (s.maxTimer)  clearTimeout(s.maxTimer);

  console.log(`[session] end uid=${uid} reason=${reason} bytes=${s.bytesReceived}`);

  // Flush Deepgram and collect final transcript.
  const dgResult = await s.dg.finish().catch((e) => {
    console.error(`[dg] finish error: ${e?.message}`);
    return { transcript: '', segments: [], sentiment: null };
  });

  // Combine audio buffer for emotion analysis / batch sentiment.
  const audioBuf = Buffer.concat(s.audioChunks);

  // Mark processing, then kick the agent pipeline.
  if (supabase && s.sessionId) {
    await supabase
      .from('sessions')
      .update({
        status: 'processing',
        transcript: dgResult.transcript,
        sentiment_scores: dgResult.sentiment,
      })
      .eq('id', s.sessionId);
  }

  // Upload audio to Supabase Storage (best-effort).
  let audioPath = null;
  if (supabase && audioBuf.length) {
    audioPath = `sessions/${s.sessionId || uid}/${Date.now()}.pcm16`;
    const { error } = await supabase.storage
      .from('audio-recordings')
      .upload(audioPath, audioBuf, {
        contentType: 'application/octet-stream',
        upsert: true,
      });
    if (error) console.error('[storage] upload failed:', error.message);
  }

  // Dispatch to the agent pipeline. Do not await forever — fire and log.
  try {
    const resp = await fetch(`${AGENT_PIPELINE_URL}/process`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        session_id: s.sessionId,
        uid,
        transcript: dgResult.transcript,
        segments: dgResult.segments,
        deepgram_sentiment: dgResult.sentiment,
        audio_path: audioPath,
        sample_rate: s.sampleRate,
        duration_ms: Date.now() - s.startedAt,
      }),
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      console.error(`[agent] pipeline ${resp.status}: ${body.slice(0, 400)}`);
    }
  } catch (e) {
    console.error('[agent] dispatch failed:', e.message);
    if (supabase && s.sessionId) {
      await supabase
        .from('sessions')
        .update({ status: 'error', error_message: `dispatch: ${e.message}` })
        .eq('id', s.sessionId);
    }
  }
}

// ---- PCM sanity check ------------------------------------------------------
function pcmLooksValid(buf) {
  // PCM16 = 2 bytes per sample.
  if (!buf.length || buf.length % 2 !== 0) return false;
  // Compute RMS over int16 samples to reject pure-silence nonsense.
  let sumSq = 0;
  const samples = buf.length / 2;
  const limit = Math.min(samples, 2000);
  for (let i = 0; i < limit; i++) {
    const v = buf.readInt16LE(i * 2);
    sumSq += v * v;
  }
  const rms = Math.sqrt(sumSq / limit);
  return rms >= 1; // very permissive; anything below is likely broken framing
}

// ---- express app -----------------------------------------------------------
const app = express();
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 60_000,
  limit: 1200,            // Omi sends ~12 chunks/min per device; plenty of headroom
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);

// Health check for Railway.
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    sessions: sessions.size,
    uptime_s: Math.floor(process.uptime()),
  });
});

// Omi audio webhook. Omi sends raw PCM16 bytes as application/octet-stream.
app.post(
  '/webhook/audio',
  express.raw({ type: '*/*', limit: '5mb' }),
  async (req, res) => {
    try {
      // 1. Auth via query token.
      if (WEBHOOK_TOKEN && req.query.token !== WEBHOOK_TOKEN) {
        return res.status(401).json({ error: 'unauthorized' });
      }

      // 2. Required query params from Omi.
      const uid = String(req.query.uid || '').trim();
      const sampleRate = Number(req.query.sample_rate || 16_000);
      if (!uid) return res.status(400).json({ error: 'missing uid' });

      const buf = req.body;
      if (!Buffer.isBuffer(buf) || !buf.length) {
        return res.status(400).json({ error: 'empty body' });
      }

      if (!pcmLooksValid(buf)) {
        console.warn(`[webhook] invalid PCM uid=${uid} bytes=${buf.length}`);
        // Don't 400 — Omi retries on failures and will flood us.
        return res.status(200).json({ ok: true, dropped: true });
      }

      // 3. ACK Omi immediately, process async.
      res.status(200).json({ ok: true });

      // 4. Feed chunk into session.
      const s = await getOrCreateSession(uid, sampleRate);
      s.audioChunks.push(buf);
      s.bytesReceived += buf.length;
      s.lastChunkAt = Date.now();
      resetIdle(s);

      s.dg.send(buf);
    } catch (e) {
      console.error('[webhook] fatal:', e);
      // Only send if we haven't already responded.
      if (!res.headersSent) res.status(500).json({ error: 'internal' });
    }
  },
);

// Manual end-of-conversation endpoint (memory_created webhook from Omi app).
app.post('/webhook/end', express.json(), async (req, res) => {
  if (WEBHOOK_TOKEN && req.query.token !== WEBHOOK_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const uid = String(req.body?.uid || req.query.uid || '').trim();
  if (!uid) return res.status(400).json({ error: 'missing uid' });
  await endSession(uid, 'manual');
  res.json({ ok: true });
});

// Graceful shutdown — flush any in-flight sessions.
async function shutdown() {
  console.log('[shutdown] flushing', sessions.size, 'sessions');
  await Promise.all([...sessions.keys()].map((uid) => endSession(uid, 'shutdown')));
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);

// Bind 0.0.0.0 for Railway.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[webhook] listening on 0.0.0.0:${PORT}`);
});
