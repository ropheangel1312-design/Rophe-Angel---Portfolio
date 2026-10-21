import React, { useEffect, useRef } from 'react';

interface TextScrambleProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p' | 'div';
  className?: string;
  triggerOnView?: boolean;
  triggerOnHover?: boolean;
  externalTrigger?: boolean;
  isReducedMotion?: boolean;
}

// Hipuku text scramble glyphs (weighted toward noise symbols)
const GLYPHS = '!<>-_\\/[]{}—=+*^?#$%&@~';

// Ferrari-inspired temporary character colors: Ferrari Red, White, Black
const SCRAMBLE_COLORS = ['#FF2800', '#FFFFFF', '#000000'];

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

interface CharAnimState {
  startTime: number;
  duration: number;
  settled: string;
  lastSwap: number;
  active: boolean;
}

export const TextScramble: React.FC<TextScrambleProps> = ({
  text,
  as: Component = 'span',
  className = '',
  triggerOnView = false,
  triggerOnHover = false,
  externalTrigger = false,
  isReducedMotion = false,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const charStates = useRef<CharAnimState[]>([]);
  const animatingRef = useRef(false);
  const rafIdRef = useRef<number>(0);
  const prevExternalTriggerRef = useRef(false);

  const chars = Array.from(text);

  const checkReducedMotion = (): boolean => {
    if (isReducedMotion) return true;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  };

  const stopAndSettle = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }
    animatingRef.current = false;

    for (let i = 0; i < chars.length; i++) {
      const span = spanRefs.current[i];
      if (span) {
        span.textContent = chars[i] === ' ' ? '\u00A0' : chars[i];
        span.style.color = ''; // Restore original element text color
      }
      charStates.current[i] = {
        startTime: 0,
        duration: 0,
        settled: chars[i],
        lastSwap: 0,
        active: false,
      };
    }
  };

  const run = (fromIndex = 0) => {
    if (checkReducedMotion()) return;

    // Cancel any running animation to prevent conflicting RAF loops and flickering
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }

    const now = performance.now();
    const stagger = 32; // ms per character stagger
    const charDuration = 520; // ms duration per character

    for (let i = 0; i < chars.length; i++) {
      const settled = chars[i];
      if (settled === ' ') {
        charStates.current[i] = {
          startTime: 0,
          duration: 0,
          settled: ' ',
          lastSwap: 0,
          active: false,
        };
        const span = spanRefs.current[i];
        if (span) {
          span.textContent = '\u00A0';
          span.style.color = '';
        }
        continue;
      }

      if (i < fromIndex) {
        charStates.current[i] = {
          startTime: 0,
          duration: 0,
          settled,
          lastSwap: 0,
          active: false,
        };
        const span = spanRefs.current[i];
        if (span) {
          span.textContent = settled;
          span.style.color = '';
        }
      } else {
        charStates.current[i] = {
          startTime: now + (i - fromIndex) * stagger,
          duration: charDuration,
          settled,
          lastSwap: 0,
          active: true,
        };

        const span = spanRefs.current[i];
        if (span) {
          span.style.color = SCRAMBLE_COLORS[i % SCRAMBLE_COLORS.length];
        }
      }
    }

    animatingRef.current = true;
    rafIdRef.current = requestAnimationFrame(tick);
  };

  const tick = (now: number) => {
    let anyActive = false;

    for (let i = 0; i < charStates.current.length; i++) {
      const state = charStates.current[i];
      if (!state || !state.active) continue;

      const span = spanRefs.current[i];
      if (!span) continue;

      if (now < state.startTime) {
        anyActive = true;
        continue;
      }

      const elapsed = now - state.startTime;
      const p = Math.min(1, elapsed / state.duration);

      if (p >= 0.78) {
        span.textContent = state.settled;
      } else {
        if (now - state.lastSwap >= 65) {
          state.lastSwap = now;
          span.textContent = randomGlyph();
        }
      }

      if (p >= 1) {
        span.textContent = state.settled;
        span.style.color = ''; // Restore original element text color
        state.active = false;
      } else {
        anyActive = true;
      }
    }

    if (anyActive) {
      rafIdRef.current = requestAnimationFrame(tick);
    } else {
      animatingRef.current = false;
    }
  };

  // External trigger (for project card hover or keyboard focus, triggers on every new interaction)
  useEffect(() => {
    if (externalTrigger && !prevExternalTriggerRef.current) {
      run(0);
    }
    prevExternalTriggerRef.current = externalTrigger;
  }, [externalTrigger]);

  // Viewport intersection trigger (repeatedly triggers every time heading enters viewport)
  useEffect(() => {
    if (!triggerOnView) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    let isCurrentlyInView = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) return;

        if (entry.isIntersecting) {
          // Entering viewport: trigger scramble if it was previously outside viewport
          if (!isCurrentlyInView) {
            isCurrentlyInView = true;
            run(0);
          }
        } else {
          // Leaving viewport: clean up & settle characters so next entrance is fresh and clean
          if (isCurrentlyInView) {
            isCurrentlyInView = false;
            stopAndSettle();
          }
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [triggerOnView]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      animatingRef.current = false;
    };
  }, []);

  return (
    <Component
      ref={(el) => {
        containerRef.current = el as HTMLElement | null;
      }}
      className={className}
      onPointerEnter={triggerOnHover ? () => run(0) : undefined}
      onFocus={triggerOnHover ? () => run(0) : undefined}
    >
      {/* Accessible intact text for screen readers */}
      <span className="sr-only">{text}</span>

      {/* Visual characters driven by scramble animation */}
      <span aria-hidden="true" className="inline">
        {chars.map((char, index) => (
          <span
            key={index}
            ref={(el) => {
              spanRefs.current[index] = el;
            }}
            className="inline cursor-default select-text"
            onPointerEnter={() => {
              if (triggerOnHover) {
                run(index);
              }
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </Component>
  );
};
