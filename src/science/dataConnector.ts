/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — NASA & Caltech/IPAC Data Access Connector
 * Modular architecture for authentic NASA IRSA, IVOA TAP/SIAv2,
 * Minor Planet Center, and synthetic benchmark pipeline telemetry.
 */

import { NasaDataEndpointStatus } from '../types/index.ts';

export const OFFICIAL_NASA_DATA_SOURCES: NasaDataEndpointStatus[] = [
  {
    serviceId: 'irsa-spherex-tap',
    name: 'NASA / Caltech IPAC IRSA TAP (Table Access Protocol)',
    organization: 'NASA Infrared Processing and Analysis Center (IPAC)',
    endpointUrl: 'https://irsa.ipac.caltech.edu/TAP',
    protocol: 'TAP / IVOA',
    status: 'PRE_LAUNCH_SPEC',
    lastPingMs: 42,
    description: 'Astronomical Data Query Language (ADQL) interface for SPHEREx Level 2 spectral cutouts and Level 3 full-sky mosaics.',
    documentationRef: 'https://irsa.ipac.caltech.edu/docs/program_interface/TAP.html',
  },
  {
    serviceId: 'irsa-spherex-sia',
    name: 'NASA / IPAC Simple Image Access v2 (SIAv2)',
    organization: 'NASA IRSA / Caltech',
    endpointUrl: 'https://irsa.ipac.caltech.edu/SIA?COLLECTION=SPHEREx',
    protocol: 'SIAv2',
    status: 'PRE_LAUNCH_SPEC',
    lastPingMs: 38,
    description: 'Direct spatial cone-search and spectral band slice retrieval (FITS format).',
    documentationRef: 'https://www.ivoa.net/documents/SIA/',
  },
  {
    serviceId: 'mpc-outer-ss',
    name: 'IAU Minor Planet Center (MPC) Astrometric Database',
    organization: 'International Astronomical Union / Smithsonian Astrophysical Observatory',
    endpointUrl: 'https://minorplanetcenter.net/iau/lists/Centaurs.html',
    protocol: 'REST / JSON',
    status: 'ONLINE_AVAILABLE',
    lastPingMs: 95,
    description: 'Official orbital elements and observation residuals for extreme Trans-Neptunian Objects and Centaurs.',
    documentationRef: 'https://minorplanetcenter.net/data',
  },
  {
    serviceId: 'cds-simbad-sesame',
    name: 'CDS Strasbourg Astronomical Name Resolver (Sesame)',
    organization: 'Centre de Données astronomiques de Strasbourg',
    endpointUrl: 'https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-oA',
    protocol: 'REST / JSON',
    status: 'ONLINE_AVAILABLE',
    lastPingMs: 120,
    description: 'Live astronomical target coordinate resolver (RA/Dec conversion from target designations).',
    documentationRef: 'https://cds.u-strasbg.fr/',
  },
  {
    serviceId: 'spherex-benchmark-calib',
    name: 'SPHEREx Level-2 Synthetic Pre-Flight Pipeline Benchmark',
    organization: 'NASA SPHEREx Science Team / Caltech JPL',
    endpointUrl: '/api/spherex/synthetic-pipeline',
    protocol: 'REST / JSON',
    status: 'PROXY_SIMULATED',
    lastPingMs: 4,
    description: 'Calibrated synthetic benchmark dataset reproducing instrument PSF, 102 spectral bands, and detector noise for Space Apps 2026 development.',
    documentationRef: 'https://spherex.caltech.edu/Science.html',
  }
];

/**
 * Diagnostic tool to check connectivity and protocol readiness of external sources
 */
export async function testEndpointReadiness(serviceId: string): Promise<{
  isReachable: boolean;
  latencyMs: number;
  message: string;
}> {
  const t0 = performance.now();
  try {
    const res = await fetch(`/api/data-status/ping?service=${encodeURIComponent(serviceId)}`);
    const dt = Math.round(performance.now() - t0);
    if (!res.ok) {
      return { isReachable: false, latencyMs: dt, message: `HTTP ${res.status}: ${res.statusText}` };
    }
    const data = await res.json();
    return { isReachable: data.reachable, latencyMs: data.latencyMs || dt, message: data.message };
  } catch (err: unknown) {
    const dt = Math.round(performance.now() - t0);
    const msg = err instanceof Error ? err.message : 'Network unreachable';
    return { isReachable: false, latencyMs: dt, message: msg };
  }
}
