/**
 * Showing Notes HTML Formatter
 * Clean, CRM-style report card for real estate showing notes
 */

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function interestBadge(level) {
  const map = {
    hot:     { color: '#dc2626', emoji: '🔥', label: 'Hot Lead' },
    warm:    { color: '#f97316', emoji: '✨', label: 'Warm Interest' },
    neutral: { color: '#6b7280', emoji: '😐', label: 'Neutral' },
    cold:    { color: '#2563eb', emoji: '❄️', label: 'Cold' },
  };
  const s = map[level] || { color: '#6b7280', emoji: '❓', label: level };
  return `<span style="background:${s.color};color:#fff;padding:5px 14px;border-radius:9999px;font-size:14px;font-weight:700">${s.emoji} ${s.label}</span>`;
}

function actionBadge(action) {
  const map = {
    make_offer:              { color: '#16a34a', label: 'Recommend: Make Offer' },
    schedule_second_showing: { color: '#2563eb', label: 'Schedule Second Showing' },
    suggest:                 { color: '#f97316', label: 'Keep in Mind' },
    needs_info:              { color: '#7c3aed', label: 'Needs More Info' },
    discard:                 { color: '#6b7280', label: 'Move On' },
  };
  const s = map[action] || { color: '#6b7280', label: action };
  return `<span style="background:${s.color};color:#fff;padding:4px 12px;border-radius:9999px;font-size:12px;font-weight:700">${s.label}</span>`;
}

function section(title, content) {
  if (!content) return '';
  return `
    <div class="section">
      <div class="section-title">${title}</div>
      ${content}
    </div>`;
}

function tagList(items, color = '#059669') {
  if (!items || items.length === 0) return null;
  return `<div class="tag-list">${items.map((i) =>
    `<span class="tag" style="border-color:${color};color:${color}">${esc(i)}</span>`
  ).join('')}</div>`;
}

function formatNotes(notes, meta = {}) {
  const now = new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  // Highlights and concerns
  const highlightsHtml = tagList(notes.property_highlights, '#059669');
  const concernsHtml = tagList(notes.property_concerns, '#d97706');
  const dealBreakersHtml = tagList(notes.deal_breakers, '#dc2626');

  // Buyer questions list
  const questionsHtml = (notes.buyer_questions || []).length > 0
    ? `<ul class="q-list">${notes.buyer_questions.map((q) =>
        `<li>❓ ${esc(q)}</li>`).join('')}</ul>`
    : null;

  // Follow-up items
  const followUpHtml = (notes.follow_up_items || []).length > 0
    ? `<ul class="fu-list">${notes.follow_up_items.map((f) =>
        `<li>
          <span class="fu-owner" style="background:${f.responsible === 'agent' ? '#7c3aed' : '#374151'}">${esc(f.responsible)}</span>
          ${esc(f.item)}
        </li>`).join('')}</ul>`
    : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Showing Notes — ${esc(meta.property_address || meta.session_id)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f0fdf4;
      color: #1e293b;
      padding: 24px;
    }
    .page {
      max-width: 820px;
      margin: 0 auto;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .header {
      background: #064e3b;
      color: #fff;
      padding: 28px 36px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .header p { color: #6ee7b7; font-size: 13px; }
    .header-right { text-align: right; }
    .report-id { color: #6ee7b7; font-size: 12px; font-family: monospace; }
    .meta-bar {
      background: #065f46;
      padding: 14px 36px;
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
    }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { color: #6ee7b7; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
    .meta-value { color: #ecfdf5; font-size: 13px; font-weight: 600; }
    .body { padding: 32px 36px; }
    .status-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .summary-box {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 28px;
      font-size: 15px;
      color: #374151;
      line-height: 1.6;
    }
    .section { margin-bottom: 28px; }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #6b7280;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    .tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag {
      border: 1.5px solid;
      border-radius: 9999px;
      padding: 4px 12px;
      font-size: 13px;
      font-weight: 500;
      background: transparent;
    }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 14px 16px;
    }
    .info-card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
    .info-card .value { font-size: 13px; color: #374151; line-height: 1.5; }
    .q-list { list-style: none; }
    .q-list li {
      padding: 10px 12px;
      font-size: 13px;
      color: #374151;
      border-bottom: 1px solid #f1f5f9;
    }
    .q-list li:last-child { border-bottom: none; }
    .fu-list { list-style: none; }
    .fu-list li {
      padding: 10px 12px;
      font-size: 13px;
      color: #374151;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .fu-list li:last-child { border-bottom: none; }
    .fu-owner {
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .price-box {
      background: #fefce8;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 14px 16px;
      color: #92400e;
      font-size: 14px;
    }
    .email-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 18px 20px;
      color: #1e3a5f;
      font-size: 14px;
      line-height: 1.7;
      white-space: pre-wrap;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .copy-hint {
      font-size: 11px;
      color: #6b7280;
      margin-top: 8px;
      font-style: italic;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding: 16px 36px;
      display: flex;
      justify-content: space-between;
      color: #9ca3af;
      font-size: 11px;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .page { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <h1>Showing Notes</h1>
        <p>Generated by Showing Notes + Omi AI</p>
      </div>
      <div class="header-right">
        <div class="report-id">Session: ${esc(meta.session_id)}</div>
        <div style="color:#6ee7b7;font-size:12px;margin-top:4px">${esc(now)}</div>
      </div>
    </div>

    <div class="meta-bar">
      <div class="meta-item">
        <span class="meta-label">Agent</span>
        <span class="meta-value">${esc(meta.agent_name)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Buyer</span>
        <span class="meta-value">${esc(meta.buyer_name)}</span>
      </div>
      ${meta.property_address ? `<div class="meta-item">
        <span class="meta-label">Property</span>
        <span class="meta-value">${esc(meta.property_address)}</span>
      </div>` : ''}
      ${meta.mls_number ? `<div class="meta-item">
        <span class="meta-label">MLS #</span>
        <span class="meta-value">${esc(meta.mls_number)}</span>
      </div>` : ''}
      ${notes.time_spent ? `<div class="meta-item">
        <span class="meta-label">Time at Property</span>
        <span class="meta-value">${esc(notes.time_spent)}</span>
      </div>` : ''}
    </div>

    <div class="body">
      <!-- Status -->
      <div class="status-row">
        ${interestBadge(notes.buyer_interest_level)}
        ${actionBadge(notes.recommended_follow_up_action)}
      </div>

      <!-- Summary -->
      ${notes.showing_summary ? `<div class="summary-box">${esc(notes.showing_summary)}</div>` : ''}

      <!-- Interest reason -->
      ${notes.buyer_interest_reason ? `
      <div class="two-col" style="margin-bottom:28px">
        <div class="info-card">
          <div class="label">Interest Assessment</div>
          <div class="value">${esc(notes.buyer_interest_reason)}</div>
        </div>
        ${notes.must_haves_status ? `<div class="info-card">
          <div class="label">Must-Haves</div>
          <div class="value">${esc(notes.must_haves_status)}</div>
        </div>` : '<div></div>'}
      </div>` : ''}

      <!-- Highlights -->
      ${highlightsHtml ? section('✅ Buyer Liked', highlightsHtml) : ''}

      <!-- Concerns -->
      ${concernsHtml ? section('⚠️ Concerns Raised', concernsHtml) : ''}

      <!-- Deal breakers -->
      ${dealBreakersHtml ? section('🚫 Potential Deal Breakers', dealBreakersHtml) : ''}

      <!-- Price signals -->
      ${notes.price_signals ? section('💰 Price & Offer Signals', `<div class="price-box">${esc(notes.price_signals)}</div>`) : ''}

      <!-- Questions -->
      ${questionsHtml ? section('❓ Buyer Questions (need follow-up answers)', questionsHtml) : ''}

      <!-- Lifestyle notes -->
      ${(notes.lifestyle_notes && (notes.lifestyle_notes.family_situation || notes.lifestyle_notes.commute_concerns || notes.lifestyle_notes.lifestyle_fit)) ? `
      ${section('🏡 Lifestyle Context', `
        <div class="two-col" style="margin-bottom:0">
          ${notes.lifestyle_notes.family_situation ? `<div class="info-card">
            <div class="label">Family Situation</div>
            <div class="value">${esc(notes.lifestyle_notes.family_situation)}</div>
          </div>` : '<div></div>'}
          ${notes.lifestyle_notes.commute_concerns ? `<div class="info-card">
            <div class="label">Commute / Location</div>
            <div class="value">${esc(notes.lifestyle_notes.commute_concerns)}</div>
          </div>` : '<div></div>'}
        </div>
        ${notes.lifestyle_notes.lifestyle_fit ? `<div class="info-card" style="margin-top:12px">
          <div class="label">Lifestyle Fit</div>
          <div class="value">${esc(notes.lifestyle_notes.lifestyle_fit)}</div>
        </div>` : ''}
      `)}` : ''}

      <!-- Follow-up actions -->
      ${followUpHtml ? section('📋 Follow-Up Action Items', followUpHtml) : ''}

      <!-- Agent observations -->
      ${notes.agent_observations ? section('🔍 Agent Observations', `<div class="info-card"><div class="value">${esc(notes.agent_observations)}</div></div>`) : ''}

      <!-- Draft follow-up email -->
      ${notes.draft_follow_up_email ? section('✉️ Draft Follow-Up Email (ready to send)', `
        <div class="email-box">${esc(notes.draft_follow_up_email)}</div>
        <div class="copy-hint">Copy and personalize before sending</div>
      `) : ''}
    </div>

    <div class="footer">
      <span>Showing Notes · Powered by Omi AI + Claude</span>
      <span>showingnotes.app</span>
    </div>
  </div>
</body>
</html>`;
}

module.exports = { formatNotes };
