# 01 Overview

## The idea
You talk to Claude Code. Claude is the director and editor; the other tools are its crew. Claude does not generate pixels or audio itself. It writes files and runs local programs, then checks the results.

```
            you: "60-second explainer on vaccines"
                          |
                     Claude Code            <- reads CLAUDE.md + skills
                          |
        +-----------+-----+------+------------+
        |           |            |            |
     Kokoro     faster-       ComfyUI      Remotion
     (voice)    whisper     (AI images     (builds the
                (timing)     and clips)     video itself)
        |           |            |            |
        +-----------+-----+------+------------+
                          |
                       FFmpeg  (final encode, loudness, joining)
                          |
                  projects/<name>/out/final.mp4
```

## The three layers

1. **Instructions** (what Claude should do): `CLAUDE.md`, `.claude/commands/`, `.claude/skills/`. These are plain text. Changing how the studio behaves usually means editing these.
2. **Tools** (what does the work): Python packages in `.venv/`, the Remotion project in `remotion-app/`, ComfyUI in `vendor/ComfyUI/`, and system programs like FFmpeg. See [02 Tools](02-tools.md).
3. **Files** (what flows between them): everything under `projects/<name>/`. Each tool reads files made by the previous one and writes files for the next one. There is no hidden state, which is why a failed step can simply be re-run and unchanged steps are cached.

## The central idea: the script is the source of truth
Claude first writes `script.json` (scenes, narration, visual for each scene). Every later step derives from it:

- narration text -> **audio** (Kokoro)
- audio -> **word timestamps** (faster-whisper)
- visual descriptions -> **images/clips** (ComfyUI) or **animations** (Remotion)
- audio length + timestamps + assets -> **the Remotion composition**
- composition -> **final.mp4**

Because of this, "change scene 3" only redoes scene 3's audio and render; everything else is reused.

## What runs where
| Part | Runs on |
|---|---|
| Claude (reasoning, writing code) | Cloud |
| Kokoro, faster-whisper, ComfyUI, Demucs | Your GPU (CPU fallback for some) |
| Remotion render, FFmpeg, auto-editor | Your CPU (FFmpeg can use the GPU) |

Only prompts and the code/commands Claude writes go to the cloud; your footage and generated media stay on disk.

## Rule of the house: one heavy GPU job at a time
Consumer GPUs (8 GB VRAM) cannot hold two AI models at once. Claude runs ComfyUI, Demucs and GPU transcription one after another, never together. Out-of-memory errors almost always mean two models were loaded.

## What it is good and bad at
**Good:** explainers, narrated slideshows, motion graphics, charts, captions, lower-thirds, social clips, cutting silences/ums from talking-head footage.
**Limited:** AI video clips are a few seconds at 480p-720p and take minutes each, so they are B-roll, not the main content. Remotion carries titles, text, charts and pacing.
**Not possible:** Claude cannot drive GUI editors (Premiere, DaVinci). For manual polish, open the MP4 or assets in Kdenlive/Shotcut yourself.
