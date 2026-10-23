# 03 Workflows

## A. `/make-video <description>`: generate a new video

1. **Plan.** Claude creates `projects/<name>/` and writes `script.json`: scenes, narration, and a visual for each. For videos over 60 seconds it shows you a scene summary and waits for approval.
2. **Voice.** Kokoro turns each scene's narration into `audio/scene_N.wav`.
3. **Timing.** faster-whisper reads each WAV and writes `timing/scene_N.json` with start/end per word.
4. **Assets.** For scenes with `ai_image` or `ai_clip`, Claude starts ComfyUI, submits a workflow from `workflows/`, and saves results to `assets/`. (Skipped on machines without a GPU or models.)
5. **Compose.** Claude writes a Remotion composition: each scene lasts as long as its audio plus padding, captions appear word by word from the timings, visuals and text animate with `spring()`/`interpolate()`.
6. **Render.** Remotion renders `out/final.mp4`. For long videos it renders scene by scene, then joins them.
7. **Verify.** `ffprobe` confirms duration, resolution and that audio is present; FFmpeg normalizes loudness.
8. **Report.** Claude tells you the path, a one-line summary, and offers one improvement.

Re-running after a change only redoes what changed: edit scene 3's narration and only scene 3's audio, timing and the render are redone.

## B. `/edit-video <file> <instructions>`: edit existing footage

1. **Transcribe** the footage with faster-whisper (word timestamps).
2. **Propose cuts.** Claude reads the transcript and lists filler words, silences and off-topic parts with timestamps. You see the list before anything is cut.
3. **Apply** with auto-editor and/or FFmpeg. Your original is never modified; output goes to `out/`.
4. **Optional extras:** clean audio (Demucs), burn in captions or add titles and lower-thirds (Remotion), reformat (for example 9:16 vertical).
5. **Verify and report**, same as above.

## C. Mixed
Generate B-roll with Wan 2.2, then place it over real footage using a Remotion `<Video>` layer or FFmpeg. You can ask for this in plain language: "edit my interview and cut in AI-generated shots of a city when I mention Berlin."

## Typical prompts
```
/make-video 30-second product teaser for a reusable water bottle, upbeat, green palette, vertical 9:16
/make-video 3-minute explainer on how inflation works, calm tone, charts instead of AI images
/edit-video interview.mp4 cut all silences over 1 second, add captions, export 16:9 and 9:16
```
Follow-ups work too: "make the intro shorter", "change the narrator voice", "swap scene 4's image for an animation".

## Where Claude pauses to ask
Long videos (scene summary), big downloads (models), and anything that would delete or overwrite your files. Otherwise it just works and reports the outcome.
