import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Label } from "../components/Label";
import { sans } from "../fonts";

const words =
  "I lead product design and build the systems that make complex products feel clear.".split(
    " ",
  );

/** The hero line in gray; each word lights up to white as if being read aloud */
export const Statement: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 56,
          padding: "100px 180px",
        }}
      >
        <Label delay={4}>What I do</Label>
        <div
          style={{
            fontSize: 124,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.06,
            maxWidth: 1560,
          }}
        >
          {words.map((word, i) => {
            const start = 10 + i * 6;
            const lit = interpolate(frame, [start, start + 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const appear = interpolate(frame, [i * 2, i * 2 + 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <span
                key={i}
                style={{
                  whiteSpace: "pre",
                  opacity: appear,
                  color: `rgba(250,250,250,${0.22 + lit * 0.78})`,
                }}
              >
                {word + " "}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
