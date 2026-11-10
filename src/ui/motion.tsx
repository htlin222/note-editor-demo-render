/**
 * 動態設計元件：聚光框（周圍 dim）、說明字卡、章節卡、HUD（章節標籤 + 分段進度條）。
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { font, hud, hudMono } from "../theme";
import { CARD_RIGHT, CARD_W, type CardWindow } from "../cards";
import { type CamState, toScreen } from "../camera";
import { CHAPTER_COUNT, FPS, SCENE_LIST, TOTAL_FRAMES } from "../timing";
import { StageStepper } from "./StageStepper";

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const k = (frame: number, a: number, b: number, from = 0, to = 1) =>
	interpolate(frame, [a, b], [from, to], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
		easing: ease,
	});

/* ── 聚光框：焦點外變暗，框線帶呼吸光 ───────────────────────── */
export const Spotlight: React.FC<{ s: CamState }> = ({ s }) => {
	const frame = useCurrentFrame();
	if (s.dim < 0.01) return null;
	const p0 = toScreen(s, s.fx, s.fy);
	const w = s.fw * s.z;
	const h = s.fh * s.z;
	const breathe = 0.75 + 0.25 * Math.sin(frame / 9);
	return (
		<div
			style={{
				position: "absolute",
				left: p0.x,
				top: p0.y,
				width: w,
				height: h,
				borderRadius: 14,
				pointerEvents: "none",
				boxShadow: [
					`0 0 0 3px rgba(96,165,250,${0.95 * s.dim})`,
					`0 0 28px 6px rgba(59,130,246,${0.45 * s.dim * breathe})`,
					`0 0 0 4000px rgba(5,10,22,${0.68 * s.dim})`,
				].join(", "),
			}}
		>
			{/* 四角刻度（HUD 感） */}
			{[
				{ left: -10, top: -10, bl: "3px solid", bt: "3px solid" },
				{ right: -10, top: -10, br: "3px solid", bt: "3px solid" },
				{ left: -10, bottom: -10, bl: "3px solid", bb: "3px solid" },
				{ right: -10, bottom: -10, br: "3px solid", bb: "3px solid" },
			].map((c, i) => (
				<div
					key={i}
					style={{
						position: "absolute",
						width: 22,
						height: 22,
						left: c.left,
						right: c.right,
						top: c.top,
						bottom: c.bottom,
						borderLeft: c.bl,
						borderRight: c.br,
						borderTop: c.bt,
						borderBottom: c.bb,
						borderColor: `rgba(191,219,254,${s.dim})`,
					}}
				/>
			))}
		</div>
	);
};

/* ── 說明字卡（右側玻璃面板）──────────────────────────────── */
const KIND_LABEL: Record<
	CardWindow["kind"],
	{ en: string; zh: string; icon: string }
> = {
	step: { en: "STEP", zh: "操作步驟", icon: "" },
	tip: { en: "TIP", zh: "流程建議", icon: "💡" },
	warn: { en: "CAUTION", zh: "注意事項", icon: "⚠️" },
	design: { en: "DESIGN", zh: "設計理念", icon: "🎯" },
	key: { en: "SHORTCUT", zh: "快捷鍵", icon: "⌨️" },
	write: { en: "WHAT TO WRITE", zh: "建議內容", icon: "✍️" },
	rule: { en: "RULE", zh: "規則", icon: "📏" },
};

export const InfoCard: React.FC<{ c: CardWindow; chapter: number | null }> = ({
	c,
	chapter,
}) => {
	const frame = useCurrentFrame();
	if (frame < c.start - 2 || frame > c.end + 2) return null;
	const inP = k(frame, c.start, c.start + 14);
	const outP = k(frame, c.end - 10, c.end);
	const op = inP * (1 - outP);
	const accent = hud.accent[c.kind];
	const lab = KIND_LABEL[c.kind];
	const bodyIn = k(frame, c.start + 8, c.start + 22);
	return (
		<div
			style={{
				position: "absolute",
				right: CARD_RIGHT,
				top: 150,
				width: CARD_W,
				opacity: op,
				transform: `translateX(${(1 - inP) * 60 + outP * 30}px)`,
				fontFamily: font,
				pointerEvents: "none",
			}}
		>
			<div
				style={{
					position: "relative",
					background: hud.glass,
					border: `1px solid ${hud.glassBorder}`,
					borderRadius: 20,
					padding: "30px 36px 34px 44px",
					boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
					overflow: "hidden",
					backdropFilter: "blur(10px)",
				}}
			>
				{/* 左側色條（由上往下長出） */}
				<div
					style={{
						position: "absolute",
						left: 0,
						top: 0,
						width: 7,
						height: `${inP * 100}%`,
						background: accent,
					}}
				/>
				{/* 大號步驟數字浮水印 */}
				{c.kind === "step" ? (
					<div
						style={{
							position: "absolute",
							right: 22,
							top: -6,
							fontFamily: hudMono,
							fontSize: 132,
							fontWeight: 700,
							color: accent,
							opacity: 0.13,
							lineHeight: 1,
						}}
					>
						{String(c.stepNo).padStart(2, "0")}
					</div>
				) : null}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 14,
						fontFamily: hudMono,
						fontSize: 19,
						letterSpacing: 3.5,
						color: accent,
					}}
				>
					<span style={{ fontWeight: 700 }}>
						{c.kind === "step"
							? `STEP ${String(c.stepNo).padStart(2, "0")}`
							: lab.en}
					</span>
					<span
						style={{ width: 36, height: 2, background: accent, opacity: 0.6 }}
					/>
					<span
						style={{ fontFamily: font, letterSpacing: 2, color: hud.inkMuted }}
					>
						{lab.icon ? `${lab.icon} ` : ""}
						{lab.zh}
						{chapter ? `・CH ${String(chapter).padStart(2, "0")}` : ""}
					</span>
				</div>
				<div
					style={{
						marginTop: 16,
						fontSize: 42,
						fontWeight: 800,
						color: hud.ink,
						lineHeight: 1.25,
						letterSpacing: 1,
					}}
				>
					{c.title}
				</div>
				{c.body ? (
					<div
						style={{
							marginTop: 14,
							fontSize: 28,
							color: "#cbd5e1",
							lineHeight: 1.55,
							opacity: bodyIn,
							transform: `translateY(${(1 - bodyIn) * 10}px)`,
						}}
					>
						{c.body}
					</div>
				) : null}
			</div>
		</div>
	);
};

/* ── 章節卡：場景開頭，背景模糊變暗，大標題置中 ───────────── */
export const ChapterCard: React.FC<{
	chapter: number;
	title: string;
	subtitle: string;
	until: number;
	stage?: string | null;
	part?: string | null;
}> = ({ chapter, title, subtitle, until, stage, part }) => {
	const frame = useCurrentFrame();
	if (frame > until + 2) return null;
	const out = k(frame, until - 12, until);
	const line = k(frame, 4, 26);
	const tIn = k(frame, 8, 26);
	const sIn = k(frame, 16, 34);
	return (
		<AbsoluteFill style={{ opacity: 1 - out, pointerEvents: "none" }}>
			<AbsoluteFill
				style={{
					background: "rgba(5,10,22,0.78)",
					backdropFilter: "blur(14px)",
				}}
			/>
			<AbsoluteFill
				style={{ justifyContent: "center", paddingLeft: 200, fontFamily: font }}
			>
				<div
					style={{
						fontFamily: hudMono,
						fontSize: 26,
						letterSpacing: 8,
						color: hud.ring,
						opacity: tIn,
					}}
				>
					CHAPTER {String(chapter).padStart(2, "0")}
					<span style={{ color: hud.inkMuted }}>
						{" "}
						/ {String(CHAPTER_COUNT).padStart(2, "0")}
					</span>
					{part && part !== "共通" ? (
						<span
							style={{
								fontFamily: font,
								letterSpacing: 4,
								color: "#fde68a",
								marginLeft: 28,
							}}
						>
							{part}病摘
						</span>
					) : null}
				</div>
				<div
					style={{
						height: 3,
						width: 760 * line,
						background: `linear-gradient(90deg, ${hud.ring}, transparent)`,
						margin: "26px 0 30px",
					}}
				/>
				<div
					style={{
						fontSize: 92,
						fontWeight: 900,
						color: "#fff",
						letterSpacing: 4,
						opacity: tIn,
						transform: `translateY(${(1 - tIn) * 30}px)`,
					}}
				>
					{title}
				</div>
				{subtitle ? (
					<div
						style={{
							marginTop: 22,
							fontSize: 38,
							color: "#cbd5e1",
							letterSpacing: 2,
							opacity: sIn,
						}}
					>
						{subtitle}
					</div>
				) : null}
				{stage ? (
					<div style={{ marginTop: 64, opacity: sIn }}>
						<StageStepper
							current={stage}
							size={28}
							progress={k(frame, 10, 40)}
						/>
					</div>
				) : null}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/* ── HUD：左下章節標籤 + 底部分段進度條（全片層級）────────── */
export const Hud: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = frame / FPS;
	const chapters = SCENE_LIST.filter((s) => s.chapter);
	const cur = chapters.find((s) => sec >= s.startSec && sec < s.endSec);
	const total = TOTAL_FRAMES / FPS;
	const first = chapters[0]?.startSec ?? 0;
	const last = chapters.length ? chapters[chapters.length - 1].endSec : total;
	const vis = k(sec, first, first + 0.6) * (1 - k(sec, last - 0.4, last));
	if (vis <= 0) return null;
	return (
		<AbsoluteFill style={{ pointerEvents: "none", opacity: vis }}>
			{cur ? (
				<div
					style={{
						position: "absolute",
						left: 28,
						bottom: 30,
						display: "flex",
						alignItems: "center",
						gap: 12,
						padding: "8px 18px 8px 10px",
						background: "rgba(11,18,32,0.72)",
						borderRadius: 10,
						fontFamily: font,
						color: hud.ink,
						fontSize: 20,
					}}
				>
					<span
						style={{
							fontFamily: hudMono,
							fontSize: 17,
							fontWeight: 700,
							background: hud.ring,
							color: "#0b1220",
							borderRadius: 6,
							padding: "3px 8px",
						}}
					>
						{String(cur.chapter).padStart(2, "0")}
					</span>
					{cur.stage ? (
						<span style={{ color: hud.ring, fontWeight: 700 }}>
							{cur.part && cur.part !== "共通" ? `${cur.part}・` : ""}
							{cur.stage}
						</span>
					) : null}
					<span style={{ opacity: 0.5 }}>|</span>
					{cur.title}
				</div>
			) : null}
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					height: 7,
					display: "flex",
					gap: 3,
					background: "rgba(5,10,22,0.5)",
				}}
			>
				{chapters.map((s) => {
					const p = Math.max(
						0,
						Math.min(1, (sec - s.startSec) / (s.endSec - s.startSec)),
					);
					return (
						<div
							key={s.id}
							style={{
								flex: s.endSec - s.startSec,
								background: "rgba(148,163,184,0.25)",
								position: "relative",
							}}
						>
							<div
								style={{
									position: "absolute",
									inset: 0,
									width: `${p * 100}%`,
									background: hud.ring,
								}}
							/>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
