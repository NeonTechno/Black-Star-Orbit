/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GOD'S EYE VIEW — Multi-scale Cosmic Observation & Planetary Intelligence Types
 * Black Star Orbit / NASA Space Apps Challenge 2026
 */

export type CosmicScaleLayer =
  | 'cosmic-web'        // Layer 1: Large-scale universe, cosmic web, filaments, clusters, CMB
  | 'galactic-field'   // Layer 2: Local Group, Andromeda, Triangulum, Magellanic Clouds
  | 'milky-way'        // Layer 3: Galactic disc, spiral arms, Sagittarius A*, stellar clusters
  | 'stellar-hood'     // Layer 4: Solar neighborhood within 50 light-years
  | 'solar-system'     // Layer 5: Sun, planets, asteroids, Kuiper Belt, Planet X
  | 'earth-planetary'  // Layer 6: Earth & planetary geospatial intelligence, satellites, FIRMS fires, weather
  | 'exoplanets'       // Layer 7: Confirmed exoplanet systems, habitable zones, light curves
  | 'deep-space';      // Layer 8: Nebulae, supernova remnants, black holes, SPHEREx targets

export interface CosmicObject {
  id: string;
  name: string;
  catalogueId: string;
  layer: CosmicScaleLayer;
  objectType: 
    | 'cluster' | 'filament' | 'galaxy' | 'black-hole' | 'nebula' 
    | 'star' | 'planet' | 'satellite' | 'exoplanet' | 'anomaly';
  coordinates: {
    ra?: string;           // Right Ascension
    dec?: string;          // Declination
    galacticL?: number;    // Galactic longitude deg
    galacticB?: number;    // Galactic latitude deg
    lat?: number;          // Geospatial latitude deg (for Earth)
    lng?: number;          // Geospatial longitude deg (for Earth)
    altitudeKm?: number;   // Orbit altitude km (for satellites)
  };
  distance: {
    value: number;
    unit: 'km' | 'AU' | 'ly' | 'kpc' | 'Mpc' | 'Gly';
    uncertainty?: number;
    isEstimate?: boolean;
  };
  physicalProperties: {
    radius?: string;
    mass?: string;
    temperatureK?: number;
    spectralType?: string;
    luminositySolar?: number;
    redshift?: number;
    velocityKmS?: number;
    orbitalPeriodDays?: number;
    semiMajorAxisAU?: number;
    eccentricity?: number;
  };
  scientificDescription: string;
  source: string;
  sourceUrl?: string;
  retrievedAt: string;
  dataStatus: 'live' | 'archived-catalog' | 'model-derived' | 'benchmark-simulation';
  uncertaintyNotes?: string;
  imageUrl?: string;
  tags: string[];
}

// Geospatial satellite telemetry
export interface OrbitalSatellite {
  id: string;
  name: string;
  noradId: number;
  type: 'earth-observation' | 'astronomy-observatory' | 'communications' | 'weather';
  altitudeKm: number;
  velocityKmS: number;
  inclinationDeg: number;
  periodMinutes: number;
  currentLat: number;
  currentLng: number;
  groundTrack: [number, number][]; // Lat/Lng points
  status: 'operational' | 'nominal' | 'calibrating';
  description: string;
}

// NASA FIRMS Active Thermal Anomaly
export interface ThermalFireAnomaly {
  id: string;
  latitude: number;
  longitude: number;
  brightnessKelvin: number;
  frpMegawatts: number;
  confidence: 'nominal' | 'high' | 'alert';
  satellite: 'VIIRS-NOAA20' | 'MODIS-Terra' | 'MODIS-Aqua';
  acqDate: string;
  acqTime: string;
  region: string;
}

// NOAA Space Weather telemetry
export interface SpaceWeatherTelemetry {
  solarWindSpeedKmS: number;
  interplanetaryMagFieldBzNt: number;
  geomagneticKpIndex: number;
  xrayFluxWm2: number;
  solarFlareClass: string;
  auroraOvalActivity: 'low' | 'moderate' | 'elevated' | 'storm-warning';
  lastUpdated: string;
}

// Simulation Lab parameters and results
export type SimulationScenario = 'asteroid-deflection' | 'solar-cme-storm' | 'planet-x-perturbation';

export interface AsteroidDeflectionParams {
  asteroidDiameterM: number;
  impactVelocityKmS: number;
  impactorMassKg: number;
  leadTimeYears: number;
  momentumBeta: number;
}

export interface DeflectionResult {
  deltaV_cm_s: number;
  orbitalShiftKm: number;
  deflectionDistanceEarthRadii: number;
  successOutcome: boolean;
  explanation: string;
}

export interface SolarStormParams {
  cmeSpeedKmS: number;
  magneticOrientationBz: number; // nT
  plasmaDensityCm3: number;
}

export interface SolarStormResult {
  transitHoursToL1: number;
  peakKpIndex: number;
  geomagneticClass: 'G1 (Minor)' | 'G2 (Moderate)' | 'G3 (Strong)' | 'G4 (Severe)' | 'G5 (Extreme)';
  magnetopauseStandOffEarthRadii: number;
  satelliteOrbitDragRisk: 'Low' | 'Moderate' | 'Severe' | 'Critical';
  summary: string;
}

export interface LayerVisibilitySettings {
  showOrbits: boolean;
  showLabels: boolean;
  showConstellations: boolean;
  showSatellites: boolean;
  showThermalHotspots: boolean;
  showWeatherAtmosphere: boolean;
  showTectonicPlates: boolean;
  showHabitableZones: boolean;
  showCoordinateGrid: boolean;
  photometricScaleMode: boolean; // true = visible exaggerated, false = physical logarithmic
  enableCmbMode: boolean;
}
