function buildHtmlReport(session, analysis) {
  const caseLabel = session.caseLabel || 'Untitled Deposition';
  const date      = new Date(session.startedAt).toLocaleDateString('en-US', {
    year: 'month', month: 'long', day: 'numeric',
  });
  const segCount  = session.segments.length;

  const flagColor = { admission: '#ef4444', contradiction: '#f97316', favorable: '#22c55e', exhibit: '#3b82f6', none: '#374151' };
  const flagLabel = { admission: 'KEY ADMISSION', contradiction: 'CONTRADICTION', favorable: 'FAVORABLE', exhibit: 'EXHIBIT REF', none: '' };

  const admissionsHtml = (analysis.key_admissions || []).map(a => `
    <div class="item-card ${a.strength}">
      <div class="item-header">
        <span class="badge admission">KEY ADMISSION</span>
        <span class="strength-badge">${a.strength.toUpperCase()}</span>
      </div>
      <blockquote>${escHtml(a.admission)}</blockquote>
      <p class="significance"><strong>Why it matters:</strong> ${escHtml(a.significance)}</p>
    </div>`).join('') || '<p class="empty">No key admissions flagged.</p>';

  const contradictionsHtml = (analysis.contradictions || []).map(c => `
    <div class="item-card">
      <div class="item-header"><span class="badge contradiction">CONTRADICTION</span></div>
      <div class="contradiction-pair">
        <div class="stmt"><span class="stmt-label">Statement A</span>${escHtml(c.statement_a)}</div>
        <div class="stmt"><span class="stmt-label">Statement B</span>${escHtml(c.statement_b)}</div>
      </div>
      <p class="significance"><strong>How to use:</strong> ${escHtml(c.significance)}</p>
    </div>`).join('') || '<p class="empty">No contradictions flagged.</p>';

  const favorableHtml = (analysis.favorable_testimony || []).map(f => `
    <div class="item-card">
      <div class="item-header"><span class="badge favorable">FAVORABLE</span></div>
      <blockquote>${escHtml(f.quote)}</blockquote>
      <p class="significance"><strong>Trial use:</strong> ${escHtml(f.use)}</p>
    </div>`).join('') || '<p class="empty">No favorable testimony flagged.</p>';

  const followUpHtml = (analysis.follow_up_questions || []).map((q, i) => `
    <div class="follow-up-item"><span class="q-num">${i + 1}</span><span>${escHtml(q)}</span></div>`).join('');

  const redFlagsHtml = (analysis.red_flags || []).map(f => `
    <div class="red-flag-item">⚠️ ${escHtml(f)}</div>`).join('');

  const exhibitsHtml = (analysis.exhibit_references || []).map(e => `
    <div class="exhibit-item">
      <strong>${escHtml(e.description)}</strong>
      <p>${escHtml(e.context)}</p>
    </div>`).join('') || '<p class="empty">No exhibits referenced.</p>';

  const transcriptHtml = (analysis.timestamped_transcript || session.segments.map((s, i) => ({
    timestamp: `Segment ${i + 1}`,
    text:      s.text,
    flag:      'none',
  }))).map(seg => `
    <div class="transcript-line ${seg.flag !== 'none' ? 'flagged' : ''}">
      <div class="ts-time">${escHtml(seg.timestamp)}</div>
      <div class="ts-body">
        ${seg.flag !== 'none' ? `<span class="ts-flag" style="color:${flagColor[seg.flag]}">${flagLabel[seg.flag]}</span>` : ''}
        <p>${escHtml(seg.text)}</p>
      </div>
    </div>`).join('');

  const witProfile = analysis.witness_profile || {};
  const credSignals = (witProfile.credibility_signals || []).map(s => `<li>${escHtml(s)}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Deposition Digest — ${escHtml(caseLabel)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --bg: #f8fafc; --surface: #ffffff; --border: #e2e8f0;
    --text: #0f172a; --muted: #64748b;
    --red: #ef4444; --orange: #f97316; --green: #22c55e; --blue: #3b82f6;
    --purple: #7c3aed;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.6; }

  /* HEADER */
  .report-header {
    background: #0f172a; color: white;
    padding: 36px 48px;
    display: flex; justify-content: space-between; align-items: flex-start;
  }
  .report-brand { font-size: 13px; color: #94a3b8; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
  .report-case { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
  .report-meta { font-size: 13px; color: #94a3b8; margin-top: 6px; }
  .report-stats { text-align: right; }
  .stat-num { font-size: 32px; font-weight: 900; color: #fff; }
  .stat-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }

  /* SUMMARY BAR */
  .summary-bar { background: var(--purple); color: white; padding: 20px 48px; font-size: 14px; line-height: 1.7; }
  .summary-bar strong { font-weight: 700; }

  /* WITNESS PROFILE */
  .witness-section { background: #f1f5f9; padding: 24px 48px; border-bottom: 1px solid var(--border); display: flex; gap: 32px; flex-wrap: wrap; }
  .witness-pill { background: white; border: 1px solid var(--border); border-radius: 8px; padding: 12px 18px; }
  .witness-pill .label { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .witness-pill .value { font-size: 14px; font-weight: 700; }
  .cred-signals { flex: 1; min-width: 260px; }
  .cred-signals .label { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .cred-signals ul { padding-left: 18px; font-size: 13px; color: var(--text); }
  .cred-signals li { margin-bottom: 4px; }

  /* MAIN LAYOUT */
  .main { max-width: 1200px; margin: 0 auto; padding: 40px 48px; display: grid; grid-template-columns: 1fr 360px; gap: 32px; }
  @media (max-width: 900px) { .main { grid-template-columns: 1fr; padding: 24px; } }

  /* SECTIONS */
  .section { margin-bottom: 32px; }
  .section-title {
    font-size: 11px; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1.5px;
    padding-bottom: 10px; border-bottom: 2px solid var(--border);
    margin-bottom: 16px;
  }

  /* CARDS */
  .item-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 18px; margin-bottom: 12px;
  }
  .item-card.strong { border-left: 4px solid var(--red); }
  .item-card.moderate { border-left: 4px solid var(--orange); }
  .item-card.weak { border-left: 4px solid #fbbf24; }
  .item-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .badge { font-size: 10px; font-weight: 800; letter-spacing: 0.5px; padding: 3px 8px; border-radius: 5px; text-transform: uppercase; }
  .badge.admission { background: #fee2e2; color: var(--red); }
  .badge.contradiction { background: #ffedd5; color: var(--orange); }
  .badge.favorable { background: #dcfce7; color: #16a34a; }
  .strength-badge { font-size: 10px; font-weight: 700; color: var(--muted); }
  blockquote { font-style: italic; color: #1e293b; background: #f8fafc; border-left: 3px solid var(--border); padding: 10px 14px; border-radius: 4px; margin-bottom: 10px; font-size: 13px; }
  .significance { font-size: 13px; color: var(--muted); }
  .contradiction-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  .stmt { background: #f8fafc; border: 1px solid var(--border); border-radius: 6px; padding: 10px; font-size: 13px; }
  .stmt-label { display: block; font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; margin-bottom: 4px; }
  .empty { color: var(--muted); font-style: italic; font-size: 13px; }

  /* FOLLOW-UP */
  .follow-up-item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
  .follow-up-item:last-child { border-bottom: none; }
  .q-num { width: 22px; height: 22px; border-radius: 50%; background: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  /* RED FLAGS */
  .red-flag-item { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px 14px; margin-bottom: 8px; font-size: 13px; color: #9a3412; }

  /* EXHIBITS */
  .exhibit-item { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 14px; margin-bottom: 8px; font-size: 13px; }
  .exhibit-item strong { color: #1e40af; }
  .exhibit-item p { color: var(--muted); margin-top: 4px; }

  /* TRANSCRIPT */
  .transcript-section { margin-top: 40px; padding-top: 32px; border-top: 2px solid var(--border); }
  .transcript-line { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
  .transcript-line.flagged { background: #fefce8; margin: 0 -8px; padding: 12px 8px; border-radius: 6px; border-bottom-color: transparent; margin-bottom: 2px; }
  .ts-time { font-family: 'Fira Code', monospace; font-size: 11px; color: var(--muted); min-width: 80px; padding-top: 2px; }
  .ts-body { flex: 1; }
  .ts-flag { font-size: 10px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; display: block; margin-bottom: 4px; }
  .ts-body p { font-size: 13px; color: var(--text); line-height: 1.65; }

  /* SIDEBAR */
  .sidebar { }
  .sidebar-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 18px; margin-bottom: 16px; }
  .sidebar-card .section-title { font-size: 10px; }

  /* FOOTER */
  .report-footer { background: #0f172a; color: #64748b; padding: 20px 48px; font-size: 12px; display: flex; justify-content: space-between; }
  .footer-brand { color: #7c3aed; font-weight: 700; }
</style>
</head>
<body>

<div class="report-header">
  <div>
    <div class="report-brand">⚖️ Deposition Digest</div>
    <div class="report-case">${escHtml(caseLabel)}</div>
    <div class="report-meta">Generated ${new Date().toLocaleString()} · ${segCount} transcript segments</div>
  </div>
  <div class="report-stats">
    <div>
      <div class="stat-num">${(analysis.key_admissions || []).length}</div>
      <div class="stat-label">Key Admissions</div>
    </div>
  </div>
</div>

${analysis.summary ? `<div class="summary-bar"><strong>Summary:</strong> ${escHtml(analysis.summary)}</div>` : ''}

<div class="witness-section">
  <div class="witness-pill">
    <div class="label">Witness Role</div>
    <div class="value">${escHtml(witProfile.likely_role || 'Unknown')}</div>
  </div>
  <div class="witness-pill">
    <div class="label">Demeanor</div>
    <div class="value">${escHtml(witProfile.demeanor_notes || 'Not assessed')}</div>
  </div>
  ${credSignals ? `<div class="cred-signals"><div class="label">Credibility Signals</div><ul>${credSignals}</ul></div>` : ''}
</div>

<div class="main">
  <div class="content">

    <div class="section">
      <div class="section-title">Key Admissions (${(analysis.key_admissions || []).length})</div>
      ${admissionsHtml}
    </div>

    <div class="section">
      <div class="section-title">Contradictions (${(analysis.contradictions || []).length})</div>
      ${contradictionsHtml}
    </div>

    <div class="section">
      <div class="section-title">Favorable Testimony (${(analysis.favorable_testimony || []).length})</div>
      ${favorableHtml}
    </div>

    <div class="section">
      <div class="section-title">Exhibit References</div>
      ${exhibitsHtml}
    </div>

    <div class="transcript-section">
      <div class="section-title">Timestamped Transcript (flagged)</div>
      ${transcriptHtml}
    </div>

  </div>

  <div class="sidebar">

    <div class="sidebar-card">
      <div class="section-title">Follow-Up Questions (${(analysis.follow_up_questions || []).length})</div>
      ${followUpHtml || '<p class="empty">None generated.</p>'}
    </div>

    <div class="sidebar-card">
      <div class="section-title">Red Flags</div>
      ${redFlagsHtml || '<p class="empty">No red flags.</p>'}
    </div>

  </div>
</div>

<div class="report-footer">
  <span>Generated by <span class="footer-brand">Deposition Digest</span> · omideveloper.com</span>
  <span>Confidential — Attorney Work Product</span>
</div>

</body>
</html>`;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { buildHtmlReport };
