import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { PaperItem } from '../types';
import { papersData } from '../data/papersData';
import { TextScramble } from './TextScramble';
import { Card3D } from './Card3D';
import { ArchivalDocumentStage } from './ArchivalDocumentStage';
import { 
  FileText, 
  ExternalLink, 
  Github, 
  X, 
  AlertTriangle, 
  BookOpen, 
  Users, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface PapersSectionProps {
  isReducedMotion: boolean;
}

export const PapersSection: React.FC<PapersSectionProps> = ({ isReducedMotion }) => {
  const [selectedPaper, setSelectedPaper] = useState<PaperItem | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const activeTriggerRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Scroll-linked timeline for Stage 3: THE ARCHIVE MATERIALIZES
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  // Card 0 (MS-01: ASSURE - left column)
  const card0Z = useTransform(scrollYProgress, [0.08, 0.42, 0.82, 0.95], isReducedMotion ? [0, 0, 0, 0] : [-110, 0, 0, -45]);
  const card0RotY = useTransform(scrollYProgress, [0.08, 0.42, 0.82, 0.95], isReducedMotion ? [0, 0, 0, 0] : [-9, 0, 0, -3]);
  const card0RotX = useTransform(scrollYProgress, [0.08, 0.42, 0.82, 0.95], isReducedMotion ? [0, 0, 0, 0] : [7, 0, 0, 3]);
  const card0Y = useTransform(scrollYProgress, [0.08, 0.42, 0.82, 0.95], isReducedMotion ? [0, 0, 0, 0] : [32, 0, 0, -14]);
  const card0Scale = useTransform(scrollYProgress, [0.08, 0.42, 0.82, 0.95], isReducedMotion ? [1, 1, 1, 1] : [0.93, 1.0, 1.0, 0.97]);
  const card0Opacity = useTransform(scrollYProgress, [0.06, 0.32, 0.85, 0.95], isReducedMotion ? [1, 1, 1, 1] : [0.55, 1.0, 1.0, 0.7]);

  // Card 1 (MS-02: Jana Nayagan - center column)
  const card1Z = useTransform(scrollYProgress, [0.10, 0.46, 0.82, 0.95], isReducedMotion ? [0, 0, 0, 0] : [-145, 0, 0, -55]);
  const card1RotX = useTransform(scrollYProgress, [0.10, 0.46, 0.82, 0.95], isReducedMotion ? [0, 0, 0, 0] : [-8, 0, 0, -3]);
  const card1Y = useTransform(scrollYProgress, [0.10, 0.46, 0.82, 0.95], isReducedMotion ? [0, 0, 0, 0] : [44, 0, 0, -18]);
  const card1Scale = useTransform(scrollYProgress, [0.10, 0.46, 0.82, 0.95], isReducedMotion ? [1, 1, 1, 1] : [0.90, 1.0, 1.0, 0.96]);
  const card1Opacity = useTransform(scrollYProgress, [0.08, 0.36, 0.85, 0.95], isReducedMotion ? [1, 1, 1, 1] : [0.50, 1.0, 1.0, 0.7]);

  // Card 2 (MS-03: SAMAY & SAAKSHI - right column)
  const card2Z = useTransform(scrollYProgress, [0.12, 0.50, 0.82, 0.95], isReducedMotion ? [0, 0, 0, 0] : [-110, 0, 0, -45]);
  const card2RotY = useTransform(scrollYProgress, [0.12, 0.50, 0.82, 0.95], isReducedMotion ? [0, 0, 0, 0] : [9, 0, 0, 3]);
  const card2RotX = useTransform(scrollYProgress, [0.12, 0.50, 0.82, 0.95], isReducedMotion ? [0, 0, 0, 0] : [7, 0, 0, 3]);
  const card2Y = useTransform(scrollYProgress, [0.12, 0.50, 0.82, 0.95], isReducedMotion ? [0, 0, 0, 0] : [32, 0, 0, -14]);
  const card2Scale = useTransform(scrollYProgress, [0.12, 0.50, 0.82, 0.95], isReducedMotion ? [1, 1, 1, 1] : [0.93, 1.0, 1.0, 0.97]);
  const card2Opacity = useTransform(scrollYProgress, [0.10, 0.40, 0.85, 0.95], isReducedMotion ? [1, 1, 1, 1] : [0.55, 1.0, 1.0, 0.7]);

  // Clear closing timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (selectedPaper) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedPaper]);

  // Handle keyboard Escape and focus management
  useEffect(() => {
    if (!selectedPaper) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isClosing) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPaper, isClosing]);

  const handleOpen = (paper: PaperItem, e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    activeTriggerRef.current = e.currentTarget;
    setIsClosing(false);
    setSelectedPaper(paper);
  };

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setSelectedPaper(null);
      setIsClosing(false);
      activeTriggerRef.current?.focus();
    }, 180);
  };

  const cinematicEase = [0.16, 1, 0.3, 1] as const;

  return (
    <section 
      ref={sectionRef}
      id="papers" 
      className="pt-8 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full relative"
    >
      {/* ===================== STAGE 3: THE ARCHIVE MATERIALIZES ===================== */}
      <ArchivalDocumentStage 
        scrollYProgress={scrollYProgress}
        isReducedMotion={isReducedMotion}
      />

      {/* ===================== PHASE A: THE ARCHIVE ANNOUNCES ITSELF ===================== */}
      <motion.div 
        className="mb-8 sm:mb-10 relative z-10"
        initial={!isReducedMotion ? { opacity: 0, y: 22 } : false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.75, ease: cinematicEase }}
      >
        {/* Archival metadata line with zero-pill discipline */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2.5">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.8)]" />
            <span>04 / ARCHIVAL VAULT & MANUSCRIPTS</span>
          </span>
          <span className="text-neutral-600">·</span>
          <span className="font-mono text-[11px] tracking-wider text-neutral-300">
            3 UNPUBLISHED PAPERS
          </span>
          <span className="text-neutral-600">·</span>
          <span className="font-mono text-[11px] tracking-wider text-[#E10600]">
            PEER DISCLOSURE ACTIVE
          </span>
        </div>

        <TextScramble
          as="h2"
          text="RESEARCH PAPERS"
          triggerOnView={true}
          isReducedMotion={isReducedMotion}
          className="font-display text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight block"
        />

        <p className="font-body text-xs sm:text-sm text-neutral-400 mt-2 max-w-2xl leading-relaxed">
          Working preprints and research briefs exploring document analysis, civic complaint workflows, and transaction verification. All three are currently unpublished research concepts.
        </p>

        {/* Technical Vault Caliper Ruler */}
        <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="text-[#E10600]">VAULT_INDEX //</span>
            <span>SEC_04_DOCUMENTS</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-neutral-500">
            <span>FORMAT: PRE-PRINT MANUSCRIPT</span>
            <span className="text-neutral-700">|</span>
            <span className="text-neutral-400">STATUS: UNPUBLISHED RESEARCH</span>
          </div>
        </div>
      </motion.div>

      {/* ===================== PHASE B & C: DOCUMENTS MATERIALIZE & RESOLUTION ===================== */}
      {/* 3D Perspective Canvas Container */}
      <div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 relative z-10"
        style={{
          perspective: isReducedMotion ? 'none' : '1200px',
          perspectiveOrigin: '50% 35%'
        }}
      >
        {papersData.map((paper, index) => {
          const paperName = paper.title.split(':')[0].trim();
          const paperSubtitle = paper.title.includes(':') 
            ? paper.title.split(':').slice(1).join(':').trim() 
            : '';
          const isHovered = hoveredIndex === index;

          const cardZ = index === 0 ? card0Z : index === 1 ? card1Z : card2Z;
          const cardRotX = index === 0 ? card0RotX : index === 1 ? card1RotX : card2RotX;
          const cardRotY = index === 0 ? card0RotY : index === 1 ? undefined : card2RotY;
          const cardY = index === 0 ? card0Y : index === 1 ? card1Y : card2Y;
          const cardScale = index === 0 ? card0Scale : index === 1 ? card1Scale : card2Scale;
          const cardOpacity = index === 0 ? card0Opacity : index === 1 ? card1Opacity : card2Opacity;

          return (
            <motion.div
              key={paper.id}
              style={{
                z: cardZ,
                rotateX: cardRotX,
                rotateY: cardRotY,
                y: cardY,
                scale: cardScale,
                opacity: cardOpacity,
                transformStyle: isReducedMotion ? 'flat' : 'preserve-3d'
              }}
              className="flex w-full"
            >
              <Card3D
                index={index}
                isReducedMotion={isReducedMotion}
                lateralTilt={false}
                role="button"
                tabIndex={0}
                onClick={(e) => handleOpen(paper, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpen(paper, e);
                  }
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                aria-haspopup="dialog"
                aria-label={`Open research dossier for ${paperName}`}
                className={`f1-card rounded-xl p-6 sm:p-7 flex flex-col justify-between cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E10600] text-left overflow-hidden transition-all duration-300 relative group shadow-[0_4px_20px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.08),3px_3px_0_-1px_#0A0A0A,3px_3px_0_0_rgba(255,255,255,0.06),6px_6px_0_-2px_#0A0A0A,6px_6px_0_-1px_rgba(225,6,0,0.18)] ${
                  isHovered ? 'border-[#E10600]/70 shadow-[0_16px_36px_rgba(225,6,0,0.25),0_1px_0_rgba(255,255,255,0.12),3px_3px_0_-1px_#0A0A0A,3px_3px_0_0_rgba(225,6,0,0.3),6px_6px_0_-2px_#0A0A0A,6px_6px_0_-1px_rgba(225,6,0,0.4)]' : ''
                }`}
              >
                {/* Top red laser rim accent */}
                <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#E10600]/60 to-transparent transition-all duration-300 ${
                  isHovered ? 'via-[#E10600] shadow-[0_0_12px_rgba(225,6,0,0.85)]' : 'group-hover:via-[#E10600]'
                }`} />

                <div>
                  {/* Category & Status Bar with Archival Registration Notch */}
                  <div className="flex items-center justify-between gap-2 mb-4 text-xs font-tech">
                    <span className="font-bold text-[#E10600] uppercase tracking-wider flex items-center gap-1.5">
                      <span>MS-{paper.number}</span>
                      <span className="text-neutral-600">/</span>
                      <span className="text-neutral-400 font-normal">VAULT</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-neutral-500 tracking-wider hidden sm:inline">
                        [+] REG.0{index + 1}
                      </span>
                      <span className="font-mono text-[11px] text-neutral-400 tracking-wider">
                        [{paper.status}]
                      </span>
                    </div>
                  </div>

                  {/* High-Precision Recessed Emblem Display */}
                  <div className="h-20 w-full mb-5 flex items-center justify-start p-2.5 rounded-lg bg-black/50 border border-white/[0.06] group-hover:border-white/[0.14] transition-colors shadow-inner">
                    <img
                      src={paper.logoUrl}
                      alt={`${paperName} Official Logo`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (img.src !== paper.fallbackLogoUrl) {
                          img.src = paper.fallbackLogoUrl;
                        }
                      }}
                      className="max-h-full max-w-full object-contain filter brightness-105 group-hover:scale-102 transition-transform duration-300"
                    />
                  </div>

                  {/* Clean unboxed category kicker */}
                  <div className="mb-2">
                    <span className="text-[11px] font-tech uppercase tracking-wider text-neutral-400 font-semibold">
                      {paper.category}
                    </span>
                  </div>

                  {/* Paper Title: Shortened to actual name */}
                  <h3 className={`font-display text-lg sm:text-xl font-bold transition-colors leading-snug mb-1.5 ${
                    isHovered ? 'text-[#E10600]' : 'text-[#FFFFFF] group-hover:text-[#E10600]'
                  }`}>
                    {paperName}
                  </h3>

                  {/* Subtitle describing scope */}
                  {paperSubtitle && (
                    <p className="font-tech text-xs text-neutral-400 leading-snug line-clamp-2 mb-3">
                      {paperSubtitle}
                    </p>
                  )}

                  {/* Abstract Preview */}
                  <p className="font-body text-xs sm:text-sm text-neutral-300 line-clamp-3 leading-relaxed mb-4">
                    {paper.abstract}
                  </p>
                </div>

                {/* Bottom Meta & Interactive Trigger */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2 mt-auto">
                  <div className="text-[11px] font-tech text-neutral-400 truncate max-w-[65%]">
                    <span className="text-neutral-500">STAGE: </span>
                    <span className="text-neutral-300">{paper.researchStage.split(';')[0]}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-tech font-bold uppercase tracking-wider text-[#E10600] group-hover:translate-x-1 transition-transform shrink-0">
                    <span>DOSSIER</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Card3D>
            </motion.div>
          );
        })}
      </div>

      {/* ===================== CINEMATIC RESEARCH DOSSIER OVERLAY ===================== */}
      {selectedPaper && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`paper-title-${selectedPaper.id}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div 
            ref={overlayRef}
            className={`f1-modal-surface rounded-xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl relative my-auto max-h-[90vh] flex flex-col overflow-hidden text-left ${
              isClosing ? 'animate-modal-out' : 'animate-modal-in'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Red Racing Stripe */}
            <div className="absolute top-0 inset-x-0 h-1 bg-[#E10600]" />

            {/* Modal Header with Zero-Pill Precision */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08] shrink-0 pt-1">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs font-tech font-bold uppercase tracking-widest text-[#E10600]">
                  <span>PAPER {selectedPaper.number} // {selectedPaper.category}</span>
                  <span className="text-neutral-700">·</span>
                  <span className="font-mono text-[11px] text-[#E10600] font-semibold">
                    STATUS: {selectedPaper.status}
                  </span>
                </div>
                <h2 
                  id={`paper-title-${selectedPaper.id}`}
                  className="font-display text-xl sm:text-2xl font-bold text-[#FFFFFF] leading-snug"
                >
                  {selectedPaper.title}
                </h2>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg bg-[#1A1A1A] border border-neutral-700 hover:border-[#E10600] hover:text-[#E10600] text-neutral-300 transition-all active:scale-95 focus:outline-hidden focus:ring-1 focus:ring-[#E10600] cursor-pointer shrink-0"
                aria-label="Close research dossier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Dossier Body */}
            <div className="overflow-y-auto py-5 space-y-6 pr-1 text-[#FFFFFF]">
              
              {/* Official Project Logo Banner */}
              <div className="p-4 sm:p-5 rounded-xl bg-black/60 border border-white/[0.08] flex items-center justify-center">
                <img
                  src={selectedPaper.logoUrl}
                  alt={`${selectedPaper.title.split(':')[0]} Official Project Logo`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.src !== selectedPaper.fallbackLogoUrl) {
                      img.src = selectedPaper.fallbackLogoUrl;
                    }
                  }}
                  className="h-20 sm:h-24 w-auto max-w-full object-contain"
                />
              </div>

              {/* Abstract / Summary */}
              <div>
                <h3 className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>RESEARCH ABSTRACT</span>
                </h3>
                <p className="font-body text-sm sm:text-base text-neutral-200 leading-relaxed bg-white/[0.02] p-4 rounded-lg border border-white/[0.06]">
                  {selectedPaper.abstract}
                </p>
              </div>

              {/* Stage & Development Status */}
              <div>
                <h3 className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>CURRENT RESEARCH STAGE</span>
                </h3>
                <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm font-tech tracking-wide text-neutral-300">
                  {selectedPaper.researchStage}
                </div>
              </div>

              {/* Authorship & Contribution */}
              <div>
                <h3 className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>AUTHORSHIP & CONTRIBUTION</span>
                </h3>
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2">
                  {selectedPaper.authors && (
                    <div className="text-xs sm:text-sm text-neutral-300">
                      <span className="text-neutral-400 font-tech font-semibold uppercase">Authors Listed in Manuscript: </span>
                      <span className="text-[#FFFFFF]">{selectedPaper.authors.join(', ')}</span>
                    </div>
                  )}
                  <div className="text-xs sm:text-sm text-neutral-300">
                    <span className="text-neutral-400 font-tech font-semibold uppercase">My Contribution: </span>
                    <span className="text-[#E10600] font-semibold">{selectedPaper.contribution}</span>
                  </div>
                  {selectedPaper.myRoleClarification && (
                    <p className="text-xs text-neutral-400 italic pt-1">
                      {selectedPaper.myRoleClarification}
                    </p>
                  )}
                </div>
              </div>

              {/* Scope & Honest Known Limitations */}
              {selectedPaper.limitations && selectedPaper.limitations.length > 0 && (
                <div>
                  <h3 className="text-xs font-tech font-bold uppercase tracking-widest text-amber-500 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>DOCUMENTED LIMITATIONS & RESEARCH SCOPE</span>
                  </h3>
                  <div className="p-4 rounded-lg bg-amber-500/[0.04] border border-amber-500/20 space-y-2">
                    {selectedPaper.limitations.map((lim, lIdx) => (
                      <div key={lIdx} className="flex items-start gap-2.5 text-xs text-neutral-300 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{lim}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                {/* Read Full Paper Primary Action */}
                {selectedPaper.paperUrl ? (
                  <a
                    href={selectedPaper.paperUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="f1-btn-primary px-5 py-2.5 rounded-lg text-xs font-tech uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>READ FULL PAPER</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-neutral-400 text-xs font-tech uppercase tracking-wider" title="Full paper manuscript link pending public release">
                    <BookOpen className="w-4 h-4 text-[#E10600]" />
                    <span>MANUSCRIPT ACCESS PENDING RELEASE</span>
                  </div>
                )}

                {/* Repository Action (Only if repositoryUrl exists) */}
                {selectedPaper.repositoryUrl && (
                  <a
                    href={selectedPaper.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="f1-btn-secondary px-4 py-2.5 rounded-lg text-xs font-tech uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Github className="w-4 h-4" />
                    <span>REPOSITORY</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                )}
              </div>

              {/* Close Button Action */}
              <button
                onClick={handleClose}
                className="px-4 py-2 text-xs font-tech uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
