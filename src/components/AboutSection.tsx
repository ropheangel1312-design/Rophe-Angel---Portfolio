import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'motion/react';
import { portfolioData } from '../data/portfolioData';
import { TextScramble } from './TextScramble';
import { Card3D } from './Card3D';

interface AboutSectionProps {
  isReducedMotion: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ isReducedMotion }) => {
  const sectionRef = useRef<HTMLElement>(null);

  // Pointer position within the About section for desktop micro-parallax
  const [pointer, setPointer] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPointerActive, setIsPointerActive] = useState(false);

  // Smooth springs for pointer influence (prevents abrupt jumps and layout shifts)
  const pointerX = useSpring(0, { stiffness: 120, damping: 24, mass: 0.5 });
  const pointerY = useSpring(0, { stiffness: 120, damping: 24, mass: 0.5 });

  // Scroll-linked cinematic fracture timeline (smooth bidirectional progression)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Track pointer movements within section on desktop devices with fine pointer
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isReducedMotion) return;
    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return;

    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    pointerX.set(nx);
    pointerY.set(ny);
  };

  const handleMouseEnter = () => {
    if (isReducedMotion) return;
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
      setIsPointerActive(true);
    }
  };

  const handleMouseLeave = () => {
    setIsPointerActive(false);
    pointerX.set(0);
    pointerY.set(0);
  };

  // =========================================================================
  // SCROLL-LINKED CINEMATIC TIMELINE (Forward & Natural Reverse)
  // 0.0 -> 0.25: Enters viewport; atmosphere darkens; depth planes separate
  // 0.25 -> 0.50: Fracture reveals; narrow Ferrari-red laser expands; planes shift
  // 0.50 -> 0.75: Peak fracture depth; opposing planes offset to expose depth
  // 0.75 -> 1.00: Reassembly; planes align and settle cleanly into stable rest
  // =========================================================================

  // 1. Atmosphere darkening layer (deepens contrast behind content during transition)
  const atmosphereOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.35, 0.65, 0.9],
    isReducedMotion ? [0, 0, 0, 0] : [0, 0.48, 0.48, 0]
  );

  // 2. Background Plane (Deep Depth — Technical telemetry & coordinate watermark)
  const bgZ = useTransform(
    scrollYProgress,
    [0.15, 0.5, 0.85],
    isReducedMotion ? [0, 0, 0] : [-30, -95, -30]
  );
  const bgShiftX = useTransform(
    scrollYProgress,
    [0.2, 0.5, 0.8],
    isReducedMotion ? [0, 0, 0] : [0, -18, 0]
  );
  const bgShiftY = useTransform(
    scrollYProgress,
    [0.2, 0.5, 0.8],
    isReducedMotion ? [0, 0, 0] : [0, -10, 0]
  );

  // Pointer parallax for deep background
  const bgPointerX = useTransform(pointerX, (x) => (isReducedMotion ? 0 : -x * 22));
  const bgPointerY = useTransform(pointerY, (y) => (isReducedMotion ? 0 : -y * 14));

  // 3. The Central Fracture Seam (Hairline Ferrari-red laser that cuts across the backdrop)
  const fractureScaleX = useTransform(
    scrollYProgress,
    [0.22, 0.45, 0.55, 0.78],
    isReducedMotion ? [0, 0, 0, 0] : [0, 1, 1, 0]
  );
  const fractureOpacity = useTransform(
    scrollYProgress,
    [0.22, 0.38, 0.62, 0.78],
    isReducedMotion ? [0, 0, 0, 0] : [0, 0.95, 0.95, 0]
  );
  const fractureY = useTransform(
    scrollYProgress,
    [0.25, 0.5, 0.75],
    isReducedMotion ? [0, 0, 0] : [-12, 0, 12]
  );

  // 4. North-West Decorative Plane (Shifts upward-left during fracture)
  const nwShiftX = useTransform(
    scrollYProgress,
    [0.25, 0.5, 0.75],
    isReducedMotion ? [0, 0, 0] : [0, -15, 0]
  );
  const nwShiftY = useTransform(
    scrollYProgress,
    [0.25, 0.5, 0.75],
    isReducedMotion ? [0, 0, 0] : [0, -8, 0]
  );
  const nwRotateZ = useTransform(
    scrollYProgress,
    [0.25, 0.5, 0.75],
    isReducedMotion ? [0, 0, 0] : [0, -0.65, 0]
  );
  const nwZ = useTransform(
    scrollYProgress,
    [0.25, 0.5, 0.75],
    isReducedMotion ? [0, 0, 0] : [0, 24, 0]
  );

  // 5. South-East Decorative Plane (Shifts downward-right during fracture)
  const seShiftX = useTransform(
    scrollYProgress,
    [0.25, 0.5, 0.75],
    isReducedMotion ? [0, 0, 0] : [0, 15, 0]
  );
  const seShiftY = useTransform(
    scrollYProgress,
    [0.25, 0.5, 0.75],
    isReducedMotion ? [0, 0, 0] : [0, 8, 0]
  );
  const seRotateZ = useTransform(
    scrollYProgress,
    [0.25, 0.5, 0.75],
    isReducedMotion ? [0, 0, 0] : [0, 0.65, 0]
  );
  const seZ = useTransform(
    scrollYProgress,
    [0.25, 0.5, 0.75],
    isReducedMotion ? [0, 0, 0] : [0, -20, 0]
  );

  // Pointer parallax for foreground decorative shards
  const fgPointerX = useTransform(pointerX, (x) => (isReducedMotion ? 0 : x * 18));
  const fgPointerY = useTransform(pointerY, (y) => (isReducedMotion ? 0 : y * 12));

  const cinematicEase = [0.16, 1, 0.3, 1] as const;

  return (
    <section 
      id="about" 
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: isReducedMotion ? 'none' : '1200px',
        perspectiveOrigin: '50% 40%',
      }}
      className="relative pt-8 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full overflow-visible"
    >
      {/* ===================== DEPTH PLANE 1: BACKGROUND ATMOSPHERE & WATERMARK ===================== */}
      <motion.div
        aria-hidden="true"
        style={{
          opacity: atmosphereOpacity,
        }}
        className="absolute inset-0 -inset-x-8 -inset-y-12 bg-radial from-[#E10600]/[0.035] via-black/40 to-transparent pointer-events-none rounded-3xl z-0"
      />

      <motion.div
        aria-hidden="true"
        style={{
          z: bgZ,
          x: bgShiftX,
          y: bgShiftY,
          translateX: bgPointerX,
          translateY: bgPointerY,
          transformStyle: isReducedMotion ? 'flat' : 'preserve-3d',
        }}
        className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden flex flex-col justify-between p-6 opacity-30"
      >
        {/* Subtle Archival Telemetry Grid & Micro-Ruler */}
        <div className="flex items-center justify-between font-mono text-[10px] tracking-widest text-[#E10600]/40 uppercase border-b border-[#E10600]/15 pb-2">
          <span>SEC_01 // ARCHITECTURAL DEPTH</span>
          <span className="hidden sm:inline">LAT 13.0827° N · LON 80.2707° E</span>
          <span>PROTOCOL // CS-ENG</span>
        </div>

        {/* Large Ghosted Typographic Watermark in Background Plane */}
        <div className="my-auto text-center transform -rotate-1 pointer-events-none">
          <span className="font-display font-black text-6xl sm:text-8xl lg:text-9xl tracking-tighter text-white/[0.015] block uppercase">
            ENGINEERING
          </span>
        </div>

        <div className="flex items-center justify-between font-mono text-[9px] tracking-widest text-neutral-600 uppercase border-t border-white/[0.04] pt-2">
          <span>FRACTURE PLANE // 01</span>
          <span>F1 MOTORSPORT SPEC</span>
        </div>
      </motion.div>

      {/* ===================== DEPTH PLANE 2: THE CENTRAL FERRARI-RED FRACTURE SEAM ===================== */}
      <motion.div
        aria-hidden="true"
        style={{
          scaleX: fractureScaleX,
          opacity: fractureOpacity,
          y: fractureY,
          transformOrigin: '50% 50%',
        }}
        className="absolute top-1/2 left-0 right-0 h-[1.5px] pointer-events-none z-10 -rotate-2"
      >
        {/* The active laser cut line */}
        <div className="w-full h-full bg-gradient-to-r from-transparent via-[#E10600] to-transparent shadow-[0_0_14px_rgba(225,6,0,0.85)]" />

        {/* Laser Seam Origin Telemetry Nodes */}
        <div className="absolute left-1/4 -top-2 flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-[#E10600] uppercase bg-black/80 px-2 py-0.5 rounded border border-[#E10600]/40 shadow-[0_0_8px_rgba(225,6,0,0.4)]">
          <span className="w-1 h-1 rounded-full bg-[#E10600] animate-ping" />
          <span>FRACTURE_AXIS // 01</span>
        </div>
        <div className="hidden sm:flex absolute right-1/4 -bottom-2 items-center gap-1.5 text-[9px] font-mono tracking-widest text-[#E10600] uppercase bg-black/80 px-2 py-0.5 rounded border border-[#E10600]/40 shadow-[0_0_8px_rgba(225,6,0,0.4)]">
          <span>DEPTH_SEAM // ENG</span>
          <span className="w-1 h-1 rounded-full bg-[#E10600]" />
        </div>
      </motion.div>

      {/* ===================== DEPTH PLANE 3: OPPOSING DECORATIVE SHARDS (NW / SE) ===================== */}
      {/* North-West Caliper Framing Bracket */}
      <motion.div
        aria-hidden="true"
        style={{
          x: nwShiftX,
          y: nwShiftY,
          rotateZ: nwRotateZ,
          z: nwZ,
          translateX: fgPointerX,
          translateY: fgPointerY,
          transformStyle: isReducedMotion ? 'flat' : 'preserve-3d',
        }}
        className="absolute -top-3 -left-2 sm:-top-4 sm:-left-3 w-16 h-16 pointer-events-none z-20 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#E10600]/50" />
        <div className="absolute top-1 left-2 font-mono text-[8px] text-[#E10600]/60">01.NW</div>
      </motion.div>

      {/* South-East Caliper Framing Bracket */}
      <motion.div
        aria-hidden="true"
        style={{
          x: seShiftX,
          y: seShiftY,
          rotateZ: seRotateZ,
          z: seZ,
          translateX: fgPointerX,
          translateY: fgPointerY,
          transformStyle: isReducedMotion ? 'flat' : 'preserve-3d',
        }}
        className="absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 w-16 h-16 pointer-events-none z-20 overflow-hidden"
      >
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#E10600]/50" />
        <div className="absolute bottom-1 right-2 font-mono text-[8px] text-[#E10600]/60">01.SE</div>
      </motion.div>

      {/* ===================== CONTENT LAYER: READABLE, INTERACTIVE & NORMAL DOCUMENT FLOW ===================== */}
      <div className="relative z-10">
        
        {/* Section Header */}
        <motion.div 
          className="mb-6 sm:mb-8"
          initial={!isReducedMotion ? { opacity: 0, y: 22 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: cinematicEase }}
        >
          <div className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.8)]" />
            <span>01 // PROFILE & BACKGROUND</span>
            <span className="text-neutral-700">·</span>
            <span className="font-mono text-[11px] text-neutral-400">DISCIPLINE DOSSIER</span>
          </div>

          <TextScramble
            as="h2"
            text="ABOUT ME"
            triggerOnView={true}
            isReducedMotion={isReducedMotion}
            className="font-display text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight block"
          />
        </motion.div>

        {/* Interactive 2-Column Content Layout (Portrait + Engineering Profile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Authentic Portrait Framing in 3D Card */}
          <div className="lg:col-span-5 relative group">
            <Card3D 
              index={0} 
              isReducedMotion={isReducedMotion} 
              maxTilt={4.5}
              className="relative rounded-xl overflow-hidden f1-card shadow-2xl"
            >
              {/* Corner tech accents */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-tech text-[#FFFFFF] border border-white/[0.1] shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                <span>ROPHE ANGEL</span>
              </div>

              <div className="aspect-4/5 w-full overflow-hidden bg-[#0A0A0A]">
                <img
                  src={portfolioData.about.photoUrl}
                  alt="Rophe Angel portrait"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center filter contrast-105 brightness-95 group-hover:scale-103 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
              </div>

              <div className="p-4 bg-white/[0.03] backdrop-blur-md flex items-center justify-between text-xs font-tech text-neutral-400">
                <span>DEGREE: B.TECH CSE</span>
                <span className="text-[#E10600] font-semibold">EST. 2026</span>
              </div>
            </Card3D>
          </div>

          {/* Concise 2-3 sentence introduction in 3D Card */}
          <div className="lg:col-span-7 space-y-6">
            <Card3D 
              index={1} 
              isReducedMotion={isReducedMotion} 
              maxTilt={4}
              className="f1-card rounded-xl p-6 sm:p-8 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-tech font-bold uppercase text-[#E10600] tracking-widest fx-lens" data-text="ENGINEERING PROFILE">
                  ENGINEERING PROFILE
                </span>
                <span className="text-[10px] font-mono text-neutral-500 uppercase">
                  CSE // ACADEMIC & FOUNDER
                </span>
              </div>
              <p className="font-body text-base sm:text-lg text-neutral-200 leading-relaxed font-normal">
                {portfolioData.about.bio}
              </p>
            </Card3D>

            {/* Focus areas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {portfolioData.identity.focusAreas.map((area, i) => (
                <div 
                  key={i} 
                  className="p-3 rounded-lg bg-white/[0.04] backdrop-blur-md border border-white/[0.08] flex items-center gap-2 hover:border-[#E10600]/50 hover:bg-white/[0.07] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                  <span className="text-xs font-tech font-semibold tracking-wider text-[#FFFFFF] uppercase">
                    {area}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
