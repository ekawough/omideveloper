/**
 * Showing Notes — Omi Webhook Server
 * Captures real estate agent showing notes in real time
 * Pattern: transcript_processed → accumulate → /notes → structured output + CRM push
 */

const express = require('express');
const { processShowingNotes } = require('./processor');
const { formatNotes } = require('./formatter');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory session store: sessionId → { segments[], startedAt, property? }
const sessions = new Map();

app.get('/', (req, res) => {
  res.json({
    service: 'Showing Notes',
    version: '1.0.0',
    status: 'online',
    activeSessions: sessions.size,
  });
});

/**
 * Omi webhook — transcript_processed
 * Accumulates conversation segments by session_id
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
      timestamp: new Date().toISOString(),
    });

    console.log(`[${session_id}] Segment +1 (total: ${sessions.get(session_id).segments.length})`);
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
});

/**
 * Generate showing notes HTML report + optional CRM push
 * Body: { session_id, agent_name?, property_address?, buyer_name?, mlsNumber?, crm_webhook? }
 */
app.post('/notes', async (req, res) => {
  const {
    session_id,
    agent_name,
    property_address,
    buyer_name,
    mls_number,
    crm_webhook,
  } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: 'session_id required' });
  }

  const session = sessions.get(session_id);
  if (!session || session.segments.length === 0) {
    return res.status(404).json({ error: 'No transcript found for this session' });
  }

  const fullTranscript = session.segments.map((s) => s.text).join('\n');

  try {
    const notes = await processShowingNotes(fullTranscript, {
      agent_name: agent_name || 'Agent',
      property_address: property_address || '',
      buyer_name: buyer_name || 'Buyer',
      mls_number: mls_number || '',
    });

    // Push to CRM webhook if provided (Follow Up Boss, HubSpot, GHL, etc.)
    if (crm_webhook) {
      try {
        await pushToCRM(crm_webhook, notes, {
          session_id,
          agent_name,
          property_address,
          buyer_name,
          mls_number,
        });
        console.log(`[${session_id}] CRM push complete`);
      } catch (crmErr) {
        console.error(`[${session_id}] CRM push failed:`, crmErr.message);
      }
    }

    const html = formatNotes(notes, {
      session_id,
      agent_name: agent_name || 'Agent',
      property_address: property_address || '',
      buyer_name: buyer_name || 'Buyer',
      mls_number: mls_number || '',
      started_at: session.startedAt,
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Notes error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * JSON output for CRM API integration
 */
app.post('/notes/json', async (req, res) => {
  const { session_id, agent_name, property_address, buyer_name, mls_number } = req.body;

  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  const session = sessions.get(session_id);
  if (!session || session.segments.length === 0) {
    return res.status(404).json({ error: 'No transcript found for this session' });
  }

  const fullTranscript = session.segments.map((s) => s.text).join('\n');

  try {
    const notes = await processShowingNotes(fullTranscript, {
      agent_name: agent_name || 'Agent',
      property_address: property_address || '',
      buyer_name: buyer_name || 'Buyer',
      mls_number: mls_number || '',
    });

    res.json({ session_id, generated_at: new Date().toISOString(), notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Push notes to a CRM webhook (Follow Up Boss, HubSpot, GHL)
 * GHL: POST to https://rest.gohighlevel.com/v1/contacts/
 */
async function pushToCRM(webhookUrl, notes, meta) {
  const payload = {
    source: 'showing-notes-omi',
    session_id: meta.session_id,
    agent: meta.agent_name,
    buyer: meta.buyer_name,
    property: meta.property_address,
    mls_number: meta.mls_number,
    overall_interest: notes.buyer_interest_level,
    must_haves_met: notes.must_haves_met,
    deal_breakers: notes.deal_breakers,
    follow_up_action: notes.recommended_follow_up_action,
    note_summary: notes.showing_summary,
    generated_at: new Date().toISOString(),
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`CRM webhook returned ${response.status}`);
  }
}

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

app.delete('/sessions/:id', (req, res) => {
  const deleted = sessions.delete(req.params.id);
  res.json({ deleted });
});

app.listen(PORT, () => {
  console.log(`Showing Notes server running on port ${PORT}`);
});
