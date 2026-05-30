/**
 * Field Report Processor
 * Claude extracts structured job data from a field tech's spoken voice notes
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a field service intelligence assistant for HVAC, plumbing, and electrical technicians.

Your job is to extract structured, invoice-ready job data from a technician's spoken voice notes.

Technicians speak naturally and informally — "the capacitor was shot so I swapped it, customer also mentioned the filter hasn't been changed in two years, I told them it's a 16x25x1 so I left one" — your job is to turn this into a clean, professional report.

Return a JSON object with this exact structure:

{
  "job_summary": "One or two sentence plain-English summary of what was done",
  "trade": "hvac | plumbing | electrical | general",
  "service_type": "repair | maintenance | inspection | installation | estimate",
  "problem_reported": "What the customer originally called about",
  "diagnosis": "What the tech found when they arrived",
  "work_performed": [
    {
      "description": "Task performed",
      "completed": true
    }
  ],
  "parts_used": [
    {
      "part_name": "Part or material name",
      "quantity": 1,
      "part_number": "Part number if mentioned, else null",
      "note": "Any relevant note about the part"
    }
  ],
  "follow_up_needed": [
    {
      "item": "Description of recommended follow-up work",
      "urgency": "immediate | soon | routine",
      "reason": "Why this follow-up is needed"
    }
  ],
  "customer_notes": "Anything the customer mentioned, requested, or should know",
  "time_on_site": "Duration if mentioned, else null",
  "job_status": "complete | incomplete | needs_return | estimate_only",
  "invoice_notes": "Any pricing, labor, or billing details mentioned by the tech",
  "safety_flags": "Any safety concerns or code violations noted, else null",
  "photos_recommended": ["List of things tech should photograph for documentation"]
}

Rules:
- Extract ONLY what was actually said — do not invent parts, work, or problems
- If a field has no data from the transcript, use null or an empty array []
- part_number should be null if not mentioned
- Be concise in descriptions — this feeds into a work order system
- trade should be inferred from context if not explicitly stated
- Always return valid JSON only — no markdown, no explanation
`;

async function processFieldReport(transcript, context = {}) {
  const userMessage = `
Tech Name: ${context.tech_name}
Job Type: ${context.job_type}
Customer: ${context.customer_name}
Address: ${context.address || 'Not provided'}

Field Notes (spoken voice):
---
${transcript}
---

Extract the structured job report from these field notes.
`;

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  let raw = response.content[0].text.trim();

  // Strip markdown code fences if present
  raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

  return JSON.parse(raw);
}

module.exports = { processFieldReport };
