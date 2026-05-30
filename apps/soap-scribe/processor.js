/**
 * SOAP Scribe Processor
 * Claude generates a clinical SOAP note from a patient visit conversation
 *
 * HIPAA note: Transcript is sent to Anthropic API.
 * Ensure you have a BAA with Anthropic before using with real PHI.
 * Anthropic BAA available at: console.anthropic.com → Settings → Privacy
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  // Do not log requests — PHI protection
  defaultHeaders: {},
});

const SOAP_PROMPT = `You are a clinical documentation specialist helping physicians and nurse practitioners document patient visits.

Generate a complete, accurate SOAP note from the provided clinical conversation transcript. The transcript may include the clinician talking to the patient, dictating observations, or both.

Write in clear clinical language appropriate for an EHR. Be precise, use standard medical terminology, and never fabricate findings that weren't mentioned.

Return a JSON object:

{
  "soap_format": "soap",
  "subjective": "Patient's chief complaint and history in narrative form. Include: CC, HPI, ROS, medications, allergies, social history if mentioned.",
  "objective": "Examination findings, vital signs, lab results, imaging — only what was actually stated or observed. Use 'Not documented' for items not mentioned.",
  "assessment": "Clinical impression and diagnosis. Use precise diagnostic language. If differential, list with most likely first.",
  "plan": "Treatment plan in numbered list format: medications (with dose/frequency/duration), referrals, orders, patient instructions, return precautions.",
  "icd10_codes": [
    {
      "code": "ICD-10 code",
      "description": "Condition name",
      "type": "primary | secondary"
    }
  ],
  "cpt_suggestions": [
    {
      "code": "CPT code",
      "description": "Service description",
      "note": "Reason for suggestion"
    }
  ],
  "follow_up": "Follow-up instructions — timeframe and reason",
  "prescriptions": [
    {
      "medication": "Drug name",
      "dose": "Dose",
      "route": "PO | IM | SQ | topical | etc.",
      "frequency": "QD | BID | TID | PRN | etc.",
      "quantity": "Dispense amount",
      "refills": "Number of refills",
      "sig": "Patient instructions"
    }
  ],
  "orders": [
    "Lab orders, imaging, referrals, or other orders mentioned"
  ],
  "patient_education": "Any education provided to patient about their condition or treatment",
  "time_based_billing": "Time spent if mentioned (for time-based billing)",
  "clinical_flags": [
    "Any safety concerns, red flags, or urgent findings requiring immediate attention"
  ]
}

Rules:
- NEVER fabricate clinical findings, diagnoses, or medications not mentioned in the transcript
- Use "Not documented" for sections with no data — never guess
- ICD-10 codes should be as specific as possible (7th character where applicable)
- CPT suggestions should match the documented visit complexity
- clinical_flags should highlight anything requiring immediate follow-up
- Return valid JSON only — no markdown, no explanation
`;

const DAP_PROMPT = `You are a behavioral health documentation specialist. Generate a DAP (Data, Assessment, Plan) therapy note.

Return JSON:
{
  "soap_format": "dap",
  "data": "Objective observations and patient report from the session. Appearance, affect, mood, content of thought, behaviors observed.",
  "assessment": "Clinical interpretation of the session data. Progress toward treatment goals, diagnosis status, risk assessment.",
  "plan": "Interventions used, homework assigned, next session focus, any coordination of care.",
  "risk_assessment": {
    "suicidal_ideation": "Present | Absent | Not assessed",
    "homicidal_ideation": "Present | Absent | Not assessed",
    "self_harm": "Present | Absent | Not assessed",
    "risk_level": "low | moderate | high | not_assessed",
    "safety_plan": "Active | Not applicable | Reviewed"
  },
  "icd10_codes": [{ "code": "", "description": "", "type": "primary | secondary" }],
  "follow_up": "Next appointment and focus",
  "clinical_flags": []
}
Return valid JSON only.`;

const BIRP_PROMPT = `Generate a BIRP (Behavior, Intervention, Response, Plan) note for behavioral health.

Return JSON:
{
  "soap_format": "birp",
  "behavior": "Client's presenting behaviors, affect, mood, and reported symptoms during session.",
  "intervention": "Therapeutic interventions used during the session.",
  "response": "Client's response to interventions — engagement, insight, affect changes.",
  "plan": "Plan for next session, homework, any referrals or coordination needed.",
  "icd10_codes": [{ "code": "", "description": "", "type": "primary | secondary" }],
  "risk_assessment": {
    "suicidal_ideation": "Present | Absent | Not assessed",
    "risk_level": "low | moderate | high | not_assessed"
  },
  "follow_up": "",
  "clinical_flags": []
}
Return valid JSON only.`;

function getSystemPrompt(format) {
  switch (format) {
    case 'dap': return DAP_PROMPT;
    case 'birp': return BIRP_PROMPT;
    default: return SOAP_PROMPT;
  }
}

async function processSoapNote(transcript, context = {}) {
  const { clinician_name, patient_initials, visit_type, specialty, soap_format } = context;

  const userMessage = `
Clinician: ${clinician_name}
Patient: ${patient_initials} (initials only)
Visit Type: ${visit_type || 'office_visit'}
Specialty: ${specialty || 'primary_care'}
Note Format: ${soap_format || 'soap'}

Clinical Visit Transcript:
---
${transcript}
---

Generate the ${(soap_format || 'soap').toUpperCase()} note from this visit.
`;

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 3000,
    system: getSystemPrompt(soap_format || 'soap'),
    messages: [{ role: 'user', content: userMessage }],
  });

  let raw = response.content[0].text.trim();
  raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

  return JSON.parse(raw);
}

module.exports = { processSoapNote };
