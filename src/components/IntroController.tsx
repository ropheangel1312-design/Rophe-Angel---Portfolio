import React, { useState } from 'react';
import { ChibiGreeting } from './ChibiGreeting';
import { LiquidTransition } from './LiquidTransition';
import { MikeyIntro } from './MikeyIntro';
import { domainAudio } from '../utils/audio';
import { Volume2, VolumeX } from 'lucide-react';

interface IntroControllerProps {
  onIntroComplete: (landingX?: number) => void;
  isReducedMotion: boolean;
}

export type IntroPhase = 'chibi' | 'liquid_transition' | 'mikey';

export const IntroController: React.FC<IntroControllerProps> = ({
  onIntroComplete,
  isReducedMotion
}) => {
  const [phase, setPhase] = useState<IntroPhase>('chibi');
  const [isMuted, setIsMuted] = useState<boolean>(domainAudio.getMuted());
  const [isRevealingHomepage, setIsRevealingHomepage] = useState<boolean>(false);

  const handleToggleSound = () => {
    const nextMuted = domainAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  // Stage 1 -> Stage 2: Chibi finished speaking -> Start liquid transition
  const handleGreetingFinished = () => {
    setPhase('liquid_transition');
  };

  // Stage 2 -> Stage 3: Liquid transition completed visually and acoustically -> Present Mikey Introduction scene
  const handleLiquidTransitionFinished = () => {
    setPhase('mikey');
  };

  // Stage 3 -> Stage 4: User taps Mikey -> Initiate homepage reveal
  const handleStartReveal = () => {
    setIsRevealingHomepage(true);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden select-none ${
        isRevealingHomepage ? 'pointer-events-none' : ''
      }`}
    >
      {/* Solid Dark Screen Backdrop:
          Remains solid black throughout chibi, liquid_transition, and mikey intro.
          Only dissolves to reveal the homepage when the visitor taps Mikey! */}
      <div 
        className={`absolute inset-0 bg-[#0A0A0A] pointer-events-none transition-opacity duration-700 ${
          isRevealingHomepage ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Audio Control Overlay */}
      {phase !== 'liquid_transition' && !isRevealingHomepage && (
        <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
          <button
            onClick={handleToggleSound}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-700 hover:border-[#E10600] text-xs font-tech tracking-wider uppercase text-neutral-300 hover:text-[#FFFFFF] transition-all cursor-pointer backdrop-blur-sm"
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

      {/* 1. The Original Chibi Greeting Talking Intro (Stage 1 only) */}
      {phase === 'chibi' && (
        <ChibiGreeting 
          onComplete={handleGreetingFinished}
          isReducedMotion={isReducedMotion}
        />
      )}

      {/* 2. Short, Subtle Liquid Wave Transition (Stage 2 only — Mikey is NEVER rendered during this phase) */}
      {phase === 'liquid_transition' && (
        <LiquidTransition
          onComplete={handleLiquidTransitionFinished}
          isReducedMotion={isReducedMotion}
        />
      )}

      {/* 3. Dedicated Mikey Introduction Scene (Stage 3 only — Mounts ONLY after transition has fully finished) */}
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
