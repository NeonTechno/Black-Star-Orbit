/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLACK STAR ORBIT — Infrared Signal Analysis Chart
 * High-performance scientific frequency distribution analysis of SPHEREx light spectra
 * Built with Recharts.
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { SpherexObservation } from '../../types/index.ts';
import { 
  Activity, 
  Sparkles, 
  Waves, 
  BarChart3, 
  HelpCircle, 
  ArrowUpDown, 
  Layers, 
  Zap,
  Sliders,
  Filter
} from 'lucide-react';

interface InfraredSignalAnalysisChartProps {
  observation: SpherexObservation;
  onExplainWithAi?: (contextType: string, payload: Record<string, unknown>) => void;
}

// Speed of light in micron * THz: c = 299.792458
const C_MICRONS_THZ = 299.792458;

// Characteristic infrared absorption/emission lines with exact physical frequencies
const SPECTRAL_LINES_DB = [
  { name: 'CO Ice', lambdaUm: 4.67, freqTHz: 64.2, color: '#fb923c', desc: 'Carbon Monoxide Ice ν₁ stretch' },
  { name: 'CO₂ Ice', lambdaUm: 4.27, freqTHz: 70.2, color: '#f59e0b', desc: 'Carbon Dioxide Ice ν₃ asymmetric stretch' },
  { name: 'CH₃OH Ice', lambdaUm: 3.53, freqTHz: 84.9, color: '#34d399', desc: 'Methanol Ice C-H vibrational mode' },
  { name: 'PAH Organic', lambdaUm: 3.30, freqTHz: 90.8, color: '#c084fc', desc: 'Polycyclic Aromatic Hydrocarbon C-H aromatic stretch' },
  { name: 'H₂O Ice', lambdaUm: 3.05, freqTHz: 98.3, color: '#38bdf8', desc: 'Water Ice fundamental O-H symmetric/asymmetric stretch' },
  { name: 'NH₃ Ice', lambdaUm: 2.96, freqTHz: 101.3, color: '#818cf8', desc: 'Ammonia Ice N-H symmetric inversion stretch' },
  { name: 'Pa-α Line', lambdaUm: 1.875, freqTHz: 159.9, color: '#f43f5e', desc: 'Paschen-alpha Hydrogen Ionization line' },
];

export const InfraredSignalAnalysisChart: React.FC<InfraredSignalAnalysisChartProps> = ({
  observation,
  onExplainWithAi,
}) => {
  const [domainMode, setDomainMode] = useState<'frequency' | 'wavelength'>('frequency');
  const [metricMode, setMetricMode] = useState<'flux' | 'energy' | 'residual'>('flux');
  const [showErrorEnvelope, setShowErrorEnvelope] = useState<boolean>(true);
  const [showSpectralMarkers, setShowSpectralMarkers] = useState<boolean>(true);
  const [activeLineFilter, setActiveLineFilter] = useState<string | null>(null);

  // Process data points and compute frequency distribution
  const chartData = useMemo(() => {
    if (!observation.fullSedCurve || observation.fullSedCurve.length === 0) return [];

    const raw = observation.fullSedCurve.map((pt) => {
      const freqTHz = parseFloat((C_MICRONS_THZ / pt.wavelength).toFixed(2));
      const energyFlux = parseFloat((pt.fluxMJySr * (freqTHz / 100)).toFixed(2));
      const energyFit = parseFloat((pt.modelFit * (freqTHz / 100)).toFixed(2));
      const residualPercent = pt.modelFit > 0
        ? parseFloat((((pt.fluxMJySr - pt.modelFit) / pt.modelFit) * 100).toFixed(2))
        : 0;

      return {
        wavelengthUm: parseFloat(pt.wavelength.toFixed(3)),
        frequencyTHz: freqTHz,
        fluxMJySr: parseFloat(pt.fluxMJySr.toFixed(2)),
        fluxUpper: parseFloat((pt.fluxMJySr + pt.uncertainty).toFixed(2)),
        fluxLower: parseFloat(Math.max(0, pt.fluxMJySr - pt.uncertainty).toFixed(2)),
        uncertainty: parseFloat(pt.uncertainty.toFixed(2)),
        modelFit: parseFloat(pt.modelFit.toFixed(2)),
        energyFlux,
        energyFit,
        residualPercent,
        snr: pt.uncertainty > 0 ? parseFloat((pt.fluxMJySr / pt.uncertainty).toFixed(1)) : 0,
      };
    });

    // Sort by frequency ascending (THz) if frequency domain, or wavelength ascending if wavelength domain
    return domainMode === 'frequency'
      ? raw.sort((a, b) => a.frequencyTHz - b.frequencyTHz)
      : raw.sort((a, b) => a.wavelengthUm - b.wavelengthUm);
  }, [observation.fullSedCurve, domainMode]);

  // Compute summary metrics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    let peakFlux = -Infinity;
    let peakPt = chartData[0];
    let totalFlux = 0;
    let totalSnr = 0;

    chartData.forEach((pt) => {
      if (pt.fluxMJySr > peakFlux) {
        peakFlux = pt.fluxMJySr;
        peakPt = pt;
      }
      totalFlux += pt.fluxMJySr;
      totalSnr += pt.snr;
    });

    const avgSnr = (totalSnr / chartData.length).toFixed(1);
    const minFreq = Math.min(...chartData.map((d) => d.frequencyTHz));
    const maxFreq = Math.max(...chartData.map((d) => d.frequencyTHz));

    return {
      peakFreqTHz: peakPt.frequencyTHz,
      peakWavelengthUm: peakPt.wavelengthUm,
      peakFluxMJySr: peakPt.fluxMJySr,
      avgSnr,
      freqSpan: `${minFreq.toFixed(0)} – ${maxFreq.toFixed(0)} THz`,
      dataPointsCount: chartData.length,
    };
  }, [chartData]);

  const xDataKey = domainMode === 'frequency' ? 'frequencyTHz' : 'wavelengthUm';
  const xUnit = domainMode === 'frequency' ? 'THz' : 'µm';
  const xLabel = domainMode === 'frequency' ? 'Frequency ν (THz)' : 'Wavelength λ (µm)';

  const yDataKey = metricMode === 'flux'
    ? 'fluxMJySr'
    : metricMode === 'energy'
    ? 'energyFlux'
    : 'residualPercent';

  const yModelKey = metricMode === 'flux'
    ? 'modelFit'
    : metricMode === 'energy'
    ? 'energyFit'
    : null;

  const yLabel = metricMode === 'flux'
    ? 'Flux Density (MJy/sr)'
    : metricMode === 'energy'
    ? 'Energy Flux νF_ν (Relative)'
    : 'Absorption Residual (%)';

  return (
    <div className="bg-[#090F24]/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Top Banner & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-950/40">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60 font-semibold">
                Recharts Spectroscopic Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {observation.targetName}
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Infrared Signal Analysis
            </h3>
          </div>
        </div>

        {/* View Mode & Metric Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Frequency vs Wavelength domain toggle */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setDomainMode('frequency')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                domainMode === 'frequency'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Frequency (THz)
            </button>
            <button
              onClick={() => setDomainMode('wavelength')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                domainMode === 'wavelength'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wavelength (µm)
            </button>
          </div>

          {/* Metric toggle */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setMetricMode('flux')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                metricMode === 'flux'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Spectral Flux Density (MJy/sr)"
            >
              Flux (F_ν)
            </button>
            <button
              onClick={() => setMetricMode('energy')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                metricMode === 'energy'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Energy Distribution (νF_ν)"
            >
              Energy (νF_ν)
            </button>
            <button
              onClick={() => setMetricMode('residual')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                metricMode === 'residual'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Absorption Residual percentage"
            >
              Residuals (%)
            </button>
          </div>

          {/* AI Explanation Trigger */}
          {onExplainWithAi && (
            <button
              onClick={() =>
                onExplainWithAi('spherex_spectrum', {
                  targetName: observation.targetName,
                  category: observation.category,
                  domain: domainMode,
                  stats,
                  detectedBands: SPECTRAL_LINES_DB.map((l) => `${l.name} (${l.freqTHz} THz / ${l.lambdaUm} µm)`),
                  sedCurve: observation.fullSedCurve,
                })
              }
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-950/70 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 shadow-sm transition cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Analyze with AI</span>
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Peak Signal Frequency
            </span>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              {stats.peakFreqTHz} <span className="text-xs text-cyan-400 font-normal">THz</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              λ = {stats.peakWavelengthUm} µm
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Peak Spectral Flux
            </span>
            <div className="text-base font-bold text-cyan-300 font-mono mt-0.5">
              {stats.peakFluxMJySr.toFixed(1)} <span className="text-xs text-slate-400 font-normal">MJy/sr</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Observed maximum
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Frequency Bandwidth
            </span>
            <div className="text-base font-bold text-violet-300 font-mono mt-0.5">
              {stats.freqSpan}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {stats.dataPointsCount} spectrophotometric bins
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Mean Astrometric SNR
            </span>
            <div className="text-base font-bold text-emerald-300 font-mono mt-0.5">
              {stats.avgSnr}σ <span className="text-xs text-slate-400 font-normal">Significance</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              Nominal Calibrated
            </span>
          </div>
        </div>
      )}

      {/* Main Recharts Container */}
      <div className="relative w-full h-[320px] sm:h-[360px] bg-slate-950/90 rounded-xl p-2 sm:p-4 border border-slate-800">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 15, bottom: 25 }}
          >
            <defs>
              {/* Electric Cyan Signal Gradient */}
              <linearGradient id="signalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>

              {/* Uncertainty Error Envelope Gradient */}
              <linearGradient id="errorEnvelopeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" opacity={0.6} />

            <XAxis
              dataKey={xDataKey}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              label={{
                value: xLabel,
                position: 'insideBottom',
                offset: -15,
                fill: '#94a3b8',
                fontSize: 11,
                fontFamily: 'Space Grotesk',
              }}
            />

            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              label={{
                value: yLabel,
                angle: -90,
                position: 'insideLeft',
                fill: '#94a3b8',
                fontSize: 11,
                fontFamily: 'Space Grotesk',
              }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const d = payload[0].payload;
                return (
                  <div className="p-3 bg-slate-900/95 border border-cyan-500/50 rounded-xl shadow-2xl text-xs font-mono text-slate-200">
                    <div className="text-cyan-400 font-bold border-b border-white/10 pb-1 mb-1.5 flex items-center justify-between gap-4">
                      <span>ν = {d.frequencyTHz} THz</span>
                      <span className="text-slate-400 font-normal">λ = {d.wavelengthUm} µm</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-white">
                      <span>Flux Density:</span>
                      <strong className="text-amber-400">{d.fluxMJySr} ± {d.uncertainty} MJy/sr</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-slate-400">
                      <span>Model Fit:</span>
                      <span>{d.modelFit} MJy/sr</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-slate-400">
                      <span>Energy (νF_ν):</span>
                      <span>{d.energyFlux}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-emerald-400 pt-1 border-t border-white/10 mt-1">
                      <span>SNR:</span>
                      <span>{d.snr}σ</span>
                    </div>
                  </div>
                );
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
            />

            {/* Uncertainty Error Envelope Area */}
            {showErrorEnvelope && metricMode === 'flux' && (
              <Area
                type="monotone"
                dataKey="fluxUpper"
                stroke="none"
                fill="url(#errorEnvelopeGradient)"
                name="±1σ Error Boundary"
              />
            )}

            {/* Primary Observed Signal Area & Line */}
            <Area
              type="monotone"
              dataKey={yDataKey}
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#signalGradient)"
              name="Observed Infrared Signal"
              dot={{ r: 2.5, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 1 }}
              activeDot={{ r: 5, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
            />

            {/* Theoretical Model Continuum Line */}
            {yModelKey && (
              <Line
                type="monotone"
                dataKey={yModelKey}
                stroke="#c084fc"
                strokeWidth={1.8}
                strokeDasharray="4 3"
                dot={false}
                name="Astrophysical Baseline Model"
              />
            )}

            {/* Characteristic Molecular Spectral Absorption / Emission Reference Lines */}
            {showSpectralMarkers &&
              SPECTRAL_LINES_DB.map((marker) => {
                const markerX = domainMode === 'frequency' ? marker.freqTHz : marker.lambdaUm;
                return (
                  <ReferenceLine
                    key={marker.name}
                    x={markerX}
                    stroke={marker.color}
                    strokeDasharray="3 3"
                    strokeWidth={1.2}
                    label={{
                      value: marker.name,
                      position: 'top',
                      fill: marker.color,
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono',
                      fontWeight: 600,
                    }}
                  />
                );
              })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Spectral Marker Badges and Diagnostic Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" />
            Signatures:
          </span>
          {SPECTRAL_LINES_DB.map((line) => (
            <span
              key={line.name}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/80 border text-[11px] font-mono text-slate-300"
              style={{ borderColor: `${line.color}50` }}
              title={line.desc}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: line.color }} />
              <strong className="text-white">{line.name}</strong>
              <span className="text-slate-400">
                ({domainMode === 'frequency' ? `${line.freqTHz} THz` : `${line.lambdaUm} µm`})
              </span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={showErrorEnvelope}
              onChange={(e) => setShowErrorEnvelope(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Error Envelope</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={showSpectralMarkers}
              onChange={(e) => setShowSpectralMarkers(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Spectral Lines</span>
          </label>
        </div>
      </div>
    </div>
  );
};
