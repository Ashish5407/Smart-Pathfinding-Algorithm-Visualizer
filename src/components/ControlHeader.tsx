import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { AlgorithmType, ALGORITHM_INFO } from '@/lib/algorithms';
import { VisualizationState } from '@/hooks/usePathfinder';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Props {
  algorithm: AlgorithmType;
  speed: number;
  vizState: VisualizationState;
  onAlgorithmChange: (a: AlgorithmType) => void;
  onSpeedChange: (s: number) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onClearWalls: () => void;
  splitView: boolean;
  onToggleSplit: () => void;
  algorithm2?: AlgorithmType;
  onAlgorithm2Change?: (a: AlgorithmType) => void;
}

const ALGORITHMS: { value: AlgorithmType; label: string }[] = [
  { value: 'bfs', label: 'BFS' },
  { value: 'dfs', label: 'DFS' },
  { value: 'dijkstra', label: 'Dijkstra' },
  { value: 'ucs', label: 'UCS' },
  { value: 'greedy', label: 'Greedy' },
  { value: 'astar', label: 'A*' },
];

export const ControlHeader: React.FC<Props> = ({
  algorithm, speed, vizState,
  onAlgorithmChange, onSpeedChange,
  onStart, onPause, onResume, onReset, onClearWalls,
  splitView, onToggleSplit,
  algorithm2, onAlgorithm2Change,
}) => {
  const isRunning = vizState === 'running';
  const isPaused = vizState === 'paused';

  return (
    <header className="h-16 border-b border-border bg-card flex items-center gap-3 px-4 shrink-0">
      <h1 className="text-sm font-bold text-primary tracking-wider mr-2">
        PATHFINDING LAB
      </h1>

      <div className="h-6 w-px bg-border" />

      <Select value={algorithm} onValueChange={(v) => onAlgorithmChange(v as AlgorithmType)} disabled={isRunning}>
        <SelectTrigger className="w-[130px] h-8 text-xs bg-secondary border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ALGORITHMS.map(a => (
            <SelectItem key={a.value} value={a.value} className="text-xs">{a.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {splitView && onAlgorithm2Change && (
        <>
          <span className="text-xs text-muted-foreground">vs</span>
          <Select value={algorithm2} onValueChange={(v) => onAlgorithm2Change(v as AlgorithmType)} disabled={isRunning}>
            <SelectTrigger className="w-[130px] h-8 text-xs bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALGORITHMS.map(a => (
                <SelectItem key={a.value} value={a.value} className="text-xs">{a.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Speed</span>
        <Slider
          value={[speed]}
          onValueChange={([v]) => onSpeedChange(v)}
          min={0.1}
          max={5}
          step={0.1}
          className="w-24"
        />
        <span className="text-xs text-foreground tabular-nums w-8">{speed.toFixed(1)}x</span>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-1.5">
        {isRunning ? (
          <Button variant="outline" size="sm" onClick={onPause} className="h-8 text-xs gap-1.5">
            <Pause className="h-3 w-3" />
            PAUSE
          </Button>
        ) : isPaused ? (
          <Button variant="outline" size="sm" onClick={onResume} className="h-8 text-xs gap-1.5 text-primary border-primary/50">
            <Play className="h-3 w-3" />
            RESUME
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onStart} className="h-8 text-xs gap-1.5 text-primary border-primary/50">
            <Play className="h-3 w-3" />
            RUN
          </Button>
        )}

        <Button variant="ghost" size="sm" onClick={onReset} className="h-8 text-xs gap-1.5" disabled={isRunning}>
          <RotateCcw className="h-3 w-3" />
          RESET
        </Button>

        <Button variant="ghost" size="sm" onClick={onClearWalls} className="h-8 text-xs" disabled={isRunning}>
          CLEAR WALLS
        </Button>
      </div>

      <div className="ml-auto">
        <Button
          variant={splitView ? "default" : "ghost"}
          size="sm"
          onClick={onToggleSplit}
          className="h-8 text-xs"
          disabled={isRunning}
        >
          {splitView ? 'SINGLE VIEW' : 'SPLIT VIEW'}
        </Button>
      </div>
    </header>
  );
};
