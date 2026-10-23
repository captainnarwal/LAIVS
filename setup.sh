#!/usr/bin/env bash
# Idempotent setup for WSL2/Ubuntu or native Linux. Re-run any time.
set -euo pipefail
cd "$(dirname "$0")"

echo "== system packages"
PKGS="ffmpeg git curl unzip build-essential espeak-ng libnss3 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 libxdamage1 libgbm-dev libcups2"
PKGS="$PKGS $(apt-cache show libasound2t64 >/dev/null 2>&1 && echo libasound2t64 || echo libasound2)"
MISSING=""; for p in $PKGS; do dpkg -s "$p" >/dev/null 2>&1 || MISSING="$MISSING $p"; done
[ -z "$MISSING" ] || { sudo apt-get update -qq && sudo apt-get install -y $MISSING; }

command -v node >/dev/null || { echo "Install Node 20+ (e.g. via nvm) and re-run"; exit 1; }
command -v uv >/dev/null || curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

echo "== detect GPU"
TORCH_INDEX=cpu; VRAM=0
if command -v nvidia-smi >/dev/null && nvidia-smi >/dev/null 2>&1; then
  VRAM=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -1)
  CC=$(nvidia-smi --query-gpu=compute_cap --format=csv,noheader | head -1 | tr -d .)
  # Blackwell (RTX 50, cc 12.x) needs cu128; cu128 wheels also cover older GPUs
  if [ "${CC:-0}" -ge 120 ]; then TORCH_INDEX=cu128; else TORCH_INDEX=cu124; fi
else
  echo "No NVIDIA GPU visible: installing CPU torch; AI image/video generation will be skipped."
fi
if   [ "$VRAM" -ge 20000 ]; then TIER=high; COMFY_FLAGS=""
elif [ "$VRAM" -ge 11000 ]; then TIER=mid;  COMFY_FLAGS=""
elif [ "$VRAM" -gt 0 ];     then TIER=low;  COMFY_FLAGS="--lowvram"
else TIER=cpu; COMFY_FLAGS="--cpu"; fi
printf 'VRAM_MB=%s\nTIER=%s\nTORCH_INDEX=%s\nCOMFY_FLAGS="%s"\n' "$VRAM" "$TIER" "$TORCH_INDEX" "$COMFY_FLAGS" > .studio.env
echo "VRAM=${VRAM}MB tier=$TIER torch=$TORCH_INDEX"

echo "== python env"
[ -d .venv ] || uv venv --python 3.12 .venv
# re-pick the wheel if the GPU changed since the last run
.venv/bin/python -c "import torch,sys;sys.exit(0 if '+$TORCH_INDEX' in torch.__version__ else 1)" 2>/dev/null || \
uv pip install --python .venv/bin/python --reinstall-package torch --reinstall-package torchvision --reinstall-package torchaudio \
  torch torchvision torchaudio --index-url "https://download.pytorch.org/whl/$TORCH_INDEX"
uv pip install --python .venv/bin/python -r requirements.txt

echo "== ComfyUI"
[ -d vendor/ComfyUI ] || git clone --depth 1 https://github.com/comfyanonymous/ComfyUI vendor/ComfyUI
uv pip install --python .venv/bin/python -r vendor/ComfyUI/requirements.txt

echo "== Remotion"
(cd remotion-app && npm ci)

echo "== checks"
scripts/py scripts/doctor.py
