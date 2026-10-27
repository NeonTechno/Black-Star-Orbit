/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLACK STAR ORBIT — Cosmic Command Palette (Cmd/Ctrl + K)
 * Keyboard-first navigation, celestial search, view mode switching, and tools.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { AppPage } from '../../types';
import {
  Search,
  Command,
  Compass,
  Telescope,
  Orbit,
  Radio,
  Globe,
  Disc,
  Sparkles,
  Database,
  ArrowRight,
  Sliders,
  Bookmark,
  Layers,
  Zap,
  X,
  Scale,
  FlaskConical,
} from 'lucide-react';

interface CosmicCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: AppPage) => void;
  onSelectObject?: (objectId: string) => void;
  onOpenCompareModal?: () => void;
  onOpenBookmarks?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Workspaces' | 'Celestial Objects' | 'View Modes' | 'Scientific Tools';
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

export const CosmicCommandPalette: React.FC<CosmicCommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectObject,
  onOpenCompareModal,
  onOpenBookmarks,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent
          const event = new CustomEvent('open-cosmic-palette');
          window.dispatchEvent(event);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const allCommands: CommandItem[] = useMemo(() => [
    // Workspaces
    {
      id: 'ws-home',
      title: 'Mission Home & Launchpad',
      subtitle: 'Black Star Orbit central cosmic interface & status overview',
      category: 'Workspaces',
      icon: <Compass className="w-4 h-4 text-[#38BDF8]" />,
      action: () => { onNavigate('home'); onClose(); },
      shortcut: 'H',
    },
    {
      id: 'ws-mission-control',
      title: 'Mission Control HUD (Artemis & Satellites)',
      subtitle: 'Live countdowns, multi-line telemetry, and orbital satellite tracking',
      category: 'Workspaces',
      icon: <Radio className="w-4 h-4 text-[#10B981]" />,
      action: () => { onNavigate('mission-control'); onClose(); },
      shortcut: 'M',
    },
    {
      id: 'ws-3d-universe',
      title: '3D Solar System & Universe Explorer',
      subtitle: 'Interactive Three.js planets, Ceres, Sedna, and orbital tracks',
      category: 'Workspaces',
      icon: <Globe className="w-4 h-4 text-[#60A5FA]" />,
      action: () => { onNavigate('universe'); onClose(); },
      shortcut: 'U',
    },
    {
      id: 'ws-spherex',
      title: 'SPHEREx Explorer (102 Infrared Bands)',
      subtitle: 'All-sky spectrophotometric viewer, FITS headers & ice absorption',
      category: 'Workspaces',
      icon: <Telescope className="w-4 h-4 text-[#38BDF8]" />,
      action: () => { onNavigate('spherex'); onClose(); },
      shortcut: 'S',
    },
    {
      id: 'ws-astrobiology',
      title: 'Astrobiology & Interstellar Molecular Lab',
      subtitle: '3D prebiotic ice spectroscopy, PubChem CIDs, and extremophile biology',
      category: 'Workspaces',
      icon: <FlaskConical className="w-4 h-4 text-[#10B981]" />,
      action: () => { onNavigate('astrobiology'); onClose(); },
      shortcut: 'B',
    },
    {
      id: 'ws-planet-x',
      title: 'Planet X Investigation Lab',
      subtitle: 'eTNO gravitational clustering & Batygin-Brown orbital models',
      category: 'Workspaces',
      icon: <Orbit className="w-4 h-4 text-[#C084FC]" />,
      action: () => { onNavigate('planet-x'); onClose(); },
      shortcut: 'X',
    },
    {
      id: 'ws-asteroid-watch',
      title: 'Asteroid Watch & NEO Monitoring',
      subtitle: 'NASA Near-Earth Object close approaches & trajectory analysis',
      category: 'Workspaces',
      icon: <Compass className="w-4 h-4 text-[#F59E0B]" />,
      action: () => { onNavigate('asteroid-watch'); onClose(); },
    },
    {
      id: 'ws-exoplanets',
      title: 'Exoplanet Discovery Lab',
      subtitle: 'Confirmed worlds, habitable zones, and Kepler/TESS transits',
      category: 'Workspaces',
      icon: <Disc className="w-4 h-4 text-[#A78BFA]" />,
      action: () => { onNavigate('exoplanets'); onClose(); },
    },
    {
      id: 'ws-galaxies',
      title: 'Galaxy & Deep-Sky Explorer',
      subtitle: 'Messier, NGC, and distant cosmological structures',
      category: 'Workspaces',
      icon: <Sparkles className="w-4 h-4 text-[#F43F5E]" />,
      action: () => { onNavigate('galaxies'); onClose(); },
    },
    {
      id: 'ws-data-centre',
      title: 'NASA & IPAC Data Centre',
      subtitle: 'Official IRSA TAP, SIAv2, and VO Table Access Protocol specs',
      category: 'Workspaces',
      icon: <Database className="w-4 h-4 text-[#38BDF8]" />,
      action: () => { onNavigate('data-centre'); onClose(); },
    },
    {
      id: 'ws-ai-guide',
      title: 'Grounded AI Astronomy Guide',
      subtitle: 'Gemini 3.8 Flash grounded space science copilot',
      category: 'Workspaces',
      icon: <Sparkles className="w-4 h-4 text-[#F5C451]" />,
      action: () => { onNavigate('ai-guide'); onClose(); },
      shortcut: 'A',
    },

    // Celestial Objects
    {
      id: 'obj-ceres',
      title: 'Ceres (Queen of the Asteroid Belt)',
      subtitle: 'Dwarf planet with bright sodium carbonate salt faculae in Occator crater',
      category: 'Celestial Objects',
      icon: <Globe className="w-4 h-4 text-[#94A3B8]" />,
      action: () => { onSelectObject?.('ceres'); onClose(); },
    },
    {
      id: 'obj-earth',
      title: 'Earth (Sol III)',
      subtitle: 'Terrestrial ocean planet harboring life; radius 6,371 km',
      category: 'Celestial Objects',
      icon: <Globe className="w-4 h-4 text-[#38BDF8]" />,
      action: () => { onSelectObject?.('earth'); onClose(); },
    },
    {
      id: 'obj-mars',
      title: 'Mars (The Red Planet)',
      subtitle: 'Iron-oxide desert world, Olympus Mons, and ancient dried lakebeds',
      category: 'Celestial Objects',
      icon: <Globe className="w-4 h-4 text-[#EF4444]" />,
      action: () => { onSelectObject?.('mars'); onClose(); },
    },
    {
      id: 'obj-jupiter',
      title: 'Jupiter (Jovian King)',
      subtitle: 'Massive gas giant with Great Red Spot, 95 moons, and radiation belts',
      category: 'Celestial Objects',
      icon: <Globe className="w-4 h-4 text-[#F59E0B]" />,
      action: () => { onSelectObject?.('jupiter'); onClose(); },
    },
    {
      id: 'obj-saturn',
      title: 'Saturn (Ringed World)',
      subtitle: 'Spectacular water-ice ring system, Titan, and Enceladus ice geysers',
      category: 'Celestial Objects',
      icon: <Globe className="w-4 h-4 text-[#EAB308]" />,
      action: () => { onSelectObject?.('saturn'); onClose(); },
    },
    {
      id: 'obj-sedna',
      title: '90377 Sedna (Extreme TNO)',
      subtitle: 'Extremely detached red dwarf planet on an elongated 11,400-year orbit',
      category: 'Celestial Objects',
      icon: <Orbit className="w-4 h-4 text-[#E11D48]" />,
      action: () => { onSelectObject?.('sedna'); onClose(); },
    },
    {
      id: 'obj-planet-x',
      title: 'Planet X / Nine (Hypothetical)',
      subtitle: 'Modeled ~5-8 M⊕ super-Earth at 420 AU explaining eTNO clustering',
      category: 'Celestial Objects',
      icon: <Orbit className="w-4 h-4 text-[#8B5CF6]" />,
      action: () => { onSelectObject?.('planet-x'); onClose(); },
    },

    // Scientific Tools & Modes
    {
      id: 'tool-compare',
      title: 'Launch Celestial Comparison Matrix',
      subtitle: 'Compare planetary radii, masses, gravity, and orbital periods side-by-side',
      category: 'Scientific Tools',
      icon: <Scale className="w-4 h-4 text-[#38BDF8]" />,
      action: () => { onOpenCompareModal?.(); onClose(); },
    },
    {
      id: 'tool-bookmarks',
      title: 'Open Personal Discovery Collection',
      subtitle: 'Inspect saved celestial objects and research bookmarks',
      category: 'Scientific Tools',
      icon: <Bookmark className="w-4 h-4 text-[#F5C451]" />,
      action: () => { onOpenBookmarks?.(); onClose(); },
    },
  ], [onNavigate, onClose, onSelectObject, onOpenCompareModal, onOpenBookmarks]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [query, allCommands]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#070D1E]/95 border border-[#38BDF8]/40 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8),0_0_35px_rgba(56,189,248,0.25)] overflow-hidden flex flex-col max-h-[80vh] electric-border-active"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-[#0B1630]">
          <Search className="w-5 h-5 text-[#38BDF8] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search workspaces, celestial bodies, SPHEREx bands, tools (e.g. 'Ceres', 'Artemis', 'SPHEREx')..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[#F8FAFC] placeholder-[#64748B] focus:outline-none font-mono"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#050B1A] border border-white/10 text-[10px] font-mono text-[#94A3B8]">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-white/[0.04]">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Zap className="w-8 h-8 text-[#64748B] mx-auto animate-pulse" />
              <p className="text-sm text-[#94A3B8] font-mono">No matching astronomical telemetry found.</p>
              <p className="text-xs text-[#64748B]">Try searching for 'Ceres', 'Planet X', 'Mission Control', or 'SPHEREx'.</p>
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#15254A] border border-[#38BDF8]/40 shadow-md'
                      : 'hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#0B1630] border-[#38BDF8]/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                          : 'bg-[#0B1630]/60 border-white/10'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-[#F8FAFC] truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-[#94A3B8] border border-white/5">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] truncate">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.shortcut && (
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#050B1A] border border-white/10 text-[10px] font-mono text-[#94A3B8]">
                        {item.shortcut}
                      </kbd>
                    )}
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-[#38BDF8] translate-x-1' : 'text-transparent'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 px-4 bg-[#050B1A]/80 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#64748B]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[#38BDF8]">BLACK STAR ORBIT NAVIGATION SYSTEM</span>
        </div>
      </div>
    </div>
  );
};
