/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — Scientific Uncertainty Indicators & Bayesian Posteriors
 */

import React from 'react';
import { PlanetXHypothesisParams } from '../../types/index.ts';
import { HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface UncertaintyIndicatorProps {
  hypothesis: PlanetXHypothesisParams;
}

export const UncertaintyIndicator: React.FC<UncertaintyIndicatorProps> = ({ hypothesis }) => {
  const parameters = [
    {
      name: 'Planetary Mass (M)',
      bestFit: `${hypothesis.massEarths} M⊕`,
      oneSigma: '4.9 – 8.4 M⊕ (68% CL)',
      twoSigma: '3.8 – 11.2 M⊕ (95% CL)',
      status: 'CONFIRMED DYNAMICAL RANGE',
      barPercent: 55,
      note: 'Lower bound constrained by eTNO clustering lifetime; upper bound constrained by Cassini ephemeris data.',
    },
    {
      name: 'Semi-major Axis (a)',
      bestFit: `${hypothesis.semiMajorAxisAU} AU`,
      oneSigma: '300 – 520 AU (68% CL)',
      twoSigma: '240 – 680 AU (95% CL)',
      status: 'HIGHLY PROBABLE',
      barPercent: 62,
      note: 'Required to generate strong secular resonance with Sedna and 2012 VP113.',
    },
    {
      name: 'Orbital Inclination (i)',
      bestFit: `${hypothesis.inclinationDeg}°`,
      oneSigma: '11° – 21° (68% CL)',
      twoSigma: '7° – 28° (95% CL)',
      status: 'MODERATE UNCERTAINTY',
      barPercent: 48,
      note: 'Explains the non-zero mutual tilt of the clustered orbital planes relative to the ecliptic.',
    },
    {
      name: 'True Anomaly / Sky Location',
      bestFit: 'Near Aphelion (~440 AU)',
      oneSigma: '±25° along Northern Corridor',
      twoSigma: '±45° along Ecliptic Plane',
      status: 'PRIMARY SEARCH CHALLENGE',
      barPercent: 35,
      note: 'Highest uncertainty parameter due to Keplerian dwell time at aphelion (Taurus / Orion constellation).',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <HelpCircle className="h-5 w-5 text-indigo-400" />
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Bayesian Posterior Probability & Scientific Uncertainty
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              Quantitative 1σ (68%) and 2σ (95%) confidence intervals (Batygin & Brown 2021)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parameters.map((param) => (
          <div
            key={param.name}
            className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs font-mono"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-slate-200">{param.name}</span>
              <span className="text-indigo-400 font-semibold">{param.bestFit}</span>
            </div>

            {/* Confidence Bar Visualizer */}
            <div className="space-y-1">
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 relative">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full"
                  style={{ width: `${param.barPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1σ: {param.oneSigma}</span>
                <span>2σ: {param.twoSigma}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-1">
              {param.note}
            </p>
          </div>
        ))}
      </div>

      {/* Observational Bias Note */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300 font-mono flex items-start space-x-2.5">
        <AlertCircle className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-cyan-300 font-semibold text-[11px] uppercase tracking-wider block">
            Observational Selection Bias Correction:
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Telescopes preferentially observe during specific seasons and celestial conditions. Brown & Batygin (2021) performed 100,000 Monte Carlo survey bias simulations matching the exact pointing histories of Pan-STARRS, DES, and Subaru HSC, concluding the empirical clustering is authentic at the 99.6% confidence level.
          </p>
        </div>
      </div>
    </div>
  );
};
