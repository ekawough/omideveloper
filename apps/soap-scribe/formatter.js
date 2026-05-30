/**
 * SOAP Scribe HTML Formatter
 * Clean clinical note UI with EHR-paste button
 */

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function riskColor(level) {
  return { high: '#dc2626', moderate: '#f97316', low: '#16a34a', not_assessed: '#6b7280' }[level] || '#6b7280';
}

function section(title, content, accent = '#0f172a') {
  if (!content) return '';
  return `
    <div class="soap-section">
      <div class="soap-label" style="border-left-color:${accent}">${title}</div>
      <div class="soap-content">${content}</div>
    </div>`;
}

function formatSoapNote(note, meta = {}) {
  const now = new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  const format = (note.soap_format || meta.soap_format || 'soap').toUpperCase();

  // ICD-10 table
  const icd10Html = (note.icd10_codes || []).length > 0
    ? `<table class="code-table">
        <thead><tr><th>Code</th><th>Description</th><th>Type</th></tr></thead>
        <tbody>${note.icd10_codes.map((c) => `
          <tr>
            <td style="font-family:monospace;font-weight:700;color:#1d4ed8">${esc(c.code)}</td>
            <td>${esc(c.description)}</td>
            <td><span class="type-badge ${c.type === 'primary' ? 'primary' : 'secondary'}">${esc(c.type)}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>`
    : null;

  // CPT suggestions
  const cptHtml = (note.cpt_suggestions || []).length > 0
    ? `<div class="cpt-list">${note.cpt_suggestions.map((c) => `
        <div class="cpt-item">
          <span class="cpt-code">${esc(c.code)}</span>
          <span class="cpt-desc">${esc(c.description)}</span>
          ${c.note ? `<span class="cpt-note">${esc(c.note)}</span>` : ''}
        </div>`).join('')}</div>`
    : null;

  // Prescriptions
  const rxHtml = (note.prescriptions || []).length > 0
    ? `<div class="rx-list">${note.prescriptions.map((rx) => `
        <div class="rx-item">
          <div class="rx-name">💊 ${esc(rx.medication)} ${esc(rx.dose)} ${esc(rx.route)}</div>
          <div class="rx-sig">Sig: ${esc(rx.sig)}</div>
          <div class="rx-meta">${esc(rx.frequency)} · Disp: ${esc(rx.quantity)} · Refills: ${esc(String(rx.refills))}</div>
        </div>`).join('')}</div>`
    : null;

  // Clinical flags
  const flagsHtml = (note.clinical_flags || []).length > 0
    ? `<div class="flags-list">${note.clinical_flags.map((f) =>
        `<div class="flag-item">⚠️ ${esc(f)}</div>`).join('')}</div>`
    : null;

  // Orders
  const ordersHtml = (note.orders || []).length > 0
    ? `<ul class="orders-list">${note.orders.map((o) => `<li>📋 ${esc(o)}</li>`).join('')}</ul>`
    : null;

  // Risk assessment (behavioral health)
  const riskHtml = note.risk_assessment
    ? `<div class="risk-grid">
        ${note.risk_assessment.suicidal_ideation !== undefined ? `<div class="risk-item"><div class="risk-label">SI</div><div class="risk-value">${esc(note.risk_assessment.suicidal_ideation)}</div></div>` : ''}
        ${note.risk_assessment.homicidal_ideation !== undefined ? `<div class="risk-item"><div class="risk-label">HI</div><div class="risk-value">${esc(note.risk_assessment.homicidal_ideation)}</div></div>` : ''}
        ${note.risk_assessment.self_harm !== undefined ? `<div class="risk-item"><div class="risk-label">Self-Harm</div><div class="risk-value">${esc(note.risk_assessment.self_harm)}</div></div>` : ''}
        ${note.risk_assessment.risk_level !== undefined ? `<div class="risk-item"><div class="risk-label">Risk Level</div><div class="risk-value" style="color:${riskColor(note.risk_assessment.risk_level)};font-weight:700;text-transform:uppercase">${esc(note.risk_assessment.risk_level)}</div></div>` : ''}
        ${note.risk_assessment.safety_plan !== undefined ? `<div class="risk-item"><div class="risk-label">Safety Plan</div><div class="risk-value">${esc(note.risk_assessment.safety_plan)}</div></div>` : ''}
      </div>`
    : null;

  // Build section content based on format
  let noteSections = '';
  if (note.soap_format === 'dap') {
    noteSections = [
      section('DATA', note.data ? `<p>${esc(note.data)}</p>` : null, '#2563eb'),
      section('ASSESSMENT', note.assessment ? `<p>${esc(note.assessment)}</p>` : null, '#7c3aed'),
      section('PLAN', note.plan ? `<p>${esc(note.plan)}</p>` : null, '#16a34a'),
      riskHtml ? section('RISK ASSESSMENT', riskHtml, '#dc2626') : '',
    ].join('');
  } else if (note.soap_format === 'birp') {
    noteSections = [
      section('BEHAVIOR', note.behavior ? `<p>${esc(note.behavior)}</p>` : null, '#2563eb'),
      section('INTERVENTION', note.intervention ? `<p>${esc(note.intervention)}</p>` : null, '#7c3aed'),
      section('RESPONSE', note.response ? `<p>${esc(note.response)}</p>` : null, '#f97316'),
      section('PLAN', note.plan ? `<p>${esc(note.plan)}</p>` : null, '#16a34a'),
      riskHtml ? section('RISK ASSESSMENT', riskHtml, '#dc2626') : '',
    ].join('');
  } else {
    // Default SOAP
    noteSections = [
      section('SUBJECTIVE', note.subjective ? `<p>${esc(note.subjective)}</p>` : null, '#2563eb'),
      section('OBJECTIVE', note.objective ? `<p>${esc(note.objective)}</p>` : null, '#0ea5e9'),
      section('ASSESSMENT', note.assessment ? `<p>${esc(note.assessment)}</p>` : null, '#7c3aed'),
      section('PLAN', note.plan ? `<p>${esc(note.plan)}</p>` : null, '#16a34a'),
    ].join('');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SOAP Scribe — ${esc(meta.patient_initials)} — ${esc(meta.session_id)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f9ff; color: #1e293b; padding: 24px; }
    .page { max-width: 840px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #0c4a6e; color: #fff; padding: 28px 36px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .header p { color: #7dd3fc; font-size: 13px; }
    .hipaa-bar { background: #0369a1; padding: 8px 36px; display: flex; align-items: center; gap: 8px; }
    .hipaa-badge { background: #0284c7; border: 1px solid #38bdf8; color: #e0f2fe; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 4px; letter-spacing: 0.05em; }
    .hipaa-text { color: #7dd3fc; font-size: 11px; }
    .meta-bar { background: #075985; padding: 14px 36px; display: flex; gap: 32px; flex-wrap: wrap; }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { color: #7dd3fc; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
    .meta-value { color: #e0f2fe; font-size: 13px; font-weight: 600; }
    .body { padding: 32px 36px; }
    .soap-section { margin-bottom: 24px; }
    .soap-label { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #0f172a; border-left: 3px solid; padding-left: 10px; margin-bottom: 10px; }
    .soap-content p { font-size: 14px; color: #374151; line-height: 1.8; white-space: pre-line; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
    .code-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .code-table th { background: #f8fafc; color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; padding: 8px 10px; text-align: left; border-bottom: 2px solid #e5e7eb; }
    .code-table td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
    .type-badge { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
    .type-badge.primary { background: #dbeafe; color: #1d4ed8; }
    .type-badge.secondary { background: #f1f5f9; color: #64748b; }
    .cpt-list { display: flex; flex-direction: column; gap: 8px; }
    .cpt-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e5e7eb; }
    .cpt-code { font-family: monospace; font-weight: 700; color: #1d4ed8; font-size: 14px; min-width: 60px; }
    .cpt-desc { font-size: 13px; color: #374151; flex: 1; }
    .cpt-note { font-size: 11px; color: #6b7280; }
    .rx-list { display: flex; flex-direction: column; gap: 10px; }
    .rx-item { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 14px; }
    .rx-name { font-size: 14px; font-weight: 600; color: #15803d; margin-bottom: 4px; }
    .rx-sig { font-size: 13px; color: #374151; margin-bottom: 4px; }
    .rx-meta { font-size: 12px; color: #6b7280; }
    .orders-list { list-style: none; }
    .orders-list li { padding: 8px 12px; font-size: 13px; color: #374151; border-bottom: 1px solid #f1f5f9; }
    .orders-list li:last-child { border-bottom: none; }
    .flags-list { display: flex; flex-direction: column; gap: 8px; }
    .flag-item { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 14px; color: #dc2626; font-size: 13px; font-weight: 600; }
    .risk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .risk-item { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 12px; }
    .risk-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
    .risk-value { font-size: 13px; color: #374151; font-weight: 500; }
    .edu-box { background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 14px; font-size: 14px; color: #78350f; }
    .copy-btn { display: inline-block; background: #0c4a6e; color: #fff; font-size: 13px; font-weight: 600; padding: 8px 18px; border-radius: 6px; text-decoration: none; cursor: pointer; border: none; margin-top: 12px; }
    .footer { border-top: 1px solid #e5e7eb; padding: 14px 36px; display: flex; justify-content: space-between; color: #9ca3af; font-size: 11px; }
    @media print { body { background: #fff; padding: 0; } .page { box-shadow: none; } .copy-btn { display: none; } }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <h1>SOAP Scribe</h1>
      <p>Clinical documentation · Powered by Omi AI + Claude</p>
    </div>
    <div style="text-align:right">
      <div style="color:#7dd3fc;font-family:monospace;font-size:12px">Session: ${esc(meta.session_id)}</div>
      <div style="color:#7dd3fc;font-size:12px;margin-top:4px">${esc(now)}</div>
    </div>
  </div>

  <div class="hipaa-bar">
    <span class="hipaa-badge">HIPAA</span>
    <span class="hipaa-text">Session cleared after generation · PHI not logged · Verify BAA before use with real patient data</span>
  </div>

  <div class="meta-bar">
    <div class="meta-item"><span class="meta-label">Clinician</span><span class="meta-value">${esc(meta.clinician_name)}</span></div>
    <div class="meta-item"><span class="meta-label">Patient</span><span class="meta-value">${esc(meta.patient_initials)}</span></div>
    <div class="meta-item"><span class="meta-label">Format</span><span class="meta-value">${esc(format)}</span></div>
    ${meta.visit_type ? `<div class="meta-item"><span class="meta-label">Visit Type</span><span class="meta-value" style="text-transform:capitalize">${esc(meta.visit_type.replace('_', ' '))}</span></div>` : ''}
    ${meta.specialty ? `<div class="meta-item"><span class="meta-label">Specialty</span><span class="meta-value" style="text-transform:capitalize">${esc(meta.specialty.replace('_', ' '))}</span></div>` : ''}
  </div>

  <div class="body">

    <!-- Flags first if present -->
    ${flagsHtml ? `<div class="section">${flagsHtml}</div><hr class="divider">` : ''}

    <!-- Main note sections -->
    ${noteSections}

    <hr class="divider">

    <!-- Prescriptions -->
    ${rxHtml ? `<div class="section"><div class="section-title">💊 Prescriptions</div>${rxHtml}</div>` : ''}

    <!-- Orders -->
    ${ordersHtml ? `<div class="section"><div class="section-title">📋 Orders</div>${ordersHtml}</div>` : ''}

    <!-- ICD-10 -->
    ${icd10Html ? `<div class="section"><div class="section-title">🏷️ ICD-10 Codes</div>${icd10Html}</div>` : ''}

    <!-- CPT suggestions -->
    ${cptHtml ? `<div class="section"><div class="section-title">💰 CPT Suggestions</div>${cptHtml}</div>` : ''}

    <!-- Follow-up -->
    ${note.follow_up ? `<div class="section"><div class="section-title">📅 Follow-Up</div><div class="edu-box">${esc(note.follow_up)}</div></div>` : ''}

    <!-- Patient education -->
    ${note.patient_education ? `<div class="section"><div class="section-title">📖 Patient Education Provided</div><div class="edu-box">${esc(note.patient_education)}</div></div>` : ''}

    ${note.time_based_billing ? `<div class="section"><div class="section-title">⏱️ Time-Based Billing</div><div style="font-size:14px;color:#374151">${esc(note.time_based_billing)}</div></div>` : ''}

  </div>

  <div class="footer">
    <span>SOAP Scribe · Powered by Omi AI + Claude · Requires BAA for PHI use</span>
    <span>soapscribe.app</span>
  </div>
</div>
</body>
</html>`;
}

module.exports = { formatSoapNote };
