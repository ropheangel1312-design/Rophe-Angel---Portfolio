import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Instagram } from 'lucide-react';
import { TextScramble } from './TextScramble';

interface PoemItem {
  id: string;
  originalUrl: string;
  cdnImageUrl: string;
  instagramUrl: string;
}

// 5 verified poems with direct CDN image URLs (HTTP 200, 1080x1350 image/png) and original URLs
const POEMS: PoemItem[] = [
  {
    id: 'poem-1',
    originalUrl: 'https://kommodo.ai/i/huNUMMbzviSIgzUUS4P6',
    cdnImageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/huNUMMbzviSIgzUUS4P6/image.png',
    instagramUrl: 'https://www.instagram.com/p/DdZE9YwkxM4/?img_index=1'
  },
  {
    id: 'poem-2',
    originalUrl: 'https://kommodo.ai/i/enGNorvFLEYr9XIVxiew',
    cdnImageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/enGNorvFLEYr9XIVxiew/image.png',
    instagramUrl: 'https://www.instagram.com/p/DcXvPRvkx-0/?img_index=1'
  },
  {
    id: 'poem-3',
    originalUrl: 'https://kommodo.ai/i/xFQaoYwE2C1xwiaNz0QK',
    cdnImageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/xFQaoYwE2C1xwiaNz0QK/image.png',
    instagramUrl: 'https://www.instagram.com/p/DcOkRAzk7Gj/?img_index=1'
  },
  {
    id: 'poem-4',
    originalUrl: 'https://kommodo.ai/i/ng48IIyk6KMIuzahSpbx',
    cdnImageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/ng48IIyk6KMIuzahSpbx/image.png',
    instagramUrl: 'https://www.instagram.com/p/DcHGZOVE-Iu/?img_index=1'
  },
  {
    id: 'poem-5',
    originalUrl: 'https://kommodo.ai/i/mxyXY2fnwNMcZpuSYakf',
    cdnImageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/mxyXY2fnwNMcZpuSYakf/image.png',
    instagramUrl: 'https://www.instagram.com/p/Db5nPB8k5cY/?img_index=1'
  }
];

interface PoetryCircularGalleryProps {
  isReducedMotion: boolean;
}

export const PoetryCircularGallery: React.FC<PoetryCircularGalleryProps> = ({ isReducedMotion }) => {
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [activePoemIndex, setActivePoemIndex] = useState<number>(0);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartYRef = useRef<number>(0);
  const dragStartRotRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);
  const targetRotationRef = useRef<number>(0);
  const currentRotationRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const totalCards = POEMS.length; // 5
  const stepDeg = 360 / totalCards; // 72 deg

  // Smooth lerp / spring loop for rotation
  useEffect(() => {
    const loop = () => {
      const diff = targetRotationRef.current - currentRotationRef.current;
      if (Math.abs(diff) > 0.04) {
        currentRotationRef.current += diff * (isReducedMotion ? 0.35 : 0.12);
        setRotationDeg(currentRotationRef.current);
      } else if (currentRotationRef.current !== targetRotationRef.current) {
        currentRotationRef.current = targetRotationRef.current;
        setRotationDeg(currentRotationRef.current);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isReducedMotion]);

  // Scroll-driven circular rotation within natural viewport progression:
  // Rotates through all 5 poem cards as the user scrolls through the section,
  // flowing naturally into Section 09 without empty gaps or sticky delays.
  useEffect(() => {
    let scrollRaf: number | null = null;

    const handleScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        const el = sectionRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;

        // When section enters upper-middle viewport to when it leaves
        const startY = vh * 0.85;
        const endY = -rect.height * 0.25;
        const totalDist = startY - endY;

        if (totalDist > 0) {
          const rawProgress = Math.max(0, Math.min(1, (startY - rect.top) / totalDist));
          const targetCardFloat = rawProgress * (totalCards - 1);
          const scrollDrivenAngle = -targetCardFloat * stepDeg;

          if (!isDraggingRef.current) {
            targetRotationRef.current = scrollDrivenAngle;
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }, [stepDeg, totalCards]);

  // Sync active poem index derived from rotation angle
  useEffect(() => {
    let bestDist = Infinity;
    let bestIdx = 0;
    for (let i = 0; i < totalCards; i++) {
      let angle = (i * stepDeg + rotationDeg) % 360;
      if (angle < 0) angle += 360;
      let dist = Math.min(angle, 360 - angle);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    setActivePoemIndex(bestIdx);
  }, [rotationDeg, stepDeg, totalCards]);

  // Drag interaction to freely rotate the wheel with threshold detection
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    dragStartRotRef.current = targetRotationRef.current;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    const dy = e.clientY - dragStartYRef.current;

    // Only engage drag if pointer moved more than 6px
    if (!hasDraggedRef.current) {
      if (Math.hypot(dx, dy) > 6) {
        hasDraggedRef.current = true;
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {}
      } else {
        return;
      }
    }

    const angleDelta = (dx / 160) * stepDeg;
    targetRotationRef.current = dragStartRotRef.current + angleDelta;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (hasDraggedRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      // Snap to nearest card
      const snapped = Math.round(targetRotationRef.current / stepDeg) * stepDeg;
      targetRotationRef.current = snapped;
    }
  };

  const rotateToCard = (index: number) => {
    const currentAngle = currentRotationRef.current;
    const targetBase = -index * stepDeg;
    const diff = ((targetBase - currentAngle) % 360 + 540) % 360 - 180;
    targetRotationRef.current = currentAngle + diff;
  };

  const prevPoem = () => {
    targetRotationRef.current += stepDeg;
  };

  const nextPoem = () => {
    targetRotationRef.current -= stepDeg;
  };

  return (
    <section 
      ref={sectionRef} 
      id="poetry" 
      className="relative w-full pt-8 pb-10 sm:pt-10 sm:pb-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 overflow-visible"
    >
      <div className="w-full flex flex-col justify-between overflow-visible">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 z-20 mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.8)]" />
              <span>08 // CREATIVE WRITING & POETRY</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400 font-mono text-[11px]">CIRCULAR 3D ROTATION</span>
            </div>

            <TextScramble
              as="h2"
              text="POETRY GALLERY"
              triggerOnView={true}
              isReducedMotion={isReducedMotion}
              className="font-display text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight block"
            />

            <p className="font-body text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Original poems published on Instagram (@rophe.sys). Scroll to advance through each piece or drag to spin. Click any cover to read the full post.
            </p>
          </div>

          {/* Controls & Instagram Handle */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/rophe.sys/"
              target="_blank"
              rel="noopener noreferrer"
              className="f1-btn-secondary px-3.5 py-2 rounded-lg text-xs font-tech tracking-wider uppercase inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Instagram className="w-3.5 h-3.5 text-[#E10600]" />
              <span>@rophe.sys</span>
            </a>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevPoem}
                aria-label="Previous poem"
                className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextPoem}
                aria-label="Next poem"
                className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ===================== CIRCULAR 3D STAGE ===================== */}
        <div 
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full h-[450px] sm:h-[490px] md:h-[510px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none my-2 sm:my-4"
          style={{ perspective: '1400px' }}
        >
          {/* Subtle Red Center Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-80 h-72 sm:h-80 rounded-full bg-[radial-gradient(circle,_rgba(225,6,0,0.14)_0%,_transparent_70%)] pointer-events-none" />

          {/* Circular 3D Carousel Cards */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {POEMS.map((poem, i) => {
              // Calculate spatial angle and normalized distance from apex
              let angle = (i * stepDeg + rotationDeg) % 360;
              if (angle < 0) angle += 360;
              let relAngle = ((angle + 180) % 360) - 180; // range [-180, 180] from apex
              const normDist = Math.abs(relAngle) / 180; // [0, 1]
              const rad = (relAngle * Math.PI) / 180;

              // Responsive radius matching circle geometry
              const R = typeof window !== 'undefined' && window.innerWidth < 640 ? 210 : 330;
              const x = Math.sin(rad) * R;
              const y = (1 - Math.cos(rad)) * (R * 0.28);
              const z = isReducedMotion ? 0 : -Math.abs(Math.sin(rad)) * 150;
              const rotZ = isReducedMotion ? 0 : relAngle * 0.22;
              const rotY = isReducedMotion ? 0 : -Math.sin(rad) * 18;

              // Focus, depth, and progressive blur mapping
              const blur = isReducedMotion ? 0 : Math.min(8, Math.max(0, (normDist - 0.05) * 16));
              const grayscale = isReducedMotion ? 0 : Math.min(0.85, Math.max(0, (normDist - 0.04) * 1.5));
              const opacity = Math.max(0.25, 1 - (normDist * 1.3));
              const scale = Math.max(0.74, 1.05 - (normDist * 0.38));
              const zIndex = Math.round(50 - normDist * 40);
              const isTop = normDist < 0.12;

              return (
                <a
                  key={poem.id}
                  href={poem.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View poem on Instagram"
                  aria-label={`View Poem ${i + 1} on Instagram`}
                  onClick={(e) => {
                    if (hasDraggedRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  /* Portrait 4:5 aspect ratio (1080 x 1350) */
                  className="absolute w-[180px] sm:w-[220px] md:w-[250px] aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer transition-[border-color,box-shadow] duration-300 block group pointer-events-auto"
                  style={{
                    transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateZ(${rotZ.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) scale(${scale.toFixed(2)})`,
                    filter: blur > 0 ? `blur(${blur.toFixed(1)}px) grayscale(${grayscale.toFixed(2)})` : `grayscale(${grayscale.toFixed(2)})`,
                    opacity,
                    zIndex,
                    transformOrigin: 'center center',
                    boxShadow: isTop 
                      ? '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(225,6,0,0.4)' 
                      : '0 12px 35px rgba(0,0,0,0.6)'
                  }}
                >
                  <img
                    src={poem.cdnImageUrl}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.includes('plain-apac-prod-public.komododecks.com')) {
                        target.src = poem.cdnImageUrl;
                      }
                    }}
                    alt={`Poem cover ${i + 1}`}
                    loading="lazy"
                    className={`w-full h-full object-cover rounded-2xl border-2 pointer-events-none transition-all duration-300 ${
                      isTop 
                        ? 'border-[#E10600] group-hover:brightness-105' 
                        : 'border-white/15 group-hover:border-white/40'
                    }`}
                  />
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom Pagination & Scroll Hint */}
        <div className="flex flex-col items-center gap-2 z-20 pointer-events-auto mt-2">
          <div className="flex justify-center items-center gap-2">
            {POEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => rotateToCard(i)}
                aria-label={`Go to poem ${i + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  i === activePoemIndex
                    ? 'w-7 h-2 bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.8)]'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest hidden sm:inline">
            Scroll page or drag cards to advance · Click cover to view post
          </span>
        </div>

      </div>
    </section>
  );
};
