import { AbsoluteFill } from "remotion";

/** The site's dot grid on a near-black sheet, fading out towards the edges */
export const Background: React.FC = () => {
  return (
    <AbsoluteFill name="Background" style={{ backgroundColor: "#0a0a0a" }}>
      <AbsoluteFill
        name="Dot grid"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.14) 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
    </AbsoluteFill>
  );
};
