/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — Side-by-Side Astronomical Comparison Viewer
 */

import React, { useRef, useEffect, useState } from 'react';
import { ObservationFrame, StretchMode, ColorMap } from '../../types/index.ts';
import { renderObservationToCanvas } from '../../science/spherexEngine.ts';
import { SlidersHorizontal, SplitSquareVertical } from 'lucide-react';

interface ComparisonViewProps {
  frameA: ObservationFrame;
  frameB: ObservationFrame;
  stretch: StretchMode;
  cmap: ColorMap;
  labelA?: string;
  labelB?: string;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  frameA,
  frameB,
  stretch,
  cmap,
  labelA = 'Frame A (Reference)',
  labelB = 'Frame B (Comparison)',
}) => {
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'curtain'>('side-by-side');

  useEffect(() => {
    if (canvasARef.current) {
      renderObservationToCanvas(canvasARef.current, frameA, stretch, cmap, true, null);
    }
    if (canvasBRef.current) {
      renderObservationToCanvas(canvasBRef.current, frameB, stretch, cmap, true, null);
    }
  }, [frameA, frameB, stretch, cmap]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SplitSquareVertical className="h-4 w-4 text-cyan-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Side-by-Side Astronomical Comparison
          </h4>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1 rounded transition ${
              viewMode === 'side-by-side'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Dual View
          </button>
          <button
            onClick={() => setViewMode('curtain')}
            className={`px-2.5 py-1 rounded transition ${
              viewMode === 'curtain'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Curtain Split
          </button>
        </div>
      </div>

      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Frame A */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono text-cyan-300 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
              <span className="font-semibold">{labelA}</span>
              <span className="text-slate-400">{frameA.timestamp.split('T')[0]}</span>
            </div>
            <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-slate-800 bg-black">
              <canvas
                ref={canvasARef}
                width={400}
                height={400}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Frame B */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono text-indigo-300 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
              <span className="font-semibold">{labelB}</span>
              <span className="text-slate-400">{frameB.timestamp.split('T')[0]}</span>
            </div>
            <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-slate-800 bg-black">
              <canvas
                ref={canvasBRef}
                width={400}
                height={400}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Curtain Mode */
        <div className="space-y-2">
          <div className="relative aspect-square max-w-xl mx-auto rounded-lg overflow-hidden border border-slate-800 bg-black">
            {/* Canvas B background */}
            <canvas
              ref={canvasBRef}
              width={500}
              height={500}
              className="absolute inset-0 w-full h-full object-contain"
            />
            {/* Canvas A clipped */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${splitPercent}%` }}
            >
              <canvas
                ref={canvasARef}
                width={500}
                height={500}
                className="w-full h-full object-contain"
                style={{ width: `${(100 / splitPercent) * 100}%`, maxWidth: 'none' }}
              />
            </div>
            {/* Split divider line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-lg pointer-events-none"
              style={{ left: `${splitPercent}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-cyan-500 text-black p-1 rounded-full shadow-md">
                <SlidersHorizontal className="h-3 w-3" />
              </div>
            </div>
          </div>

          {/* Slider controller */}
          <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 max-w-xl mx-auto px-2">
            <span>{labelA}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={splitPercent}
              onChange={(e) => setSplitPercent(Number(e.target.value))}
              aria-label="Interactive comparison slider split position"
              className="flex-1 accent-cyan-400 cursor-pointer"
            />
            <span>{labelB}</span>
          </div>
        </div>
      )}
    </div>
  );
};
