import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { SkillCardData } from '../data/skillsGalleryData';
import { ArrowUpRight, Cpu, Code, Layers, Compass, Radio, BarChart3 } from 'lucide-react';

interface Skill3DCardProps {
  card: SkillCardData;
  index: number;
  onSelect: (card: SkillCardData, triggerEl: HTMLElement) => void;
  isReducedMotion: boolean;
}

export const Skill3DCard: React.FC<Skill3DCardProps> = ({
  card,
  index,
  onSelect,
  isReducedMotion
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion) return;
    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return;

    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    // Bounded perspective tilt (max ~8 degrees on X, ~10 degrees on Y)
    const rotX = -ny * 15;
    const rotY = nx * 18;
    const glareX = (nx + 0.5) * 100;
    const glareY = (ny + 0.5) * 100;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!el) return;
      el.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(14px)`;
      el.style.boxShadow = `${-rotY * 1.5}px ${rotX * 1.5 + 16}px 36px rgba(0, 0, 0, 0.85), 0 0 24px rgba(255, 40, 0, 0.16)`;

      if (glareRef.current) {
        glareRef.current.style.opacity = '0.18';
        glareRef.current.style.background = `radial-gradient(circle 280px at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.22), rgba(255, 40, 0, 0.18) 40%, transparent 70%)`;
      }

      if (edgeRef.current) {
        edgeRef.current.style.opacity = '0.9';
        edgeRef.current.style.borderColor = nx > 0 ? 'rgba(255, 40, 0, 0.5)' : 'rgba(255, 255, 255, 0.16)';
      }
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
    el.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)';

    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }

    if (edgeRef.current) {
      edgeRef.current.style.opacity = '0.35';
      edgeRef.current.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    }
  };

  // Graphic motif SVG renderer based on category
  const renderGraphicMotif = () => {
    switch (card.graphicType) {
      case 'neural':
        return (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#FF2800]/40 stroke-current fill-none">
              <circle cx="50" cy="50" r="38" strokeWidth="1" strokeDasharray="3 3" className="opacity-40 animate-[spin_30s_linear_infinite]" />
              <circle cx="50" cy="50" r="22" strokeWidth="1" />
              <line x1="50" y1="12" x2="50" y2="88" strokeWidth="1" strokeOpacity="0.3" />
              <line x1="12" y1="50" x2="88" y2="50" strokeWidth="1" strokeOpacity="0.3" />
              <circle cx="50" cy="50" r="4" className="fill-[#FF2800] text-[#FF2800]" />
              <circle cx="28" cy="30" r="2.5" className="fill-white/80" />
              <circle cx="72" cy="30" r="2.5" className="fill-white/80" />
              <circle cx="34" cy="70" r="2.5" className="fill-white/80" />
              <circle cx="66" cy="70" r="2.5" className="fill-white/80" />
              <line x1="28" y1="30" x2="50" y2="50" strokeWidth="0.8" strokeOpacity="0.5" />
              <line x1="72" y1="30" x2="50" y2="50" strokeWidth="0.8" strokeOpacity="0.5" />
              <line x1="34" y1="70" x2="50" y2="50" strokeWidth="0.8" strokeOpacity="0.5" />
              <line x1="66" y1="70" x2="50" y2="50" strokeWidth="0.8" strokeOpacity="0.5" />
            </svg>
          </div>
        );
      case 'code':
        return (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white/30 stroke-current fill-none">
              <rect x="20" y="20" width="60" height="60" rx="4" strokeWidth="1" strokeOpacity="0.4" />
              <line x1="20" y1="34" x2="80" y2="34" strokeWidth="1" strokeOpacity="0.3" />
              <circle cx="28" cy="27" r="1.5" className="fill-[#FF2800]" />
              <circle cx="35" cy="27" r="1.5" className="fill-white/40" />
              <path d="M 38 48 L 30 55 L 38 62" strokeWidth="1.5" stroke="#FF2800" />
              <path d="M 62 48 L 70 55 L 62 62" strokeWidth="1.5" stroke="#FF2800" />
              <line x1="53" y1="46" x2="47" y2="64" strokeWidth="1.2" strokeOpacity="0.6" />
            </svg>
          </div>
        );
      case 'research':
        return (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white/30 stroke-current fill-none">
              <line x1="16" y1="84" x2="84" y2="84" strokeWidth="1" strokeOpacity="0.4" />
              <line x1="16" y1="16" x2="16" y2="84" strokeWidth="1" strokeOpacity="0.4" />
              <path d="M 16 75 Q 40 70 52 45 T 84 22" strokeWidth="1.5" stroke="#FF2800" />
              <circle cx="52" cy="45" r="3" className="fill-white" />
              <circle cx="84" cy="22" r="3" className="fill-[#FF2800]" />
              <line x1="52" y1="45" x2="52" y2="84" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.5" />
              <line x1="16" y1="45" x2="52" y2="45" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.5" />
            </svg>
          </div>
        );
      case 'product':
        return (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white/30 stroke-current fill-none">
              <circle cx="50" cy="50" r="36" strokeWidth="1" strokeOpacity="0.3" />
              <circle cx="50" cy="50" r="24" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 2" />
              <circle cx="50" cy="50" r="12" strokeWidth="1.2" stroke="#FF2800" />
              <circle cx="50" cy="50" r="3" className="fill-[#FF2800]" />
              <line x1="50" y1="6" x2="50" y2="18" strokeWidth="1.2" stroke="#FF2800" />
              <line x1="50" y1="82" x2="50" y2="94" strokeWidth="1.2" strokeOpacity="0.4" />
              <line x1="6" y1="50" x2="18" y2="50" strokeWidth="1.2" strokeOpacity="0.4" />
              <line x1="82" y1="50" x2="94" y2="50" strokeWidth="1.2" stroke="#FF2800" />
            </svg>
          </div>
        );
      case 'creative':
        return (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white/30 stroke-current fill-none">
              <path d="M 12 50 Q 22 25 32 50 T 52 50 T 72 50 T 92 50" strokeWidth="1" strokeOpacity="0.3" />
              <path d="M 12 50 Q 22 15 32 50 T 52 50 T 72 50 T 92 50" strokeWidth="1.5" stroke="#FF2800" strokeOpacity="0.85" />
              <path d="M 12 50 Q 22 35 32 50 T 52 50 T 72 50 T 92 50" strokeWidth="1" strokeOpacity="0.4" />
              <circle cx="32" cy="50" r="2.5" className="fill-white" />
              <circle cx="52" cy="50" r="2.5" className="fill-[#FF2800]" />
              <circle cx="72" cy="50" r="2.5" className="fill-white" />
            </svg>
          </div>
        );
      case 'operations':
        return (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white/30 stroke-current fill-none">
              <polygon points="50,15 82,34 82,66 50,85 18,66 18,34" strokeWidth="1" strokeOpacity="0.4" />
              <polygon points="50,28 70,40 70,60 50,72 30,60 30,40" strokeWidth="1" stroke="#FF2800" strokeOpacity="0.75" />
              <line x1="50" y1="15" x2="50" y2="28" strokeWidth="1.2" stroke="#FF2800" />
              <line x1="82" y1="66" x2="70" y2="60" strokeWidth="1.2" strokeOpacity="0.5" />
              <line x1="18" y1="66" x2="30" y2="60" strokeWidth="1.2" strokeOpacity="0.5" />
              <circle cx="50" cy="50" r="3" className="fill-white" />
            </svg>
          </div>
        );
    }
  };

  const lateralRotations = [-5, 0, 5];
  const initialRotateY = isReducedMotion ? 0 : lateralRotations[index % 3] ?? 0;
  const staggerDelay = Math.min(0.3, (index % 6) * 0.08);

  return (
    <div
      ref={containerRef}
      className="group/card relative w-full h-full select-none"
      style={{ perspective: isReducedMotion ? 'none' : '1100px' }}
    >
      <motion.div
        initial={isReducedMotion ? { opacity: 0, y: 14 } : {
          opacity: 0.35,
          y: 38,
          z: -110,
          rotateX: 14,
          rotateY: initialRotateY,
          scale: 0.94
        }}
        whileInView={isReducedMotion ? { opacity: 1, y: 0 } : {
          opacity: 1,
          y: 0,
          z: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1
        }}
        viewport={{ once: true, amount: 0.15, margin: '0px 0px -30px 0px' }}
        transition={isReducedMotion ? { duration: 0.35, delay: staggerDelay, ease: 'easeOut' as const } : {
          opacity: { duration: 0.35, ease: 'easeOut' as const, delay: staggerDelay },
          y: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const, delay: staggerDelay },
          z: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const, delay: staggerDelay },
          rotateX: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const, delay: staggerDelay },
          rotateY: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const, delay: staggerDelay },
          scale: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const, delay: staggerDelay }
        }}
        style={{
          transformStyle: isReducedMotion ? 'flat' : 'preserve-3d',
          willChange: isReducedMotion ? 'auto' : 'transform, opacity'
        }}
        className="w-full h-full"
      >
        <div
          ref={cardRef}
          role="button"
          tabIndex={0}
          onClick={(e) => onSelect(card, e.currentTarget)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(card, e.currentTarget);
            }
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          aria-haspopup="dialog"
          aria-label={`Open detailed profile for ${card.title}`}
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            transition: isReducedMotion
              ? 'none'
              : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="relative w-full min-h-[340px] sm:min-h-[380px] p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#121214]/90 via-[#0C0C0E]/95 to-[#08080A] backdrop-blur-xl flex flex-col justify-between text-left cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#FF2800] overflow-hidden"
        >
          {/* Specular Glare Overlay */}
          <div
            ref={glareRef}
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 transition-opacity duration-300 z-20"
          />

          {/* Dynamic Highlight Border */}
          <div
            ref={edgeRef}
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none rounded-2xl border border-white/[0.08] opacity-35 transition-all duration-300 z-10"
          />

          {/* Top Header: Number and Category Tag */}
          <div 
            className="relative z-10 flex items-start justify-between gap-3 mb-6"
            style={{ transform: 'translateZ(18px)' }}
          >
            <div className="flex flex-col">
              <span className="font-tech text-2xl sm:text-3xl font-bold text-[#FF2800] tracking-wider">
                {card.number}
              </span>
              <span className="font-tech text-[11px] font-semibold tracking-widest text-neutral-400 uppercase mt-0.5">
                DOMAIN DISCIPLINE
              </span>
            </div>

            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400 group-hover/card:text-white group-hover/card:border-[#FF2800]/50 transition-colors">
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
            </div>
          </div>

          {/* Middle Visual Anchor: Suspended 3D Motif */}
          <div 
            className="relative z-10 my-auto py-2 flex items-center justify-between"
            style={{ transform: 'translateZ(26px)' }}
          >
            <div className="flex-1 pr-4">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug group-hover/card:text-white">
                {card.title}
              </h3>
              <p className="font-tech text-xs text-[#FF2800] tracking-wide uppercase font-semibold mt-1.5">
                {card.tagline}
              </p>
            </div>

            <div className="shrink-0 transition-transform duration-500 group-hover/card:scale-108">
              {renderGraphicMotif()}
            </div>
          </div>

          {/* Bottom Prose & Cue */}
          <div 
            className="relative z-10 pt-4 border-t border-white/[0.06] mt-4 flex items-end justify-between gap-3"
            style={{ transform: 'translateZ(14px)' }}
          >
            <p className="font-body text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed max-w-[82%]">
              {card.shortDescription}
            </p>

            <span className="font-tech text-[11px] font-bold tracking-wider text-neutral-400 group-hover/card:text-[#FF2800] uppercase shrink-0 transition-colors">
              EXPAND ⤢
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
