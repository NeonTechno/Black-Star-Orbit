/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — SPHEREx Survey Tile Tessellation & Coordinate Geometry
 * Calibrated for Level-2 / Level-3 science sky products across all-sky sweeps.
 */

import { SpherexObservation, ObservationFrame } from '../types/index.ts';

export type TileStatus =
  | 'TARGET_PRIMARY'
  | 'CANDIDATE_TRANSIENT'
  | 'HIGH_DENSITY_STARS'
  | 'CALIBRATION_STANDARD'
  | 'NOMINAL_SURVEY';

export interface SpherexSurveyTile {
  tileId: string;        // e.g. "SPX-L2-T07"
  code: string;          // e.g. "B3" (Row B, Col 3)
  colIndex: number;      // 0..3 (Left to Right)
  rowIndex: number;      // 0..3 (Top to Bottom)
  normBounds: {
    minX: number;        // 0..1
    maxX: number;
    minY: number;
    maxY: number;
  };
  raRangeDeg: [number, number];   // [minRa, maxRa]
  decRangeDeg: [number, number];  // [minDec, maxDec]
  centerRaDeg: number;
  centerDecDeg: number;
  centerNorm: { x: number; y: number };
  starsCount: number;
  transientsCount: number;
  hasProtostar: boolean;
  hasTransient: boolean;
  surveyPasses: number;
  status: TileStatus;
  statusLabel: string;
  isTargetInterest: boolean;
}

const ROW_LETTERS = ['A', 'B', 'C', 'D'];

/**
 * Computes the 16-tile SPHEREx survey grid for a given observation and frame
 */
export function computeSpherexSurveyTiles(
  observation: SpherexObservation,
  frame: ObservationFrame,
  gridCols: number = 4,
  gridRows: number = 4
): SpherexSurveyTile[] {
  const tiles: SpherexSurveyTile[] = [];
  const fovDeg = observation.fieldOfViewArcmin / 60;
  const colStep = 1 / gridCols;
  const rowStep = 1 / gridRows;

  let tileCounter = 1;

  for (let r = 0; r < gridRows; r++) {
    const minY = r * rowStep;
    const maxY = (r + 1) * rowStep;
    const rowCode = ROW_LETTERS[r] || `R${r + 1}`;

    for (let c = 0; c < gridCols; c++) {
      const minX = c * colStep;
      const maxX = (c + 1) * colStep;
      const colCode = (c + 1).toString();
      const code = `${rowCode}${colCode}`;
      const tileId = `SPX-L2-T${tileCounter.toString().padStart(2, '0')}`;
      tileCounter++;

      const centerNormX = (minX + maxX) / 2;
      const centerNormY = (minY + maxY) / 2;

      // Coordinate mapping aligned with WCS convention:
      // RA increases with X, Dec decreases with Y
      const ra1 = Number((observation.raDeg + (minX - 0.5) * fovDeg).toFixed(4));
      const ra2 = Number((observation.raDeg + (maxX - 0.5) * fovDeg).toFixed(4));
      const dec1 = Number((observation.decDeg - (minY - 0.5) * fovDeg).toFixed(4));
      const dec2 = Number((observation.decDeg - (maxY - 0.5) * fovDeg).toFixed(4));

      const centerRa = Number((observation.raDeg + (centerNormX - 0.5) * fovDeg).toFixed(4));
      const centerDec = Number((observation.decDeg - (centerNormY - 0.5) * fovDeg).toFixed(4));

      // Scan for stellar sources inside this tile's footprint
      const starsInTile = frame.stars.filter(
        (s) => s.x >= minX && s.x < maxX && s.y >= minY && s.y < maxY
      );
      const hasProtostar = starsInTile.some(
        (s) => s.id.includes('PROTO') || s.isVariable === true
      );

      // Scan for transient candidates inside this tile's footprint
      const transientsInTile = (frame.transients || []).filter(
        (t) => t.x >= minX && t.x < maxX && t.y >= minY && t.y < maxY
      );
      const hasTransient = transientsInTile.length > 0;

      // Classify tile status
      let status: TileStatus = 'NOMINAL_SURVEY';
      let statusLabel = 'Nominal Survey Strip';

      if (hasProtostar) {
        status = 'TARGET_PRIMARY';
        statusLabel = 'Primary Protostar Candidate';
      } else if (hasTransient) {
        status = 'CANDIDATE_TRANSIENT';
        statusLabel = 'Infrared Transient Lead';
      } else if (starsInTile.length >= 2) {
        status = 'HIGH_DENSITY_STARS';
        statusLabel = 'Stellar Association';
      } else if (c === 0 && r === 0) {
        status = 'CALIBRATION_STANDARD';
        statusLabel = 'Photometric Sky Calibrator';
      }

      const isTargetInterest = hasProtostar || hasTransient || status === 'HIGH_DENSITY_STARS';

      // SPHEREx survey pass depth: deep poles receive up to 16 passes, nominal 4 passes
      const basePasses = observation.category === 'Deep Celestial Poles' ? 12 : 4;
      const surveyPasses = basePasses + (isTargetInterest ? 2 : 0);

      tiles.push({
        tileId,
        code,
        colIndex: c,
        rowIndex: r,
        normBounds: { minX, maxX, minY, maxY },
        raRangeDeg: [Math.min(ra1, ra2), Math.max(ra1, ra2)],
        decRangeDeg: [Math.min(dec1, dec2), Math.max(dec1, dec2)],
        centerRaDeg: centerRa,
        centerDecDeg: centerDec,
        centerNorm: { x: centerNormX, y: centerNormY },
        starsCount: starsInTile.length,
        transientsCount: transientsInTile.length,
        hasProtostar,
        hasTransient,
        surveyPasses,
        status,
        statusLabel,
        isTargetInterest,
      });
    }
  }

  return tiles;
}

/**
 * Finds the survey tile corresponding to a normalized coordinate (0..1)
 */
export function findTileAtCoord(
  tiles: SpherexSurveyTile[],
  normX: number,
  normY: number
): SpherexSurveyTile | null {
  const clampedX = Math.max(0, Math.min(0.9999, normX));
  const clampedY = Math.max(0, Math.min(0.9999, normY));
  return (
    tiles.find(
      (t) =>
        clampedX >= t.normBounds.minX &&
        clampedX < t.normBounds.maxX &&
        clampedY >= t.normBounds.minY &&
        clampedY < t.normBounds.maxY
    ) || null
  );
}
