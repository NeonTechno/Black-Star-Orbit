/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — Astronomical Map High-Resolution Download Modal
 * Allows researchers to customize resolution, astrometric grid annotations,
 * photometric colorbars, and scientific telemetry before exporting PNG.
 */

import React, { useState } from 'react';
import {
  Download,
  X,
  Sliders,
  Check,
  Compass,
  FileImage,
  Info,
  Layers,
  Sparkles,
  Maximize,
  Grid,
  Crosshair,
} from 'lucide-react';
import {
  SpherexObservation,
  SpectralBand,
  StretchMode,
  ColorMap,
} from '../../types/index.ts';
import { exportHighResAstronomicalMap, ExportMapOptions } from '../../science/spherexExport.ts';

interface DownloadViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  observation: SpherexObservation;
  band: SpectralBand;
  stretch: StretchMode;
  cmap: ColorMap;
  showGrid: boolean;
  showCrosshair: boolean;
  selectedCoord: { x: number; y: number } | null;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  onNotification?: (msg: string) => void;
}

export const DownloadViewModal: React.FC<DownloadViewModalProps> = ({
  isOpen,
  onClose,
  observation,
  band,
  stretch,
  cmap,
  showGrid: initialShowGrid,
  showCrosshair: initialShowCrosshair,
  selectedCoord,
  zoomLevel,
  panOffset,
  onNotification,
}) => {
  const [resolution, setResolution] = useState<1024 | 2048 | 4096>(2048);
  const [includeBanner, setIncludeBanner] = useState<boolean>(true);
  const [includeColorbar, setIncludeColorbar] = useState<boolean>(true);
  const [includeCompass, setIncludeCompass] = useState<boolean>(true);
  const [includeGrid, setIncludeGrid] = useState<boolean>(initialShowGrid);
  const [includeCrosshair, setIncludeCrosshair] = useState<boolean>(initialShowCrosshair);
  const [includeTileGrid, setIncludeTileGrid] = useState<boolean>(true);
  const [cropToViewport, setCropToViewport] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeFrame = observation.epochs[0];

  const handleExport = async () => {
    if (!activeFrame) return;
    setIsExporting(true);
    setExportSuccess(null);

    try {
      const options: ExportMapOptions = {
        resolution,
        stretch,
        cmap,
        showGrid: includeGrid,
        showCrosshair: includeCrosshair,
        includeTileGrid,
        selectedCoord,
        includeMetadataBanner: includeBanner,
        includeColorbar,
        includeCompass,
        cropToViewport: cropToViewport && zoomLevel > 1,
        zoomLevel,
        panOffset,
        canvasDisplayWidth: 520,
        canvasDisplayHeight: 520,
      };

      const filename = await exportHighResAstronomicalMap(
        activeFrame,
        observation,
        band,
        options
      );

      setExportSuccess(filename);
      if (onNotification) {
        onNotification(`Downloaded high-res PNG: ${filename}`);
      }

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to export map:', err);
      setIsExporting(false);
    }
  };

  const estFileSize =
    resolution === 4096 ? '~14-22 MB' : resolution === 2048 ? '~4-7 MB' : '~1-2 MB';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative space-y-5 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close export dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-700/50 text-cyan-400 shrink-0">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Export High-Resolution Astronomical Map</span>
              <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                PNG 32-Bit
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Generate publication-quality infrared celestial maps with WCS coordinates, photometric calibration, and observation metadata.
            </p>
          </div>
        </div>

        {/* Target & Frame Summary */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div>
            <span className="text-slate-500 text-[10px] uppercase block">Target</span>
            <span className="font-semibold text-slate-200 truncate block">{observation.targetName}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block">Channel</span>
            <span className="text-cyan-300 font-semibold">{band.wavelengthMicrons.toFixed(2)} µm (Arr {band.arrayIndex})</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block">Stretch & Colormap</span>
            <span className="text-purple-300 capitalize">{stretch} • {cmap}</span>
          </div>
        </div>

        {/* Configuration Options */}
        <div className="space-y-4">
          {/* Resolution Selector */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Export Resolution & Quality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { res: 1024, label: '1024 × 1024', tag: 'Standard (1K)', time: 'Fast' },
                { res: 2048, label: '2048 × 2048', tag: 'FITS Scale (2K)', time: 'Recommended' },
                { res: 4096, label: '4096 × 4096', tag: 'Ultra HD (4K)', time: 'Publication' },
              ].map((item) => (
                <button
                  key={item.res}
                  type="button"
                  onClick={() => setResolution(item.res as 1024 | 2048 | 4096)}
                  className={`p-2.5 rounded-xl border text-left font-mono transition ${
                    resolution === item.res
                      ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.label}</span>
                    {resolution === item.res && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                  </div>
                  <span className="text-[10px] text-cyan-300/80 block mt-0.5">{item.tag}</span>
                  <span className="text-[9px] text-slate-500 block">{item.time}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              Estimated file size: <span className="text-slate-300">{estFileSize}</span>
            </p>
          </div>

          {/* Overlays & Inclusions */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Scientific Overlays & Frame Composition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {/* Metadata Banner */}
              <label className="flex items-center space-x-2.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeBanner}
                  onChange={(e) => setIncludeBanner(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <div>
                  <span className="text-slate-200 block font-semibold">Research Header & Footer</span>
                  <span className="text-[10px] text-slate-400 block">Mission banner, target coordinates, timestamp</span>
                </div>
              </label>

              {/* Photometric Colorbar */}
              <label className="flex items-center space-x-2.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeColorbar}
                  disabled={!includeBanner}
                  onChange={(e) => setIncludeColorbar(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 disabled:opacity-40"
                />
                <div>
                  <span className={`block font-semibold ${includeBanner ? 'text-slate-200' : 'text-slate-500'}`}>
                    Calibrated Colorbar Scale
                  </span>
                  <span className="text-[10px] text-slate-400 block">Flux scale [0 - 30 MJy/sr] legend</span>
                </div>
              </label>

              {/* Coordinate Grid */}
              <label className="flex items-center space-x-2.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeGrid}
                  onChange={(e) => setIncludeGrid(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <div>
                  <span className="text-slate-200 block font-semibold">WCS Coordinate Grid</span>
                  <span className="text-[10px] text-slate-400 block">Dashed reticle with RA/Dec axis degrees</span>
                </div>
              </label>

              {/* SPHEREx Survey Tile Grid */}
              <label className="flex items-center space-x-2.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeTileGrid}
                  onChange={(e) => setIncludeTileGrid(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <div>
                  <span className="text-slate-200 block font-semibold">SPHEREx Survey Tile Grid</span>
                  <span className="text-[10px] text-slate-400 block">4×4 Level-2 tile footprint & science highlights</span>
                </div>
              </label>

              {/* Cardinal Compass */}
              <label className="flex items-center space-x-2.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeCompass}
                  onChange={(e) => setIncludeCompass(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <div>
                  <span className="text-slate-200 block font-semibold">Cardinal Compass & FOV Scale</span>
                  <span className="text-[10px] text-slate-400 block">North/East indicators and arcmin bar</span>
                </div>
              </label>

              {/* Aperture Reticle */}
              <label className="flex items-center space-x-2.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeCrosshair}
                  onChange={(e) => setIncludeCrosshair(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <div>
                  <span className="text-slate-200 block font-semibold">Aperture Target Crosshair</span>
                  <span className="text-[10px] text-slate-400 block">Reticle on selected candidate coordinate</span>
                </div>
              </label>

              {/* Viewport Crop */}
              <label className={`flex items-center space-x-2.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer select-none ${zoomLevel <= 1 ? 'opacity-60' : ''}`}>
                <input
                  type="checkbox"
                  checked={cropToViewport && zoomLevel > 1}
                  disabled={zoomLevel <= 1}
                  onChange={(e) => setCropToViewport(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <div>
                  <span className="text-slate-200 block font-semibold">
                    Crop to Active Zoom View {zoomLevel > 1 ? `(${zoomLevel.toFixed(2)}x)` : '(Zoom at 1x)'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {zoomLevel > 1 ? 'Export currently zoomed/panned section' : 'Zoom into map to enable crop'}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-[11px] font-mono text-slate-400">
            {exportSuccess ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                <span>Exported {exportSuccess}</span>
              </span>
            ) : (
              <span>Format: PNG (Lossless 24-bit RGB + Alpha)</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-900/40 transition disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating {resolution}px PNG...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="h-4 w-4 text-white" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download High-Res PNG</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
