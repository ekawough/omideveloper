/**
 * Field Report HTML Formatter
 * Produces a professional, print-ready work order report
 */

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function urgencyBadge(urgency) {
  const colors = {
    immediate: '#dc2626',
    soon: '#d97706',
    routine: '#16a34a',
  };
  const color = colors[urgency] || '#6b7280';
  return `<span style="background:${color};color:#fff;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;text-transform:uppercase">${esc(urgency)}</span>`;
}

function statusBadge(status) {
  const map = {
    complete: { color: '#16a34a', label: 'Complete' },
    incomplete: { color: '#dc2626', label: 'Incomplete' },
    needs_return: { color: '#d97706', label: 'Return Needed' },
    estimate_only: { color: '#2563eb', label: 'Estimate Only' },
  };
  const s = map[status] || { color: '#6b7280', label: status || 'Unknown' };
  return `<span style="background:${s.color};color:#fff;padding:4px 12px;border-radius:9999px;font-size:13px;font-weight:700">${s.label}</span>`;
}

function tradeBadge(trade) {
  const map = {
    hvac: { color: '#0ea5e9', label: 'HVAC' },
    plumbing: { color: '#3b82f6', label: 'Plumbing' },
    electrical: { color: '#f59e0b', label: 'Electrical' },
    general: { color: '#6b7280', label: 'General' },
  };
  const t = map[trade] || { color: '#6b7280', label: trade || 'Service' };
  return `<span style="background:${t.color};color:#fff;padding:3px 10px;border-radius:9999px;font-size:12px;font-weight:600">${t.label}</span>`;
}

function section(title, content) {
  if (!content) return '';
  return `
    <div class="section">
      <div class="section-title">${title}</div>
      ${content}
    </div>`;
}

function formatReport(report, meta = {}) {
  const now = new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  // Work performed list
  const workPerformedHtml = (report.work_performed || []).length > 0
    ? `<ul class="item-list">${report.work_performed.map((w) =>
        `<li>
          <span class="checkmark">${w.completed ? '✓' : '○'}</span>
          ${esc(w.description)}
        </li>`).join('')}
      </ul>`
    : null;

  // Parts table
  const partsHtml = (report.parts_used || []).length > 0
    ? `<table class="parts-table">
        <thead>
          <tr>
            <th>Part / Material</th>
            <th style="text-align:center">Qty</th>
            <th>Part #</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${report.parts_used.map((p) => `
            <tr>
              <td>${esc(p.part_name)}</td>
              <td style="text-align:center">${esc(String(p.quantity ?? 1))}</td>
              <td style="color:#6b7280">${esc(p.part_number) || '—'}</td>
              <td style="color:#6b7280">${esc(p.note) || '—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>`
    : null;

  // Follow-up items
  const followUpHtml = (report.follow_up_needed || []).length > 0
    ? `<div class="followup-list">
        ${report.follow_up_needed.map((f) => `
          <div class="followup-item">
            <div class="followup-header">
              ${urgencyBadge(f.urgency)}
              <span style="font-weight:600;color:#111827">${esc(f.item)}</span>
            </div>
            <div class="followup-reason">${esc(f.reason)}</div>
          </div>`).join('')}
      </div>`
    : null;

  // Photos recommended
  const photosHtml = (report.photos_recommended || []).length > 0
    ? `<ul class="photo-list">${report.photos_recommended.map((p) =>
        `<li>📷 ${esc(p)}</li>`).join('')}
      </ul>`
    : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Field Report — ${esc(meta.customer_name)} — ${esc(meta.session_id)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f1f5f9;
      color: #1e293b;
      padding: 24px;
    }
    .page {
      max-width: 860px;
      margin: 0 auto;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .header {
      background: #0f172a;
      color: #fff;
      padding: 28px 36px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-left h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .header-left p { color: #94a3b8; font-size: 13px; }
    .header-right { text-align: right; }
    .header-right .report-id { color: #64748b; font-size: 12px; font-family: monospace; }
    .meta-bar {
      background: #1e293b;
      padding: 14px 36px;
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
    }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
    .meta-value { color: #e2e8f0; font-size: 13px; font-weight: 600; }
    .body { padding: 32px 36px; }
    .summary-box {
      background: #f8fafc;
      border-left: 4px solid #f97316;
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 28px;
    }
    .summary-box p { color: #374151; line-height: 1.6; font-size: 15px; }
    .status-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
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
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
    }
    .info-card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
    .info-card .value { font-size: 14px; color: #111827; font-weight: 500; }
    .item-list { list-style: none; }
    .item-list li {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 14px;
      color: #374151;
    }
    .item-list li:last-child { border-bottom: none; }
    .checkmark { color: #16a34a; font-weight: 700; flex-shrink: 0; }
    .parts-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .parts-table th {
      background: #f8fafc;
      color: #6b7280;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 10px 12px;
      text-align: left;
      border-bottom: 2px solid #e5e7eb;
    }
    .parts-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #374151;
    }
    .followup-list { display: flex; flex-direction: column; gap: 12px; }
    .followup-item {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 14px 16px;
    }
    .followup-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .followup-reason { color: #78716c; font-size: 13px; }
    .photo-list { list-style: none; }
    .photo-list li {
      padding: 8px 12px;
      font-size: 13px;
      color: #4b5563;
      border-bottom: 1px solid #f1f5f9;
    }
    .photo-list li:last-child { border-bottom: none; }
    .safety-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 14px 16px;
      color: #dc2626;
      font-size: 14px;
    }
    .notes-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 14px 16px;
      color: #15803d;
      font-size: 14px;
    }
    .invoice-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 14px 16px;
      color: #1d4ed8;
      font-size: 14px;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding: 16px 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #9ca3af;
      font-size: 11px;
    }
    .signature-line {
      display: flex;
      align-items: flex-end;
      gap: 40px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px dashed #e5e7eb;
    }
    .sig-block { flex: 1; }
    .sig-line { border-bottom: 1px solid #374151; margin-bottom: 6px; height: 32px; }
    .sig-label { font-size: 11px; color: #6b7280; }
    @media print {
      body { background: #fff; padding: 0; }
      .page { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <h1>Field Report</h1>
        <p>Generated by Field Report + Omi AI</p>
      </div>
      <div class="header-right">
        <div class="report-id">Session: ${esc(meta.session_id)}</div>
        <div style="color:#64748b;font-size:12px;margin-top:4px">${esc(now)}</div>
      </div>
    </div>

    <!-- Meta bar -->
    <div class="meta-bar">
      <div class="meta-item">
        <span class="meta-label">Technician</span>
        <span class="meta-value">${esc(meta.tech_name)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Customer</span>
        <span class="meta-value">${esc(meta.customer_name)}</span>
      </div>
      ${meta.address ? `<div class="meta-item">
        <span class="meta-label">Address</span>
        <span class="meta-value">${esc(meta.address)}</span>
      </div>` : ''}
      ${report.time_on_site ? `<div class="meta-item">
        <span class="meta-label">Time on Site</span>
        <span class="meta-value">${esc(report.time_on_site)}</span>
      </div>` : ''}
      ${report.service_type ? `<div class="meta-item">
        <span class="meta-label">Service Type</span>
        <span class="meta-value" style="text-transform:capitalize">${esc(report.service_type.replace('_', ' '))}</span>
      </div>` : ''}
    </div>

    <!-- Body -->
    <div class="body">

      <!-- Status row -->
      <div class="status-row">
        ${statusBadge(report.job_status)}
        ${tradeBadge(report.trade)}
      </div>

      <!-- Summary -->
      ${report.job_summary ? `
      <div class="summary-box">
        <p>${esc(report.job_summary)}</p>
      </div>` : ''}

      <!-- Problem + Diagnosis -->
      <div class="two-col">
        ${report.problem_reported ? `<div class="info-card">
          <div class="label">Problem Reported</div>
          <div class="value">${esc(report.problem_reported)}</div>
        </div>` : '<div></div>'}
        ${report.diagnosis ? `<div class="info-card">
          <div class="label">Technician Diagnosis</div>
          <div class="value">${esc(report.diagnosis)}</div>
        </div>` : '<div></div>'}
      </div>

      <!-- Work Performed -->
      ${workPerformedHtml ? section('Work Performed', workPerformedHtml) : ''}

      <!-- Parts & Materials -->
      ${partsHtml ? section('Parts & Materials Used', partsHtml) : ''}

      <!-- Follow-up Items -->
      ${followUpHtml ? section('Recommended Follow-Up', followUpHtml) : ''}

      <!-- Safety Flags -->
      ${report.safety_flags ? section('Safety / Code Flags', `<div class="safety-box">⚠️ ${esc(report.safety_flags)}</div>`) : ''}

      <!-- Customer Notes -->
      ${report.customer_notes ? section('Customer Notes', `<div class="notes-box">💬 ${esc(report.customer_notes)}</div>`) : ''}

      <!-- Invoice Notes -->
      ${report.invoice_notes ? section('Billing / Invoice Notes', `<div class="invoice-box">💰 ${esc(report.invoice_notes)}</div>`) : ''}

      <!-- Photos Recommended -->
      ${photosHtml ? section('Photos to Document', photosHtml) : ''}

      <!-- Signature lines for paper backup -->
      <div class="signature-line">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-label">Technician Signature</div>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-label">Customer Signature (acknowledgement)</div>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-label">Date</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <span>Field Report · Powered by Omi AI + Claude</span>
      <span>fieldreport.app</span>
    </div>
  </div>
</body>
</html>`;
}

module.exports = { formatReport };
