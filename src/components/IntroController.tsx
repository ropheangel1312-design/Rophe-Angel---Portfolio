import React, { useState } from 'react';
import { IntroPhase } from '../types';
import { ChibiGreeting } from './ChibiGreeting';
import { DomainExpansionEffect } from './DomainExpansionEffect';
import { domainAudio } from '../utils/audio';
import { Volume2, VolumeX } from 'lucide-react';

interface IntroControllerProps {
  onIntroComplete: () => void;
  isReducedMotion: boolean;
}

export const IntroController: React.FC<IntroControllerProps> = ({
  onIntroComplete,
  isReducedMotion
}) => {
  const [phase, setPhase] = useState<IntroPhase>('CHIBI_GREETING');
  const [isMuted, setIsMuted] = useState<boolean>(domainAudio.getMuted());

  const handleToggleSound = () => {
    const nextMuted = domainAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleChibiComplete = () => {
    setPhase('DOMAIN_EXPANSION');
  };

  const handleDomainComplete = () => {
    setPhase('HOMEPAGE_REVEAL');
    onIntroComplete();
  };

  if (phase === 'HOMEPAGE_REVEAL') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0A0A0A]">
      {/* Audio Control Overlay */}
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

      {/* Intro Phases */}
      {phase === 'CHIBI_GREETING' && (
        <ChibiGreeting 
          onComplete={handleChibiComplete}
          isReducedMotion={isReducedMotion}
        />
      )}

      {phase === 'DOMAIN_EXPANSION' && (
        <DomainExpansionEffect
          onComplete={handleDomainComplete}
          isReducedMotion={isReducedMotion}
        />
      )}
    </div>
  );
};
