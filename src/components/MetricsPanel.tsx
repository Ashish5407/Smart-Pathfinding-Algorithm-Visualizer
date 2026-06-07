import React from 'react';
import { AlgorithmType, ALGORITHM_INFO } from '@/lib/algorithms';
import { Metrics } from '@/hooks/usePathfinder';

interface Props {
  algorithm: AlgorithmType;
  metrics: Metrics;
  label?: string;
}

export const MetricsPanel: React.FC<Props> = ({ algorithm, metrics, label }) => {
  const info = ALGORITHM_INFO[algorithm];

  return (
    <div className="w-72 border-l border-border bg-card p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">
      {label && (
        <div className="text-[10px] text-primary uppercase tracking-[0.2em] font-semibold">{label}</div>
      )}

      <div>
        <h2 className="text-sm font-bold text-foreground">{info.name}</h2>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{info.description}</p>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-3">
        <MetricRow label="NODES EXPLORED" value={metrics.nodesVisited.toString()} />
        <MetricRow label="PATH LENGTH" value={metrics.pathLength > 0 ? metrics.pathLength.toString() : '—'} />
        <MetricRow label="TIME" value={metrics.timeTaken > 0 ? `${metrics.timeTaken.toFixed(1)}ms` : '—'} />
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-2">
        <InfoRow label="Heuristic" value={info.heuristic} />
        <InfoRow label="Time" value={info.timeComplexity} />
        <InfoRow label="Space" value={info.spaceComplexity} />
        <InfoRow label="Optimal" value={info.optimal ? 'Yes' : 'No'} highlight={info.optimal} />
        <InfoRow label="Complete" value={info.complete ? 'Yes' : 'No'} highlight={info.complete} />
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-1.5">
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Legend</div>
        <LegendItem color="bg-cell-start" label="Start Node" />
        <LegendItem color="bg-cell-end" label="End Node" />
        <LegendItem color="bg-cell-wall" label="Wall" />
        <LegendItem color="bg-cell-frontier" label="Frontier" />
        <LegendItem color="bg-cell-visited" label="Visited" />
        <LegendItem color="bg-cell-path" label="Path" />
      </div>

      <div className="mt-auto pt-4">
        <div className="text-[10px] text-muted-foreground/50 leading-relaxed">
          Click to draw walls · Drag start/end nodes · Right-click for weights (1–9) · Space to run
        </div>
      </div>
    </div>
  );
};

const MetricRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between">
    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</span>
    <span className="text-lg font-bold text-foreground tabular-nums">{value}</span>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] text-muted-foreground">{label}</span>
    <span className={`text-xs font-medium ${highlight ? 'text-cell-start' : 'text-foreground'}`}>{value}</span>
  </div>
);

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 ${color}`} />
    <span className="text-[11px] text-muted-foreground">{label}</span>
  </div>
);
