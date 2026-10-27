/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLACK STAR ORBIT — SPHEREx Coordinate Selection Grid Overlay
 * Interactive celestial tessellation grid that highlights specific SPHEREx survey tiles,
 * coordinates, and science targets on the main astronomical map.
 */

import React, { useState } from 'react';
import { SpherexSurveyTile, TileStatus } from '../../science/spherexSurveyTiles.ts';
import { 
  Grid3X3, 
  Target, 
  Sparkles, 
  Radio, 
  Check, 
  Layers, 
  Maximize2, 
  Compass, 
  ChevronRight,
  Info,
  Crosshair,
  Sliders,
  Eye
} from 'lucide-react';

interface CoordinateGridOverlayProps {
  tiles: SpherexSurveyTile[];
  selectedTile: SpherexSurveyTile | null;
  onSelectTile: (tile: SpherexSurveyTile) => void;
  hoveredTile: SpherexSurveyTile | null;
  onHoverTile: (tile: SpherexSurveyTile | null) => void;
  showTileLabels?: boolean;
  highlightFilter: 'all' | 'targets' | 'protostars' | 'calibration';
  onCenterOnTile: (tile: SpherexSurveyTile) => void;
}

export const CoordinateGridOverlay: React.FC<CoordinateGridOverlayProps> = ({
  tiles,
  selectedTile,
  onSelectTile,
  hoveredTile,
  onHoverTile,
  showTileLabels = true,
  highlightFilter,
  onCenterOnTile,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* 4x4 Survey Tile Mesh */}
      <div className="w-full h-full grid grid-cols-4 grid-rows-4">
        {tiles.map((tile) => {
          const isSelected = selectedTile?.tileId === tile.tileId;
          const isHovered = hoveredTile?.tileId === tile.tileId;

          // Determine whether this tile should be visually highlighted based on filter
          let isFilterHighlighted = false;
          if (highlightFilter === 'all') {
            isFilterHighlighted = tile.isTargetInterest;
          } else if (highlightFilter === 'targets') {
            isFilterHighlighted = tile.isTargetInterest;
          } else if (highlightFilter === 'protostars') {
            isFilterHighlighted = tile.hasProtostar;
          } else if (highlightFilter === 'calibration') {
            isFilterHighlighted = tile.status === 'CALIBRATION_STANDARD';
          }

          // Visual status coloring
          const isPrimaryTarget = tile.status === 'TARGET_PRIMARY';
          const isTransientLead = tile.status === 'CANDIDATE_TRANSIENT';

          return (
            <div
              key={tile.tileId}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTile(tile);
              }}
              onMouseEnter={() => onHoverTile(tile)}
              onMouseLeave={() => onHoverTile(null)}
              className={`relative pointer-events-auto border transition-all duration-200 cursor-pointer flex flex-col justify-between p-1.5 sm:p-2 select-none ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_rgba(56,189,248,0.4)] z-20'
                  : isHovered
                  ? 'border-cyan-300/80 bg-cyan-900/20 z-10'
                  : isPrimaryTarget && isFilterHighlighted
                  ? 'border-amber-400/90 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : isTransientLead && isFilterHighlighted
                  ? 'border-rose-400/90 bg-rose-500/15 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                  : isFilterHighlighted
                  ? 'border-cyan-500/60 bg-cyan-500/10'
                  : 'border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/5'
              }`}
            >
              {/* Corner Reticle Brackets on Selected or Hovered Tile */}
              {(isSelected || isHovered || (isPrimaryTarget && isFilterHighlighted)) && (
                <>
                  <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-300 pointer-events-none" />
                  <div className="absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-300 pointer-events-none" />
                  <div className="absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-300 pointer-events-none" />
                  <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-300 pointer-events-none" />
                </>
              )}

              {/* Top Tile Badge: Code & Status */}
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`font-mono text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${
                    isSelected
                      ? 'bg-cyan-400 text-slate-950'
                      : isPrimaryTarget && isFilterHighlighted
                      ? 'bg-amber-400 text-slate-950'
                      : isTransientLead && isFilterHighlighted
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-900/80 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {tile.code}
                </span>

                {/* Status Indicator Icon */}
                {isPrimaryTarget && (
                  <span className="flex h-2 w-2 relative" title="Primary Target Protostar">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
                {isTransientLead && !isPrimaryTarget && (
                  <span className="flex h-2 w-2 relative" title="Transient Candidate Detected">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                )}
              </div>

              {/* Center crosshair marker for Selected Tile */}
              {isSelected && (
                <div className="self-center my-auto flex flex-col items-center pointer-events-none">
                  <Crosshair className="w-4 h-4 text-cyan-300 animate-pulse" />
                  <span className="text-[9px] font-mono font-semibold text-cyan-200 bg-slate-950/80 px-1 rounded border border-cyan-500/40 mt-0.5">
                    ACTIVE TILE
                  </span>
                </div>
              )}

              {/* Bottom Tile Coordinates & Mini Stats */}
              {showTileLabels && (
                <div className="flex items-end justify-between text-[8px] sm:text-[9px] font-mono text-slate-400">
                  <span className="truncate" title={`RA: ${tile.centerRaDeg}°`}>
                    α {tile.centerRaDeg.toFixed(2)}°
                  </span>
                  <span className="truncate" title={`Dec: ${tile.centerDecDeg}°`}>
                    δ {tile.centerDecDeg.toFixed(2)}°
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TileControlBarProps {
  tiles: SpherexSurveyTile[];
  selectedTile: SpherexSurveyTile | null;
  onSelectTile: (tile: SpherexSurveyTile) => void;
  showTileGrid: boolean;
  onToggleTileGrid: () => void;
  highlightFilter: 'all' | 'targets' | 'protostars' | 'calibration';
  onSetHighlightFilter: (filter: 'all' | 'targets' | 'protostars' | 'calibration') => void;
  onCenterOnTile: (tile: SpherexSurveyTile) => void;
}

export const SurveyTileControlPanel: React.FC<TileControlBarProps> = ({
  tiles,
  selectedTile,
  onSelectTile,
  showTileGrid,
  onToggleTileGrid,
  highlightFilter,
  onSetHighlightFilter,
  onCenterOnTile,
}) => {
  const targetTilesCount = tiles.filter((t) => t.isTargetInterest).length;

  return (
    <div className="bg-[#090F24]/90 border border-slate-800 rounded-xl p-3 shadow-lg space-y-3 text-xs">
      {/* Top Header & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-700/60">
            <Grid3X3 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-semibold text-white tracking-wide flex items-center gap-1.5">
              SPHEREx Coordinate Survey Tiles
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              16 Level-2 Sky Tessellation Tiles (4×4 Array Footprint)
            </p>
          </div>
        </div>

        {/* Highlight Filter Presets */}
        <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-white/10 font-mono text-[11px]">
          <button
            onClick={() => onSetHighlightFilter('all')}
            className={`px-2 py-1 rounded transition ${
              highlightFilter === 'all'
                ? 'bg-cyan-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onSetHighlightFilter('targets')}
            className={`px-2 py-1 rounded transition flex items-center gap-1 ${
              highlightFilter === 'targets'
                ? 'bg-cyan-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Highlight tiles containing detected stars, variables, or transients"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Targets ({targetTilesCount})</span>
          </button>
          <button
            onClick={() => onSetHighlightFilter('protostars')}
            className={`px-2 py-1 rounded transition ${
              highlightFilter === 'protostars'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Protostars
          </button>
          <button
            onClick={() => onSetHighlightFilter('calibration')}
            className={`px-2 py-1 rounded transition ${
              highlightFilter === 'calibration'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Calibrator
          </button>
        </div>
      </div>

      {/* Mini 4x4 Tile Matrix Selector & Selected Tile Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Left: Mini 4x4 Interactive Matrix Map */}
        <div className="md:col-span-5 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
            Quick Tile Selection Matrix
          </span>
          <div className="grid grid-cols-4 gap-1 p-1.5 bg-slate-950 rounded-lg border border-white/10">
            {tiles.map((t) => {
              const isSelected = selectedTile?.tileId === t.tileId;
              const isPrimary = t.status === 'TARGET_PRIMARY';
              const isTransient = t.status === 'CANDIDATE_TRANSIENT';

              return (
                <button
                  key={t.tileId}
                  onClick={() => onSelectTile(t)}
                  className={`h-7 rounded text-[10px] font-mono font-bold transition flex items-center justify-center relative cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/40 ring-2 ring-cyan-200'
                      : isPrimary
                      ? 'bg-amber-500/40 text-amber-200 border border-amber-400/70 hover:bg-amber-500/60'
                      : isTransient
                      ? 'bg-rose-500/40 text-rose-200 border border-rose-400/70 hover:bg-rose-500/60'
                      : t.isTargetInterest
                      ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-900/60'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                  title={`${t.tileId} [${t.code}]: ${t.statusLabel} (RA: ${t.centerRaDeg}°, Dec: ${t.centerDecDeg}°)`}
                >
                  {t.code}
                  {isPrimary && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-0.5 right-0.5" />
                  )}
                  {isTransient && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 absolute top-0.5 right-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Tile Details HUD */}
        <div className="md:col-span-7 p-2.5 rounded-lg bg-slate-950/60 border border-white/5 flex flex-col justify-between gap-2">
          {selectedTile ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
                    {selectedTile.tileId} [{selectedTile.code}]
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    selectedTile.status === 'TARGET_PRIMARY'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : selectedTile.status === 'CANDIDATE_TRANSIENT'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-900 text-slate-300 border border-white/10'
                  }`}>
                    {selectedTile.statusLabel}
                  </span>
                </div>

                <button
                  onClick={() => onCenterOnTile(selectedTile)}
                  className="px-2 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/50 text-[10px] font-mono flex items-center gap-1 transition"
                  title="Center map crosshair and aperture on this survey tile"
                >
                  <Target className="w-3 h-3" />
                  <span>Center Aperture</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono text-slate-300 mt-1">
                <div>
                  <span className="text-slate-500 block uppercase">Center RA</span>
                  <span className="text-white font-bold">{selectedTile.centerRaDeg}°</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Center Dec</span>
                  <span className="text-white font-bold">{selectedTile.centerDecDeg}°</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Survey Passes</span>
                  <span className="text-cyan-300 font-bold">{selectedTile.surveyPasses} passes</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block uppercase">RA Range</span>
                  <span>[{selectedTile.raRangeDeg[0]}°, {selectedTile.raRangeDeg[1]}°]</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Catalog Sources</span>
                  <span className="text-amber-300 font-bold">{selectedTile.starsCount} stars</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-slate-400 font-mono text-center py-4 text-[11px] flex items-center justify-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Click any tile above or on the astronomical map to inspect coordinate boundaries.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
