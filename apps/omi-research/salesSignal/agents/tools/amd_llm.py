"""CrewAI LLM wrapper pointing at our AMD MI300X vLLM endpoint.

Gotchas:
  * Do NOT import langchain.ChatOpenAI — CrewAI 1.14 uses its own LLM.
  * Do NOT add litellm in front — the March 2026 supply-chain attack bricked
    several hackathon teams. CrewAI's `openai/` provider works natively.
  * `api_key` must be a non-empty string ("not-needed" is the convention); the
    openai SDK raises on None.
  * vLLM requires VLLM_ROCM_USE_AITER_FP4BMM=0 on MI300X or it segfaults on
    first request. That env var is set in scripts/run_amd_inference.sh, not
    here.
"""

from __future__ import annotations

import os
from crewai import LLM

AMD_INFERENCE_URL = os.environ.get(
    "AMD_INFERENCE_URL", "http://localhost:8000/v1"
)
LLAMA_MODEL = os.environ.get(
    "LLAMA_MODEL", "meta-llama/Llama-3.1-8B-Instruct"
)


def build_llm() -> LLM:
    """Factory so the object is constructed once agents are imported."""
    return LLM(
        model=f"openai/{LLAMA_MODEL}",
        base_url=AMD_INFERENCE_URL,
        api_key=os.environ.get("AMD_API_KEY", "not-needed"),
        temperature=0.2,
        max_tokens=1024,
    )
