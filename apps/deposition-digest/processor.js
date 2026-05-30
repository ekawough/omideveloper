const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a legal AI assistant specializing in deposition analysis. You have deep expertise in civil litigation, evidence law, and deposition strategy.

Your job: analyze raw deposition transcripts and extract the highest-value legal intelligence.

You ALWAYS output valid JSON matching the schema provided. No markdown, no prose outside the JSON.`;

const ANALYSIS_PROMPT = (fullTranscript) => `Analyze this deposition transcript and return a JSON object with this exact structure:

{
  "summary": "2-3 sentence overview of what this deposition covered and who was deposed",
  "witness_profile": {
    "likely_role": "plaintiff | defendant | expert | fact_witness | unknown",
    "credibility_signals": ["list of observations about witness credibility"],
    "demeanor_notes": "any observable patterns in responses (evasive, forthcoming, confused, etc.)"
  },
  "key_admissions": [
    {
      "admission": "exact quote or close paraphrase of the admission",
      "significance": "why this matters legally",
      "timestamp_hint": "approximate location in transcript",
      "strength": "strong | moderate | weak"
    }
  ],
  "contradictions": [
    {
      "statement_a": "first statement",
      "statement_b": "contradicting statement",
      "significance": "how this contradiction can be used"
    }
  ],
  "favorable_testimony": [
    {
      "quote": "testimony favorable to a likely plaintiff or defendant position",
      "use": "how to use this at trial"
    }
  ],
  "exhibit_references": [
    {
      "description": "what was referenced",
      "context": "what was said about it"
    }
  ],
  "follow_up_questions": [
    "Question that should be asked in follow-up deposition or at trial based on gaps or openings in this testimony"
  ],
  "red_flags": [
    "Anything unusual, potentially perjurious, evasive patterns, or legally significant warnings"
  ],
  "timestamped_transcript": [
    {
      "timestamp": "approximate time or segment number",
      "text": "the transcript text for this segment",
      "flag": "admission | contradiction | favorable | exhibit | none"
    }
  ]
}

TRANSCRIPT:
${fullTranscript}

Return ONLY the JSON object. No markdown, no explanation.`;

async function processDeposition(session) {
  // Combine all segments into a full transcript
  const fullTranscript = session.segments
    .map((seg, i) => `[Segment ${i + 1} — ${formatTimestamp(seg.timestamp)}]\n${seg.text}`)
    .join('\n\n');

  const message = await client.messages.create({
    model:      'claude-opus-4-5',
    max_tokens: 4096,
    messages: [
      {
        role:    'user',
        content: ANALYSIS_PROMPT(fullTranscript),
      },
    ],
    system: SYSTEM_PROMPT,
  });

  const raw = message.content[0].text.trim();

  // Strip any accidental markdown code fences
  const jsonStr = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');

  try {
    return JSON.parse(jsonStr);
  } catch {
    console.error('JSON parse failed, raw response:', raw.slice(0, 500));
    throw new Error('Claude returned invalid JSON — check raw response above');
  }
}

function formatTimestamp(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoString;
  }
}

module.exports = { processDeposition };
