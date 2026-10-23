/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Navigation } from './components/Navigation';
import { PortfolioHomepage } from './components/PortfolioHomepage';
import { LiquidMotionBackground } from './components/LiquidMotionBackground';
import { RippleGrid } from './components/RippleGrid';
import { MikeyTheCat } from './components/MikeyTheCat';
import { IntroController } from './components/IntroController';
import { LiteralCookieConsent } from './components/LiteralCookieConsent';
import { ResumeViewerModal } from './components/ResumeViewerModal';
import { domainAudio } from './utils/audio';

export default function App() {
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(false);
  const [isIntroRevealing, setIsIntroRevealing] = useState<boolean>(false);
  const [isResumeOpen, setIsResumeOpen] = useState<boolean>(false);

  const [isMuted, setIsMuted] = useState<boolean>(() => domainAudio.getMuted());

  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const [mikeyLandingX, setMikeyLandingX] = useState<number | undefined>(undefined);

  const handleIntroComplete = (landingX?: number) => {
    if (landingX !== undefined) {
      setMikeyLandingX(landingX);
    }
    setHasSeenIntro(true);
    setIsIntroRevealing(false);
  };

  const handleReplayIntro = () => {
    domainAudio.pauseBGM(true);
    setIsIntroRevealing(false);
    setHasSeenIntro(false);
  };

  const handleToggleSound = () => {
    const nextMuted = domainAudio.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      domainAudio.startBGM(true);
    }
  };

  // Suspend heavy background WebGL and Canvas2D processing while the opaque intro overlay is active.
  // This eliminates GPU contention so the Liquid Transition renders at a full 60fps without hitching.
  const isBackgroundPaused = !hasSeenIntro && !isIntroRevealing;

  return (
    <div className="relative min-h-screen bg-transparent text-[#FFFFFF] overflow-x-clip selection:bg-[#E10600]/35 selection:text-[#FFFFFF]">
      {/* Premium Liquid Motion Background System (Organic ripple propagation, continuous liquid distortion, Ferrari Red highlights) */}
      <LiquidMotionBackground isReducedMotion={isReducedMotion} isPaused={isBackgroundPaused} />

      {/* Ripple Grid Interactive Overlay (Transparent, non-blocking dots that ripple on click) */}
      <RippleGrid isReducedMotion={isReducedMotion} isPaused={isBackgroundPaused} />

      {/* Signature Chibi Character Talking Intro Sequence */}
      {!hasSeenIntro && (
        <IntroController
          onIntroComplete={handleIntroComplete}
          onStartReveal={() => setIsIntroRevealing(true)}
          isReducedMotion={isReducedMotion}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Main Sticky Navigation */}
      <Navigation 
        isReducedMotion={isReducedMotion} 
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onReplayIntro={handleReplayIntro}
        onOpenResume={() => setIsResumeOpen(true)}
      />

      {/* Main Portfolio Surface */}
      <main className="relative z-10">
        <PortfolioHomepage 
          isReducedMotion={isReducedMotion} 
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          onOpenResume={() => setIsResumeOpen(true)}
        />
      </main>

      {/* Roaming Companion Character — Mikey the Tabby Cat */}
      {hasSeenIntro && (
        <MikeyTheCat 
          isReducedMotion={isReducedMotion} 
          initialX={mikeyLandingX}
        />
      )}

      {/* Playful Literal Cookie Consent Prank Banner */}
      {hasSeenIntro && (
        <LiteralCookieConsent isReducedMotion={isReducedMotion} />
      )}

      {/* Dedicated Responsive Resume Viewer Modal */}
      <ResumeViewerModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        isReducedMotion={isReducedMotion}
      />

      {/* Vercel Speed Insights */}
      <SpeedInsights />
    </div>
  );
}
