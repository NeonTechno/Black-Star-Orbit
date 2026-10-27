/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLACK STAR ORBIT — Navigation & Mission Control Bar
 */

import React from 'react';
import { Telescope, Orbit, Database, Sparkles, Activity, ShieldCheck, Globe, FlaskConical, ImageIcon } from 'lucide-react';
import { BlackStarLogo } from './common/BlackStarLogo.tsx';

interface NavbarProps {
  activeTab: 'spherex' | 'planetx' | 'astrobiology' | 'architecture' | 'cosmic-suite';
  setActiveTab: (tab: 'spherex' | 'planetx' | 'astrobiology' | 'architecture' | 'cosmic-suite') => void;
  onOpenAiAssistant: () => void;
  onOpenDataModal: () => void;
  onOpenIntroModal?: () => void;
  serverStatusOk: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAiAssistant,
  onOpenDataModal,
  onOpenIntroModal,
  serverStatusOk,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#060914]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 grid grid-cols-1 xl:grid-cols-[minmax(260px,1fr)_auto_auto] gap-3 items-center">
        
        {/* Brand & Mission Title */}
        <div className="flex items-center space-x-3">
          <BlackStarLogo size="md" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-nasa text-[10px] font-semibold uppercase tracking-wider text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/40 shadow-[0_0_8px_rgba(56,189,248,0.25)]">
                NASA Space Apps 2026
              </span>
              <span className="hidden sm:inline-flex items-center text-[10px] text-amber-400 font-mono bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                <ShieldCheck className="h-3 w-3 mr-1" /> Grounded Telemetry
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-wider text-white flex items-center gap-1.5 font-nasa">
              BLACK STAR ORBIT
            </h1>
          </div>
        </div>

        {/* Module Switcher Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/[0.08] max-w-full overflow-x-auto nav-scroll">
          <button
            onClick={() => setActiveTab('spherex')}
            className={`flex items-center shrink-0 space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'spherex'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Telescope className="h-4 w-4" />
            <span>SPHEREx Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('planetx')}
            className={`flex items-center shrink-0 space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'planetx'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Orbit className="h-4 w-4" />
            <span>Planet X Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('astrobiology')}
            className={`flex items-center shrink-0 space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'astrobiology'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FlaskConical className="h-4 w-4" />
            <span>Astrobiology Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('cosmic-suite')}
            className={`flex items-center shrink-0 space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'cosmic-suite'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Cosmic Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`hidden md:flex items-center shrink-0 space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'architecture'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>NASA Data & Architecture</span>
          </button>
        </nav>

        {/* Quick Tools & AI Copilot */}
        <div className="flex items-center justify-end gap-2 flex-wrap">
          {/* Intro Picture button */}
          {onOpenIntroModal && (
            <button
              onClick={onOpenIntroModal}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 transition whitespace-nowrap cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.2)]"
              title="View Website Cosmic Dust Intro & Launch Artwork"
            >
              <ImageIcon className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Intro Visual</span>
            </button>
          )}

          {/* Data status button */}
          <button
            onClick={onOpenDataModal}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-slate-900/70 border border-white/[0.09] text-slate-300 hover:border-cyan-500/40 transition whitespace-nowrap"
            title="Inspect NASA / IPAC Data Connectors"
          >
            <Activity className={`h-3.5 w-3.5 ${serverStatusOk ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
            <span className="hidden lg:inline">Data Sources</span>
          </button>

          {/* AI Assistant button */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:from-cyan-400 hover:to-indigo-400 shadow-md shadow-indigo-900/30 transition border border-cyan-300/25 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Scientific Intel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
