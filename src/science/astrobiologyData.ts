/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ASTROBIOLOGY & INTERSTELLAR ICE CHEMISTRY DATA
 * Grounded in NASA Ames Astrochemistry Laboratory, Caltech IPAC SPHEREx Science Center,
 * PubChem, and UniProt databases.
 */

export interface AtomCoord {
  element: 'H' | 'C' | 'N' | 'O' | 'S' | 'P';
  x: number; // In Ångströms
  y: number;
  z: number;
}

export interface MolecularBond {
  from: number;
  to: number;
  order: 1 | 2 | 3;
}

export interface InterstellarMolecule {
  id: string;
  name: string;
  commonName: string;
  formula: string;
  pubchemCid: number;
  casNumber: string;
  molecularWeight: number;
  spherexAbsorptionBandMicrons: number;
  spherexBandFeature: string;
  vibrationalModeDescription: string;
  vibrationalFreqCm1: number;
  epistemicStatus: 'EXPERIMENTALLY_VERIFIED_IN_SITU' | 'LABORATORY_CRYO_VALIDATED' | 'COMPUTATIONAL_DFT_PREDICTION';
  epistemicEvidence: string;
  astrobiologicalRelevance: string;
  detectedEnvironments: string[];
  atoms: AtomCoord[];
  bonds: MolecularBond[];
  inChIKey: string;
  iupacName: string;
}

export interface ExtremophileProteinTarget {
  id: string;
  name: string;
  uniprotAccession: string;
  organism: string;
  extremophileClass: 'Radiation-Resistant' | 'Extreme Halophile' | 'Hyperthermophile' | 'Psychrophile (Extreme Cold)';
  cosmicAnalogLocation: string;
  biologicalFunction: string;
  molecularWeightKDa: number;
  crystalResolutionAngstrom: number;
  pdbId: string;
  epistemicStatus: 'PDB_CRYSTAL_STRUCTURE_SOLVED' | 'ALPHAFOLD_HIGH_CONFIDENCE';
}

export const INTERSTELLAR_ICE_MOLECULES: InterstellarMolecule[] = [
  {
    id: 'water-ice',
    name: 'Water Ice (Amorphous & Crystalline H₂O)',
    commonName: 'Water Ice',
    formula: 'H₂O',
    pubchemCid: 962,
    casNumber: '7732-18-5',
    molecularWeight: 18.015,
    spherexAbsorptionBandMicrons: 3.05,
    spherexBandFeature: 'O-H stretch fundamental vibrational band (3.05 µm)',
    vibrationalModeDescription: 'Symmetric & asymmetric O-H stretching modes in low-temperature interstellar amorphous solid water (ASW)',
    vibrationalFreqCm1: 3280,
    epistemicStatus: 'EXPERIMENTALLY_VERIFIED_IN_SITU',
    epistemicEvidence: 'Confirmed by SPHEREx Band 4, ISO SWS, Spitzer IRS, and JWST NIRCam in cold dark molecular clouds (T < 20 K).',
    astrobiologicalRelevance: 'Primary solvent matrix enabling organic chemistry, peptide synthesis, and solvent encapsulation across icy moons (Europa, Enceladus).',
    detectedEnvironments: ['Dense Molecular Cloud Core TMC-1', 'Protoplanetary Disk TW Hya', 'Comet 67P/Churyumov–Gerasimenko', 'Europa Subsurface Ice Shell'],
    inChIKey: 'XLYOFNOQVPJJNP-UHFFFAOYSA-N',
    iupacName: 'oxidane',
    atoms: [
      { element: 'O', x: 0.0, y: 0.0, z: 0.0 },
      { element: 'H', x: 0.757, y: 0.586, z: 0.0 },
      { element: 'H', x: -0.757, y: 0.586, z: 0.0 }
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 }
    ]
  },
  {
    id: 'methanol-ice',
    name: 'Methanol Interstellar Ice (CH₃OH)',
    commonName: 'Methanol',
    formula: 'CH₃OH',
    pubchemCid: 887,
    casNumber: '67-56-1',
    molecularWeight: 32.04,
    spherexAbsorptionBandMicrons: 3.53,
    spherexBandFeature: 'C-H stretch (3.53 µm) & C-O stretch (9.7 µm partner)',
    vibrationalModeDescription: 'C-H stretching and torsional C-O-H deformation modes in polar CO:H2O ice grain mantles',
    vibrationalFreqCm1: 2830,
    epistemicStatus: 'EXPERIMENTALLY_VERIFIED_IN_SITU',
    epistemicEvidence: 'Detected via Spitzer IRS and ground-based Keck NIRSPEC; targeted by SPHEREx Band 5 for all-sky organic grain inventory.',
    astrobiologicalRelevance: 'Key feedstock for complex organic molecules (COMs); UV photolysis yields ribose, glycolaldehyde, and amino acid precursors.',
    detectedEnvironments: ['Protostellar Envelope IRAS 16293-2422', 'Serpens Core protostars', 'Cometary coma 46P/Wirtanen'],
    inChIKey: 'OKKJLVBELUTLKV-UHFFFAOYSA-N',
    iupacName: 'methanol',
    atoms: [
      { element: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { element: 'O', x: 1.42, y: 0.0, z: 0.0 },
      { element: 'H', x: 1.78, y: 0.89, z: 0.0 },
      { element: 'H', x: -0.36, y: 1.03, z: 0.0 },
      { element: 'H', x: -0.36, y: -0.51, z: 0.89 },
      { element: 'H', x: -0.36, y: -0.51, z: -0.89 }
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
      { from: 0, to: 5, order: 1 }
    ]
  },
  {
    id: 'carbon-dioxide-ice',
    name: 'Solid Carbon Dioxide (CO₂ Ice)',
    commonName: 'Carbon Dioxide Ice',
    formula: 'CO₂',
    pubchemCid: 280,
    casNumber: '124-38-9',
    molecularWeight: 44.01,
    spherexAbsorptionBandMicrons: 4.27,
    spherexBandFeature: 'Asymmetric stretching mode ν₃ (4.27 µm)',
    vibrationalModeDescription: 'Very sharp infrared absorption feature diagnostic of polar vs apolar interstellar ice mantle mixtures',
    vibrationalFreqCm1: 2342,
    epistemicStatus: 'EXPERIMENTALLY_VERIFIED_IN_SITU',
    epistemicEvidence: 'One of the strongest features in the SPHEREx 0.75-5.0 µm passband, verified by ISO, AKARI, and JWST MIRI.',
    astrobiologicalRelevance: 'Direct carbon budget provider for prebiotic carboxyl groups (-COOH); essential for primordial carbon cycle on terrestrial planets.',
    detectedEnvironments: ['Chameleon I Dark Cloud', 'Mars Polar Ice Caps', 'Pluto Sputnik Planitia', 'Protoplanetary Disk HD 100546'],
    inChIKey: 'CURLTTPFPXYPAG-UHFFFAOYSA-N',
    iupacName: 'carbon dioxide',
    atoms: [
      { element: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { element: 'O', x: -1.16, y: 0.0, z: 0.0 },
      { element: 'O', x: 1.16, y: 0.0, z: 0.0 }
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 2 }
    ]
  },
  {
    id: 'ammonia-ice',
    name: 'Solid Interstellar Ammonia (NH₃ Ice)',
    commonName: 'Ammonia Ice',
    formula: 'NH₃',
    pubchemCid: 222,
    casNumber: '7664-41-7',
    molecularWeight: 17.031,
    spherexAbsorptionBandMicrons: 2.96,
    spherexBandFeature: 'N-H symmetric stretch (2.96 µm) & inversion umbrella mode',
    vibrationalModeDescription: 'Pyramidal umbrella inversion and N-H bond stretch in mixed cryo-matrices',
    vibrationalFreqCm1: 3378,
    epistemicStatus: 'EXPERIMENTALLY_VERIFIED_IN_SITU',
    epistemicEvidence: 'Characterized in laboratory astrophysics cryogenic chambers at 10-50 K and detected in Kuiper Belt Objects and interstellar dust.',
    astrobiologicalRelevance: 'Primary nitrogen reservoir for nucleobase synthesis (adenine, guanine, cytosine, uracil) and peptide amide bonds.',
    detectedEnvironments: ['Kuiper Belt Object Charon', 'Interstellar Grain Mantles W33A', 'Titan Atmospheric Aerosols', 'Enceladus Cryovolcanic Plumes'],
    inChIKey: 'QGZKDVFQNNGYKY-UHFFFAOYSA-N',
    iupacName: 'ammonia',
    atoms: [
      { element: 'N', x: 0.0, y: 0.0, z: 0.116 },
      { element: 'H', x: 0.0, y: 0.94, z: -0.27 },
      { element: 'H', x: 0.814, y: -0.47, z: -0.27 },
      { element: 'H', x: -0.814, y: -0.47, z: -0.27 }
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 }
    ]
  },
  {
    id: 'glycine-precursor',
    name: 'Glycine (NH₂-CH₂-COOH - Simplest Amino Acid)',
    commonName: 'Glycine',
    formula: 'C₂H₅NO₂',
    pubchemCid: 750,
    casNumber: '56-40-6',
    molecularWeight: 75.067,
    spherexAbsorptionBandMicrons: 3.12,
    spherexBandFeature: 'Combined N-H and C=O overtone absorption fingerprint (3.12 µm & 5.9 µm)',
    vibrationalModeDescription: 'Coupled amino group deformation and carboxylic acid O-H stretching modes in solid cryo-phase',
    vibrationalFreqCm1: 3205,
    epistemicStatus: 'EXPERIMENTALLY_VERIFIED_IN_SITU',
    epistemicEvidence: 'Confirmed in cometary samples returned by NASA Stardust (Comet Wild 2) and in-situ mass spectrometry by Rosetta ROSINA (Comet 67P).',
    astrobiologicalRelevance: 'Fundamental protein building block; confirms that amino acids form spontaneously in cold interstellar ice grains prior to star ignition.',
    detectedEnvironments: ['Comet 81P/Wild 2 (Stardust Return)', 'Comet 67P/Churyumov–Gerasimenko', 'Murchison Meteorite Matrix'],
    inChIKey: 'DHMQDGOQFOQNFH-UHFFFAOYSA-N',
    iupacName: '2-aminoethanoic acid',
    atoms: [
      { element: 'C', x: -0.05, y: 0.72, z: 0.0 }, // C_alpha
      { element: 'N', x: -1.38, y: 0.12, z: 0.0 }, // N_amino
      { element: 'C', x: 1.07, y: -0.32, z: 0.0 }, // C_carbonyl
      { element: 'O', x: 2.24, y: 0.02, z: 0.0 }, // O_double
      { element: 'O', x: 0.73, y: -1.61, z: 0.0 }, // O_hydroxy
      { element: 'H', x: -1.52, y: -0.48, z: 0.81 },
      { element: 'H', x: -1.52, y: -0.48, z: -0.81 },
      { element: 'H', x: -0.08, y: 1.35, z: 0.89 },
      { element: 'H', x: -0.08, y: 1.35, z: -0.89 },
      { element: 'H', x: 1.48, y: -2.22, z: 0.0 }
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 2, to: 3, order: 2 },
      { from: 2, to: 4, order: 1 },
      { from: 1, to: 5, order: 1 },
      { from: 1, to: 6, order: 1 },
      { from: 0, to: 7, order: 1 },
      { from: 0, to: 8, order: 1 },
      { from: 4, to: 9, order: 1 }
    ]
  },
  {
    id: 'formaldehyde-ice',
    name: 'Solid Formaldehyde (H₂CO)',
    commonName: 'Formaldehyde',
    formula: 'H₂CO',
    pubchemCid: 712,
    casNumber: '50-00-0',
    molecularWeight: 30.026,
    spherexAbsorptionBandMicrons: 3.47,
    spherexBandFeature: 'C-H symmetric & antisymmetric stretch (3.47 µm & 3.55 µm)',
    vibrationalModeDescription: 'Planar carbonyl C=O and C-H stretching modes in ice grain photochemistry',
    vibrationalFreqCm1: 2881,
    epistemicStatus: 'EXPERIMENTALLY_VERIFIED_IN_SITU',
    epistemicEvidence: 'Detected via radio observations (1_10 - 1_11 transition) and infrared ice features in protostellar cores like NGC 7538 IRS9.',
    astrobiologicalRelevance: 'Primary substrate in the Butlerov formose reaction that synthesizes complex sugars (ribose, arabinose, xylose) without enzymes.',
    detectedEnvironments: ['Protostellar Core NGC 7538 IRS9', 'Protoplanetary Disk LkCa 15', 'Centaur 29P/Schwassmann-Wachmann 1'],
    inChIKey: 'WSFSSNUMVMOOMR-UHFFFAOYSA-N',
    iupacName: 'methanal',
    atoms: [
      { element: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { element: 'O', x: 1.21, y: 0.0, z: 0.0 },
      { element: 'H', x: -0.58, y: 0.94, z: 0.0 },
      { element: 'H', x: -0.58, y: -0.94, z: 0.0 }
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 }
    ]
  }
];

export const EXTREMOPHILE_TARGETS: ExtremophileProteinTarget[] = [
  {
    id: 'bacteriorhodopsin',
    name: 'Bacteriorhodopsin Retinal Phototrophy Pump',
    uniprotAccession: 'P02945',
    organism: 'Halobacterium salinarum',
    extremophileClass: 'Extreme Halophile',
    cosmicAnalogLocation: 'Martian hypersaline paleolakes & Europa sub-ice brine pockets (4M NaCl saturation)',
    biologicalFunction: 'Light-driven proton pump generating cellular ATP without chlorophyll or oxygen via retinal photoisomerization.',
    molecularWeightKDa: 27.1,
    crystalResolutionAngstrom: 1.55,
    pdbId: '1C3W',
    epistemicStatus: 'PDB_CRYSTAL_STRUCTURE_SOLVED'
  },
  {
    id: 'deinococcus-ssb',
    name: 'DNA Single-Strand Repair Complex (SSB)',
    uniprotAccession: 'Q9RXZ8',
    organism: 'Deinococcus radiodurans',
    extremophileClass: 'Radiation-Resistant',
    cosmicAnalogLocation: 'Low Earth Orbit (Expose-E mission) & Interplanetary Spacecraft Surfaces (>10 kGy radiation)',
    biologicalFunction: 'Homodimeric ring that protects shattered chromosome fragments against ionizing gamma/cosmic ray bombardment.',
    molecularWeightKDa: 32.8,
    crystalResolutionAngstrom: 1.95,
    pdbId: '1SE8',
    epistemicStatus: 'PDB_CRYSTAL_STRUCTURE_SOLVED'
  },
  {
    id: 'pyrococcus-rubredoxin',
    name: 'Hyperthermostable Iron-Sulfur Rubredoxin',
    uniprotAccession: 'P24297',
    organism: 'Pyrococcus furiosus',
    extremophileClass: 'Hyperthermophile',
    cosmicAnalogLocation: 'Enceladus & Europa hydrothermal ocean floor vents (T > 105 °C, high pressure)',
    biologicalFunction: 'Robust anaerobic electron transport cofactor maintaining structural integrity up to 120 °C.',
    molecularWeightKDa: 6.2,
    crystalResolutionAngstrom: 1.10,
    pdbId: '1BRF',
    epistemicStatus: 'PDB_CRYSTAL_STRUCTURE_SOLVED'
  }
];
