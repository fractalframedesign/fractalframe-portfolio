import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Articles } from "./scenes/Articles";
import { Components } from "./scenes/Components";
import { Opening } from "./scenes/Opening";
import { Outro } from "./scenes/Outro";
import { Statement } from "./scenes/Statement";

// 660 frames of scenes minus four 15-frame crossfades = 600 frames (20 s at 30 fps)
export const Intro: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Opening" durationInFrames={120}>
      <Opening />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence name="Statement" durationInFrames={165}>
      <Statement />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence name="Components" durationInFrames={150}>
      <Components />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence name="Articles" durationInFrames={135}>
      <Articles />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence name="Outro" durationInFrames={90}>
      <Outro />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
