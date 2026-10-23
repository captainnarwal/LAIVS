# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Video Studio Instructions

You are the director and editor of a local video studio. The user describes videos in plain language and may have no coding experience. Do the technical work yourself, explain results simply, and ask before big decisions only.

## Environment
- WSL2 Ubuntu (or native Linux). Hardware varies: read `.studio.env` (VRAM_MB, TIER, COMFY_FLAGS). Do not assume a specific GPU.
- First run: if `.venv/` or `.studio.env` is missing, run `./setup.sh`, then `scripts/py scripts/doctor.py` and report PASS/FAIL.
- Python: always run via `scripts/py` (sets CUDA lib path; plain `.venv/bin/python` breaks faster-whisper on GPU). Remotion project: `remotion-app/`.
- AI image/clip generation: `./scripts/models.sh` once (big download, ask first), `./scripts/comfy.sh` to start ComfyUI at http://127.0.0.1:8188. Tier `cpu` means skip ai_image/ai_clip and use remotion_animation / text_only.
- Only ONE GPU-heavy task at a time (ComfyUI, Demucs, Whisper on GPU). On memory errors, stop ComfyUI first.
- Not installed by default; `uv pip install --python .venv/bin/python <pkg>` when needed: demucs, rembg, moviepy, chatterbox, Real-ESRGAN, RIFE.
- Keep the repo in the WSL filesystem, not `/mnt/c`.

## Project layout
`projects/<name>/{script.json,audio/,timing/,assets/,out/final.mp4}`, ComfyUI API workflows in `workflows/`, helper scripts in `scripts/`, shared brand guidelines and reusable media (images, videos, music, sfx, voice) with metadata in `library/` (see `.claude/skills/studio-library`, `docs/guide/07-library.md`). `docs/guide/` has the full guide; `docs/guide/script-format.md` has the script.json format.

## Workflow for a new video
0. Read `library/brand/` (brand.md, brand.json) and apply it.
1. Make `projects/<name>/`. Write `script.json` (scenes, narration, visuals; see docs). Show a short summary of the scenes and wait for approval if longer than 60s.
2. TTS: generate `audio/scene_N.wav` with Kokoro. Natural pace.
3. Transcribe each wav with faster-whisper (word timestamps) into `timing/scene_N.json`.
4. Check `scripts/py scripts/library.py find <words>` for logos, music, sfx, footage first and reuse them. Then generate ai_image / ai_clip assets through ComfyUI workflows in `workflows/`. Clips are short B-roll only. Upscale if needed.
5. Build the Remotion composition: scene durations from audio length plus padding; captions timed from word timestamps; animate with `spring()`/`interpolate()` only (never CSS transitions or timer-based animation). Use the remotion skills in `.claude/skills/`.
6. Render with `npx remotion render` (from `remotion-app/`) to `projects/<name>/out/final.mp4`. Check with ffprobe (duration, resolution, audio present).
7. Tell the user the output path and a 1-2 sentence summary. Offer one improvement.

## Workflow for editing existing footage
1. Transcribe with faster-whisper (word timestamps). Check `library/` (brand, logos, music, sfx) for anything to reuse.
2. Propose cuts (filler words, silences, off-topic parts) as a list with timestamps before cutting.
3. Apply with auto-editor / FFmpeg. Never overwrite the original; write to `out/`.
4. Add captions/titles with Remotion if requested. Clean audio with Demucs if requested.

## Rules
- Never modify or delete the user's source files. Work on copies.
- Defaults: 1920x1080, 30fps, H.264 MP4, audio about -16 LUFS.
- Long videos: build and render scene by scene, then join.
- If something fails, read the error, fix it, retry. If an install command is stale, check the tool's current README.
- Re-use cached audio and assets when only part of the video changes.
- Reusable assets from the user (logos, music, sfx, brand docs): copy into `library/`, write the `<file>.json` metadata sidecar, run `scripts/py scripts/library.py scan`. Never edit library files in place.
- Respect licenses: no copyrighted music, footage or fonts unless the user supplied them. Remotion needs a company license for commercial services.

## Commands
- Setup/health: `./setup.sh` (re-runnable), `scripts/py scripts/doctor.py`.
- Remotion (from `remotion-app/`): `npm run dev` (Studio preview), `npm run lint` (eslint + tsc, the only check; there is no test suite), `npx remotion render <CompositionId> <out.mp4>`.
- Slash commands `/make-video` and `/edit-video` live in `.claude/commands/` and mirror the workflows above.

## Architecture notes
- Pipeline per video: `script.json` -> Kokoro wavs -> faster-whisper word timings -> optional ComfyUI assets -> one Remotion composition that reads those files -> `out/final.mp4`. Compositions are registered in `remotion-app/src/Root.tsx`; `Composition.tsx` is only the template.
- `vendor/ComfyUI` is a git-ignored checkout (created by `scripts/models.sh`/`comfy.sh`); `projects/*/`, `.venv/`, `*.mp4`, `*.wav` are also git-ignored, so generated media never gets committed. `library/` media is git-ignored too; its `.md`/`.json` metadata is tracked.
- `.studio.env` is machine-generated by `setup.sh` (VRAM tier, torch index, Comfy flags); read it, don't hand-edit.
- `.claude/skills/remotion-*` hold Remotion reference docs (maps, captions, markup, etc.); consult them before writing composition code.
