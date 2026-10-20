/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { PortfolioHomepage } from './components/PortfolioHomepage';
import { TelemetryCursor } from './components/TelemetryCursor';
import { AmbientMotionSystem } from './components/AmbientMotionSystem';
import { IntroController } from './components/IntroController';
import { domainAudio } from './utils/audio';

export default function App() {
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('hasSeenDomainIntro') === 'true';
  });

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

  const handleIntroComplete = () => {
    setHasSeenIntro(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hasSeenDomainIntro', 'true');
    }
  };

  const handleReplayIntro = () => {
    setHasSeenIntro(false);
  };

  const handleToggleSound = () => {
    const nextMuted = domainAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-[#FFFFFF] overflow-x-clip selection:bg-[#E10600]/35 selection:text-[#FFFFFF]">
      {/* Lightweight Ambient Motion System (drifting particles, soft light ribbons, perspective grid) */}
      <AmbientMotionSystem isReducedMotion={isReducedMotion} />

      {/* Global Interactive Motion System (trail & ripples, solid red dot removed) */}
      <TelemetryCursor />

      {/* Signature Domain Expansion Intro Sequence (without logo, racing transition, synthetic soundscape) */}
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
      <main>
        <PortfolioHomepage 
          isReducedMotion={isReducedMotion} 
        />
      </main>
    </div>
  );
}
