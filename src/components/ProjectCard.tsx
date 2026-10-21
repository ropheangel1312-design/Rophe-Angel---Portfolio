import React, { useState, useEffect, useRef } from 'react';
import { ProjectItem } from '../types';
import { TextScramble } from './TextScramble';
import { Card3D } from './Card3D';
import { 
  ExternalLink, 
  Github, 
  Monitor, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Layers, 
  Images,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface ProjectCardProps {
  project: ProjectItem;
  index: number;
  isReducedMotion?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, isReducedMotion = false }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isLightboxClosing, setIsLightboxClosing] = useState(false);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const modalCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lightboxCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (modalCloseTimerRef.current) clearTimeout(modalCloseTimerRef.current);
      if (lightboxCloseTimerRef.current) clearTimeout(lightboxCloseTimerRef.current);
    };
  }, []);

  // Lock body scroll when modal or lightbox is open
  useEffect(() => {
    if (modalOpen || lightboxOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [modalOpen, lightboxOpen]);

  const openModal = () => {
    if (modalCloseTimerRef.current) clearTimeout(modalCloseTimerRef.current);
    setIsModalClosing(false);
    setActiveImageIndex(0);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isModalClosing) return;
    setIsModalClosing(true);
    modalCloseTimerRef.current = setTimeout(() => {
      setModalOpen(false);
      setIsModalClosing(false);
      cardRef.current?.focus();
    }, 190);
  };

  const openLightbox = () => {
    if (lightboxCloseTimerRef.current) clearTimeout(lightboxCloseTimerRef.current);
    setIsLightboxClosing(false);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    if (isLightboxClosing) return;
    setIsLightboxClosing(true);
    lightboxCloseTimerRef.current = setTimeout(() => {
      setLightboxOpen(false);
      setIsLightboxClosing(false);
    }, 190);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxOpen && !isLightboxClosing) {
          closeLightbox();
        } else if (modalOpen && !isModalClosing) {
          closeModal();
        }
      }
      if (modalOpen && !lightboxOpen && !isModalClosing) {
        if (e.key === 'ArrowRight') {
          setActiveImageIndex((prev) => (prev + 1) % project.screenshots.length);
        } else if (e.key === 'ArrowLeft') {
          setActiveImageIndex((prev) => (prev - 1 + project.screenshots.length) % project.screenshots.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, lightboxOpen, isModalClosing, isLightboxClosing, project.screenshots.length]);

  const currentScreenshot = project.screenshots[activeImageIndex] || project.screenshots[0];
  const firstThumbnail = project.screenshots[0]?.url;

  return (
    <>
      {/* ===================== F1 STUDIO CASE STUDY CARD ===================== */}
      <Card3D
        ref={cardRef}
        index={index}
        isReducedMotion={isReducedMotion}
        role="button"
        tabIndex={0}
        onClick={openModal}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
          }
        }}
        aria-haspopup="dialog"
        aria-label={`Open case study for ${project.title}`}
        className="f1-card rounded-xl p-5 flex flex-col justify-between cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#E10600] text-left overflow-hidden"
      >
        {/* Top telemetry corner indicator */}
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden z-10">
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#E10600]/60 group-hover:border-[#E10600] transition-colors" />
        </div>

        <div>
          {/* Representative Thumbnail with Motorsport Framing */}
          {firstThumbnail && (
            <div className="relative w-full h-44 sm:h-48 rounded-lg overflow-hidden bg-[#0A0A0A] mb-4 border border-neutral-800 group-hover:border-[#E10600]/40 transition-colors">
              <img
                src={firstThumbnail}
                alt={project.screenshots[0]?.alt || `${project.title} screenshot`}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-104"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-90" />
              
              {/* Clean Telemetry Unboxed Overlay */}
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-tech text-[#FFFFFF] px-0.5">
                <span className="flex items-center gap-1.5 bg-[#0A0A0A]/90 px-2 py-0.5 rounded border border-neutral-700">
                  <Images className="w-3 h-3 text-[#E10600]" />
                  <span>{project.screenshots.length} Screenshots</span>
                </span>
                {project.isLocalOnly ? (
                  <span className="bg-[#0A0A0A]/90 border border-[#E10600]/50 text-[#E10600] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                    Local Testbed
                  </span>
                ) : (
                  <span className="bg-[#0A0A0A]/90 border border-neutral-700 text-neutral-300 px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">
                    Deployed
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Clean Unboxed Metadata Header */}
          <div className="text-[11px] font-tech font-bold uppercase tracking-widest text-[#E10600] mb-1.5 flex items-center justify-between">
            <span className="truncate">{project.category}</span>
            <span className="font-mono text-neutral-500">0{index + 1}</span>
          </div>

          {/* Project Title with Hipuku Text Scramble */}
          <TextScramble
            as="h3"
            text={project.title}
            triggerOnHover={true}
            externalTrigger={isHovered || isFocused}
            className="font-display text-xl sm:text-2xl font-bold text-[#FFFFFF] group-hover:text-[#E10600] transition-colors tracking-tight mb-2 block"
          />

          {/* Concise Overview */}
          <p className="font-body text-xs sm:text-sm text-neutral-300 leading-relaxed line-clamp-2 mb-4">
            {project.overview}
          </p>

          {/* Key Contribution Teaser */}
          <div className="text-xs text-neutral-400 font-body mb-4 pt-2.5">
            <span className="text-[#E10600] font-tech font-bold uppercase tracking-wider block text-[10px] mb-0.5">
              My Contribution
            </span>
            <p className="line-clamp-2 text-neutral-300">{project.myContribution}</p>
          </div>
        </div>

        {/* Card Footer: Tech tags preview & click prompt */}
        <div className="pt-3 flex items-center justify-between text-xs font-tech">
          <div className="flex flex-wrap gap-1 max-w-[65%] overflow-hidden h-6">
            {project.technologies.slice(0, 3).map((item) => (
              <span 
                key={item}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] font-semibold text-neutral-300 border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
              >
                {item}
              </span>
            ))}
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-[#E10600] flex items-center gap-1 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
            <span>Case Study</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Card3D>

      {/* ===================== FULL MOTORSPORT CASE STUDY MODAL ===================== */}
      {modalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto ${
            isModalClosing ? 'animate-modal-out' : 'animate-modal-in'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`project-dialog-title-${project.id}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div 
            className={`f1-modal-surface rounded-xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] flex flex-col overflow-hidden text-left ${
              isModalClosing ? 'animate-modal-out' : 'animate-modal-in'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Red racing stripe */}
            <div className="absolute top-0 inset-x-0 h-1 bg-[#E10600]" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3.5 shrink-0 relative z-10 pt-1">
              <div>
                <div className="text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-1">
                  {project.category}
                </div>
                <h2 
                  id={`project-dialog-title-${project.id}`}
                  className="font-display text-2xl sm:text-3xl font-bold text-[#FFFFFF]"
                >
                  {project.title}
                </h2>
              </div>

              {/* Close Button */}
              <button
                onClick={closeModal}
                className="p-1.5 rounded bg-[#1A1A1A] border border-neutral-700 hover:border-[#E10600] hover:text-[#E10600] text-neutral-300 transition-all active:scale-95 focus:outline-hidden focus:ring-1 focus:ring-[#E10600] cursor-pointer"
                aria-label="Close project case study"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto py-4 space-y-6 pr-1 text-[#FFFFFF] relative z-10">
              
              {/* Screenshots Gallery */}
              {project.screenshots && project.screenshots.length > 0 && (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden bg-[#0A0A0A] border border-neutral-800 flex items-center justify-center min-h-[220px] max-h-[380px] shadow-inner">
                    <img
                      src={currentScreenshot.url}
                      alt={currentScreenshot.alt}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto max-h-[380px] object-contain mx-auto cursor-zoom-in"
                      onClick={openLightbox}
                      title="Click to inspect full screenshot"
                    />

                    {/* Enlarge Trigger */}
                    <button
                      onClick={openLightbox}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded bg-[#0A0A0A]/90 text-[#FFFFFF] border border-neutral-700 hover:text-[#E10600] hover:border-[#E10600] transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
                      title="Inspect full image"
                      aria-label="Inspect screenshot full size"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Left/Right Arrows */}
                    {project.screenshots.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) => (prev - 1 + project.screenshots.length) % project.screenshots.length);
                          }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#0A0A0A]/90 text-[#FFFFFF] border border-neutral-700 hover:border-[#E10600] hover:text-[#E10600] transition-all active:scale-90 shadow-md cursor-pointer"
                          aria-label="Previous screenshot"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) => (prev + 1) % project.screenshots.length);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#0A0A0A]/90 text-[#FFFFFF] border border-neutral-700 hover:border-[#E10600] hover:text-[#E10600] transition-all active:scale-90 shadow-md cursor-pointer"
                          aria-label="Next screenshot"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Caption & Thumbnails */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-tech pt-1">
                    <span className="text-neutral-300 font-semibold">
                      {currentScreenshot.caption} ({activeImageIndex + 1} of {project.screenshots.length})
                    </span>

                    {project.screenshots.length > 1 && (
                      <div className="flex items-center gap-2">
                        {project.screenshots.map((s, idx) => (
                          <button
                            key={s.url}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`w-12 h-8 rounded border overflow-hidden transition-all active:scale-95 cursor-pointer ${
                              activeImageIndex === idx 
                                ? 'border-[#E10600] ring-2 ring-[#E10600]/40 scale-105' 
                                : 'border-neutral-800 opacity-60 hover:opacity-100'
                            }`}
                            aria-label={`Select screenshot ${idx + 1}`}
                          >
                            <img src={s.url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 1. Concise Overview */}
              <div>
                <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-[#E10600] mb-1.5">
                  Project Overview
                </h4>
                <p className="font-body text-sm sm:text-base text-neutral-200 leading-relaxed">
                  {project.overview}
                </p>
              </div>

              {/* 2. Problem Addressed */}
              <div className="p-4 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-[#E10600] uppercase tracking-wider mb-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Problem Addressed</span>
                </div>
                <p className="font-body text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {project.problem}
                </p>
              </div>

              {/* 3. Technical Approach & Important Features */}
              <div>
                <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-[#E10600] mb-2">
                  Approach & Engineering Highlights
                </h4>
                <div className="space-y-2">
                  {project.approach.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-300 font-body">
                      <span className="text-[#E10600] font-bold text-xs mt-0.5">·</span>
                      <p className="leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Personal Contribution */}
              <div className="p-4 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-[#FFFFFF] uppercase tracking-wider mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E10600]" />
                  <span>My Contribution</span>
                </div>
                <p className="font-body text-xs sm:text-sm text-neutral-200 leading-relaxed">
                  {project.myContribution}
                </p>
              </div>

              {/* 5. Technologies & Tools */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-[#E10600] uppercase tracking-wider mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Technologies & Frameworks</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-tech text-[#FFFFFF] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                    >
                      {t}
                    </span>
                  ))}
                  {project.toolsExplored?.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-[#E10600]/30 text-xs font-tech text-[#E10600] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* 6. Challenges & Lessons Learned */}
              <div className="p-4 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-[#E10600] uppercase tracking-wider mb-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Engineering Challenges & Solutions</span>
                </div>
                <p className="font-body text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {project.challenges}
                </p>
              </div>

              {/* 7. Outcome / Result */}
              {project.outcome && (
                <div>
                  <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-[#E10600] mb-1.5">
                    Outcome
                  </h4>
                  <p className="font-body text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {project.outcome}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer with Verified Working Links */}
            <div className="pt-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                {project.links && project.links.length > 0 ? (
                  project.links.map((link) => {
                    if (link.type === 'github') {
                      return (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.1] hover:border-[#E10600]/60 hover:text-[#E10600] text-xs font-tech font-bold tracking-wider text-[#FFFFFF] transition-all active:scale-95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
                        >
                          <Github className="w-3.5 h-3.5 text-[#E10600]" />
                          <span>{link.label}</span>
                          <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                        </a>
                      );
                    }
                    if (link.type === 'demo') {
                      return (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="f1-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-tech font-bold tracking-wider uppercase transition-all"
                        >
                          <Monitor className="w-3.5 h-3.5" />
                          <span>{link.label}</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      );
                    }
                    return null;
                  })
                ) : (
                  <span className="text-xs font-tech text-neutral-400 italic">
                    {project.isLocalOnly ? 'Available as local build / personal testbed' : 'Work in progress'}
                  </span>
                )}
              </div>

              <button
                onClick={closeModal}
                className="px-4 py-1.5 rounded bg-[#181818] border border-neutral-700 hover:border-neutral-500 text-xs font-tech font-bold tracking-wider uppercase text-[#FFFFFF] transition-all active:scale-95 cursor-pointer"
              >
                Close Case Study
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ENLARGED LIGHTBOX VIEW ===================== */}
      {lightboxOpen && currentScreenshot && (
        <div
          className={`fixed inset-0 z-60 flex flex-col items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md ${
            isLightboxClosing ? 'animate-modal-out' : 'animate-modal-in'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged screenshot preview"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
            <span className="text-xs font-tech text-[#E10600] bg-[#121212] px-3 py-1 rounded border border-neutral-800">
              {currentScreenshot.caption}
            </span>
            <button
              onClick={closeLightbox}
              className="p-2 rounded bg-[#1A1A1A] text-[#FFFFFF] hover:text-[#E10600] border border-neutral-700 transition-all active:scale-95 cursor-pointer"
              aria-label="Close enlarged preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div 
            className={`max-w-5xl max-h-[85vh] w-full flex items-center justify-center p-2 relative ${
              isLightboxClosing ? 'animate-modal-out' : 'animate-modal-in'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentScreenshot.url}
              alt={currentScreenshot.alt}
              referrerPolicy="no-referrer"
              className="max-h-[82vh] max-w-full object-contain rounded-lg shadow-2xl border border-neutral-800 bg-[#0A0A0A]"
            />
          </div>

          <p className="mt-3 text-xs font-tech text-neutral-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[#181818] text-[#E10600] border border-neutral-700">Esc</kbd> or click outside to exit
          </p>
        </div>
      )}
    </>
  );
};
