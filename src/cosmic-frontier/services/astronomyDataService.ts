import type { 
  ExoplanetRecord, 
  SmallBodyRecord, 
  GalaxyRecord, 
  StarRecord, 
  CatalogItem, 
  CatalogCategory 
} from '../types';

import exoplanetArchive from '../data/catalogs/confirmed-exoplanets.json';
import galaxyArchive from '../data/catalogs/deep-sky-galaxies.json';
import smallBodiesArchive from '../data/catalogs/asteroids-comets.json';
import starArchive from '../data/catalogs/bright-stars.json';
import planetArchive from '../data/catalogs/planets.json';
import spherexArchive from '../data/catalogs/mission-products.json';
import nasaImageArchive from '../data/catalogs/nasa-archives.json';

const REQUEST_TIMEOUT_MS = 8000;

async function safeFetch<T>(url: string, fallbackData: T): Promise<{ data: T; source: string; isLive: boolean }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    if (res.ok) {
      const json = await res.json();
      return {
        data: (json.records || json.data || json) as T,
        source: json.source || 'NASA Open Data Gateway',
        isLive: true
      };
    }
  } catch (err) {
    console.warn(`[AstronomyDataService] Request to ${url} failed, using verified fallback:`, err);
  }
  return {
    data: fallbackData,
    source: 'Verified Local Archive',
    isLive: false
  };
}

export async function fetchSolarSystemPlanets() {
  return safeFetch('/api/data/solar-system', (planetArchive.records || []) as unknown[]);
}

export async function fetchConfirmedExoplanets(search?: string, includeCandidates = true) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (includeCandidates) params.append('candidates', 'true');
  const query = params.toString() ? `?${params.toString()}` : '';
  return safeFetch<ExoplanetRecord[]>(`/api/data/exoplanets${query}`, (exoplanetArchive.records || []) as unknown as ExoplanetRecord[]);
}

export async function fetchSmallBodies(search?: string) {
  const query = search ? `?sstr=${encodeURIComponent(search)}` : '';
  return safeFetch<{ confirmedObjects: SmallBodyRecord[]; hypotheticalScenarios: unknown[] }>(
    `/api/data/small-bodies${query}`,
    { confirmedObjects: (smallBodiesArchive.confirmedObjects || []) as unknown as SmallBodyRecord[], hypotheticalScenarios: smallBodiesArchive.hypotheticalScenarios || [] }
  );
}

export async function fetchGalaxies() {
  return safeFetch<GalaxyRecord[]>('/api/data/galaxies', (galaxyArchive.records || []) as unknown as GalaxyRecord[]);
}

export async function fetchStars() {
  return safeFetch<StarRecord[]>('/api/data/stars', (starArchive.records || []) as unknown as StarRecord[]);
}

export async function fetchSpherexProducts() {
  return safeFetch('/api/data/spherex', spherexArchive);
}

export async function fetchNasaImages(query = 'SPHEREx') {
  return safeFetch(`/api/data/images?q=${encodeURIComponent(query)}`, (nasaImageArchive.records || []) as unknown[]);
}

export async function fetchObservatoryObjects(params?: { date?: string; category?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.date) query.append('date', params.date);
  if (params?.category && params.category !== 'all') query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  const qStr = query.toString() ? `?${query.toString()}` : '';

  return safeFetch(`/api/data/observatory/objects${qStr}`, {
    success: false,
    epoch: new Date().toISOString(),
    julianDate: 2451545.0,
    retrievalTimestamp: new Date().toISOString(),
    coordinateFrame: 'ICRF / J2000 Ecliptic',
    statusLabel: 'UNAVAILABLE',
    totalCount: 0,
    allAvailableCount: 0,
    categories: {
      'solar-system': 0,
      'asteroids-comets': 0,
      'distant-tnos': 0,
      'exoplanets': 0,
      'deep-sky': 0,
      'spherex-targets': 0
    },
    objects: []
  });
}


function buildLocalCatalogItems(): CatalogItem[] {
  const sourceUrl = (record: any, fallback: string) => record.sourceUrl || fallback;
  const properties = (entries: Array<[string, unknown, string?]>) => entries
    .filter((entry) => entry[1] !== undefined && entry[1] !== null && entry[1] !== '')
    .map(([label, value, unit]) => ({ label, value: String(value), ...(unit ? { unit } : {}) }));

  const planets = (planetArchive.records || []).map((record: any): CatalogItem => ({
    id: String(record.id || record.name),
    name: record.name || 'Solar system object',
    category: 'planets',
    categoryLabel: 'Solar System',
    subtitle: record.objectType || 'Solar system reference object',
    description: record.description || 'Reference data for a recognized solar-system object.',
    dataStatus: record.dataStatus || 'Reference standard',
    sourceName: 'NASA/JPL Solar System Dynamics',
    sourceUrl: sourceUrl(record, 'https://ssd.jpl.nasa.gov/horizons/'),
    properties: properties([
      ['Semi-major axis', record.semiMajorAxisAU, 'AU'],
      ['Orbital period', record.orbitalPeriodDays, 'days'],
      ['Mean radius', record.meanRadiusKm, 'km'],
      ['Eccentricity', record.eccentricity, '']
    ])
  }));
  const exoplanets = (exoplanetArchive.records || []).map((record: any): CatalogItem => ({
    id: `exoplanet-${record.planetName}`,
    name: record.planetName,
    category: 'exoplanets',
    categoryLabel: 'Exoplanet',
    subtitle: `Host star: ${record.hostStar || 'not specified'}`,
    description: `Discovery method: ${record.discoveryMethod || 'not specified'}; year: ${record.discoveryYear || 'unknown'}.`,
    dataStatus: record.dataStatus || 'Archival data',
    sourceName: 'NASA Exoplanet Archive',
    sourceUrl: sourceUrl(record, 'https://exoplanetarchive.ipac.caltech.edu/'),
    properties: properties([
      ['Orbital period', record.orbitalPeriodDays, 'days'],
      ['Radius', record.radiusEarthRadii, 'Earth radii'],
      ['Mass', record.massEarthMasses, 'Earth masses'],
      ['Distance', record.distanceLightYears, 'light-years']
    ])
  }));
  const smallBodies = (smallBodiesArchive.confirmedObjects || []).map((record: any): CatalogItem => ({
    id: `small-body-${record.designation}`,
    name: record.fullName || record.designation,
    category: 'small-bodies',
    categoryLabel: 'Small Body',
    subtitle: record.orbitClass || 'Minor body',
    description: 'Catalogued asteroid, comet, or trans-Neptunian object with archived orbital parameters.',
    dataStatus: record.dataStatus || 'Archival data',
    sourceName: 'NASA/JPL Small-Body Database',
    sourceUrl: sourceUrl(record, 'https://ssd-api.jpl.nasa.gov/'),
    properties: properties([
      ['Semi-major axis', record.semiMajorAxisAU, 'AU'],
      ['Eccentricity', record.eccentricity, ''],
      ['Inclination', record.inclinationDeg, 'degrees'],
      ['Diameter', record.diameterKm, 'km']
    ])
  }));
  const galaxies = (galaxyArchive.records || []).map((record: any): CatalogItem => ({
    id: record.id || record.name,
    name: record.name,
    category: 'galaxies',
    categoryLabel: 'Galaxy',
    subtitle: `${record.morphologicalType || 'Galaxy'} · ${record.constellation || 'Deep sky'}`,
    description: record.description || 'Deep-sky object from the local reference archive.',
    dataStatus: record.dataStatus || 'Archival data',
    sourceName: 'NASA/IPAC Extragalactic Database',
    sourceUrl: sourceUrl(record, 'https://ned.ipac.caltech.edu/'),
    properties: properties([
      ['Distance', record.distanceMly, 'million light-years'],
      ['Redshift', record.redshift, ''],
      ['Radial velocity', record.radialVelocityKmS, 'km/s'],
      ['Declination', record.declination, '']
    ])
  }));
  const stars = (starArchive.records || []).map((record: any): CatalogItem => ({
    id: `star-${record.name}`,
    name: record.name,
    category: 'stars',
    categoryLabel: 'Star',
    subtitle: `${record.spectralType || 'Star'} · ${record.constellation || 'Sky'}`,
    description: record.description || 'Stellar reference data from the local archive.',
    dataStatus: record.dataStatus || 'Archival data',
    sourceName: 'CDS SIMBAD Astronomical Database',
    sourceUrl: sourceUrl(record, 'https://simbad.cds.unistra.fr/simbad/'),
    properties: properties([
      ['Temperature', record.effectiveTemperatureK, 'K'],
      ['Apparent magnitude', record.apparentMagnitudeV, ''],
      ['Distance', record.distanceLightYears, 'light-years']
    ])
  }));
  const spherex: CatalogItem[] = [{
    id: 'spherex-mission-products',
    name: 'SPHEREx Mission Products',
    category: 'spherex',
    categoryLabel: 'Mission Data',
    subtitle: '102-band near-infrared all-sky survey',
    description: spherexArchive.metadata?.description || 'SPHEREx mission product and archive reference information.',
    dataStatus: spherexArchive.metadata?.dataStatus || 'Mission specification',
    sourceName: spherexArchive.metadata?.source || 'NASA/IPAC Infrared Science Archive',
    sourceUrl: spherexArchive.metadata?.sourceUrl || 'https://irsa.ipac.caltech.edu/',
    properties: properties([
      ['Spectral bands', spherexArchive.telescopeSpecifications?.spectralBandsCount, 'bands'],
      ['Wavelength range', spherexArchive.telescopeSpecifications?.wavelengthRangeMicrons, ''],
      ['Field of view', spherexArchive.telescopeSpecifications?.fieldOfViewDeg, '']
    ])
  }];
  return [...planets, ...exoplanets, ...smallBodies, ...galaxies, ...stars, ...spherex];
}

export async function fetchCatalogItems(
  category: CatalogCategory = 'all', 
  searchQuery = ''
): Promise<{ items: CatalogItem[]; source: string; isLive: boolean }> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (searchQuery) params.append('q', searchQuery);

  const url = `/api/data/catalog?${params.toString()}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    if (res.ok) {
      const json = await res.json();
      return {
        items: (json.items || []) as CatalogItem[],
        source: json.source || 'NASA Open Data Gateway',
        isLive: true
      };
    }
  } catch (err) {
    console.warn(`[AstronomyDataService] Request to ${url} failed:`, err);
  }
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const localItems = buildLocalCatalogItems().filter((item) =>
    (category === 'all' || item.category === category) &&
    (!normalizedQuery || `${item.name} ${item.subtitle} ${item.description} ${item.categoryLabel}`.toLowerCase().includes(normalizedQuery))
  );
  return {
    items: localItems,
    source: 'Verified Local Archive',
    isLive: false
  };
}
