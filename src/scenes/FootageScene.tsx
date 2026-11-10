/**
 * 通用錄影場景：真實頁面錄影 → 連續鏡頭（縮放平移）→ 聚光框 dim → 說明字卡 → 章節卡。
 * 不再手寫座標：鏡頭與聚光框完全由錄影時 cam() 記下的 DOM 框驅動。
 */
import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS, sceneTiming } from "../timing";
import { cameraFor } from "../camera";
import { cardWindows } from "../cards";
import { ChapterCard, InfoCard, Spotlight } from "../ui/motion";
import { font } from "../theme";
import meta from "../footage-meta.json";

type Meta = Record<string, { trimSec: number; sceneDur: number }>;
const M = meta as unknown as Meta;

export const FootageScene: React.FC<{ id: string }> = ({ id }) => {
	const t = sceneTiming(id);
	const frame = useCurrentFrame();
	const has = !!M[id];
	const s = cameraFor(t, FPS)(frame / FPS);
	// 章節卡收起時畫面從 1.04 倍緩緩落回 → 進場有「鏡頭落定」的感覺（不影響聚光框座標）
	const settle = t.chapter ? interpolate(frame, [Math.max(0, (t.sent[0]?.start ?? 60) - 24), (t.sent[0]?.start ?? 60) + 6], [1.04, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
	const cards = cardWindows(t);
	// 轉場：場景尾端「變暗＋模糊」，與下一章的章節卡（同樣暗＋模糊）無縫銜接，不再黑場硬切
	const outP = interpolate(frame, [t.dur - 16, t.dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
	const fadeIn = t.chapter ? 0 : interpolate(frame, [0, 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
	const chapterUntil = Math.max(30, (t.sent[0]?.start ?? 60) - 4);

	return (
		<AbsoluteFill style={{ background: "#05070d", overflow: "hidden" }}>
			<AbsoluteFill style={{ transform: `scale(${settle})`, transformOrigin: "50% 45%" }}>
			<AbsoluteFill
				style={{
					transformOrigin: "0 0",
					transform: `translate(${-s.left * s.z}px, ${-s.top * s.z}px) scale(${s.z})`,
				}}
			>
				{has ? (
					<OffthreadVideo
						src={staticFile(`footage/${id}.webm`)}
						trimBefore={Math.round(M[id].trimSec * FPS)}
						muted
						style={{ width: 1920, height: 1080 }}
					/>
				) : (
					<AbsoluteFill style={{ background: "#1e293b", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 48, fontFamily: font }}>
						（尚未錄影：{id}）
					</AbsoluteFill>
				)}
			</AbsoluteFill>
			<Spotlight s={s} />
			</AbsoluteFill>
			{cards.map((c) => (
				<InfoCard key={c.index} c={c} chapter={t.chapter} />
			))}
			{t.chapter ? <ChapterCard chapter={t.chapter} title={t.title} subtitle={t.subtitle} until={chapterUntil} stage={t.stage} part={t.part} /> : null}
			{outP > 0 ? (
				<AbsoluteFill style={{ background: `rgba(5,10,22,${0.78 * outP})`, backdropFilter: `blur(${14 * outP}px)`, pointerEvents: "none" }} />
			) : null}
			{fadeIn > 0 ? <AbsoluteFill style={{ background: "#05070d", opacity: fadeIn, pointerEvents: "none" }} /> : null}
		</AbsoluteFill>
	);
};
