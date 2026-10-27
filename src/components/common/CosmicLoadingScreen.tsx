/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLACK STAR ORBIT — Cosmic Loading Screen & Intro Display
 * Displays the official cosmic dust universe artwork as the loading visual and intro banner.
 */

import React, { useState, useEffect } from 'react';
import { Telescope, Orbit, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { BlackStarLogo } from './BlackStarLogo';

interface CosmicLoadingScreenProps {
  isLoading: boolean;
  onEnter?: () => void;
  showIntroMode?: boolean;
  onCloseIntro?: () => void;
}

const LOADING_STAGES = [
  'INITIALIZING BLACK STAR ORBIT ENGINE...',
  'CALIBRATING SPHEREx 102-BAND INFRARED DETECTOR...',
  'SYNTHESIZING DEEP-SKY COSMIC DUST NEBULAE...',
  'ALIGNING KUIPER BELT & EXTREME TNO ORBITAL PLANES...',
  'CALCULATING GROUNDED TELEMETRY VECTORS...',
  'SYSTEM READY • ALL TELEMETRY CHANNELS NOMINAL',
];

export const CosmicLoadingScreen: React.FC<CosmicLoadingScreenProps> = ({
  isLoading,
  onEnter,
  showIntroMode = false,
  onCloseIntro,
}) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [readyToEnter, setReadyToEnter] = useState(false);

  useEffect(() => {
    if (!isLoading && !showIntroMode) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setReadyToEnter(true);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 18 + 12);
        return Math.min(next, 100);
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isLoading, showIntroMode]);

  useEffect(() => {
    const stage = Math.min(
      Math.floor((progress / 100) * LOADING_STAGES.length),
      LOADING_STAGES.length - 1
    );
    setStageIndex(stage);
  }, [progress]);

  // When loading completes and user hasn't explicitly entered in intro mode
  useEffect(() => {
    if (!isLoading && !showIntroMode && progress >= 100) {
      const timer = setTimeout(() => {
        onEnter?.();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLoading, progress, onEnter, showIntroMode]);

  if (!isLoading && !showIntroMode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050711]">
      {/* Background Cosmic Dust Artwork (Pure Cosmic Dust, No Black Star) */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/assets/cosmic-dust-universe.jpg"
          alt="Black Star Orbit Cosmic Dust Deep Universe"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out select-none"
        />
        {/* Deep space translucent gradient overlay for maximum HUD contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050711] via-[#050711]/45 to-[#050711]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#050711_95%)]" />
        
        {/* Subtle holographic cyan scanlines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #38bdf8, #38bdf8 1px, transparent 1px, transparent 4px)',
          }}
        />
      </div>

      {/* Top Telemetry Header */}
      <header className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-3">
          <BlackStarLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-nasa text-xs font-bold text-white tracking-wider">
                BLACK STAR ORBIT
              </span>
              <span className="text-[10px] font-nasa font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                NASA SPACE APPS 2026
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-mono tracking-wider mt-0.5">
              COSMIC DUST OBSERVATION & TELEMETRY PLATFORM
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-cyan-300/80 bg-slate-950/75 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>IPAC / IRSA SPECIFICATION CALIBRATED</span>
        </div>
      </header>

      {/* Center Holographic Loading / Intro Card */}
      <main className="relative z-20 w-full max-w-2xl px-6 py-8 mx-4 rounded-3xl bg-slate-950/80 border border-cyan-500/40 shadow-[0_0_60px_rgba(56,189,248,0.25)] backdrop-blur-xl text-center space-y-6">
        {/* HUD Reticle Corners */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>{showIntroMode ? 'MISSION INTRO HORIZON' : 'CALIBRATING OBSERVATIONAL INSTRUMENTS'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-nasa text-white tracking-wider uppercase">
            {showIntroMode ? 'The Cosmic Dust Horizon' : 'Entering Deep Space Orbit'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300/90 max-w-lg mx-auto leading-relaxed">
            Exploring the uncharted universe across 102 infrared spectrophotometric bands and hunting for elusive outer solar system perturbers.
          </p>
        </div>

        {/* Progress Bar & Telemetry Readout */}
        <div className="space-y-2.5 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 truncate pr-2 text-left">
              {LOADING_STAGES[stageIndex]}
            </span>
            <span className="text-white font-bold">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-300 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Interactive Enter / Launch Button */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => {
              if (showIntroMode) {
                onCloseIntro?.();
              } else {
                onEnter?.();
              }
            }}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 text-slate-950 font-nasa font-bold text-xs sm:text-sm tracking-wider uppercase hover:shadow-[0_0_25px_rgba(56,189,248,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <span>{showIntroMode ? 'RESUME EXPLORATION' : readyToEnter || progress >= 100 ? 'ENTER ORBIT' : 'SKIP TO DASHBOARD'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Bottom Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px] font-mono text-slate-400">
          <div className="flex items-center justify-center gap-1.5 p-1.5 bg-slate-900/50 rounded-lg border border-white/5">
            <Telescope className="w-3.5 h-3.5 text-cyan-400" />
            <span>102 IR Channels</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-1.5 bg-slate-900/50 rounded-lg border border-white/5">
            <Orbit className="w-3.5 h-3.5 text-indigo-400" />
            <span>Planet X Keplerian</span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 p-1.5 bg-slate-900/50 rounded-lg border border-white/5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pure Cosmic Dust</span>
          </div>
        </div>
      </main>

      {/* Bottom Coordinates Status */}
      <footer className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[10px] font-mono text-slate-400 pointer-events-none z-20">
        <div>COORDINATES: RA 17h 45m 40s · DEC -29° 00′ 28″ (GALACTIC CENTER)</div>
        <div className="hidden sm:block">STATUS: OBSERVATIONAL TELEMETRY SYNCHRONIZED</div>
      </footer>
    </div>
  );
};
