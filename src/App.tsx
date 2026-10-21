/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { PortfolioHomepage } from './components/PortfolioHomepage';
import { LiquidMotionBackground } from './components/LiquidMotionBackground';
import { RippleGrid } from './components/RippleGrid';
import { MikeyTheCat } from './components/MikeyTheCat';
import { IntroController } from './components/IntroController';
import { domainAudio } from './utils/audio';

export default function App() {
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(false);

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
  };

  const handleReplayIntro = () => {
    setHasSeenIntro(false);
  };

  const handleToggleSound = () => {
    const nextMuted = domainAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <div className="relative min-h-screen bg-transparent text-[#FFFFFF] overflow-x-clip selection:bg-[#E10600]/35 selection:text-[#FFFFFF]">
      {/* Premium Liquid Motion Background System (Organic ripple propagation, continuous liquid distortion, Ferrari Red highlights) */}
      <LiquidMotionBackground isReducedMotion={isReducedMotion} />

      {/* Ripple Grid Interactive Overlay (Transparent, non-blocking dots that ripple on click) */}
      <RippleGrid isReducedMotion={isReducedMotion} />

      {/* Signature Chibi Character Talking Intro Sequence */}
      {!hasSeenIntro && (
        <IntroController
          onIntroComplete={handleIntroComplete}
          isReducedMotion={isReducedMotion}
        />
      )}

      {/* Main Sticky Navigation */}
      <Navigation 
        isReducedMotion={isReducedMotion} 
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onReplayIntro={handleReplayIntro}
      />

      {/* Main Portfolio Surface */}
      <main className="relative z-10">
        <PortfolioHomepage 
          isReducedMotion={isReducedMotion} 
        />
      </main>

      {/* Roaming Companion Character — Mikey the Tabby Cat */}
      {hasSeenIntro && (
        <MikeyTheCat 
          isReducedMotion={isReducedMotion} 
          initialX={mikeyLandingX}
        />
      )}
    </div>
  );
}
