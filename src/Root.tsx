import React from "react";
import {
	AbsoluteFill,
	Audio,
	Composition,
	Sequence,
	staticFile,
} from "remotion";
import { FPS, SCENE_LIST, TOTAL_FRAMES, sceneTiming } from "./timing";
import { Narration } from "./Narration";
import { Subtitles } from "./Subtitles";
import { SceneIntro, SceneOutro } from "./scenes/Intro";
import { FootageScene } from "./scenes/FootageScene";
import { Hud } from "./ui/motion";
import sfxMeta from "./sfx-meta.json";

const special: Record<string, React.FC> = {
	intro: SceneIntro,
	outro: SceneOutro,
};

const Main: React.FC = () => (
	<AbsoluteFill style={{ background: "#05070d" }}>
		{SCENE_LIST.map(({ id }) => {
			const t = sceneTiming(id);
			const Comp = special[id];
			return (
				<Sequence key={id} from={t.from} durationInFrames={t.dur} name={id}>
					{Comp ? <Comp /> : <FootageScene id={id} />}
				</Sequence>
			);
		})}
		<Hud />
		<Subtitles />
		<Narration />
		{/* 音效軌：scripts/generate-sfx.py 依時間軸 + 導演事件合成（沒有就略過） */}
		{(sfxMeta as { ready?: boolean }).ready ? (
			<Audio src={staticFile("audio/sfx.wav")} volume={0.55} />
		) : null}
	</AbsoluteFill>
);

export const Root: React.FC = () => (
	<Composition
		id="DischargeSummaryDemo"
		component={Main}
		durationInFrames={TOTAL_FRAMES}
		fps={FPS}
		width={1920}
		height={1080}
	/>
);
