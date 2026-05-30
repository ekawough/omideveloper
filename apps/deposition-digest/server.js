require('dotenv').config();
const express = require('express');
const { processDeposition } = require('./processor');
const { buildHtmlReport } = require('./formatter');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json({ limit: '10mb' }));

// In-memory session store (swap for Supabase in prod)
const sessions = new Map();

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', app: 'Deposition Digest', version: '1.0.0' });
});

// ── Omi webhook: transcript_processed ────────────────────────────────────────
// Omi fires this after each silence-bounded speech segment
app.post('/webhook', async (req, res) => {
  // Respond immediately — Omi times out at 10s
  res.json({ received: true });

  const body = req.body;

  // Pull transcript from Omi payload
  const transcript = body?.segments
    ?.map(s => s.text?.trim())
    .filter(Boolean)
    .join(' ') || body?.transcript || '';

  if (!transcript || transcript.length < 20) return;

  const sessionId = body?.session_id || body?.memory_id || 'default';
  const uid       = body?.uid || 'unknown';

  // Accumulate segments into a running session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      id:         sessionId,
      uid,
      segments:   [],
      startedAt:  new Date().toISOString(),
      caseLabel:  null,
    });
  }

  const session = sessions.get(sessionId);
  session.segments.push({
    text:      transcript,
    timestamp: body?.created_at || new Date().toISOString(),
  });

  console.log(`[${sessionId}] +${transcript.length} chars — total segments: ${session.segments.length}`);
});

// ── Generate report for a session ────────────────────────────────────────────
// POST /report { session_id, case_label }
// Returns full HTML report with timestamped transcript + flagged admissions
app.post('/report', async (req, res) => {
  const { session_id, case_label } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: 'session_id required' });
  }

  const session = sessions.get(session_id);
  if (!session || session.segments.length === 0) {
    return res.status(404).json({ error: 'No transcript found for this session' });
  }

  if (case_label) session.caseLabel = case_label;

  try {
    console.log(`[${session_id}] Generating report — ${session.segments.length} segments`);
    const analysis = await processDeposition(session);
    const html = buildHtmlReport(session, analysis);

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Report generation failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── JSON report (for integrations) ───────────────────────────────────────────
// POST /report/json { session_id, case_label }
app.post('/report/json', async (req, res) => {
  const { session_id, case_label } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: 'session_id required' });
  }

  const session = sessions.get(session_id);
  if (!session || session.segments.length === 0) {
    return res.status(404).json({ error: 'No transcript found for this session' });
  }

  if (case_label) session.caseLabel = case_label;

  try {
    const analysis = await processDeposition(session);
    res.json({ session_id, case_label, generated_at: new Date().toISOString(), analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Plain-text export (copy into case management system) ──────────────────────
app.post('/report/text', async (req, res) => {
  const { session_id, case_label } = req.body;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  const session = sessions.get(session_id);
  if (!session || session.segments.length === 0) {
    return res.status(404).json({ error: 'No transcript for this session' });
  }

  if (case_label) session.caseLabel = case_label;

  try {
    const analysis = await processDeposition(session);
    const lines = [
      `DEPOSITION DIGEST — ${case_label || session_id}`,
      `Generated: ${new Date().toLocaleString()}`,
      `${'─'.repeat(60)}`,
      '',
      `SUMMARY`,
      analysis.summary || '',
      '',
      `KEY ADMISSIONS`,
      ...(analysis.key_admissions || []).map((a, i) =>
        `${i + 1}. [${(a.strength || '').toUpperCase()}] ${a.admission}\n   → ${a.significance}`),
      '',
      `CONTRADICTIONS`,
      ...(analysis.contradictions || []).map((c, i) =>
        `${i + 1}. "${c.statement_a}"\n   vs. "${c.statement_b}"\n   → ${c.significance}`),
      '',
      `FOLLOW-UP QUESTIONS`,
      ...(analysis.follow_up_questions || []).map((q, i) => `${i + 1}. ${q}`),
      '',
      `RED FLAGS`,
      ...(analysis.red_flags || []).map((f, i) => `${i + 1}. ${f}`),
    ];

    res.setHeader('Content-Type', 'text/plain');
    res.send(lines.join('\n'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── List active sessions ──────────────────────────────────────────────────────
app.get('/sessions', (req, res) => {
  const list = Array.from(sessions.values()).map(s => ({
    id:        s.id,
    uid:       s.uid,
    segments:  s.segments.length,
    startedAt: s.startedAt,
    caseLabel: s.caseLabel,
  }));
  res.json(list);
});

// ── Clear a session ───────────────────────────────────────────────────────────
app.delete('/sessions/:id', (req, res) => {
  sessions.delete(req.params.id);
  res.json({ deleted: req.params.id });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Deposition Digest running on port ${PORT}`);
  console.log(`Webhook: POST /webhook`);
  console.log(`Report:  POST /report { session_id, case_label }`);
});
