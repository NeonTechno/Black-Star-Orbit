/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — Multi-Epoch Time-lapse & Blink Comparator Interface
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ObservationFrame, StretchMode, ColorMap } from '../../types/index.ts';
import { renderObservationToCanvas } from '../../science/spherexEngine.ts';
import { Play, Pause, RotateCcw, FastForward, Film, Eye } from 'lucide-react';

interface TimelapseViewerProps {
  epochs: ObservationFrame[];
  stretch: StretchMode;
  cmap: ColorMap;
}

export const TimelapseViewer: React.FC<TimelapseViewerProps> = ({
  epochs,
  stretch,
  cmap,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(2); // frames per second
  const [isBlinkMode, setIsBlinkMode] = useState<boolean>(false);
  const [blinkEpochA, setBlinkEpochA] = useState<number>(0);
  const [blinkEpochB, setBlinkEpochB] = useState<number>(Math.min(1, epochs.length - 1));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeFrame = isBlinkMode
    ? (currentIdx % 2 === 0 ? epochs[blinkEpochA] : epochs[blinkEpochB])
    : epochs[currentIdx] || epochs[0];

  const renderActive = useCallback(() => {
    if (canvasRef.current && activeFrame) {
      renderObservationToCanvas(canvasRef.current, activeFrame, stretch, cmap, true, null);
    }
  }, [activeFrame, stretch, cmap]);

  useEffect(() => {
    renderActive();
  }, [renderActive]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = 1000 / fps;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => {
        if (isBlinkMode) {
          return prev === 0 ? 1 : 0;
        }
        return (prev + 1) % epochs.length;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, fps, isBlinkMode, epochs.length]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
      {/* Title & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Film className="h-4 w-4 text-cyan-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Multi-Epoch Time-lapse & Blink Comparator
          </h4>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => {
              setIsBlinkMode(false);
              setIsPlaying(false);
            }}
            className={`px-2.5 py-1 rounded transition ${
              !isBlinkMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Sequential Time-lapse
          </button>
          <button
            onClick={() => {
              setIsBlinkMode(true);
              setIsPlaying(true);
            }}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
              isBlinkMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="h-3 w-3" />
            Blink Comparator (Transient Hunting)
          </button>
        </div>
      </div>

      {/* Screen & Canvas */}
      <div className="relative aspect-square max-w-lg mx-auto rounded-lg overflow-hidden border border-slate-800 bg-black">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="w-full h-full object-contain"
        />

        {/* Overlay Telemetry Badge */}
        <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded text-xs font-mono text-cyan-300 border border-slate-800 flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Epoch {activeFrame?.epochIndex + 1} of {epochs.length}</span>
          <span className="text-slate-500">|</span>
          <span className="text-white">{activeFrame?.timestamp.split('T')[0]}</span>
        </div>

        {isBlinkMode && (
          <div className="absolute top-2 right-2 bg-amber-950/90 text-amber-300 font-mono text-[11px] px-2 py-0.5 rounded border border-amber-700/60 animate-pulse">
            BLINKING: {currentIdx % 2 === 0 ? `EP ${blinkEpochA + 1}` : `EP ${blinkEpochB + 1}`}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="max-w-lg mx-auto bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2.5 text-xs font-mono">
        <div className="flex items-center justify-between gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 font-semibold transition"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Reset Frame */}
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentIdx(0);
            }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reset to first frame"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Speed selector */}
          <div className="flex items-center space-x-1 text-slate-400">
            <FastForward className="h-3 w-3 text-cyan-400" />
            <span>Speed:</span>
            {[1, 2, 4, 8].map((s) => (
              <button
                key={s}
                onClick={() => setFps(s)}
                className={`px-1.5 py-0.5 rounded transition ${
                  fps === s ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Scrubber slider for sequential mode */}
        {!isBlinkMode && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Frame timeline:</span>
              <span className="text-cyan-400">Epoch {currentIdx + 1} ({epochs[currentIdx]?.timestamp})</span>
            </div>
            <input
              type="range"
              min={0}
              max={epochs.length - 1}
              value={currentIdx}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentIdx(Number(e.target.value));
              }}
              aria-label="Time-lapse frame timeline scrubber"
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        )}

        {/* Epoch selectors for blink mode */}
        {isBlinkMode && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Reference Epoch (A):</span>
              <select
                value={blinkEpochA}
                onChange={(e) => setBlinkEpochA(Number(e.target.value))}
                aria-label="Reference Epoch A for blink comparator"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
              >
                {epochs.map((ep, i) => (
                  <option key={ep.frameId} value={i}>
                    Epoch {i + 1} ({ep.timestamp.split('T')[0]})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Comparison Epoch (B):</span>
              <select
                value={blinkEpochB}
                onChange={(e) => setBlinkEpochB(Number(e.target.value))}
                aria-label="Comparison Epoch B for blink comparator"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
              >
                {epochs.map((ep, i) => (
                  <option key={ep.frameId} value={i}>
                    Epoch {i + 1} ({ep.timestamp.split('T')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
