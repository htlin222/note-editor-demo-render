import { useCurrentFrame } from "remotion";
import timeline from "../narration/timeline.json";

export const FPS: number = timeline.fps;
export const TOTAL_FRAMES: number = timeline.totalFrames;

export type Card = {
	kind: "step" | "tip" | "warn" | "design" | "key" | "write" | "rule";
	title: string;
	body?: string;
	until?: number;
};
export type Beat = { start: number; end: number; text: string; card?: Card };
export type SceneTiming = {
	id: string;
	title: string;
	subtitle: string;
	chapter: number | null;
	stage: string | null;
	part: string | null;
	from: number;
	dur: number;
	sent: Beat[];
};

type RawScene = {
	id: string;
	title: string;
	subtitle?: string;
	chapter?: number | null;
	stage?: string | null;
	part?: string | null;
	startSec: number;
	endSec: number;
	sentences: { text: string; card?: Card; startSec: number; durSec: number }[];
};
export const SCENE_LIST = timeline.scenes as unknown as RawScene[];
export const STAGES: string[] =
	(timeline as { stages?: string[] }).stages ?? [];
export const CHAPTER_COUNT: number =
	(timeline as { chapterCount?: number }).chapterCount ?? 0;

/** 取得場景的絕對起始 frame、長度，與每句旁白相對於場景起點的 frame 區間 */
export const sceneTiming = (id: string): SceneTiming => {
	const s = SCENE_LIST.find((x) => x.id === id);
	if (!s) throw new Error(`scene not found: ${id}`);
	const from = Math.round(s.startSec * FPS);
	return {
		id,
		title: s.title,
		subtitle: s.subtitle ?? "",
		chapter: s.chapter ?? null,
		stage: s.stage ?? null,
		part: s.part ?? null,
		from,
		dur: Math.ceil((s.endSec - s.startSec) * FPS),
		sent: s.sentences.map((x) => ({
			start: Math.round(x.startSec * FPS) - from,
			end: Math.round((x.startSec + x.durSec) * FPS) - from,
			text: x.text,
			card: x.card,
		})),
	};
};

/** 場景內部使用：目前 frame 與「已開始的最後一句」索引（-1 = 尚未開始） */
export const useBeat = (t: SceneTiming) => {
	const frame = useCurrentFrame();
	let idx = -1;
	for (let i = 0; i < t.sent.length; i++) {
		if (frame >= t.sent[i].start) idx = i;
	}
	return { frame, idx };
};
