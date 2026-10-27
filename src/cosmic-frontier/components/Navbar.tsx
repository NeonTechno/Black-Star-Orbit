import { useState, type ReactNode, type FC } from 'react';
import type { AppPage } from '../types';
import { 
  Home,
  Telescope, 
  Orbit, 
  Sparkles, 
  Info, 
  Menu, 
  X, 
  Compass, 
  Database, 
  Globe, 
  Disc,
  Radio,
  Search,
  Bookmark,
  BookOpen,
  FlaskConical
} from 'lucide-react';
import { BlackStarLogo } from '../../components/common/BlackStarLogo';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  onOpenCommandPalette?: () => void;
  onOpenCompare?: () => void;
  onOpenBookmarks?: () => void;
  bookmarksCount?: number;
}

export const Navbar: FC<NavbarProps> = ({ 
  currentPage, 
  onNavigate,
  onOpenCommandPalette,
  onOpenCompare,
  onOpenBookmarks,
  bookmarksCount = 0
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { page: AppPage; label: string; icon: ReactNode }[] = [
    { page: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { page: 'spherex', label: 'SPHEREx Explorer', icon: <Telescope className="w-4 h-4" /> },
    { page: 'astrobiology', label: 'Astrobiology Lab', icon: <FlaskConical className="w-4 h-4" /> },
    { page: 'planet-x', label: 'Planet X Lab', icon: <Orbit className="w-4 h-4" /> },
    { page: 'mission-control', label: 'Mission Control', icon: <Radio className="w-4 h-4" /> },
    { page: 'observatory', label: 'Observatory', icon: <Telescope className="w-4 h-4" /> },
    { page: 'universe', label: '3D Universe', icon: <Globe className="w-4 h-4" /> },
    { page: 'exoplanets', label: 'Exoplanets', icon: <Disc className="w-4 h-4" /> },
    { page: 'galaxies', label: 'Galaxies', icon: <Sparkles className="w-4 h-4" /> },
    { page: 'asteroid-watch', label: 'Asteroid Watch', icon: <Compass className="w-4 h-4" /> },
    { page: 'data-centre', label: 'Data Centre', icon: <Database className="w-4 h-4" /> },
    { page: 'ai-guide', label: 'AI Guide', icon: <Sparkles className="w-4 h-4" /> },
    { page: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  const handleNavClick = (page: AppPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="relative z-30 bg-[#050B1A]/85 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 rounded-lg p-1 cursor-pointer"
            aria-label="Black Star Orbit Home"
          >
            <BlackStarLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-wider text-[#F8FAFC] font-nasa group-hover:text-[#38BDF8] transition-colors">
                  BLACK STAR ORBIT
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-semibold font-nasa tracking-widest px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C084FC] border border-[#8B5CF6]/30">
                  NASA 2026
                </span>
              </div>
              <p className="text-[10px] text-[#A7B4CC] hidden xl:block">
                Explore the Universe. Discover the Unknown.
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = currentPage === item.page || 
                (item.page === 'ai-guide' && currentPage === 'guide');
              return (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1630] text-[#38BDF8] border border-[#38BDF8]/40 shadow-xs'
                      : 'text-[#A7B4CC] hover:text-[#F8FAFC] hover:bg-[#0B1630]/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={isActive ? 'text-[#38BDF8]' : 'text-[#A7B4CC]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Badge & Controls (Search, Compare, Bookmarks, AI) */}
          <div className="flex items-center gap-2">
            {/* Quick Command Palette Button (Ctrl+K) */}
            {onOpenCommandPalette && (
              <button
                onClick={onOpenCommandPalette}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B1630] hover:bg-[#112248] border border-[#1E293B] hover:border-[#38BDF8]/40 text-xs text-[#94A3B8] hover:text-white transition-all cursor-pointer shadow-xs"
                title="Search Command Palette (Ctrl+K / Cmd+K)"
              >
                <Search className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="hidden xl:inline">Search</span>
                <kbd className="text-[10px] font-mono bg-[#050B1A] px-1.5 py-0.5 rounded border border-[#1E293B] text-slate-400">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Compare Matrix Trigger */}
            {onOpenCompare && (
              <button
                onClick={onOpenCompare}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0B1630] hover:bg-[#112248] border border-[#1E293B] hover:border-violet-500/40 text-xs text-[#94A3B8] hover:text-violet-300 transition-all cursor-pointer"
                title="Open Celestial Comparison Matrix"
              >
                <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                <span className="hidden xl:inline">Compare</span>
              </button>
            )}

            {/* Bookmarks Drawer Trigger */}
            {onOpenBookmarks && (
              <button
                onClick={onOpenBookmarks}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0B1630] hover:bg-[#112248] border border-[#1E293B] hover:border-amber-500/40 text-xs text-slate-300 transition-all cursor-pointer"
                title="My Research Discovery Collection"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                {bookmarksCount > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/40">
                    {bookmarksCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => handleNavClick('ai-guide')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5C451]/10 text-[#F5C451] hover:bg-[#F5C451]/20 border border-[#F5C451]/30 text-xs font-medium tracking-wide transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Guide</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#A7B4CC] hover:text-[#F8FAFC] hover:bg-[#0B1630] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B1630] border-b border-[#1E293B] px-4 pt-2 pb-4 space-y-1 animate-fadeIn">
          {navItems.map((item) => {
            const isActive = currentPage === item.page || 
              (item.page === 'ai-guide' && currentPage === 'guide');
            return (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#050B1A] text-[#38BDF8] border border-[#38BDF8]/40'
                    : 'text-[#A7B4CC] hover:text-[#F8FAFC] hover:bg-[#050B1A]/50'
                }`}
              >
                <span className={isActive ? 'text-[#38BDF8]' : 'text-[#A7B4CC]'}>
                  {item.icon}
                </span>
                <span>{item.page === 'planet-x' ? 'Planet X Investigation Lab' : item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

