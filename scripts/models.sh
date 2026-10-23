#!/usr/bin/env bash
# Opt-in multi-GB model downloads for AI images/clips. Run: scripts/models.sh
# Model choice depends on VRAM tier in .studio.env. Have Claude verify current repo names/licenses first.
cd "$(dirname "$0")/.."
source .studio.env
M=vendor/ComfyUI/models
case "$TIER" in
  cpu) echo "No GPU: skipping model downloads. Use remotion_animation / text_only visuals."; exit 0;;
esac
.venv/bin/pip --version >/dev/null 2>&1 || uv pip install --python .venv/bin/python -q "huggingface_hub[cli]"
HF=".venv/bin/hf"; [ -x "$HF" ] || uv pip install --python .venv/bin/python -q huggingface_hub
# Wan 2.2 TI2V-5B (Apache 2.0) via ComfyUI repackaged files; fits 8GB with --lowvram
$HF download Comfy-Org/Wan_2.2_ComfyUI_Repackaged \
  split_files/diffusion_models/wan2.2_ti2v_5B_fp16.safetensors \
  split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors \
  split_files/vae/wan2.2_vae.safetensors --local-dir "$M/_wan"
mkdir -p "$M/diffusion_models" "$M/text_encoders" "$M/vae"
mv -n "$M"/_wan/split_files/diffusion_models/* "$M/diffusion_models/"
mv -n "$M"/_wan/split_files/text_encoders/* "$M/text_encoders/"
mv -n "$M"/_wan/split_files/vae/* "$M/vae/"
rm -rf "$M/_wan"
echo "Image model: ask Claude to pick a current quantized Flux/SDXL checkpoint for tier=$TIER."
