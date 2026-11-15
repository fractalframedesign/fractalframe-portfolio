import "./styles.css";

import { Composition } from "remotion";

import { LinkVideo } from "./LinkVideo";
import { DURATION, FPS } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Composition id="RakutenLink" component={LinkVideo} width={1920} height={1080} fps={FPS} durationInFrames={DURATION} />
);
