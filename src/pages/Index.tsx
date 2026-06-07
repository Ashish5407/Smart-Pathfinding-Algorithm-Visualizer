import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ControlHeader } from '@/components/ControlHeader';
import { PathfindingGrid } from '@/components/PathfindingGrid';
import { MetricsPanel } from '@/components/MetricsPanel';
import { TutorialPanel } from '@/components/TutorialPanel';
import { usePathfinder } from '@/hooks/usePathfinder';
import { AlgorithmType } from '@/lib/algorithms';

function useGridDimensions() {
  const [dims, setDims] = useState({ rows: 25, cols: 40 });
  useEffect(() => {
    const calc = () => {
      const availW = window.innerWidth - 288 - 32; // sidebar + padding
      const availH = window.innerHeight - 64 - 32; // header + padding
      const cols = Math.max(10, Math.floor(availW / 24));
      const rows = Math.max(10, Math.floor(availH / 24));
      setDims({ rows, cols });
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return dims;
}

const Index = () => {
  const { rows, cols } = useGridDimensions();
  const pf1 = usePathfinder(rows, cols);
  const pf2 = usePathfinder(rows, cols);
  const [splitView, setSplitView] = useState(false);

  const syncGrid = useCallback(() => {
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        if (pf1.vizState === 'idle' || pf1.vizState === 'finished') {
          handleStart();
        } else if (pf1.vizState === 'running') {
          handlePause();
        } else if (pf1.vizState === 'paused') {
          handleResume();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pf1.vizState]);

  const handleStart = useCallback(() => {
    pf1.startVisualization();
    if (splitView) pf2.startVisualization();
  }, [pf1, pf2, splitView]);

  const handlePause = useCallback(() => {
    pf1.pauseVisualization();
    if (splitView) pf2.pauseVisualization();
  }, [pf1, pf2, splitView]);

  const handleResume = useCallback(() => {
    pf1.resumeVisualization();
    if (splitView) pf2.resumeVisualization();
  }, [pf1, pf2, splitView]);

  const handleReset = useCallback(() => {
    pf1.resetGrid();
    if (splitView) pf2.resetGrid();
  }, [pf1, pf2, splitView]);

  const handleClearWalls = useCallback(() => {
    pf1.clearWalls();
    if (splitView) pf2.clearWalls();
  }, [pf1, pf2, splitView]);

  const isRunning = pf1.vizState === 'running' || pf2.vizState === 'running';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ControlHeader
        algorithm={pf1.algorithm}
        speed={pf1.speed}
        vizState={pf1.vizState}
        onAlgorithmChange={pf1.setAlgorithm}
        onSpeedChange={(s) => { pf1.setSpeed(s); pf2.setSpeed(s); }}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onReset={handleReset}
        onClearWalls={handleClearWalls}
        splitView={splitView}
        onToggleSplit={() => setSplitView(!splitView)}
        algorithm2={pf2.algorithm}
        onAlgorithm2Change={pf2.setAlgorithm}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 flex ${splitView ? 'divide-x divide-border' : ''}`}>
          <div className={`flex-1 flex flex-col ${splitView ? 'border-r border-border' : ''}`}>
            {splitView && (
              <div className="h-7 bg-secondary/50 flex items-center px-3 border-b border-border">
                <span className="text-[10px] text-primary uppercase tracking-widest font-semibold">
                  {pf1.algorithm.toUpperCase()}
                </span>
              </div>
            )}
            <PathfindingGrid
              grid={pf1.grid}
              cellStates={pf1.cellStates}
              isRunning={isRunning}
              onUpdateCell={pf1.updateCell}
              onMoveNode={pf1.moveNode}
              onSetWeight={pf1.setWeight}
            />
          </div>

          {splitView && (
            <div className="flex-1 flex flex-col">
              <div className="h-7 bg-secondary/50 flex items-center px-3 border-b border-border">
                <span className="text-[10px] text-primary uppercase tracking-widest font-semibold">
                  {pf2.algorithm.toUpperCase()}
                </span>
              </div>
              <PathfindingGrid
                grid={pf2.grid}
                cellStates={pf2.cellStates}
                isRunning={isRunning}
                onUpdateCell={pf2.updateCell}
                onMoveNode={pf2.moveNode}
                onSetWeight={pf2.setWeight}
              />
            </div>
          )}
        </div>

        <div className={`flex ${splitView ? 'flex-col' : 'flex-col'} overflow-y-auto`}>
          <MetricsPanel
            algorithm={pf1.algorithm}
            metrics={pf1.metrics}
            label={splitView ? 'Panel A' : undefined}
          />
          {splitView && (
            <MetricsPanel
              algorithm={pf2.algorithm}
              metrics={pf2.metrics}
              label="Panel B"
            />
          )}
          <TutorialPanel
            algorithm={splitView ? pf1.algorithm : pf1.algorithm}
            currentStepType={pf1.currentStepType}
            isRunning={pf1.vizState === 'running' || pf1.vizState === 'paused'}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
