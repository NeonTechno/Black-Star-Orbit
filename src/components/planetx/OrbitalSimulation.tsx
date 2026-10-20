/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — Planet X & Extreme TNO Orbital Phase Space Simulator
 */

import React, { useRef, useEffect, useState } from 'react';
import { ExtremeTNO, PlanetXHypothesisParams } from '../../types/index.ts';
import { Orbit, Compass, Play, Pause, ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';

interface OrbitalSimulationProps {
  etnoCatalog: ExtremeTNO[];
  hypothesis: PlanetXHypothesisParams;
  onSelectObject: (objectName: string) => void;
}

export const OrbitalSimulation: React.FC<OrbitalSimulationProps> = ({
  etnoCatalog,
  hypothesis,
  onSelectObject,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scaleAU, setScaleAU] = useState<number>(1000); // Max AU visible
  const [viewAngle, setViewAngle] = useState<'top' | 'inclined'>('top');
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [simTimeYears, setSimTimeYears] = useState<number>(0);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showPerihelionVectors, setShowPerihelionVectors] = useState<boolean>(true);
  const [hoveredObj, setHoveredObj] = useState<string | null>(null);

  // Animation frame loop
  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setSimTimeYears((t) => t + 5);
    }, 40);
    return () => clearInterval(interval);
  }, [isAnimating]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Clear background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // Coordinate conversion: AU to Canvas Pixels
    const auToPx = (w / 2 - 30) / scaleAU;
    const cosInc = viewAngle === 'inclined' ? Math.cos((45 * Math.PI) / 180) : 1.0;

    // Draw reference distance rings (100 AU, 300 AU, 500 AU, 800 AU)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    [100, 300, 500, 800].forEach((ringAU) => {
      if (ringAU <= scaleAU) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, ringAU * auToPx, ringAU * auToPx * cosInc, 0, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = '9px JetBrains Mono';
        ctx.fillText(`${ringAU} AU`, cx + ringAU * auToPx + 4, cy - 4);
      }
    });
    ctx.setLineDash([]);

    // Draw Sun at origin
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Neptune Orbit (30 AU) for scale
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 30 * auToPx, 30 * auToPx * cosInc, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.font = '9px JetBrains Mono';
    ctx.fillText('Neptune (30 AU)', cx + 32 * auToPx, cy - 2);

    // Draw eTNO Orbits (Sedna, 2012 VP113, etc.)
    etnoCatalog.forEach((obj) => {
      const a = obj.semiMajorAxisAU;
      const e = obj.eccentricity;
      const b = a * Math.sqrt(Math.max(0, 1 - e * e));
      const c = a * e; // distance from center of ellipse to focus (Sun)
      const varpiRad = (obj.longPerihelionDeg * Math.PI) / 180;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(varpiRad);

      // Draw Perihelion Vector arrow
      if (showPerihelionVectors && obj.antiAligned) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(obj.perihelionDistAU * auToPx, 0);
        ctx.stroke();
      }

      // Ellipse center offset by c from Sun
      ctx.strokeStyle = obj.antiAligned ? 'rgba(56, 189, 248, 0.7)' : 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = obj.name.includes('Sedna') ? 2 : 1.2;

      ctx.beginPath();
      ctx.ellipse(
        -c * auToPx,
        0,
        a * auToPx,
        b * auToPx * cosInc,
        0,
        0,
        2 * Math.PI
      );
      ctx.stroke();

      // Current position along orbit
      const meanMotion = (2 * Math.PI) / obj.orbitalPeriodYears;
      const M = (meanMotion * simTimeYears) % (2 * Math.PI);
      // Kepler approximate solution
      const E = M + e * Math.sin(M);
      const trueX = a * (Math.cos(E) - e);
      const trueY = b * Math.sin(E) * cosInc;

      ctx.fillStyle = obj.antiAligned ? '#38bdf8' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(trueX * auToPx, trueY * auToPx, 3, 0, 2 * Math.PI);
      ctx.fill();

      if (showLabels) {
        ctx.font = '9px JetBrains Mono';
        ctx.fillText(obj.name.split(' ')[1] || obj.name, trueX * auToPx + 6, trueY * auToPx + 3);
      }

      ctx.restore();
    });

    // Draw Planet X Hypothetical Orbit (Anti-aligned, bold purple/magenta)
    {
      const a = hypothesis.semiMajorAxisAU;
      const e = hypothesis.eccentricity;
      const b = a * Math.sqrt(Math.max(0, 1 - e * e));
      const c = a * e;
      // Batygin & Brown: varpi ~ 250 deg (anti-aligned to eTNO cluster ~ 70-120 deg)
      const varpiRad = ((hypothesis.longAscNodeDeg + hypothesis.argPerihelionDeg) * Math.PI) / 180;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(varpiRad);

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 3]);

      ctx.beginPath();
      ctx.ellipse(
        -c * auToPx,
        0,
        a * auToPx,
        b * auToPx * cosInc,
        0,
        0,
        2 * Math.PI
      );
      ctx.stroke();
      ctx.setLineDash([]);

      // Planet X position
      const meanMotion = (2 * Math.PI) / hypothesis.orbitalPeriodYears;
      const M = (meanMotion * simTimeYears + (hypothesis.meanAnomalyDeg * Math.PI) / 180) % (2 * Math.PI);
      const E = M + e * Math.sin(M);
      const pxX = a * (Math.cos(E) - e);
      const pxY = b * Math.sin(E) * cosInc;

      // Glow indicator
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(pxX * auToPx, pxY * auToPx, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#f3e8ff';
      ctx.font = 'bold 11px Space Grotesk';
      ctx.fillText('PLANET X (Hypothetical)', pxX * auToPx + 9, pxY * auToPx + 4);

      ctx.restore();
    }

    // Legend on canvas
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.fillRect(12, 12, 220, 85);
    ctx.strokeRect(12, 12, 220, 85);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px Space Grotesk';
    ctx.fillText('Outer Solar System Dynamics', 20, 28);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(20, 38, 12, 3);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('Clustered eTNOs (ϖ ≈ 20°–130°)', 38, 42);

    ctx.fillStyle = '#c084fc';
    ctx.fillRect(20, 52, 12, 3);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Planet X Orbit (ϖ ≈ 250°)', 38, 56);

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(26, 68, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Sun / Solar Barycenter', 38, 71);

  }, [etnoCatalog, hypothesis, scaleAU, viewAngle, simTimeYears, showLabels, showPerihelionVectors]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
      {/* Simulation Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-2">
          <Orbit className="h-5 w-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Outer Solar System Orbital Phase Space
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Batygin & Brown (2021) eTNO clustering & orbital confinement
            </p>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewAngle('top')}
              className={`px-2.5 py-1 rounded transition ${
                viewAngle === 'top' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top-Down (X-Y)
            </button>
            <button
              onClick={() => setViewAngle('inclined')}
              className={`px-2.5 py-1 rounded transition ${
                viewAngle === 'inclined' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Inclined 45°
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              {isAnimating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isAnimating ? 'Pause' : 'Animate'}</span>
            </button>
            <button
              onClick={() => setScaleAU((s) => Math.min(s + 200, 1800))}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setScaleAU((s) => Math.max(s - 200, 400))}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setSimTimeYears(0)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Reset time"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative aspect-[16/10] w-full max-h-[460px] rounded-lg overflow-hidden border border-slate-800 bg-black">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-full object-contain"
        />

        {/* Toggles bar */}
        <div className="absolute bottom-2 right-2 flex items-center space-x-2 text-[11px] font-mono bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-800 text-slate-300">
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="accent-indigo-500 rounded"
            />
            <span>Labels</span>
          </label>
          <span>•</span>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showPerihelionVectors}
              onChange={(e) => setShowPerihelionVectors(e.target.checked)}
              className="accent-indigo-500 rounded"
            />
            <span>Perihelion Vectors (ϖ)</span>
          </label>
        </div>
      </div>

      {/* Explanatory footer note */}
      <div className="flex items-start space-x-2 text-xs text-slate-400 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
        <Info className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p>
          Notice how the extreme TNOs (Sedna, 2012 VP113, 2004 VN112) cluster with their perihelia pointing in the same direction (lower right). A distant eccentric perturber (Planet X) gravitationally shepherds these orbits into anti-aligned stability ($ϖ \approx 250^\circ$, upper left).
        </p>
      </div>
    </div>
  );
};
