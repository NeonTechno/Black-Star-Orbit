/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — High-Resolution Astronomical Map Export Engine
 * Generates publication-grade, high-resolution PNG exports of SPHEREx
 * observations complete with WCS astrometry annotations, celestial grid,
 * calibrated photometric colorbars, and scientific metadata.
 */

import {
  ColorMap,
  StretchMode,
  SpectralBand,
  SpherexObservation,
  ObservationFrame,
} from '../types/index.ts';
import { applyFluxStretch, getColorFromMap } from './spherexEngine.ts';

export interface ExportMapOptions {
  resolution?: 1024 | 2048 | 4096;
  stretch: StretchMode;
  cmap: ColorMap;
  showGrid?: boolean;
  showCrosshair?: boolean;
  includeTileGrid?: boolean;
  highlightedTileCodes?: string[];
  selectedCoord?: { x: number; y: number } | null;
  includeMetadataBanner?: boolean;
  includeColorbar?: boolean;
  includeCompass?: boolean;
  cropToViewport?: boolean;
  zoomLevel?: number;
  panOffset?: { x: number; y: number };
  canvasDisplayWidth?: number;
  canvasDisplayHeight?: number;
}

/**
 * Renders and exports a high-resolution astronomical map as a PNG download.
 */
export async function exportHighResAstronomicalMap(
  frame: ObservationFrame,
  observation: SpherexObservation,
  band: SpectralBand,
  options: ExportMapOptions
): Promise<string> {
  const resolution = options.resolution || 2048;
  const includeBanner = options.includeMetadataBanner !== false;
  const includeColorbar = options.includeColorbar !== false;
  const includeCompass = options.includeCompass !== false;
  const showGrid = options.showGrid !== false;
  const showCrosshair = options.showCrosshair !== false;

  // Header & Footer dimension scaling relative to resolution
  const mapW = resolution;
  const mapH = resolution;
  const headerH = includeBanner ? Math.round(resolution * 0.08) : 0;
  const footerH = includeBanner ? Math.round(resolution * 0.11) : 0;

  const totalW = mapW;
  const totalH = mapH + headerH + footerH;

  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize offscreen 2D canvas context');
  }

  // Fill canvas background
  ctx.fillStyle = '#020617'; // slate-950
  ctx.fillRect(0, 0, totalW, totalH);

  // Compute Viewport normalized bounds if zoomed
  let minNx = 0;
  let maxNx = 1;
  let minNy = 0;
  let maxNy = 1;

  if (options.cropToViewport && (options.zoomLevel || 1) > 1) {
    const zoom = options.zoomLevel || 1;
    const dispW = options.canvasDisplayWidth || 520;
    const dispH = options.canvasDisplayHeight || 520;
    const panX = options.panOffset?.x || 0;
    const panY = options.panOffset?.y || 0;

    const spanX = 1 / zoom;
    const spanY = 1 / zoom;
    const centerNormX = 0.5 - panX / (dispW * zoom);
    const centerNormY = 0.5 - panY / (dispH * zoom);

    minNx = Math.max(0, centerNormX - spanX / 2);
    maxNx = Math.min(1, centerNormX + spanX / 2);
    minNy = Math.max(0, centerNormY - spanY / 2);
    maxNy = Math.min(1, centerNormY + spanY / 2);
  }

  // Render Astronomical Flux Map
  const mapImgData = ctx.createImageData(mapW, mapH);
  const data = mapImgData.data;

  const bg = frame.backgroundLevelMJySr;
  const noise = frame.detectorNoiseSigma;
  const nebula = frame.nebulaIntensity;

  for (let y = 0; y < mapH; y++) {
    const fractionY = y / mapH;
    const ny = minNy + fractionY * (maxNy - minNy);

    for (let x = 0; x < mapW; x++) {
      const fractionX = x / mapW;
      const nx = minNx + fractionX * (maxNx - minNx);
      const idx = (y * mapW + x) * 4;

      // Base diffuse emission + mild cosmic background gradient
      let flux = bg * 0.2 + 0.1 * Math.sin(nx * Math.PI) * Math.cos(ny * Math.PI);

      // Diffuse molecular cloud / interstellar dust filaments
      if (nebula > 0) {
        const filament = Math.sin(nx * 8 + ny * 6) * Math.cos(ny * 12 - nx * 4);
        flux += nebula * Math.max(0, filament * 0.8 + 0.2);
      }

      // Point spread function addition for each synthetic source
      for (const star of frame.stars) {
        const dx = nx - star.x;
        const dy = ny - star.y;
        const distSq = dx * dx + dy * dy;
        const fwhmSq = star.fwhm * star.fwhm;

        if (distSq < fwhmSq * 8) {
          const core = star.peakFlux * Math.exp(-distSq / (2 * fwhmSq));
          const wing = (star.peakFlux * 0.15) / Math.pow(1 + distSq / fwhmSq, 2.5);
          flux += core + wing;
        }
      }

      // Add detector readout noise (pseudo-random Gaussian)
      const r1 = Math.random();
      const r2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(r1 || 0.0001)) * Math.cos(2.0 * Math.PI * r2);
      flux += z0 * noise;

      // Normalize flux between [0, 30] MJy/sr typical scale
      const normalized = Math.max(0, flux / 30);
      const stretched = applyFluxStretch(normalized, options.stretch);
      const [r, g, b] = getColorFromMap(stretched, options.cmap);

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  // Draw the celestial image onto canvas
  ctx.putImageData(mapImgData, 0, headerH);

  // Coordinate Grid Overlay with WCS coordinates
  if (showGrid) {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = Math.max(1, Math.round(resolution / 1000));
    ctx.setLineDash([Math.round(resolution / 200), Math.round(resolution / 200)]);

    const fovDeg = observation.fieldOfViewArcmin / 60;
    const numGrid = 4;
    const fontSize = Math.max(12, Math.round(resolution * 0.012));
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(125, 211, 252, 0.9)'; // sky-300

    for (let i = 1; i < numGrid; i++) {
      const gx = Math.round((mapW * i) / numGrid);
      const gy = headerH + Math.round((mapH * i) / numGrid);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(gx, headerH);
      ctx.lineTo(gx, headerH + mapH);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(mapW, gy);
      ctx.stroke();

      // Axis Coordinate Labels
      const lineNx = minNx + (i / numGrid) * (maxNx - minNx);
      const lineNy = minNy + (i / numGrid) * (maxNy - minNy);
      const raLabel = (observation.raDeg + (lineNx - 0.5) * fovDeg).toFixed(3) + '°';
      const decLabel = (observation.decDeg - (lineNy - 0.5) * fovDeg).toFixed(3) + '°';

      // Draw RA along top of map
      ctx.fillText(raLabel, gx + 6, headerH + fontSize + 4);
      // Draw Dec along left of map
      ctx.fillText(decLabel, 8, gy - 6);
    }
    ctx.restore();
  }

  // SPHEREx Survey Tile Coordinate Grid Overlay
  if (options.includeTileGrid) {
    ctx.save();
    const gridCols = 4;
    const gridRows = 4;
    const tileW = mapW / gridCols;
    const tileH = mapH / gridRows;
    const rowLetters = ['A', 'B', 'C', 'D'];
    const highlightedCodes = options.highlightedTileCodes || ['B3', 'C3'];

    const tileFontSize = Math.max(12, Math.round(resolution * 0.012));
    ctx.font = `bold ${tileFontSize}px "JetBrains Mono", monospace`;

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const tx = c * tileW;
        const ty = headerH + r * tileH;
        const code = `${rowLetters[r]}${c + 1}`;
        const isTarget = highlightedCodes.includes(code);

        // Tile boundary
        ctx.strokeStyle = isTarget ? 'rgba(245, 158, 11, 0.8)' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = isTarget ? Math.max(2, Math.round(resolution / 700)) : 1;
        ctx.setLineDash(isTarget ? [] : [6, 4]);
        ctx.strokeRect(tx, ty, tileW, tileH);

        // Fill background tint for highlighted target tiles
        if (isTarget) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
          ctx.fillRect(tx, ty, tileW, tileH);
        }

        // Tile Code badge in top-left
        ctx.setLineDash([]);
        const badgeW = tileFontSize * 2.8;
        const badgeH = tileFontSize * 1.5;
        ctx.fillStyle = isTarget ? 'rgba(245, 158, 11, 0.9)' : 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(tx + 6, ty + 6, badgeW, badgeH);
        ctx.strokeStyle = isTarget ? '#fbbf24' : 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx + 6, ty + 6, badgeW, badgeH);

        ctx.fillStyle = isTarget ? '#020617' : '#38bdf8';
        ctx.fillText(code, tx + 12, ty + 6 + tileFontSize);
      }
    }
    ctx.restore();
  }

  // User Aperture Crosshair & Reticle
  if (showCrosshair && options.selectedCoord) {
    ctx.save();
    const coordNormX = (options.selectedCoord.x - minNx) / (maxNx - minNx);
    const coordNormY = (options.selectedCoord.y - minNy) / (maxNy - minNy);

    if (coordNormX >= 0 && coordNormX <= 1 && coordNormY >= 0 && coordNormY <= 1) {
      const cx = coordNormX * mapW;
      const cy = headerH + coordNormY * mapH;
      const radius = Math.round(resolution * 0.025);

      ctx.strokeStyle = '#38bdf8'; // cyan-400
      ctx.lineWidth = Math.max(2, Math.round(resolution / 800));

      // Reticle Circle
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.stroke();

      // Crosshair Spokes
      const spokeLen = Math.round(radius * 1.6);
      const gap = Math.round(radius * 0.6);
      ctx.beginPath();
      ctx.moveTo(cx - spokeLen, cy);
      ctx.lineTo(cx - gap, cy);
      ctx.moveTo(cx + gap, cy);
      ctx.lineTo(cx + spokeLen, cy);
      ctx.moveTo(cx, cy - spokeLen);
      ctx.lineTo(cx, cy - gap);
      ctx.moveTo(cx, cy + gap);
      ctx.lineTo(cx, cy + spokeLen);
      ctx.stroke();

      // Coordinate readout tag next to reticle
      const fovDeg = observation.fieldOfViewArcmin / 60;
      const selRa = (observation.raDeg + (options.selectedCoord.x - 0.5) * fovDeg).toFixed(4);
      const selDec = (observation.decDeg - (options.selectedCoord.y - 0.5) * fovDeg).toFixed(4);
      const tagText = `APERTURE (RA ${selRa}°, Dec ${selDec}°)`;

      const tagFontSize = Math.max(12, Math.round(resolution * 0.011));
      ctx.font = `600 ${tagFontSize}px "JetBrains Mono", monospace`;
      ctx.fillStyle = '#020617';
      const textMetrics = ctx.measureText(tagText);
      const boxW = textMetrics.width + 16;
      const boxH = tagFontSize + 10;
      const tagX = Math.min(mapW - boxW - 12, cx + radius + 10);
      const tagY = Math.max(headerH + 20, cy - radius);

      ctx.fillRect(tagX, tagY, boxW, boxH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(tagX, tagY, boxW, boxH);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(tagText, tagX + 8, tagY + tagFontSize);
    }
    ctx.restore();
  }

  // Astronomical Cardinal Compass (North / East indicator)
  if (includeCompass) {
    ctx.save();
    const compassMargin = Math.round(resolution * 0.035);
    const originX = mapW - compassMargin - Math.round(resolution * 0.04);
    const originY = headerH + compassMargin + Math.round(resolution * 0.05);
    const armLen = Math.round(resolution * 0.04);
    const arrowSize = Math.max(6, Math.round(resolution * 0.007));

    ctx.strokeStyle = '#e2e8f0'; // slate-200
    ctx.fillStyle = '#38bdf8'; // cyan-400
    ctx.lineWidth = Math.max(2, Math.round(resolution / 900));

    // North Arrow (pointing UP in standard astronomical orientation)
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, originY - armLen);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(originX, originY - armLen - arrowSize);
    ctx.lineTo(originX - arrowSize * 0.7, originY - armLen);
    ctx.lineTo(originX + arrowSize * 0.7, originY - armLen);
    ctx.closePath();
    ctx.fill();

    // East Arrow (pointing LEFT in standard celestial coordinates)
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX - armLen, originY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(originX - armLen - arrowSize, originY);
    ctx.lineTo(originX - armLen, originY - arrowSize * 0.7);
    ctx.lineTo(originX - armLen, originY + arrowSize * 0.7);
    ctx.closePath();
    ctx.fill();

    // Labels N and E
    const compassFontSize = Math.max(12, Math.round(resolution * 0.012));
    ctx.font = `bold ${compassFontSize}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('N', originX - 4, originY - armLen - arrowSize - 4);
    ctx.fillText('E', originX - armLen - arrowSize - compassFontSize - 2, originY + 4);

    // FOV Scale Bar
    const scaleBarLen = Math.round(resolution * 0.12);
    const scaleBarY = originY + Math.round(resolution * 0.035);
    const scaleBarX = mapW - compassMargin - scaleBarLen;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = Math.max(2, Math.round(resolution / 900));
    ctx.beginPath();
    ctx.moveTo(scaleBarX, scaleBarY);
    ctx.lineTo(scaleBarX + scaleBarLen, scaleBarY);
    ctx.moveTo(scaleBarX, scaleBarY - 4);
    ctx.lineTo(scaleBarX, scaleBarY + 4);
    ctx.moveTo(scaleBarX + scaleBarLen, scaleBarY - 4);
    ctx.lineTo(scaleBarX + scaleBarLen, scaleBarY + 4);
    ctx.stroke();

    const fovScaleMin = ((observation.fieldOfViewArcmin * (scaleBarLen / mapW))).toFixed(1);
    ctx.font = `${Math.max(10, Math.round(resolution * 0.009))}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${fovScaleMin} arcmin`, scaleBarX + 4, scaleBarY - 6);
    ctx.restore();
  }

  // Header Banner
  if (includeBanner && headerH > 0) {
    ctx.save();
    // Top border separator
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, totalW, headerH);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, headerH);
    ctx.lineTo(totalW, headerH);
    ctx.stroke();

    const padX = Math.round(resolution * 0.025);
    const titleSize = Math.max(16, Math.round(resolution * 0.018));
    const subSize = Math.max(11, Math.round(resolution * 0.010));

    // Left block: Target & Mission
    ctx.fillStyle = '#38bdf8'; // cyan-400
    ctx.font = `bold ${Math.max(11, Math.round(resolution * 0.010))}px "JetBrains Mono", monospace`;
    ctx.fillText('NASA SPHEREx SPACE OBSERVATORY — ALL-SKY SPECTRAL SURVEY', padX, Math.round(headerH * 0.32));

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${titleSize}px "Space Grotesk", sans-serif`;
    ctx.fillText(observation.targetName, padX, Math.round(headerH * 0.68));

    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.font = `${subSize}px "JetBrains Mono", monospace`;
    ctx.fillText(`${observation.category.toUpperCase()} • DATE-OBS: ${frame.timestamp}`, padX, Math.round(headerH * 0.90));

    // Right block: Observation ID & Pipeline
    const rightTextX = totalW - padX;
    ctx.textAlign = 'right';

    ctx.fillStyle = '#a855f7'; // purple-500
    ctx.font = `bold ${Math.max(11, Math.round(resolution * 0.010))}px "JetBrains Mono", monospace`;
    ctx.fillText(`FIELD ID: ${observation.id}`, rightTextX, Math.round(headerH * 0.34));

    ctx.fillStyle = '#e2e8f0';
    ctx.font = `${subSize}px "JetBrains Mono", monospace`;
    ctx.fillText(`EXPTIME: ${frame.exposureTimeSec}s • PIXSCALE: ${observation.pixelScaleArcsec}"/px`, rightTextX, Math.round(headerH * 0.62));

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${observation.dataSourceStatus} (SPEC-CAL-2026)`, rightTextX, Math.round(headerH * 0.88));
    ctx.restore();
  }

  // Footer Telemetry & Colorbar
  if (includeBanner && footerH > 0) {
    const footerY = headerH + mapH;
    ctx.save();
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, footerY, totalW, footerH);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, footerY);
    ctx.lineTo(totalW, footerY);
    ctx.stroke();

    const padX = Math.round(resolution * 0.025);
    const metaSize = Math.max(11, Math.round(resolution * 0.010));
    ctx.font = `${metaSize}px "JetBrains Mono", monospace`;

    // Row 1: Optical Channel & Astrometry
    const r1Y = footerY + Math.round(footerH * 0.28);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`CHANNEL: Array ${band.arrayIndex} • λ = ${band.wavelengthMicrons.toFixed(2)} µm (R ~ ${band.resolvingPower})`, padX, r1Y);

    const r2Y = footerY + Math.round(footerH * 0.52);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`CRVAL: (RA ${observation.raDeg.toFixed(4)}°, Dec ${observation.decDeg.toFixed(4)}°) • FOV: ${observation.fieldOfViewArcmin.toFixed(1)}'`, padX, r2Y);

    const r3Y = footerY + Math.round(footerH * 0.76);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`STRETCH: ${options.stretch.toUpperCase()} • COLORMAP: ${options.cmap.toUpperCase()} • BUNIT: MJy/sr`, padX, r3Y);

    // Colorbar Scale on Right
    if (includeColorbar) {
      const cbarW = Math.round(resolution * 0.30);
      const cbarH = Math.round(footerH * 0.24);
      const cbarX = totalW - padX - cbarW;
      const cbarY = footerY + Math.round(footerH * 0.28);

      // Label above colorbar
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `600 ${metaSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'right';
      ctx.fillText('SURFACE BRIGHTNESS (MJy/sr)', totalW - padX, cbarY - 8);

      // Draw gradient colorbar strip
      const cbarImg = ctx.createImageData(cbarW, cbarH);
      const cbarData = cbarImg.data;
      for (let cy = 0; cy < cbarH; cy++) {
        for (let cx = 0; cx < cbarW; cx++) {
          const t = cx / cbarW;
          const [cr, cg, cb] = getColorFromMap(t, options.cmap);
          const cidx = (cy * cbarW + cx) * 4;
          cbarData[cidx] = cr;
          cbarData[cidx + 1] = cg;
          cbarData[cidx + 2] = cb;
          cbarData[cidx + 3] = 255;
        }
      }
      ctx.putImageData(cbarImg, cbarX, cbarY);

      // Colorbar border
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(cbarX, cbarY, cbarW, cbarH);

      // Colorbar tick marks & labels
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${Math.max(10, Math.round(resolution * 0.009))}px "JetBrains Mono", monospace`;
      const ticks = [0, 0.25, 0.5, 0.75, 1.0];
      const tickVals = ['0.0', '7.5', '15.0', '22.5', '30.0'];
      for (let ti = 0; ti < ticks.length; ti++) {
        const tx = cbarX + ticks[ti] * cbarW;
        ctx.fillText(tickVals[ti], tx, cbarY + cbarH + metaSize + 2);
      }
    }

    // Bottom copyright / research provenance
    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = `${Math.max(9, Math.round(resolution * 0.008))}px "JetBrains Mono", monospace`;
    ctx.fillText('CALTECH / JPL / IPAC • NASA SPACE APPS CHALLENGE 2026 • OPEN ASTRONOMY DATA PLATFORM', padX, footerY + Math.round(footerH * 0.94));
    ctx.restore();
  }

  // Generate Filename and Trigger Download
  const cleanTarget = observation.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const waveStr = band.wavelengthMicrons.toFixed(2).replace('.', 'p');
  const filename = `SPHEREx_${cleanTarget}_${waveStr}um_${options.cmap}_${options.stretch}_${resolution}px.png`;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to encode canvas as high-resolution PNG blob'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      resolve(filename);
    }, 'image/png');
  });
}

/**
 * Helper to export any on-screen canvas directly as PNG
 */
export async function exportGenericCanvasPNG(
  sourceCanvas: HTMLCanvasElement,
  filename: string,
  bannerTitle?: string
): Promise<string> {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;

  // Render on offscreen canvas with optional title
  const canvas = document.createElement('canvas');
  const bannerH = bannerTitle ? 48 : 0;
  canvas.width = w;
  canvas.height = h + bannerH;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (bannerTitle) {
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText(`SPHEREx RESEARCH EXPORT: ${bannerTitle.toUpperCase()}`, 16, 28);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(`CAPTURED AT ${new Date().toISOString()} • HIGH-RESOLUTION EXPORT`, 16, 42);
  }

  ctx.drawImage(sourceCanvas, 0, bannerH);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to convert canvas to blob'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      resolve(filename);
    }, 'image/png');
  });
}
