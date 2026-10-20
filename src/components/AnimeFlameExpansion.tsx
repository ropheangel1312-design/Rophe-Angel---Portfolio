import React, { useEffect, useState } from 'react';
import { domainAudio } from '../utils/audio';

interface AnimeFlameExpansionProps {
  onComplete: () => void;
  isReducedMotion: boolean;
}

export const AnimeFlameExpansion: React.FC<AnimeFlameExpansionProps> = ({ onComplete, isReducedMotion }) => {
  // Choreographed Anime Sequence Steps in exact specified order (tuned ~0.5s faster overall):
  // 1. 'black_void': Pure #101626 darkness beat (0 - 200ms)
  // 2. 'stage1_domain': ONLY "DOMAIN EXPANSION" appears with sharp scale-up impact & hold (200 - 650ms)
  // 3. 'stage2_buffering': "ETERNAL BUFFERING" strikes in with sub-bass slam & camera shake; both hold (650 - 1500ms)
  // 4. 'flame_ignite': Mint flame streak ignites near bottom with rising energy charge (1500 - 1950ms)
  // 5. 'flame_surge': Sweeping anime flames curl upward across screen (1950 - 2500ms)
  // 6. 'flame_engulf': Flames reach peak and engulf viewport with high-contrast impact frames (2500 - 2950ms)
  // 7. 'domain_opens': Warm off-white flash, light collapses, flames peel away to reveal homepage (2950 - 3300ms)
  const [step, setStep] = useState<
    | 'black_void'
    | 'stage1_domain'
    | 'stage2_buffering'
    | 'flame_ignite'
    | 'flame_surge'
    | 'flame_engulf'
    | 'domain_opens'
  >('black_void');

  // High contrast anime impact frame flash (monochrome inversion)
  const [impactFrame, setImpactFrame] = useState(false);

  useEffect(() => {
    if (isReducedMotion) {
      setStep('stage1_domain');
      domainAudio.playDomainTitleImpact();
      const t1 = setTimeout(() => {
        setStep('stage2_buffering');
        domainAudio.playBufferingTitleImpact();
      }, 400);

      const t2 = setTimeout(() => {
        domainAudio.playRevealWhoosh();
        onComplete();
      }, 950);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        domainAudio.stopAll();
      };
    }

    // Stage 1: Reveal ONLY "DOMAIN EXPANSION" first (at 200ms)
    const t1 = setTimeout(() => {
      setStep('stage1_domain');
      setImpactFrame(true);
      domainAudio.playDomainTitleImpact();
      setTimeout(() => setImpactFrame(false), 50);
    }, 200);

    // Stage 2: After a ~450ms pause, reveal "ETERNAL BUFFERING" beneath it (at 650ms)
    const t2 = setTimeout(() => {
      setStep('stage2_buffering');
      setImpactFrame(true);
      domainAudio.playBufferingTitleImpact();
      setTimeout(() => setImpactFrame(false), 60);
    }, 650);

    // Stage 3: Hold both titles together, then trigger anime flame transition (at 1500ms)
    const t3 = setTimeout(() => {
      setStep('flame_ignite');
      domainAudio.playFlameEnergyCharge();
    }, 1500);

    // Stage 4: Flames surge across the screen (at 1950ms)
    const t4 = setTimeout(() => {
      setStep('flame_surge');
    }, 1950);

    // Stage 5: Climax peak engulfment with impact frames & peak impact sound (at 2500ms)
    const t5 = setTimeout(() => {
      setStep('flame_engulf');
      domainAudio.playFlamePeakImpact();
      setImpactFrame(true);
      setTimeout(() => setImpactFrame(false), 70);
      setTimeout(() => {
        setImpactFrame(true);
        setTimeout(() => setImpactFrame(false), 55);
      }, 120);
    }, 2500);

    // Stage 6: Domain Opens - Warm Off-white flash cut & trailing whoosh (at 2950ms)
    const t6 = setTimeout(() => {
      setStep('domain_opens');
      domainAudio.playRevealWhoosh();
    }, 2950);

    // Finish sequence and reveal homepage (at 3300ms)
    const t7 = setTimeout(() => {
      onComplete();
    }, 3300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      domainAudio.stopAll();
    };
  }, [onComplete, isReducedMotion]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101626] overflow-hidden select-none"
      role="region"
      aria-label="Supernatural Anime Flame Domain Expansion"
    >
      {/* ================= TITLES: STAGE 1 (DOMAIN EXPANSION) & STAGE 2 (ETERNAL BUFFERING) ================= */}
      {(step === 'stage1_domain' || step === 'stage2_buffering' || step === 'flame_ignite') && (
        <div 
          className={`relative z-10 flex flex-col items-center justify-center text-center p-4 max-w-5xl w-full ${
            step === 'stage2_buffering' && !isReducedMotion ? 'animate-screen-shake' : ''
          }`}
        >
          {/* Stage 1: ONLY DOMAIN EXPANSION appears first with sharp anime entrance */}
          <div className="mb-2 sm:mb-4 transition-all duration-300 transform scale-100 opacity-100">
            <h2 
              className="font-tech text-base sm:text-xl md:text-2xl font-bold tracking-[0.55em] text-[#F7F0E6] uppercase"
              style={{
                textShadow: '0 0 14px rgba(247, 240, 230, 0.55)'
              }}
            >
              DOMAIN EXPANSION
            </h2>
            <div className="w-24 sm:w-36 h-[2px] bg-gradient-to-r from-transparent via-[#A8E6D4] to-transparent mx-auto mt-2" />
          </div>

          {/* Stage 2: Reveal "ETERNAL BUFFERING" beneath it after the pause */}
          {(step === 'stage2_buffering' || step === 'flame_ignite') && (
            <div className="animate-[zoomIn_0.25s_cubic-bezier(0.16,1,0.3,1)_both]">
              <h1 
                className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[#AFA0FF] leading-none"
                style={{
                  textShadow: `
                    0 0 25px rgba(175, 160, 255, 0.85),
                    -3px 0 0 rgba(168, 230, 212, 0.75),
                    3px 0 0 rgba(246, 184, 111, 0.65)
                  `
                }}
              >
                ETERNAL BUFFERING
              </h1>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs sm:text-sm font-tech tracking-widest text-[#A8E6D4] uppercase font-bold">
                <span>[ 永続的緩衝領域 ]</span>
                <span className="w-2 h-2 rounded-full bg-[#F6B86F] animate-ping" />
                <span>[ REALITY SEVERED ]</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= STAGE 3: THE FLAME IGNITION & SURGE ================= */}
      {/* 1. Thin streak of Mint supernatural light igniting near bottom */}
      {step === 'flame_ignite' && (
        <div className="absolute inset-x-0 bottom-8 flex flex-col items-center pointer-events-none z-20">
          <div 
            className="w-full max-w-4xl h-3 rounded-full bg-[#A8E6D4] animate-pulse"
            style={{
              boxShadow: '0 0 40px #A8E6D4, 0 0 90px #A8E6D4, 0 -10px 30px #F6B86F',
              transform: 'scaleY(1.8)'
            }}
          />
          {/* Flame spark tongues leaping upward in Mint and Apricot Gold */}
          <svg className="w-full h-32 -mt-16" viewBox="0 0 800 150" preserveAspectRatio="none">
            <path
              d="M 50 150 Q 80 80, 100 20 Q 110 90, 140 150 Q 180 60, 210 10 Q 230 80, 270 150 Q 320 40, 360 5 Q 390 70, 430 150 Q 480 50, 520 15 Q 550 85, 600 150 Q 640 60, 680 25 Q 710 95, 760 150 Z"
              fill="#A8E6D4"
              opacity="0.9"
            />
            <path
              d="M 80 150 Q 110 90, 130 50 Q 140 100, 180 150 Q 230 70, 260 30 Q 280 90, 330 150 Q 380 60, 410 25 Q 430 90, 490 150 Q 540 65, 570 35 Q 600 95, 660 150 Z"
              fill="#F6B86F"
              opacity="0.8"
            />
          </svg>
        </div>
      )}

      {/* 2. Sweeping Painterly Anime Flames curling upward in dynamic arcs */}
      {(step === 'flame_surge' || step === 'flame_engulf') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          
          {/* Primary Sweeping Mint Flame Blade Arc */}
          <svg 
            className="absolute -inset-10 w-[110%] h-[110%] transition-transform duration-500 ease-out"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            style={{
              transform: step === 'flame_engulf' ? 'scale(1.4) rotate(-5deg)' : 'scale(1.05)',
              filter: 'drop-shadow(0 0 35px #A8E6D4)'
            }}
          >
            {/* Outer Supernatural Mint Wave */}
            <path
              d="M -50 1050 C 150 900, 220 700, 320 520 C 420 340, 560 210, 780 120 C 650 250, 560 380, 480 540 C 400 700, 310 880, 50 1050 Z"
              fill="#A8E6D4"
              opacity="0.95"
            />
            {/* Sharp flame tongues */}
            <path
              d="M 120 1050 Q 220 750, 360 480 Q 420 560, 390 680 Q 520 400, 680 220 Q 610 320, 540 450 Q 720 180, 920 60 C 780 200, 680 340, 580 500 C 480 660, 360 840, 180 1050 Z"
              fill="#A8E6D4"
            />
            {/* Electric Pastel Lilac inner flame core */}
            <path
              d="M 50 1050 C 200 880, 280 680, 390 510 C 500 340, 640 220, 850 150 C 720 280, 620 410, 530 570 C 440 730, 320 900, 120 1050 Z"
              fill="#AFA0FF"
              opacity="0.9"
            />
            {/* Apricot Gold hot fire crest */}
            <path
              d="M 160 1050 C 260 870, 340 700, 440 540 C 540 380, 670 270, 860 210 C 740 320, 650 440, 570 590 C 490 740, 390 890, 220 1050 Z"
              fill="#F6B86F"
              opacity="0.95"
            />
            {/* Warm Off-White flame spine */}
            <path
              d="M 220 1050 C 310 880, 390 730, 480 580 C 570 430, 700 330, 880 270 C 760 360, 680 470, 610 610 C 540 750, 440 890, 290 1050 Z"
              fill="#F7F0E6"
              opacity="0.9"
            />
          </svg>

          {/* Secondary Counter-Surging Flame Wave (Right to Left sweep) */}
          <svg 
            className="absolute -inset-10 w-[110%] h-[110%] transition-transform duration-500 ease-out"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            style={{
              transform: step === 'flame_engulf' ? 'scale(1.5) rotate(5deg)' : 'scale(1)',
              filter: 'drop-shadow(0 0 30px #AFA0FF)'
            }}
          >
            {/* Jagged right-side flame tongue curling inward in Lilac */}
            <path
              d="M 1050 950 C 850 820, 750 640, 640 480 C 530 320, 380 180, 150 90 C 320 210, 440 340, 520 500 C 600 660, 720 830, 950 1050 Z"
              fill="#AFA0FF"
              opacity="0.92"
            />
            <path
              d="M 980 980 C 820 840, 720 670, 620 510 C 520 350, 390 220, 210 140 C 360 250, 470 380, 550 540 C 630 700, 760 860, 920 1050 Z"
              fill="#A8E6D4"
              opacity="0.88"
            />
            <path
              d="M 920 1020 C 780 870, 690 710, 600 560 C 510 410, 410 280, 260 190 C 390 290, 480 420, 560 570 C 640 720, 740 880, 870 1050 Z"
              fill="#F6B86F"
              opacity="0.95"
            />
          </svg>

          {/* Flying Anime Flame Trails and Ember Shards */}
          <div className="absolute inset-0">
            {[
              { d: "M 200 900 Q 350 650, 520 400 Q 560 480, 480 620 Z", fill: "#A8E6D4" },
              { d: "M 400 950 Q 550 700, 720 450 Q 750 530, 680 670 Z", fill: "#AFA0FF" },
              { d: "M 100 800 Q 250 550, 420 300 Q 450 380, 380 520 Z", fill: "#F6B86F" },
              { d: "M 600 1000 Q 720 750, 880 500 Q 910 580, 840 720 Z", fill: "#A8E6D4" },
            ].map((blade, idx) => (
              <svg key={idx} className="absolute inset-0 w-full h-full animate-pulse" viewBox="0 0 1000 1000">
                <path d={blade.d} fill={blade.fill} opacity="0.85" />
              </svg>
            ))}
          </div>
        </div>
      )}

      {/* ================= CLIMAX: FLAMES ENGULF VIEWPORT ================= */}
      {step === 'flame_engulf' && (
        <div 
          className="absolute inset-0 z-30 transition-all duration-300 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, #F6B86F 0%, #AFA0FF 35%, #A8E6D4 70%, #101626 100%)',
            mixBlendMode: 'screen',
            opacity: 0.95
          }}
        />
      )}

      {/* ================= ANIME HIGH-CONTRAST IMPACT FRAMES ================= */}
      {impactFrame && (
        <div 
          className="absolute inset-0 z-40 bg-[#F7F0E6] pointer-events-none flex items-center justify-center"
          style={{
            mixBlendMode: 'difference'
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            <line x1="0" y1="0" x2="1000" y2="1000" stroke="#101626" strokeWidth="6" />
            <line x1="0" y1="1000" x2="1000" y2="0" stroke="#101626" strokeWidth="6" />
            <line x1="500" y1="0" x2="500" y2="1000" stroke="#101626" strokeWidth="4" />
            <line x1="0" y1="500" x2="1000" y2="500" stroke="#101626" strokeWidth="4" />
            <circle cx="500" cy="500" r="180" fill="none" stroke="#101626" strokeWidth="8" />
          </svg>
        </div>
      )}

      {/* ================= STAGE 7: THE DOMAIN OPENS ================= */}
      {step === 'domain_opens' && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
          {/* Warm Off-White intense flash */}
          <div className="absolute inset-0 bg-[#F7F0E6] animate-[fadeOut_0.35s_ease-out_forwards]" />
          
          {/* Flames peeling away from center (circular iris aperture wipe) in Lilac */}
          <div 
            className="absolute inset-0 border-[60px] sm:border-[120px] border-[#AFA0FF] transition-all duration-400 ease-out"
            style={{
              clipPath: 'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)',
              transform: 'scale(1.6)',
              opacity: 0
            }}
          />
        </div>
      )}
    </div>
  );
};
