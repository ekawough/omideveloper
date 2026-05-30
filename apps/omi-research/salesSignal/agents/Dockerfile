# Python agent pipeline.
# Note: emotion models (SenseVoice, emotion2vec, SpeechBrain) pull ~2GB of
# weights on first run; mount a volume in prod to cache them. For demo purposes
# they can auto-download inside the container on cold start.
FROM python:3.11-slim

WORKDIR /app

# System deps for audio I/O + scientific stack.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    ffmpeg libsndfile1 build-essential \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# CPU torch — Railway doesn't have GPUs. Emotion models still run on CPU for demo.
# For the AMD GPU path (vLLM host), emotion can be collocated there via the
# scripts/setup_emotion_model.sh helper.
RUN pip install --no-cache-dir \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements.txt

COPY . ./agents/

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

# The package path is `agents.pipeline`, mounted under /app/agents.
CMD ["python", "-m", "uvicorn", "agents.pipeline:app", "--host", "0.0.0.0", "--port", "8000"]
