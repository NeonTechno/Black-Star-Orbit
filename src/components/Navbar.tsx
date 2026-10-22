/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — Navigation & Mission Control Bar
 */

import React from 'react';
import { Compass, Telescope, Orbit, Database, Sparkles, Activity, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'spherex' | 'planetx' | 'architecture';
  setActiveTab: (tab: 'spherex' | 'planetx' | 'architecture') => void;
  onOpenAiAssistant: () => void;
  onOpenDataModal: () => void;
  serverStatusOk: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAiAssistant,
  onOpenDataModal,
  serverStatusOk,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#060914]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 grid grid-cols-1 xl:grid-cols-[minmax(220px,1fr)_auto_auto] gap-3 items-center">
        
        {/* Brand & Mission Title */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-300 via-sky-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center justify-end gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                NASA Space Apps 2026
              </span>
              <span className="hidden sm:inline-flex items-center text-[10px] text-amber-400 font-mono bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                <ShieldCheck className="h-3 w-3 mr-1" /> Grounded Telemetry
              </span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              COSMIC FRONTIER
            </h1>
          </div>
        </div>

        {/* Module Switcher Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/[0.08] max-w-full overflow-x-auto nav-scroll">
          <button
            onClick={() => setActiveTab('spherex')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'planetx'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Orbit className="h-4 w-4" />
            <span>Planet X Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
        <div className="flex items-center space-x-2">
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
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:from-cyan-500 hover:to-indigo-500 shadow-md shadow-indigo-900/30 transition border border-cyan-400/30 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Scientific Intel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
