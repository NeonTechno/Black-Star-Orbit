/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — Master SPHEREx Interactive Astronomical Viewer
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  SpherexObservation,
  StretchMode,
  ColorMap,
  SpectralBand,
  TransientCandidate,
} from '../../types/index.ts';
import { renderObservationToCanvas, SPHEREX_BANDS } from '../../science/spherexEngine.ts';
import { BandSelector } from './BandSelector.tsx';
import { MetadataPanel } from './MetadataPanel.tsx';
import { ComparisonView } from './ComparisonView.tsx';
import { TimelapseViewer } from './TimelapseViewer.tsx';
import { DifferenceOverlay } from './DifferenceOverlay.tsx';
import { SpectralPlot } from './SpectralPlot.tsx';
import { InfraredSignalAnalysisChart } from './InfraredSignalAnalysisChart.tsx';
import { SpectralSignalVisualizer } from './SpectralSignalVisualizer.tsx';
import {
  computeSpherexSurveyTiles,
  findTileAtCoord,
  SpherexSurveyTile,
} from '../../science/spherexSurveyTiles.ts';
import {
  CoordinateGridOverlay,
  SurveyTileControlPanel,
} from './CoordinateGridOverlay.tsx';
import {
  Telescope,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Crosshair,
  Palette,
  Sliders,
  SplitSquareVertical,
  Film,
  AlertCircle,
  Activity,
  Layers,
  RefreshCw,
  HelpCircle,
  Eye,
  Download,
  ChevronDown,
  Check,
  Waves,
  Grid3X3,
  Target,
} from 'lucide-react';
import { exportHighResAstronomicalMap, exportGenericCanvasPNG } from '../../science/spherexExport.ts';
import { DownloadViewModal } from './DownloadViewModal.tsx';

interface SpherexViewerProps {
  observations: SpherexObservation[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onExplainWithAi: (contextType: string, payload: Record<string, unknown>, prompt?: string) => void;
}

export const SpherexViewer: React.FC<SpherexViewerProps> = ({
  observations,
  isLoading,
  error,
  onRetry,
  onExplainWithAi,
}) => {
  // Active target & frame state
  const [selectedObsId, setSelectedObsId] = useState<string>(observations[0]?.id || '');
  const [selectedBandId, setSelectedBandId] = useState<number>(SPHEREX_BANDS[54]?.bandId || 55); // 3.05 µm H2O ice band default
  const [activeTab, setActiveTab] = useState<'single' | 'signal-analysis' | 'compare' | 'timelapse' | 'difference' | 'sed'>('single');

  // Visualization parameters
  const [stretch, setStretch] = useState<StretchMode>('asinh');
  const [cmap, setCmap] = useState<ColorMap>('inferno');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showCrosshair, setShowCrosshair] = useState<boolean>(true);
  const [showTileGrid, setShowTileGrid] = useState<boolean>(true);
  const [showTileLabels, setShowTileLabels] = useState<boolean>(true);
  const [highlightFilter, setHighlightFilter] = useState<'all' | 'targets' | 'protostars' | 'calibration'>('all');
  const [selectedTile, setSelectedTile] = useState<SpherexSurveyTile | null>(null);
  const [hoveredTile, setHoveredTile] = useState<SpherexSurveyTile | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hover coordinate & flux readout
  const [cursorInfo, setCursorInfo] = useState<{
    ra: number;
    dec: number;
    flux: number;
    pixelX: number;
    pixelY: number;
  } | null>(null);

  const [selectedCoord, setSelectedCoord] = useState<{ x: number; y: number } | null>({
    x: 0.51,
    y: 0.52,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active observation & active frame
  const activeObs = observations.find((o) => o.id === selectedObsId) || observations[0];
  const activeFrame = activeObs?.epochs[0];
  const compareFrame = activeObs?.epochs[1] || activeObs?.epochs[0];

  // Compute 16 SPHEREx survey tiles across observation footprint
  const surveyTiles = React.useMemo(() => {
    if (!activeObs || !activeFrame) return [];
    return computeSpherexSurveyTiles(activeObs, activeFrame);
  }, [activeObs, activeFrame]);

  // Set default selected tile to primary target tile or center tile
  useEffect(() => {
    if (surveyTiles.length > 0) {
      const targetTile =
        surveyTiles.find((t) => t.status === 'TARGET_PRIMARY') ||
        surveyTiles.find((t) => t.isTargetInterest) ||
        surveyTiles[5] ||
        surveyTiles[0];
      setSelectedTile((prev) => {
        if (prev && surveyTiles.some((t) => t.tileId === prev.tileId)) {
          return surveyTiles.find((t) => t.tileId === prev.tileId) || targetTile;
        }
        return targetTile;
      });
    }
  }, [surveyTiles]);

  const handleSelectTile = (tile: SpherexSurveyTile) => {
    setSelectedTile(tile);
    setSelectedCoord(tile.centerNorm);
  };

  const handleCenterOnTile = (tile: SpherexSurveyTile) => {
    setSelectedTile(tile);
    setSelectedCoord(tile.centerNorm);
    if (zoomLevel > 1) {
      const dispW = 520;
      const dispH = 520;
      const panX = (0.5 - tile.centerNorm.x) * dispW * (zoomLevel - 1);
      const panY = (0.5 - tile.centerNorm.y) * dispH * (zoomLevel - 1);
      setPanOffset({ x: panX, y: panY });
    }
  };

  // Sync selectedObsId if observations update
  useEffect(() => {
    if (!selectedObsId && observations.length > 0) {
      setSelectedObsId(observations[0].id);
    }
  }, [observations, selectedObsId]);

  // Main canvas rendering
  const renderCanvas = useCallback(() => {
    if (canvasRef.current && activeFrame) {
      renderObservationToCanvas(
        canvasRef.current,
        activeFrame,
        stretch,
        cmap,
        showGrid,
        showCrosshair ? selectedCoord : null
      );
    }
  }, [activeFrame, stretch, cmap, showGrid, showCrosshair, selectedCoord]);

  useEffect(() => {
    if (activeTab === 'single') {
      renderCanvas();
    }
  }, [renderCanvas, activeTab, selectedObsId, stretch, cmap, showGrid, showCrosshair, selectedCoord]);

  // Mouse interaction for pan & coordinates
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !activeObs) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }

    // Calculate approximate celestial coordinates based on WCS CRVAL and pixel scale
    const fovDeg = activeObs.fieldOfViewArcmin / 60;
    const ra = activeObs.raDeg + (x - 0.5) * fovDeg;
    const dec = activeObs.decDeg - (y - 0.5) * fovDeg;

    // Approximate flux reading
    const fluxEstimate = activeFrame
      ? activeFrame.backgroundLevelMJySr +
        activeFrame.stars.reduce((acc, s) => {
          const d = Math.hypot(x - s.x, y - s.y);
          return d < 0.04 ? acc + s.peakFlux * Math.exp(-(d * d) / 0.0004) : acc;
        }, 0)
      : 1.5;

    setCursorInfo({
      ra: Number(ra.toFixed(4)),
      dec: Number(dec.toFixed(4)),
      flux: Number(fluxEstimate.toFixed(2)),
      pixelX: Math.round(x * 2048),
      pixelY: Math.round(y * 2048),
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setSelectedCoord({ x, y });

    const clickedTile = findTileAtCoord(surveyTiles, x, y);
    if (clickedTile) {
      setSelectedTile(clickedTile);
    }
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Export & Download View state
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isQuickExporting, setIsQuickExporting] = useState<boolean>(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const activeBand =
    SPHEREX_BANDS.find((b) => b.bandId === selectedBandId) || SPHEREX_BANDS[54] || SPHEREX_BANDS[0];

  // Direct high-resolution download of currently rendered astronomical map
  const handleDirectDownload = async () => {
    if (!activeObs || !activeFrame) return;
    setIsQuickExporting(true);
    try {
      const filename = await exportHighResAstronomicalMap(
        activeFrame,
        activeObs,
        activeBand,
        {
          resolution: 2048,
          stretch,
          cmap,
          showGrid,
          showCrosshair,
          includeTileGrid: showTileGrid,
          highlightedTileCodes: surveyTiles.filter((t) => t.isTargetInterest).map((t) => t.code),
          selectedCoord,
          includeMetadataBanner: true,
          includeColorbar: true,
          includeCompass: true,
          cropToViewport: zoomLevel > 1,
          zoomLevel,
          panOffset,
          canvasDisplayWidth: 520,
          canvasDisplayHeight: 520,
        }
      );
      setDownloadSuccessToast(filename);
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    } catch (err) {
      console.error('Download View error:', err);
    } finally {
      setIsQuickExporting(false);
    }
  };

  // Export generic on-screen view if on compare, difference, or timelapse tab
  const handleExportCurrentTab = async () => {
    if (activeTab === 'single') {
      await handleDirectDownload();
      return;
    }

    setIsQuickExporting(true);
    try {
      const activeContainer = document.querySelector('main');
      const canvas = activeContainer?.querySelector('canvas') as HTMLCanvasElement | null;
      if (canvas) {
        const cleanTarget = activeObs.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `SPHEREx_${cleanTarget}_${activeTab}_view_${Date.now()}.png`;
        const tabTitle =
          activeTab === 'difference'
            ? `${activeObs.targetName} — Image Difference Residual`
            : activeTab === 'compare'
            ? `${activeObs.targetName} — Side-by-Side Epoch Comparison`
            : activeTab === 'timelapse'
            ? `${activeObs.targetName} — Multi-Epoch Blink Frame`
            : `${activeObs.targetName} — Spectral View`;

        await exportGenericCanvasPNG(canvas, filename, tabTitle);
        setDownloadSuccessToast(filename);
        setTimeout(() => setDownloadSuccessToast(null), 4000);
      } else {
        await handleDirectDownload();
      }
    } catch (err) {
      console.error('Failed to export current tab view:', err);
    } finally {
      setIsQuickExporting(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
        <RefreshCw className="h-10 w-10 text-cyan-400 animate-spin" />
        <div className="text-center">
          <h3 className="text-sm font-semibold text-white">Loading SPHEREx Mission Observations...</h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Establishing connection to calibrated Level-2/3 synthetic spectral pipeline...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-950 border border-red-900/50 rounded-2xl space-y-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <div>
          <h3 className="text-base font-semibold text-white">SPHEREx Telemetry Retrieval Failed</h3>
          <p className="text-xs text-red-300 font-mono mt-1 max-w-md">{error}</p>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono transition"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // Empty State
  if (!observations || observations.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-center">
        <Telescope className="h-12 w-12 text-slate-600" />
        <h3 className="text-base font-semibold text-white">No Observations Available</h3>
        <p className="text-xs text-slate-400 font-mono">
          Ensure synthetic pipeline generators or IRSA endpoints are active.
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs font-mono hover:bg-cyan-500 transition"
        >
          Load Default Benchmark Field
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Target Selector & Mode Navigation Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Target Switcher Dropdown */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <Telescope className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Active Astronomical Target
            </span>
            <select
              value={selectedObsId}
              onChange={(e) => setSelectedObsId(e.target.value)}
              aria-label="Select active SPHEREx target field"
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-semibold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {observations.map((obs) => (
                <option key={obs.id} value={obs.id}>
                  {obs.targetName} ({obs.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'single'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Sky Viewer</span>
          </button>

          <button
            onClick={() => setActiveTab('signal-analysis')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'signal-analysis'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Waves className="h-3.5 w-3.5" />
            <span>Signal Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'compare'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <SplitSquareVertical className="h-3.5 w-3.5" />
            <span>Side-by-Side</span>
          </button>

          <button
            onClick={() => setActiveTab('timelapse')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'timelapse'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Film className="h-3.5 w-3.5" />
            <span>Time-lapse</span>
          </button>

          <button
            onClick={() => setActiveTab('difference')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'difference'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Change Highlights</span>
          </button>

          <button
            onClick={() => setActiveTab('sed')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'sed'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>SED Spectrum</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          <button
            onClick={handleExportCurrentTab}
            disabled={isQuickExporting}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 hover:from-cyan-600/50 hover:to-indigo-600/50 text-cyan-200 border border-cyan-500/40 transition shadow-sm font-semibold"
            title="Download View as High-Resolution PNG"
          >
            {isQuickExporting ? (
              <div className="h-3.5 w-3.5 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 text-cyan-300" />
            )}
            <span>Download View</span>
          </button>
        </div>
      </div>

      {/* Main Sky Viewer Area (when in 'single' mode) */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sky Canvas Column */}
          <div className="lg:col-span-8 space-y-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-xl space-y-2">
              {/* Canvas Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800 text-xs font-mono">
                {/* Stretch Controls */}
                <div className="flex items-center space-x-1 text-slate-400">
                  <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Stretch:</span>
                  {(['asinh', 'log', 'linear', 'sqrt'] as StretchMode[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStretch(s)}
                      className={`px-2 py-0.5 rounded uppercase text-[11px] transition ${
                        stretch === s
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Colormap Palette Controls */}
                <div className="flex items-center space-x-1 text-slate-400">
                  <Palette className="h-3.5 w-3.5 text-purple-400" />
                  <span className="hidden sm:inline">Palette:</span>
                  {(['inferno', 'viridis', 'magma', 'plasma', 'grayscale'] as ColorMap[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCmap(c)}
                      className={`px-2 py-0.5 rounded capitalize text-[11px] transition ${
                        cmap === c
                          ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Overlays & View resets */}
                <div className="flex items-center space-x-1 text-slate-400">
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-1.5 rounded transition ${
                      showGrid ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                    }`}
                    title="Toggle Coordinate Grid"
                  >
                    <Grid className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => setShowTileGrid(!showTileGrid)}
                    className={`p-1.5 rounded transition flex items-center space-x-1 ${
                      showTileGrid
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Toggle SPHEREx Survey Tile Coordinate Grid Overlay"
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                    <span className="hidden xl:inline text-[10px] font-mono font-semibold">Tiles</span>
                  </button>

                  <button
                    onClick={() => setShowCrosshair(!showCrosshair)}
                    className={`p-1.5 rounded transition ${
                      showCrosshair ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                    }`}
                    title="Toggle Aperture Crosshair"
                  >
                    <Crosshair className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Zoom in"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Zoom out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={handleResetView}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Reset Zoom & Pan"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>

                  {/* Download View Button with Quality Options Dropdown */}
                  <div className="flex items-center pl-1 border-l border-slate-800 space-x-1">
                    <button
                      onClick={handleDirectDownload}
                      disabled={isQuickExporting}
                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-[11px] font-semibold transition shadow-md shadow-cyan-950/40 disabled:opacity-50"
                      title="Download View as High-Resolution PNG (2048 × 2048 FITS Scale)"
                    >
                      {isQuickExporting ? (
                        <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span>{isQuickExporting ? 'Exporting...' : 'Download View'}</span>
                    </button>

                    <button
                      onClick={() => setIsExportModalOpen(true)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Download Options (Resolution 1K/2K/4K, Overlays, Metadata)"
                      aria-label="Download View options"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Canvas Container with Pan/Zoom */}
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={handleCanvasClick}
                className="relative aspect-square w-full rounded-lg overflow-hidden border border-slate-800 bg-black cursor-crosshair select-none"
              >
                <div
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={520}
                    height={520}
                    className="w-full h-full object-contain"
                  />

                  {/* SPHEREx Coordinate Selection Grid Overlay on the main astronomical map */}
                  {showTileGrid && (
                    <CoordinateGridOverlay
                      tiles={surveyTiles}
                      selectedTile={selectedTile}
                      onSelectTile={handleSelectTile}
                      hoveredTile={hoveredTile}
                      onHoverTile={setHoveredTile}
                      showTileLabels={showTileLabels}
                      highlightFilter={highlightFilter}
                      onCenterOnTile={handleCenterOnTile}
                    />
                  )}
                </div>

                {/* Persistent Simulated Benchmark Watermark */}
                <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-slate-800 text-[10px] font-mono text-cyan-300 pointer-events-none z-20">
                  SPHEREx LVF Passband: {SPHEREX_BANDS.find((b) => b.bandId === selectedBandId)?.wavelengthMicrons.toFixed(2)} µm
                </div>

                {/* Telemetry coordinate readout overlay */}
                {cursorInfo && (
                  <div className="absolute bottom-2 left-2 bg-slate-950/85 backdrop-blur-md p-2 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-0.5 pointer-events-none z-20">
                    <div className="flex items-center space-x-2">
                      <span className="text-cyan-400 font-bold">RA:</span> {cursorInfo.ra}°
                      <span className="text-cyan-400 font-bold ml-2">Dec:</span> {cursorInfo.dec}°
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <span>Pixel ({cursorInfo.pixelX}, {cursorInfo.pixelY})</span>
                      <span>•</span>
                      <span className="text-amber-300 font-semibold">{cursorInfo.flux} MJy/sr</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SPHEREx Survey Tile Coordinate Selection & Highlight Control Panel */}
              {showTileGrid && (
                <div className="mt-3">
                  <SurveyTileControlPanel
                    tiles={surveyTiles}
                    selectedTile={selectedTile}
                    onSelectTile={handleSelectTile}
                    showTileGrid={showTileGrid}
                    onToggleTileGrid={() => setShowTileGrid(!showTileGrid)}
                    highlightFilter={highlightFilter}
                    onSetHighlightFilter={setHighlightFilter}
                    onCenterOnTile={handleCenterOnTile}
                  />
                </div>
              )}
            </div>

            {/* 102 Spectral Bands Selector */}
            <BandSelector
              selectedBandId={selectedBandId}
              onSelectBand={(b) => setSelectedBandId(b.bandId)}
            />
          </div>

          {/* Metadata & SED Column */}
          <div className="lg:col-span-4 space-y-4">
            <MetadataPanel
              observation={activeObs}
              onExplainWithAi={() =>
                onExplainWithAi('spherex_fits', {
                  targetName: activeObs.targetName,
                  category: activeObs.category,
                  raDeg: activeObs.raDeg,
                  decDeg: activeObs.decDeg,
                  fitsHeader: activeObs.fitsHeader,
                  dataSourceStatus: activeObs.dataSourceStatus,
                  dataSourceLabel: activeObs.dataSourceLabel,
                })
              }
            />

            <SpectralPlot
              observation={activeObs}
              onExplainSpectrum={() =>
                onExplainWithAi('spherex_spectrum', {
                  targetName: activeObs.targetName,
                  category: activeObs.category,
                  sedCurve: activeObs.fullSedCurve,
                  iceAbsorptionDiagnostics: ['H2O Ice 3.05µm', 'CO2 Ice 4.27µm', 'CO Ice 4.67µm'],
                  dataSourceStatus: activeObs.dataSourceStatus,
                })
              }
            />
          </div>

          {/* Full-Width Spectral Signal Visualizer (Recharts) */}
          <div className="lg:col-span-12 mt-2 space-y-4">
            <SpectralSignalVisualizer
              targetName={activeObs.targetName}
              category={activeObs.category}
              spectralPoints={activeObs.fullSedCurve?.map((p) => ({
                wavelength: p.wavelength,
                fluxMJySr: p.fluxMJySr,
                uncertainty: p.uncertainty,
                modelFit: p.modelFit,
              }))}
              activeWavelength={SPHEREX_BANDS.find((b) => b.bandId === selectedBandId)?.wavelengthMicrons || 3.05}
              onSelectWavelength={(w) => {
                const closest = SPHEREX_BANDS.reduce((prev, curr) => {
                  return Math.abs(curr.wavelengthMicrons - w) < Math.abs(prev.wavelengthMicrons - w) ? curr : prev;
                }, SPHEREX_BANDS[0]);
                if (closest) {
                  setSelectedBandId(closest.bandId);
                }
              }}
              onExplainWithAi={onExplainWithAi}
            />

            <InfraredSignalAnalysisChart
              observation={activeObs}
              onExplainWithAi={onExplainWithAi}
            />
          </div>
        </div>
      )}

      {/* Dedicated Infrared Signal Analysis Mode */}
      {activeTab === 'signal-analysis' && (
        <div className="space-y-4">
          <SpectralSignalVisualizer
            targetName={activeObs.targetName}
            category={activeObs.category}
            spectralPoints={activeObs.fullSedCurve?.map((p) => ({
              wavelength: p.wavelength,
              fluxMJySr: p.fluxMJySr,
              uncertainty: p.uncertainty,
              modelFit: p.modelFit,
            }))}
            activeWavelength={SPHEREX_BANDS.find((b) => b.bandId === selectedBandId)?.wavelengthMicrons || 3.05}
            onSelectWavelength={(w) => {
              const closest = SPHEREX_BANDS.reduce((prev, curr) => {
                return Math.abs(curr.wavelengthMicrons - w) < Math.abs(prev.wavelengthMicrons - w) ? curr : prev;
              }, SPHEREX_BANDS[0]);
              if (closest) {
                setSelectedBandId(closest.bandId);
              }
            }}
            onExplainWithAi={onExplainWithAi}
          />

          <InfraredSignalAnalysisChart
            observation={activeObs}
            onExplainWithAi={onExplainWithAi}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <MetadataPanel
                observation={activeObs}
                onExplainWithAi={() =>
                  onExplainWithAi('spherex_fits', {
                    targetName: activeObs.targetName,
                    category: activeObs.category,
                    raDeg: activeObs.raDeg,
                    decDeg: activeObs.decDeg,
                    fitsHeader: activeObs.fitsHeader,
                    dataSourceStatus: activeObs.dataSourceStatus,
                    dataSourceLabel: activeObs.dataSourceLabel,
                  })
                }
              />
            </div>
            <div className="lg:col-span-6">
              <SpectralPlot
                observation={activeObs}
                onExplainSpectrum={() =>
                  onExplainWithAi('spherex_spectrum', {
                    targetName: activeObs.targetName,
                    category: activeObs.category,
                    sedCurve: activeObs.fullSedCurve,
                    iceAbsorptionDiagnostics: ['H2O Ice 3.05µm', 'CO2 Ice 4.27µm', 'CO Ice 4.67µm'],
                    dataSourceStatus: activeObs.dataSourceStatus,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Mode */}
      {activeTab === 'compare' && (
        <div className="space-y-4">
          <ComparisonView
            frameA={activeFrame}
            frameB={compareFrame}
            stretch={stretch}
            cmap={cmap}
            labelA={`Epoch 1 (${activeFrame.timestamp.split('T')[0]})`}
            labelB={`Epoch 2 (${compareFrame.timestamp.split('T')[0]})`}
          />
        </div>
      )}

      {/* Multi-Epoch Time-lapse Mode */}
      {activeTab === 'timelapse' && (
        <div className="space-y-4">
          <TimelapseViewer
            epochs={activeObs.epochs}
            stretch={stretch}
            cmap={cmap}
          />
        </div>
      )}

      {/* Change Highlighting / Difference Mode */}
      {activeTab === 'difference' && (
        <div className="space-y-4">
          <DifferenceOverlay
            referenceFrame={activeFrame}
            scienceFrame={compareFrame}
            stretch={stretch}
            onExplainTransient={(tr: TransientCandidate) =>
              onExplainWithAi('transient_detection', {
                targetField: activeObs.targetName,
                transientId: tr.id,
                candidateType: tr.candidateType,
                raDeg: tr.raDeg,
                decDeg: tr.decDeg,
                deltaFluxMJySr: tr.deltaFluxMJySr,
                snr: tr.snr,
                significanceSigma: tr.significanceSigma,
                detectionEpoch: tr.detectionEpoch,
                referenceEpoch: tr.referenceEpoch,
                dataSourceStatus: activeObs.dataSourceStatus,
              })
            }
          />
        </div>
      )}

      {/* Full SED Spectral Mode */}
      {activeTab === 'sed' && (
        <div className="space-y-4">
          <SpectralSignalVisualizer
            targetName={activeObs.targetName}
            category={activeObs.category}
            spectralPoints={activeObs.fullSedCurve?.map((p) => ({
              wavelength: p.wavelength,
              fluxMJySr: p.fluxMJySr,
              uncertainty: p.uncertainty,
              modelFit: p.modelFit,
            }))}
            activeWavelength={SPHEREX_BANDS.find((b) => b.bandId === selectedBandId)?.wavelengthMicrons || 3.05}
            onSelectWavelength={(w) => {
              const closest = SPHEREX_BANDS.reduce((prev, curr) => {
                return Math.abs(curr.wavelengthMicrons - w) < Math.abs(prev.wavelengthMicrons - w) ? curr : prev;
              }, SPHEREX_BANDS[0]);
              if (closest) {
                setSelectedBandId(closest.bandId);
              }
            }}
            onExplainWithAi={onExplainWithAi}
          />

          <SpectralPlot
            observation={activeObs}
            onExplainSpectrum={() =>
              onExplainWithAi('spherex_spectrum', {
                targetName: activeObs.targetName,
                sedCurve: activeObs.fullSedCurve,
                dataSourceStatus: activeObs.dataSourceStatus,
              })
            }
          />
        </div>
      )}

      {/* High-Resolution Astronomical Map Export Modal */}
      <DownloadViewModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        observation={activeObs}
        band={activeBand}
        stretch={stretch}
        cmap={cmap}
        showGrid={showGrid}
        showCrosshair={showCrosshair}
        selectedCoord={selectedCoord}
        zoomLevel={zoomLevel}
        panOffset={panOffset}
        onNotification={(msg) => {
          setDownloadSuccessToast(msg);
          setTimeout(() => setDownloadSuccessToast(null), 4000);
        }}
      />

      {/* Download Success Floating Toast Notification */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-mono animate-fade-in">
          <div className="p-1.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/60 shrink-0">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold block text-white">Export Complete</span>
            <span className="text-[11px] text-slate-400 max-w-xs truncate block">
              {downloadSuccessToast}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
