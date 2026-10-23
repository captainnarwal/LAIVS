# LAIVS: Local AI Video Studio

Prompt Claude Code, get videos. Everything runs locally (Remotion, Kokoro TTS, faster-whisper, FFmpeg, optional ComfyUI + Wan 2.2).

## Prerequisites (one time, Windows side)
1. Latest NVIDIA Windows driver (don't install a Linux driver in WSL). No GPU still works for narrated/animated videos.
2. `wsl --install -d Ubuntu`, then `C:\Users\<you>\.wslconfig`:
   ```
   [wsl2]
   memory=12GB
   swap=16GB
   ```
   (size to your RAM), then `wsl --shutdown`.
3. In Ubuntu: Node 20+ (e.g. via nvm) and [Claude Code](https://claude.com/claude-code).

## Use
```bash
git clone <this repo> && cd LAIVS     # keep it under ~, not /mnt/c
./setup.sh                            # detects your GPU, installs everything, prints PASS/FAIL
claude
```
Then:
```
/make-video 60-second explainer on how vaccines work, friendly tone, blue and white style
/edit-video raw.mp4 remove silences and ums, add captions, 9:16 vertical
```
Optional AI images/clips: `./scripts/models.sh` (multi-GB download). Full design: [docs/video-studio-pipeline.md](docs/video-studio-pipeline.md).
