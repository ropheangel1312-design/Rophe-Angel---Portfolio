import React, { useState } from 'react';
import { Menu, X, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface NavigationProps {
  isReducedMotion: boolean;
  isMuted?: boolean;
  onToggleSound?: () => void;
  onReplayIntro?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isReducedMotion,
  isMuted = true,
  onToggleSound,
  onReplayIntro
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'GradEarn', href: '#venture' },
    { label: 'Experience', href: '#experience' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleScroll = (href: string) => {
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full f1-nav-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Zone 1: Logo & Brand Lockup */}
        <a 
          href="#hero"
          onClick={(e) => { e.preventDefault(); handleScroll('#hero'); }}
          className="flex items-center gap-2.5 group focus:outline-hidden focus:ring-1 focus:ring-[#E10600] rounded transition-all active:scale-98 shrink-0"
          aria-label="Rophe Angel Home"
        >
          <img
            src="/logo.png"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://plain-apac-prod-public.komododecks.com/202610/20/YZgT7SnpXc2zs3CnoXeZ/image.png';
            }}
            alt="Rophe Angel Logo"
            className="h-9 sm:h-10 w-auto max-w-[130px] object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-display text-sm sm:text-base font-bold text-[#FFFFFF] tracking-wide group-hover:text-[#E10600] transition-colors whitespace-nowrap">
              Rophe Angel
            </span>
          </div>
        </a>

        {/* Zone 2: Navigation Links (Contains the single Contact link) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => handleScroll(item.href)}
              className="px-3 py-1.5 text-xs font-tech font-semibold tracking-wider uppercase text-[#E0E0E0] hover:text-[#FFFFFF] hover:bg-white/[0.06] rounded-md transition-all active:scale-95 focus:outline-hidden focus:ring-1 focus:ring-[#E10600] whitespace-nowrap cursor-pointer relative group"
            >
              <span>{item.label}</span>
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#E10600] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </button>
          ))}
        </nav>

        {/* Zone 3: Audio & Replay Intro Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Sound Toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg font-tech text-xs uppercase tracking-wider bg-white/[0.04] backdrop-blur-md text-neutral-300 border border-white/[0.08] hover:border-[#E10600]/60 hover:text-[#FFFFFF] hover:bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all cursor-pointer flex items-center gap-1.5"
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              title={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="hidden sm:inline text-[11px]">Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#E10600] animate-pulse" />
                  <span className="hidden sm:inline text-[11px] text-[#FFFFFF]">Audio On</span>
                </>
              )}
            </button>
          )}

          {/* Replay Intro button */}
          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-tech text-xs uppercase tracking-wider bg-white/[0.04] backdrop-blur-md text-neutral-300 border border-white/[0.08] hover:border-[#E10600]/60 hover:text-[#FFFFFF] hover:bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all cursor-pointer"
              title="Replay Chibi greeting intro"
            >
              <RotateCcw className="w-3 h-3 text-[#E10600]" />
              <span className="text-[11px]">Replay Intro</span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-[#FFFFFF] hover:text-[#E10600] hover:border-[#E10600]/60 active:scale-95 focus:outline-hidden focus:ring-1 focus:ring-[#E10600] cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121214]/92 backdrop-blur-2xl px-4 py-4 space-y-2 shadow-[0_16px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)]">
          <div className="grid grid-cols-2 gap-1.5 py-1">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => handleScroll(item.href)}
                className="text-left px-3 py-2 text-xs font-tech font-semibold uppercase tracking-wider text-[#E0E0E0] hover:bg-[#171717] hover:text-[#E10600] rounded transition-all active:scale-98 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 mt-2 flex items-center justify-between gap-2">
            {onReplayIntro && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onReplayIntro();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141414] border border-neutral-700 text-xs font-tech text-neutral-300 hover:text-[#FFFFFF] cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-[#E10600]" />
                <span>Replay Intro</span>
              </button>
            )}

            <button
              onClick={() => handleScroll('#contact')}
              className="text-xs font-tech font-bold uppercase tracking-wider text-[#E10600] py-1 cursor-pointer ml-auto"
            >
              Contact →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
