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
  CheckCircle2, 
  BookOpen, 
  Users, 
  Layers,
  ShieldAlert,
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

  // Handle keyboard Escape and Tab trapping
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
    <motion.section 
      id="papers" 
      className="pt-8 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full"
      initial={!isReducedMotion ? { opacity: 0, y: 24 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: cinematicEase }}
    >
      {/* Section Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2">
          <span>04 // ARCHIVE & MANUSCRIPTS</span>
          <span className="text-neutral-600">/</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30">
            3 UNPUBLISHED PAPERS
          </span>
        </div>
        <TextScramble
          as="h2"
          text="RESEARCH PAPERS"
          triggerOnView={true}
          isReducedMotion={isReducedMotion}
          className="font-display text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight block"
        />
        <p className="font-body text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Curated archive of unpublished theoretical frameworks, civic prototype architectures, and team evidence-fusion research.
        </p>
      </div>

      {/* Papers Archive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {papersData.map((paper) => (
          <div
            key={paper.id}
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
            className="f1-card rounded-xl p-6 sm:p-7 flex flex-col justify-between group relative overflow-hidden cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#E10600] text-left transition-all duration-300 hover:-translate-y-1"
          >
            {/* Top red border accent */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#E10600]/60 to-transparent group-hover:via-[#E10600] transition-colors" />

            <div>
              {/* Category & Status Bar */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-tech font-bold text-[#E10600] uppercase tracking-wider">
                  {paper.number} // ARCHIVE
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-neutral-300 border border-white/10 group-hover:border-[#E10600]/40 transition-colors">
                  {paper.status}
                </span>
              </div>

              {/* Official Logo Display Container */}
              <div className="h-20 w-full mb-5 flex items-center justify-start p-2 rounded-lg bg-black/40 border border-white/[0.06] group-hover:border-white/[0.12] transition-colors">
                <img
                  src={paper.logoUrl}
                  alt={`${paper.title.split(':')[0]} Official Logo`}
                  onError={(e) => {
                    // Graceful fallback to remote direct CDN URL
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.src !== paper.fallbackLogoUrl) {
                      img.src = paper.fallbackLogoUrl;
                    }
                  }}
                  className="max-h-full max-w-full object-contain filter brightness-105 group-hover:scale-102 transition-transform duration-300"
                />
              </div>

              {/* Paper Category Pill */}
              <div className="mb-2.5">
                <span className="text-[11px] font-tech uppercase tracking-wider text-neutral-400">
                  {paper.category}
                </span>
              </div>

              {/* Full Research Title */}
              <h3 className="font-display text-base sm:text-lg font-bold text-[#FFFFFF] group-hover:text-[#E10600] transition-colors leading-snug mb-3">
                {paper.title}
              </h3>

              {/* Abstract */}
              <p className="font-body text-xs sm:text-sm text-neutral-300 line-clamp-3 leading-relaxed mb-4">
                {paper.abstract}
              </p>
            </div>

            {/* Bottom Meta & Trigger */}
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2 mt-auto">
              <div className="text-[11px] font-tech text-neutral-400 truncate">
                <span className="text-neutral-500">Stage: </span>
                <span className="text-neutral-300">{paper.researchStage.split(';')[0]}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-tech font-bold uppercase tracking-wider text-[#E10600] group-hover:translate-x-1 transition-transform shrink-0">
                <span>Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
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

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08] shrink-0 pt-1">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600]">
                    PAPER {selectedPaper.number} // {selectedPaper.category}
                  </span>
                  <span className="text-neutral-700">|</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30 font-semibold">
                    {selectedPaper.status}
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
    </motion.section>
  );
};
