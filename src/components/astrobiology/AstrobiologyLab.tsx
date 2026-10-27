/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ASTROBIOLOGY & INTERSTELLAR MOLECULAR BIOSCIENCE LAB
 * Multi-pane scientific workbench adhering to the 'science' and 'threejs' skill constitution:
 * - Multi-pane workbench architecture
 * - Real accessions (PubChem CIDs, UniProt IDs, PDB crystal records)
 * - Epistemic provenance badges (In-Situ vs Cryo-Lab vs Computational)
 * - Interactive 3D molecular spectroscopy with Three.js
 * - SPHEREx 0.75 - 5.0 µm absorption band correlation
 */

import React, { useState, useEffect } from 'react';
import { 
  INTERSTELLAR_ICE_MOLECULES, 
  EXTREMOPHILE_TARGETS, 
  InterstellarMolecule, 
  ExtremophileProteinTarget 
} from '../../science/astrobiologyData';
import { Molecular3DViewer } from './Molecular3DViewer';
import { 
  Dna, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  FlaskConical, 
  Layers, 
  Search, 
  Orbit, 
  Info, 
  Thermometer, 
  Database,
  ArrowRight,
  ChevronRight,
  Flame,
  Globe2
} from 'lucide-react';

interface AstrobiologyLabProps {
  onNavigateToSpherex?: (targetBandMicrons?: number) => void;
}

export const AstrobiologyLab: React.FC<AstrobiologyLabProps> = ({ onNavigateToSpherex }) => {
  const [selectedMolecule, setSelectedMolecule] = useState<InterstellarMolecule>(INTERSTELLAR_ICE_MOLECULES[0]);
  const [selectedExtremophile, setSelectedExtremophile] = useState<ExtremophileProteinTarget | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'interstellar-ices' | 'extremophile-biology'>('interstellar-ices');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live PubChem verified metadata fetched asynchronously
  const [livePubChemData, setLivePubChemData] = useState<{
    molecularWeight?: number;
    exactMass?: number;
    iupacName?: string;
    inChIKey?: string;
    isLoading: boolean;
    error: boolean;
  }>({ isLoading: false, error: false });

  // Fetch live PubChem properties when molecule changes
  useEffect(() => {
    let isMounted = true;
    const fetchPubChem = async () => {
      setLivePubChemData({ isLoading: true, error: false });
      try {
        const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${selectedMolecule.pubchemCid}/property/MolecularWeight,ExactMass,IUPACName,InChIKey/JSON`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const props = json.PropertyTable?.Properties?.[0];
          if (isMounted && props) {
            setLivePubChemData({
              molecularWeight: parseFloat(props.MolecularWeight),
              exactMass: parseFloat(props.ExactMass),
              iupacName: props.IUPACName,
              inChIKey: props.InChIKey,
              isLoading: false,
              error: false,
            });
            return;
          }
        }
        if (isMounted) {
          setLivePubChemData({ isLoading: false, error: false });
        }
      } catch (err) {
        if (isMounted) {
          // Fall back gracefully to local vetted data
          setLivePubChemData({ isLoading: false, error: true });
        }
      }
    };

    fetchPubChem();
    return () => { isMounted = false; };
  }, [selectedMolecule.pubchemCid]);

  const filteredMolecules = INTERSTELLAR_ICE_MOLECULES.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.spherexBandFeature.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-6 animate-page-enter">
      {/* Workbench Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0B1530] via-[#091024] to-[#070C1B] border border-cyan-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
              NASA Ames Astrochemistry & Caltech SPHEREx Integration
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified PubChem & UniProt Datasets
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Astrobiology & Interstellar Molecular Lab
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
            Investigate how cold interstellar ices and prebiotic precursors mapped by the SPHEREx all-sky infrared spectrophotometer seed habitable environments and sustain life in planetary extremes.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveSubTab('interstellar-ices')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'interstellar-ices'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prebiotic Interstellar Ices</span>
          </button>
          <button
            onClick={() => setActiveSubTab('extremophile-biology')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'extremophile-biology'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>Extremophile Target Bio-Systems</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Pane Workbench Layout */}
      {activeSubTab === 'interstellar-ices' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Pane (3 cols): Molecule Selector & Filters */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 flex flex-col gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by formula, name, band..."
                  className="w-full bg-slate-950/80 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex justify-between items-center px-1">
                <span>Targets ({filteredMolecules.length})</span>
                <span>SPHEREx Band</span>
              </div>

              <div className="flex flex-col gap-2 max-h-[580px] overflow-y-auto pr-1">
                {filteredMolecules.map((m) => {
                  const isSelected = selectedMolecule.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMolecule(m)}
                      className={`text-left p-3 rounded-xl border transition flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-cyan-950/50 border-cyan-500/80 shadow-lg shadow-cyan-950/40'
                          : 'bg-slate-950/40 border-white/5 hover:border-white/20 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm text-white">
                          {m.formula}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-800/50">
                          {m.spherexAbsorptionBandMicrons} µm
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 truncate">
                        {m.commonName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span>CID: {m.pubchemCid}</span>
                        <span>•</span>
                        <span>{m.atoms.length} atoms</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scientific Citation Card */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-slate-400 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-[11px] font-semibold">
                <Database className="w-3.5 h-3.5" />
                <span>Epistemic Data Pipeline</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Vibrational transitions are calibrated against the NASA Ames Interstellar PAH & Ice Database, cross-referenced with NIST WebBook and Caltech SPHEREx Science Data Center (SSDC).
              </p>
            </div>
          </div>

          {/* Central Pane (6 cols): 3D Three.js Interactive Spectroscopic Structure Viewer */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <Molecular3DViewer molecule={selectedMolecule} />

            {/* Epistemic Provenance Badge & In-Depth Spectroscopic Metrics */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {selectedMolecule.epistemicStatus.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    CAS: {selectedMolecule.casNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onNavigateToSpherex && (
                    <button
                      onClick={() => onNavigateToSpherex(selectedMolecule.spherexAbsorptionBandMicrons)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-300 text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <span>View in SPHEREx</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block font-heading mb-1">Empirical Observation History:</strong>
                {selectedMolecule.epistemicEvidence}
              </div>

              {/* Physicochemical Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Mol Weight</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {livePubChemData.molecularWeight || selectedMolecule.molecularWeight} g/mol
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Ice Band λ</span>
                  <span className="text-sm font-mono font-bold text-cyan-300">
                    {selectedMolecule.spherexAbsorptionBandMicrons} µm
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Wavenumber</span>
                  <span className="text-sm font-mono font-bold text-violet-300">
                    {selectedMolecule.vibrationalFreqCm1} cm⁻¹
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">InChIKey</span>
                  <span className="text-[11px] font-mono text-slate-300 truncate block" title={selectedMolecule.inChIKey}>
                    {selectedMolecule.inChIKey.substring(0, 9)}...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane (3 cols): Astronomical Environments & Habitability Context */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-xs font-semibold">
                <Globe2 className="w-4 h-4 text-cyan-400" />
                <span>Detected Cosmic Environments</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Where this prebiotic compound has been directly confirmed in astronomical spectroscopy:
              </p>
              <div className="flex flex-col gap-1.5 mt-1">
                {selectedMolecule.detectedEnvironments.map((env, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-slate-950/60 border border-white/5 text-xs text-slate-200 flex items-start gap-2"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <span>{env}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prebiotic Origin of Life Pipeline */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 text-indigo-300 font-mono text-xs font-semibold">
                <Dna className="w-4 h-4 text-indigo-400" />
                <span>Prebiotic Significance</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedMolecule.astrobiologicalRelevance}
              </p>
            </div>

            {/* External Verified Database Connectors */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 flex flex-col gap-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                External Research Connectors
              </span>
              <a
                href={`https://pubchem.ncbi.nlm.nih.gov/compound/${selectedMolecule.pubchemCid}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-white/5 text-xs text-cyan-300 transition"
              >
                <span>PubChem National Library of Medicine</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://webbook.nist.gov/cgi/cbook.cgi?ID=${selectedMolecule.casNumber}&Units=SI&Mask=80`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-white/5 text-xs text-cyan-300 transition"
              >
                <span>NIST Chemistry WebBook (IR Spectra)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://spherex.caltech.edu/Science.html"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-white/5 text-xs text-cyan-300 transition"
              >
                <span>Caltech SPHEREx Interstellar Ice Survey</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      ) : (
        /* Extremophile Biology Tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {EXTREMOPHILE_TARGETS.map((target) => (
            <div
              key={target.id}
              className="p-5 rounded-2xl bg-gradient-to-b from-[#0C1635] to-[#070D20] border border-violet-500/25 shadow-xl flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 font-mono text-[11px] font-semibold">
                    {target.extremophileClass}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    PDB: {target.pdbId}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-white">
                  {target.name}
                </h3>
                <p className="text-xs text-cyan-300 font-mono mt-0.5">
                  Organism: <em>{target.organism}</em>
                </p>

                <div className="mt-4 flex flex-col gap-2 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                    <strong className="text-slate-400 block text-[10px] font-mono uppercase mb-1">
                      Cosmic Planetary Analog:
                    </strong>
                    {target.cosmicAnalogLocation}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                    <strong className="text-slate-400 block text-[10px] font-mono uppercase mb-1">
                      Survival Mechanism & Biological Function:
                    </strong>
                    {target.biologicalFunction}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">
                  UniProt: <strong className="text-white">{target.uniprotAccession}</strong>
                </span>
                <a
                  href={`https://www.uniprot.org/uniprotkb/${target.uniprotAccession}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/50 text-violet-200 font-medium transition flex items-center gap-1.5"
                >
                  <span>UniProt Record</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
