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

interface CinematicEndCreditsProps {
  isOpen: boolean;
  onClose: () => void;
  isReducedMotion: boolean;
  isMuted: boolean;
  onToggleSound: () => void;
}

type CreditsPhase = 'rolling' | 'final_screen';

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

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const currentScrollYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Dedicated end-credit BGM lifecycle: starts dedicated audio, stops main BGM, and cleans up on exit
  useEffect(() => {
    if (isOpen) {
      setPhase('rolling');
      setIsPlaying(true);
      setSpeedMultiplier(1);
      setScrollProgress(0);
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
      // Stop and reset dedicated end-credit audio, cleanly restoring main BGM
      domainAudio.stopCreditsBGM();
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      domainAudio.stopCreditsBGM();
    };
  }, [isOpen]);

  // Handle keyboard shortcuts (Space: pause/play, Esc: close, Up/Down: manual scroll)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
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
  }, [isOpen, onClose]);

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
        // Hold at bottom for 1.2s before fading into the final logo screen
        setTimeout(() => {
          setPhase('final_screen');
        }, 1200);
        return;
      }
    }

    animFrameIdRef.current = requestAnimationFrame(step);
  }, [isOpen, phase, isPlaying, speedMultiplier, isReducedMotion]);

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
    setPhase('rolling');
    setIsPlaying(true);
    setSpeedMultiplier(1);
    setScrollProgress(0);
    currentScrollYRef.current = 0;
    lastTimeRef.current = null;
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    // Restart dedicated end-credit audio cleanly from the beginning
    domainAudio.replayCreditsBGM();
  };

  const handleToggleSpeed = () => {
    setSpeedMultiplier(prev => {
      if (prev === 1) return 2;
      if (prev === 2) return 3;
      return 1;
    });
  };

  const handleSkipToEnd = () => {
    setPhase('final_screen');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-[#0A0A0A] text-white flex flex-col items-center justify-between overflow-hidden select-none animate-fadeIn"
      style={{ animationDuration: '600ms' }}
      role="dialog"
      aria-modal="true"
      aria-label="Cinematic End Credits"
    >
      {/* Cinematic Vignette & Anamorphic Letterbox Bars */}
      <div 
        className="pointer-events-none absolute inset-0 z-30 shadow-[inset_0_0_120px_rgba(0,0,0,0.95)]" 
        aria-hidden="true"
      />
      <div 
        className="pointer-events-none absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent z-20" 
        aria-hidden="true"
      />
      <div 
        className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent z-20" 
        aria-hidden="true"
      />

      {/* ===================== TOP CINEMATIC CONTROLS BAR ===================== */}
      <header className="relative z-40 w-full px-4 sm:px-8 py-4 flex items-center justify-between text-xs font-tech tracking-wider uppercase bg-[#0A0A0A]/60 backdrop-blur-md border-b border-white/[0.08]">
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
            onClick={onClose}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-[#E10600]/20 hover:bg-[#E10600] border border-[#E10600]/50 hover:border-[#E10600] text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Return to portfolio (Esc)"
            aria-label="Return to portfolio"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] font-bold">EXIT</span>
          </button>
        </div>
      </header>

      {/* ===================== MAIN CREDITS THEATER ===================== */}
      <div className="relative z-10 w-full flex-1 overflow-hidden flex items-center justify-center">
        
        {/* PHASE 1: SCROLLING CREDITS */}
        {phase === 'rolling' && (
          <div 
            ref={containerRef}
            className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-none flex justify-center cursor-default select-text"
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
              
              {/* Opener / Title Header */}
              <div className="space-y-4">
                <div className="text-xs sm:text-sm font-tech font-bold uppercase tracking-[0.3em] text-[#E10600]">
                  SCUDERIA ROPHE ANGEL
                </div>
                <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-wider uppercase leading-tight drop-shadow-[0_0_24px_rgba(255,255,255,0.2)]">
                  ROPHE ANGEL
                </h1>
                <div className="text-xs sm:text-sm font-tech text-neutral-400 tracking-[0.2em] uppercase">
                  ENGINEERING PORTFOLIO // 2026
                </div>
                <div className="w-16 h-0.5 bg-[#E10600] mx-auto mt-4" />
              </div>

              {/* Creator & Discipline */}
              <div className="space-y-3">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#E10600]">
                  CREATED, DESIGNED & DEVELOPED BY
                </div>
                <div className="font-display font-bold text-2xl sm:text-3xl text-white tracking-wide">
                  Rophe Angel
                </div>
                <div className="text-sm font-tech text-neutral-300 tracking-wider">
                  B.E. Computer Science & Engineering
                </div>
                <div className="text-xs font-mono text-neutral-500">
                  Chennai, India
                </div>
              </div>

              {/* Founder / Venture */}
              <div className="space-y-3">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#E10600]">
                  FOUNDER & VENTURE LEAD
                </div>
                <div className="font-display font-bold text-xl sm:text-2xl text-white tracking-wide">
                  GradEarn
                </div>
                <div className="text-xs sm:text-sm font-body text-neutral-300 max-w-md mx-auto leading-relaxed">
                  Empowering student builders to turn curiosity into verified proof-of-work, client engagements, and competitive hackathon wins.
                </div>
              </div>

              {/* Featured Engineering Projects */}
              <div className="space-y-8 w-full max-w-lg">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#E10600]">
                  FEATURED ENGINEERING ARCHITECTURE
                </div>

                {/* HUSH */}
                <div className="space-y-1.5 border-t border-white/[0.08] pt-4">
                  <div className="font-display font-bold text-lg sm:text-xl text-white tracking-wider">
                    HUSH
                  </div>
                  <div className="text-xs font-tech uppercase text-[#E10600] tracking-wider">
                    Personal Music Streaming Client
                  </div>
                  <div className="text-xs font-mono text-neutral-400">
                    Spotify Web API · Web Playback SDK · Pure JavaScript Engine
                  </div>
                </div>

                {/* ICHNOVA */}
                <div className="space-y-1.5 border-t border-white/[0.08] pt-4">
                  <div className="font-display font-bold text-lg sm:text-xl text-white tracking-wider">
                    ICHNOVA
                  </div>
                  <div className="text-xs font-tech uppercase text-[#E10600] tracking-wider">
                    Automated RF Spectral Parameter Platform
                  </div>
                  <div className="text-xs font-mono text-neutral-400">
                    Signal Processing (.IQ / .wav) · Claude · Salesforce Agentforce
                  </div>
                </div>

                {/* THADAM */}
                <div className="space-y-1.5 border-t border-white/[0.08] pt-4">
                  <div className="font-display font-bold text-lg sm:text-xl text-white tracking-wider">
                    THADAM
                  </div>
                  <div className="text-xs font-tech uppercase text-[#E10600] tracking-wider">
                    AI-Assisted Public Fund Transparency Portal
                  </div>
                  <div className="text-xs font-mono text-neutral-400">
                    MPLAD Scheme Anomaly Detection · Regional Expenditure Analytics
                  </div>
                </div>
              </div>

              {/* Special Characters & Companions */}
              <div className="space-y-6 w-full max-w-md">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#E10600]">
                  CHARACTERS & DIGITAL CO-PILOTS
                </div>

                <div className="space-y-1">
                  <div className="font-display font-bold text-base sm:text-lg text-white">
                    Mikey the Tabby Cat
                  </div>
                  <div className="text-xs font-tech uppercase text-neutral-400 tracking-wider">
                    Chief Companion & Autonomous Roaming Sprite
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="font-display font-bold text-base sm:text-lg text-white">
                    Chibi Rophe
                  </div>
                  <div className="text-xs font-tech uppercase text-neutral-400 tracking-wider">
                    Scuderia Pit Crew & Welcoming Host
                  </div>
                </div>
              </div>

              {/* Acoustic & Sound Engineering */}
              <div className="space-y-4 max-w-md">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#E10600]">
                  ACOUSTIC DIRECTION & AUDIO SYNTHESIS
                </div>
                <div className="font-display font-bold text-base sm:text-lg text-white">
                  Procedural Web Audio Engine
                </div>
                <div className="text-xs font-body text-neutral-300 leading-relaxed">
                  Synthesized harmonic multi-oscillators, Doppler acceleration whooshes, Undertale-inspired dialogue blips, and Ferrari F1 Pit Wall radio tributes.
                </div>
                <div className="text-xs font-mono text-neutral-500 italic">
                  „My seat is full of water“ — „Must be the water“
                </div>
              </div>

              {/* Visual Physics & Interaction Engineering */}
              <div className="space-y-4 max-w-md">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#E10600]">
                  VISUAL PHYSICS & MOTION DESIGN
                </div>
                <div className="text-xs sm:text-sm font-tech uppercase text-neutral-200 tracking-wider space-y-1.5">
                  <div>Liquid Motion Background & Organic Ripples</div>
                  <div>Magnetic Vector Physics & Spring Dynamics</div>
                  <div>Liquid Lens Refraction & Chromatic Split</div>
                  <div>Velocity Marquee & Dynamic Text Scramble</div>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="w-2 h-2 rounded-full bg-[#E10600]" />
                  <span className="text-[11px] font-mono text-neutral-400">#E10600 Ferrari Red</span>
                  <span className="w-2 h-2 rounded-full bg-white ml-2" />
                  <span className="text-[11px] font-mono text-neutral-400">#FFFFFF Pure White</span>
                  <span className="w-2 h-2 rounded-full bg-[#0A0A0A] border border-white/30 ml-2" />
                  <span className="text-[11px] font-mono text-neutral-400">#0A0A0A Pure Black</span>
                </div>
              </div>

              {/* Frameworks & Tech Stack */}
              <div className="space-y-3 max-w-md">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#E10600]">
                  FRAMEWORKS & TECHNOLOGIES
                </div>
                <div className="text-xs font-mono text-neutral-400 leading-relaxed">
                  React 19 · TypeScript · Tailwind CSS · Framer Motion · Lucide Icons · Web Audio API · Vite
                </div>
              </div>

              {/* Special Thanks */}
              <div className="space-y-4 max-w-md">
                <div className="text-xs font-tech font-bold uppercase tracking-[0.25em] text-[#E10600]">
                  SPECIAL THANKS
                </div>
                <div className="text-xs sm:text-sm font-body text-neutral-300 leading-relaxed space-y-2">
                  <p>My Family</p>
                  <p>My Friends</p>
                  <p>Mikey</p>
                </div>
              </div>

              {/* Closing Sign-off */}
              <div className="space-y-4 pt-10 pb-20 border-t border-white/[0.08] w-full max-w-md">
                <div className="text-sm font-tech font-bold uppercase tracking-[0.2em] text-[#E10600]">
                  DRIVEN BY CURIOSITY // ENGINEERED FOR VELOCITY
                </div>
                <div className="text-xs font-mono text-neutral-500">
                  © 2026 ROPHE ANGEL. ALL RIGHTS RESERVED.
                </div>
                <div className="text-[11px] font-mono text-neutral-600">
                  COMMUNICATION LINK // TERMINATED
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PHASE 2: MINIMALIST FINAL SCREEN */}
        {phase === 'final_screen' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center animate-fadeIn select-none">
            
            {/* Ambient Red Luminescence Behind Logo */}
            <div 
              className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#E10600]/10 blur-3xl pointer-events-none" 
              aria-hidden="true" 
            />

            {/* Existing Authentic Portfolio Logo */}
            <div className="relative z-10 mb-6">
              <img 
                src="/logo.png" 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://plain-apac-prod-public.komododecks.com/202610/20/YZgT7SnpXc2zs3CnoXeZ/image.png';
                }}
                alt="Rophe Angel Racing Logo" 
                className="w-auto h-auto max-w-[200px] sm:max-w-[280px] md:max-w-[340px] max-h-[140px] sm:max-h-[180px] object-contain drop-shadow-[0_0_40px_rgba(225,6,0,0.28)]"
              />
            </div>

            {/* Typography */}
            <h2 className="relative z-10 font-display font-black text-2xl sm:text-4xl text-white tracking-widest uppercase mb-2">
              ROPHE ANGEL
            </h2>
            <div className="relative z-10 text-xs sm:text-sm font-tech text-neutral-400 tracking-[0.3em] uppercase mb-8">
              ENGINEERING PORTFOLIO // 2026
            </div>

            {/* Action Buttons: Replay Credits + Return to Portfolio */}
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={handleReplay}
                className="f1-btn-secondary px-5 py-2.5 rounded-lg inline-flex items-center gap-2 text-xs font-tech font-bold tracking-wider uppercase cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#E10600]" />
                <span>REPLAY CREDITS</span>
              </button>

              <button
                onClick={onClose}
                className="f1-btn-primary px-6 py-2.5 rounded-lg inline-flex items-center gap-2 text-xs font-tech font-bold tracking-wider uppercase cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>RETURN TO PORTFOLIO</span>
              </button>
            </div>

            <div className="relative z-10 mt-12 text-[11px] font-mono text-neutral-600 tracking-widest uppercase">
              SECTOR 03 CLEARED · ALL SYSTEMS NOMINAL
            </div>
          </div>
        )}

      </div>

      {/* Subtle Bottom Status Bar */}
      <footer className="relative z-40 w-full px-6 py-2.5 flex items-center justify-between text-[10px] font-mono text-neutral-500 bg-[#0A0A0A]/80 border-t border-white/[0.06]">
        <div>CONSOLE ID: RR-2026-F1 // CH: 446.006 MHz</div>
        <div className="flex items-center gap-2">
          <span>PRESS ESC TO EXIT</span>
          <span>·</span>
          <span>SPACE TO PAUSE</span>
        </div>
      </footer>
    </div>
  );
};
