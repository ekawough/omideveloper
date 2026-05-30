"""CrewAI task definitions — prompts baked with D2D solar context."""

from __future__ import annotations

from textwrap import dedent

from crewai import Task

from .agents import get_crm_writer_agent, get_parser_agent, get_scorer_agent


def make_parse_task(transcript: str, fused_summary: dict) -> Task:
    return Task(
        description=dedent(f"""
            Extract structured information from the following door-to-door
            solar sales conversation. The transcript is diarized (speakers
            labeled 0 and 1). Speaker 0 is most often the rep, speaker 1 the
            homeowner — but treat this as a hint only. Use content cues.

            Do NOT fabricate information. If a field is not explicitly
            discussed, return null.

            Respond with STRICT JSON only — no markdown fences — matching:
            {{
              "homeowner_name":      string | null,
              "homeowner_phone":     string | null,
              "homeowner_email":     string | null,
              "property_address":    string | null,
              "is_homeowner":        boolean | null,
              "current_electric_bill_usd": number | null,
              "has_existing_solar":  boolean | null,
              "roof_condition":      "good" | "fair" | "poor" | null,
              "decision_timeline":   "immediate" | "1-3 months" | "3-6 months" | "6+ months" | null,
              "decision_makers":     [string, ...] | null,
              "expressed_interest":  "high" | "medium" | "low" | null,
              "objections":          [string, ...],
              "next_steps":          string | null
            }}

            Conversation dynamics summary (for context, do not include in output):
            {fused_summary}

            Always respond in English.

            Transcript:
            ---
            {transcript}
            ---
        """).strip(),
        expected_output="A single JSON object matching the schema above.",
        agent=get_parser_agent(),
    )


def make_score_task(parsed_json: str, fused_summary: dict) -> Task:
    return Task(
        description=dedent(f"""
            Score this lead from 1 (cold) to 10 (hot). Consider:

              * Homeowner status and ability to decide
              * Bill size and financial viability
              * Timeline urgency
              * Objections voiced
              * Emotional trajectory — especially acoustic cues:
                  - "suppressed_objection" flags (polite words, negative voice)
                  - sustained enthusiasm vs. cooling after price
              * Consistency between what was said and how it was said

            Respond with STRICT JSON only — no markdown fences — matching:
            {{
              "lead_score":            integer 1-10,
              "score_rationale":       string (2-3 sentences),
              "conversation_summary":  string (2 sentences, factual),
              "key_moments":           [string, ...]      // up to 3 pivotal moments
            }}

            Parsed lead data:
            {parsed_json}

            Always respond in English.

            Sentiment and emotion summary:
            {fused_summary}
        """).strip(),
        expected_output="A single JSON object with lead_score, score_rationale, conversation_summary, and key_moments.",
        agent=get_scorer_agent(),
    )


def make_crm_task(parsed_json: str, scored_json: str) -> Task:
    return Task(
        description=dedent(f"""
            Compose a concise CRM note (3-5 lines) summarizing the lead for a
            sales manager. Use plain text — no markdown.

            Include:
              * Lead score /10 and one-sentence rationale
              * Key objections (if any)
              * Suggested next step
              * Conversation length and date (if provided in metadata)

            Do NOT reveal raw acoustic emotion labels. Translate: e.g. a
            "suppressed_objection" flag becomes "showed hesitation around
            pricing" in the note.

            Respond with STRICT JSON only — no markdown fences — matching:
            {{
              "crm_note":  string,
              "tags":      [string, ...]     // e.g. ["hot-lead", "follow-up-48h"]
            }}

            Parsed lead data:
            {parsed_json}

            Always respond in English.

            Score + analysis:
            {scored_json}
        """).strip(),
        expected_output="A JSON object with crm_note and tags.",
        agent=get_crm_writer_agent(),
    )
