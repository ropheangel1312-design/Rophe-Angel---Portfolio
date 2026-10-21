import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { PaperItem } from '../types';
import { papersData } from '../data/papersData';
import { TextScramble } from './TextScramble';
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
  const activeTriggerRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

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

  // Staggered 3D spatial orientation configuration for Phase B materialization
  const getDocumentSpatialConfig = (index: number) => {
    if (isReducedMotion) {
      return {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, delay: index * 0.1, ease: 'easeOut' as const }
      };
    }

    // Index-based spatial divergence (left card tilts inward from -5.5deg, right from +5.5deg)
    const lateralRotations = [-5.5, 0, 5.5];
    const initialRotateY = lateralRotations[index] ?? 0;

    return {
      initial: {
        opacity: 0,
        y: 45,
        z: -180,
        rotateX: 20,
        rotateY: initialRotateY,
        scale: 0.92
      },
      animate: {
        opacity: 1,
        y: 0,
        z: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1
      },
      transition: {
        opacity: { duration: 0.28, ease: 'easeOut' as const, delay: 0.08 + index * 0.15 },
        y: { duration: 0.95, ease: cinematicEase, delay: 0.08 + index * 0.15 },
        z: { duration: 0.95, ease: cinematicEase, delay: 0.08 + index * 0.15 },
        rotateX: { duration: 1.0, ease: cinematicEase, delay: 0.08 + index * 0.15 },
        rotateY: { duration: 1.0, ease: cinematicEase, delay: 0.08 + index * 0.15 },
        scale: { duration: 0.95, ease: cinematicEase, delay: 0.08 + index * 0.15 }
      }
    };
  };

  return (
    <section 
      id="papers" 
      className="pt-8 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full relative"
    >
      {/* ===================== PHASE A: THE ARCHIVE ANNOUNCES ITSELF ===================== */}
      <motion.div 
        className="mb-8 sm:mb-10"
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
          Curated archive of unpublished theoretical frameworks, civic prototype architectures, and team evidence-fusion research.
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

      {/* ===================== PHASE B & C: DOCUMENTS MATERIALIZE & INSPECTION ===================== */}
      {/* 3D Perspective Canvas Container */}
      <div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 relative"
      >
        {papersData.map((paper, index) => {
          const spatialConfig = getDocumentSpatialConfig(index);

          return (
            <div
              key={paper.id}
              className="w-full flex"
              style={{
                perspective: isReducedMotion ? 'none' : '1000px',
                perspectiveOrigin: 'center center'
              }}
            >
              <motion.div
                initial={spatialConfig.initial}
                whileInView={spatialConfig.animate}
                viewport={{ once: true, amount: 0.25 }}
                transition={spatialConfig.transition}
                style={{ 
                  transformStyle: isReducedMotion ? 'flat' : 'preserve-3d',
                  willChange: isReducedMotion ? 'auto' : 'transform, opacity'
                }}
                className="flex w-full"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleOpen(paper, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpen(paper, e);
                    }
                  }}
                  aria-haspopup="dialog"
                  aria-label={`Open research dossier for ${paper.title}`}
                  className="f1-card rounded-xl p-6 sm:p-7 flex flex-col justify-between group relative overflow-hidden cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#E10600] text-left transition-all duration-300 hover:-translate-y-1.5 w-full"
                >
                  {/* Top red laser rim accent */}
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#E10600]/60 to-transparent group-hover:via-[#E10600] group-hover:shadow-[0_0_12px_rgba(225,6,0,0.6)] transition-all duration-300" />

                  <div>
                    {/* Category & Status Bar — Zero-Pill Typography */}
                    <div className="flex items-center justify-between gap-2 mb-4 text-xs font-tech">
                      <span className="font-bold text-[#E10600] uppercase tracking-wider flex items-center gap-1.5">
                        <span>MS-{paper.number}</span>
                        <span className="text-neutral-600">/</span>
                        <span className="text-neutral-400 font-normal">VAULT</span>
                      </span>
                      <span className="font-mono text-[11px] text-neutral-400 tracking-wider">
                        [{paper.status}]
                      </span>
                    </div>

                    {/* High-Precision Recessed Emblem Display */}
                    <div className="h-20 w-full mb-5 flex items-center justify-start p-2.5 rounded-lg bg-black/50 border border-white/[0.06] group-hover:border-white/[0.14] transition-colors shadow-inner">
                      <img
                        src={paper.logoUrl}
                        alt={`${paper.title.split(':')[0]} Official Logo`}
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

                    {/* Paper Title with balanced wrapping */}
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#FFFFFF] group-hover:text-[#E10600] transition-colors leading-snug mb-3">
                      {paper.title}
                    </h3>

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
                </div>
              </motion.div>
            </div>
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
