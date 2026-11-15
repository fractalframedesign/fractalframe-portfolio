// 120 BPM at 30 fps: one beat = 15 frames, one bar = 60 frames. Every cut lands on a beat.
export const FPS = 30;
export const BEAT = 15;
export const DURATION = 600;

export const SCENES = {
  hook: { from: 0, to: 90 },
  reveal: { from: 90, to: 240 },
  callAt: 180,
  messages: { from: 240, to: 375 },
  desktop: { from: 375, to: 465 },
  system: { from: 465, to: 540 },
  outro: { from: 540, to: 600 },
} as const;
