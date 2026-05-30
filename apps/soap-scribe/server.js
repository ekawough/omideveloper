/**
 * SOAP Scribe — Omi Webhook Server
 * Patient visit capture → structured SOAP note → EHR-ready output
 *
 * HIPAA CONSIDERATIONS:
 * - No PHI is logged to console or stored beyond the active session in memory
 * - Sessions are cleared after report generation
 * - Production deployment requires: BAA with Anthropic, BAA with Railway/cloud provider,
 *   encryption at rest + in transit (HTTPS on Railway = in transit covered)
 * - Add database persistence only with HIPAA-compliant storage (Supabase + encryption)
 * - This server intentionally does NOT log transcript content to stdout
 */

const express = require('express');
const { processSoapNote } = require('./processor');
const { formatSoapNote } = require('./formatter');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory only — no disk logging of PHI
// Production: replace with encrypted DB
const sessions = new Map();

app.get('/', (req, res) => {
  res.json({
    service: 'SOAP Scribe',
    version: '1.0.0',
    status: 'online',
    hipaaMode: true,
    activeSessions: sessions.size,
  });
});

/**
 * Omi webhook — transcript_processed
 * PHI HANDLING: segments accumulated in memory only, not logged
 */
app.post('/webhook', (req, res) => {
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

    sessions.get(session_id).segments.push({
      text: text.trim(),
      ts: new Date().toISOString(),
    });

    // HIPAA: do NOT log segment text to console in production
    console.log(`[${session_id}] Segment received (count: ${sessions.get(session_id).segments.length})`);
  } catch (err) {
    console.error('Webhook error (no PHI):', err.message);
  }
});

/**
 * Generate SOAP note
 * Body: {
 *   session_id,
 *   clinician_name?,
 *   patient_initials?,    // Use initials only — never full name in transit
 *   visit_type?,          // office_visit | telehealth | follow_up | new_patient | urgent_care
 *   specialty?,           // primary_care | pediatrics | psychiatry | orthopedics | etc.
 *   soap_format?,         // soap | dap | birp | progress  (default: soap)
 *   clear_after?          // boolean — clear session from memory after report (default: true)
 * }
 */
app.post('/soap', async (req, res) => {
  const {
    session_id,
    clinician_name,
    patient_initials,
    visit_type,
    specialty,
    soap_format,
    clear_after = true,
  } = req.body;

  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  const session = sessions.get(session_id);
  if (!session || session.segments.length === 0) {
    return res.status(404).json({ error: 'No transcript for this session' });
  }

  const transcript = session.segments.map((s) => s.text).join('\n');

  try {
    const note = await processSoapNote(transcript, {
      clinician_name: clinician_name || 'Provider',
      patient_initials: patient_initials || 'PT',
      visit_type: visit_type || 'office_visit',
      specialty: specialty || 'primary_care',
      soap_format: soap_format || 'soap',
    });

    const html = formatSoapNote(note, {
      session_id,
      clinician_name: clinician_name || 'Provider',
      patient_initials: patient_initials || 'PT',
      visit_type,
      specialty,
      soap_format: soap_format || 'soap',
      started_at: session.startedAt,
    });

    // HIPAA: clear session from memory after generating note (default behavior)
    if (clear_after) {
      sessions.delete(session_id);
      console.log(`[${session_id}] Session cleared from memory after note generation`);
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('SOAP generation error (no PHI):', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * JSON output — for EHR paste or API integration
 */
app.post('/soap/json', async (req, res) => {
  const { session_id, clinician_name, patient_initials, visit_type, specialty, soap_format, clear_after = true } = req.body;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  const session = sessions.get(session_id);
  if (!session || session.segments.length === 0) {
    return res.status(404).json({ error: 'No transcript for this session' });
  }

  const transcript = session.segments.map((s) => s.text).join('\n');

  try {
    const note = await processSoapNote(transcript, {
      clinician_name: clinician_name || 'Provider',
      patient_initials: patient_initials || 'PT',
      visit_type: visit_type || 'office_visit',
      specialty: specialty || 'primary_care',
      soap_format: soap_format || 'soap',
    });

    if (clear_after) sessions.delete(session_id);

    res.json({ session_id, generated_at: new Date().toISOString(), note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * EHR plain-text output — formatted for direct copy-paste into Epic, Cerner, etc.
 */
app.post('/soap/text', async (req, res) => {
  const { session_id, clinician_name, patient_initials, visit_type, specialty, soap_format, clear_after = true } = req.body;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  const session = sessions.get(session_id);
  if (!session || session.segments.length === 0) {
    return res.status(404).json({ error: 'No transcript for this session' });
  }

  const transcript = session.segments.map((s) => s.text).join('\n');

  try {
    const note = await processSoapNote(transcript, {
      clinician_name: clinician_name || 'Provider',
      patient_initials: patient_initials || 'PT',
      visit_type: visit_type || 'office_visit',
      specialty: specialty || 'primary_care',
      soap_format: soap_format || 'soap',
    });

    if (clear_after) sessions.delete(session_id);

    // Build plain-text EHR-paste version
    const plainText = buildPlainText(note, soap_format || 'soap');
    res.setHeader('Content-Type', 'text/plain');
    res.send(plainText);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function buildPlainText(note, format) {
  if (format === 'soap') {
    return [
      `SUBJECTIVE:\n${note.subjective || ''}`,
      `\nOBJECTIVE:\n${note.objective || ''}`,
      `\nASSESSMENT:\n${note.assessment || ''}`,
      `\nPLAN:\n${note.plan || ''}`,
      note.icd10_codes?.length ? `\nICD-10 CODES:\n${note.icd10_codes.map((c) => `${c.code} — ${c.description}`).join('\n')}` : '',
      note.follow_up ? `\nFOLLOW-UP:\n${note.follow_up}` : '',
    ].filter(Boolean).join('\n');
  }
  if (format === 'dap') {
    return [
      `DATA:\n${note.data || ''}`,
      `\nASSESSMENT:\n${note.assessment || ''}`,
      `\nPLAN:\n${note.plan || ''}`,
    ].join('\n');
  }
  return JSON.stringify(note, null, 2);
}

// Session management — HIPAA: session listing shows count only, no PHI
app.get('/sessions', (req, res) => {
  res.json({
    count: sessions.size,
    sessions: Array.from(sessions.keys()).map((id) => ({
      session_id: id,
      segment_count: sessions.get(id).segments.length,
      started_at: sessions.get(id).startedAt,
    })),
  });
});

app.delete('/sessions/:id', (req, res) => {
  res.json({ deleted: sessions.delete(req.params.id) });
});

app.listen(PORT, () => console.log(`SOAP Scribe running on port ${PORT}`));
