const { Client } = require('@notionhq/client');
const { createClient } = require('@supabase/supabase-js');

const EMPIRE_STATUS_PAGE = '32014f5176d0812f889fe6f16a70ddf5';
const DAILY_CONTEXT_PAGE = '32014f5176d081e9a14fea680daaac01';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

module.exports = async (req, res) => {
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers['authorization'] !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const dateLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Pull today's Omi captures from Supabase
  const { data: entries, error } = await supabase
    .from('omi_captures')
    .select('category, processed_content, created_at, is_urgent')
    .gte('created_at', today + 'T00:00:00')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[DAILY-SUMMARY] Supabase error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  if (!entries?.length) {
    console.log('[DAILY-SUMMARY] No entries today');
    return res.json({ status: 'no entries', date: today });
  }

  // Group by category for stats
  const stats = {};
  for (const e of entries) {
    stats[e.category] = (stats[e.category] || 0) + 1;
  }
  const statsLine = Object.entries(stats).map(([k, v]) => `${v} ${k}`).join(', ');
  const urgentEntries = entries.filter(e => e.is_urgent);

  // Generate digest with Gemini
  const entriesText = entries.map(e => `[${e.category}] ${e.processed_content}`).join('\n');
  let digest = '';
  try {
    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are summarizing Ethan's day based on his Omi voice notes. Write 4-6 specific bullet points capturing the key themes, decisions, and activities. Be concrete — use actual names, numbers, and details from the entries. No intro sentence, just bullets.\n\nToday's entries (${entries.length} total):\n\n${entriesText}` }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 400 }
      })
    });
    const gData = await geminiRes.json();
    digest = gData.candidates[0].content.parts[0].text.trim();
  } catch (err) {
    console.error('[DAILY-SUMMARY] Gemini failed:', err.message);
    digest = entries.slice(0, 5).map(e => `${e.category}: ${e.processed_content}`).join('\n');
  }

  const digestBullets = digest.split('\n')
    .filter(l => l.trim())
    .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter(l => l.length > 0);

  // Build Notion blocks
  const blocks = [
    {
      type: 'heading_3',
      heading_3: { rich_text: [{ type: 'text', text: { content: `Omi Daily Digest — ${dateLabel}` } }] }
    },
    {
      type: 'paragraph',
      paragraph: { rich_text: [{ type: 'text', text: { content: `${entries.length} notes captured: ${statsLine}` }, annotations: { color: 'gray' } }] }
    },
    ...digestBullets.map(line => ({
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'text', text: { content: line } }] }
    })),
    ...(urgentEntries.length ? [{
      type: 'callout',
      callout: {
        rich_text: [{ type: 'text', text: { content: `URGENT: ${urgentEntries.map(e => e.processed_content).join(' | ')}` } }],
        icon: { emoji: '🚨' },
        color: 'red_background'
      }
    }] : []),
    { type: 'divider', divider: {} }
  ];

  // Append to Empire Status
  await notion.blocks.children.append({ block_id: EMPIRE_STATUS_PAGE, children: blocks });

  // Reset Daily Context for tomorrow — append a separator with tomorrow's date
  const tomorrow = new Date(now.getTime() + 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  await notion.blocks.children.append({
    block_id: DAILY_CONTEXT_PAGE,
    children: [
      { type: 'divider', divider: {} },
      { type: 'heading_3', heading_3: { rich_text: [{ type: 'text', text: { content: tomorrow } }] } }
    ]
  });

  console.log(`[DAILY-SUMMARY] Done — ${entries.length} entries digested, Empire Status updated`);
  res.json({ status: 'updated', entries: entries.length, date: today, categories: stats });
};
