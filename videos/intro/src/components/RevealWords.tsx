import { Easing, interpolate, useCurrentFrame } from "remotion";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Text that arrives one word at a time: each word rises, sharpens from a blur
 * and fades in, a few frames after the one before it.
 */
export const RevealWords: React.FC<{
  text: string;
  delay: number;
  stagger?: number;
  style?: React.CSSProperties;
}> = ({ text, delay, stagger = 4, style }) => {
  const frame = useCurrentFrame();

  return (
    <div style={style}>
      {text.split(" ").map((word, i) => {
        const start = delay + i * stagger;
        const progress = interpolate(frame, [start, start + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              opacity: progress,
              translate: `0px ${(1 - progress) * 24}px`,
              filter: `blur(${(1 - progress) * 10}px)`,
            }}
          >
            {word + " "}
          </span>
        );
      })}
    </div>
  );
};
