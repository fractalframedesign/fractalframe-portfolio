import { getRemotionEnvironment } from "remotion";

/**
 * While rendering, component timers that wait in real seconds (the call
 * "answer", the splash, the recording timer) would fire whenever render speed
 * allowed. Timers of a second or more never fire during a render, so every
 * frame is a pure function of time.
 */
const SECOND = 1000;

if (typeof window !== "undefined" && getRemotionEnvironment().isRendering) {
  const realSetInterval = window.setInterval.bind(window);
  const realSetTimeout = window.setTimeout.bind(window);
  window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
    (timeout ?? 0) >= SECOND ? 0 : realSetInterval(handler, timeout, ...args)) as typeof window.setInterval;
  window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
    (timeout ?? 0) >= SECOND ? 0 : realSetTimeout(handler, timeout, ...args)) as typeof window.setTimeout;
}
