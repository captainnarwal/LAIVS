---
name: studio-library
description: Use the active project's library/ (projects/<name>/library/) of brand guidelines and reusable media (images, videos, music, sfx, voice). Read before any video; catalogue new assets with metadata.
---

# Studio library

Each project has its own `projects/<name>/library/` with brand rules and raw media. Work in ONE project only (ask the user which, or offer `./new-project.sh <name>`); never use another project's library. Always look here before generating or asking. Paths below are relative to that library unless they start with `scripts/`.

## Before every video
1. Read `projects/<name>/library/brand/brand.md` and `brand.json` (colors, fonts, logos, tone, default format/music). Apply them to `script.json` `style` and the composition. If still placeholders (`<...>`), ignore and tell the user once.
2. `scripts/py scripts/library.py --project <name> find <words>` (e.g. `find logo`, `find whoosh`). Reuse a match instead of generating one. Run `scan` first if files were just added.

## Using an asset in Remotion
Run `scripts/py scripts/library.py --project <name> link` (re-run when switching project), then `staticFile("library/images/logo.png")`. Use `<Img>`, `<OffthreadVideo>`, `<Audio>` per the remotion skills. Never edit library files; copy to `projects/<name>/assets/` to modify.

## Adding assets (user gives you a file)
1. Copy (never move the user's original) into `images/ videos/ music/ sfx/ voice/`. Use lowercase-hyphen names that say what it is: `logo-light.png`, `whoosh-short.mp3`.
2. Look at it (view images; `ffprobe` for media; for audio/video listen via transcript or ask) and write the sidecar `<file>.json`:
```json
{
  "description": "One plain sentence of what it is",
  "tags": ["logo", "light-background"],
  "use_when": "Intro/outro on dark backgrounds",
  "license": "own | cc0 | cc-by (credit: ...) | licensed | unknown",
  "source": "where it came from",
  "notes": "transparent bg, loopable, loud so lower volume..."
}
```
3. `scripts/py scripts/library.py --project <name> scan`; fix any WARN lines. It adds type, duration, size, fps, audio flag to `catalog.json` (generated, never hand-edit).

## Rules
- Licence `unknown` or needing credit: tell the user before using it in a render.
- Projects (and their libraries) are git-ignored.
- Music/sfx: normalise to about -16 LUFS in the mix, duck music under narration.
