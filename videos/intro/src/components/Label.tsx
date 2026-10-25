import { Easing, interpolate, useCurrentFrame } from "remotion";
import { mono } from "../fonts";

/** Small mono pill, like the site's location badge and drawing-mode labels */
export const Label: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 28px",
        borderRadius: 999,
        border: "1.5px solid rgba(255,255,255,0.22)",
        backgroundColor: "rgba(255,255,255,0.04)",
        fontFamily: mono,
        fontSize: 30,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#d4d4d4",
        opacity: interpolate(frame, [delay, delay + 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [delay, delay + 20],
          ["0px 16px", "0px 0px"],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          },
        ),
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          backgroundColor: "#ffffff",
        }}
      />
      {children}
    </div>
  );
};
