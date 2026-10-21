import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { WipItem } from '../types';
import { wipData } from '../data/wipData';
import { TextScramble } from './TextScramble';
import { Card3D } from './Card3D';
import { 
  Sparkles, 
  Compass, 
  Headphones, 
  Target, 
  CheckCircle, 
  X, 
  ArrowRight, 
  Flame, 
  Radio, 
  Clock, 
  Milestone 
} from 'lucide-react';

interface WipSectionProps {
  isReducedMotion: boolean;
}

export const WipSection: React.FC<WipSectionProps> = ({ isReducedMotion }) => {
  const [selectedWip, setSelectedWip] = useState<WipItem | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const activeTriggerRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (selectedWip) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedWip]);

  // Handle keyboard Escape
  useEffect(() => {
    if (!selectedWip) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isClosing) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWip, isClosing]);

  const handleOpen = (wip: WipItem, e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    activeTriggerRef.current = e.currentTarget;
    setIsClosing(false);
    setSelectedWip(wip);
  };

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setSelectedWip(null);
      setIsClosing(false);
      activeTriggerRef.current?.focus();
    }, 200);
  };

  const cinematicEase = [0.16, 1, 0.3, 1] as const;

  return (
    <motion.section 
      id="wip" 
      className="pt-8 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full"
      initial={!isReducedMotion ? { opacity: 0, y: 24 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: cinematicEase }}
    >
      {/* Section Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2">
          <span>05 // WORK IN PROGRESS & CONCEPTS</span>
          <span className="text-neutral-600">/</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
            CONCEPT & MVP PLANNING
          </span>
        </div>
        <TextScramble
          as="h2"
          text="ONGOING VISIONS"
          triggerOnView={true}
          isReducedMotion={isReducedMotion}
          className="font-display text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight block"
        />
        <p className="font-body text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Cinematic teasers for upcoming concepts and exploratory platforms currently undergoing product definition and MVP planning.
        </p>
      </div>

      {/* WIP Teaser Cards (2-Column Showcase) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {wipData.map((wip, idx) => {
          const isAstral = wip.atmosphericTheme === 'astral';
          return (
            <Card3D
              key={wip.id}
              index={idx}
              isReducedMotion={isReducedMotion}
              lateralTilt={true}
              role="button"
              tabIndex={0}
              onClick={(e) => handleOpen(wip, e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpen(wip, e);
                }
              }}
              aria-haspopup="dialog"
              aria-label={`Open cinematic overlay for ${wip.title}`}
              className="f1-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#E10600] text-left overflow-hidden shadow-2xl"
            >
              {/* Atmospheric Background Ambient Radial Glow */}
              <div 
                className={`absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-20 group-hover:opacity-40 ${
                  isAstral 
                    ? 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-600/30 via-red-950/20 to-transparent' 
                    : 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-600/20 via-neutral-900/40 to-transparent'
                }`}
              />

              {/* Corner Tech Accents */}
              <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#E10600]/40 group-hover:border-[#E10600] transition-colors" />
              </div>

              <div className="relative z-10">
                {/* Header Strip */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-tech font-bold text-[#E10600] uppercase tracking-wider">
                      {wip.number} // CONCEPT
                    </span>
                    <span className="text-neutral-700">|</span>
                    <span className="text-xs font-tech uppercase text-neutral-400">
                      {isAstral ? 'Progression Lore' : 'Study & Acoustic'}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded text-[11px] font-tech font-bold uppercase tracking-wider bg-white/[0.04] text-neutral-300 border border-white/[0.08] group-hover:border-[#E10600]/40 transition-colors">
                    {wip.status}
                  </span>
                </div>

                {/* Official Logo Banner */}
                <div className="h-24 sm:h-28 w-full mb-6 p-3 rounded-xl bg-black/50 border border-white/[0.08] flex items-center justify-center group-hover:border-white/[0.16] transition-colors">
                  <img
                    src={wip.logoUrl}
                    alt={`${wip.title} Official Emblem`}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (img.src !== wip.fallbackLogoUrl) {
                        img.src = wip.fallbackLogoUrl;
                      }
                    }}
                    className="max-h-full max-w-full object-contain filter brightness-105 group-hover:scale-103 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                </div>

                {/* Title & Tagline */}
                <div className="mb-4">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#FFFFFF] tracking-tight group-hover:text-[#E10600] transition-colors">
                    {wip.title}
                  </h3>
                  <p className="font-tech text-xs sm:text-sm text-[#E10600] font-semibold tracking-wider uppercase mt-1">
                    "{wip.tagline}"
                  </p>
                </div>

                {/* Short Teaser */}
                <p className="font-body text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
                  {wip.shortTeaser}
                </p>
              </div>

              {/* Bottom Footer Info */}
              <div className="relative z-10 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3 mt-auto">
                <div className="text-[11px] font-tech text-neutral-400 truncate">
                  <span className="text-neutral-500">Focus: </span>
                  <span className="text-neutral-300">{wip.currentFocus.split(',')[0]}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-tech font-bold uppercase tracking-wider text-[#E10600] group-hover:translate-x-1 transition-transform shrink-0">
                  <span>Enter Concept</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Card3D>
          );
        })}
      </div>

      {/* ===================== FULL-SCREEN CINEMATIC OVERLAY ===================== */}
      {selectedWip && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`wip-overlay-title-${selectedWip.id}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div 
            className={`f1-modal-surface rounded-2xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl relative my-auto max-h-[92vh] flex flex-col overflow-hidden text-left border border-white/10 ${
              isClosing ? 'animate-modal-out' : 'animate-modal-in'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Red Racing Stripe */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#E10600] via-[#FF2800] to-[#E10600]" />

            {/* Ambient Background Gradient specific to project */}
            <div 
              className={`absolute inset-0 pointer-events-none opacity-15 ${
                selectedWip.atmosphericTheme === 'astral'
                  ? 'bg-[radial-gradient(circle_at_top,_#E10600_0%,_transparent_65%)]'
                  : 'bg-[radial-gradient(circle_at_top,_#0080FF_0%,_transparent_65%)]'
              }`}
            />

            {/* Close Button Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08] shrink-0 relative z-10 pt-1">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600]">
                    WIP {selectedWip.number} // CINEMATIC OVERLAY
                  </span>
                  <span className="text-neutral-700">|</span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {selectedWip.status}
                  </span>
                </div>
                <h2 
                  id={`wip-overlay-title-${selectedWip.id}`}
                  className="font-display text-2xl sm:text-4xl font-bold text-[#FFFFFF] tracking-tight"
                >
                  {selectedWip.title}
                </h2>
                <p className="font-tech text-sm sm:text-base text-[#E10600] font-semibold tracking-wider uppercase mt-1">
                  "{selectedWip.tagline}"
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="p-2 rounded-lg bg-[#1A1A1A] border border-neutral-700 hover:border-[#E10600] hover:text-[#E10600] text-neutral-300 transition-all active:scale-95 focus:outline-hidden focus:ring-1 focus:ring-[#E10600] cursor-pointer shrink-0"
                aria-label="Close cinematic WIP overlay"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Overlay Body */}
            <div className="overflow-y-auto py-6 space-y-6 sm:space-y-7 pr-1 text-[#FFFFFF] relative z-10">
              
              {/* Official Project Logo Centerpiece */}
              <div className="p-6 sm:p-8 rounded-xl bg-black/60 border border-white/[0.08] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-radial from-white/[0.04] to-transparent pointer-events-none" />
                <img
                  src={selectedWip.logoUrl}
                  alt={`${selectedWip.title} Official Emblem`}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.src !== selectedWip.fallbackLogoUrl) {
                      img.src = selectedWip.fallbackLogoUrl;
                    }
                  }}
                  className="h-28 sm:h-36 w-auto max-w-full object-contain filter brightness-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* Product Vision & Narrative */}
              <div>
                <h3 className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>PROJECT VISION & ATMOSPHERE</span>
                </h3>
                <p className="font-body text-sm sm:text-base text-neutral-200 leading-relaxed bg-white/[0.02] p-5 rounded-xl border border-white/[0.06]">
                  {selectedWip.visionStatement}
                </p>
              </div>

              {/* Creator Role */}
              <div>
                <h3 className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  <span>CREATOR ROLE & RESPONSIBILITY</span>
                </h3>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm font-tech tracking-wide text-neutral-200">
                  <span className="text-[#E10600] font-semibold">{selectedWip.role}</span>
                </div>
              </div>

              {/* Current Focus */}
              <div>
                <h3 className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>CURRENT PLANNING FOCUS</span>
                </h3>
                <p className="font-body text-xs sm:text-sm text-neutral-300 leading-relaxed bg-white/[0.02] p-4 rounded-lg border border-white/[0.06]">
                  {selectedWip.currentFocus}
                </p>
              </div>

              {/* Next Milestones (Explicit descriptive milestones, zero fake percentage bars) */}
              <div>
                <h3 className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-3 flex items-center gap-2">
                  <Milestone className="w-4 h-4" />
                  <span>PLANNED DEVELOPMENT MILESTONES</span>
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {selectedWip.nextMilestones.map((milestone, mIdx) => (
                    <div 
                      key={mIdx}
                      className="p-3.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-start gap-3 text-xs sm:text-sm text-neutral-200"
                    >
                      <span className="font-mono text-xs font-bold text-[#E10600] px-2 py-0.5 rounded bg-[#E10600]/10 border border-[#E10600]/30 shrink-0">
                        STAGE 0{mIdx + 1}
                      </span>
                      <span className="leading-relaxed">{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Clarification & Boundary Notice */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-neutral-800 text-xs text-neutral-400 leading-relaxed">
                <span className="font-tech font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                  DISCLOSURE // STAGE STATUS:
                </span>
                {selectedWip.statusClarification}
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3 shrink-0 relative z-10">
              <span className="text-[11px] font-mono text-neutral-500 uppercase">
                ROPHE ANGEL · CONCEPT ARCHIVE
              </span>

              <button
                onClick={handleClose}
                className="f1-btn-secondary px-6 py-2.5 rounded-lg text-xs font-tech uppercase tracking-wider cursor-pointer"
              >
                RETURN TO WIP ARCHIVE
              </button>
            </div>

          </div>
        </div>
      )}
    </motion.section>
  );
};
