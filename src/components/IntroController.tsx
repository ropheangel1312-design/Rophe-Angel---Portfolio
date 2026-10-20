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

type IntroPhase = 'greeting' | 'liquid_transition' | 'mikey';

export const IntroController: React.FC<IntroControllerProps> = ({
  onIntroComplete,
  isReducedMotion
}) => {
  const [phase, setPhase] = useState<IntroPhase>('greeting');
  const [isMuted, setIsMuted] = useState<boolean>(domainAudio.getMuted());

  const handleToggleSound = () => {
    const nextMuted = domainAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  // Stage 1 -> Stage 2: Chibi finished speaking -> Start subtle liquid transition
  const handleGreetingFinished = () => {
    setPhase('liquid_transition');
  };

  // Stage 2 -> Stage 3: Liquid transition completed -> Present Mikey Introduction scene
  const handleLiquidTransitionFinished = () => {
    setPhase('mikey');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0A0A0A]">
      {/* Audio Control Overlay */}
      {phase !== 'liquid_transition' && (
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

      {/* 1. The Original Chibi Greeting Talking Intro */}
      {phase === 'greeting' && (
        <ChibiGreeting 
          onComplete={handleGreetingFinished}
          isReducedMotion={isReducedMotion}
        />
      )}

      {/* 2 & 3. Dedicated Mikey Introduction Scene */}
      {(phase === 'liquid_transition' || phase === 'mikey') && (
        <MikeyIntro
          onContinue={onIntroComplete}
          isReducedMotion={isReducedMotion}
          isInteractive={phase === 'mikey'}
        />
      )}

      {/* Short, Subtle Liquid Wave Transition revealing Mikey */}
      {phase === 'liquid_transition' && (
        <LiquidTransition
          onComplete={handleLiquidTransitionFinished}
          isReducedMotion={isReducedMotion}
        />
      )}
    </div>
  );
};
