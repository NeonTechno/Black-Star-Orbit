/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — SPHEREx Observation & FITS Metadata Panel
 */

import React, { useState } from 'react';
import { SpherexObservation } from '../../types/index.ts';
import { FileText, Sparkles, ShieldAlert, Thermometer, Clock, MapPin, Eye, Copy, Check } from 'lucide-react';

interface MetadataPanelProps {
  observation: SpherexObservation;
  onExplainWithAi: () => void;
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({
  observation,
  onExplainWithAi,
}) => {
  const [showFullFits, setShowFullFits] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyFitsText = () => {
    const lines = Object.entries(observation.fitsHeader).map(
      ([k, v]) => `${k.padEnd(8)} = ${String(v).padEnd(20)} / SPHEREx telemetry`
    );
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Observation & FITS Metadata
          </h3>
        </div>
        <button
          onClick={onExplainWithAi}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-950 text-cyan-300 border border-cyan-700/60 hover:bg-cyan-900/50 transition cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Explain with AI</span>
        </button>
      </div>

      {/* Prominent Simulated Data Provenance Notice */}
      <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-3 text-xs text-amber-200/90 flex items-start space-x-2.5">
        <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
            <span>DATA PROVENANCE:</span>
            <span className="bg-amber-900/60 px-1.5 py-0.2 rounded border border-amber-700/50">
              {observation.dataSourceStatus}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-200/80">
            {observation.dataSourceLabel}. All flux units are calibrated to MJy/sr under NASA IPAC IRSA Level-2/3 specifications.
          </p>
        </div>
      </div>

      {/* Target Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <MapPin className="h-3 w-3 text-cyan-400" /> Equat. RA / Dec
          </span>
          <span className="text-white font-semibold mt-1 block">
            {observation.raDeg.toFixed(3)}°, {observation.decDeg.toFixed(3)}°
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <MapPin className="h-3 w-3 text-indigo-400" /> Galactic (l, b)
          </span>
          <span className="text-white font-semibold mt-1 block">
            {observation.glonDeg.toFixed(1)}°, {observation.glatDeg.toFixed(1)}°
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <Clock className="h-3 w-3 text-emerald-400" /> Obs Date (UTC)
          </span>
          <span className="text-white font-semibold mt-1 block truncate">
            {String(observation.fitsHeader['DATE-OBS']).split('T')[0]}
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <Clock className="h-3 w-3 text-purple-400" /> Exposure Time
          </span>
          <span className="text-white font-semibold mt-1 block">
            {observation.fitsHeader['EXPTIME']} seconds
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <Thermometer className="h-3 w-3 text-red-400" /> FPA Temp
          </span>
          <span className="text-white font-semibold mt-1 block">
            {observation.detectorTempK} K (Nominal Cryo)
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <Eye className="h-3 w-3 text-amber-400" /> Pixel Scale
          </span>
          <span className="text-white font-semibold mt-1 block">
            {observation.pixelScaleArcsec}″ / pixel
          </span>
        </div>
      </div>

      {/* Interactive FITS Headers Drawer */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
        <button
          onClick={() => setShowFullFits(!showFullFits)}
          className="w-full px-3 py-2 text-xs font-mono text-slate-300 hover:text-white bg-slate-900/60 flex items-center justify-between transition"
        >
          <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
            <span>[FITS Standard Header]</span>
            <span className="text-slate-500 font-normal">({Object.keys(observation.fitsHeader).length} keywords)</span>
          </span>
          <span className="text-slate-400 text-[11px] underline">
            {showFullFits ? 'Collapse' : 'Expand Header'}
          </span>
        </button>

        {showFullFits && (
          <div className="p-3 border-t border-slate-800 space-y-2">
            <div className="flex justify-end">
              <button
                onClick={copyFitsText}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 transition"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy Header Text'}</span>
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto font-mono text-[11px] bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
              {Object.entries(observation.fitsHeader).map(([key, val]) => (
                <div key={key} className="flex items-baseline justify-between py-0.5 border-b border-slate-900 last:border-0">
                  <span className="text-cyan-400 font-bold">{key.padEnd(8)}</span>
                  <span className="text-emerald-300">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
