import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../styles";

interface TypeTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  delay?: number;
  mono?: boolean;
  bold?: boolean;
}

export const TypeText: React.FC<TypeTextProps> = ({
  text, fontSize = 48, color = COLORS.text, delay = 0, mono = false, bold = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const y = interpolate(progress, [0, 1], [30, 0]);

  return (
    <div style={{
      fontSize,
      color,
      fontFamily: mono ? "'JetBrains Mono', monospace" : "'Space Grotesk', sans-serif",
      fontWeight: bold ? 700 : 400,
      opacity,
      transform: `translateY(${y}px)`,
      lineHeight: 1.3,
    }}>
      {text}
    </div>
  );
};
