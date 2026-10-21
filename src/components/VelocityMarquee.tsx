import React, { useEffect, useRef } from 'react';

interface VelocityMarqueeProps {
  isReducedMotion?: boolean;
}

interface MarqueeRowConfig {
  text: string;
  repeatCount: number;
  dir: number; // 1 = leftward, -1 = rightward
  color: string;
  className: string;
}

// Exact physics parameters from Hipuku's CodePen
const BASE = 0.6; // drift when nothing is scrolled, px per frame
const PUSH = 0.9; // how much one px of scroll per frame adds
const MAX_SKEW = 14; // degrees maximum lean

const ROWS: MarqueeRowConfig[] = [
  {
    text: 'ROPHE ANGEL',
    repeatCount: 6,
    dir: 1,
    color: '#FF2800',
    className: 'font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] drop-shadow-[0_0_24px_rgba(255,40,0,0.22)]',
  },
  {
    text: 'COMPUTER SCIENCE ENGINEERING',
    repeatCount: 4,
    dir: -1,
    color: '#FFFFFF',
    className: 'font-tech font-bold text-xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-[0.16em] leading-none drop-shadow-[0_0_16px_rgba(255,255,255,0.18)]',
  },
  {
    text: 'A LITTLE BIT OF EVERYTHING. NEVER JUST ONE THING.',
    repeatCount: 3,
    dir: 1,
    color: '#FF2800',
    className: 'font-tech font-semibold text-sm sm:text-lg md:text-xl lg:text-2xl uppercase tracking-[0.1em] leading-none drop-shadow-[0_0_14px_rgba(255,40,0,0.2)]',
  },
];

export const VelocityMarquee: React.FC<VelocityMarqueeProps> = ({ isReducedMotion = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let animId = 0;
    const offsets = ROWS.map(() => 0);
    const halves: number[] = ROWS.map(() => 0);

    const measureHalves = () => {
      rowRefs.current.forEach((rowEl, i) => {
        if (rowEl) {
          halves[i] = rowEl.scrollWidth / 2;
        }
      });
    };

    measureHalves();

    // Re-measure when custom fonts finish loading to ensure exact half-widths
    if (document.fonts?.ready) {
      document.fonts.ready.then(measureHalves).catch(() => {});
    }

    const handleResize = () => {
      measureHalves();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    let lastScroll = window.scrollY || document.documentElement.scrollTop || 0;
    let velocity = 0;

    const tick = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
      const moved = currentScroll - lastScroll;
      lastScroll = currentScroll;

      // Hipuku smooth velocity calculation: coast down on stop
      velocity += (moved - velocity) * 0.12;

      rowRefs.current.forEach((rowEl, i) => {
        if (!rowEl) return;
        const half = halves[i] || 1500;
        const dir = ROWS[i].dir;
        const speed = isReducedMotion ? 0 : dir * (BASE + velocity * PUSH);

        // Seamless wrap: stays in (-half, 0]
        offsets[i] = (((offsets[i] - speed) % half) - half) % half;

        const lean = isReducedMotion
          ? 0
          : Math.max(-MAX_SKEW, Math.min(MAX_SKEW, -velocity * 0.6));

        rowEl.style.transform = `translate3d(${offsets[i]}px, 0, 0) skewX(${lean}deg)`;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isReducedMotion]);

  return (
    <div 
      ref={containerRef}
      className="w-full overflow-hidden select-none my-6 sm:my-8 py-2 relative [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]"
      aria-label="Velocity Marquee: Rophe Angel, Computer Science Engineering, A Little Bit of Everything. Never Just One Thing."
    >
      <h1 className="sr-only">
        Rophe Angel — Computer Science & Engineering. A Little Bit of Everything. Never Just One Thing.
      </h1>

      <div className="flex flex-col gap-2.5 sm:gap-3.5">
        {ROWS.map((rowConfig, rowIndex) => (
          <div 
            key={rowIndex} 
            className="w-full overflow-hidden whitespace-nowrap"
          >
            <div
              ref={(el) => {
                rowRefs.current[rowIndex] = el;
              }}
              className="inline-flex flex-nowrap will-change-transform"
              style={{
                color: rowConfig.color,
              }}
            >
              {/* Block A: Primary copy */}
              <div className={`inline-flex flex-nowrap shrink-0 items-center ${rowConfig.className}`}>
                {Array.from({ length: rowConfig.repeatCount }).map((_, repeatIdx) => (
                  <span key={repeatIdx} className="inline-flex items-center">
                    <span>{rowConfig.text}</span>
                    <span className="mx-3 sm:mx-5 opacity-40 text-[0.8em] font-light">·</span>
                  </span>
                ))}
              </div>

              {/* Block B: Identical duplicate copy for seamless wrapping */}
              <div 
                aria-hidden="true" 
                className={`inline-flex flex-nowrap shrink-0 items-center ${rowConfig.className}`}
              >
                {Array.from({ length: rowConfig.repeatCount }).map((_, repeatIdx) => (
                  <span key={repeatIdx} className="inline-flex items-center">
                    <span>{rowConfig.text}</span>
                    <span className="mx-3 sm:mx-5 opacity-40 text-[0.8em] font-light">·</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
