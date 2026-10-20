/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — SPHEREx 102 Spectral Band Selector
 */

import React, { useState } from 'react';
import { SpectralBand } from '../../types/index.ts';
import { SPHEREX_BANDS } from '../../science/spherexEngine.ts';
import { Layers, Sparkles, Filter } from 'lucide-react';

interface BandSelectorProps {
  selectedBandId: number;
  onSelectBand: (band: SpectralBand) => void;
}

export const BandSelector: React.FC<BandSelectorProps> = ({
  selectedBandId,
  onSelectBand,
}) => {
  const [arrayFilter, setArrayFilter] = useState<number | 'all'>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');

  const filteredBands = SPHEREX_BANDS.filter((b) => {
    if (arrayFilter !== 'all' && b.arrayIndex !== arrayFilter) return false;
    if (targetFilter === 'ices' && !b.spectralFeatures.some((f) => f.includes('Ice'))) return false;
    if (targetFilter === 'key' && !b.isKeyLine) return false;
    if (targetFilter === 'galaxy' && !b.scienceTarget.includes('Inflation') && !b.scienceTarget.includes('Galaxy')) return false;
    return true;
  });

  const selectedBand = SPHEREX_BANDS.find((b) => b.bandId === selectedBandId) || SPHEREX_BANDS[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            SPHEREx 102 Spectral Bands
          </h3>
          <span className="text-xs font-mono text-cyan-400/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            0.75 – 5.00 µm
          </span>
        </div>

        {/* Selected band summary tag */}
        <div className="text-xs font-mono text-slate-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-700/60 flex items-center gap-1.5">
          <span className="text-cyan-400 font-semibold">Band #{selectedBand.bandId}</span>
          <span className="text-slate-500">•</span>
          <span>{selectedBand.wavelengthMicrons.toFixed(3)} µm</span>
          <span className="text-slate-500">•</span>
          <span>R ≈ {selectedBand.resolvingPower}</span>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
        <div className="flex items-center gap-1 text-slate-400 mr-1 font-mono">
          <Filter className="h-3.5 w-3.5" />
          <span>FPA Array:</span>
        </div>
        <button
          onClick={() => setArrayFilter('all')}
          className={`px-2 py-1 rounded font-mono transition ${
            arrayFilter === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All (1-6)
        </button>
        {[1, 2, 3, 4, 5, 6].map((arr) => (
          <button
            key={arr}
            onClick={() => setArrayFilter(arr)}
            className={`px-2 py-1 rounded font-mono transition ${
              arrayFilter === arr
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Array {arr}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Quick filters */}
        <div className="flex items-center gap-1 text-slate-400 font-mono">
          <span>Target:</span>
        </div>
        <button
          onClick={() => setTargetFilter('all')}
          className={`px-2 py-1 rounded transition ${
            targetFilter === 'all'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Channels
        </button>
        <button
          onClick={() => setTargetFilter('ices')}
          className={`px-2 py-1 rounded transition flex items-center gap-1 ${
            targetFilter === 'ices'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-3 w-3 text-amber-400" />
          Ices (H2O, CO2, CO)
        </button>
        <button
          onClick={() => setTargetFilter('key')}
          className={`px-2 py-1 rounded transition ${
            targetFilter === 'key'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Key Diagnostic Lines
        </button>
      </div>

      {/* Horizontal scrolling bands strip */}
      <div className="mt-3 overflow-x-auto pb-2 flex gap-1.5 custom-scrollbar">
        {filteredBands.map((band) => {
          const isSelected = band.bandId === selectedBandId;
          return (
            <button
              key={band.bandId}
              onClick={() => onSelectBand(band)}
              className={`flex-shrink-0 px-2.5 py-2 rounded-lg border text-left transition-all relative ${
                isSelected
                  ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              {band.isKeyLine && (
                <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[10px] text-cyan-400 font-semibold">
                  #{band.bandId}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Arr {band.arrayIndex}
                </span>
              </div>
              <div className="font-mono text-xs font-bold text-white mt-0.5">
                {band.wavelengthMicrons.toFixed(2)} µm
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[95px] mt-0.5">
                {band.spectralFeatures[0] || band.scienceTarget.split('/')[0]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
