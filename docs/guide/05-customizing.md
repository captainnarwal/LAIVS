# 05 Customizing

## Change how Claude behaves
Edit `CLAUDE.md`. It is the studio's operating manual, loaded every session. Typical edits: default format or fps, default voice, loudness target, "always ask before rendering", brand colors and fonts, a preferred tone for narration.

## Add a house style
Put a brand kit in a project's `assets/` (logo, fonts you have rights to, music) and add a `style` block to `script.json` (font, color palette). For something reusable, add a section to `CLAUDE.md` such as "Brand: colors #..., font Inter, always end with the logo for 2 seconds".

## Change format
Set `format` in `script.json`: `{"width": 1080, "height": 1920, "fps": 30}` for vertical. You can also just say "9:16" in the prompt.

## Add a slash command
Create `.claude/commands/<name>.md`:
```markdown
---
description: Make a 15-second social teaser
argument-hint: <topic>
---
Make a 15-second vertical 9:16 teaser about: $ARGUMENTS
Follow "Workflow for a new video" in CLAUDE.md. Burn in captions. No narration over 40 words.
```
Then run it as `/<name> <topic>`.

## Add a tool
Ask Claude: "add Real-ESRGAN for upscaling AI clips". It installs it into the venv (`uv pip install --python .venv/bin/python ...`). If everyone should get it, add it to `requirements.txt` and mention it in `CLAUDE.md` and [02 Tools](02-tools.md).

## Add a ComfyUI workflow
Build and test it in the ComfyUI interface, export with "Save (API format)", save to `workflows/<name>.json`, and tell Claude what it does and which nodes hold the prompt/seed/size so it can fill those in.

## Update Remotion
`remotion-app` pins exact versions. Use the `remotion-upgrade` skill ("upgrade Remotion") instead of editing versions by hand, and re-run a render to confirm.

## Sharing improvements
`projects/`, `vendor/`, `.venv/` and media files are git-ignored. Anything else (`CLAUDE.md`, commands, skills, workflows, scripts, docs) is meant to be committed so everyone who clones gets the improvement.
