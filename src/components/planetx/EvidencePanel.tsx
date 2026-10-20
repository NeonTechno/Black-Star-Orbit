/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — Planet X Evidence & Observational Constraints Panel
 */

import React, { useState } from 'react';
import { ExtremeTNO, PlanetXHypothesisParams } from '../../types/index.ts';
import { calculateClusteringSignificance } from '../../science/orbitalMechanics.ts';
import { ShieldCheck, BarChart3, Sliders, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';

interface EvidencePanelProps {
  etnoCatalog: ExtremeTNO[];
  hypothesis: PlanetXHypothesisParams;
  onUpdateHypothesis: (params: PlanetXHypothesisParams) => void;
  onExplainEvidence: () => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  etnoCatalog,
  hypothesis,
  onUpdateHypothesis,
  onExplainEvidence,
}) => {
  const stats = calculateClusteringSignificance(etnoCatalog);
  const [mass, setMass] = useState<number>(hypothesis.massEarths);
  const [semiMajor, setSemiMajor] = useState<number>(hypothesis.semiMajorAxisAU);
  const [ecc, setEcc] = useState<number>(hypothesis.eccentricity);
  const [inc, setInc] = useState<number>(hypothesis.inclinationDeg);

  const handleApplyParams = () => {
    const perihelion = semiMajor * (1 - ecc);
    const aphelion = semiMajor * (1 + ecc);
    const orbitalPeriod = Math.round(Math.pow(semiMajor, 1.5));

    onUpdateHypothesis({
      ...hypothesis,
      massEarths: mass,
      semiMajorAxisAU: semiMajor,
      perihelionAU: Number(perihelion.toFixed(1)),
      aphelionAU: Number(aphelion.toFixed(1)),
      eccentricity: ecc,
      inclinationDeg: inc,
      orbitalPeriodYears: orbitalPeriod,
    });
  };

  return (
    <div className="space-y-4">
      {/* Evidence & Statistical Rigor Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Rayleigh Non-Randomness */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
            <span className="flex items-center gap-1 font-semibold">
              <BarChart3 className="h-4 w-4" /> Rayleigh Test (ϖ)
            </span>
            <span className="text-emerald-400 font-bold">p = {stats.pValueClustering}</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats.meanVarpiDeg}°
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            Mean longitude of perihelion for physical eTNO cluster. Probability of random alignment is &lt; 0.1% (3.4σ).
          </p>
        </div>

        {/* Card 2: Angular Dispersion */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-purple-400">
            <span className="flex items-center gap-1 font-semibold">
              <ShieldCheck className="h-4 w-4" /> Orbital Pole Dispersion
            </span>
            <span className="text-slate-300">Δθ ≈ {stats.dispersionDeg}°</span>
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono">
            R = {stats.rayleighR}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            Vector resultant length measuring orbital plane mutual inclination confinement.
          </p>
        </div>

        {/* Card 3: Observational Blind Spot */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400">
            <span className="flex items-center gap-1 font-semibold">
              <AlertTriangle className="h-4 w-4" /> Why Not Discovered Yet?
            </span>
            <span className="text-amber-300 font-bold">Aphelion Blind Spot</span>
          </div>
          <div className="text-xl font-bold text-amber-200 font-mono">
            d ≈ 400 – 480 AU
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            Planet spends ~70% of orbit near aphelion projected against the dense galactic plane in Taurus/Orion.
          </p>
        </div>
      </div>

      {/* Interactive Hypothesis Parameter Explorer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Batygin & Brown (2021) Theoretical Parameter Sandbox
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Adjust orbital perturbation model to evaluate observational coverage
              </p>
            </div>
          </div>

          <button
            onClick={onExplainEvidence}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Explain Evidence with AI</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {/* Mass */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Mass (M⊕):</span>
              <span className="text-indigo-400 font-bold">{mass.toFixed(1)} Earths</span>
            </div>
            <input
              type="range"
              min={3.0}
              max={15.0}
              step={0.5}
              value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              aria-label="Planet X hypothetical mass in Earth masses"
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Best fit: 6.2 (+2.2 / −1.3) M⊕</span>
          </div>

          {/* Semi-major Axis */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Semi-major Axis (a):</span>
              <span className="text-cyan-400 font-bold">{semiMajor} AU</span>
            </div>
            <input
              type="range"
              min={280}
              max={650}
              step={10}
              value={semiMajor}
              onChange={(e) => setSemiMajor(Number(e.target.value))}
              aria-label="Planet X semi-major axis in Astronomical Units"
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Best fit: 380 (+140 / −80) AU</span>
          </div>

          {/* Eccentricity */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Eccentricity (e):</span>
              <span className="text-amber-400 font-bold">{ecc.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.15}
              max={0.65}
              step={0.05}
              value={ecc}
              onChange={(e) => setEcc(Number(e.target.value))}
              aria-label="Planet X orbital eccentricity"
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Best fit: 0.35 (range 0.2–0.5)</span>
          </div>

          {/* Inclination */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Inclination (i):</span>
              <span className="text-purple-400 font-bold">{inc.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min={8.0}
              max={35.0}
              step={1.0}
              value={inc}
              onChange={(e) => setInc(Number(e.target.value))}
              aria-label="Planet X orbital plane inclination in degrees"
              className="w-full accent-purple-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Best fit: 16° ± 5°</span>
          </div>
        </div>

        {/* Update Button */}
        <div className="flex justify-end">
          <button
            onClick={handleApplyParams}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold rounded-lg transition"
          >
            Update Simulation & Orbital Dynamics
          </button>
        </div>
      </div>
    </div>
  );
};
