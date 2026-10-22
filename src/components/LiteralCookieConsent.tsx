import React, { useState } from 'react';
import { X, Cookie, ArrowRight } from 'lucide-react';
import { MikeySprite } from './MikeySprite';
import { Card3D } from './Card3D';
import { Magnetic } from './Magnetic';

interface LiteralCookieConsentProps {
  isReducedMotion?: boolean;
}

type ConsentStep = 'banner' | 'cookie' | 'reject_confirm' | 'dismissed';

export const LiteralCookieConsent: React.FC<LiteralCookieConsentProps> = ({
  isReducedMotion = false
}) => {
  // Temporary session-only state: reappears on every full page reload without persistent storage
  const [step, setStep] = useState<ConsentStep>('banner');
  const [isEating, setIsEating] = useState<boolean>(false);

  const handleDismiss = () => {
    setStep('dismissed');
  };

  const handleEatCookie = () => {
    if (isEating) return;
    setIsEating(true);
    // Subtle bite/disappearance animation, then dismiss
    setTimeout(() => {
      handleDismiss();
    }, 450);
  };

  if (step === 'dismissed') return null;

  return (
    <aside
      role="region"
      aria-label="Cookie Notice"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 select-none pointer-events-auto"
    >
      {/* 3D Cursor-Reactive Tilt & Parallax Container */}
      <Card3D
        index={0}
        isReducedMotion={isReducedMotion}
        maxTilt={3.8}
        depth={10}
        glareColor="rgba(225, 6, 0, 0.14)"
        className="f1-card rounded-2xl p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(225,6,0,0.14)] overflow-visible text-white font-body relative"
        role="dialog"
        aria-label="Cookie Consent Banner"
      >
        {/* Subtle red accent glow in corner */}
        <div 
          className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-[#E10600]/15 blur-2xl pointer-events-none" 
          aria-hidden="true" 
        />

        {/* Close Button in top right */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus:outline-hidden z-20"
          aria-label="Dismiss cookie notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* =========================================================================
            STATE 1: INITIAL BANNER
            ========================================================================= */}
        {step === 'banner' && (
          <div className="space-y-3.5 pr-6 relative z-10">
            <div 
              style={{ transform: !isReducedMotion ? 'translateZ(10px)' : undefined }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-[#E10600]/15 border border-[#E10600]/30 flex items-center justify-center text-[#E10600] shrink-0 shadow-[0_0_12px_rgba(225,6,0,0.2)]">
                <Cookie className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wide leading-tight">
                  We use cookies!
                </h3>
                <p className="text-xs font-tech font-bold uppercase tracking-wider text-[#FF2800]">
                  Well… not the internet kind.
                </p>
              </div>
            </div>

            <p 
              style={{ transform: !isReducedMotion ? 'translateZ(6px)' : undefined }}
              className="text-xs font-body text-neutral-300 leading-relaxed"
            >
              No tracking, no telemetry, no advertisers. Just genuine chocolate chips baked fresh for you.
            </p>

            {/* Liquid-glass buttons with cursor-reactive magnetic physics & clean borders */}
            <div 
              style={{ transform: !isReducedMotion ? 'translateZ(14px)' : undefined }}
              className="flex items-center gap-3 pt-1"
            >
              <Magnetic magneticDistance={100} strength={0.35}>
                <button
                  onClick={() => setStep('cookie')}
                  className="f1-btn-primary px-4 py-2 rounded-lg font-tech text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Accept cookies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Magnetic>

              <Magnetic magneticDistance={100} strength={0.35}>
                <button
                  onClick={() => setStep('reject_confirm')}
                  className="f1-btn-secondary px-3.5 py-2 rounded-lg font-tech text-xs font-bold uppercase tracking-wider text-neutral-200 hover:text-white cursor-pointer active:scale-95 transition-all"
                >
                  Reject
                </button>
              </Magnetic>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: ACCEPT FLOW — CLICKABLE CHOCOLATE-CHIP BISCUIT IMAGE
            ========================================================================= */}
        {step === 'cookie' && (
          <div className="flex flex-col items-center text-center space-y-3 py-1 relative z-10">
            <div 
              style={{ transform: !isReducedMotion ? 'translateZ(8px)' : undefined }}
              className="space-y-0.5"
            >
              <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wide">
                Freshly Baked Cookie!
              </h3>
              <p className="text-xs font-tech uppercase tracking-wider text-neutral-400">
                Click the biscuit to enjoy it.
              </p>
            </div>

            {/* Clickable Cookie Image with warm aura & eating animation */}
            <button
              onClick={handleEatCookie}
              tabIndex={0}
              aria-label="Eat chocolate chip cookie"
              className={`relative group cursor-pointer p-2 transition-transform duration-300 outline-hidden ${
                isEating 
                  ? 'scale-75 opacity-0 duration-300' 
                  : 'hover:scale-105 active:scale-95'
              }`}
              style={{ transform: !isReducedMotion ? 'translateZ(18px)' : undefined }}
            >
              {/* Warm Golden Glow Behind Biscuit */}
              <div 
                className="absolute inset-0 rounded-full bg-amber-500/25 blur-xl group-hover:bg-amber-500/40 transition-colors pointer-events-none" 
                aria-hidden="true" 
              />

              {/* Provided Cookie Image with fallback */}
              <img
                src="/cookie.png"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://plain-apac-prod-public.komododecks.com/202610/22/iTxwXCgHm0bKHUpufRCF/image.png';
                }}
                alt="Delicious Chocolate Chip Cookie"
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] select-none pointer-events-none transition-transform duration-300 group-hover:rotate-3"
              />
            </button>

            <button
              onClick={handleEatCookie}
              className="text-[11px] font-tech font-bold uppercase tracking-widest text-[#FF2800] hover:text-white transition-colors cursor-pointer"
            >
              {isEating ? 'Crunch! Delicious.' : 'Tap biscuit to eat & dismiss'}
            </button>
          </div>
        )}

        {/* =========================================================================
            STATE 3: REJECT CONFIRM FLOW — MICKEY ASKS ARE YOU SURE?
            ========================================================================= */}
        {step === 'reject_confirm' && (
          <div className="space-y-3 py-0.5 relative z-10">
            <div 
              style={{ transform: !isReducedMotion ? 'translateZ(8px)' : undefined }}
              className="flex items-center gap-3"
            >
              {/* Mickey sprite illustration */}
              <div className="w-16 h-12 shrink-0 flex items-center justify-center">
                <MikeySprite
                  catState="curious"
                  idPrefix="cookie_mikey_"
                  className="w-16 h-12"
                />
              </div>

              <div className="space-y-0.5">
                <h4 className="font-tech font-bold text-sm sm:text-base text-white tracking-wide leading-snug">
                  Are you sure you don't want the cookie?
                </h4>
                <p className="text-xs font-body text-neutral-400">
                  Mickey baked it specially for your visit.
                </p>
              </div>
            </div>

            <div 
              style={{ transform: !isReducedMotion ? 'translateZ(14px)' : undefined }}
              className="flex items-center gap-2.5 pt-1 flex-wrap"
            >
              <Magnetic magneticDistance={100} strength={0.35}>
                <button
                  onClick={() => setStep('cookie')}
                  className="f1-btn-primary px-3.5 py-1.5 rounded-lg font-tech text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all shrink-0"
                >
                  Wait, I want the cookie!
                </button>
              </Magnetic>

              <Magnetic magneticDistance={100} strength={0.35}>
                <button
                  onClick={handleDismiss}
                  className="f1-btn-secondary px-3.5 py-1.5 rounded-lg font-tech text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white cursor-pointer active:scale-95 transition-all shrink-0"
                >
                  Yes, I'm sure
                </button>
              </Magnetic>
            </div>
          </div>
        )}
      </Card3D>
    </aside>
  );
};
