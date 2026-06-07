import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, GRID_CELL, GRID_GAP } from "../styles";

export type CellType = "empty" | "wall" | "start" | "end" | "visited" | "frontier" | "path";

interface GridVizProps {
  rows: number;
  cols: number;
  cells: CellType[][];
  /** Animation steps: array of [row, col, type] applied over frames */
  steps: [number, number, CellType][];
  /** Frame at which animation starts */
  startFrame?: number;
  /** Frames per step */
  stepSpeed?: number;
}

const cellColor = (type: CellType): string => {
  switch (type) {
    case "wall": return COLORS.wall;
    case "start": return COLORS.emerald;
    case "end": return COLORS.crimson;
    case "visited": return COLORS.cobalt;
    case "frontier": return COLORS.cyan;
    case "path": return COLORS.yellow;
    default: return COLORS.surface;
  }
};

export const GridViz: React.FC<GridVizProps> = ({
  rows, cols, cells, steps, startFrame = 0, stepSpeed = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Build current grid state by applying steps up to current frame
  const currentCells: CellType[][] = cells.map(row => [...row]);
  const animFrame = frame - startFrame;
  if (animFrame >= 0) {
    const stepsToShow = Math.min(Math.floor(animFrame / stepSpeed), steps.length);
    for (let i = 0; i < stepsToShow; i++) {
      const [r, c, type] = steps[i];
      currentCells[r][c] = type;
    }
  }

  const gridW = cols * (GRID_CELL + GRID_GAP) - GRID_GAP;
  const gridH = rows * (GRID_CELL + GRID_GAP) - GRID_GAP;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, ${GRID_CELL}px)`,
      gridTemplateRows: `repeat(${rows}, ${GRID_CELL}px)`,
      gap: GRID_GAP,
      width: gridW,
      height: gridH,
    }}>
      {currentCells.flatMap((row, r) =>
        row.map((cell, c) => {
          const color = cellColor(cell);
          const isAnimated = cell === "frontier" || cell === "path";
          const scale = isAnimated
            ? interpolate(
                Math.sin((frame - startFrame) * 0.15 + r + c),
                [-1, 1], [0.85, 1],
              )
            : 1;

          return (
            <div
              key={`${r}-${c}`}
              style={{
                width: GRID_CELL,
                height: GRID_CELL,
                backgroundColor: color,
                borderRadius: 2,
                transform: `scale(${scale})`,
                opacity: cell === "empty" ? 0.3 : 1,
                border: `1px solid ${COLORS.border}`,
              }}
            />
          );
        })
      )}
    </div>
  );
};
