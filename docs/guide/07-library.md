# 07 Library: brand and reusable media

Every project has its own shelf, `projects/<name>/library/`, created by `./new-project.sh <name>`. Put brand rules, logos, music, sound effects and clips here; every video in that project can reuse them, and Claude can find them because each file has a small metadata file.

## Layout

```
projects/<name>/library/
  brand/brand.md     guidelines in plain words: voice, look, logo rules, do/don't
  brand/brand.json   the same as data: colors, fonts, logos, tone, default format and music
  images/ videos/ music/ sfx/ voice/    your raw files
  <file>.json        metadata for each file (see below)
  catalog.json       generated index (do not edit)
```

## Metadata per file
Next to `logo.png` put `logo.png.json`:

```json
{
  "description": "Company logo, white text on transparent background",
  "tags": ["logo", "dark-background"],
  "use_when": "Intro and outro on dark scenes",
  "license": "own",
  "source": "brand kit, 2026",
  "notes": "never stretch; min 120px wide"
}
```
`license` is one of `own`, `cc0`, `cc-by (credit: ...)`, `licensed`, `unknown`. You can ask Claude: "add this to the library" and it writes the metadata for you.

Duration, resolution, fps, file size and whether a video has audio are read automatically from the file.

## Commands
```
scripts/py scripts/library.py --project <name> scan          # rebuild catalog.json, warn about missing metadata
scripts/py scripts/library.py --project <name> find logo     # search by any word (name, tag, description)
scripts/py scripts/library.py --project <name> link          # one time: lets Remotion load library/ via staticFile("library/...")
```

## How it is used
Claude reads `projects/<name>/library/brand/` before every video, searches the library before generating images or sound, and uses library files in the Remotion composition. The skill is `.claude/skills/studio-library/SKILL.md`.

## Git
Media files are git-ignored (they may be licensed, and are big). The `.md` and `.json` files are tracked, so your brand rules and metadata are versioned.
