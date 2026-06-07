export type CellType = 'empty' | 'wall' | 'start' | 'end';

export interface Cell {
  row: number;
  col: number;
  type: CellType;
  weight: number;
}

export interface GridState {
  cells: Cell[][];
  rows: number;
  cols: number;
  start: [number, number] | null;
  end: [number, number] | null;
}

export interface AlgorithmStep {
  type: 'visit' | 'frontier' | 'path';
  row: number;
  col: number;
}

export interface AlgorithmResult {
  steps: AlgorithmStep[];
  path: [number, number][];
  nodesVisited: number;
  pathLength: number;
}

export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'ucs' | 'greedy' | 'astar';

export interface AlgorithmInfo {
  name: string;
  description: string;
  heuristic: string;
  timeComplexity: string;
  spaceComplexity: string;
  optimal: boolean;
  complete: boolean;
}

export const ALGORITHM_INFO: Record<AlgorithmType, AlgorithmInfo> = {
  bfs: {
    name: 'Breadth-First Search',
    description: 'Explores all neighbors at current depth before moving deeper. Guarantees shortest path on unweighted graphs.',
    heuristic: 'None',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    optimal: true,
    complete: true,
  },
  dfs: {
    name: 'Depth-First Search',
    description: 'Explores as far as possible along each branch before backtracking. Does not guarantee shortest path.',
    heuristic: 'None',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    optimal: false,
    complete: true,
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description: 'Finds shortest path in weighted graphs using a priority queue ordered by cumulative cost.',
    heuristic: 'None',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    optimal: true,
    complete: true,
  },
  ucs: {
    name: 'Uniform Cost Search',
    description: 'Expands the least-cost node first. Equivalent to Dijkstra for search problems.',
    heuristic: 'None',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    optimal: true,
    complete: true,
  },
  greedy: {
    name: 'Greedy Best-First',
    description: 'Always expands the node closest to the goal by heuristic. Fast but not optimal.',
    heuristic: 'Manhattan Distance',
    timeComplexity: 'O(V log V)',
    spaceComplexity: 'O(V)',
    optimal: false,
    complete: false,
  },
  astar: {
    name: 'A* Search',
    description: 'Combines path cost and heuristic estimate. Optimal with admissible heuristic.',
    heuristic: 'Manhattan Distance',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    optimal: true,
    complete: true,
  },
};

const DIRECTIONS: [number, number][] = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
];

function manhattan(r1: number, c1: number, r2: number, c2: number): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

function reconstructPath(
  cameFrom: Map<string, string>,
  endKey: string
): [number, number][] {
  const path: [number, number][] = [];
  let current = endKey;
  while (cameFrom.has(current)) {
    const [r, c] = current.split(',').map(Number);
    path.unshift([r, c]);
    current = cameFrom.get(current)!;
  }
  const [r, c] = current.split(',').map(Number);
  path.unshift([r, c]);
  return path;
}

function key(r: number, c: number): string {
  return `${r},${c}`;
}

function getNeighbors(grid: GridState, r: number, c: number): [number, number][] {
  const neighbors: [number, number][] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < grid.rows && nc >= 0 && nc < grid.cols && grid.cells[nr][nc].type !== 'wall') {
      neighbors.push([nr, nc]);
    }
  }
  return neighbors;
}

// Min-heap priority queue
class MinHeap<T> {
  private heap: { priority: number; item: T }[] = [];

  push(item: T, priority: number) {
    this.heap.push({ priority, item });
    this._bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top.item;
  }

  get size() { return this.heap.length; }

  private _bubbleUp(i: number) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[i].priority >= this.heap[parent].priority) break;
      [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
      i = parent;
    }
  }

  private _sinkDown(i: number) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.heap[l].priority < this.heap[smallest].priority) smallest = l;
      if (r < n && this.heap[r].priority < this.heap[smallest].priority) smallest = r;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}

export function runAlgorithm(grid: GridState, algorithm: AlgorithmType): AlgorithmResult {
  if (!grid.start || !grid.end) {
    return { steps: [], path: [], nodesVisited: 0, pathLength: 0 };
  }

  switch (algorithm) {
    case 'bfs': return bfs(grid);
    case 'dfs': return dfs(grid);
    case 'dijkstra': return dijkstraAlgo(grid);
    case 'ucs': return ucs(grid);
    case 'greedy': return greedy(grid);
    case 'astar': return astar(grid);
  }
}

function bfs(grid: GridState): AlgorithmResult {
  const [sr, sc] = grid.start!;
  const [er, ec] = grid.end!;
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const cameFrom = new Map<string, string>();
  const queue: [number, number][] = [[sr, sc]];
  visited.add(key(sr, sc));

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    steps.push({ type: 'visit', row: r, col: c });

    if (r === er && c === ec) {
      const path = reconstructPath(cameFrom, key(er, ec));
      for (const [pr, pc] of path) steps.push({ type: 'path', row: pr, col: pc });
      return { steps, path, nodesVisited: visited.size, pathLength: path.length };
    }

    for (const [nr, nc] of getNeighbors(grid, r, c)) {
      const nk = key(nr, nc);
      if (!visited.has(nk)) {
        visited.add(nk);
        cameFrom.set(nk, key(r, c));
        queue.push([nr, nc]);
        steps.push({ type: 'frontier', row: nr, col: nc });
      }
    }
  }

  return { steps, path: [], nodesVisited: visited.size, pathLength: 0 };
}

function dfs(grid: GridState): AlgorithmResult {
  const [sr, sc] = grid.start!;
  const [er, ec] = grid.end!;
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const cameFrom = new Map<string, string>();
  const stack: [number, number][] = [[sr, sc]];

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const k = key(r, c);
    if (visited.has(k)) continue;
    visited.add(k);
    steps.push({ type: 'visit', row: r, col: c });

    if (r === er && c === ec) {
      const path = reconstructPath(cameFrom, key(er, ec));
      for (const [pr, pc] of path) steps.push({ type: 'path', row: pr, col: pc });
      return { steps, path, nodesVisited: visited.size, pathLength: path.length };
    }

    for (const [nr, nc] of getNeighbors(grid, r, c)) {
      const nk = key(nr, nc);
      if (!visited.has(nk)) {
        cameFrom.set(nk, k);
        stack.push([nr, nc]);
        steps.push({ type: 'frontier', row: nr, col: nc });
      }
    }
  }

  return { steps, path: [], nodesVisited: visited.size, pathLength: 0 };
}

function dijkstraAlgo(grid: GridState): AlgorithmResult {
  const [sr, sc] = grid.start!;
  const [er, ec] = grid.end!;
  const steps: AlgorithmStep[] = [];
  const dist = new Map<string, number>();
  const cameFrom = new Map<string, string>();
  const visited = new Set<string>();
  const pq = new MinHeap<[number, number]>();

  dist.set(key(sr, sc), 0);
  pq.push([sr, sc], 0);

  while (pq.size > 0) {
    const [r, c] = pq.pop()!;
    const k = key(r, c);
    if (visited.has(k)) continue;
    visited.add(k);
    steps.push({ type: 'visit', row: r, col: c });

    if (r === er && c === ec) {
      const path = reconstructPath(cameFrom, key(er, ec));
      for (const [pr, pc] of path) steps.push({ type: 'path', row: pr, col: pc });
      const totalCost = path.reduce((sum, [pr, pc]) => sum + grid.cells[pr][pc].weight, 0);
      return { steps, path, nodesVisited: visited.size, pathLength: totalCost };
    }

    const currentDist = dist.get(k)!;
    for (const [nr, nc] of getNeighbors(grid, r, c)) {
      const nk = key(nr, nc);
      if (visited.has(nk)) continue;
      const newDist = currentDist + grid.cells[nr][nc].weight;
      if (!dist.has(nk) || newDist < dist.get(nk)!) {
        dist.set(nk, newDist);
        cameFrom.set(nk, k);
        pq.push([nr, nc], newDist);
        steps.push({ type: 'frontier', row: nr, col: nc });
      }
    }
  }

  return { steps, path: [], nodesVisited: visited.size, pathLength: 0 };
}

function ucs(grid: GridState): AlgorithmResult {
  return dijkstraAlgo(grid); // UCS is identical to Dijkstra for grid search
}

function greedy(grid: GridState): AlgorithmResult {
  const [sr, sc] = grid.start!;
  const [er, ec] = grid.end!;
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const cameFrom = new Map<string, string>();
  const pq = new MinHeap<[number, number]>();

  pq.push([sr, sc], manhattan(sr, sc, er, ec));

  while (pq.size > 0) {
    const [r, c] = pq.pop()!;
    const k = key(r, c);
    if (visited.has(k)) continue;
    visited.add(k);
    steps.push({ type: 'visit', row: r, col: c });

    if (r === er && c === ec) {
      const path = reconstructPath(cameFrom, key(er, ec));
      for (const [pr, pc] of path) steps.push({ type: 'path', row: pr, col: pc });
      return { steps, path, nodesVisited: visited.size, pathLength: path.length };
    }

    for (const [nr, nc] of getNeighbors(grid, r, c)) {
      const nk = key(nr, nc);
      if (!visited.has(nk)) {
        cameFrom.set(nk, k);
        pq.push([nr, nc], manhattan(nr, nc, er, ec));
        steps.push({ type: 'frontier', row: nr, col: nc });
      }
    }
  }

  return { steps, path: [], nodesVisited: visited.size, pathLength: 0 };
}

function astar(grid: GridState): AlgorithmResult {
  const [sr, sc] = grid.start!;
  const [er, ec] = grid.end!;
  const steps: AlgorithmStep[] = [];
  const gScore = new Map<string, number>();
  const cameFrom = new Map<string, string>();
  const visited = new Set<string>();
  const pq = new MinHeap<[number, number]>();

  const sk = key(sr, sc);
  gScore.set(sk, 0);
  pq.push([sr, sc], manhattan(sr, sc, er, ec));

  while (pq.size > 0) {
    const [r, c] = pq.pop()!;
    const k = key(r, c);
    if (visited.has(k)) continue;
    visited.add(k);
    steps.push({ type: 'visit', row: r, col: c });

    if (r === er && c === ec) {
      const path = reconstructPath(cameFrom, key(er, ec));
      for (const [pr, pc] of path) steps.push({ type: 'path', row: pr, col: pc });
      const totalCost = path.reduce((sum, [pr, pc]) => sum + grid.cells[pr][pc].weight, 0);
      return { steps, path, nodesVisited: visited.size, pathLength: totalCost };
    }

    const currentG = gScore.get(k)!;
    for (const [nr, nc] of getNeighbors(grid, r, c)) {
      const nk = key(nr, nc);
      if (visited.has(nk)) continue;
      const tentativeG = currentG + grid.cells[nr][nc].weight;
      if (!gScore.has(nk) || tentativeG < gScore.get(nk)!) {
        gScore.set(nk, tentativeG);
        cameFrom.set(nk, k);
        const f = tentativeG + manhattan(nr, nc, er, ec);
        pq.push([nr, nc], f);
        steps.push({ type: 'frontier', row: nr, col: nc });
      }
    }
  }

  return { steps, path: [], nodesVisited: visited.size, pathLength: 0 };
}

export function createGrid(rows: number, cols: number): GridState {
  const cells: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({ row: r, col: c, type: 'empty', weight: 1 });
    }
    cells.push(row);
  }
  // Default start and end
  const sr = Math.floor(rows / 2);
  const startCol = Math.floor(cols * 0.25);
  const endCol = Math.floor(cols * 0.75);
  cells[sr][startCol].type = 'start';
  cells[sr][endCol].type = 'end';
  return { cells, rows, cols, start: [sr, startCol], end: [sr, endCol] };
}