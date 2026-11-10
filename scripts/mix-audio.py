#!/usr/bin/env python3
"""
依 narration/timeline.json 直接混出整片音軌（旁白 + 音效），不經 Remotion。

與 src/Narration.tsx、src/Root.tsx 的混音規則一致：
  - 每句旁白從 round(startSec * fps) / fps 開始，音量 1.0
  - public/audio/sfx.wav 從 0 秒開始，音量 0.55（sfx-meta.json ready 時）
用途：雲端分段渲染時，畫面各段以 --muted 渲染，最後再接上這條完整音軌，
      避免每段各自編 AAC 在接縫處產生空隙或爆音。

用法：python3 scripts/mix-audio.py [輸出檔，預設 out/full_audio.wav]
需要：numpy、ffmpeg（解碼 mp3 / wav）
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
SFX_VOLUME = 0.55


def decode(path: Path) -> np.ndarray:
    """用 ffmpeg 解碼成 48 kHz 雙聲道 float32，shape = (n, 2)"""
    raw = subprocess.run(
        ["ffmpeg", "-nostdin", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)


def main() -> None:
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "out/full_audio.wav"
    tl = json.loads((ROOT / "narration/timeline.json").read_text())
    fps = tl["fps"]
    total = int(np.ceil(tl["totalFrames"] / fps * SR))
    mix = np.zeros((total, 2), dtype=np.float32)

    n = 0
    for scene in tl["scenes"]:
        for s in scene["sentences"]:
            start = int(round(round(s["startSec"] * fps) / fps * SR))
            clip = decode(ROOT / "public" / s["file"])
            end = min(total, start + len(clip))
            mix[start:end] += clip[: end - start]
            n += 1

    meta = json.loads((ROOT / "src/sfx-meta.json").read_text())
    if meta.get("ready"):
        sfx = decode(ROOT / "public/audio/sfx.wav") * SFX_VOLUME
        end = min(total, len(sfx))
        mix[:end] += sfx[:end]

    np.clip(mix, -1.0, 1.0, out=mix)
    out.parent.mkdir(parents=True, exist_ok=True)
    pcm = (mix * 32767).astype("<i2").tobytes()
    subprocess.run(
        ["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "s16le", "-ac", "2", "-ar", str(SR), "-i", "-", str(out)],
        input=pcm,
        check=True,
    )
    print(f"{out}: {total / SR:.1f}s, {n} 句旁白, sfx={'on' if meta.get('ready') else 'off'}")


if __name__ == "__main__":
    main()
