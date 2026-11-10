/**
 * 大原則階段列：選人 → 事項 → 看資料 → 帶入 → 修改 → 一項一項 → CRUD。
 * current = 目前階段；progress（0–1）控制逐格亮起動畫。
 */
import React from "react";
import { font, hud, hudMono } from "../theme";
import { STAGES } from "../timing";

export const StageStepper: React.FC<{
	current?: string | null;
	size?: number; // 字級
	progress?: number;
	litUpTo?: number; // 回顧用：亮到第幾格（含），-1 全暗
}> = ({ current, size = 26, progress = 1, litUpTo }) => {
	const ci = current ? STAGES.indexOf(current) : -1;
	return (
		<div style={{ display: "flex", alignItems: "center", gap: size * 0.45, fontFamily: font }}>
			{STAGES.map((s, i) => {
				const appear = Math.max(0, Math.min(1, progress * STAGES.length - i));
				const isCur = i === ci;
				const done = litUpTo != null ? i <= litUpTo : ci >= 0 && i < ci;
				const color = isCur ? "#0b1220" : done ? hud.ink : hud.inkMuted;
				return (
					<React.Fragment key={s}>
						{i > 0 ? (
							<span style={{ color: done || isCur ? hud.ring : "rgba(148,163,184,0.4)", fontSize: size * 0.8, opacity: appear }}>→</span>
						) : null}
						<span
							style={{
								opacity: 0.2 + 0.8 * appear,
								transform: `translateY(${(1 - appear) * 8}px)`,
								padding: `${size * 0.22}px ${size * 0.6}px`,
								borderRadius: size * 0.4,
								fontSize: size,
								fontWeight: isCur ? 800 : 600,
								color,
								background: isCur ? hud.ring : done ? "rgba(96,165,250,0.16)" : "rgba(148,163,184,0.08)",
								border: `1.5px solid ${isCur ? hud.ring : done ? "rgba(96,165,250,0.45)" : "rgba(148,163,184,0.22)"}`,
								boxShadow: isCur ? "0 0 24px rgba(96,165,250,0.55)" : "none",
								whiteSpace: "nowrap",
							}}
						>
							<span style={{ fontFamily: hudMono, fontSize: size * 0.62, opacity: 0.75, marginRight: size * 0.3 }}>{i + 1}</span>
							{s}
						</span>
					</React.Fragment>
				);
			})}
		</div>
	);
};
