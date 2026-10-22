import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Volume2, 
  VolumeX, 
  X, 
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { domainAudio } from '../utils/audio';
import { LogoInterstitial } from './LogoInterstitial';

interface CinematicEndCreditsProps {
  isOpen: boolean;
  onClose: () => void;
  isReducedMotion: boolean;
  isMuted: boolean;
  onToggleSound: () => void;
}

type CreditsPhase = 'rolling' | 'fading_out' | 'logo_interstitial';

export const CinematicEndCredits: React.FC<CinematicEndCreditsProps> = ({
  isOpen,
  onClose,
  isReducedMotion,
  isMuted,
  onToggleSound,
}) => {
  const [phase, setPhase] = useState<CreditsPhase>('rolling');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const currentScrollYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Dedicated end-credit BGM lifecycle: starts dedicated audio, stops main BGM, and cleans up on exit
  useEffect(() => {
    if (isOpen) {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      setPhase('rolling');
      setIsPlaying(true);
      setSpeedMultiplier(1);
      setScrollProgress(0);
      setIsExiting(false);
      currentScrollYRef.current = 0;
      lastTimeRef.current = null;
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      // Start dedicated end-credit BGM cleanly, stopping main BGM
      domainAudio.startCreditsBGM(true);
    } else {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      // Stop and reset dedicated end-credit audio, cleanly restoring main BGM
      domainAudio.stopCreditsBGM();
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      domainAudio.stopCreditsBGM();
    };
  }, [isOpen]);

  // Coordinated cinematic return to portfolio (smooth fade-out + instantaneous scroll to top 0)
  const handleReturnToPortfolio = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    // Instantaneous jump to homepage top so user returns to hero section without jarring jump
    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(() => {
      setIsExiting(false);
      onClose();
    }, 500);
  }, [isExiting, onClose]);

  // Handle keyboard shortcuts (Space: pause/play, Esc: close, Up/Down: manual scroll)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleReturnToPortfolio();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'ArrowDown') {
        currentScrollYRef.current += 60;
        if (containerRef.current) containerRef.current.scrollTop = currentScrollYRef.current;
      } else if (e.key === 'ArrowUp') {
        currentScrollYRef.current = Math.max(0, currentScrollYRef.current - 60);
        if (containerRef.current) containerRef.current.scrollTop = currentScrollYRef.current;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleReturnToPortfolio]);

  // Credit roll smooth upward animation loop
  const step = useCallback((time: number) => {
    if (!isOpen || phase !== 'rolling') return;

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
    }
    const delta = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    const container = containerRef.current;
    const content = contentRef.current;

    if (container && content && isPlaying && !isDraggingRef.current) {
      const maxScroll = Math.max(0, content.scrollHeight - container.clientHeight + 120);

      // Base speed: 42 pixels per second * speedMultiplier
      const speed = (isReducedMotion ? 60 : 44) * speedMultiplier;
      currentScrollYRef.current += speed * delta;

      container.scrollTop = currentScrollYRef.current;

      const progress = maxScroll > 0 ? Math.min(1, currentScrollYRef.current / maxScroll) : 0;
      setScrollProgress(progress);

      if (currentScrollYRef.current >= maxScroll) {
        // Hold at bottom for 1.2s before smoothly fading out into the logo interstitial
        if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = setTimeout(() => {
          triggerTransitionToLogo();
        }, 1200);
        return;
      }
    }

    animFrameIdRef.current = requestAnimationFrame(step);
  }, [isOpen, phase, isPlaying, speedMultiplier, isReducedMotion]);

  const triggerTransitionToLogo = useCallback(() => {
    setPhase('fading_out');
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    phaseTimerRef.current = setTimeout(() => {
      setPhase('logo_interstitial');
    }, 600);
  }, []);

  useEffect(() => {
    if (isOpen && phase === 'rolling') {
      animFrameIdRef.current = requestAnimationFrame(step);
    }
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isOpen, phase, step]);

  const handleReplay = () => {
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    currentScrollYRef.current = 0;
    lastTimeRef.current = null;
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    setScrollProgress(0);
    setIsPlaying(true);
    setSpeedMultiplier(1);
    // Restart dedicated end-credit audio cleanly from the beginning
    domainAudio.replayCreditsBGM();
    setPhase('rolling');
  };

  const handleToggleSpeed = () => {
    setSpeedMultiplier(prev => {
      if (prev === 1) return 2;
      if (prev === 2) return 3;
      return 1;
    });
  };

  const handleSkipToEnd = () => {
    triggerTransitionToLogo();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-transparent backdrop-blur-md sm:backdrop-blur-lg text-white flex flex-col items-center justify-between overflow-hidden select-none transition-opacity duration-500 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-fadeIn'
      }`}
      style={{ animationDuration: '600ms' }}
      role="dialog"
      aria-modal="true"
      aria-label="Cinematic End Credits"
    >
      {/* ===================== TOP CINEMATIC CONTROLS BAR ===================== */}
      {phase !== 'logo_interstitial' && (
        <header className={`relative z-40 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between text-xs font-tech tracking-wider uppercase bg-black/25 backdrop-blur-md border-b border-white/[0.08] transition-opacity duration-500 ${phase === 'fading_out' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {/* Left: Branding & Play/Pause */}
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E10600] inline-block shadow-[0_0_8px_rgba(225,6,0,0.8)]" />
            <span className="font-bold text-white tracking-widest hidden sm:inline">
              ROPHE ANGEL // END CREDITS
            </span>
            <span className="text-neutral-500 hidden sm:inline">/</span>
            <span className="text-neutral-400 font-mono text-[11px]">
              {phase === 'rolling' ? (isPlaying ? 'ROLLING' : 'PAUSED') : 'FIN'}
            </span>
          </div>

          {/* Center: Progress Bar */}
          {phase === 'rolling' && (
            <div className="hidden md:flex items-center gap-3 w-48">
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#E10600] transition-all duration-150"
                  style={{ width: `${Math.round(scrollProgress * 100)}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-neutral-400 w-8">
                {Math.round(scrollProgress * 100)}%
              </span>
            </div>
          )}

          {/* Right: Interactive Player Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {phase === 'rolling' && (
              <>
                {/* Play / Pause */}
                <button
                  onClick={() => setIsPlaying(prev => !prev)}
                  className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-neutral-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title={isPlaying ? "Pause credits (Space)" : "Resume credits (Space)"}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#E10600]" /> : <Play className="w-3.5 h-3.5 fill-[#E10600] text-[#E10600]" />}
                  <span className="hidden sm:inline text-[11px] font-bold">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>

                {/* Speed multiplier toggle */}
                <button
                  onClick={handleToggleSpeed}
                  className={`px-2 py-1 rounded border text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1 ${
                    speedMultiplier > 1 
                      ? 'border-[#E10600] text-[#E10600] bg-[#E10600]/10' 
                      : 'border-white/15 text-neutral-300 hover:text-white bg-white/[0.06]'
                  }`}
                  title="Toggle scroll speed (1x / 2x / 3x)"
                >
                  <FastForward className="w-3 h-3" />
                  <span>{speedMultiplier}x</span>
                </button>

                {/* Skip to end */}
                <button
                  onClick={handleSkipToEnd}
                  className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-neutral-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer active:scale-95 hidden sm:inline"
                >
                  SKIP »
                </button>
              </>
            )}

            {/* Sound Mute Toggle */}
            <button
              onClick={onToggleSound}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-neutral-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              title={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#E10600]" />
              )}
              <span className="hidden sm:inline text-[11px] font-bold">
                {isMuted ? 'MUTED' : 'AUDIO ON'}
              </span>
            </button>

            {/* Exit / Return to Portfolio */}
            <button
              onClick={handleReturnToPortfolio}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-[#E10600]/20 hover:bg-[#E10600] border border-[#E10600]/50 hover:border-[#E10600] text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Return to portfolio (Esc)"
              aria-label="Return to portfolio"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-bold">EXIT</span>
            </button>
          </div>
        </header>
      )}

      {/* ===================== MAIN CREDITS THEATER ===================== */}
      <div className="relative z-10 w-full flex-1 overflow-hidden flex items-center justify-center">
        
        {/* PHASE 1: SCROLLING CREDITS DIRECTLY OVER BLURRED WEBSITE BACKDROP */}
        {(phase === 'rolling' || phase === 'fading_out') && (
          <div 
            ref={containerRef}
            className={`w-full h-full overflow-y-auto overflow-x-hidden scrollbar-none flex justify-center cursor-default select-text transition-opacity duration-600 ease-out ${
              phase === 'fading_out' ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ scrollBehavior: 'auto' }}
            onWheel={(e) => {
              // Allow manual mouse wheel scrolling without breaking the loop
              currentScrollYRef.current += e.deltaY;
            }}
          >
            <div 
              ref={contentRef}
              className="max-w-2xl w-full px-6 py-[45vh] text-center font-body flex flex-col items-center gap-16 sm:gap-20"
            >
              
              {/* Opener / Title Header with Luminous Liquid Sheen */}
              <div className="space-y-3">
                <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-wider uppercase leading-tight drop-shadow-[0_0_28px_rgba(255,255,255,0.45)] drop-shadow-[0_0_50px_rgba(225,6,0,0.25)] [text-shadow:0_0_35px_rgba(255,255,255,0.35),0_1px_4px_rgba(0,0,0,0.95)]">
                  ROPHE ANGEL
                </h1>
                <div className="text-xs sm:text-sm font-tech text-neutral-300 tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                  ENGINEERING PORTFOLIO // 2026
                </div>
              </div>

              {/* Creator & Discipline */}
              <div className="space-y-3">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#FF2800] drop-shadow-[0_0_12px_rgba(225,6,0,0.65)] [text-shadow:0_0_16px_rgba(225,6,0,0.4),0_1px_2px_rgba(0,0,0,0.9)]">
                  CREATED, DESIGNED & DEVELOPED BY
                </div>
                <div className="font-display font-bold text-2xl sm:text-3xl text-white tracking-wide drop-shadow-[0_0_16px_rgba(255,255,255,0.4)] [text-shadow:0_0_20px_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.95)]">
                  Rophe Angel
                </div>
                <div className="text-sm font-tech text-neutral-200 tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  B.E. Computer Science & Engineering
                </div>
                <div className="text-xs font-mono text-neutral-400">
                  Chennai, India
                </div>
              </div>

              {/* Founder / Venture */}
              <div className="space-y-3">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#FF2800] drop-shadow-[0_0_12px_rgba(225,6,0,0.65)] [text-shadow:0_0_16px_rgba(225,6,0,0.4),0_1px_2px_rgba(0,0,0,0.9)]">
                  FOUNDER & VENTURE LEAD
                </div>
                <div className="font-display font-bold text-xl sm:text-2xl text-white tracking-wide drop-shadow-[0_0_16px_rgba(255,255,255,0.4)] [text-shadow:0_0_20px_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.95)]">
                  GradEarn
                </div>
                <div className="text-xs sm:text-sm font-body text-neutral-200 max-w-md mx-auto leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  Empowering student builders to turn curiosity into verified proof-of-work, client engagements, and competitive hackathon wins.
                </div>
              </div>

              {/* Featured Engineering Projects */}
              <div className="space-y-8 w-full max-w-lg">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#FF2800] drop-shadow-[0_0_12px_rgba(225,6,0,0.65)] [text-shadow:0_0_16px_rgba(225,6,0,0.4),0_1px_2px_rgba(0,0,0,0.9)]">
                  FEATURED ENGINEERING ARCHITECTURE
                </div>

                {/* HUSH */}
                <div className="space-y-1.5 border-t border-white/[0.08] pt-4">
                  <div className="font-display font-bold text-lg sm:text-xl text-white tracking-wider drop-shadow-[0_0_14px_rgba(255,255,255,0.35)] [text-shadow:0_0_18px_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.9)]">
                    HUSH
                  </div>
                  <div className="text-xs font-tech uppercase text-[#FF2800] tracking-wider drop-shadow-[0_0_10px_rgba(225,6,0,0.5)]">
                    Personal Music Streaming Client
                  </div>
                  <div className="text-xs font-mono text-neutral-300">
                    Spotify Web API · Web Playback SDK · Pure JavaScript Engine
                  </div>
                </div>

                {/* ICHNOVA */}
                <div className="space-y-1.5 border-t border-white/[0.08] pt-4">
                  <div className="font-display font-bold text-lg sm:text-xl text-white tracking-wider drop-shadow-[0_0_14px_rgba(255,255,255,0.35)] [text-shadow:0_0_18px_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.9)]">
                    ICHNOVA
                  </div>
                  <div className="text-xs font-tech uppercase text-[#FF2800] tracking-wider drop-shadow-[0_0_10px_rgba(225,6,0,0.5)]">
                    Automated RF Spectral Parameter Platform
                  </div>
                  <div className="text-xs font-mono text-neutral-300">
                    Signal Processing (.IQ / .wav) · Claude · Salesforce Agentforce
                  </div>
                </div>

                {/* THADAM */}
                <div className="space-y-1.5 border-t border-white/[0.08] pt-4">
                  <div className="font-display font-bold text-lg sm:text-xl text-white tracking-wider drop-shadow-[0_0_14px_rgba(255,255,255,0.35)] [text-shadow:0_0_18px_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.9)]">
                    THADAM
                  </div>
                  <div className="text-xs font-tech uppercase text-[#FF2800] tracking-wider drop-shadow-[0_0_10px_rgba(225,6,0,0.5)]">
                    AI-Assisted Public Fund Transparency Portal
                  </div>
                  <div className="text-xs font-mono text-neutral-300">
                    MPLAD Scheme Anomaly Detection · Regional Expenditure Analytics
                  </div>
                </div>
              </div>

              {/* Special Characters & Companions */}
              <div className="space-y-6 w-full max-w-md">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#FF2800] drop-shadow-[0_0_12px_rgba(225,6,0,0.65)] [text-shadow:0_0_16px_rgba(225,6,0,0.4),0_1px_2px_rgba(0,0,0,0.9)]">
                  CHARACTERS & DIGITAL CO-PILOTS
                </div>

                <div className="space-y-1">
                  <div className="font-display font-bold text-base sm:text-lg text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.3)]">
                    Mikey the Tabby Cat
                  </div>
                  <div className="text-xs font-tech uppercase text-neutral-300 tracking-wider">
                    Chief Companion & Autonomous Roaming Sprite
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/[0.06]">
                  <div className="font-display font-bold text-base sm:text-lg text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.3)]">
                    Chibi Rophe
                  </div>
                  <div className="text-xs font-tech uppercase text-neutral-300 tracking-wider">
                    Scuderia Pit Crew & Welcoming Host
                  </div>
                </div>
              </div>

              {/* Acoustic & Sound Engineering */}
              <div className="space-y-4 max-w-md">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#FF2800] drop-shadow-[0_0_12px_rgba(225,6,0,0.65)] [text-shadow:0_0_16px_rgba(225,6,0,0.4),0_1px_2px_rgba(0,0,0,0.9)]">
                  ACOUSTIC DIRECTION & AUDIO SYNTHESIS
                </div>
                <div className="font-display font-bold text-base sm:text-lg text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.3)]">
                  Procedural Web Audio Engine
                </div>
                <div className="text-xs font-body text-neutral-200 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  Synthesized harmonic multi-oscillators, Doppler acceleration whooshes, Undertale-inspired dialogue blips, and Ferrari F1 Pit Wall radio tributes.
                </div>
                <div className="text-xs font-mono text-neutral-400 italic">
                  „My seat is full of water“ — „Must be the water“
                </div>
              </div>

              {/* Visual Physics & Interaction Engineering */}
              <div className="space-y-4 max-w-md">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#FF2800] drop-shadow-[0_0_12px_rgba(225,6,0,0.65)] [text-shadow:0_0_16px_rgba(225,6,0,0.4),0_1px_2px_rgba(0,0,0,0.9)]">
                  VISUAL PHYSICS & MOTION DESIGN
                </div>
                <div className="text-xs sm:text-sm font-tech uppercase text-neutral-100 tracking-wider space-y-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  <div>Liquid Motion Background & Organic Ripples</div>
                  <div>Magnetic Vector Physics & Spring Dynamics</div>
                  <div>Liquid Lens Refraction & Chromatic Split</div>
                  <div>Velocity Marquee & Dynamic Text Scramble</div>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="w-2 h-2 rounded-full bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.8)]" />
                  <span className="text-[11px] font-mono text-neutral-300">#E10600 Ferrari Red</span>
                  <span className="w-2 h-2 rounded-full bg-white ml-2 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  <span className="text-[11px] font-mono text-neutral-300">#FFFFFF Pure White</span>
                  <span className="w-2 h-2 rounded-full bg-[#0A0A0A] border border-white/30 ml-2" />
                  <span className="text-[11px] font-mono text-neutral-300">#0A0A0A Pure Black</span>
                </div>
              </div>

              {/* Frameworks & Tech Stack */}
              <div className="space-y-3 max-w-md">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#FF2800] drop-shadow-[0_0_12px_rgba(225,6,0,0.65)] [text-shadow:0_0_16px_rgba(225,6,0,0.4),0_1px_2px_rgba(0,0,0,0.9)]">
                  FRAMEWORKS & TECHNOLOGIES
                </div>
                <div className="text-xs font-mono text-neutral-300 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  React 19 · TypeScript · Tailwind CSS · Framer Motion · Lucide Icons · Web Audio API · Vite
                </div>
              </div>

              {/* Special Thanks */}
              <div className="space-y-4 max-w-md">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#FF2800] drop-shadow-[0_0_12px_rgba(225,6,0,0.65)] [text-shadow:0_0_16px_rgba(225,6,0,0.4),0_1px_2px_rgba(0,0,0,0.9)]">
                  SPECIAL THANKS
                </div>
                <div className="text-xs sm:text-sm font-body text-neutral-200 leading-relaxed space-y-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  <p className="font-display font-medium text-base text-white tracking-wide drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">My Family</p>
                  <p className="font-display font-medium text-base text-white tracking-wide drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">My Friends</p>
                  <p className="font-display font-medium text-base text-white tracking-wide drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">Mikey</p>
                </div>
              </div>

              {/* Closing Sign-off */}
              <div className="space-y-4 pt-10 pb-20 border-t border-white/[0.08] w-full max-w-md">
                <div className="text-sm font-tech font-bold uppercase tracking-[0.2em] text-[#FF2800] drop-shadow-[0_0_14px_rgba(225,6,0,0.65)] [text-shadow:0_0_16px_rgba(225,6,0,0.4)]">
                  DRIVEN BY CURIOSITY // ENGINEERED FOR VELOCITY
                </div>
                <div className="text-xs font-mono text-neutral-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  © 2026 ROPHE ANGEL. ALL RIGHTS RESERVED.
                </div>
                <div className="text-[11px] font-mono text-neutral-400">
                  COMMUNICATION LINK // TERMINATED
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PHASE 2: CINEMATIC LOGO INTERSTITIAL WITH REPLAY & RETURN BUTTONS */}
        {phase === 'logo_interstitial' && (
          <LogoInterstitial
            mode="credits_ending"
            isReducedMotion={isReducedMotion}
            onReplayCredits={handleReplay}
            onReturnToPortfolio={handleReturnToPortfolio}
          />
        )}

      </div>

      {/* Subtle Bottom Status Bar */}
      {phase !== 'logo_interstitial' && (
        <footer className={`relative z-40 w-full px-6 py-2.5 flex items-center justify-between text-[10px] font-mono text-neutral-400 bg-black/25 backdrop-blur-md border-t border-white/[0.08] transition-opacity duration-500 ${phase === 'fading_out' ? 'opacity-0' : 'opacity-100'}`}>
          <div>CONSOLE ID: RR-2026-F1 // CH: 446.006 MHz</div>
          <div className="flex items-center gap-2">
            <span>PRESS ESC TO EXIT</span>
            <span>·</span>
            <span>SPACE TO PAUSE</span>
          </div>
        </footer>
      )}
    </div>
  );
};
