/**
 * Showing Notes Processor
 * Claude extracts structured buyer + property intel from a showing conversation
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a real estate assistant specializing in buyer behavior analysis during property showings.

Your job is to extract structured notes from a real estate agent's conversation or observations during a property showing. This could be the agent talking to themselves, narrating their observations, talking with the buyer, or a mix.

Real estate agents speak casually — "she loved the kitchen, kept saying wow, but immediately asked about the neighbors when she saw the fence was broken, also the master closet was way too small she said, and she wanted to know if they'd take 380" — your job is to turn this into structured CRM-ready notes.

Return a JSON object with this exact structure:

{
  "showing_summary": "2-3 sentence summary of the showing and the buyer's overall reaction",
  "buyer_interest_level": "hot | warm | cold | neutral",
  "buyer_interest_reason": "Why you assessed this interest level based on what was said/observed",
  "property_highlights": [
    "Things the buyer reacted positively to"
  ],
  "property_concerns": [
    "Things the buyer reacted negatively to or questioned"
  ],
  "deal_breakers": [
    "Items that could kill this deal — absolute objections"
  ],
  "must_haves_met": true,
  "must_haves_status": "Explanation of which must-haves were or weren't met",
  "buyer_questions": [
    "Specific questions the buyer asked that need follow-up answers"
  ],
  "price_signals": "Any comments about price, offers, or value — null if none",
  "comparison_properties": [
    "Other properties buyer mentioned comparing to"
  ],
  "lifestyle_notes": {
    "family_situation": "Any family info mentioned (kids, pets, elderly parents)",
    "commute_concerns": "Any location/commute comments",
    "lifestyle_fit": "How this property fits or doesn't fit their lifestyle"
  },
  "recommended_follow_up_action": "suggest | discard | schedule_second_showing | make_offer | needs_info",
  "follow_up_items": [
    {
      "item": "Specific thing to follow up on",
      "responsible": "agent | buyer | listing_agent | other"
    }
  ],
  "draft_follow_up_email": "A short, personalized follow-up email draft the agent can send to the buyer. 3-4 sentences. Reference specific things the buyer said. Warm and professional.",
  "time_spent": "Duration at the property if mentioned, else null",
  "agent_observations": "Any agent-specific notes about the listing, neighborhood, or deal factors"
}

Rules:
- Extract ONLY what was actually said or observed — never invent buyer reactions
- buyer_interest_level must reflect the ACTUAL signals, not just politeness
- deal_breakers should only be listed when the buyer was clearly opposed, not just neutral
- draft_follow_up_email should sound natural and human, not like a template
- Return valid JSON only — no markdown, no explanation
`;

async function processShowingNotes(transcript, context = {}) {
  const userMessage = `
Agent: ${context.agent_name}
Buyer: ${context.buyer_name}
Property: ${context.property_address || 'Not specified'}
MLS #: ${context.mls_number || 'Not specified'}

Showing Notes / Conversation:
---
${transcript}
---

Extract the structured showing notes from this transcript.
`;

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  let raw = response.content[0].text.trim();
  raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

  return JSON.parse(raw);
}

module.exports = { processShowingNotes };
