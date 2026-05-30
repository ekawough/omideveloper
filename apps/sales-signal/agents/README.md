# agents — CrewAI pipeline + emotion + CRM

FastAPI service. Called by `webhook/` at end-of-conversation.

## Flow

```
POST /process
  │
  ├─ load PCM from Supabase Storage
  ├─ emotion_analyzer.analyze_segments()   (SenseVoice / emotion2vec / SpeechBrain)
  ├─ sentiment_fusion.fuse()                (text + acoustic per segment)
  ├─ CrewAI:
  │    Parser    → structured lead JSON
  │    Scorer    → 1-10 score + dynamics commentary
  │    CRM Writer → CRM note
  ├─ ghl_crm.push_lead()
  ├─ hubspot_crm.push_lead()
  └─ notifier.mark_completed()              (Supabase → admin panel realtime)
```

## Local dev

```bash
cp .env.template .env             # fill in values
python -m venv venv
# macOS/Linux:
source venv/bin/activate
# Windows bash:
source venv/Scripts/activate
pip install -r requirements.txt
python -m uvicorn agents.pipeline:app --reload --port 8000
```

## AMD ROCm setup

If you're running emotion colocated with vLLM on the MI300X:

```bash
pip install torch torchaudio --index-url https://download.pytorch.org/whl/rocm6.0
```

Standard PyPI torch is CPU-only; the command above is the AMD GPU build.

## Why not LangChain / litellm?

* CrewAI 1.14 ships its own `LLM` primitive. Using `ChatOpenAI` from LangChain
  works but adds a dependency and a class of bugs.
* `litellm` was compromised in a supply-chain attack in March 2026. We skip it
  entirely and use CrewAI's native `openai/` provider prefix with `base_url`
  pointing at vLLM.
