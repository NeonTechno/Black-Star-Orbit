/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLACK STAR ORBIT — Holographic Celestial Object Inspector
 * Interactive 3D preview, physical metrics, historical facts, and provenance badges.
 */

import React, { useRef, useEffect, useState } from 'react';
import type { SolarSystemObject } from '../../types';
import {
  X,
  Compass,
  Orbit,
  Sparkles,
  ExternalLink,
  Bookmark,
  Check,
  Scale,
  Maximize2,
  Info,
  ShieldCheck,
  Layers,
  Thermometer,
  RotateCw,
} from 'lucide-react';

interface CelestialObjectInspectorProps {
  object: SolarSystemObject | null;
  onClose: () => void;
  onOpenIn3D?: (objectId: string) => void;
  onCompare?: (object: SolarSystemObject) => void;
  onAskAI?: (objectName: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (object: SolarSystemObject) => void;
}

export const CelestialObjectInspector: React.FC<CelestialObjectInspectorProps> = ({
  object,
  onClose,
  onOpenIn3D,
  onCompare,
  onAskAI,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Render rotating celestial sphere with atmospheric rim
  useEffect(() => {
    if (!object) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      angle += 0.008;
      setRotation(angle);

      const w = (canvas.width = canvas.offsetWidth || 300);
      const h = (canvas.height = canvas.offsetHeight || 300);
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.38;

      ctx.clearRect(0, 0, w, h);

      // Deep space background glow behind planet
      const bgGlow = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.5);
      bgGlow.addColorStop(0, `${object.color || '#38BDF8'}33`);
      bgGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      // Spherical body base
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // Sphere shading gradient (day/night shadow terminator as in image_00efca33)
      const grad = ctx.createRadialGradient(
        cx - r * 0.38,
        cy - r * 0.32,
        r * 0.1,
        cx,
        cy,
        r
      );
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.25, object.color || '#72E5F7');
      grad.addColorStop(0.65, '#0F1E3D');
      grad.addColorStop(0.95, '#050B1A');
      grad.addColorStop(1, '#02050D');

      ctx.fillStyle = grad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      // Surface details (crater ripples / cloud bands rotating)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let i = 0; i < 8; i++) {
        const offset = ((i * 35 + angle * 40) % (r * 2)) - r;
        ctx.beginPath();
        ctx.ellipse(cx + offset, cy + (i - 4) * 16, r * 0.65, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // If Ceres, render Occator Crater bright salt faculae
      if (object.id === 'ceres') {
        const spotX = cx - r * 0.15 + Math.sin(angle) * 12;
        const spotY = cy - r * 0.1;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#72E5F7';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(spotX, spotY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // Atmospheric rim highlight
      ctx.strokeStyle = `${object.color || '#38BDF8'}88`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = object.color || '#38BDF8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [object]);

  if (!object) return null;

  const copyMetadata = () => {
    const text = `${object.name} (${object.type})\nSemi-Major Axis: ${object.semiMajorAxisAU} AU\nOrbital Period: ${object.orbitalPeriodYears} yrs\nRadius: ${object.radiusKm} km\nStatus: ${object.statusLabel}\nSource: ${object.dataSource}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-[#070D1E]/95 border border-[#38BDF8]/40 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_40px_rgba(56,189,248,0.2)] overflow-hidden flex flex-col max-h-[92vh] electric-border-active">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-[#0B1630]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg"
              style={{
                backgroundColor: `${object.color}15`,
                borderColor: `${object.color}50`,
                color: object.color,
              }}
            >
              <Orbit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-mono tracking-tight text-[#F8FAFC]">
                  {object.name}
                </h3>
                <span
                  className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-semibold"
                  style={{
                    backgroundColor: `${object.color}20`,
                    color: object.color,
                    borderColor: `${object.color}40`,
                  }}
                >
                  {object.type}
                </span>
                {object.isHypothetical && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#C084FC] border border-[#8B5CF6]/40">
                    Hypothetical Model
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                {object.statusLabel} • Ephemeris Ref: {object.dataSource?.split('&')[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(object)}
                className={`p-2 rounded-xl border transition ${
                  isBookmarked
                    ? 'bg-[#F5C451]/20 border-[#F5C451] text-[#F5C451]'
                    : 'bg-white/5 border-white/10 text-[#94A3B8] hover:text-white'
                }`}
                title={isBookmarked ? 'Saved to Collection' : 'Bookmark to Collection'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* 3D Celestial Rotating Visualizer (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#050814] border border-white/10 relative overflow-hidden group">
              <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] font-mono text-[#94A3B8] bg-black/60 px-2.5 py-1 rounded-full border border-white/10">
                <RotateCw className="w-3 h-3 text-[#38BDF8] animate-spin" />
                <span>Real-Time Rotation Simulation</span>
              </div>

              <div className="w-full aspect-square max-w-[280px] flex items-center justify-center">
                <canvas ref={canvasRef} className="w-full h-full object-contain" />
              </div>

              <div className="mt-2 text-center">
                <span className="text-[11px] font-mono text-[#72E5F7] tracking-wider uppercase">
                  {object.name}
                </span>
                <span className="block text-[10px] text-[#64748B] font-mono">
                  Axial Tilt: {object.inclinationDeg}° • Radius: {object.radiusKm.toLocaleString()} km
                </span>
              </div>
            </div>

            {/* Scientific Insights & Super-Universe Fact Card (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Historical & Observational Highlights (Inspired by Super-Universe Ceres Fact Card) */}
              <div className="p-4 rounded-2xl bg-[#0B1630]/90 border border-[#38BDF8]/30 shadow-lg space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
                  <span className="text-[#38BDF8] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4" /> Celestial Profile & Context
                  </span>
                  <span className="text-[#94A3B8]">HUMANITY'S REACH</span>
                </div>

                <div className="text-xs sm:text-sm text-[#F8FAFC] leading-relaxed space-y-2">
                  <p>{object.description}</p>
                  <p className="text-[#A7B4CC] text-xs font-mono bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <strong>Dynamical Context:</strong> {object.scientificContext}
                  </p>
                </div>

                {object.discoverers && (
                  <div className="text-[11px] font-mono text-[#94A3B8] pt-1 border-t border-white/5 flex items-center justify-between">
                    <span>Discovered: {object.discoveryYear || 'Ancient'}</span>
                    <span className="text-[#72E5F7] truncate max-w-[240px]">By {object.discoverers}</span>
                  </div>
                )}
              </div>

              {/* Physical & Orbital Measurements Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#0B1630] border border-white/10">
                  <span className="text-[10px] text-[#94A3B8] block">Semi-Major Axis</span>
                  <span className="text-[#F8FAFC] font-bold text-sm">{object.semiMajorAxisAU} AU</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0B1630] border border-white/10">
                  <span className="text-[10px] text-[#94A3B8] block">Orbital Period</span>
                  <span className="text-[#38BDF8] font-bold text-sm">
                    {object.orbitalPeriodYears > 1
                      ? `${object.orbitalPeriodYears} yrs`
                      : `${(object.orbitalPeriodYears * 365.25).toFixed(0)} days`}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0B1630] border border-white/10">
                  <span className="text-[10px] text-[#94A3B8] block">Eccentricity (e)</span>
                  <span className="text-[#F5C451] font-bold text-sm">{object.eccentricity}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0B1630] border border-white/10">
                  <span className="text-[10px] text-[#94A3B8] block">Inclination (i)</span>
                  <span className="text-[#A78BFA] font-bold text-sm">{object.inclinationDeg}°</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0B1630] border border-white/10">
                  <span className="text-[10px] text-[#94A3B8] block">Perihelion (q)</span>
                  <span className="text-emerald-400 font-bold text-sm">{object.perihelionAU} AU</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0B1630] border border-white/10">
                  <span className="text-[10px] text-[#94A3B8] block">Aphelion (Q)</span>
                  <span className="text-rose-400 font-bold text-sm">{object.aphelionAU} AU</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0B1630] border border-white/10">
                  <span className="text-[10px] text-[#94A3B8] block">Radius</span>
                  <span className="text-[#F8FAFC] font-bold text-sm">{object.radiusKm.toLocaleString()} km</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0B1630] border border-white/10">
                  <span className="text-[10px] text-[#94A3B8] block">Mass (Relative)</span>
                  <span className="text-[#72E5F7] font-bold text-sm truncate block">
                    {object.massEarthRelative} M⊕
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scientific Provenance Banner */}
          <div className="p-3.5 rounded-xl bg-[#0B1630]/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>
                <strong>Data Provenance:</strong> {object.dataSource}
              </span>
            </div>
            <button
              onClick={copyMetadata}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#F8FAFC] font-mono flex items-center justify-center gap-1.5 transition shrink-0"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : null}
              <span>{isCopied ? 'Copied' : 'Copy Scientific Record'}</span>
            </button>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0B1630] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {onCompare && (
              <button
                onClick={() => {
                  onCompare(object);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#0B1630] hover:bg-[#15254A] border border-[#38BDF8]/40 hover:border-[#38BDF8] text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5 transition"
              >
                <Scale className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Compare with Another Object</span>
              </button>
            )}

            {onOpenIn3D && (
              <button
                onClick={() => {
                  onOpenIn3D(object.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#0B1630] hover:bg-[#15254A] border border-[#8B5CF6]/40 hover:border-[#8B5CF6] text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5 transition"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Inspect in 3D Solar System</span>
              </button>
            )}

            {onAskAI && (
              <button
                onClick={() => {
                  onAskAI(object.name);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6]/20 to-[#38BDF8]/20 hover:from-[#8B5CF6]/30 hover:to-[#38BDF8]/30 border border-[#38BDF8]/50 text-xs font-semibold text-white flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5C451]" />
                <span>Ask AI to Explain Physics</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
