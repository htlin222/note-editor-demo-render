import React from "react";
import { theme, font } from "../theme";

export const Btn: React.FC<{
	children: React.ReactNode;
	variant?: "primary" | "outline" | "ghost" | "danger" | "green";
	size?: "md" | "lg";
	active?: boolean;
	style?: React.CSSProperties;
}> = ({ children, variant = "outline", size = "md", active, style }) => {
	const base: React.CSSProperties = {
		display: "inline-flex",
		alignItems: "center",
		gap: 8,
		padding: size === "lg" ? "12px 22px" : "9px 16px",
		borderRadius: 8,
		fontSize: size === "lg" ? 22 : 19,
		fontWeight: 500,
		fontFamily: font,
		border: `1.5px solid ${theme.border}`,
		background: theme.panel,
		color: "#334155",
		whiteSpace: "nowrap",
	};
	const variants: Record<string, React.CSSProperties> = {
		primary: { background: theme.primary, borderColor: theme.primary, color: "#fff" },
		green: { background: theme.green, borderColor: theme.green, color: "#fff" },
		danger: { background: theme.red, borderColor: theme.red, color: "#fff" },
		outline: {},
		ghost: { border: "1.5px solid transparent" },
	};
	const activeStyle: React.CSSProperties = active
		? { boxShadow: `0 0 0 3px ${theme.primarySoft}`, borderColor: theme.primary }
		: {};
	return <div style={{ ...base, ...variants[variant], ...activeStyle, ...style }}>{children}</div>;
};

export const Badge: React.FC<{
	children: React.ReactNode;
	color?: "blue" | "green" | "amber" | "red" | "violet" | "slate";
	style?: React.CSSProperties;
}> = ({ children, color = "blue", style }) => {
	const map = {
		blue: [theme.primarySoft, theme.primary],
		green: [theme.greenSoft, theme.green],
		amber: [theme.amberSoft, theme.amber],
		red: [theme.redSoft, theme.red],
		violet: [theme.violetSoft, theme.violet],
		slate: ["#f1f5f9", "#475569"],
	} as const;
	const [bg, fg] = map[color];
	return (
		<span
			style={{
				background: bg,
				color: fg,
				padding: "4px 14px",
				borderRadius: 999,
				fontSize: 18,
				fontWeight: 600,
				fontFamily: font,
				whiteSpace: "nowrap",
				...style,
			}}
		>
			{children}
		</span>
	);
};

export const Checkbox: React.FC<{ checked?: boolean; label: string; sub?: string }> = ({
	checked,
	label,
	sub,
}) => (
	<div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: font }}>
		<div
			style={{
				width: 24,
				height: 24,
				borderRadius: 6,
				border: `2px solid ${checked ? theme.primary : "#94a3b8"}`,
				background: checked ? theme.primary : "#fff",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				color: "#fff",
				fontSize: 17,
				fontWeight: 700,
				flexShrink: 0,
			}}
		>
			{checked ? "✓" : ""}
		</div>
		<span style={{ fontSize: 21, color: "#1e293b" }}>{label}</span>
		{sub ? <span style={{ fontSize: 18, color: theme.textMuted }}>{sub}</span> : null}
	</div>
);

export const Field: React.FC<{
	label: string;
	value?: string;
	width?: number;
	filled?: boolean;
}> = ({ label, value, width = 220, filled }) => (
	<div style={{ fontFamily: font }}>
		<div style={{ fontSize: 17, color: theme.textMuted, marginBottom: 6 }}>{label}</div>
		<div
			style={{
				width,
				padding: "9px 14px",
				border: `1.5px solid ${filled ? theme.primary : theme.border}`,
				borderRadius: 8,
				fontSize: 20,
				minHeight: 44,
				color: theme.text,
				background: "#fff",
			}}
		>
			{value || ""}
		</div>
	</div>
);

export const PanelBox: React.FC<{
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({ children, style }) => (
	<div
		style={{
			background: theme.panel,
			border: `1px solid ${theme.border}`,
			borderRadius: 12,
			...style,
		}}
	>
		{children}
	</div>
);
