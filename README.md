# LAIVS: Local AI Video Studio

Describe a video in plain language to Claude Code and it makes it for you, on your own machine. Claude writes the script, records the narration, times the captions, builds the animation, and renders an MP4. You can also hand it existing footage and ask for cuts, captions and titles.

```
/make-video 60-second explainer on how vaccines work, friendly tone, blue and white style
/edit-video raw.mp4 remove silences and ums, add captions, 9:16 vertical
```

Claude is the only cloud part (it needs a Claude subscription or API key). Everything that touches your media (voice, transcription, rendering, AI images) runs locally.

## What you need

| | Required | Notes |
|---|---|---|
| OS | Ubuntu on WSL2 (Windows) or native Linux | macOS and native Windows are not supported |
| Claude Code | yes | https://claude.com/claude-code |
| Node.js 20.19+ / 22.13+ | yes | install with [nvm](https://github.com/nvm-sh/nvm) |
| NVIDIA GPU | optional | Without one you still get narrated, animated, captioned videos; AI images/clips are skipped |
| Disk | ~15 GB | ~10 GB for Python/CUDA libs, plus ~15 GB more if you download the AI image/video models |

### Windows + WSL2 one-time setup
1. Install the latest **NVIDIA driver on Windows**. Do not install a Linux NVIDIA driver inside WSL.
2. In PowerShell: `wsl --install -d Ubuntu`
3. Create `C:\Users\<you>\.wslconfig` (size it to your RAM; leave about 4 GB for Windows):
   ```
   [wsl2]
   memory=12GB
   swap=16GB
   ```
   then run `wsl --shutdown` and reopen Ubuntu.
4. Inside Ubuntu, `nvidia-smi` should list your GPU.

## Quick start

```bash
git clone <this repo> ~/LAIVS     # keep it in the Linux filesystem, NOT /mnt/c (much slower)
cd ~/LAIVS
./setup.sh                        # 10-20 min the first time; asks for sudo once
./new-project.sh my-first-video   # makes projects/my-first-video/ with its own library/
claude                            # then try /make-video ...
```

`setup.sh` detects your GPU and prints PASS/FAIL for each piece at the end. It is safe to re-run. If something fails, run `claude` and ask it to fix the setup; the instructions in `CLAUDE.md` tell it how.

Want AI-generated images and video clips? Run `./scripts/models.sh` once (multi-GB download), then start ComfyUI with `./scripts/comfy.sh`. Claude will tell you when it needs this.

## Where things end up

Every video lives in its own folder:

```
projects/<video-name>/
  script.json     the plan: scenes, narration, visuals
  audio/          narration per scene
  timing/         word timestamps per scene
  assets/         generated images/clips, your logos, music
  out/final.mp4   the result
  library/        this project's brand rules, logos, music, sfx
```
`projects/` is git-ignored, so your videos never get committed.

Each project has its own `projects/<video-name>/library/` for brand guidelines, logos, music and sound effects. Create a project with `./new-project.sh <name>`. See [the library guide](docs/guide/07-library.md).

## Repo map

```
setup.sh              one-shot installer
new-project.sh        create a video project (projects/<name>/ + its own library/)
requirements.txt      Python packages (torch is installed separately by setup.sh)
CLAUDE.md             the studio's operating manual that Claude reads every session
.claude/commands/     /make-video and /edit-video
.claude/skills/       Remotion skills, anatomy (explainer illustrations) + studio-library (how to use the project library)
remotion-app/         the Remotion project all videos are built in
scripts/              py (runner), doctor.py (health check), comfy.sh, models.sh
workflows/            ComfyUI workflow JSONs (API format)
new-project.sh        creates projects/<name>/ with its own library/ (brand + images, video, music, sfx)
projects/             your videos (git-ignored)
vendor/ComfyUI/       cloned by setup (git-ignored)
.venv/                Python 3.12 environment (git-ignored)
.studio.env           detected GPU info (git-ignored)
docs/guide/           the full guide, see below
```

## Documentation

Start with the guide: **[docs/guide/](docs/guide/README.md)**

1. [How the studio works](docs/guide/01-overview.md): the big picture and how the tools connect
2. [The tools](docs/guide/02-tools.md): what each tool does, why it is here, what it reads and writes
3. [Workflows](docs/guide/03-workflows.md): new video, editing footage, mixed
4. [Setup and hardware](docs/guide/04-setup.md): what `setup.sh` does, GPU tiers, WSL tips
5. [Customizing](docs/guide/05-customizing.md): styles, formats, adding tools and commands
6. [Troubleshooting](docs/guide/06-troubleshooting.md)
7. [Library](docs/guide/07-library.md): brand guidelines and reusable media with metadata
8. [script.json format](docs/guide/script-format.md)

## Licenses to know about
- **Remotion** is free for individuals and teams of up to 3. Companies selling video services need a license: https://remotion.pro/license
- **Wan 2.2** is Apache 2.0. Other models you add (Flux, LTX) have their own terms; check before commercial use.
- Don't use copyrighted music, footage or fonts unless you supplied them and have the rights.
