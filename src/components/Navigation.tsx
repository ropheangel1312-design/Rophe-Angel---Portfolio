import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw, Menu, X } from 'lucide-react';

interface NavigationProps {
  isMuted: boolean;
  onToggleSound: () => void;
  onReplayIntro: () => void;
  isReducedMotion: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  isMuted,
  onToggleSound,
  onReplayIntro,
  isReducedMotion
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Education', href: '#education' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Achievements', href: '#achievements' },
    { label: 'Certifications', href: '#certifications' },
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
    <header className="sticky top-0 z-40 w-full liquid-glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Official Website Logo + Brand with Premium Glossy Presentation */}
        <a 
          href="#hero"
          onClick={(e) => { e.preventDefault(); handleScroll('#hero'); }}
          className="flex items-center gap-2.5 group focus:outline-hidden focus:ring-1 focus:ring-[#AFA0FF] rounded-lg transition-all active:scale-98"
          aria-label="Rophe Angel Home"
        >
          <img
            src="https://cdn.phototourl.com/member/2026-10-20-3b64ebbe-29d4-4b3e-8edf-3190e98113c1.png"
            alt="Rophe Angel Logo"
            className="h-8 sm:h-9 w-auto max-w-[130px] object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-display text-sm sm:text-base font-bold text-[#F7F0E6] tracking-wide group-hover:text-[#AFA0FF] transition-colors">
            Rophe Angel
          </span>
        </a>

        {/* Desktop Navigation Links — Lighter, liquid-glass scale */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => handleScroll(item.href)}
              className="px-2.5 py-1 text-xs font-tech font-semibold tracking-wide text-[#F7F0E6]/80 hover:text-[#A8E6D4] hover:bg-[#A8E6D4]/10 rounded-md transition-all active:scale-95 focus:outline-hidden focus:ring-1 focus:ring-[#AFA0FF]"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mid-screen condensed nav for medium screens */}
        <nav className="hidden md:flex xl:hidden items-center gap-1">
          {navLinks.filter(l => ['Home', 'About', 'Education', 'Projects', 'Experience', 'Contact'].includes(l.label)).map((item) => (
            <button
              key={item.label}
              onClick={() => handleScroll(item.href)}
              className="px-2 py-1 text-xs font-tech font-semibold text-[#F7F0E6]/80 hover:text-[#A8E6D4] hover:bg-[#A8E6D4]/10 rounded-md transition-all active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Global Controls & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Replay Intro button with liquid glass effect & micro-interaction */}
          <button
            onClick={onReplayIntro}
            title="Replay Domain Intro Cinematic"
            aria-label="Replay Intro"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-tech font-bold tracking-wide text-[#F7F0E6] bg-[#101626]/80 border border-[#A8E6D4]/30 hover:border-[#AFA0FF] hover:text-[#AFA0FF] rounded-lg transition-all active:scale-95 focus:outline-hidden focus:ring-1 focus:ring-[#AFA0FF] shadow-xs"
          >
            <RotateCcw className="w-3 h-3 text-[#AFA0FF]" />
            <span className="hidden sm:inline">Replay Intro</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={onToggleSound}
            title={isMuted ? "Sound Muted (Click to enable audio)" : "Sound Enabled (Click to mute)"}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            className={`p-1.5 rounded-lg border transition-all active:scale-95 focus:outline-hidden focus:ring-1 focus:ring-[#AFA0FF] ${
              !isMuted 
                ? 'bg-[#AFA0FF]/20 border-[#AFA0FF] text-[#AFA0FF] shadow-[0_0_12px_rgba(175,160,255,0.3)]' 
                : 'bg-[#101626]/80 border-[#A8E6D4]/25 text-[#F7F0E6]/60 hover:text-[#F7F0E6] hover:border-[#A8E6D4]/50'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="xl:hidden p-1.5 rounded-lg bg-[#101626]/80 border border-[#A8E6D4]/30 text-[#F7F0E6] active:scale-95 focus:outline-hidden focus:ring-1 focus:ring-[#AFA0FF]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Liquid Glass */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#101626]/95 backdrop-blur-lg border-b border-[#A8E6D4]/30 px-4 py-3 space-y-1 shadow-2xl">
          <div className="grid grid-cols-2 gap-1 py-1">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => handleScroll(item.href)}
                className="text-left px-2.5 py-1.5 text-xs font-tech font-semibold tracking-wider text-[#F7F0E6] hover:bg-[#AFA0FF]/15 hover:text-[#A8E6D4] rounded-md transition-all active:scale-98"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="pt-2 border-t border-[#A8E6D4]/20 flex items-center justify-between">
            <button
              onClick={() => { setMobileMenuOpen(false); onReplayIntro(); }}
              className="flex items-center gap-1.5 text-xs font-tech font-bold text-[#AFA0FF] py-1 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Replay Domain Intro
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
