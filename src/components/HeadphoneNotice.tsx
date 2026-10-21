import React, { useEffect, useState, useRef } from 'react';

interface HeadphoneNoticeProps {
  onComplete: () => void;
  isReducedMotion: boolean;
}

/**
 * HeadphoneNotice
 * 
 * Cinematic notice inserted before the logo intro:
 * “WEAR HEADPHONES FOR AN IMMERSIVE EXPERIENCE”
 * - Clean, minimal typography against pure black (#000000).
 * - Subtle fade-in, ~2s comfortable reading hold, and complete fade-out.
 * - Hands off to LogoInterstitial only after fade-out has fully finished.
 */
export const HeadphoneNotice: React.FC<HeadphoneNoticeProps> = ({
  onComplete,
  isReducedMotion
}) => {
  const [opacity, setOpacity] = useState<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    hasCompletedRef.current = false;

    // Reduced motion mode: simple fade and proceed
    if (isReducedMotion) {
      setOpacity(1);
      const timer = setTimeout(() => {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onCompleteRef.current();
        }
      }, 1800);
      return () => clearTimeout(timer);
    }

    // 1. Subtle Fade In (500ms)
    const startRaf = requestAnimationFrame(() => {
      setOpacity(1);
    });

    // 2. Read comfortably for ~2s after fade-in, then initiate fade-out
    let completeTimer: NodeJS.Timeout | null = null;
    const holdTimer = setTimeout(() => {
      // 3. Fade Out (500ms)
      setOpacity(0);

      // 4. Complete once notice has faded away completely (500ms transition + 50ms buffer)
      completeTimer = setTimeout(() => {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onCompleteRef.current();
        }
      }, 550);
    }, 2500);

    return () => {
      cancelAnimationFrame(startRaf);
      clearTimeout(holdTimer);
      if (completeTimer) clearTimeout(completeTimer);
    };
  }, [isReducedMotion]);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#000000] flex items-center justify-center p-6 sm:p-10 select-none pointer-events-none"
      style={{
        opacity,
        transition: 'opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'opacity'
      }}
      role="status"
      aria-live="polite"
    >
      <div className="max-w-xl text-center px-4">
        <p className="font-tech font-bold text-sm sm:text-base md:text-lg tracking-[0.25em] text-neutral-200 uppercase leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          WEAR HEADPHONES FOR AN IMMERSIVE EXPERIENCE
        </p>
      </div>
    </div>
  );
};
