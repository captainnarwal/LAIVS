"""Narrate a project in a cloned voice: clone_tts.py <project> <voice_sample.wav> [exaggeration] [cfg_weight]

Writes projects/<project>/audio/scene_N.wav (same files Kokoro makes). Existing wavs are kept; delete one to redo it.
"""
import json
import sys
from pathlib import Path

import torch
import torchaudio as ta
from chatterbox.tts_turbo import ChatterboxTurboTTS

project, sample = Path("projects") / sys.argv[1], sys.argv[2]
extra = {k: float(v) for k, v in zip(("exaggeration", "cfg_weight"), sys.argv[3:5])}
scenes = json.loads((project / "script.json").read_text())["scenes"]
(project / "audio").mkdir(exist_ok=True)

model = ChatterboxTurboTTS.from_pretrained(device="cuda")
for s in scenes:
    out = project / "audio" / f"scene_{s['id']}.wav"
    if out.exists():
        continue
    # shortcut: Turbo may ignore exaggeration/cfg_weight; check the model's generate() if tuning has no effect
    ta.save(str(out), model.generate(s["narration"], audio_prompt_path=sample, **extra), model.sr)
    print("wrote", out)

del model
torch.cuda.empty_cache()  # one GPU task at a time
