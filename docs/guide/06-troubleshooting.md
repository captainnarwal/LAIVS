# 06 Troubleshooting

First step for anything: `scripts/py scripts/doctor.py`. Or just ask Claude: it reads errors and fixes them.

| Symptom | Cause | Fix |
|---|---|---|
| `sm_120 is not compatible` / `no kernel image is available` | PyTorch built for an older CUDA than your GPU needs (RTX 50-series needs cu128+) | Re-run `./setup.sh`; it reinstalls the right build. Check with the doctor's `torch` line. |
| `Library libcublas.so.12 is not found` | Python launched directly instead of through `scripts/py` | Use `scripts/py ...` instead of `python` / `.venv/bin/python` |
| `open() got an unexpected keyword argument 'metadata_errors'` | `av` package too new for faster-whisper | `uv pip install --python .venv/bin/python "av<16"` (already pinned in requirements.txt) |
| `CUDA out of memory` | Two GPU models loaded at once | Stop ComfyUI (Ctrl+C its terminal) before transcribing or separating audio; use `--lowvram` |
| `nvidia-smi` fails in WSL | Windows driver missing or old | Update the NVIDIA driver on Windows; do not install one in WSL; then `wsl --shutdown` |
| WSL freezes or Windows slows down | WSL using all RAM | Set limits in `.wslconfig` (see README) |
| Remotion render: Chrome fails to start / missing `.so` | System libraries missing | Re-run `./setup.sh` (installs them) |
| Kokoro: `espeak` not found | espeak-ng missing | `sudo apt install espeak-ng` or re-run setup |
| `Node` version error in `remotion-app` | Node too old | Install Node 22 (nvm), then `cd remotion-app && npm ci` |
| ComfyUI model not found | Models not downloaded | `./scripts/models.sh`, then restart `./scripts/comfy.sh` |
| Animation looks frozen / wrong in render | CSS transitions or timers used | Animations must use `spring()`/`interpolate()` with the frame number |
| An install command in a doc fails | Versions drift | Ask Claude to check that tool's current README rather than retrying |

## Starting clean
```bash
rm -rf .venv vendor .studio.env remotion-app/node_modules
./setup.sh
```
Your `projects/` folder is untouched by this.
