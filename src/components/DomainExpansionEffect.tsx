import React, { useEffect, useState, useRef } from 'react';
import { domainAudio } from '../utils/audio';

interface DomainExpansionEffectProps {
  onComplete: () => void;
  isReducedMotion: boolean;
}

export const DomainExpansionEffect: React.FC<DomainExpansionEffectProps> = ({
  onComplete,
  isReducedMotion
}) => {
  // Stages:
  // 0: Initial optical slit aperture expansion (0ms)
  // 1: Kanji Ryōiki Tenkai reveal (400ms)
  // 2: DOMAIN EXPANSION impact slam (1150ms)
  // 3: ETERNAL BUFFERING & Engine acceleration build-up (1850ms)
  // 4: High-speed directional shutter wipe & transition to hero (2850ms - 3250ms)
  const [stage, setStage] = useState<number>(0);
  const [screenImpulse, setScreenImpulse] = useState<boolean>(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isReducedMotion) {
      domainAudio.playDomainTitleImpact();
      setStage(3);
      const timer = setTimeout(() => {
        domainAudio.playRevealWhoosh();
        onCompleteRef.current();
      }, 1000);
      return () => clearTimeout(timer);
    }

    const t0 = setTimeout(() => {
      setStage(1);
    }, 400);

    const t1 = setTimeout(() => {
      setStage(2);
      setScreenImpulse(true);
      domainAudio.playDomainTitleImpact();
      setTimeout(() => setScreenImpulse(false), 240);
    }, 1150);

    const t2 = setTimeout(() => {
      setStage(3);
      setScreenImpulse(true);
      domainAudio.playBufferingTitleImpact();
      domainAudio.playEngineRevAcceleration();
      setTimeout(() => setScreenImpulse(false), 280);
    }, 1850);

    const t3 = setTimeout(() => {
      setStage(4);
      domainAudio.playRacingTransitionSpeedPass();
    }, 2850);

    const t4 = setTimeout(() => {
      onCompleteRef.current();
    }, 3300);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isReducedMotion]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A] overflow-hidden select-none transition-all duration-300 ${
        stage === 4 ? 'opacity-0 filter blur-xs pointer-events-none' : 'opacity-100'
      } ${screenImpulse ? 'translate-y-[-1.5px]' : ''}`}
      role="region"
      aria-label="Domain Expansion Cinematic Sequence"
    >
      {/* 1. Cinematic Background Vignette & Ambient Radial Glow */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: 'radial-gradient(circle at center, rgba(225, 6, 0, 0.22) 0%, rgba(10, 10, 10, 0.98) 75%)',
          opacity: stage >= 2 ? 0.9 : 0.4
        }}
      />

      {/* 2. Precision Paddock Horizon Calipers */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E10600] to-transparent" />
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-white/30 to-transparent" />
      </div>

      {/* 3. Stage 3 & 4 Directional Anamorphic Racing Light Streaks */}
      {stage >= 3 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <div className="absolute top-[28%] -left-full w-[250%] h-[2px] bg-gradient-to-r from-transparent via-[#E10600] to-transparent animate-[f1LightSweep_0.8s_ease-out_infinite]" />
          <div className="absolute top-[48%] -left-full w-[250%] h-[3px] bg-gradient-to-r from-transparent via-[#FFFFFF] via-[#E10600] to-transparent animate-[f1LightSweep_0.6s_ease-out_infinite]" />
          <div className="absolute top-[68%] -left-full w-[250%] h-[1.5px] bg-gradient-to-r from-transparent via-[#E10600] to-transparent animate-[f1LightSweep_0.9s_ease-out_infinite]" />
        </div>
      )}

      {/* 4. Central Cinematic Typography Composition */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl">
        
        {/* Kanji Calligraphy: 領域展開 (Ryōiki Tenkai) */}
        <div 
          className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform"
          style={{
            opacity: stage >= 1 ? 1 : 0,
            transform: stage >= 1 ? 'translateY(0px) scale(1)' : 'translateY(-14px) scale(0.96)'
          }}
        >
          <span 
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.35em] text-[#E10600] font-display inline-block"
            style={{
              textShadow: '0 0 35px rgba(225, 6, 0, 0.75)'
            }}
          >
            領域展開
          </span>
          <p className="text-xs sm:text-sm font-tech tracking-[0.4em] uppercase text-neutral-400 mt-1.5">
            RYŌIKI TENKAI
          </p>
        </div>

        {/* Stage 2: DOMAIN EXPANSION main title impact */}
        <div 
          className="my-4 sm:my-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform"
          style={{
            opacity: stage >= 2 ? 1 : 0,
            transform: stage >= 2 ? 'scale(1)' : 'scale(1.12)',
            filter: stage >= 2 ? 'blur(0px)' : 'blur(4px)'
          }}
        >
          <h1 
            className="font-display text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-[#FFFFFF] tracking-tight leading-none uppercase"
            style={{
              textShadow: '0 0 30px rgba(225, 6, 0, 0.6), 0 0 70px rgba(225, 6, 0, 0.25)'
            }}
          >
            DOMAIN EXPANSION
          </h1>
        </div>

        {/* Stage 3: Subtitle Kanji & ETERNAL BUFFERING */}
        <div 
          className="space-y-1 sm:space-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform"
          style={{
            opacity: stage >= 3 ? 1 : 0,
            transform: stage >= 3 ? 'translateY(0px)' : 'translateY(16px)'
          }}
        >
          <p className="text-base sm:text-xl font-bold tracking-[0.35em] text-neutral-300 font-display">
            永遠のバッファリング
          </p>
          <h2 
            className="font-tech text-3xl sm:text-5xl md:text-6xl font-black text-[#E10600] tracking-widest uppercase"
            style={{
              textShadow: '0 0 24px rgba(225, 6, 0, 0.8)'
            }}
          >
            ETERNAL BUFFERING
          </h2>
        </div>

        {/* Stage 3: Accelerating Dynamic Energy Core (NO LOGO) */}
        <div 
          className="mt-8 relative flex items-center justify-center transition-all duration-500 transform"
          style={{
            opacity: stage >= 3 ? 1 : 0,
            transform: stage >= 3 ? 'scale(1)' : 'scale(0.6)'
          }}
        >
          {/* Subtle concentric shockwave ripples */}
          <div className="absolute w-36 h-36 rounded-full border border-[#E10600]/60 animate-ping opacity-60 pointer-events-none" />
          <div className="absolute w-48 h-48 rounded-full border border-white/20 animate-pulse pointer-events-none" />
          
          {/* Central hot core */}
          <div className="w-4 h-4 rounded-full bg-[#FFFFFF] shadow-[0_0_24px_#E10600]" />
        </div>

        {/* Cinematic System Status */}
        <div className="mt-8 flex items-center gap-2 text-xs font-tech tracking-widest uppercase text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse" />
          <span>SYNCHRONIZING TELEMETRY // ENGAGING SHOWROOM</span>
        </div>

      </div>

      {/* 5. Directional Shutter Reveal Wipe (Climax Transition) */}
      {stage >= 4 && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFFFFF] to-transparent z-40 pointer-events-none transition-transform duration-400 ease-out"
          style={{
            transform: 'translateX(0%)'
          }}
        />
      )}
    </div>
  );
};
