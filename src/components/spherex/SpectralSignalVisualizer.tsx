/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLACK STAR ORBIT — SPHEREx Spectral Signal Visualizer
 * High-performance scientific visualization of intensity over infrared wavelengths (0.75 – 5.00 µm)
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
  ReferenceArea,
} from 'recharts';
import {
  Activity,
  Sparkles,
  Waves,
  Droplet,
  Info,
  Maximize2,
  Minimize2,
  ZoomIn,
  Sliders,
  Filter,
  Download,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export interface SpectralDataPoint {
  wavelength: number; // in microns (µm)
  relativeFlux?: number; // 0.0 to 1.5+
  fluxMJySr?: number; // in MJy/sr
  uncertainty?: number;
  modelFit?: number;
}

export interface SpectralSignalVisualizerProps {
  targetName: string;
  category?: string;
  spectralPoints?: SpectralDataPoint[];
  activeWavelength?: number; // currently probed wavelength in SPHEREx viewer
  onSelectWavelength?: (wavelength: number) => void;
  onExplainWithAi?: (contextType: string, payload: Record<string, unknown>) => void;
  isCompact?: boolean;
}

// Speed of light in micron * THz: c = 299.792458
const C_MICRONS_THZ = 299.792458;

// Characteristic SPHEREx infrared spectroscopic features
export const INFRARED_SIGNATURES = [
  {
    name: 'Pa-α Line',
    wavelength: 1.875,
    freqTHz: 159.9,
    color: '#10B981',
    species: 'Ionized Hydrogen',
    transition: 'Paschen-alpha 4 → 3 emission',
    significance: 'Traces massive star formation & photoionized H II boundaries',
  },
  {
    name: 'H₂ Shock',
    wavelength: 2.122,
    freqTHz: 141.3,
    color: '#06B6D4',
    species: 'Molecular Hydrogen (H₂)',
    transition: 'v=1-0 S(1) vibrational shock',
    significance: 'Supersonic protostellar outflows & collision fronts',
  },
  {
    name: 'H₂O Ice',
    wavelength: 3.05,
    freqTHz: 98.3,
    color: '#38BDF8',
    species: 'Water Ice (Amorphous Solid H₂O)',
    transition: 'O–H fundamental symmetric/asymmetric stretch',
    significance: 'Cold molecular cloud cores (T < 40 K) and protoplanetary snow lines',
  },
  {
    name: 'PAH Organic',
    wavelength: 3.30,
    freqTHz: 90.8,
    color: '#C084FC',
    species: 'Polycyclic Aromatic Hydrocarbons',
    transition: 'Aromatic C–H stretching vibrational mode',
    significance: 'Prebiotic carbonaceous dust irradiated by stellar UV',
  },
  {
    name: 'Methanol Ice',
    wavelength: 3.53,
    freqTHz: 84.9,
    color: '#2DD4BF',
    species: 'Methanol (CH₃OH) Ice',
    transition: 'C–H stretching mode in interstellar mantles',
    significance: 'Key complex organic molecule precursor to amino acids',
  },
  {
    name: 'Br-α Line',
    wavelength: 4.052,
    freqTHz: 74.0,
    color: '#F43F5E',
    species: 'Brackett-alpha Line',
    transition: 'Hydrogen n=5 → 4 recombination',
    significance: 'Deeply embedded protostellar accretion tracers',
  },
  {
    name: 'CO₂ Ice',
    wavelength: 4.27,
    freqTHz: 70.2,
    color: '#F5C451',
    species: 'Carbon Dioxide (CO₂) Ice',
    transition: 'ν₃ asymmetric C=O stretch',
    significance: 'Abundant interstellar ice grain mantles & planetary atmospheres',
  },
  {
    name: 'CO Ice',
    wavelength: 4.67,
    freqTHz: 64.2,
    color: '#FB923C',
    species: 'Carbon Monoxide (CO) Ice',
    transition: 'C≡O fundamental stretch (pure & mixed matrices)',
    significance: 'Extremely volatile ice; marks ultra-cold (<20 K) pre-stellar cores',
  },
];

// SPHEREx 6 Detector Arrays according to Caltech/JPL design
const SPHEREX_DETECTOR_ARRAYS = [
  { id: 1, name: 'Array 1', minW: 0.75, maxW: 1.12, R: 'R ~ 41', color: 'rgba(56, 189, 248, 0.05)' },
  { id: 2, name: 'Array 2', minW: 1.12, maxW: 1.68, R: 'R ~ 41', color: 'rgba(99, 102, 241, 0.05)' },
  { id: 3, name: 'Array 3', minW: 1.68, maxW: 2.42, R: 'R ~ 41', color: 'rgba(168, 85, 247, 0.05)' },
  { id: 4, name: 'Array 4', minW: 2.42, maxW: 3.82, R: 'R ~ 35-41', color: 'rgba(56, 189, 248, 0.05)' },
  { id: 5, name: 'Array 5', minW: 3.82, maxW: 4.42, R: 'R ~ 120', color: 'rgba(245, 196, 81, 0.05)' },
  { id: 6, name: 'Array 6', minW: 4.42, maxW: 5.00, R: 'R ~ 130', color: 'rgba(251, 146, 60, 0.05)' },
];

export const SpectralSignalVisualizer: React.FC<SpectralSignalVisualizerProps> = ({
  targetName,
  category = 'Deep Space Target',
  spectralPoints,
  activeWavelength = 3.05,
  onSelectWavelength,
  onExplainWithAi,
  isCompact = false,
}) => {
  // Intensity metric representation mode
  const [metricMode, setMetricMode] = useState<'flux' | 'normalized' | 'depth'>('flux');
  const [showSignatures, setShowSignatures] = useState<boolean>(true);
  const [showArrays, setShowArrays] = useState<boolean>(false);
  const [showErrorEnvelope, setShowErrorEnvelope] = useState<boolean>(true);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(!isCompact);

  // Generate continuous 102-band SPHEREx signal dataset
  const chartData = useMemo(() => {
    // 102 synthetic/calibrated SPHEREx wavelengths from 0.75 to 5.00 µm
    const TOTAL_BANDS = 102;
    const minW = 0.75;
    const maxW = 5.00;
    const deltaW = (maxW - minW) / (TOTAL_BANDS - 1);

    // If explicit spectral points provided, build an interpolation map
    const refPoints = spectralPoints && spectralPoints.length > 0 ? spectralPoints : [];

    const getInterpolatedValue = (w: number) => {
      if (refPoints.length === 0) {
        // Realistic astronomical dust & ice continuum model
        const continuum = 1.05 * Math.pow(w / 2.0, -0.65) + 0.15;
        // Water ice dip at 3.05
        const iceDip = 0.55 * Math.exp(-Math.pow((w - 3.05) / 0.18, 2));
        // CO2 ice dip at 4.27
        const co2Dip = 0.40 * Math.exp(-Math.pow((w - 4.27) / 0.08, 2));
        // CO ice dip at 4.67
        const coDip = 0.28 * Math.exp(-Math.pow((w - 4.67) / 0.07, 2));
        // PAH emission peak at 3.30
        const pahPeak = 0.35 * Math.exp(-Math.pow((w - 3.30) / 0.06, 2));
        // Pa-alpha emission peak at 1.875
        const paAlphaPeak = 0.25 * Math.exp(-Math.pow((w - 1.875) / 0.04, 2));

        return Math.max(0.12, continuum - iceDip - co2Dip - coDip + pahPeak + paAlphaPeak);
      }

      // Linear interpolation between provided points
      if (w <= refPoints[0].wavelength) {
        return refPoints[0].fluxMJySr ?? refPoints[0].relativeFlux ?? 1.0;
      }
      if (w >= refPoints[refPoints.length - 1].wavelength) {
        const last = refPoints[refPoints.length - 1];
        return last.fluxMJySr ?? last.relativeFlux ?? 0.8;
      }

      for (let i = 0; i < refPoints.length - 1; i++) {
        const p1 = refPoints[i];
        const p2 = refPoints[i + 1];
        if (w >= p1.wavelength && w <= p2.wavelength) {
          const t = (w - p1.wavelength) / (p2.wavelength - p1.wavelength);
          const v1 = p1.fluxMJySr ?? p1.relativeFlux ?? 1.0;
          const v2 = p2.fluxMJySr ?? p2.relativeFlux ?? 1.0;
          return v1 + t * (v2 - v1);
        }
      }
      return 1.0;
    };

    // Calculate maximum flux for normalization
    const baseFluxes = [];
    for (let i = 0; i < TOTAL_BANDS; i++) {
      const w = minW + i * deltaW;
      baseFluxes.push(getInterpolatedValue(w));
    }
    const maxFlux = Math.max(...baseFluxes, 0.001);

    const data = [];
    for (let i = 0; i < TOTAL_BANDS; i++) {
      const w = parseFloat((minW + i * deltaW).toFixed(3));
      const freqTHz = parseFloat((C_MICRONS_THZ / w).toFixed(2));
      const rawFlux = getInterpolatedValue(w);

      // Scale to realistic surface brightness (MJy/sr)
      const fluxMJySr = parseFloat((rawFlux * 18.5).toFixed(2));
      const continuumModel = parseFloat((18.5 * (1.1 * Math.pow(w / 2.0, -0.6) + 0.18)).toFixed(2));
      const normalizedIntensity = parseFloat((rawFlux / (maxFlux || 1)).toFixed(3));
      
      // Optical depth: tau = -ln(flux / continuum)
      const opticalDepth = parseFloat(Math.max(0, -Math.log(Math.max(0.05, fluxMJySr / continuumModel))).toFixed(3));

      // Realistic instrument noise envelope (R = 41 to 130)
      const noise = parseFloat((0.45 + (w > 3.8 ? 0.25 : 0.15) * Math.sin(w * 14)).toFixed(2));
      const upperIntensity = parseFloat((fluxMJySr + noise).toFixed(2));
      const lowerIntensity = parseFloat(Math.max(0, fluxMJySr - noise).toFixed(2));

      // Check nearest spectroscopic marker
      const matchedSignature = INFRARED_SIGNATURES.find(
        (sig) => Math.abs(sig.wavelength - w) <= deltaW * 0.95
      );

      data.push({
        channel: i + 1,
        wavelengthUm: w,
        freqTHz,
        fluxMJySr,
        continuumModel,
        normalizedIntensity,
        opticalDepth,
        upperIntensity,
        lowerIntensity,
        uncertainty: noise,
        snr: parseFloat((fluxMJySr / noise).toFixed(1)),
        signature: matchedSignature?.name || null,
        species: matchedSignature?.species || null,
        significance: matchedSignature?.significance || null,
      });
    }

    return data;
  }, [spectralPoints]);

  // Active point stats
  const activePoint = useMemo(() => {
    return chartData.reduce((prev, curr) => {
      return Math.abs(curr.wavelengthUm - activeWavelength) < Math.abs(prev.wavelengthUm - activeWavelength)
        ? curr
        : prev;
    }, chartData[0]);
  }, [chartData, activeWavelength]);

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = 'Channel,Wavelength_um,Frequency_THz,Flux_MJy_sr,Continuum_Model,Normalized_Intensity,Optical_Depth,Uncertainty_MJy_sr\n';
    const rows = chartData
      .map(
        (d) =>
          `${d.channel},${d.wavelengthUm},${d.freqTHz},${d.fluxMJySr},${d.continuumModel},${d.normalizedIntensity},${d.opticalDepth},${d.uncertainty}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SPHEREx_Spectrum_${targetName.replace(/\s+/g, '_')}_102Bands.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl bg-[#0B1630] border border-cyan-500/30 overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6 text-[#F8FAFC]">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#1E293B] gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-nasa text-sm sm:text-base font-bold tracking-wider text-white">
                  SPECTRAL SIGNAL VISUALIZER
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  102 INFRARED BANDS
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] font-sans">
                Surface Brightness Intensity Over Infrared Wavelengths (0.75 – 5.00 µm) •{' '}
                <strong className="text-cyan-200">{targetName}</strong> ({category})
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & AI Explain */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Selector Tabs */}
          <div className="flex items-center bg-[#050B1A] p-1 rounded-xl border border-[#1E293B] text-xs font-mono">
            <button
              onClick={() => setMetricMode('flux')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricMode === 'flux'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-xs'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Calibrated Surface Brightness Intensity in MJy/sr"
            >
              Flux (MJy/sr)
            </button>
            <button
              onClick={() => setMetricMode('normalized')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricMode === 'normalized'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-xs'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Relative Normalized Intensity (I / I_peak)"
            >
              Normalized
            </button>
            <button
              onClick={() => setMetricMode('depth')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricMode === 'depth'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50 font-bold shadow-xs'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Ice Absorption Optical Depth: tau = -ln(I / I_cont)"
            >
              Optical Depth (τ)
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#050B1A] hover:bg-[#112248] border border-[#1E293B] hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Download Spectral Intensity Data Table (102 Bands CSV)"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* AI Explanation Button */}
          {onExplainWithAi && (
            <button
              onClick={() =>
                onExplainWithAi('spherex_spectral_signal', {
                  targetName,
                  category,
                  activeWavelength,
                  activePoint,
                  keyIceLines: ['H2O Ice 3.05µm', 'CO2 Ice 4.27µm', 'CO Ice 4.67µm'],
                  metricMode,
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition shadow-md shadow-cyan-950/40 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Spectral Intel</span>
            </button>
          )}

          {/* Toggle Expand / Compact */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-[#050B1A] hover:bg-[#112248] border border-[#1E293B] text-slate-300 hover:text-white transition cursor-pointer"
            title={isExpanded ? 'Collapse Graph Height' : 'Expand Full Graph Height'}
            aria-label="Toggle graph size"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Characteristic Spectroscopic Feature Badges / Quick-Tune Chips */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs font-mono">
        <span className="text-[#64748B] flex items-center gap-1 mr-1 text-[11px]">
          <Filter className="w-3 h-3 text-cyan-400" />
          Jump to Tracer:
        </span>
        {INFRARED_SIGNATURES.map((sig) => {
          const isActive = Math.abs(activeWavelength - sig.wavelength) <= 0.05;
          return (
            <button
              key={sig.name}
              onClick={() => {
                setSelectedFeature(sig.name);
                if (onSelectWavelength) {
                  onSelectWavelength(sig.wavelength);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-950/80 text-cyan-200 border-cyan-400 font-bold shadow-[0_0_10px_rgba(56,189,248,0.35)]'
                  : 'bg-[#050B1A]/80 text-[#94A3B8] border-[#1E293B] hover:text-white hover:border-[#38BDF8]/40'
              }`}
              title={`${sig.species} (${sig.wavelength} µm) — ${sig.significance}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sig.color }} />
              <span>{sig.name}</span>
              <span className="text-[10px] opacity-75">{sig.wavelength.toFixed(2)}µm</span>
            </button>
          );
        })}
      </div>

      {/* Main Recharts Spectral Graph */}
      <div className={`relative w-full ${isExpanded ? 'h-72 sm:h-96' : 'h-52 sm:h-64'} bg-[#050B1A] rounded-xl border border-[#1E293B] p-2 sm:p-4 transition-all duration-300`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 18, right: 20, left: 10, bottom: 25 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                const point = state.activePayload[0].payload as (typeof chartData)[0];
                if (point && onSelectWavelength) {
                  onSelectWavelength(point.wavelengthUm);
                }
              }
            }}
          >
            <defs>
              {/* Electric Cyan Signal Glow Gradient */}
              <linearGradient id="spectralCyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                <stop offset="60%" stopColor="#818CF8" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#050B1A" stopOpacity={0.0} />
              </linearGradient>

              {/* Optical Depth Gradient */}
              <linearGradient id="depthVioletGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C084FC" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#050B1A" stopOpacity={0.0} />
              </linearGradient>

              {/* Error Envelope Gradient */}
              <linearGradient id="errorEnvelopeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {/* Subtle Scientific Coordinate Grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={true} horizontal={true} />

            {/* X-Axis: Infrared Wavelength (µm) */}
            <XAxis
              dataKey="wavelengthUm"
              type="number"
              domain={[0.75, 5.0]}
              ticks={[0.75, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]}
              stroke="#64748B"
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
              label={{
                value: 'Infrared Wavelength λ (µm) — SPHEREx Passband Range',
                position: 'bottom',
                offset: 8,
                fill: '#A7B4CC',
                fontSize: 11,
                fontFamily: 'monospace',
              }}
            />

            {/* Y-Axis: Intensity depending on metricMode */}
            <YAxis
              stroke="#64748B"
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
              domain={
                metricMode === 'flux'
                  ? [0, 'dataMax + 4']
                  : metricMode === 'normalized'
                  ? [0, 1.15]
                  : [0, 'dataMax + 0.3']
              }
              label={{
                value:
                  metricMode === 'flux'
                    ? 'Spectral Intensity (MJy / sr)'
                    : metricMode === 'normalized'
                    ? 'Normalized Relative Intensity (I / I_max)'
                    : 'Absorption Optical Depth (τ)',
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fill: '#A7B4CC',
                fontSize: 11,
                fontFamily: 'monospace',
              }}
            />

            {/* Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as (typeof chartData)[0];
                  return (
                    <div className="p-3.5 rounded-xl bg-[#030712]/95 border border-cyan-500/50 backdrop-blur-md shadow-2xl space-y-1.5 text-xs font-mono text-white min-w-56">
                      <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5">
                        <span className="text-cyan-400 font-bold">SPHEREx Channel #{data.channel}</span>
                        <span className="text-[10px] text-[#A7B4CC]">{data.freqTHz} THz</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#94A3B8]">Wavelength:</span>
                        <span className="text-white font-bold">{data.wavelengthUm} µm</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#94A3B8]">Intensity:</span>
                        <span className="text-cyan-300 font-bold">{data.fluxMJySr} MJy/sr</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#94A3B8]">Continuum Model:</span>
                        <span className="text-[#C084FC]">{data.continuumModel} MJy/sr</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#94A3B8]">Optical Depth:</span>
                        <span className="text-amber-400">τ = {data.opticalDepth}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#94A3B8]">SNR:</span>
                        <span className="text-emerald-400">{data.snr}σ</span>
                      </div>
                      {data.signature && (
                        <div className="mt-1 pt-1.5 border-t border-[#1E293B] text-[10px] space-y-0.5">
                          <span className="text-amber-300 font-bold block">✨ {data.signature}</span>
                          <span className="text-[#A7B4CC] block">{data.species}</span>
                          <span className="text-slate-400 text-[9px] block italic">{data.significance}</span>
                        </div>
                      )}
                      <div className="pt-1 text-[9px] text-cyan-400/80">Click point to tune SPHEREx viewer to this band</div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Optional 6 SPHEREx Detector Array Bands */}
            {showArrays &&
              SPHEREX_DETECTOR_ARRAYS.map((arr) => (
                <ReferenceArea
                  key={arr.id}
                  x1={arr.minW}
                  x2={arr.maxW}
                  fill={arr.color}
                  stroke="#1E293B"
                  strokeOpacity={0.3}
                />
              ))}

            {/* Key Spectroscopic Reference Lines */}
            {showSignatures &&
              INFRARED_SIGNATURES.map((sig) => (
                <ReferenceLine
                  key={sig.name}
                  x={sig.wavelength}
                  stroke={sig.color}
                  strokeDasharray="3 3"
                  strokeWidth={1.2}
                  opacity={0.8}
                  label={{
                    value: sig.name,
                    position: 'top',
                    fill: sig.color,
                    fontSize: 9,
                    fontFamily: 'monospace',
                  }}
                />
              ))}

            {/* Currently Active Probed Wavelength (Gold Indicator) */}
            <ReferenceLine
              x={activeWavelength}
              stroke="#F5C451"
              strokeWidth={2}
              label={{
                value: `PROBE: ${activeWavelength.toFixed(2)}µm`,
                position: 'insideTopRight',
                fill: '#F5C451',
                fontSize: 10,
                fontWeight: 'bold',
                fontFamily: 'monospace',
              }}
            />

            {/* Error envelope area */}
            {showErrorEnvelope && metricMode === 'flux' && (
              <Area
                type="monotone"
                dataKey="upperIntensity"
                stroke="none"
                fill="url(#errorEnvelopeGrad)"
                name="Error Margin (1σ)"
              />
            )}

            {/* Main Signal Area / Curve */}
            {metricMode === 'depth' ? (
              <Area
                type="monotone"
                dataKey="opticalDepth"
                stroke="#C084FC"
                strokeWidth={2.5}
                fill="url(#depthVioletGrad)"
                name="Optical Depth τ"
                dot={false}
                activeDot={{ r: 5, fill: '#C084FC', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            ) : metricMode === 'normalized' ? (
              <Area
                type="monotone"
                dataKey="normalizedIntensity"
                stroke="#38BDF8"
                strokeWidth={2.5}
                fill="url(#spectralCyanGrad)"
                name="Normalized Intensity"
                dot={false}
                activeDot={{ r: 5, fill: '#38BDF8', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            ) : (
              <>
                {/* Continuum Model Line */}
                <Line
                  type="monotone"
                  dataKey="continuumModel"
                  stroke="#8B5CF6"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Stellar Continuum Fit"
                  opacity={0.7}
                />

                {/* Primary Measured Flux Area */}
                <Area
                  type="monotone"
                  dataKey="fluxMJySr"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  fill="url(#spectralCyanGrad)"
                  name="SPHEREx Measured Intensity"
                  dot={false}
                  activeDot={{ r: 6, fill: '#38BDF8', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </>
            )}

            {/* Active Probed Dot */}
            <ReferenceDot
              x={activePoint.wavelengthUm}
              y={
                metricMode === 'depth'
                  ? activePoint.opticalDepth
                  : metricMode === 'normalized'
                  ? activePoint.normalizedIntensity
                  : activePoint.fluxMJySr
              }
              r={6}
              fill="#F5C451"
              stroke="#050B1A"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Telemetry & Active Observation Readout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-0.5">
          <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">Probed Wavelength</span>
          <span className="text-sm font-mono font-bold text-white flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            {activePoint.wavelengthUm.toFixed(2)} µm
          </span>
          <span className="text-[10px] font-mono text-[#64748B] block">{activePoint.freqTHz} THz</span>
        </div>

        <div className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-0.5">
          <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">Signal Intensity</span>
          <span className="text-sm font-mono font-bold text-cyan-300">
            {activePoint.fluxMJySr.toFixed(2)} <span className="text-xs text-[#94A3B8]">MJy/sr</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400 block">SNR: {activePoint.snr}σ</span>
        </div>

        <div className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-0.5">
          <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">Absorption Feature</span>
          <span className="text-xs font-mono font-bold text-amber-300 truncate block">
            {activePoint.signature || 'Continuum Transmission'}
          </span>
          <span className="text-[10px] font-mono text-[#64748B] truncate block">
            {activePoint.species || 'Unattenuated dust emission'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-0.5">
          <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">Optical Depth (τ)</span>
          <span className="text-sm font-mono font-bold text-violet-300">
            τ = {activePoint.opticalDepth.toFixed(3)}
          </span>
          <span className="text-[10px] font-mono text-slate-400 block">
            {activePoint.opticalDepth > 0.35 ? 'Strong Ice Trough' : 'Clear Window'}
          </span>
        </div>
      </div>

      {/* Layer Toggles & Scientific Reference Note */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1E293B] text-xs font-mono text-[#94A3B8]">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
            <input
              type="checkbox"
              checked={showSignatures}
              onChange={(e) => setShowSignatures(e.target.checked)}
              className="rounded bg-[#050B1A] border-[#1E293B] text-cyan-500 focus:ring-0"
            />
            <span>Spectral Lines (H₂O, CO₂, CO, PAH)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
            <input
              type="checkbox"
              checked={showArrays}
              onChange={(e) => setShowArrays(e.target.checked)}
              className="rounded bg-[#050B1A] border-[#1E293B] text-cyan-500 focus:ring-0"
            />
            <span>6 SPHEREx Detector Arrays</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
            <input
              type="checkbox"
              checked={showErrorEnvelope}
              onChange={(e) => setShowErrorEnvelope(e.target.checked)}
              className="rounded bg-[#050B1A] border-[#1E293B] text-cyan-500 focus:ring-0"
            />
            <span>1σ Uncertainty Envelope</span>
          </label>
        </div>

        <span className="text-[11px] text-cyan-400/90 font-mono">
          R ~ 41 to 130 Spectrophotometric Resolution
        </span>
      </div>
    </div>
  );
};
