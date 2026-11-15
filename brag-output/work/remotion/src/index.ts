// Must run before any component module schedules a timer
import "./freezeTimers";

import { registerRoot } from "remotion";

import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
