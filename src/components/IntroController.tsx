import React, { useState } from 'react';
import { ChibiGreeting } from './ChibiGreeting';
import { LiquidTransition } from './LiquidTransition';
import { LogoInterstitial } from './LogoInterstitial';
import { HeadphoneNotice } from './HeadphoneNotice';
import { MikeyIntro } from './MikeyIntro';
import { domainAudio } from '../utils/audio';
import { Volume2, VolumeX, FastForward } from 'lucide-react';

interface IntroControllerProps {
  onIntroComplete: (landingX?: number) => void;
  isReducedMotion: boolean;
  isMuted?: boolean;
  onToggleSound?: () => void;
  onStartReveal?: () => void;
}

export type IntroPhase = 'chibi' | 'liquid_transition' | 'headphone_notice' | 'logo_interstitial' | 'mikey';

export const IntroController: React.FC<IntroControllerProps> = ({
  onIntroComplete,
  isReducedMotion,
  isMuted: propIsMuted,
  onToggleSound: propOnToggleSound,
  onStartReveal
}) => {
  const [phase, setPhase] = useState<IntroPhase>('chibi');
  const [localMuted, setLocalMuted] = useState<boolean>(() => domainAudio.getMuted());
  const [isRevealingHomepage, setIsRevealingHomepage] = useState<boolean>(false);

  // Sync with prop state if provided, otherwise fall back to domainAudio
  const isMuted = propIsMuted !== undefined ? propIsMuted : localMuted;

  const handleToggleSound = () => {
    if (propOnToggleSound) {
      propOnToggleSound();
    } else {
      const nextMuted = domainAudio.toggleMute();
      setLocalMuted(nextMuted);
    }
  };

  // Stage 1 -> Stage 2: Chibi finished speaking -> Start liquid transition
  const handleGreetingFinished = () => {
    setPhase('liquid_transition');
  };

  // Stage 2 -> Stage 2.5: Liquid transition completed -> Present Cinematic Headphone Notice
  const handleLiquidTransitionFinished = () => {
    setPhase('headphone_notice');
  };

  // Stage 2.5 -> Stage 3: Headphone Notice completed (faded out completely) -> Present Cinematic Logo Interstitial
  const handleHeadphoneNoticeFinished = () => {
    setPhase('logo_interstitial');
  };

  // Stage 3 -> Stage 4: Logo Interstitial completed (after exact 1s fade-out) -> Present Mikey Introduction scene
  const handleLogoInterstitialFinished = () => {
    setPhase('mikey');
  };

  // Skip button behaviour: immediately skip all pre-Mikey stages directly to Mikey's existing intro
  const handleSkipToMikey = () => {
    // Start main BGM cleanly for Mikey's intro
    domainAudio.startBGM();
    // Transition directly to Mikey's intro without skipping Mikey
    setPhase('mikey');
  };

  // Stage 4 -> Homepage: User taps Mikey -> Initiate homepage reveal
  const handleStartReveal = () => {
    setIsRevealingHomepage(true);
    onStartReveal?.();
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden select-none ${
        isRevealingHomepage ? 'pointer-events-none' : ''
      }`}
    >
      {/* Solid Dark Screen Backdrop:
          Remains solid black throughout chibi, liquid_transition, logo_interstitial, and mikey intro.
          Only dissolves to reveal the homepage when the visitor taps Mikey! */}
      <div 
        className={`absolute inset-0 bg-[#0A0A0A] pointer-events-none transition-opacity duration-700 ${
          isRevealingHomepage ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Persistent Global Audio Control:
          Remains visible, interactive, and at the exact same screen position
          throughout Chibi dialogue, Splash transition, Logo interstitial, and Mikey intro!
          Higher z-index (z-[60]) ensures it remains above the pure black interstitial. */}
      {!isRevealingHomepage && (
        <div className="absolute top-6 left-6 z-[60] flex items-center gap-3">
          <button
            onClick={handleToggleSound}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-700 hover:border-[#E10600] text-xs font-tech tracking-wider uppercase text-neutral-300 hover:text-[#FFFFFF] transition-all cursor-pointer backdrop-blur-sm shadow-lg active:scale-95"
            aria-label={isMuted ? "Enable audio" : "Mute audio"}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                <span>Sound: Muted (Click to Unmute)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#E10600] animate-pulse" />
                <span className="text-[#FFFFFF]">Sound: ON</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Persistent Skip Button across all pre-Mikey stages (chibi, liquid transition, headphone notice, logo interstitial):
          Immediately skips directly to Mikey's intro without skipping Mikey.
          Preserves the existing Skip button appearance and top-right position. */}
      {phase !== 'mikey' && !isRevealingHomepage && (
        <div className="absolute top-6 right-6 z-[60] flex items-center">
          <button
            onClick={handleSkipToMikey}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-900/80 border border-neutral-700 hover:border-[#E10600] text-xs font-tech text-neutral-300 hover:text-[#FFFFFF] transition-all cursor-pointer backdrop-blur-sm active:scale-95 shadow-lg"
            aria-label="Skip intro"
          >
            <span>Skip</span>
            <FastForward className="w-3.5 h-3.5 text-[#E10600]" />
          </button>
        </div>
      )}

      {/* 1. The Original Chibi Greeting Talking Intro (Stage 1) */}
      {phase === 'chibi' && (
        <ChibiGreeting 
          onComplete={handleGreetingFinished}
          onSkip={handleSkipToMikey}
          isReducedMotion={isReducedMotion}
        />
      )}

      {/* 2. Short, Subtle Liquid Wave Transition (Stage 2) */}
      {phase === 'liquid_transition' && (
        <LiquidTransition
          onComplete={handleLiquidTransitionFinished}
          isReducedMotion={isReducedMotion}
        />
      )}

      {/* 2.5 Cinematic Headphone Notice (Stage 2.5) */}
      {phase === 'headphone_notice' && (
        <HeadphoneNotice
          onComplete={handleHeadphoneNoticeFinished}
          isReducedMotion={isReducedMotion}
        />
      )}

      {/* 3. Cinematic Logo Interstitial (Stage 3 — Ferrari-inspired reveal on pure black) */}
      {phase === 'logo_interstitial' && (
        <LogoInterstitial
          onComplete={handleLogoInterstitialFinished}
          isReducedMotion={isReducedMotion}
        />
      )}

      {/* 4. Dedicated Mikey Introduction Scene (Stage 4 — Mounts ONLY after logo interstitial fade-out finishes) */}
      {phase === 'mikey' && (
        <MikeyIntro
          onStartReveal={handleStartReveal}
          onContinue={onIntroComplete}
          isReducedMotion={isReducedMotion}
          isInteractive={true}
        />
      )}
    </div>
  );
};
