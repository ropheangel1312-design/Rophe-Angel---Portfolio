import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { skillsGalleryData, SkillCardData } from '../data/skillsGalleryData';
import { Skill3DCard } from './Skill3DCard';
import { TextScramble } from './TextScramble';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Workflow, 
  Terminal, 
  Layers, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface SkillsGallery3DProps {
  isReducedMotion: boolean;
}

export const SkillsGallery3D: React.FC<SkillsGallery3DProps> = ({ isReducedMotion }) => {
  const [selectedCard, setSelectedCard] = useState<SkillCardData | null>(null);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const activeTriggerRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Lock body scroll when detailed state is open
  useEffect(() => {
    if (selectedCard) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedCard]);

  // Handle keyboard Escape
  useEffect(() => {
    if (!selectedCard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isClosing) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCard, isClosing]);

  const handleSelectCard = (card: SkillCardData, triggerEl: HTMLElement) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    activeTriggerRef.current = triggerEl;
    setIsClosing(false);
    setSelectedCard(card);
  };

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setSelectedCard(null);
      setIsClosing(false);
      activeTriggerRef.current?.focus();
    }, 190);
  };

  const handleJumpToSection = (targetId: string) => {
    handleClose();
    setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth' });
      }
    }, 220);
  };

  const cinematicEase = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="w-full">
      {/* 3D Gallery Grid (3 Columns on Desktop, 2 on Tablet, 1 on Mobile) */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
        initial={!isReducedMotion ? { opacity: 0, y: 20 } : false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.75, ease: cinematicEase }}
      >
        {skillsGalleryData.map((card, idx) => (
          <Skill3DCard
            key={card.id}
            card={card}
            index={idx}
            onSelect={handleSelectCard}
            isReducedMotion={isReducedMotion}
          />
        ))}
      </motion.div>

      {/* ===================== CLICK-TO-REVEAL DETAILED OVERLAY ===================== */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`skill-modal-title-${selectedCard.id}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            className={`f1-modal-surface rounded-2xl max-w-3xl w-full p-6 sm:p-9 shadow-2xl relative my-auto max-h-[92vh] flex flex-col overflow-hidden text-left border border-white/10 ${
              isClosing ? 'animate-modal-out' : 'animate-modal-in'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Red Racing Highlight Stripe */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF2800] to-transparent" />

            {/* Header Area */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08] shrink-0 pt-1">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-tech text-xs font-bold uppercase tracking-widest text-[#FF2800]">
                    DISCIPLINE {selectedCard.number} // CAPABILITIES DOSSIER
                  </span>
                </div>
                <h2
                  id={`skill-modal-title-${selectedCard.id}`}
                  className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight"
                >
                  {selectedCard.title}
                </h2>
                <p className="font-tech text-xs sm:text-sm text-neutral-400 font-semibold tracking-wider uppercase mt-1">
                  {selectedCard.tagline}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="p-2 rounded-lg bg-[#141416] border border-neutral-700 hover:border-[#FF2800] hover:text-[#FF2800] text-neutral-300 transition-all active:scale-95 focus:outline-hidden focus:ring-1 focus:ring-[#FF2800] cursor-pointer shrink-0"
                aria-label="Close detailed capabilities"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto py-5 space-y-6 pr-1 text-white">
              
              {/* Comprehensive Overview */}
              <div>
                <h3 className="text-xs font-tech font-bold uppercase tracking-widest text-[#FF2800] mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>DISCIPLINE OVERVIEW</span>
                </h3>
                <p className="font-body text-sm sm:text-base text-neutral-200 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
                  {selectedCard.expanded.overview}
                </p>
              </div>

              {/* Core Competencies */}
              <div>
                <h3 className="text-xs font-tech font-bold uppercase tracking-widest text-[#FF2800] mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CORE COMPETENCIES</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedCard.expanded.coreCompetencies.map((comp, cIdx) => (
                    <div 
                      key={cIdx}
                      className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5 text-xs sm:text-sm text-neutral-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF2800] shrink-0" />
                      <span>{comp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Methods & Workflows */}
              <div>
                <h3 className="text-xs font-tech font-bold uppercase tracking-widest text-[#FF2800] mb-3 flex items-center gap-2">
                  <Workflow className="w-4 h-4" />
                  <span>METHODS & APPLIED WORKFLOWS</span>
                </h3>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  {selectedCard.expanded.methodsAndWorkflows.map((method, mIdx) => (
                    <div key={mIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                      <span className="text-[#FF2800] font-tech font-bold shrink-0">›</span>
                      <span>{method}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Production Tools & Stack */}
              <div>
                <h3 className="text-xs font-tech font-bold uppercase tracking-widest text-[#FF2800] mb-3 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>PRODUCTION TOOLS & ENVIRONMENTS</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCard.expanded.productionTools.map((tool, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-xs font-tech tracking-wider text-neutral-200 border border-white/[0.08]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Featured Project / Paper References */}
              {selectedCard.expanded.featuredReferences && selectedCard.expanded.featuredReferences.length > 0 && (
                <div>
                  <h3 className="text-xs font-tech font-bold uppercase tracking-widest text-[#FF2800] mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>APPLIED EVIDENCE IN THIS PORTFOLIO</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedCard.expanded.featuredReferences.map((ref, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => handleJumpToSection(ref.targetId)}
                        className="f1-btn-secondary px-4 py-2 rounded-lg text-xs font-tech uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer group"
                      >
                        <span>{ref.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#FF2800]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer Area */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] font-mono text-neutral-500 uppercase">
                DISCIPLINE PROFILE · {selectedCard.number} OF 06
              </span>

              <button
                onClick={handleClose}
                className="f1-btn-secondary px-5 py-2 rounded-lg text-xs font-tech uppercase tracking-wider cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
