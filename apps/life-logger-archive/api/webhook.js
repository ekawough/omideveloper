const { Client } = require('@notionhq/client');
const { createClient } = require('@supabase/supabase-js');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const LIFE_LOG_DB = process.env.NOTION_LIFE_LOG_DB_ID;
const DAILY_CONTEXT_PAGE = '32014f5176d081e9a14fea680daaac01';

function classifyKeywords(transcript) {
  const t = transcript.toLowerCase();
  const cleaned = transcript.replace(/^(ethan|speaker[\s_]\d*|speaker\s*\d*):\s*/gi, '').trim();
  const words = cleaned.split(/\s+/);
  const title = words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '');
  const summary = cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned;
  let category = 'Personal / Journal';
  let is_urgent = false;
  // Priority order: most specific → most general
  if (/tesla|railway|supabase|webhook|github|deploy|code|bug|server|vps/.test(t)) category = 'Omi Dev Note';
  else if (/urgent|emergency|asap|immediately/.test(t)) { category = 'Urgent'; is_urgent = true; }
  else if (/\b(daughter|son|kids|children|wife|husband|mom|dad|family|baby)\b/.test(t)) category = 'Family';
  else if (/prospect|client|lead|networking|met someone|just met/.test(t)) category = 'Stranger / Networking';
  else if (/agency|tiktok|revenue|marketing|ghl|dropship|affiliate|white label|saas|launch a/.test(t)) category = 'Business Thought';
  else if (/what if|i could build|new app|new product|new idea/.test(t)) category = 'Idea';
  else if (/i need to|i have to|remind me|to do|call|schedule|book|follow up|send over/.test(t)) category = 'Task / To-Do';
  return { category, title, summary, is_urgent };
}

async function classifyTranscript(transcript) {
  const cleaned = transcript.replace(/^(ethan|speaker[\s_]\d*|speaker\s*\d*):\s*/gi, '').trim();
  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Classify this voice transcript into exactly ONE category. Return ONLY raw JSON, no markdown, no backticks.\n\nTranscript: "' + cleaned + '"\n\nFormat: {"category":"CATEGORY","title":"TITLE","summary":"SUMMARY","is_urgent":false}\n\nCATEGORY rules (pick the BEST fit, not the first that applies):\n- Urgent: contains words like urgent, emergency, asap, immediately\n- Omi Dev Note: about coding, servers, webhooks, bugs, deployment, Railway, Supabase, GitHub, APIs\n- Business Thought: revenue ideas, agency, marketing, clients, business models, pricing strategies\n- Idea: "what if", "I could build", new product concepts, creative concepts NOT tied to a specific task\n- Task / To-Do: specific action to do — call someone, book something, buy something, send something\n- Family: mentions spouse, kids, daughter, son, wife, husband, mom, dad, family\n- Stranger / Networking: meeting or mentioning a specific person met, prospect, lead, contact\n- Personal / Journal: feelings, workouts, personal reflection, daily life, food, health\n\nIMPORTANT: If transcript mentions family members, use Family even if it sounds like a task. If it is a creative "what if" concept, use Idea even if it sounds actionable.\n\nTITLE: 5-8 specific words from what was said.\nSUMMARY: 1-2 sentences capturing the key point.' }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
        thinkingConfig: { thinkingBudget: 0 }
      })
    });
    const data = await res.json();
    const raw = data.candidates[0].content.parts[0].text.trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no json');
    const p = JSON.parse(match[0]);
    const words = cleaned.split(/\s+/);
    const fallback = words.slice(0, 7).join(' ') + (words.length > 7 ? '...' : '');
    const result = {
      category: p.category || 'Personal / Journal',
      title: (p.title && p.title.length > 3) ? p.title : fallback,
      summary: p.summary || cleaned.substring(0, 150),
      is_urgent: p.is_urgent || false
    };
    return applyOverrides(result, cleaned);
  } catch (err) {
    console.log('[LIFE-LOG] Gemini failed, using keywords:', err.message);
    return classifyKeywords(transcript);
  }
}

// Override Gemini when hard keyword signals are present — more reliable than prompt instructions
function applyOverrides(c, text) {
  const t = text.toLowerCase();
  // Family always wins when family members are explicitly named
  if (/\b(daughter|son|kids|wife|husband|mom|dad|family|children|baby|toddler)\b/.test(t)) {
    c.category = 'Family';
  }
  // Urgent always wins
  if (/\b(urgent|emergency|asap|immediately|right now|right away)\b/.test(t)) {
    c.category = 'Urgent';
    c.is_urgent = true;
  }
  // Idea wins over Task when "what if" or creative build concepts appear
  if (c.category === 'Task / To-Do' && /\bwhat if\b|\bi could build\b|\bnew app idea\b|\bnew product idea\b/.test(t)) {
    c.category = 'Idea';
  }
  return c;
}

async function logToSupabase({ rawTranscript, category, summary, isUrgent }) {
  const { error } = await supabase.from('omi_captures').insert({ raw_transcript: rawTranscript, category, processed_content: summary, routed_to: 'notion:life-log', is_urgent: isUrgent, is_actioned: false });
  if (error) console.error('[LIFE-LOG] Supabase error:', error.message);
}

async function logToNotion({ title, summary, rawTranscript, category, durationSecs, isUrgent }) {
  const today = new Date().toISOString().split('T')[0];
  await notion.pages.create({
    parent: { database_id: LIFE_LOG_DB },
    properties: {
      Title: { title: [{ text: { content: title } }] },
      Category: { select: { name: category } },
      Summary: { rich_text: [{ text: { content: summary } }] },
      'Raw Transcript': { rich_text: [{ text: { content: rawTranscript.substring(0, 2000) } }] },
      Date: { date: { start: today } },
      ...(durationSecs ? { 'Duration (sec)': { number: durationSecs } } : {}),
      Actioned: { checkbox: false }
    }
  });
}

async function appendToDailyContext({ title, category, summary }) {
  try {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' });
    await notion.blocks.children.append({
      block_id: DAILY_CONTEXT_PAGE,
      children: [{
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [
            { type: 'text', text: { content: `[${time}] ` }, annotations: { color: 'gray' } },
            { type: 'text', text: { content: `${category}: ` }, annotations: { bold: true } },
            { type: 'text', text: { content: `${title} — ${summary}` } }
          ]
        }
      }]
    });
  } catch (err) {
    console.error('[LIFE-LOG] Daily context update failed:', err.message);
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    const segments = body.transcript_segments || body.segments || [];
    if (!segments.length && !body.transcript) return res.status(200).json({ status: 'ignored' });
    const rawTranscript = segments.length ? segments.map(s => (s.speaker || 'Speaker') + ': ' + s.text).join('\n') : (body.transcript || '');
    if (rawTranscript.trim().length < 10) return res.status(200).json({ status: 'ignored' });
    const durationSecs = segments.length ? Math.round((segments[segments.length - 1].end || 0) - (segments[0].start || 0)) : null;
    console.log('[LIFE-LOG] Processing (' + rawTranscript.length + ' chars)');
    const c = await classifyTranscript(rawTranscript);
    console.log('[LIFE-LOG] -> ' + c.category + ' | "' + c.title + '"');
    await Promise.all([
      logToNotion({ title: c.title, summary: c.summary, rawTranscript, category: c.category, durationSecs, isUrgent: c.is_urgent }),
      logToSupabase({ rawTranscript, category: c.category, summary: c.summary, isUrgent: c.is_urgent }),
      appendToDailyContext({ title: c.title, category: c.category, summary: c.summary })
    ]);
    console.log('[LIFE-LOG] Logged + Daily Context updated');
    res.json({ status: 'logged', category: c.category, title: c.title });
  } catch (err) {
    console.error('[LIFE-LOG] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
