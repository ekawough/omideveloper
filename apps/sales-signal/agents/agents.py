"""CrewAI agents for SalesSignal.

Three agents, all sharing one LLM (Llama 3.1 8B on AMD MI300X via vLLM):

  1. Parser            — pull structured lead data out of a diarized transcript
  2. Scorer/Analyst    — lead score 1-10 + conversation dynamics commentary
  3. CRM Writer        — push contact + note into GHL AND HubSpot

Context:
  * D2D solar sales — rep wears Omi, visits homeowner, talks about panels.
  * speaker 0 is usually the rep; speaker 1 is usually the homeowner, but
    Deepgram diarization is not guaranteed, so downstream code must treat
    speaker labels as hints, not truth.
  * Llama 3.1 8B is strong at extraction but struggles with strict Pydantic
    outputs — prefer `output_json` with tolerant post-parsing.
  * LLM and agents are lazily constructed so the service can start even if
    the AMD endpoint is temporarily down — requests will fail, but /health
    still works and Railway won't restart-loop.
"""

from __future__ import annotations

from functools import lru_cache

from crewai import Agent

from .tools.amd_llm import build_llm


@lru_cache(maxsize=1)
def _get_llm():
    """Construct the LLM once on first request, not at import time."""
    return build_llm()


def get_parser_agent() -> Agent:
    return Agent(
        role="D2D Sales Conversation Parser",
        goal=(
            "Extract accurate, structured lead information from a diarized "
            "door-to-door sales conversation transcript."
        ),
        backstory=(
            "You have parsed thousands of field sales conversations. You know that "
            "homeowners rarely spell their name or address, that phone numbers may "
            "be spoken with pauses, and that 'we already have solar' means the "
            "lead is unqualified. You never fabricate information — if something "
            "is not stated, you leave it null."
        ),
        llm=_get_llm(),
        allow_delegation=False,
        verbose=False,
        max_iter=3,
    )


def get_scorer_agent() -> Agent:
    return Agent(
        role="Sales Lead Scorer and Conversation Analyst",
        goal=(
            "Given structured lead data and fused sentiment signals, produce a "
            "lead score from 1 (cold) to 10 (hot) with a concise rationale and a "
            "two-sentence summary of the conversation dynamics."
        ),
        backstory=(
            "You are a veteran solar sales manager. You weigh homeowner status, "
            "bill size, timeline, objections, and — critically — the emotional "
            "trajectory of the call. A homeowner who sounds enthusiastic early "
            "but whose voice shifts to skepticism after pricing is a 5, not a 9. "
            "Suppressed objections (polite words, angry voice) are a red flag."
        ),
        llm=_get_llm(),
        allow_delegation=False,
        verbose=False,
        max_iter=3,
    )


def get_crm_writer_agent() -> Agent:
    return Agent(
        role="CRM Integration Writer",
        goal=(
            "Write the lead to GoHighLevel and HubSpot accurately, producing a "
            "short AI note that captures the conversation's essence."
        ),
        backstory=(
            "You are fanatically careful about CRM hygiene. You never write junk "
            "data. If the lead is unqualified, you still create the contact but "
            "tag it appropriately. You never include private acoustic-emotion "
            "labels in the homeowner-facing note."
        ),
        llm=_get_llm(),
        allow_delegation=False,
        verbose=False,
        max_iter=2,
    )
