import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme, font } from "../theme";

/** 場景淡入 */
export const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({
	children,
	delay = 0,
}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame - delay, [0, 12], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	return <div style={{ opacity, width: "100%", height: "100%" }}>{children}</div>;
};

/** 動畫游標：依 waypoints 在畫面上移動，click 時產生漣漪 */
export type Waypoint = { frame: number; x: number; y: number; click?: boolean };

export const Cursor: React.FC<{ waypoints: Waypoint[] }> = ({ waypoints }) => {
	const frame = useCurrentFrame();
	if (!waypoints.length || frame < waypoints[0].frame - 15) return null;

	const xs = waypoints.map((w) => w.x);
	const ys = waypoints.map((w) => w.y);
	const fs = waypoints.map((w) => w.frame);
	const x =
		waypoints.length > 1
			? interpolate(frame, fs, xs, { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
			: xs[0];
	const y =
		waypoints.length > 1
			? interpolate(frame, fs, ys, { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
			: ys[0];

	// 找最近一次 click
	let ripple = 0;
	for (const w of waypoints) {
		if (w.click && frame >= w.frame && frame < w.frame + 20) {
			ripple = interpolate(frame, [w.frame, w.frame + 20], [0, 1]);
		}
	}

	return (
		<div style={{ position: "absolute", left: x, top: y, zIndex: 90, pointerEvents: "none" }}>
			{ripple > 0 && (
				<div
					style={{
						position: "absolute",
						left: -30 * ripple,
						top: -30 * ripple,
						width: 60 * ripple,
						height: 60 * ripple,
						borderRadius: "50%",
						border: `3px solid ${theme.primary}`,
						opacity: 1 - ripple,
					}}
				/>
			)}
			<svg width="34" height="34" viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))" }}>
				<path
					d="M5.5 3.2L19 12.2l-6.2 1.1L9.5 19z"
					fill="#0f172a"
					stroke="#ffffff"
					strokeWidth="1.4"
				/>
			</svg>
		</div>
	);
};

/** 高亮框：在指定區域畫出動畫外框 */
export const Highlight: React.FC<{
	x: number;
	y: number;
	w: number;
	h: number;
	from: number;
	until?: number;
	color?: string;
	label?: string;
	labelPos?: "top" | "bottom" | "left" | "right";
}> = ({ x, y, w, h, from, until = 999999, color = theme.primary, label, labelPos = "top" }) => {
	const frame = useCurrentFrame();
	if (frame < from || frame > until) return null;
	const t = interpolate(frame - from, [0, 12], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const fade = interpolate(frame, [until - 8, until], [1, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const labelStyle: React.CSSProperties = {
		position: "absolute",
		background: color,
		color: "#fff",
		fontSize: 24,
		fontWeight: 700,
		fontFamily: font,
		padding: "6px 18px",
		borderRadius: 8,
		whiteSpace: "nowrap",
		...(labelPos === "top" ? { left: 0, top: -52 } : {}),
		...(labelPos === "bottom" ? { left: 0, top: h + 12 } : {}),
		...(labelPos === "left" ? { right: w + 12, top: h / 2 - 22 } : {}),
		...(labelPos === "right" ? { left: w + 12, top: h / 2 - 22 } : {}),
	};
	return (
		<div
			style={{
				position: "absolute",
				left: x,
				top: y,
				width: w,
				height: h,
				border: `4px solid ${color}`,
				borderRadius: 12,
				opacity: t * fade,
				boxShadow: `0 0 0 6px ${color}22, inset 0 0 40px ${color}11`,
				zIndex: 80,
				pointerEvents: "none",
			}}
		>
			{label ? <div style={labelStyle}>{label}</div> : null}
		</div>
	);
};

/** Toast 通知（右上角滑入） */
export const Toast: React.FC<{
	from: number;
	until?: number;
	title: string;
	desc?: string;
	kind?: "success" | "info";
}> = ({ from, until = 999999, title, desc, kind = "success" }) => {
	const frame = useCurrentFrame();
	if (frame < from || frame > until) return null;
	const slide = interpolate(frame - from, [0, 12], [80, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const fade = interpolate(frame, [until - 10, until], [1, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	return (
		<div
			style={{
				position: "absolute",
				top: 110,
				right: 40,
				transform: `translateX(${slide}px)`,
				opacity: fade,
				background: "#fff",
				border: `1.5px solid ${kind === "success" ? theme.green : theme.primary}`,
				borderLeft: `8px solid ${kind === "success" ? theme.green : theme.primary}`,
				borderRadius: 12,
				padding: "16px 26px",
				boxShadow: "0 12px 32px rgba(15,23,42,0.18)",
				fontFamily: font,
				zIndex: 95,
			}}
		>
			<div style={{ fontSize: 23, fontWeight: 700, color: theme.text }}>
				{kind === "success" ? "✓ " : "ℹ "}
				{title}
			</div>
			{desc ? <div style={{ fontSize: 19, color: theme.textMuted, marginTop: 4 }}>{desc}</div> : null}
		</div>
	);
};

/** 注意事項 / 設計理念 說明卡（底部字幕上方浮出） */
export const TipCard: React.FC<{
	from: number;
	until?: number;
	kind: "tip" | "warn" | "design";
	text: string;
	x?: number;
	y?: number;
}> = ({ from, until = 999999, kind, text, x = 480, y = 830 }) => {
	const frame = useCurrentFrame();
	if (frame < from || frame > until) return null;
	const pop = interpolate(frame - from, [0, 10], [0.85, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const op = interpolate(frame - from, [0, 10], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const fade = interpolate(frame, [until - 8, until], [1, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const conf = {
		tip: { icon: "💡", label: "流程建議", bg: "#eff6ff", border: theme.primary, fg: "#1e40af" },
		warn: { icon: "⚠️", label: "注意事項", bg: "#fffbeb", border: theme.amber, fg: "#92400e" },
		design: { icon: "🎯", label: "設計理念", bg: "#f5f3ff", border: theme.violet, fg: "#5b21b6" },
	}[kind];
	return (
		<div
			style={{
				position: "absolute",
				left: x,
				top: y,
				transform: `scale(${pop})`,
				opacity: op * fade,
				background: conf.bg,
				border: `2px solid ${conf.border}`,
				borderRadius: 14,
				padding: "14px 28px",
				fontFamily: font,
				display: "flex",
				alignItems: "center",
				gap: 14,
				boxShadow: "0 10px 30px rgba(15,23,42,0.15)",
				zIndex: 85,
			}}
		>
			<span style={{ fontSize: 30 }}>{conf.icon}</span>
			<div>
				<div style={{ fontSize: 17, fontWeight: 700, color: conf.border, letterSpacing: 2 }}>
					{conf.label}
				</div>
				<div style={{ fontSize: 24, fontWeight: 600, color: conf.fg, whiteSpace: "nowrap" }}>
					{text}
				</div>
			</div>
		</div>
	);
};

/** 打字機文字 */
export const Typewriter: React.FC<{
	text: string;
	from: number;
	cps?: number; // 每秒字數
	style?: React.CSSProperties;
	fps?: number;
}> = ({ text, from, cps = 18, style, fps = 30 }) => {
	const frame = useCurrentFrame();
	const chars = frame < from ? 0 : Math.min(text.length, Math.floor(((frame - from) / fps) * cps));
	const done = chars >= text.length;
	return (
		<span style={style}>
			{text.slice(0, chars)}
			{!done && chars > 0 ? (
				<span style={{ opacity: Math.sin(frame / 4) > 0 ? 1 : 0 }}>▍</span>
			) : null}
		</span>
	);
};
