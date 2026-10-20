import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChibiGreeting } from './ChibiGreeting';
import { AnimeFlameExpansion } from './AnimeFlameExpansion';
import { PortfolioHomepage } from './PortfolioHomepage';
import { Navigation } from './Navigation';
import { domainAudio } from '../utils/audio';
import { Volume2, VolumeX } from 'lucide-react';

const SESSION_STORAGE_KEY = 'domain_expansion_intro_seen_v4';

export const IntroController: React.FC = () => {
  // Check if intro has already been seen in this session
  const [phase, setPhase] = useState<'CHIBI_GREETING' | 'ANIME_FLAME_DOMAIN_EXPANSION' | 'HOMEPAGE_REVEAL'>(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const seen = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (seen === 'true') {
          return 'HOMEPAGE_REVEAL';
        }
      }
    } catch {
      // Safe fallback
    }
    return 'CHIBI_GREETING';
  });

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [replayKey, setReplayKey] = useState<number>(0);
  const [isTypingFinished, setIsTypingFinished] = useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Unique run ID to cancel pending timeouts and prevent stale animation phases
  const runIdRef = useRef<number>(0);

  // Sync reduced motion media query changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save completion in sessionStorage
  useEffect(() => {
    if (phase === 'HOMEPAGE_REVEAL') {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
        }
      } catch {
        // Safe fallback
      }
    }
  }, [phase]);

  // Skip button immediately stops audio, cancels pending timers, and reveals homepage
  const handleSkipIntro = useCallback(() => {
    runIdRef.current += 1;
    domainAudio.stopAll();
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      }
    } catch {
      // safe fallback
    }
    setPhase('HOMEPAGE_REVEAL');
  }, []);

  // Replay button restarts full intro from the beginning with clean state
  const handleReplayIntro = useCallback(() => {
    runIdRef.current += 1;
    domainAudio.stopAll();
    setIsTypingFinished(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    setReplayKey(prev => prev + 1);
    setPhase('CHIBI_GREETING');
  }, []);

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    const nextMuted = domainAudio.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Strict sequential phase transitions guarded by runIdRef
  const handleChibiComplete = useCallback(() => {
    const currentRun = runIdRef.current;
    setTimeout(() => {
      if (runIdRef.current === currentRun) {
        setPhase('ANIME_FLAME_DOMAIN_EXPANSION');
      }
    }, 20);
  }, []);

  const handleFlameExpansionComplete = useCallback(() => {
    const currentRun = runIdRef.current;
    setTimeout(() => {
      if (runIdRef.current === currentRun) {
        setPhase('HOMEPAGE_REVEAL');
      }
    }, 20);
  }, []);

  const handleTypingComplete = useCallback(() => {
    setIsTypingFinished(true);
  }, []);

  const isIntroActive = phase !== 'HOMEPAGE_REVEAL';

  // Requirement 4: Skip Intro button must appear ONLY after the chibi has completely finished typing
  const canShowSkipButton = isTypingFinished || phase !== 'CHIBI_GREETING';

  return (
    <div className="relative min-h-screen bg-[#101626] text-[#F7F0E6] overflow-x-clip selection:bg-[#AFA0FF]/30 selection:text-[#A8E6D4]">
      
      {/* ================= HOMEPAGE & NAVIGATION ================= */}
      <Navigation 
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onReplayIntro={handleReplayIntro}
        isReducedMotion={isReducedMotion}
      />
      <main>
        <PortfolioHomepage 
          onReplayIntro={handleReplayIntro}
          isReducedMotion={isReducedMotion}
        />
      </main>

      {/* ================= FULL-SCREEN INTRO OVERLAY ================= */}
      {isIntroActive && (
        <div className="fixed inset-0 z-[100] bg-[#101626]">
          
          {/* PHASE 1: CHIBI GREETING */}
          {phase === 'CHIBI_GREETING' && (
            <ChibiGreeting 
              key={`greeting-${replayKey}`}
              onComplete={handleChibiComplete} 
              onTypingComplete={handleTypingComplete}
              isReducedMotion={isReducedMotion} 
            />
          )}

          {/* PHASES 2 - 5: SEQUENTIAL TITLE REVEAL & ANIME FLAME TRANSITION */}
          {phase === 'ANIME_FLAME_DOMAIN_EXPANSION' && (
            <AnimeFlameExpansion 
              key={`flame-${replayKey}`}
              onComplete={handleFlameExpansionComplete} 
              isReducedMotion={isReducedMotion} 
            />
          )}

          {/* FLOATING CONTROLS: Liquid glass finish with brand palette */}
          <div className="fixed top-4 right-4 z-[9999] flex items-center gap-2.5 pointer-events-auto">
            {/* Audio toggle control */}
            <button
              onClick={handleToggleSound}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              title={isMuted ? "Enable Sound" : "Mute Sound"}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-[#AFA0FF] cursor-pointer ${
                !isMuted 
                  ? 'bg-[#AFA0FF]/25 border-[#AFA0FF] text-[#AFA0FF] shadow-[0_0_16px_rgba(175,160,255,0.4)]' 
                  : 'bg-[#101626]/85 border-[#A8E6D4]/30 text-[#F7F0E6]/70 hover:text-[#F7F0E6] hover:border-[#A8E6D4]'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#F7F0E6]/50" /> : <Volume2 className="w-4 h-4 text-[#AFA0FF]" />}
            </button>

            {/* Requirement 4: Skip Intro button appears ONLY after typing finishes */}
            {canShowSkipButton && (
              <button
                onClick={handleSkipIntro}
                aria-label="Skip Intro"
                className="px-4 py-2 rounded-xl bg-[#101626]/90 border-2 border-[#A8E6D4] hover:border-[#AFA0FF] text-xs font-tech font-bold tracking-widest text-[#A8E6D4] hover:text-[#AFA0FF] transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,22,38,0.9),0_0_12px_rgba(168,230,212,0.35)] focus:outline-hidden focus:ring-2 focus:ring-[#AFA0FF] active:scale-95 cursor-pointer animate-[fadeIn_0.3s_ease-out_both]"
              >
                <span>SKIP INTRO »</span>
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
