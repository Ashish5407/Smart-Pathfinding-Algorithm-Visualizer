import React, { useCallback, useRef, useState, useMemo } from 'react';
import { GridState } from '@/lib/algorithms';
import { CellVisualState } from '@/hooks/usePathfinder';

interface Props {
  grid: GridState;
  cellStates: Map<string, CellVisualState>;
  isRunning: boolean;
  onUpdateCell: (row: number, col: number, type: 'wall' | 'empty') => void;
  onMoveNode: (fromR: number, fromC: number, toR: number, toC: number) => void;
  onSetWeight: (row: number, col: number, weight: number) => void;
}

const CELL_SIZE = 24;

export const PathfindingGrid: React.FC<Props> = ({
  grid, cellStates, isRunning, onUpdateCell, onMoveNode, onSetWeight,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'wall' | 'empty'>('wall');
  const [draggingNode, setDraggingNode] = useState<{ row: number; col: number; type: 'start' | 'end' } | null>(null);
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const getCellFromEvent = useCallback((e: React.MouseEvent): { row: number; col: number } | null => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    if (row < 0 || row >= grid.rows || col < 0 || col >= grid.cols) return null;
    return { row, col };
  }, [grid.rows, grid.cols]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isRunning) return;
    e.preventDefault();
    const pos = getCellFromEvent(e);
    if (!pos) return;

    const cell = grid.cells[pos.row][pos.col];
    if (cell.type === 'start' || cell.type === 'end') {
      setDraggingNode({ row: pos.row, col: pos.col, type: cell.type });
      return;
    }

    const mode = cell.type === 'wall' ? 'empty' : 'wall';
    setDrawMode(mode);
    setIsDrawing(true);
    onUpdateCell(pos.row, pos.col, mode);
  }, [isRunning, getCellFromEvent, grid.cells, onUpdateCell]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getCellFromEvent(e);
    setHoverCell(pos);

    if (isRunning || !pos) return;

    if (draggingNode) {
      if (pos.row !== draggingNode.row || pos.col !== draggingNode.col) {
        onMoveNode(draggingNode.row, draggingNode.col, pos.row, pos.col);
        setDraggingNode({ ...draggingNode, row: pos.row, col: pos.col });
      }
      return;
    }

    if (isDrawing) {
      const cell = grid.cells[pos.row][pos.col];
      if (cell.type !== 'start' && cell.type !== 'end') {
        onUpdateCell(pos.row, pos.col, drawMode);
      }
    }
  }, [isRunning, getCellFromEvent, draggingNode, isDrawing, drawMode, grid.cells, onUpdateCell, onMoveNode]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setDraggingNode(null);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (isRunning) return;
    const pos = getCellFromEvent(e);
    if (!pos) return;
    const cell = grid.cells[pos.row][pos.col];
    if (cell.type !== 'empty') return;
    const nextWeight = cell.weight >= 9 ? 1 : cell.weight + 1;
    onSetWeight(pos.row, pos.col, nextWeight);
  }, [isRunning, getCellFromEvent, grid.cells, onSetWeight]);

  const gridWidth = grid.cols * CELL_SIZE;
  const gridHeight = grid.rows * CELL_SIZE;

  const cells = useMemo(() => {
    const elements: React.ReactNode[] = [];
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const cell = grid.cells[r][c];
        const k = `${r},${c}`;
        const vs = cellStates.get(k);

        let bgClass = 'bg-background';
        let extraClass = '';
        let content: React.ReactNode = null;

        if (cell.type === 'wall') {
          bgClass = 'bg-cell-wall';
        } else if (cell.type === 'start') {
          bgClass = 'bg-cell-start';
          content = <span className="text-[8px] font-bold text-primary-foreground">S</span>;
        } else if (cell.type === 'end') {
          bgClass = 'bg-cell-end';
          content = <span className="text-[8px] font-bold text-primary-foreground">E</span>;
        } else if (vs?.path) {
          bgClass = 'bg-cell-path';
          extraClass = 'animate-path-reveal';
        } else if (vs?.visited) {
          bgClass = 'bg-cell-visited';
        } else if (vs?.frontier) {
          bgClass = 'bg-cell-frontier';
          extraClass = 'animate-frontier';
        } else if (cell.weight > 1) {
          bgClass = 'bg-secondary';
          content = <span className="text-[8px] text-cell-weight font-bold">{cell.weight}</span>;
        }

        elements.push(
          <div
            key={k}
            className={`absolute flex items-center justify-center border-[0.5px] border-border/30 ${bgClass} ${extraClass}`}
            style={{
              left: c * CELL_SIZE,
              top: r * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          >
            {content}
          </div>
        );
      }
    }
    return elements;
  }, [grid.cells, grid.rows, grid.cols, cellStates]);

  return (
    <div className="flex-1 overflow-auto flex items-center justify-center p-4">
      <div
        ref={gridRef}
        className="relative select-none cursor-crosshair"
        style={{ width: gridWidth, height: gridHeight }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        {cells}

        {hoverCell && (
          <>
            <div
              className="absolute pointer-events-none bg-foreground/5"
              style={{ left: 0, top: hoverCell.row * CELL_SIZE, width: gridWidth, height: CELL_SIZE }}
            />
            <div
              className="absolute pointer-events-none bg-foreground/5"
              style={{ left: hoverCell.col * CELL_SIZE, top: 0, width: CELL_SIZE, height: gridHeight }}
            />
          </>
        )}
      </div>
    </div>
  );
};
