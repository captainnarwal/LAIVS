# 02 Tools and how they connect

For each tool: what it does, why it is here, what goes in, what comes out, and where it runs.

## Quick relationship table

| Tool | Reads | Writes | Used by |
|---|---|---|---|
| Claude Code | your prompt, CLAUDE.md, skills | `script.json`, Remotion code, scripts | everything |
| Kokoro | narration text | `audio/scene_N.wav` | new video |
| faster-whisper | any audio/video | `timing/scene_N.json`, transcripts | new video, editing |
| ComfyUI | a workflow JSON + prompt | `assets/*.png / *.mp4` | new video (ai_image, ai_clip) |
| Remotion | script, audio, timings, assets | `out/final.mp4` | new video, editing (captions/titles) |
| FFmpeg | any media | any media | all, plus final polish |
| auto-editor | video | video with silences cut | editing |
| PySceneDetect | video | list of scene cut points | editing |
| anatomy (skill) | a concept prompt | standalone HTML / SVG / React figure | new video |
| Demucs *(on demand)* | audio | separate vocals / music | editing |
| rembg, MoviePy, Real-ESRGAN, RIFE, Chatterbox *(on demand)* | | | as needed |

## Claude Code (the director)
Cloud LLM that runs in your terminal. It reads `CLAUDE.md` at the start of every session, can load the skills in `.claude/skills/`, writes code, runs the tools below, looks at the results (ffprobe, rendered stills) and retries on errors. It needs a Claude subscription or API key.

## Kokoro TTS (the voice)
Small, fast, open text-to-speech model. Turns each scene's `narration` into a WAV. Runs on CPU or GPU, English voices by default (for example `af_heart`). Needs `espeak-ng` (installed by `setup.sh`). For cloned or very expressive voices, use Chatterbox (below).

## Chatterbox (clone your voice)
Open-source voice cloning from a short sample. Installed in its own `.venv-clone` (Python 3.11, CUDA torch) so it cannot break the main environment. Re-create it with:
`uv venv --python 3.11 .venv-clone` then `uv pip install --python .venv-clone/bin/python --override <file with torch==2.11.0 and torchaudio==2.11.0> --extra-index-url https://download.pytorch.org/whl/cu128 --index-strategy unsafe-best-match chatterbox-tts`.

How to clone a voice:
1. Record 10-20 s of **your own** voice (or one you have permission to use): quiet room, no music or echo, steady distance from the mic, natural pace. A phone voice memo works.
2. Convert: `ffmpeg -i in.m4a -ac 1 -ar 24000 my-voice.wav`.
3. Put it in `projects/<name>/library/voice/` and ask Claude to catalogue it.
4. Ask for the video "in my voice". Claude runs `.venv-clone/bin/python scripts/clone_tts.py <project> projects/<project>/library/voice/my-voice.wav [exaggeration] [cfg_weight]`, which writes the same `audio/scene_N.wav` files Kokoro would.
5. Tuning: `exaggeration` (default 0.5; ~0.7 = more expressive) and `cfg_weight` (default 0.5; ~0.3 if speech sounds rushed).
6. English only for the Turbo model. The sample's language/accent carries into the output. All output has an inaudible Perth watermark.

The first run downloads the model (about a GB or more). Stop ComfyUI first: one GPU task at a time.

## faster-whisper (the ears)
Speech-to-text with **word-level timestamps**. Two jobs:
- *Generating:* run on Kokoro's audio so captions and animations line up with each spoken word.
- *Editing:* run on your footage so Claude can read a transcript and decide cuts ("remove the 'um' at 00:42.3").

Runs on GPU (fast) or CPU (slower). On GPU it needs CUDA libraries from the venv, which is why Python is always launched through `scripts/py`.

## ComfyUI (the image and video generator)
A node-based engine for running image/video models, started as a local server at `http://127.0.0.1:8188`. Claude sends it **API-format workflow JSONs** (kept in `workflows/`) over HTTP and collects the outputs.
- Images: a quantized Flux or SDXL model.
- Clips: Wan 2.2 TI2V-5B (text/image to video), a few seconds each.
- Optional: models are downloaded by `scripts/models.sh`. Without them (or without a GPU) Claude uses `remotion_animation` / `text_only` visuals instead.
Heaviest component; never run it alongside another GPU job.

## Remotion (the compositor)
Lets you build video as **React code**: each frame is a React component, animated with `spring()` and `interpolate()`. Claude writes the composition from the script, timings and assets, previews it and renders to MP4 with headless Chrome. Handles titles, captions, charts, shapes, transitions, layered video, audio tracks. Lives in `remotion-app/`. The skills in `.claude/skills/` teach Claude Remotion's rules (for example: never use CSS transitions, they will not render).

## anatomy (explainer illustrations)
A Claude skill ([wheresryan22/anatomy](https://github.com/wheresryan22/anatomy), MIT) in `.claude/skills/anatomy/`. Builds an interactive isometric SVG/HTML figure of a machine or system (for example `/anatomy how a token bucket rate limiter works`). Needs Node 20.10+ and Chrome/Chromium (no npm install). Generation is slow by design; it suits machines and instruments, not people, maps or charts. Use the output as a Remotion scene asset or screen-record it.

## FFmpeg (the Swiss-army knife)
Cuts, trims, joins, converts, resizes, mixes audio, normalizes loudness (target about -16 LUFS), and does the final encode. Can use the GPU encoder (NVENC) if present. Claude also uses `ffprobe` to verify duration, resolution and that audio exists.

## auto-editor and PySceneDetect (editing helpers)
- **auto-editor** removes silent/boring stretches from footage automatically.
- **PySceneDetect** finds where shots change, useful for chaptering or cutting by scene.

## On-demand tools
Not installed by default to keep setup fast; Claude installs them into the venv when a request needs them (`uv pip install --python .venv/bin/python <pkg>`).
- **Demucs**: split vocals from music, clean noisy audio.
- **rembg**: remove image/video backgrounds.
- **MoviePy**: scripted edits that are awkward in FFmpeg.
- **Real-ESRGAN / RIFE**: upscale and smooth AI clips.
- **Chatterbox**: expressive or cloned voice (GPU, ~6 GB).

## The glue
- `scripts/py`: runs the venv's Python with CUDA libraries on the path.
- `scripts/doctor.py`: checks all of the above are installed and working.
- `scripts/comfy.sh`, `scripts/models.sh`: start ComfyUI, download models.
- `.studio.env`: GPU info detected by `setup.sh` (VRAM, tier, ComfyUI flags) so scripts and Claude adapt to any machine.
- `CLAUDE.md` + `.claude/commands/`: the rules and the two entry points that tie it all together.
