"""Check every piece of the studio. Exit 1 if anything fails."""
import importlib, shutil, subprocess, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
results = []

def check(name, fn):
    try:
        results.append((name, True, fn() or ""))
    except Exception as e:
        results.append((name, False, str(e)[:150]))

def torch_info():
    import torch
    if torch.cuda.is_available():
        torch.zeros(1, device='cuda')  # fails if the wheel lacks this GPU's arch
        return torch.cuda.get_device_name(0)
    return "CPU only (no CUDA)"

def mod(m):
    return lambda: importlib.import_module(m) and ""

def tool(t):
    def f():
        if not shutil.which(t):
            raise RuntimeError(f"{t} not found")
    return f

def remotion():
    if not (root / "remotion-app/node_modules/.bin/remotion").exists():
        raise RuntimeError("run npm ci in remotion-app")

check("torch", torch_info)
for m in ("kokoro", "faster_whisper", "soundfile", "scenedetect"):
    check(m, mod(m))
for t in ("ffmpeg", "ffprobe", "node", "auto-editor"):
    check(t, tool(t) if t != "auto-editor" else (lambda: subprocess.run([sys.executable, "-m", "auto_editor", "--version"], check=True, capture_output=True) and ""))
check("remotion", remotion)
check("ComfyUI", lambda: (root / "vendor/ComfyUI/main.py").exists() or (_ for _ in ()).throw(RuntimeError("missing")))

for n, ok, msg in results:
    print(f"{'PASS' if ok else 'FAIL'}  {n}  {msg}")
sys.exit(0 if all(ok for _, ok, _ in results) else 1)
