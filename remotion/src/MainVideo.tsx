import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { IntroScene } from "./scenes/IntroScene";
import { AlgoScene } from "./scenes/AlgoScene";
import { OutroScene } from "./scenes/OutroScene";
import { ALGO_CONFIGS } from "./algoData";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

// Load fonts
loadSpaceGrotesk();
loadJetBrainsMono();

// Scene durations (frames at 30fps)
const INTRO_DUR = 90;       // 3s
const ALGO_DUR = 105;       // 3.5s each
const OUTRO_DUR = 120;      // 4s
const TRANSITION_DUR = 15;  // 0.5s

export const MainVideo: React.FC = () => {
  const transitions = [
    { presentation: fade(), timing: linearTiming({ durationInFrames: TRANSITION_DUR }) },
    { presentation: slide({ direction: "from-right" }), timing: linearTiming({ durationInFrames: TRANSITION_DUR }) },
    { presentation: wipe({ direction: "from-left" }), timing: linearTiming({ durationInFrames: TRANSITION_DUR }) },
    { presentation: fade(), timing: linearTiming({ durationInFrames: TRANSITION_DUR }) },
    { presentation: slide({ direction: "from-right" }), timing: linearTiming({ durationInFrames: TRANSITION_DUR }) },
    { presentation: wipe({ direction: "from-left" }), timing: linearTiming({ durationInFrames: TRANSITION_DUR }) },
    { presentation: fade(), timing: linearTiming({ durationInFrames: TRANSITION_DUR }) },
  ];

  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO_DUR}>
          <IntroScene />
        </TransitionSeries.Sequence>

        {ALGO_CONFIGS.map((config, i) => (
          <React.Fragment key={config.name}>
            <TransitionSeries.Transition
              presentation={transitions[i].presentation}
              timing={transitions[i].timing}
            />
            <TransitionSeries.Sequence durationInFrames={ALGO_DUR}>
              <AlgoScene {...config} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}

        <TransitionSeries.Transition
          presentation={transitions[6].presentation}
          timing={transitions[6].timing}
        />
        <TransitionSeries.Sequence durationInFrames={OUTRO_DUR}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
