/**
 * 開場與結尾（motion graphics，無錄影）。
 * 開場：標題 → 章節路線圖逐一亮起；結尾：完整流程節點依旁白逐一點亮。
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { font, hud, hudMono } from "../theme";
import { STAGES, sceneTiming, useBeat } from "../timing";
import { StageStepper } from "../ui/StageStepper";

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const k = (f: number, a: number, b: number) =>
	interpolate(f, [a, b], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
		easing: ease,
	});

/** 深色背景 + 緩慢漂移的格線 + 光暈 */
const Backdrop: React.FC = () => {
	const frame = useCurrentFrame();
	const drift = (frame * 0.4) % 80;
	return (
		<AbsoluteFill
			style={{
				background:
					"radial-gradient(ellipse at 30% 20%, #13284a 0%, #070d1a 55%, #04070f 100%)",
			}}
		>
			<AbsoluteFill
				style={{
					backgroundImage:
						"linear-gradient(rgba(96,165,250,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.07) 1px, transparent 1px)",
					backgroundSize: "80px 80px",
					backgroundPosition: `${drift}px ${drift}px`,
					maskImage:
						"radial-gradient(ellipse at center, black 30%, transparent 80%)",
				}}
			/>
		</AbsoluteFill>
	);
};

export const SceneIntro: React.FC = () => {
	const t = sceneTiming("intro");
	const { frame } = useBeat(t);
	const at = (i: number) => t.sent[Math.min(i, t.sent.length - 1)]?.start ?? 0;
	const titleIn = k(frame, 6, 34);
	const lineIn = k(frame, 20, 50);
	const partsIn = k(frame, at(1), at(1) + 18);
	// 階段列：第 3 句開始逐格亮起，到第 5 句結束亮完
	const stageP = k(frame, at(3) - 6, at(4) + 50);
	const ctaIn = k(frame, at(5), at(5) + 16);
	const zoomOut = 1 + 0.05 * (1 - k(frame, 0, 70));
	const out = k(frame, t.dur - 14, t.dur);
	return (
		<AbsoluteFill style={{ fontFamily: font, opacity: 1 - out }}>
			<Backdrop />
			<AbsoluteFill
				style={{ padding: "130px 140px", transform: `scale(${zoomOut})` }}
			>
				<div
					style={{
						fontFamily: hudMono,
						fontSize: 24,
						letterSpacing: 10,
						color: hud.ring,
						opacity: titleIn,
					}}
				>
					CLINICAL WRITING 101 · 和信醫院病歷編輯平台
				</div>
				<div
					style={{
						height: 3,
						width: 900 * lineIn,
						background: `linear-gradient(90deg, ${hud.ring}, transparent)`,
						margin: "26px 0 30px",
					}}
				/>
				<div
					style={{
						fontSize: 110,
						fontWeight: 900,
						color: "#fff",
						letterSpacing: 6,
						opacity: titleIn,
						transform: `translateY(${(1 - titleIn) * 40}px)`,
					}}
				>
					出入院病摘<span style={{ color: hud.ring }}> 第一天就上手</span>
				</div>
				<div
					style={{
						display: "flex",
						gap: 40,
						marginTop: 56,
						opacity: partsIn,
						transform: `translateY(${(1 - partsIn) * 20}px)`,
					}}
				>
					{[
						{ h: "入院病摘", d: "病人住進來時寫：為什麼來、現在狀況、計畫" },
						{ h: "出院病摘", d: "病人出院時寫：住院做了什麼、出院狀況與指示" },
					].map((x) => (
						<div
							key={x.h}
							style={{
								padding: "22px 30px",
								borderRadius: 16,
								background: "rgba(15,23,42,0.6)",
								border: "1.5px solid rgba(96,165,250,0.35)",
								width: 720,
							}}
						>
							<div style={{ fontSize: 38, fontWeight: 800, color: "#fff" }}>
								{x.h}
							</div>
							<div style={{ fontSize: 26, color: "#cbd5e1", marginTop: 8 }}>
								{x.d}
							</div>
						</div>
					))}
				</div>
				<div style={{ marginTop: 70, opacity: k(frame, at(2), at(2) + 14) }}>
					<div
						style={{
							fontFamily: hudMono,
							fontSize: 22,
							letterSpacing: 6,
							color: hud.inkMuted,
							marginBottom: 22,
						}}
					>
						THE ORDER · 寫作順序（全片大原則）
					</div>
					<StageStepper
						size={34}
						progress={stageP}
						litUpTo={Math.floor(stageP * STAGES.length) - 1}
					/>
				</div>
				<div
					style={{
						marginTop: 50,
						fontSize: 34,
						color: "#fde68a",
						fontWeight: 700,
						opacity: ctaIn,
					}}
				>
					▶ 跟著做一遍，第一天就能寫
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/* ── 結尾：照大原則順序回顧 ───────────────────────────── */
export const SceneOutro: React.FC = () => {
	const t = sceneTiming("outro");
	const { frame, idx } = useBeat(t);
	const at = (i: number) => t.sent[Math.min(i, t.sent.length - 1)]?.start ?? 0;
	const titleIn = k(frame, 4, 28);
	// 第 1 句亮到「事項」、第 2 句到「帶入」、第 3 句到「一項一項」、第 4 句到「CRUD」
	const lit = idx >= 4 ? 6 : idx >= 3 ? 5 : idx >= 2 ? 3 : idx >= 1 ? 1 : -1;
	const guard = k(frame, at(5), at(5) + 18);
	const thanks = k(frame, at(6), at(6) + 18);
	const out = k(frame, t.dur - 30, t.dur);
	return (
		<AbsoluteFill style={{ fontFamily: font, opacity: 1 - out }}>
			<Backdrop />
			<AbsoluteFill style={{ alignItems: "center", paddingTop: 190 }}>
				<div
					style={{
						fontFamily: hudMono,
						fontSize: 24,
						letterSpacing: 10,
						color: hud.ring,
						opacity: titleIn,
					}}
				>
					RECAP · 寫病摘的順序
				</div>
				<div
					style={{
						fontSize: 76,
						fontWeight: 900,
						color: "#fff",
						marginTop: 18,
						opacity: titleIn,
						letterSpacing: 4,
					}}
				>
					入院、出院，都照這個順序
				</div>
				<div style={{ marginTop: 100, transform: "scale(1.02)" }}>
					<StageStepper
						size={36}
						progress={k(frame, 0, 40)}
						litUpTo={lit}
						current={lit >= 0 ? STAGES[lit] : null}
					/>
				</div>
				<div
					style={{
						marginTop: 90,
						padding: "18px 40px",
						borderRadius: 14,
						border: `2px solid ${hud.accent.warn}`,
						background: "rgba(251,191,36,0.1)",
						color: "#fde68a",
						fontSize: 32,
						fontWeight: 700,
						opacity: guard,
						transform: `translateY(${(1 - guard) * 20}px)`,
					}}
				>
					⚠️ 自動帶入只填空白段落・AI 與帶入內容由你逐段核對
				</div>
				<div
					style={{
						marginTop: 50,
						fontSize: 44,
						color: "#fff",
						fontWeight: 700,
						opacity: thanks,
						letterSpacing: 6,
					}}
				>
					謝謝收看，祝你臨床順利
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
