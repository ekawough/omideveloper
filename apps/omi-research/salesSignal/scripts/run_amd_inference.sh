#!/usr/bin/env bash
# Start vLLM on an AMD MI300X (AMD Developer Cloud).
#
# WHY every env var matters:
#   VLLM_ROCM_USE_AITER=1          enable AITer attention kernels (fast path)
#   VLLM_ROCM_USE_AITER_FP4BMM=0   MXFP4 bmm is broken on MI300X; without this
#                                  vLLM segfaults on the first inference call
#   HIP_FORCE_DEV_KERNARG=1        reduces kernel-launch latency on CDNA3
#   TORCH_BLAS_PREFER_HIPBLASLT=1  hipBLASLt is faster than rocBLAS on MI300X
#
# Image: vllm/vllm-openai-rocm:v0.19.0
#   * NOT vllm/vllm-openai (that's CUDA)
#   * NOT rocm/vllm (deprecated fork)
#
# Usage: HF_TOKEN=hf_… bash run_amd_inference.sh
set -euo pipefail

: "${HF_TOKEN:?HF_TOKEN must be set — needed to pull Llama-3.1-8B-Instruct weights}"

MODEL="${MODEL:-meta-llama/Llama-3.1-8B-Instruct}"
PORT="${PORT:-8000}"
GPU_UTIL="${GPU_UTIL:-0.90}"
MAX_MODEL_LEN="${MAX_MODEL_LEN:-8192}"
IMAGE="${IMAGE:-vllm/vllm-openai-rocm:v0.19.0}"

export VLLM_ROCM_USE_AITER=1
export VLLM_ROCM_USE_AITER_FP4BMM=0
export HIP_FORCE_DEV_KERNARG=1
export TORCH_BLAS_PREFER_HIPBLASLT=1

docker run --rm -it \
  --network=host \
  --group-add=video --ipc=host \
  --cap-add=SYS_PTRACE \
  --security-opt seccomp=unconfined \
  --device /dev/kfd --device /dev/dri \
  -e HF_TOKEN="$HF_TOKEN" \
  -e VLLM_ROCM_USE_AITER=1 \
  -e VLLM_ROCM_USE_AITER_FP4BMM=0 \
  -e HIP_FORCE_DEV_KERNARG=1 \
  -e TORCH_BLAS_PREFER_HIPBLASLT=1 \
  -v "${HOME}/.cache/huggingface:/root/.cache/huggingface" \
  "$IMAGE" \
  vllm serve "$MODEL" \
    --dtype bfloat16 \
    --host 0.0.0.0 --port "$PORT" \
    --gpu-memory-utilization "$GPU_UTIL" \
    --max-model-len "$MAX_MODEL_LEN"
