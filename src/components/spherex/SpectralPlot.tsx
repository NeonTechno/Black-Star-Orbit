/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — SPHEREx Spectral Energy Distribution (SED) Plotter
 */

import React, { useState } from 'react';
import { SpherexObservation } from '../../types/index.ts';
import { Activity, Sparkles, Info } from 'lucide-react';

interface SpectralPlotProps {
  observation: SpherexObservation;
  onExplainSpectrum: () => void;
}

export const SpectralPlot: React.FC<SpectralPlotProps> = ({
  observation,
  onExplainSpectrum,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    wavelength: number;
    fluxMJySr: number;
    uncertainty: number;
    modelFit: number;
  } | null>(null);

  const data = observation.fullSedCurve;
  if (!data || data.length === 0) return null;

  // Chart dimensions
  const width = 680;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 55 };

  const minW = 0.7;
  const maxW = 5.1;
  const maxFlux = Math.max(...data.map((d) => d.fluxMJySr + d.uncertainty)) * 1.15;
  const minFlux = 0;

  const scaleX = (w: number) =>
    padding.left + ((w - minW) / (maxW - minW)) * (width - padding.left - padding.right);
  const scaleY = (f: number) =>
    height - padding.bottom - ((f - minFlux) / (maxFlux - minFlux)) * (height - padding.top - padding.bottom);

  // SVG path for model fit curve
  const modelLinePath = data.reduce((acc, pt, i) => {
    const x = scaleX(pt.wavelength);
    const y = scaleY(pt.modelFit);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Characteristic spectral markers
  const markers = [
    { w: 1.875, label: 'Pa-α 1.88µm', color: '#38bdf8' },
    { w: 3.05, label: 'H2O Ice 3.05µm', color: '#60a5fa' },
    { w: 3.30, label: 'PAH 3.30µm', color: '#c084fc' },
    { w: 4.27, label: 'CO2 Ice 4.27µm', color: '#f59e0b' },
    { w: 4.67, label: 'CO Ice 4.67µm', color: '#fb923c' },
  ].filter((m) => m.w >= minW && m.w <= maxW);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Spectroscopic SED & Ice Absorption Profile
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            ({observation.targetName})
          </span>
        </div>

        <button
          onClick={onExplainSpectrum}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-950 text-cyan-300 border border-cyan-700/60 hover:bg-cyan-900/50 transition cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Explain Chemistry with AI</span>
        </button>
      </div>

      {/* SVG Chart */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-56 bg-slate-950 rounded-lg border border-slate-800 select-none"
        >
          {/* Grid lines */}
          {[1, 2, 3, 4, 5].map((w) => (
            <g key={w}>
              <line
                x1={scaleX(w)}
                y1={padding.top}
                x2={scaleX(w)}
                y2={height - padding.bottom}
                stroke="#1e293b"
                strokeDasharray="3 3"
              />
              <text
                x={scaleX(w)}
                y={height - padding.bottom + 16}
                fill="#64748b"
                fontSize="10"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
              >
                {w} µm
              </text>
            </g>
          ))}

          {/* Y Axis labels */}
          {[0, 0.33, 0.66, 1].map((frac) => {
            const val = maxFlux * frac;
            const y = scaleY(val);
            return (
              <g key={frac}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Key line markers */}
          {markers.map((m) => {
            const x = scaleX(m.w);
            return (
              <g key={m.label}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke={m.color}
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                  opacity="0.6"
                />
                <text
                  x={x}
                  y={padding.top + 10}
                  fill={m.color}
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {m.label}
                </text>
              </g>
            );
          })}

          {/* Model Fit Line */}
          <path d={modelLinePath} fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />

          {/* Observation Points & Error bars */}
          {data.map((pt, i) => {
            const cx = scaleX(pt.wavelength);
            const cy = scaleY(pt.fluxMJySr);
            const errTop = scaleY(pt.fluxMJySr + pt.uncertainty);
            const errBot = scaleY(pt.fluxMJySr - pt.uncertainty);

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Error bar vertical line */}
                <line x1={cx} y1={errTop} x2={cx} y2={errBot} stroke="#94a3b8" strokeWidth="1.5" />
                <line x1={cx - 3} y1={errTop} x2={cx + 3} y2={errTop} stroke="#94a3b8" strokeWidth="1" />
                <line x1={cx - 3} y1={errBot} x2={cx + 3} y2={errBot} stroke="#94a3b8" strokeWidth="1" />

                {/* Data point circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {/* Axis Labels */}
          <text
            x={width / 2}
            y={height - 6}
            fill="#94a3b8"
            fontSize="10"
            fontFamily="Space Grotesk"
            textAnchor="middle"
          >
            Wavelength λ (µm) — SPHEREx Hawaii-2RG FPA Passbands
          </text>

          <text
            transform={`rotate(-90) translate(${-height / 2}, 16)`}
            fill="#94a3b8"
            fontSize="10"
            fontFamily="Space Grotesk"
            textAnchor="middle"
          >
            Specific Intensity (MJy / sr)
          </text>
        </svg>

        {/* Hovered point tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-slate-950/90 border border-slate-700 p-2 rounded text-xs font-mono text-slate-200 pointer-events-none shadow-lg">
            <div className="text-cyan-400 font-bold">{hoveredPoint.wavelength.toFixed(3)} µm</div>
            <div>Flux: {hoveredPoint.fluxMJySr.toFixed(2)} ± {hoveredPoint.uncertainty.toFixed(2)} MJy/sr</div>
            <div className="text-slate-400">Model: {hoveredPoint.modelFit.toFixed(2)} MJy/sr</div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
        <Info className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
        <span>
          Deep absorption troughs at 3.05 µm and 4.27 µm indicate abundant solid H₂O and CO₂ ice grains shielding pre-stellar cores from interstellar UV.
        </span>
      </div>
    </div>
  );
};
