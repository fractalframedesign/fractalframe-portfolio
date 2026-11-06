import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { Background } from "../components/Background";
import { Label } from "../components/Label";
import { RevealWords } from "../components/RevealWords";
import { sans } from "../fonts";

export const Opening: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 48,
          padding: "100px 160px",
          textAlign: "center",
        }}
      >
        <Label delay={6}>Product Design Director</Label>
        <RevealWords
          text="Hi! I am Kiran Pingle"
          delay={18}
          stagger={5}
          style={{
            fontSize: 168,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: "#fafafa",
          }}
        />
        <Interactive.Div
          name="Role"
          style={{
            fontSize: 64,
            color: "#a3a3a3",
            letterSpacing: "-0.01em",
            opacity: interpolate(frame, [48, 66], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [48, 70], ["0px 20px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          Digital Product Designer and Design Engineer
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
