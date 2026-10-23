#!/usr/bin/env bash
# Start ComfyUI headless; flags (--lowvram etc.) come from setup.sh's GPU detection.
cd "$(dirname "$0")/.."
source .studio.env
exec .venv/bin/python vendor/ComfyUI/main.py --listen 127.0.0.1 --port 8188 $COMFY_FLAGS
