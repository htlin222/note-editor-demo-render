import type { Card, SceneTiming } from "./timing";

/** 字卡佔用的右側寬度（鏡頭取景會避開這一塊） */
export const CARD_W = 600;
export const CARD_RIGHT = 48;
export const CARD_ZONE_W = CARD_W + CARD_RIGHT + 40;

export type CardWindow = Card & { start: number; end: number; stepNo: number; index: number };

/** 場景字卡的顯示區間（frame，相對場景起點）：從該句開始，到下一張卡 / until 句 / 場景結尾 */
export const cardWindows = (t: SceneTiming): CardWindow[] => {
	const out: CardWindow[] = [];
	let stepNo = 0;
	const idxs = t.sent.map((s, i) => (s.card ? i : -1)).filter((i) => i >= 0);
	idxs.forEach((i, k) => {
		const c = t.sent[i].card as Card;
		if (c.kind === "step") stepNo++;
		const nextCard = k + 1 < idxs.length ? t.sent[idxs[k + 1]].start - 4 : t.dur - 12;
		const untilAt = c.until != null && t.sent[c.until] ? t.sent[c.until].start - 4 : Infinity;
		out.push({ ...c, start: t.sent[i].start, end: Math.min(nextCard, untilAt), stepNo, index: k });
	});
	return out;
};
