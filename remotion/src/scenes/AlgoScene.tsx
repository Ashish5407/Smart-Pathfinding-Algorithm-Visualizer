import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { COLORS, GRID_CELL, GRID_GAP } from "../styles";
import { GridViz, CellType } from "../components/GridViz";
import { PseudocodeBlock } from "../components/PseudocodeBlock";
import { TypeText } from "../components/TypeText";

interface AlgoSceneProps {
  name: string;
  subtitle: string;
  dataStructure: string;
  complexity: string;
  optimal: boolean;
  pseudocode: string[];
  gridSteps: [number, number, CellType][];
  walls: [number, number][];
  startPos: [number, number];
  endPos: [number, number];
  accentColor: string;
  number: number;
}

const ROWS = 8;
const COLS = 10;

const buildGrid = (
  walls: [number, number][],
  startPos: [number, number],
  endPos: [number, number],
): CellType[][] => {
  const grid: CellType[][] = Array.from({ length: ROWS }, () =>
    Array(COLS).fill("empty")
  );
  walls.forEach(([r, c]) => { grid[r][c] = "wall"; });
  grid[startPos[0]][startPos[1]] = "start";
  grid[endPos[0]][endPos[1]] = "end";
  return grid;
};

export const AlgoScene: React.FC<AlgoSceneProps> = ({
  name, subtitle, dataStructure, complexity, optimal,
  pseudocode, gridSteps, walls, startPos, endPos, accentColor, number,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const grid = buildGrid(walls, startPos, endPos);

  // Determine which pseudocode line to highlight based on current step
  const stepsShown = Math.floor(frame / 2);
  const currentStep = gridSteps[Math.min(stepsShown, gridSteps.length - 1)];
  const currentType = currentStep ? currentStep[2] : null;
  let highlightLine = -1;
  if (currentType === "visited") highlightLine = pseudocode.findIndex(l => l.includes("pop") || l.includes("dequeue") || l.includes("extract"));
  if (currentType === "frontier") highlightLine = pseudocode.findIndex(l => l.includes("enqueue") || l.includes("push") || l.includes("insert"));
  if (currentType === "path") highlightLine = pseudocode.findIndex(l => l.includes("reconstruct") || l.includes("return"));

  // Entry animation
  const enterProgress = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });
  const slideX = interpolate(enterProgress, [0, 1], [-100, 0]);

  // Badge animations
  const badge1 = spring({ frame: frame - 20, fps, config: { damping: 200 } });
  const badge2 = spring({ frame: frame - 28, fps, config: { damping: 200 } });
  const badge3 = spring({ frame: frame - 36, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Subtle grid bg */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.08,
        backgroundImage: `linear-gradient(${COLORS.border} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.border} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />

      {/* Algorithm number */}
      <div style={{
        position: "absolute", top: 40, left: 60,
        fontSize: 180, fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700, color: accentColor, opacity: 0.08,
        transform: `translateX(${slideX}px)`,
      }}>
        0{number}
      </div>

      {/* Left side: Info */}
      <div style={{
        position: "absolute", top: 60, left: 80, width: 700,
        display: "flex", flexDirection: "column", gap: 16,
        transform: `translateX(${slideX}px)`,
      }}>
        <div style={{
          fontSize: 14, fontFamily: "'JetBrains Mono', monospace",
          color: accentColor, letterSpacing: 4, textTransform: "uppercase",
        }}>
          Algorithm {number} of 6
        </div>
        <div style={{
          fontSize: 56, fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700, color: COLORS.text, lineHeight: 1.1,
        }}>
          {name}
        </div>
        <div style={{
          fontSize: 20, fontFamily: "'Space Grotesk', sans-serif",
          color: COLORS.textMuted, maxWidth: 500,
        }}>
          {subtitle}
        </div>

        {/* Info badges */}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <div style={{
            padding: "8px 16px", borderRadius: 6,
            backgroundColor: "rgba(34,211,238,0.1)", border: `1px solid ${COLORS.cyan}`,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: COLORS.cyan,
            opacity: interpolate(badge1, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(badge1, [0, 1], [10, 0])}px)`,
          }}>
            {dataStructure}
          </div>
          <div style={{
            padding: "8px 16px", borderRadius: 6,
            backgroundColor: "rgba(250,204,21,0.1)", border: `1px solid ${COLORS.yellow}`,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: COLORS.yellow,
            opacity: interpolate(badge2, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(badge2, [0, 1], [10, 0])}px)`,
          }}>
            {complexity}
          </div>
          <div style={{
            padding: "8px 16px", borderRadius: 6,
            backgroundColor: optimal ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${optimal ? COLORS.emerald : COLORS.crimson}`,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
            color: optimal ? COLORS.emerald : COLORS.crimson,
            opacity: interpolate(badge3, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(badge3, [0, 1], [10, 0])}px)`,
          }}>
            {optimal ? "✓ Optimal" : "✗ Not Optimal"}
          </div>
        </div>

        {/* Pseudocode */}
        <Sequence from={15}>
          <div style={{ marginTop: 12 }}>
            <PseudocodeBlock lines={pseudocode} highlightLine={highlightLine} delay={0} />
          </div>
        </Sequence>
      </div>

      {/* Right side: Grid visualization */}
      <div style={{
        position: "absolute", top: 140, right: 100,
        opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `scale(${interpolate(frame, [10, 30], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
      }}>
        <div style={{
          marginBottom: 16, fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          color: COLORS.textMuted, letterSpacing: 3,
        }}>
          LIVE EXPLORATION
        </div>
        <GridViz
          rows={ROWS}
          cols={COLS}
          cells={grid}
          steps={gridSteps}
          startFrame={20}
          stepSpeed={2}
        />
        {/* Legend */}
        <div style={{
          display: "flex", gap: 20, marginTop: 20,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
        }}>
          {[
            { color: COLORS.emerald, label: "Start" },
            { color: COLORS.crimson, label: "End" },
            { color: COLORS.cyan, label: "Frontier" },
            { color: COLORS.cobalt, label: "Visited" },
            { color: COLORS.yellow, label: "Path" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, backgroundColor: color, borderRadius: 2 }} />
              <span style={{ color: COLORS.textMuted }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
