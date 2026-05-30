#!/usr/bin/env bash
# Pre-warm the acoustic-emotion model weights on the AMD instance so the first
# /process request does not stall for 30s pulling weights.
#
# Tries SenseVoice first, falls back to emotion2vec+ large, then SpeechBrain.
set -euo pipefail

pip install --upgrade pip
pip install torch torchaudio --index-url https://download.pytorch.org/whl/rocm6.0 || \
  pip install torch torchaudio
pip install funasr speechbrain numpy soundfile

python - <<'PY'
try:
    from funasr import AutoModel
    print("warming SenseVoice-Small …")
    AutoModel(model="iic/SenseVoiceSmall", trust_remote_code=True)
    print("SenseVoice ready")
except Exception as e:
    print("SenseVoice failed:", e)
    try:
        from funasr import AutoModel
        print("warming emotion2vec+ large …")
        AutoModel(model="iic/emotion2vec_plus_large", trust_remote_code=True)
        print("emotion2vec+ ready")
    except Exception as e2:
        print("emotion2vec+ failed:", e2)
        from speechbrain.inference.interfaces import foreign_class
        print("warming SpeechBrain wav2vec2-IEMOCAP …")
        foreign_class(
            source="speechbrain/emotion-recognition-wav2vec2-IEMOCAP",
            pymodule_file="custom_interface.py",
            classname="CustomEncoderWav2vec2Classifier",
        )
        print("SpeechBrain ready")
PY
