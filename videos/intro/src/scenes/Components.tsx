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

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** A card that rises into place, then floats very slightly */
const Card: React.FC<{
  delay: number;
  style: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay, style, children }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [delay, delay + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  return (
    <div
      style={{
        position: "absolute",
        borderRadius: 40,
        border: "1.5px solid #262626",
        backgroundColor: "#141414",
        padding: 40,
        opacity: progress,
        scale: 0.94 + progress * 0.06,
        translate: `0px ${(1 - progress) * 60 + Math.sin((frame + delay) / 22) * 4}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const bars = [0.45, 0.62, 0.38, 0.8, 0.56, 1];

export const Components: React.FC = () => {
  const frame = useCurrentFrame();
  const count = Math.round(
    interpolate(frame, [10, 70], [0, 97], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }),
  );
  const toggle = interpolate(frame, [70, 82], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  return (
    <AbsoluteFill style={{ fontFamily: sans, color: "#fafafa" }}>
      <Background />

      {/* Left: the section title and the component count */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 40,
          padding: "100px 160px",
          width: 900,
        }}
      >
        <Label delay={2}>01 · Components</Label>
        <Interactive.Div
          name="Count"
          style={{
            fontSize: 260,
            fontWeight: 600,
            letterSpacing: "-0.05em",
            lineHeight: 0.9,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count}
        </Interactive.Div>
        <Interactive.Div
          name="Caption"
          style={{
            fontSize: 64,
            lineHeight: 1.15,
            color: "#a3a3a3",
            opacity: interpolate(frame, [20, 38], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          interactive UI components
        </Interactive.Div>
      </AbsoluteFill>

      {/* Right: a small gallery of component cards building itself */}
      <Card delay={8} style={{ left: 1000, top: 150, width: 420, height: 440 }}>
        <div style={{ fontFamily: mono, fontSize: 26, color: "#a3a3a3" }}>
          BALANCE
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            marginTop: 12,
          }}
        >
          $14,300
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
            height: 180,
            marginTop: 40,
          }}
        >
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                borderRadius: 10,
                backgroundColor: i === bars.length - 1 ? "#fafafa" : "#3f3f3f",
                height: `${
                  h *
                  100 *
                  interpolate(frame, [20 + i * 4, 44 + i * 4], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: ease,
                  })
                }%`,
              }}
            />
          ))}
        </div>
      </Card>

      <Card
        delay={18}
        style={{ left: 1450, top: 150, width: 320, height: 210 }}
      >
        <div style={{ fontFamily: mono, fontSize: 26, color: "#a3a3a3" }}>
          FREEZE CARD
        </div>
        <div
          style={{
            marginTop: 40,
            width: 132,
            height: 72,
            borderRadius: 999,
            padding: 8,
            backgroundColor: toggle > 0.5 ? "#fafafa" : "#3f3f3f",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              backgroundColor: toggle > 0.5 ? "#0a0a0a" : "#fafafa",
              translate: `${toggle * 60}px 0px`,
            }}
          />
        </div>
      </Card>

      <Card
        delay={28}
        style={{ left: 1450, top: 390, width: 320, height: 200 }}
      >
        <div style={{ fontFamily: mono, fontSize: 26, color: "#a3a3a3" }}>
          SEND TO
        </div>
        <div style={{ display: "flex", marginTop: 36 }}>
          {["#e5e5e5", "#a3a3a3", "#737373", "#525252"].map((c, i) => (
            <div
              key={c}
              style={{
                width: 80,
                height: 80,
                borderRadius: 999,
                backgroundColor: c,
                border: "4px solid #141414",
                marginLeft: i === 0 ? 0 : -20,
              }}
            />
          ))}
        </div>
      </Card>

      <Card
        delay={38}
        style={{ left: 1000, top: 620, width: 770, height: 300 }}
      >
        <div style={{ fontFamily: mono, fontSize: 26, color: "#a3a3a3" }}>
          TRANSACTIONS
        </div>
        {[
          ["Dave", "$21,553"],
          ["Steven", "$20,000"],
        ].map(([name, amount], i) => (
          <div
            key={name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: i === 0 ? 32 : 20,
              fontSize: 48,
              opacity: interpolate(frame, [50 + i * 6, 64 + i * 6], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <span
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  backgroundColor: "#3f3f3f",
                }}
              />
              {name}
            </span>
            <span style={{ fontWeight: 600 }}>{amount}</span>
          </div>
        ))}
      </Card>
    </AbsoluteFill>
  );
};
