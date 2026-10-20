import React, { useEffect, useState, useMemo } from 'react';
import { domainAudio } from '../utils/audio';

interface DomainExpansionEffectProps {
  onComplete: () => void;
  isReducedMotion: boolean;
}

interface Shard {
  id: number;
  startX: number;
  startY: number;
  burstX: number;
  burstY: number;
  rotate: number;
  width: number;
  height: number;
  color: string;
}

export const DomainExpansionEffect: React.FC<DomainExpansionEffectProps> = ({ onComplete, isReducedMotion }) => {
  // Choreographed stages:
  // 1. fracture: irregular lightning cracks spread outward, digital fragments pulled inward to center (0 - 300ms)
  // 2. burst: Ghost Glass energy ring expands rapidly, Dead Rose shards explode outward, Apricot sparks fly (300 - 850ms)
  // 3. rupture: dimensional rupture opens across viewport with brief Old Screen flash (850 - 1200ms)
  const [stage, setStage] = useState<'fracture' | 'burst' | 'rupture'>('fracture');

  // Sharp, irregular glass shards and digital fragments with directional motion
  const shards = useMemo<Shard[]>(() => {
    const list: Shard[] = [];
    const colors = ['#A8E6D4', '#AFA0FF', '#F6B86F', '#F7F0E6'];
    const angles = [0, 45, 90, 135, 180, 225, 270, 315, 25, 65, 115, 155, 205, 245, 295, 335];

    angles.forEach((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      // Start pulled slightly outward, collapse inward, then burst far outward
      list.push({
        id: i,
        startX: Math.cos(rad) * 140,
        startY: Math.sin(rad) * 140,
        burstX: Math.cos(rad) * 850,
        burstY: Math.sin(rad) * 850,
        rotate: deg + (i % 2 === 0 ? 45 : -45),
        width: 14 + (i % 4) * 8,
        height: 35 + (i % 3) * 20,
        color: colors[i % colors.length]
      });
    });
    return list;
  }, []);

  useEffect(() => {
    domainAudio.playRingWhoosh();

    if (isReducedMotion) {
      setStage('rupture');
      domainAudio.playHomepageReveal();
      const timer = setTimeout(() => {
        onComplete();
      }, 350);
      return () => clearTimeout(timer);
    }

    // Stage 1: fracture & inward pull (0 to 300ms)
    const t1 = setTimeout(() => {
      setStage('burst');
    }, 320);

    // Stage 2: burst to rupture (at 850ms)
    const t2 = setTimeout(() => {
      setStage('rupture');
      domainAudio.playHomepageReveal();
    }, 850);

    // Total duration: ~1.2s
    const t3 = setTimeout(() => {
      onComplete();
    }, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete, isReducedMotion]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#08080B] overflow-hidden pointer-events-none select-none"
      role="region"
      aria-label="Domain Expansion Transition"
    >
      {/* 1. Thin, irregular energy cracks radiating from center */}
      <svg 
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200 ${
          stage === 'rupture' ? 'opacity-0' : 'opacity-100'
        }`}
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="xMidYMid slice"
      >
        <g strokeLinecap="round" strokeLinejoin="miter">
          {/* North-East jagged crack */}
          <path 
            d="M 500 500 L 520 440 L 490 390 L 560 320 L 530 260 L 610 180 L 670 80" 
            fill="none" 
            stroke="#A5C7BE" 
            strokeWidth="2.5" 
            className="animate-crack" 
          />
          {/* North-West jagged crack */}
          <path 
            d="M 500 500 L 460 460 L 420 410 L 440 340 L 380 270 L 340 180 L 290 90" 
            fill="none" 
            stroke="#BB7E8B" 
            strokeWidth="2" 
            className="animate-crack" 
          />
          {/* South-East jagged crack */}
          <path 
            d="M 500 500 L 540 550 L 520 620 L 590 690 L 640 760 L 710 860" 
            fill="none" 
            stroke="#F6B86F" 
            strokeWidth="2" 
            className="animate-crack" 
          />
          {/* South-West jagged crack */}
          <path 
            d="M 500 500 L 450 540 L 410 610 L 340 680 L 310 770 L 220 890" 
            fill="none" 
            stroke="#A8E6D4" 
            strokeWidth="2.5" 
            className="animate-crack" 
          />
          {/* Horizontal sharp side fractures */}
          <path 
            d="M 500 500 L 580 490 L 660 520 L 760 480 L 880 510 L 980 470" 
            fill="none" 
            stroke="#AFA0FF" 
            strokeWidth="2" 
            className="animate-crack" 
          />
          <path 
            d="M 500 500 L 420 510 L 350 480 L 240 520 L 130 490 L 20 510" 
            fill="none" 
            stroke="#A8E6D4" 
            strokeWidth="2" 
            className="animate-crack" 
          />
        </g>
      </svg>

      {/* 2. Rapidly Expanding Mint Energy Shockwave Ring */}
      <div 
        className={`absolute rounded-full border-[3px] border-[#A8E6D4] transition-all ${
          stage === 'fracture'
            ? 'w-8 h-8 opacity-100 scale-50'
            : stage === 'burst'
              ? 'w-[160vw] h-[160vw] opacity-100 scale-125 duration-500 ease-out'
              : 'w-[220vw] h-[220vw] opacity-0 scale-150 duration-300'
        }`}
        style={{
          boxShadow: '0 0 25px #A8E6D4, inset 0 0 15px #A8E6D4'
        }}
      />

      {/* Secondary Lilac Sharp Impact Ring */}
      <div 
        className={`absolute rounded-full border-[2px] border-dashed border-[#AFA0FF] transition-all ${
          stage === 'fracture'
            ? 'w-4 h-4 opacity-0'
            : stage === 'burst'
              ? 'w-[180vw] h-[180vw] opacity-90 scale-125 duration-600 ease-out'
              : 'w-[240vw] h-[240vw] opacity-0 duration-300'
        }`}
      />

      {/* 3. Sharp, Fragmented Digital Shards (pulled in, then bursting outward) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {shards.map((s) => {
          let tx = s.startX;
          let ty = s.startY;
          let scale = 1;

          if (stage === 'fracture') {
            // Pulled tightly into center
            tx = s.startX * 0.2;
            ty = s.startY * 0.2;
            scale = 0.5;
          } else if (stage === 'burst' || stage === 'rupture') {
            // Violent outward explosion
            tx = s.burstX;
            ty = s.burstY;
            scale = 1.3;
          }

          return (
            <div
              key={s.id}
              className="absolute transition-all ease-out"
              style={{
                width: `${s.width}px`,
                height: `${s.height}px`,
                backgroundColor: s.color,
                clipPath: 'polygon(50% 0%, 100% 70%, 50% 100%, 0% 70%)', // Sharp diamond shard silhouette
                transform: `translate(${tx}px, ${ty}px) rotate(${s.rotate}deg) scale(${scale})`,
                transitionDuration: stage === 'fracture' ? '300ms' : '550ms',
                opacity: stage === 'rupture' ? 0 : 0.95
              }}
            />
          );
        })}
      </div>

      {/* 4. Apricot Static Energy Sparks */}
      {stage === 'burst' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <div
              key={deg}
              className="absolute w-2 h-16 bg-[#E8AD82] shadow-[0_0_12px_#E8AD82] transition-transform duration-500 ease-out"
              style={{
                transform: `rotate(${deg}deg) translateY(-280px)`
              }}
            />
          ))}
        </div>
      )}

      {/* 5. Rupture: Screen tear parting open */}
      {stage === 'rupture' && (
        <div className="absolute inset-0 flex pointer-events-none z-40">
          <div 
            className="w-1/2 h-full bg-[#08080B] transition-transform duration-300 ease-in"
            style={{
              transform: 'translateX(-100%)',
              clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)'
            }}
          />
          <div 
            className="w-1/2 h-full bg-[#08080B] transition-transform duration-300 ease-in"
            style={{
              transform: 'translateX(100%)',
              clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)'
            }}
          />
        </div>
      )}

      {/* 6. Brief Old Screen (#E6DCC4) Flash Cut */}
      <div 
        className={`absolute inset-0 bg-[#E6DCC4] transition-opacity duration-200 z-50 pointer-events-none ${
          stage === 'rupture' ? 'opacity-90' : 'opacity-0'
        }`}
      />
    </div>
  );
};
