#!/usr/bin/env python3
"""Index a project's library. Usage: scripts/py scripts/library.py [--project <name>] scan | find <words...> | link
Project defaults to the one in projects/.current (written by ./new-project.sh)."""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = None  # set in main: projects/<name>/library
SKIP = {".md", ".json"}
KINDS = {"images": "image", "videos": "video", "music": "audio", "sfx": "audio", "voice": "audio"}


def probe(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(p)],
                       capture_output=True, text=True)
    if r.returncode:
        return {}
    d = json.loads(r.stdout)
    v = next((s for s in d["streams"] if s["codec_type"] == "video"), {})
    info = {"size_mb": round(int(d["format"].get("size", 0)) / 1e6, 2)}
    if v.get("width"):
        info.update(width=v["width"], height=v["height"])
    if "duration" in d["format"] and v.get("codec_name") not in ("png", "mjpeg", "webp", "gif"):
        info["duration"] = round(float(d["format"]["duration"]), 2)
        if v:
            num, den = v["r_frame_rate"].split("/")
            info["fps"] = round(int(num) / int(den or 1), 2)
            info["has_audio"] = any(s["codec_type"] == "audio" for s in d["streams"])
    return info


def scan():
    items, warn = [], []
    for p in sorted(LIB.rglob("*")):
        if not p.is_file() or p.suffix in SKIP or p.name == ".gitkeep":
            continue
        rel = p.relative_to(LIB).as_posix()
        side = p.with_name(p.name + ".json")
        meta = json.loads(side.read_text()) if side.exists() else {}
        for k in ("description", "license"):
            if not meta.get(k):
                warn.append(f"{rel}: missing {k}")
        top = rel.split("/")[0]
        items.append({"path": rel, "kind": KINDS.get(top, top), "folder": top, **probe(p), **meta})
    (LIB / "catalog.json").write_text(json.dumps(items, indent=2))
    print(f"{len(items)} assets -> catalog.json")
    for w in warn:
        print("WARN", w)


def find(words):
    cat = LIB / "catalog.json"
    if not cat.exists():
        scan()
    for it in json.loads(cat.read_text()):
        blob = json.dumps(it).lower()
        if all(w.lower() in blob for w in words):
            extra = f" {it['duration']}s" if "duration" in it else ""
            print(f"{it['path']}{extra} | {it.get('description', '(no description)')} | {','.join(it.get('tags', []))}")


def link():
    dst = ROOT / "remotion-app" / "public" / "library"
    dst.parent.mkdir(exist_ok=True)
    if dst.is_symlink():  # re-point when switching projects
        dst.unlink()
    if not dst.exists():
        dst.symlink_to(LIB)
    print(dst, "->", dst.resolve())


if __name__ == "__main__":
    argv = sys.argv[1:]
    cur = ROOT / "projects" / ".current"
    name = argv[1] if argv[:1] == ["--project"] and len(argv) > 1 else (cur.read_text().strip() if cur.exists() else "")
    if argv[:1] == ["--project"]:
        argv = argv[2:]
    LIB = ROOT / "projects" / name / "library"
    if not name or not LIB.is_dir():
        sys.exit("No such project library. Run ./new-project.sh <name> or pass --project <name>.")
    cmd, args = (argv[0], argv[1:]) if argv else ("", [])
    {"scan": lambda: scan(), "find": lambda: find(args), "link": lambda: link()}.get(
        cmd, lambda: sys.exit(__doc__))()
