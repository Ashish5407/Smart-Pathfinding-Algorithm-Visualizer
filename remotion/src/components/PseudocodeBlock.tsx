import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../styles";

interface PseudocodeBlockProps {
  lines: string[];
  highlightLine?: number;
  delay?: number;
}

export const PseudocodeBlock: React.FC<PseudocodeBlockProps> = ({
  lines, highlightLine = -1, delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{
      backgroundColor: "rgba(24,24,27,0.95)",
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: "20px 24px",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 18,
      lineHeight: 2,
    }}>
      {lines.map((line, i) => {
        const lineProgress = spring({
          frame: frame - delay - i * 3,
          fps,
          config: { damping: 200 },
        });
        const isHighlighted = i === highlightLine;

        return (
          <div key={i} style={{
            opacity: interpolate(lineProgress, [0, 1], [0, 1]),
            transform: `translateX(${interpolate(lineProgress, [0, 1], [20, 0])}px)`,
            color: isHighlighted ? COLORS.cyan : COLORS.textMuted,
            backgroundColor: isHighlighted ? "rgba(34,211,238,0.1)" : "transparent",
            padding: "2px 8px",
            borderLeft: isHighlighted ? `3px solid ${COLORS.cyan}` : "3px solid transparent",
            borderRadius: 2,
          }}>
            {line}
          </div>
        );
      })}
    </div>
  );
};
