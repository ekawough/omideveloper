/**
 * Field Report — Omi Webhook Server
 * Voice-to-invoice report for HVAC, plumbing, and electrical techs
 * Pattern: transcript_processed → accumulate → /report → HTML/JSON output
 */

const express = require('express');
const { processFieldReport } = require('./processor');
const { formatReport } = require('./formatter');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory session store: sessionId → { segments[], startedAt }
const sessions = new Map();

// Health check
app.get('/', (req, res) => {
  res.json({
    service: 'Field Report',
    version: '1.0.0',
    status: 'online',
    activeSessions: sessions.size,
  });
});

/**
 * Omi webhook — fires every 5-10s after silence
 * Accumulates transcript segments by session_id
 */
app.post('/webhook', (req, res) => {
  // Respond immediately — Omi requires fast ACK
  res.status(200).json({ received: true });

  try {
    const { uid, session_id, segments = [], transcript } = req.body;

    if (!session_id) return;

    const text = transcript || segments.map((s) => s.text).join(' ');
    if (!text.trim()) return;

    if (!sessions.has(session_id)) {
      sessions.set(session_id, {
        uid,
        segments: [],
        startedAt: new Date().toISOString(),
      });
    }

    const session = sessions.get(session_id);
    session.segments.push({
      text: text.trim(),
      timestamp: new Date().toISOString(),
    });

    console.log(`[${session_id}] Segment added. Total: ${session.segments.length}`);
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
});

/**
 * Generate report from accumulated session
 * Body: { session_id, tech_name?, job_type?, customer_name?, address? }
 */
app.post('/report', async (req, res) => {
  const { session_id, tech_name, job_type, customer_name, address } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: 'session_id required' });
  }

  const session = sessions.get(session_id);
  if (!session || session.segments.length === 0) {
    return res.status(404).json({ error: 'No transcript found for this session' });
  }

  const fullTranscript = session.segments.map((s) => s.text).join('\n');

  try {
    const report = await processFieldReport(fullTranscript, {
      tech_name: tech_name || 'Field Tech',
      job_type: job_type || 'Service Call',
      customer_name: customer_name || 'Customer',
      address: address || '',
    });

    const html = formatReport(report, {
      session_id,
      tech_name: tech_name || 'Field Tech',
      customer_name: customer_name || 'Customer',
      address: address || '',
      started_at: session.startedAt,
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Report error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get report as JSON (for ServiceTitan / Jobber API push)
 * Body: { session_id, tech_name?, job_type?, customer_name?, address? }
 */
app.post('/report/json', async (req, res) => {
  const { session_id, tech_name, job_type, customer_name, address } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: 'session_id required' });
  }

  const session = sessions.get(session_id);
  if (!session || session.segments.length === 0) {
    return res.status(404).json({ error: 'No transcript found for this session' });
  }

  const fullTranscript = session.segments.map((s) => s.text).join('\n');

  try {
    const report = await processFieldReport(fullTranscript, {
      tech_name: tech_name || 'Field Tech',
      job_type: job_type || 'Service Call',
      customer_name: customer_name || 'Customer',
      address: address || '',
    });

    res.json({ session_id, generated_at: new Date().toISOString(), report });
  } catch (err) {
    console.error('JSON report error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// List active sessions
app.get('/sessions', (req, res) => {
  const list = [];
  for (const [id, data] of sessions.entries()) {
    list.push({
      session_id: id,
      segment_count: data.segments.length,
      started_at: data.startedAt,
    });
  }
  res.json(list);
});

// Clear a session
app.delete('/sessions/:id', (req, res) => {
  const deleted = sessions.delete(req.params.id);
  res.json({ deleted });
});

app.listen(PORT, () => {
  console.log(`Field Report server running on port ${PORT}`);
});
