import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../styles";
import { TypeText } from "../components/TypeText";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animated grid background
  const gridOpacity = interpolate(frame, [0, 40], [0, 0.15], { extrapolateRight: "clamp" });

  // Title spring
  const titleScale = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 80 } });
  const subtitleProgress = spring({ frame: frame - 30, fps, config: { damping: 200 } });

  // Floating dots
  const dots = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 137) % 1920,
    y: (i * 89) % 1080,
    size: 4 + (i % 3) * 3,
    speed: 0.5 + (i % 4) * 0.3,
    color: i % 3 === 0 ? COLORS.cyan : i % 3 === 1 ? COLORS.cobalt : COLORS.yellow,
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Grid pattern background */}
      <div style={{
        position: "absolute", inset: 0, opacity: gridOpacity,
        backgroundImage: `linear-gradient(${COLORS.border} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.border} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />

      {/* Floating accent dots */}
      {dots.map((dot, i) => (
        <div key={i} style={{
          position: "absolute",
          left: dot.x,
          top: dot.y + Math.sin(frame * 0.03 * dot.speed + i) * 20,
          width: dot.size,
          height: dot.size,
          borderRadius: "50%",
          backgroundColor: dot.color,
          opacity: 0.3,
        }} />
      ))}

      {/* Title */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 24,
      }}>
        <div style={{
          fontSize: 80,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          color: COLORS.text,
          transform: `scale(${interpolate(titleScale, [0, 1], [0.5, 1])})`,
          opacity: interpolate(titleScale, [0, 1], [0, 1]),
          letterSpacing: -2,
        }}>
          PATHFINDING
          <span style={{ color: COLORS.cyan }}> ALGORITHMS</span>
        </div>

        <div style={{
          fontSize: 28,
          fontFamily: "'Space Grotesk', sans-serif",
          color: COLORS.textMuted,
          opacity: interpolate(subtitleProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(subtitleProgress, [0, 1], [20, 0])}px)`,
        }}>
          How AI Search Finds the Shortest Path
        </div>

        {/* Decorative line */}
        <div style={{
          width: interpolate(frame, [40, 70], [0, 300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          height: 2,
          background: `linear-gradient(90deg, transparent, ${COLORS.cyan}, transparent)`,
          marginTop: 16,
        }} />
      </div>

      {/* Bottom tag */}
      <div style={{
        position: "absolute", bottom: 60, left: 0, right: 0,
        display: "flex", justifyContent: "center",
      }}>
        <TypeText text="6 Algorithms • Step by Step • Visual Guide" fontSize={20} color={COLORS.textMuted} delay={50} mono />
      </div>
    </AbsoluteFill>
  );
};
