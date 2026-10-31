import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { Background } from "../components/Background";
import { Label } from "../components/Label";
import { mono, sans } from "../fonts";

const articles = [
  "Stop making users read your dashboard",
  "Nature shipped it first",
  "Fewer choices. Better decisions.",
];

export const Articles: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily: sans, color: "#fafafa" }}>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          gap: 40,
          padding: "100px 160px",
        }}
      >
        <div>
          <Label delay={2}>02 · Articles</Label>
        </div>
        <Interactive.Div
          name="Intro"
          style={{
            fontSize: 72,
            color: "#a3a3a3",
            letterSpacing: "-0.01em",
            marginBottom: 16,
            opacity: interpolate(frame, [8, 24], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Writing on design, systems and AI
        </Interactive.Div>

        {articles.map((title, i) => {
          const start = 18 + i * 10;
          const progress = interpolate(frame, [start, start + 24], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          });
          return (
            <div
              key={title}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 48,
                paddingBottom: 28,
                borderBottom: "1.5px solid #262626",
                opacity: progress,
                translate: `${(1 - progress) * 120}px 0px`,
              }}
            >
              <span
                style={{ fontFamily: mono, fontSize: 32, color: "#737373" }}
              >
                0{i + 1}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: 92,
                  fontWeight: 600,
                  letterSpacing: "-0.035em",
                  lineHeight: 1.05,
                }}
              >
                {title}
              </span>
              <span style={{ fontSize: 72, color: "#737373" }}>→</span>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
