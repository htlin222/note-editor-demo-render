import React from "react";
import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import timeline from "../narration/timeline.json";

/** 依 timeline 逐句掛上 Edge TTS 音檔 */
export const Narration: React.FC = () => {
	const { fps } = useVideoConfig();
	return (
		<>
			{timeline.scenes.flatMap((scene) =>
				scene.sentences.map((s, i) => (
					<Sequence
						key={`${scene.id}-${i}`}
						from={Math.round(s.startSec * fps)}
						durationInFrames={Math.ceil(s.durSec * fps) + 2}
					>
						<Audio src={staticFile(s.file)} />
					</Sequence>
				)),
			)}
		</>
	);
};
