import React, { useEffect, useState, useRef } from 'react';

interface LogoInterstitialProps {
  onComplete: () => void;
  isReducedMotion: boolean;
}

type InterstitialPhase = 'fade_in' | 'hold' | 'fade_out';

/**
 * LogoInterstitial
 * 
 * Cinematic Ferrari-inspired logo reveal interstitial.
 * - Appears after Chibi greeting & liquid splash transition complete.
 * - Pure black (#000000) full-viewport screen.
 * - Exact existing /logo.png centered with object-fit: contain.
 * - Fade in: ~600ms (500–700ms) with ease-in-out curve.
 * - Hold: ~700ms (600–800ms) fully visible.
 * - Fade out: EXACTLY 1000ms (1 second).
 * - Calls onComplete only after fade-out has fully finished.
 */
export const LogoInterstitial: React.FC<LogoInterstitialProps> = ({
  onComplete,
  isReducedMotion
}) => {
  const [phase, setPhase] = useState<InterstitialPhase>('fade_in');
  const [opacity, setOpacity] = useState<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    hasCompletedRef.current = false;

    // Reduced motion handling
    if (isReducedMotion) {
      setOpacity(1);
      const timer = setTimeout(() => {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onCompleteRef.current();
        }
      }, 900);
      return () => clearTimeout(timer);
    }

    // Standard cinematic sequence:
    // 1. Fade in (600ms)
    // Request animation frame to trigger smooth CSS transition from opacity 0 -> 1
    const startRaf = requestAnimationFrame(() => {
      setOpacity(1);
    });

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
            onCompleteRef.current();
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
  }, [isReducedMotion]);

  // Transition duration based on current phase:
  // fade_in: 600ms (500–700ms)
  // fade_out: EXACTLY 1000ms (1s)
  const transitionDuration = phase === 'fade_out' ? '1000ms' : '600ms';

  return (
    <div
      className="fixed inset-0 z-50 bg-[#000000] flex items-center justify-center p-6 sm:p-10 select-none pointer-events-none"
      style={{
        opacity,
        transition: `opacity ${transitionDuration} cubic-bezier(0.4, 0, 0.2, 1)`,
        willChange: 'opacity'
      }}
      role="region"
      aria-label="Rophe Angel Cinematic Interstitial"
    >
      <div className="relative flex items-center justify-center max-w-[85vw] max-h-[75vh]">
        <img
          src="/logo.png"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://plain-apac-prod-public.komododecks.com/202610/20/YZgT7SnpXc2zs3CnoXeZ/image.png';
          }}
          alt="Rophe Angel Racing Logo"
          className="w-auto h-auto max-w-[240px] sm:max-w-[340px] md:max-w-[420px] max-h-[160px] sm:max-h-[220px] md:max-h-[260px] object-contain drop-shadow-[0_0_50px_rgba(225,6,0,0.18)]"
        />
      </div>
    </div>
  );
};
