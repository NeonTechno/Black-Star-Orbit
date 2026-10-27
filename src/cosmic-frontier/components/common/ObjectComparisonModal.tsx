/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLACK STAR ORBIT — Interactive Scientific Object Comparison Matrix
 * Compare planets, dwarf planets, exoplanets, and hypothetical bodies side-by-side.
 */

import React, { useState } from 'react';
import type { SolarSystemObject } from '../../types';
import { SOLAR_SYSTEM_OBJECTS } from '../../data/solarSystemData';
import {
  X,
  Scale,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Layers,
  Thermometer,
  Orbit,
  Globe,
  Check,
} from 'lucide-react';

interface ObjectComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialObjectA?: SolarSystemObject;
  initialObjectB?: SolarSystemObject;
}

export const ObjectComparisonModal: React.FC<ObjectComparisonModalProps> = ({
  isOpen,
  onClose,
  initialObjectA,
  initialObjectB,
}) => {
  const [objectAId, setObjectAId] = useState<string>(initialObjectA?.id || 'earth');
  const [objectBId, setObjectBId] = useState<string>(initialObjectB?.id || 'mars');

  const objA = SOLAR_SYSTEM_OBJECTS.find((o) => o.id === objectAId) || SOLAR_SYSTEM_OBJECTS[2];
  const objB = SOLAR_SYSTEM_OBJECTS.find((o) => o.id === objectBId) || SOLAR_SYSTEM_OBJECTS[3];

  if (!isOpen) return null;

  const parseNum = (val: number | string | undefined | null, fallback = 1): number => {
    if (typeof val === 'number') return val;
    if (!val) return fallback;
    const parsed = parseFloat(String(val).replace(/,/g, ''));
    return isNaN(parsed) ? fallback : parsed;
  };

  const radA = parseNum(objA.radiusKm, 1);
  const radB = parseNum(objB.radiusKm, 1);

  // Comparison metrics calculations
  const radiusRatio = (radB / radA).toFixed(2);
  const periodRatio = (parseNum(objB.orbitalPeriodYears, 1) / parseNum(objA.orbitalPeriodYears, 1)).toFixed(2);
  const distanceRatio = (parseNum(objB.semiMajorAxisAU, 1) / parseNum(objA.semiMajorAxisAU, 1)).toFixed(2);

  const presets = [
    { label: 'Earth vs Mars', a: 'earth', b: 'mars' },
    { label: 'Earth vs Ceres', a: 'earth', b: 'ceres' },
    { label: 'Earth vs Planet X', a: 'earth', b: 'planet-x' },
    { label: 'Sedna vs Planet X', a: 'sedna', b: 'planet-x' },
    { label: 'Jupiter vs Saturn', a: 'jupiter', b: 'saturn' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-[#070D1E]/95 border border-[#38BDF8]/40 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_35px_rgba(56,189,248,0.2)] overflow-hidden flex flex-col max-h-[90vh] electric-border-active">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-[#0B1630]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono tracking-tight text-[#F8FAFC]">
                Scientific Celestial Comparison Matrix
              </h3>
              <p className="text-xs text-[#94A3B8] font-mono">
                Physical dimensions, orbital mechanics, and gravitational parameters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex items-center gap-2 p-3 px-6 bg-[#050B1A] border-b border-white/5 overflow-x-auto text-xs font-mono">
          <span className="text-[#64748B] shrink-0">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setObjectAId(p.a);
                setObjectBId(p.b);
              }}
              className={`px-2.5 py-1 rounded-lg border transition shrink-0 ${
                objectAId === p.a && objectBId === p.b
                  ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#72E5F7] font-semibold'
                  : 'bg-white/5 border-white/10 text-[#94A3B8] hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Comparison Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Target Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Object A */}
            <div className="p-4 rounded-2xl bg-[#0B1630] border border-[#38BDF8]/30 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#38BDF8] block font-bold">
                Reference Body (A)
              </span>
              <select
                value={objectAId}
                onChange={(e) => setObjectAId(e.target.value)}
                className="w-full bg-[#050B1A] border border-white/15 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-[#38BDF8] font-mono"
              >
                {SOLAR_SYSTEM_OBJECTS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.type})
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] pt-1">
                <span>Radius: {objA.radiusKm.toLocaleString()} km</span>
                <span>Orbit: {objA.semiMajorAxisAU} AU</span>
              </div>
            </div>

            {/* Object B */}
            <div className="p-4 rounded-2xl bg-[#0B1630] border border-[#8B5CF6]/30 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A78BFA] block font-bold">
                Comparison Body (B)
              </span>
              <select
                value={objectBId}
                onChange={(e) => setObjectBId(e.target.value)}
                className="w-full bg-[#050B1A] border border-white/15 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-[#8B5CF6] font-mono"
              >
                {SOLAR_SYSTEM_OBJECTS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.type})
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] pt-1">
                <span>Radius: {objB.radiusKm.toLocaleString()} km</span>
                <span>Orbit: {objB.semiMajorAxisAU} AU</span>
              </div>
            </div>
          </div>

          {/* Metric Comparison Rows */}
          <div className="space-y-3 font-mono text-xs">
            {/* Radius Metric */}
            <div className="p-4 rounded-2xl bg-[#0B1630]/70 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Mean Radius (km)</span>
                <span className="text-[#72E5F7] font-bold">
                  B is {radiusRatio}x size of A
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#38BDF8]">{objA.name}</span>
                    <span className="text-white">{objA.radiusKm.toLocaleString()} km</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden">
                    <div
                      className="h-full bg-[#38BDF8]"
                      style={{
                        width: `${Math.min(100, (radA / Math.max(radA, radB)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#A78BFA]">{objB.name}</span>
                    <span className="text-white">{objB.radiusKm.toLocaleString()} km</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden">
                    <div
                      className="h-full bg-[#8B5CF6]"
                      style={{
                        width: `${Math.min(100, (radB / Math.max(radA, radB)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Distance / Semi-Major Axis */}
            <div className="p-4 rounded-2xl bg-[#0B1630]/70 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Semi-Major Axis (AU from Sun)</span>
                <span className="text-[#72E5F7] font-bold">
                  B is {distanceRatio}x distance of A
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#38BDF8]">{objA.name}</span>
                    <span className="text-white">{objA.semiMajorAxisAU} AU</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden">
                    <div
                      className="h-full bg-[#38BDF8]"
                      style={{
                        width: `${Math.min(100, (objA.semiMajorAxisAU / Math.max(objA.semiMajorAxisAU, objB.semiMajorAxisAU || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#A78BFA]">{objB.name}</span>
                    <span className="text-white">{objB.semiMajorAxisAU} AU</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden">
                    <div
                      className="h-full bg-[#8B5CF6]"
                      style={{
                        width: `${Math.min(100, (objB.semiMajorAxisAU / Math.max(objA.semiMajorAxisAU, objB.semiMajorAxisAU || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Orbital Period */}
            <div className="p-4 rounded-2xl bg-[#0B1630]/70 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Orbital Period (Years)</span>
                <span className="text-[#72E5F7] font-bold">
                  B takes {periodRatio}x longer to orbit
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#38BDF8]">{objA.name}</span>
                    <span className="text-white">{objA.orbitalPeriodYears} yrs</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden">
                    <div
                      className="h-full bg-[#38BDF8]"
                      style={{
                        width: `${Math.min(100, (objA.orbitalPeriodYears / Math.max(objA.orbitalPeriodYears, objB.orbitalPeriodYears || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#A78BFA]">{objB.name}</span>
                    <span className="text-white">{objB.orbitalPeriodYears} yrs</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden">
                    <div
                      className="h-full bg-[#8B5CF6]"
                      style={{
                        width: `${Math.min(100, (objB.orbitalPeriodYears / Math.max(objA.orbitalPeriodYears, objB.orbitalPeriodYears || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Eccentricity & Perihelion/Aphelion Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0B1630] border border-white/10 space-y-1">
                <span className="text-[10px] text-[#94A3B8] block">{objA.name} Range</span>
                <div className="text-white text-xs">
                  q: {objA.perihelionAU} AU → Q: {objA.aphelionAU} AU (e: {objA.eccentricity})
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B1630] border border-white/10 space-y-1">
                <span className="text-[10px] text-[#94A3B8] block">{objB.name} Range</span>
                <div className="text-white text-xs">
                  q: {objB.perihelionAU} AU → Q: {objB.aphelionAU} AU (e: {objB.eccentricity})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0B1630] flex items-center justify-between">
          <span className="text-xs font-mono text-[#64748B]">
            Data Source: NASA JPL Horizons Analytical Ephemerides
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
