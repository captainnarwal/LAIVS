---
description: Generate a new video from a topic (CLAUDE.md "new video" workflow)
argument-hint: <topic, length, tone, style>
---
Make a video: $ARGUMENTS

First pick the project: use the one named above, else ask the user (list with ./new-project.sh --list) or offer to create one with ./new-project.sh <name>. Work only inside it.

Follow the "Workflow for a new video" in CLAUDE.md exactly. If setup hasn't been run, run ./setup.sh first.
