import React, { useEffect, useState } from 'react';
import { domainAudio } from '../utils/audio';

interface DomainAnnouncementProps {
  onComplete: () => void;
  isReducedMotion: boolean;
}

export const DomainAnnouncement: React.FC<DomainAnnouncementProps> = ({ onComplete, isReducedMotion }) => {
  const [hasImpacted, setHasImpacted] = useState(false);

  useEffect(() => {
    if (isReducedMotion) {
      setHasImpacted(true);
      domainAudio.playTitleImpact();
      const timer = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }

    const impactTimer = setTimeout(() => {
      setHasImpacted(true);
      domainAudio.playTitleImpact();
    }, 150);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 750);

    return () => {
      clearTimeout(impactTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, isReducedMotion]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#101626] text-center p-4 overflow-hidden select-none ${
        hasImpacted && !isReducedMotion ? 'animate-screen-shake' : ''
      }`}
      role="region"
      aria-label="Domain Announcement"
    >
      {/* Title Container */}
      {hasImpacted && (
        <div className="relative z-10 flex flex-col items-center justify-center max-w-5xl w-full">
          {/* Sub-header: DOMAIN EXPANSION */}
          <div className="mb-2 sm:mb-4">
            <h2 
              className="font-tech text-sm sm:text-lg md:text-xl font-bold tracking-[0.5em] sm:tracking-[0.65em] text-[#F7F0E6] uppercase"
              style={{
                textShadow: '0 0 10px rgba(247, 240, 230, 0.4)'
              }}
            >
              DOMAIN EXPANSION
            </h2>
            <div className="w-20 sm:w-28 h-[2px] bg-gradient-to-r from-transparent via-[#A8E6D4] to-transparent mx-auto mt-2" />
          </div>

          {/* Primary Title: ETERNAL BUFFERING */}
          <div className="relative">
            <h1 
              className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#AFA0FF] leading-none animate-glitch"
              style={{
                textShadow: `
                  -3px 0 0 rgba(168, 230, 212, 0.8),
                  3px 0 0 rgba(246, 184, 111, 0.7),
                  0 0 30px rgba(175, 160, 255, 0.6)
                `
              }}
            >
              ETERNAL BUFFERING
            </h1>

            {/* Kanji/Glyph spiritual watermark accents */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 text-[#A8E6D4] text-xs sm:text-sm font-tech tracking-widest uppercase font-bold">
              <span>[ 永続的緩衝領域 ]</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F6B86F] animate-ping" />
              <span>[ REALITY SEVERED ]</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
