# script.json format and reference

## Stack
| Job | Tool |
|---|---|
| Composition, titles, captions, animation | Remotion (`spring()`/`interpolate()`) |
| Voice | Kokoro TTS (default); Chatterbox for expressive/cloned (on demand) |
| Transcription + word timestamps | faster-whisper |
| AI images / B-roll clips | ComfyUI + quantized Flux/SDXL, Wan 2.2 TI2V-5B (Apache 2.0) |
| Cut/trim/join/convert/mix | FFmpeg |
| Silence removal / scene detect | auto-editor / PySceneDetect |
| On demand | Demucs, rembg, MoviePy, Real-ESRGAN, RIFE |

Run one GPU-heavy task at a time.

## A. New video
prompt -> script.json -> Kokoro audio/scene_N.wav -> faster-whisper timing/scene_N.json -> (ComfyUI assets) -> Remotion composition -> render out/final.mp4 -> FFmpeg loudness/music.

## B. Edit footage
transcribe -> Claude proposes cuts -> auto-editor/FFmpeg applies -> (Demucs) -> Remotion captions/titles -> out/final.mp4.

## C. Mixed
Generate B-roll with Wan 2.2, insert into real footage via Remotion `<Video>` or FFmpeg.

## script.json
```json
{
  "title": "How batteries work",
  "format": {"width": 1920, "height": 1080, "fps": 30},
  "style": {"font": "Inter", "colors": ["#0F172A", "#38BDF8", "#F8FAFC"]},
  "scenes": [
    {"id": 1, "narration": "Every battery stores energy in chemical form.",
     "visual": {"type": "ai_image", "prompt": "cutaway of a lithium battery, clean vector style"},
     "on_screen_text": "Energy, stored chemically"},
    {"id": 2, "narration": "When you plug it in, ions move between two electrodes.",
     "visual": {"type": "remotion_animation", "description": "two electrodes with animated dots moving between them"},
     "on_screen_text": null}
  ]
}
```
Visual types: `ai_image`, `ai_clip`, `remotion_animation`, `stock_footage` (user-supplied), `text_only`.

Brand assets: reference reusable files by their path inside the project library (e.g. `library/images/logo.png`); see [Library](07-library.md).

## Gotchas
- AI clips are a few seconds at 480p-720p on 8GB; use as B-roll.
- OOM almost always means two models are loaded.
- RTX 50-series needs CUDA 12.8+ PyTorch (setup.sh picks cu128 automatically).
- Check model licenses before downloading (LTX: community license, free under $10M revenue).
