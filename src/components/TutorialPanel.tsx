import React from 'react';
import { AlgorithmType } from '@/lib/algorithms';
import { AlgorithmStep } from '@/lib/algorithms';

interface PseudocodeLine {
  text: string;
  indent: number;
  highlightOn?: AlgorithmStep['type'] | 'init' | 'goal-check' | 'reconstruct';
}

const PSEUDOCODE: Record<AlgorithmType, PseudocodeLine[]> = {
  bfs: [
    { text: 'BFS(start, goal):', indent: 0 },
    { text: 'queue ← [start]', indent: 1, highlightOn: 'init' },
    { text: 'visited ← {start}', indent: 1, highlightOn: 'init' },
    { text: 'while queue is not empty:', indent: 1 },
    { text: 'node ← queue.dequeue()', indent: 2, highlightOn: 'visit' },
    { text: 'if node = goal:', indent: 2, highlightOn: 'goal-check' },
    { text: 'return reconstruct_path()', indent: 3, highlightOn: 'reconstruct' },
    { text: 'for each neighbor of node:', indent: 2 },
    { text: 'if neighbor ∉ visited:', indent: 3 },
    { text: 'visited.add(neighbor)', indent: 4, highlightOn: 'frontier' },
    { text: 'queue.enqueue(neighbor)', indent: 4, highlightOn: 'frontier' },
    { text: 'return failure', indent: 1 },
  ],
  dfs: [
    { text: 'DFS(start, goal):', indent: 0 },
    { text: 'stack ← [start]', indent: 1, highlightOn: 'init' },
    { text: 'visited ← {}', indent: 1, highlightOn: 'init' },
    { text: 'while stack is not empty:', indent: 1 },
    { text: 'node ← stack.pop()', indent: 2, highlightOn: 'visit' },
    { text: 'if node ∈ visited: continue', indent: 2 },
    { text: 'visited.add(node)', indent: 2, highlightOn: 'visit' },
    { text: 'if node = goal:', indent: 2, highlightOn: 'goal-check' },
    { text: 'return reconstruct_path()', indent: 3, highlightOn: 'reconstruct' },
    { text: 'for each neighbor of node:', indent: 2 },
    { text: 'if neighbor ∉ visited:', indent: 3 },
    { text: 'stack.push(neighbor)', indent: 4, highlightOn: 'frontier' },
    { text: 'return failure', indent: 1 },
  ],
  dijkstra: [
    { text: "Dijkstra(start, goal):", indent: 0 },
    { text: 'dist[start] ← 0', indent: 1, highlightOn: 'init' },
    { text: 'pq ← [(0, start)]', indent: 1, highlightOn: 'init' },
    { text: 'while pq is not empty:', indent: 1 },
    { text: 'node ← pq.extract_min()', indent: 2, highlightOn: 'visit' },
    { text: 'if node ∈ visited: continue', indent: 2 },
    { text: 'visited.add(node)', indent: 2, highlightOn: 'visit' },
    { text: 'if node = goal:', indent: 2, highlightOn: 'goal-check' },
    { text: 'return reconstruct_path()', indent: 3, highlightOn: 'reconstruct' },
    { text: 'for each neighbor of node:', indent: 2 },
    { text: 'alt ← dist[node] + weight(edge)', indent: 3, highlightOn: 'frontier' },
    { text: 'if alt < dist[neighbor]:', indent: 3 },
    { text: 'dist[neighbor] ← alt', indent: 4, highlightOn: 'frontier' },
    { text: 'pq.insert(alt, neighbor)', indent: 4, highlightOn: 'frontier' },
    { text: 'return failure', indent: 1 },
  ],
  ucs: [
    { text: 'UCS(start, goal):', indent: 0 },
    { text: 'cost[start] ← 0', indent: 1, highlightOn: 'init' },
    { text: 'pq ← [(0, start)]', indent: 1, highlightOn: 'init' },
    { text: 'while pq is not empty:', indent: 1 },
    { text: 'node ← pq.extract_min()', indent: 2, highlightOn: 'visit' },
    { text: 'if node ∈ visited: continue', indent: 2 },
    { text: 'visited.add(node)', indent: 2, highlightOn: 'visit' },
    { text: 'if node = goal:', indent: 2, highlightOn: 'goal-check' },
    { text: 'return reconstruct_path()', indent: 3, highlightOn: 'reconstruct' },
    { text: 'for each neighbor of node:', indent: 2 },
    { text: 'new_cost ← cost[node] + weight(edge)', indent: 3, highlightOn: 'frontier' },
    { text: 'if new_cost < cost[neighbor]:', indent: 3 },
    { text: 'cost[neighbor] ← new_cost', indent: 4, highlightOn: 'frontier' },
    { text: 'pq.insert(new_cost, neighbor)', indent: 4, highlightOn: 'frontier' },
    { text: 'return failure', indent: 1 },
  ],
  greedy: [
    { text: 'Greedy(start, goal):', indent: 0 },
    { text: 'pq ← [(h(start), start)]', indent: 1, highlightOn: 'init' },
    { text: 'visited ← {}', indent: 1, highlightOn: 'init' },
    { text: 'while pq is not empty:', indent: 1 },
    { text: 'node ← pq.extract_min()', indent: 2, highlightOn: 'visit' },
    { text: 'if node ∈ visited: continue', indent: 2 },
    { text: 'visited.add(node)', indent: 2, highlightOn: 'visit' },
    { text: 'if node = goal:', indent: 2, highlightOn: 'goal-check' },
    { text: 'return reconstruct_path()', indent: 3, highlightOn: 'reconstruct' },
    { text: 'for each neighbor of node:', indent: 2 },
    { text: 'if neighbor ∉ visited:', indent: 3 },
    { text: 'pq.insert(h(neighbor), neighbor)', indent: 4, highlightOn: 'frontier' },
    { text: 'return failure', indent: 1 },
  ],
  astar: [
    { text: 'A*(start, goal):', indent: 0 },
    { text: 'g[start] ← 0', indent: 1, highlightOn: 'init' },
    { text: 'f ← g[start] + h(start)', indent: 1, highlightOn: 'init' },
    { text: 'pq ← [(f, start)]', indent: 1, highlightOn: 'init' },
    { text: 'while pq is not empty:', indent: 1 },
    { text: 'node ← pq.extract_min()', indent: 2, highlightOn: 'visit' },
    { text: 'if node ∈ visited: continue', indent: 2 },
    { text: 'visited.add(node)', indent: 2, highlightOn: 'visit' },
    { text: 'if node = goal:', indent: 2, highlightOn: 'goal-check' },
    { text: 'return reconstruct_path()', indent: 3, highlightOn: 'reconstruct' },
    { text: 'for each neighbor of node:', indent: 2 },
    { text: 'tentative_g ← g[node] + weight(edge)', indent: 3, highlightOn: 'frontier' },
    { text: 'if tentative_g < g[neighbor]:', indent: 3 },
    { text: 'g[neighbor] ← tentative_g', indent: 4, highlightOn: 'frontier' },
    { text: 'f ← g[neighbor] + h(neighbor)', indent: 4, highlightOn: 'frontier' },
    { text: 'pq.insert(f, neighbor)', indent: 4, highlightOn: 'frontier' },
    { text: 'return failure', indent: 1 },
  ],
};

interface Props {
  algorithm: AlgorithmType;
  currentStepType: AlgorithmStep['type'] | 'path' | null;
  isRunning: boolean;
}

export const TutorialPanel: React.FC<Props> = ({ algorithm, currentStepType, isRunning }) => {
  const lines = PSEUDOCODE[algorithm];

  const getHighlightedLines = (): Set<number> => {
    if (!currentStepType || !isRunning) return new Set();
    const highlighted = new Set<number>();
    lines.forEach((line, i) => {
      if (line.highlightOn === currentStepType) {
        highlighted.add(i);
      }
      if ((currentStepType === 'visit' || currentStepType === 'frontier') && line.text.startsWith('while ')) {
        highlighted.add(i);
      }
      if (currentStepType === 'path' && line.highlightOn === 'reconstruct') {
        highlighted.add(i);
      }
    });
    return highlighted;
  };

  const highlighted = getHighlightedLines();

  return (
    <div className="border-t border-border bg-card p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
          Pseudocode
        </span>
        {isRunning && currentStepType && (
          <span className="text-[9px] text-primary uppercase tracking-widest animate-pulse">
            ● LIVE
          </span>
        )}
      </div>
      <div className="font-mono text-[11px] leading-[1.7] select-text">
        {lines.map((line, i) => {
          const isActive = highlighted.has(i);
          return (
            <div
              key={i}
              className={`
                transition-all duration-150 rounded-sm px-1.5 -mx-1.5
                ${isActive
                  ? 'bg-primary/15 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground/70 border-l-2 border-transparent'
                }
              `}
              style={{ paddingLeft: `${line.indent * 16 + 6}px` }}
            >
              <span className="text-muted-foreground/30 mr-2 select-none inline-block w-4 text-right text-[9px]">
                {i + 1}
              </span>
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
