import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../styles";

const ALGOS = [
  { name: "BFS", optimal: true, weighted: false, ds: "Queue" },
  { name: "DFS", optimal: false, weighted: false, ds: "Stack" },
  { name: "Dijkstra", optimal: true, weighted: true, ds: "Min-Heap" },
  { name: "UCS", optimal: true, weighted: true, ds: "Min-Heap" },
  { name: "Greedy", optimal: false, weighted: false, ds: "Min-Heap" },
  { name: "A*", optimal: true, weighted: true, ds: "Min-Heap" },
];

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.06,
        backgroundImage: `linear-gradient(${COLORS.border} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.border} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100%", gap: 40,
      }}>
        <div style={{
          fontSize: 48, fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700, color: COLORS.text,
          opacity: interpolate(spring({ frame, fps, config: { damping: 200 } }), [0, 1], [0, 1]),
        }}>
          Algorithm Comparison
        </div>

        {/* Comparison table */}
        <div style={{
          display: "grid", gridTemplateColumns: "180px 100px 100px 120px",
          gap: "2px", fontFamily: "'JetBrains Mono', monospace", fontSize: 16,
        }}>
          {/* Header */}
          {["Algorithm", "Optimal", "Weighted", "Structure"].map((h, i) => {
            const p = spring({ frame: frame - 10 - i * 3, fps, config: { damping: 200 } });
            return (
              <div key={h} style={{
                padding: "12px 16px", backgroundColor: COLORS.surface,
                color: COLORS.cyan, fontWeight: 700, textAlign: "center",
                opacity: interpolate(p, [0, 1], [0, 1]),
              }}>
                {h}
              </div>
            );
          })}

          {/* Rows */}
          {ALGOS.map((algo, rowIdx) => {
            const rowDelay = 25 + rowIdx * 5;
            return [algo.name, algo.optimal ? "✓" : "✗", algo.weighted ? "✓" : "✗", algo.ds].map((val, colIdx) => {
              const p = spring({ frame: frame - rowDelay - colIdx * 2, fps, config: { damping: 200 } });
              const isName = colIdx === 0;
              const isCheck = val === "✓";
              const isCross = val === "✗";
              return (
                <div key={`${rowIdx}-${colIdx}`} style={{
                  padding: "10px 16px",
                  backgroundColor: "rgba(24,24,27,0.8)",
                  color: isName ? COLORS.text : isCheck ? COLORS.emerald : isCross ? COLORS.crimson : COLORS.textMuted,
                  textAlign: "center",
                  fontWeight: isName ? 600 : 400,
                  opacity: interpolate(p, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(p, [0, 1], [10, 0])}px)`,
                }}>
                  {val}
                </div>
              );
            });
          })}
        </div>

        <div style={{
          fontSize: 24, fontFamily: "'Space Grotesk', sans-serif",
          color: COLORS.textMuted, marginTop: 20,
          opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          Choose the right algorithm for your problem →{" "}
          <span style={{ color: COLORS.cyan }}>Pathfinding Lab</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
