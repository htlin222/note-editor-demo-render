// 對齊院內 note editor 的視覺語彙（Tailwind slate/blue 系）
export const theme = {
	bg: "#f8fafc", // slate-50
	panel: "#ffffff",
	border: "#e2e8f0", // slate-200
	text: "#0f172a", // slate-900
	textMuted: "#64748b", // slate-500
	primary: "#2563eb", // blue-600
	primarySoft: "#dbeafe", // blue-100
	green: "#16a34a",
	greenSoft: "#dcfce7",
	amber: "#d97706",
	amberSoft: "#fef3c7",
	red: "#dc2626",
	redSoft: "#fee2e2",
	violet: "#7c3aed",
	violetSoft: "#ede9fe",
	navy: "#1e3a5f",
};

export const font =
	'"Noto Sans CJK TC", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", -apple-system, sans-serif';
export const mono = '"JetBrains Mono", "Cascadia Code", Consolas, monospace';

// 動態設計（motion graphics）層：深色玻璃 HUD
export const hud = {
	glass: "rgba(11, 18, 32, 0.88)",
	glassBorder: "rgba(148, 163, 184, 0.22)",
	ink: "#f1f5f9",
	inkMuted: "#94a3b8",
	dimInk: "rgba(5, 10, 22, 0.62)",
	ring: "#60a5fa",
	accent: {
		step: "#60a5fa",
		tip: "#34d399",
		warn: "#fbbf24",
		design: "#a78bfa",
		key: "#f472b6",
		write: "#2dd4bf",
		rule: "#fb7185",
	},
};
export const hudMono =
	'"DejaVu Sans Mono", "Noto Sans Mono CJK TC", ui-monospace, monospace';
