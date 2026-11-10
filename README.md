# note-editor-demo-render

出入院病摘教學影片的雲端渲染管線（Remotion）。用 GitHub Actions 把整片切成多段平行渲染，再接合並配上音軌。

- 影片中的病人、病歷與所有資料皆為虛構，錄影時全部 API 均為 mock，不含任何真實病歷。
- 錄影、旁白（Edge TTS）與時間軸在院內 repo 產生；這裡只負責「渲染」。
- 素材（錄影 webm、旁白 mp3、音效）放在 release `assets` 的 `demo-assets.tar.zst`。

## 使用

Actions → render → Run workflow（可設定分段數，預設 20）。完成後成品發布在 release `render-<編號>`。

## 流程

1. `plan`：依 `narration/timeline.json` 的總影格數切段
2. `render`（matrix）：各段 `remotion render --muted --frames=a-b`
3. `audio`：`scripts/mix-audio.py` 依時間軸直接混出旁白＋音效
4. `assemble`：ffmpeg concat（`-c copy`）＋配音軌，驗證影格數後發布
