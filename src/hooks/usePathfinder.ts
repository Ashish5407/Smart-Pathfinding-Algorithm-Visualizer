import { useState, useCallback, useRef } from 'react';
import {
  GridState, AlgorithmType, AlgorithmStep, AlgorithmResult,
  createGrid, runAlgorithm,
} from '@/lib/algorithms';

export type VisualizationState = 'idle' | 'running' | 'paused' | 'finished';

export interface CellVisualState {
  visited: boolean;
  frontier: boolean;
  path: boolean;
}

export interface Metrics {
  nodesVisited: number;
  pathLength: number;
  timeTaken: number;
}

export function usePathfinder(rows: number, cols: number) {
  const [grid, setGrid] = useState<GridState>(() => createGrid(rows, cols));
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('astar');
  const [speed, setSpeed] = useState(1);
  const [vizState, setVizState] = useState<VisualizationState>('idle');
  const [cellStates, setCellStates] = useState<Map<string, CellVisualState>>(new Map());
  const [metrics, setMetrics] = useState<Metrics>({ nodesVisited: 0, pathLength: 0, timeTaken: 0 });

  const animRef = useRef<{ steps: AlgorithmStep[]; index: number; timer: number | null; startTime: number }>({
    steps: [], index: 0, timer: null, startTime: 0,
  });

  const clearVisualization = useCallback(() => {
    if (animRef.current.timer) clearTimeout(animRef.current.timer);
    animRef.current = { steps: [], index: 0, timer: null, startTime: 0 };
    setCellStates(new Map());
    setMetrics({ nodesVisited: 0, pathLength: 0, timeTaken: 0 });
    setVizState('idle');
  }, []);

  const [currentStepType, setCurrentStepType] = useState<'visit' | 'frontier' | 'path' | null>(null);

  const animateStep = useCallback(() => {
    const ref = animRef.current;
    if (ref.index >= ref.steps.length) {
      setCurrentStepType(null);
      setVizState('finished');
      setMetrics(prev => ({ ...prev, timeTaken: performance.now() - ref.startTime }));
      return;
    }

    const step = ref.steps[ref.index];
    setCurrentStepType(step.type);
    const k = `${step.row},${step.col}`;

    setCellStates(prev => {
      const next = new Map(prev);
      const current = next.get(k) || { visited: false, frontier: false, path: false };

      if (step.type === 'visit') {
        next.set(k, { ...current, visited: true, frontier: false });
      } else if (step.type === 'frontier') {
        if (!current.visited) {
          next.set(k, { ...current, frontier: true });
        }
      } else if (step.type === 'path') {
        next.set(k, { ...current, path: true });
      }
      return next;
    });

    if (step.type === 'visit') {
      setMetrics(prev => ({ ...prev, nodesVisited: prev.nodesVisited + 1 }));
    } else if (step.type === 'path' && ref.index === ref.steps.length - 1) {
      const pathSteps = ref.steps.filter(s => s.type === 'path');
      setMetrics(prev => ({ ...prev, pathLength: pathSteps.length }));
    }

    ref.index++;

    const baseDelay = step.type === 'path' ? 20 : 10;
    const delay = baseDelay / speed;
    ref.timer = window.setTimeout(animateStep, delay);
  }, [speed]);

  const startVisualization = useCallback(() => {
    clearVisualization();
    const result: AlgorithmResult = runAlgorithm(grid, algorithm);

    animRef.current = {
      steps: result.steps,
      index: 0,
      timer: null,
      startTime: performance.now(),
    };

    setVizState('running');
    animateStep();
  }, [grid, algorithm, clearVisualization, animateStep]);

  const pauseVisualization = useCallback(() => {
    if (animRef.current.timer) {
      clearTimeout(animRef.current.timer);
      animRef.current.timer = null;
    }
    setVizState('paused');
  }, []);

  const resumeVisualization = useCallback(() => {
    setVizState('running');
    animateStep();
  }, [animateStep]);

  const resetGrid = useCallback(() => {
    clearVisualization();
    setGrid(createGrid(rows, cols));
  }, [rows, cols, clearVisualization]);

  const clearWalls = useCallback(() => {
    clearVisualization();
    setGrid(prev => {
      const newCells = prev.cells.map(row =>
        row.map(cell => cell.type === 'wall' ? { ...cell, type: 'empty' as const, weight: 1 } : cell)
      );
      return { ...prev, cells: newCells };
    });
  }, [clearVisualization]);

  const updateCell = useCallback((row: number, col: number, type: 'wall' | 'empty') => {
    setGrid(prev => {
      const cell = prev.cells[row][col];
      if (cell.type === 'start' || cell.type === 'end') return prev;
      const newCells = prev.cells.map(r => r.map(c => ({ ...c })));
      newCells[row][col] = { ...newCells[row][col], type, weight: type === 'wall' ? Infinity : 1 };
      return { ...prev, cells: newCells };
    });
  }, []);

  const setWeight = useCallback((row: number, col: number, weight: number) => {
    setGrid(prev => {
      const cell = prev.cells[row][col];
      if (cell.type === 'start' || cell.type === 'end' || cell.type === 'wall') return prev;
      const newCells = prev.cells.map(r => r.map(c => ({ ...c })));
      newCells[row][col] = { ...newCells[row][col], weight };
      return { ...prev, cells: newCells };
    });
  }, []);

  const moveNode = useCallback((fromR: number, fromC: number, toR: number, toC: number) => {
    setGrid(prev => {
      const fromCell = prev.cells[fromR][fromC];
      const toCell = prev.cells[toR][toC];
      if (toCell.type === 'wall' || toCell.type === 'start' || toCell.type === 'end') return prev;

      const nodeType = fromCell.type;
      if (nodeType !== 'start' && nodeType !== 'end') return prev;

      const newCells = prev.cells.map(r => r.map(c => ({ ...c })));
      newCells[fromR][fromC] = { ...newCells[fromR][fromC], type: 'empty' as const };
      newCells[toR][toC] = { ...newCells[toR][toC], type: nodeType };

      const newStart = nodeType === 'start' ? [toR, toC] as [number, number] : prev.start;
      const newEnd = nodeType === 'end' ? [toR, toC] as [number, number] : prev.end;

      return { ...prev, cells: newCells, start: newStart, end: newEnd };
    });
  }, []);

  return {
    grid, algorithm, speed, vizState, cellStates, metrics, currentStepType,
    setAlgorithm, setSpeed,
    startVisualization, pauseVisualization, resumeVisualization,
    resetGrid, clearWalls, clearVisualization,
    updateCell, setWeight, moveNode,
  };
}