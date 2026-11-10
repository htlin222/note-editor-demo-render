/**
 * 連續鏡頭：把錄影時記下的 cam 事件（footage 座標的框）轉成「縮放 + 平移 + 聚光框 + dim」的
 * 時間函數。每個屬性各自走 monotone cubic（PCHIP）：停留處斜率為 0，所以推移自然 ease-in/out，
 * 中途改目標也不會跳（參考 cvvh-circuit-motion-design 的 camera）。
 *
 * 字卡出現時，可視區改為「字卡左側」，鏡頭自動把焦點框進字卡左邊的空間，避免字卡蓋住焦點。
 */
import meta from "./footage-meta.json";
import { CARD_ZONE_W, cardWindows } from "./cards";
import type { SceneTiming } from "./timing";

export const W = 1920;
export const H = 1080;
const SUB_ZONE = 150; // 底部字幕區，焦點不要放進去

type Box = { x: number; y: number; w: number; h: number };
type CamEvent = { t: number; box: Box | null; zoom: number; pad: number; dim: boolean; move: number };
type Meta = Record<string, { trimSec: number; sceneDur: number; events?: { camera?: CamEvent[] } }>;
const M = meta as unknown as Meta;

/** 某一刻的鏡頭狀態（footage 座標）：可視窗左上 (left, top)、倍率 z、聚光框、dim 強度 */
export type CamState = { left: number; top: number; z: number; fx: number; fy: number; fw: number; fh: number; dim: number };

const FULL: CamState = { left: 0, top: 0, z: 1, fx: 0, fy: 0, fw: W, fh: H, dim: 0 };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** 依框與是否有字卡，算出目標鏡頭狀態 */
const target = (ev: { box: Box | null; zoom: number; pad: number; dim: boolean }, cardOn: boolean): CamState => {
	if (!ev.box) return FULL;
	const b = ev.box;
	const availW = cardOn ? W - CARD_ZONE_W : W; // 字卡在右側
	const availH = H - SUB_ZONE - 40;
	const bw = b.w + ev.pad * 2;
	const bh = b.h + ev.pad * 2;
	const z = clamp(Math.min(ev.zoom, (availW * 0.86) / bw, (availH * 0.86) / bh), 1, 4);
	const cx = b.x + b.w / 2;
	const cy = b.y + b.h / 2;
	// 讓框中心落在可視區中心（字卡左側 / 字幕上方）
	const screenCx = availW / 2;
	const screenCy = 40 + availH / 2;
	const left = clamp(cx - screenCx / z, 0, W - W / z);
	const top = clamp(cy - screenCy / z, 0, H - H / z);
	const g = 10; // 聚光框比元素大一點
	return { left, top, z, fx: b.x - g, fy: b.y - g, fw: b.w + g * 2, fh: b.h + g * 2, dim: ev.dim ? 1 : 0 };
};

/* ---- PCHIP ---- */
const pchip = (xs: number[], ys: number[]) => {
	const n = xs.length;
	if (n === 1) return () => ys[0];
	const h: number[] = [], d: number[] = [], m: number[] = new Array(n);
	for (let i = 0; i < n - 1; i++) {
		h[i] = xs[i + 1] - xs[i];
		d[i] = (ys[i + 1] - ys[i]) / h[i];
	}
	m[0] = d[0];
	m[n - 1] = d[n - 2];
	for (let i = 1; i < n - 1; i++) {
		if (d[i - 1] * d[i] <= 0) m[i] = 0;
		else {
			const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1];
			m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
		}
	}
	// 停留段（相鄰值相等）兩端斜率強制為 0 → 推移起訖都是緩入緩出
	for (let i = 0; i < n; i++) {
		if ((i > 0 && ys[i] === ys[i - 1]) || (i < n - 1 && ys[i] === ys[i + 1])) m[i] = 0;
	}
	return (x: number) => {
		if (x <= xs[0]) return ys[0];
		if (x >= xs[n - 1]) return ys[n - 1];
		let i = 0;
		while (i < n - 2 && x > xs[i + 1]) i++;
		const t = (x - xs[i]) / h[i], t2 = t * t, t3 = t2 * t;
		return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1];
	};
};

const cache = new Map<string, (sec: number) => CamState>();

/** 建立場景的鏡頭函數：sec（場景內秒數）→ CamState */
export const cameraFor = (t: SceneTiming, fps: number): ((sec: number) => CamState) => {
	const hit = cache.get(t.id);
	if (hit) return hit;

	const evs = (M[t.id]?.events?.camera ?? []).slice().sort((a, b) => a.t - b.t);
	const cards = cardWindows(t).map((c) => ({ start: c.start / fps, end: c.end / fps }));
	const cardOnAt = (sec: number) => cards.some((c) => sec >= c.start && sec < c.end);

	// 時間點：cam 事件 + 字卡開關（重新取景）
	type Step = { t: number; ev: CamEvent | null; move: number };
	const steps: Step[] = evs.map((e) => ({ t: Math.max(0, e.t), ev: e, move: e.move ?? 0.9 }));
	for (const c of cards) {
		steps.push({ t: c.start, ev: null, move: 0.7 });
		steps.push({ t: c.end, ev: null, move: 0.7 });
	}
	steps.sort((a, b) => a.t - b.t);

	// 逐步推進，產生 keyframes
	let cur: { box: Box | null; zoom: number; pad: number; dim: boolean } = { box: null, zoom: 1, pad: 0, dim: false };
	const keys: { t: number; s: CamState }[] = [];
	let last = target(cur, false);
	keys.push({ t: 0, s: last });
	for (const st of steps) {
		if (st.ev) cur = st.ev;
		const next = target(cur, cardOnAt(st.t + 0.01));
		if (JSON.stringify(next) === JSON.stringify(last)) continue;
		const prevT = keys[keys.length - 1].t;
		if (st.t <= 0.05) {
			// 場景開頭（setup 期間）的鏡頭：直接作為初始狀態
			keys[0] = { t: 0, s: next };
			last = next;
			continue;
		}
		const start = Math.max(st.t, prevT + 0.05);
		keys.push({ t: start, s: last });
		keys.push({ t: start + st.move, s: next });
		last = next;
	}
	// 同一時間點重複的 key 合併（避免 h=0）
	const clean = keys.filter((k, i) => i === 0 || k.t > keys[i - 1].t + 1e-3);

	const xs = clean.map((k) => k.t);
	const f = {
		left: pchip(xs, clean.map((k) => k.s.left)),
		top: pchip(xs, clean.map((k) => k.s.top)),
		lz: pchip(xs, clean.map((k) => Math.log(k.s.z))),
		fx: pchip(xs, clean.map((k) => k.s.fx)),
		fy: pchip(xs, clean.map((k) => k.s.fy)),
		fw: pchip(xs, clean.map((k) => k.s.fw)),
		fh: pchip(xs, clean.map((k) => k.s.fh)),
		dim: pchip(xs, clean.map((k) => k.s.dim)),
	};
	const fn = (sec: number): CamState => {
		const z = Math.exp(f.lz(sec));
		return {
			z,
			left: clamp(f.left(sec), 0, W - W / z),
			top: clamp(f.top(sec), 0, H - H / z),
			fx: f.fx(sec),
			fy: f.fy(sec),
			fw: f.fw(sec),
			fh: f.fh(sec),
			dim: clamp(f.dim(sec), 0, 1),
		};
	};
	cache.set(t.id, fn);
	return fn;
};

/** footage 座標 → 螢幕座標 */
export const toScreen = (s: CamState, x: number, y: number) => ({ x: (x - s.left) * s.z, y: (y - s.top) * s.z });
