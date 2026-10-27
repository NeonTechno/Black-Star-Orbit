/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLACK STAR ORBIT — Official Opening Page & Universe Hero Gateway
 * Featuring the user's custom Black Star Universe presentation artwork.
 */

import React from 'react';
import type { AppPage } from '../types';
import { 
  Telescope, 
  Orbit, 
  Compass, 
  Globe, 
  ArrowDown, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Radio,
  FlaskConical,
  ExternalLink
} from 'lucide-react';
import { BlackStarLogo } from '../../components/common/BlackStarLogo';

interface OpeningHeroGatewayProps {
  onNavigate: (page: AppPage) => void;
  onScrollToContent?: () => void;
}

export const OpeningHeroGateway: React.FC<OpeningHeroGatewayProps> = ({
  onNavigate,
  onScrollToContent,
}) => {
  const handleScrollDown = () => {
    if (onScrollToContent) {
      onScrollToContent();
    } else {
      const target = document.getElementById('observatories-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative w-full min-h-[92vh] lg:min-h-[96vh] rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_20px_70px_rgba(0,0,0,0.85)] flex flex-col justify-between select-none">
      {/* 1. High-Resolution Opening Artwork Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <img
          src="/assets/cosmic-dust-universe.jpg"
          alt="Black Star Orbit Cosmic Dust Deep Universe"
          className="w-full h-full object-cover object-center scale-100 hover:scale-102 transition-transform duration-1000 ease-out filter brightness-95"
        />

        {/* Ambient Vignette & Gradient Overlays to guarantee readable high-contrast typography */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-[#050811]/45 to-[#050811]/70" />
        <div className="absolute inset-0 bg-radial-[circle_at_center] from-transparent via-[#050811]/25 to-[#050811]/85" />
        
        {/* Subtle Neon Horizon Glow matching the purple-orange orbital arc */}
        <div className="absolute top-1/2 left-0 right-0 h-40 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Top Mission Status Bar */}
      <div className="relative z-10 w-full p-4 sm:p-6 lg:p-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <BlackStarLogo size="md" />
          <div className="flex flex-col">
            <span className="font-nasa text-sm sm:text-base font-bold tracking-wider text-white">
              BLACK STAR ORBIT
            </span>
            <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest">
              NASA SPACE APPS CHALLENGE 2026
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#050811]/80 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            TELEMETRY ONLINE
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 backdrop-blur-md border border-amber-800/40 text-xs font-mono text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            CITIZEN SCIENCE LAB
          </span>
        </div>
      </div>

      {/* 3. Hero Centerpiece Headline & Call to Action */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center space-y-6 flex flex-col items-center justify-center">
        {/* Mission Kicker Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#071126]/80 backdrop-blur-md border border-cyan-400/40 shadow-[0_0_20px_rgba(56,189,248,0.25)] text-xs font-mono font-semibold tracking-widest text-cyan-200 uppercase">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multiscale Cosmic Intelligence & Planetary Platform</span>
        </div>

        {/* Grand Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-nasa tracking-wider text-white uppercase leading-[1.02] drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
          BLACK STAR <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-300 drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
            ORBIT
          </span>
        </h1>

        {/* Narrative Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-200 font-sans leading-relaxed drop-shadow-md">
          A full-stack astronomy and planetary intelligence workbench powered by real NASA open data.
          Explore the cosmos across 102 infrared spectroscopic bands, investigate dynamical outer solar system
          candidate evidence, and observe the universe at multiple scales.
        </p>

        {/* High-Impact Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
          <button
            onClick={() => onNavigate('spherex')}
            className="nasa-pill px-7 py-3.5 text-xs sm:text-sm font-bold tracking-widest cursor-pointer shadow-[0_0_25px_rgba(56,189,248,0.55)] hover:shadow-[0_0_35px_rgba(56,189,248,0.8)] transition-all flex items-center gap-2"
          >
            <Telescope className="w-4 h-4 text-cyan-300" />
            <span>LAUNCH SPHEREx</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('planet-x')}
            className="px-6 py-3.5 rounded-full bg-[#0E1B38]/90 hover:bg-[#16274E] text-[#F8FAFC] border border-indigo-500/50 hover:border-indigo-400 font-nasa text-xs sm:text-sm font-bold tracking-wider shadow-lg hover:shadow-indigo-900/40 transition-all cursor-pointer backdrop-blur-md flex items-center gap-2"
          >
            <Orbit className="w-4 h-4 text-indigo-400" />
            <span>PLANET X LAB</span>
          </button>

          <button
            onClick={() => onNavigate('astrobiology')}
            className="px-6 py-3.5 rounded-full bg-[#07241E]/90 hover:bg-[#0B382F] text-emerald-200 border border-emerald-500/50 hover:border-emerald-400 font-nasa text-xs sm:text-sm font-bold tracking-wider shadow-lg hover:shadow-emerald-950/40 transition-all cursor-pointer backdrop-blur-md flex items-center gap-2"
          >
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            <span>ASTROBIOLOGY LAB</span>
          </button>

          <button
            onClick={() => onNavigate('universe')}
            className="px-5 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.15] font-nasa text-xs sm:text-sm font-semibold tracking-wider transition-all cursor-pointer backdrop-blur-md flex items-center gap-1.5"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>3D COSMOS</span>
          </button>
        </div>
      </div>

      {/* 4. Bottom Scientific Telemetry Rail & Scroll Cue */}
      <div className="relative z-10 w-full p-4 sm:p-6 lg:p-8 border-t border-white/[0.08] backdrop-blur-md bg-[#050811]/70">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 4 Telemetry Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full md:w-auto text-left">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">SPECTRAL SPAN</span>
              <span className="text-xs sm:text-sm font-nasa font-bold text-white block">102 BANDS (0.75–5.0µm)</span>
              <span className="text-[10px] font-mono text-cyan-400 block">All-Sky Infrared LVF</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">DYNAMICAL TARGET</span>
              <span className="text-xs sm:text-sm font-nasa font-bold text-white block">PLANET X (P9)</span>
              <span className="text-[10px] font-mono text-indigo-300 block">eTNO Orbital Clustering</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">ASTROBIOLOGY</span>
              <span className="text-xs sm:text-sm font-nasa font-bold text-white block">PREBIOTIC ICE</span>
              <span className="text-[10px] font-mono text-emerald-400 block">H₂O, CO₂, CO & Organics</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">PROVENANCE</span>
              <span className="text-xs sm:text-sm font-nasa font-bold text-white block">NASA / IPAC IRSA</span>
              <span className="text-[10px] font-mono text-amber-300 block">ObsCore Open Spec</span>
            </div>
          </div>

          {/* Scroll Cue to Proceed to Lower Observatories */}
          <button
            onClick={handleScrollDown}
            className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-300 hover:text-white transition group cursor-pointer self-center md:self-auto py-1 px-3 rounded-full bg-cyan-950/40 border border-cyan-800/40 hover:border-cyan-400/60 shadow-sm"
            title="Scroll Down to Research Observatories"
          >
            <span>EXPLORE RESEARCH CONSOLES</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
