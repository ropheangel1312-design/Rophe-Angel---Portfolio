import React from 'react';
import { motion, MotionValue, useTransform } from 'motion/react';

interface ArchivalDocumentStageProps {
  scrollYProgress: MotionValue<number>;
  isReducedMotion: boolean;
}

export const ArchivalDocumentStage: React.FC<ArchivalDocumentStageProps> = ({
  scrollYProgress,
  isReducedMotion
}) => {
  // Top Indexing Laser Rail Runner (Travels horizontally across the archive slots)
  const runnerX = useTransform(
    scrollYProgress,
    [0.10, 0.48, 0.85],
    isReducedMotion ? ['0%', '0%', '0%'] : ['0%', '50%', '100%']
  );

  const railOpacity = useTransform(
    scrollYProgress,
    [0.08, 0.22, 0.82, 0.95],
    isReducedMotion ? [0, 1, 1, 0] : [0, 0.85, 0.85, 0]
  );

  // Left & Right Vertical Caliper notch positions
  const caliperNotchY = useTransform(
    scrollYProgress,
    [0.12, 0.65],
    isReducedMotion ? ['0%', '0%'] : ['0%', '80%']
  );

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* ===================== 1. ARCHIVAL DATUM LASER RAIL ===================== */}
      <motion.div 
        style={{ opacity: railOpacity }}
        className="absolute top-26 sm:top-28 inset-x-4 sm:inset-x-6 lg:inset-x-12"
      >
        <div className="relative h-px w-full bg-white/[0.08]">
          {/* Subtle guide tick marks at each document registration axis */}
          <div className="absolute left-[16.6%] -top-1 w-px h-2 bg-white/20" />
          <div className="absolute left-[50%] -top-1 w-px h-2 bg-white/20" />
          <div className="absolute left-[83.3%] -top-1 w-px h-2 bg-white/20" />

          {/* Traveling Ferrari-Red Index Runner */}
          <motion.div 
            style={{ left: runnerX }}
            className="absolute -top-1.5 w-14 h-3 -translate-x-1/2 flex items-center justify-center"
          >
            <div className="w-8 h-0.5 bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.9)]" />
            <div className="absolute -top-3 text-[8px] font-mono font-bold text-[#E10600] tracking-widest">
              DATUM▲
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ===================== 2. VERTICAL CALIPER MARGIN RAILS ===================== */}
      {/* Left Caliper */}
      <div className="absolute left-2 sm:left-4 top-40 bottom-24 w-3 hidden sm:flex flex-col justify-between py-2 border-r border-white/[0.06] font-mono text-[8px] text-neutral-600">
        <span>01</span>
        <motion.div 
          style={{ translateY: caliperNotchY }}
          className="w-2 h-0.5 bg-[#E10600]/80 shadow-[0_0_6px_rgba(225,6,0,0.8)] self-end"
        />
        <span>03</span>
      </div>

      {/* Right Registration Mark */}
      <div className="absolute right-2 sm:right-4 top-40 bottom-24 w-3 hidden sm:flex flex-col justify-between py-2 border-l border-white/[0.06] font-mono text-[8px] text-neutral-600 text-right">
        <span>[+]</span>
        <span>REG</span>
      </div>
    </div>
  );
};
