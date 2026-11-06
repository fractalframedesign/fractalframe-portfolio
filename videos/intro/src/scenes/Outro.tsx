import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { Background } from "../components/Background";
import { RevealWords } from "../components/RevealWords";
import { sans } from "../fonts";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
          textAlign: "center",
          padding: "100px 160px",
        }}
      >
        <RevealWords
          text="Kiran Pingle"
          delay={6}
          stagger={6}
          style={{
            fontSize: 196,
            fontWeight: 600,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            color: "#fafafa",
          }}
        />
        <Interactive.Div
          name="Disciplines"
          style={{
            fontSize: 56,
            color: "#a3a3a3",
            opacity: interpolate(frame, [24, 42], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [24, 46], ["0px 20px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          Product design · Design systems · Design engineering
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
