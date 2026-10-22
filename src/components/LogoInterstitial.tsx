import React, { useEffect, useState, useRef } from 'react';
import { domainAudio } from '../utils/audio';
import { RotateCcw, ArrowLeft } from 'lucide-react';
import { Magnetic } from './Magnetic';

export interface LogoInterstitialProps {
  onComplete?: () => void;
  isReducedMotion: boolean;
  mode?: 'intro' | 'credits_ending';
  onReplayCredits?: () => void;
  onReturnToPortfolio?: () => void;
}

type InterstitialPhase = 'fade_in' | 'hold' | 'fade_out';

/**
 * LogoInterstitial
 * 
 * Cinematic Ferrari-inspired logo reveal interstitial.
 * - Mode 'intro' (default):
 *   - Appears in intro after Chibi greeting & headphone notice.
 *   - Pure black (#000000) full-viewport screen.
 *   - Exact existing /logo.png centered with drop shadow.
 *   - Fade in: ~600ms with ease-in-out curve.
 *   - Hold: ~700ms fully visible.
 *   - Fade out: EXACTLY 1000ms (1 second).
 *   - Calls onComplete only after fade-out has fully finished.
 * 
 * - Mode 'credits_ending':
 *   - Reuses the EXACT same visual treatment, asset, sizing, and cinematic atmosphere for the end credits.
 *   - Pure black (#000000) screen.
 *   - Fades in smoothly matching the original intro.
 *   - Holds long enough to feel intentional and cinematic.
 *   - Fades in two polished buttons directly beneath the logo:
 *     REPLAY CREDITS & RETURN TO PORTFOLIO.
 */
export const LogoInterstitial: React.FC<LogoInterstitialProps> = ({
  onComplete,
  isReducedMotion,
  mode = 'intro',
  onReplayCredits,
  onReturnToPortfolio,
}) => {
  const isCreditsEnding = mode === 'credits_ending';
  const [phase, setPhase] = useState<InterstitialPhase>('fade_in');
  const [opacity, setOpacity] = useState<number>(0);
  const [buttonsVisible, setButtonsVisible] = useState<boolean>(false);
  
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    hasCompletedRef.current = false;

    // In intro mode, start main BGM at the exact moment logo fade-in begins
    if (!isCreditsEnding) {
      domainAudio.startBGM();
    }

    // Reduced motion handling
    if (isReducedMotion) {
      setOpacity(1);
      if (isCreditsEnding) {
        setButtonsVisible(true);
        return;
      }
      const timer = setTimeout(() => {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onCompleteRef.current?.();
        }
      }, 900);
      return () => clearTimeout(timer);
    }

    // 1. Fade in (600ms)
    const startRaf = requestAnimationFrame(() => {
      setOpacity(1);
    });

    if (isCreditsEnding) {
      // In credits ending: hold intentionally on the logo, then reveal the two buttons beneath it
      const buttonTimer = setTimeout(() => {
        setButtonsVisible(true);
      }, 900);

      return () => {
        cancelAnimationFrame(startRaf);
        clearTimeout(buttonTimer);
      };
    }

    // Standard intro sequence:
    // 2. Hold (starts after 600ms fade-in, holds for 700ms)
    const holdTimer = setTimeout(() => {
      setPhase('hold');

      // 3. Fade out (starts after hold: 600ms + 700ms = 1300ms)
      // Fades out over EXACTLY 1000ms (1 second)
      const fadeOutTimer = setTimeout(() => {
        setPhase('fade_out');
        setOpacity(0);

        // 4. Complete after exact 1000ms fade out (1300ms + 1000ms = 2300ms total)
        const completeTimer = setTimeout(() => {
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            onCompleteRef.current?.();
          }
        }, 1000);

        return () => clearTimeout(completeTimer);
      }, 700);

      return () => clearTimeout(fadeOutTimer);
    }, 600);

    return () => {
      cancelAnimationFrame(startRaf);
      clearTimeout(holdTimer);
    };
  }, [isReducedMotion, isCreditsEnding]);

  // Transition duration based on current phase:
  // fade_in: 600ms (500–700ms)
  // fade_out: EXACTLY 1000ms (1s)
  const transitionDuration = phase === 'fade_out' ? '1000ms' : '600ms';

  return (
    <div
      className={`fixed inset-0 z-50 ${isCreditsEnding ? 'bg-transparent backdrop-blur-md sm:backdrop-blur-lg' : 'bg-[#000000]'} flex flex-col items-center justify-center p-6 sm:p-10 select-none ${
        isCreditsEnding ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      style={{
        opacity,
        transition: `opacity ${transitionDuration} cubic-bezier(0.4, 0, 0.2, 1)`,
        willChange: 'opacity'
      }}
      role="region"
      aria-label="Rophe Angel Cinematic Interstitial"
    >
      <div className="relative flex flex-col items-center justify-center max-w-[85vw] max-h-[85vh]">
        <img
          src="/logo.png"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://plain-apac-prod-public.komododecks.com/202610/20/YZgT7SnpXc2zs3CnoXeZ/image.png';
          }}
          alt="Rophe Angel Racing Logo"
          className="w-auto h-auto max-w-[240px] sm:max-w-[340px] md:max-w-[420px] max-h-[160px] sm:max-h-[220px] md:max-h-[260px] object-contain drop-shadow-[0_0_50px_rgba(225,6,0,0.18)]"
        />

        {/* Polished buttons appearing beneath the logo as part of the same cinematic composition */}
        {isCreditsEnding && (
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10 transition-all duration-700 ease-out"
            style={{
              opacity: buttonsVisible ? 1 : 0,
              transform: buttonsVisible ? 'translateY(0)' : 'translateY(12px)',
              pointerEvents: buttonsVisible ? 'auto' : 'none'
            }}
          >
            <Magnetic magneticDistance={140} strength={0.35}>
              <button
                onClick={onReplayCredits}
                className="f1-btn-secondary px-6 sm:px-7 py-2.5 sm:py-3 rounded-lg inline-flex items-center justify-center gap-2.5 text-xs sm:text-sm font-tech font-bold tracking-wider uppercase cursor-pointer active:scale-95 transition-all w-full sm:w-auto"
              >
                <RotateCcw className="w-4 h-4 text-[#E10600]" />
                <span>REPLAY CREDITS</span>
              </button>
            </Magnetic>

            <Magnetic magneticDistance={140} strength={0.35}>
              <button
                onClick={onReturnToPortfolio}
                className="f1-btn-primary px-7 sm:px-8 py-2.5 sm:py-3 rounded-lg inline-flex items-center justify-center gap-2.5 text-xs sm:text-sm font-tech font-bold tracking-wider uppercase cursor-pointer active:scale-95 transition-all w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>RETURN TO PORTFOLIO</span>
              </button>
            </Magnetic>
          </div>
        )}
      </div>
    </div>
  );
};
