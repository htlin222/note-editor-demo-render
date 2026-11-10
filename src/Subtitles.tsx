import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "../narration/timeline.json";
import { font } from "./theme";

/**
 * 內嵌字幕：每次顯示一個完整句子，white-space: nowrap 保證絕不在句中換行。
 */
export const Subtitles: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const sec = frame / fps;

	let current: string | null = null;
	let op = 1;
	for (const scene of timeline.scenes) {
		for (const s of scene.sentences) {
			const end = s.startSec + s.durSec + 0.3;
			if (sec >= s.startSec && sec <= end) {
				current = s.text;
				// 每句 0.12 秒淡入、0.15 秒淡出（相鄰句之間有 gap，不會互疊）
				op = Math.min(1, (sec - s.startSec) / 0.12, (end - sec) / 0.15);
			}
		}
	}

	if (!current) return null;

	return (
		<AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
			<div
				style={{
					marginBottom: 48,
					padding: "12px 38px",
					borderRadius: 14,
					background: "rgba(8, 13, 26, 0.86)",
					border: "1px solid rgba(148,163,184,0.22)",
					boxShadow: "0 12px 36px rgba(0,0,0,0.35)",
					color: "#ffffff",
					fontSize: 38,
					fontWeight: 500,
					fontFamily: font,
					letterSpacing: 1.5,
					whiteSpace: "nowrap",
					opacity: op,
					transform: `translateY(${(1 - op) * 6}px)`,
					textShadow: "0 2px 8px rgba(0,0,0,0.4)",
				}}
			>
				{current}
			</div>
		</AbsoluteFill>
	);
};
