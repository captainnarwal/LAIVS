# 04 Setup and hardware

## What `./setup.sh` does
In order. Each step is skipped if already done, so you can re-run it any time.

1. **System packages** via apt: ffmpeg, espeak-ng (for Kokoro), and the libraries headless Chrome needs for Remotion. Only missing ones are installed (this is the only step that uses `sudo`).
2. **Checks Node** is present (you install this yourself) and installs `uv` (a fast Python manager) if missing.
3. **Detects your GPU** with `nvidia-smi`: VRAM and compute capability. Writes the result to `.studio.env`.
4. **Python 3.12 venv** in `.venv/` (uv downloads Python 3.12 itself, so your system Python version does not matter).
5. **PyTorch** with the right CUDA build: `cu128` for RTX 50-series (Blackwell) and as the default, older `cu124` for older GPUs, CPU build when there is no GPU. Reinstalled automatically if the GPU changed.
6. **Python packages** from `requirements.txt`.
7. **ComfyUI** cloned to `vendor/ComfyUI/` with its requirements.
8. **Remotion** dependencies via `npm ci` in `remotion-app/`.
9. **`scripts/doctor.py`** runs every check and prints PASS or FAIL.

## GPU tiers
| VRAM | Tier | ComfyUI flags | What to expect |
|---|---|---|---|
| none | `cpu` | n/a | Voice, captions, animation, editing all work. AI images/clips skipped. |
| up to ~10 GB | `low` | `--lowvram` | Wan 2.2 5B clips at 480p-720p, minutes each. One GPU job at a time. |
| ~11-19 GB | `mid` | none | Faster generation, larger models possible. |
| 20 GB+ | `high` | none | Room for bigger models and higher resolution. |

The tier lives in `.studio.env`; Claude and the scripts read it. To redetect after changing hardware, re-run `./setup.sh`.

## Downloading AI models
`./scripts/models.sh` downloads Wan 2.2 TI2V-5B (video) into `vendor/ComfyUI/models/`. It is multi-GB and optional. The first time, ask Claude to also pick a current quantized image model for your tier and to double-check model names and licenses, since the model landscape changes quickly.

Then `./scripts/comfy.sh` starts ComfyUI. Claude does this for you when a video needs it. Export your own workflows from the ComfyUI interface with "Save (API format)" into `workflows/`.

## WSL2 tips
- Keep the repo under `~`, not `/mnt/c/...`: file access is far slower there.
- Set limits in `.wslconfig` (see README) so WSL cannot starve Windows of RAM.
- `nvidia-smi` must work inside WSL; if not, update the **Windows** NVIDIA driver.
- To view a video, open it from Windows Explorer at `\\wsl$\Ubuntu\home\<you>\LAIVS\projects\...`.
- `npm run dev` inside `remotion-app/` serves the Remotion preview; open the printed localhost URL in your Windows browser.

## Verifying a working install
```bash
scripts/py scripts/doctor.py
```
Every line should say PASS. The `torch` line also prints your GPU name; "CPU only" means no usable GPU was found.
