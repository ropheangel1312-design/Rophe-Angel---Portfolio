import React, { useState, useEffect, useRef } from 'react';
import { ProjectItem } from '../types';
import { 
  ExternalLink, 
  Github, 
  Monitor, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  UserCheck, 
  Layers, 
  Wrench,
  Images
} from 'lucide-react';

interface ProjectCardProps {
  project: ProjectItem;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isLightboxClosing, setIsLightboxClosing] = useState(false);
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
    }, 220);
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
    }, 220);
  };

  // Handle Escape key to close modal/lightbox and restore focus
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
      {/* Compact Main Page Project Card with Liquid Glass Finish */}
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        onClick={openModal}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
          }
        }}
        aria-haspopup="dialog"
        aria-label={`Open details for project ${project.title}`}
        className="seance-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#AFA0FF]/70 group relative overflow-hidden cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#AFA0FF]"
      >
        <div>
          {/* Representative Thumbnail */}
          {firstThumbnail && (
            <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden bg-[#101626] mb-3.5 border border-[#A8E6D4]/20 group-hover:border-[#AFA0FF]/40 transition-colors">
              <img
                src={firstThumbnail}
                alt={project.screenshots[0]?.alt || `${project.title} preview`}
                loading="lazy"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101626]/85 via-transparent to-transparent" />
              
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-tech font-bold text-[#F7F0E6]/90 px-1">
                <span className="flex items-center gap-1 bg-[#101626]/80 px-2 py-0.5 rounded-md border border-[#A8E6D4]/30 backdrop-blur-xs">
                  <Images className="w-3 h-3 text-[#A8E6D4]" />
                  <span>{project.screenshots.length} Screenshots</span>
                </span>
                {project.isLocalOnly && (
                  <span className="bg-[#101626]/85 border border-[#F6B86F]/50 text-[#F6B86F] px-2 py-0.5 rounded-md tracking-wide backdrop-blur-xs">
                    Local / Preview
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Category Tag */}
          <div className="text-[11px] font-tech font-bold uppercase tracking-wider text-[#A8E6D4] mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A8E6D4] group-hover:bg-[#AFA0FF] transition-colors" />
            <span className="truncate">{project.category}</span>
          </div>

          {/* Project Title */}
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F7F0E6] group-hover:text-[#AFA0FF] transition-colors tracking-tight mb-2">
            {project.title}
          </h3>

          {/* Short Description */}
          <p className="font-body text-xs sm:text-sm text-[#F7F0E6]/80 leading-relaxed line-clamp-3 mb-4">
            {project.description}
          </p>
        </div>

        {/* Card Footer: Tech tags preview & click prompt */}
        <div className="pt-3 border-t border-[#A8E6D4]/15 flex items-center justify-between text-xs font-tech">
          <div className="flex flex-wrap gap-1 max-w-[70%] overflow-hidden h-6">
            {(project.technologies || project.toolsExplored)?.slice(0, 3).map((item) => (
              <span 
                key={item}
                className="px-2 py-0.5 rounded-md bg-[#101626] text-[10px] font-semibold text-[#F7F0E6]/75 border border-[#A8E6D4]/20"
              >
                {item}
              </span>
            ))}
          </div>

          <span className="text-xs font-bold text-[#AFA0FF] group-hover:text-[#A8E6D4] flex items-center gap-1 transition-colors">
            <span>View Details</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </span>
        </div>
      </div>

      {/* ===================== POLISHED LIQUID GLASS PROJECT DETAILS MODAL ===================== */}
      {modalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto ${
            isModalClosing ? 'animate-glass-backdrop-out' : 'animate-glass-backdrop-in'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`project-dialog-title-${project.id}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div 
            className={`liquid-glass-modal-surface rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col overflow-hidden text-left ${
              isModalClosing ? 'animate-glass-modal-out' : 'animate-glass-modal-in'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle glossy reflection highlight overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-white/[0.015] to-transparent pointer-events-none rounded-2xl" />
            <div className="absolute -top-24 -left-24 w-72 h-48 bg-gradient-to-br from-white/10 to-transparent rotate-12 pointer-events-none rounded-full blur-xl" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#A8E6D4]/20 shrink-0 relative z-10 animate-stagger-1">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-tech font-bold uppercase tracking-wider text-[#A8E6D4]">
                    {project.category}
                  </span>
                  {project.isLocalOnly && (
                    <span className="text-[10px] font-tech font-bold uppercase px-2 py-0.5 rounded-md bg-[#101626] border border-[#F6B86F]/40 text-[#F6B86F]">
                      Local / Preview
                    </span>
                  )}
                </div>
                <h2 
                  id={`project-dialog-title-${project.id}`}
                  className="font-display text-2xl sm:text-3xl font-bold text-[#F7F0E6]"
                >
                  {project.title}
                </h2>
              </div>

              {/* Close Button */}
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg bg-[#101626]/80 border border-[#A8E6D4]/30 hover:border-[#AFA0FF] hover:text-[#AFA0FF] text-[#F7F0E6]/80 transition-all active:scale-95 focus:outline-hidden focus:ring-1 focus:ring-[#AFA0FF] cursor-pointer"
                aria-label="Close project details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto py-4 space-y-5 pr-1 text-[#F7F0E6] relative z-10">
              
              {/* Screenshot Gallery with Dual Image Navigation */}
              {project.screenshots && project.screenshots.length > 0 && (
                <div className="space-y-2 animate-stagger-2">
                  <div className="relative rounded-xl overflow-hidden bg-[#101626]/90 border border-[#A8E6D4]/30 group/gallery flex items-center justify-center min-h-[220px] max-h-[360px] shadow-inner">
                    <img
                      src={currentScreenshot.url}
                      alt={currentScreenshot.alt}
                      className="w-full h-auto max-h-[360px] object-contain mx-auto cursor-zoom-in"
                      onClick={openLightbox}
                      title="Click to view full-size image"
                    />

                    {/* Enlarge Hint Button */}
                    <button
                      onClick={openLightbox}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-[#101626]/85 text-[#F7F0E6] border border-[#A8E6D4]/40 hover:text-[#AFA0FF] hover:border-[#AFA0FF] transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
                      title="Enlarge screenshot"
                      aria-label="Enlarge screenshot"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Next / Previous Controls */}
                    {project.screenshots.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) => (prev - 1 + project.screenshots.length) % project.screenshots.length);
                          }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#101626]/85 text-[#F7F0E6] border border-[#A8E6D4]/30 hover:border-[#AFA0FF] hover:text-[#AFA0FF] transition-all active:scale-90 shadow-md cursor-pointer backdrop-blur-xs"
                          aria-label="Previous screenshot"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) => (prev + 1) % project.screenshots.length);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#101626]/85 text-[#F7F0E6] border border-[#A8E6D4]/30 hover:border-[#AFA0FF] hover:text-[#AFA0FF] transition-all active:scale-90 shadow-md cursor-pointer backdrop-blur-xs"
                          aria-label="Next screenshot"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Caption & Thumbnail Selector */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-tech pt-1">
                    <span className="text-[#A8E6D4] font-semibold">
                      {currentScreenshot.caption} ({activeImageIndex + 1} of {project.screenshots.length})
                    </span>

                    {/* Thumbnail selector buttons */}
                    {project.screenshots.length > 1 && (
                      <div className="flex items-center gap-2">
                        {project.screenshots.map((s, idx) => (
                          <button
                            key={s.url}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`w-12 h-8 rounded-md border overflow-hidden transition-all active:scale-95 cursor-pointer ${
                              activeImageIndex === idx 
                                ? 'border-[#AFA0FF] ring-2 ring-[#AFA0FF]/50 scale-105' 
                                : 'border-[#A8E6D4]/30 opacity-60 hover:opacity-100'
                            }`}
                            aria-label={`Select screenshot ${idx + 1}: ${s.caption}`}
                          >
                            <img src={s.url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="animate-stagger-3">
                <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-[#A8E6D4] mb-1.5">
                  Project Overview
                </h4>
                <p className="font-body text-sm sm:text-base text-[#F7F0E6]/90 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* My Contribution */}
              <div className="p-3.5 rounded-xl bg-[#101626]/80 border border-[#AFA0FF]/30 shadow-xs animate-stagger-4">
                <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-[#AFA0FF] uppercase tracking-wider mb-1.5">
                  <UserCheck className="w-4 h-4 text-[#AFA0FF]" />
                  <span>My Contribution</span>
                </div>
                <p className="font-body text-xs sm:text-sm text-[#F7F0E6]/85 leading-relaxed">
                  {project.myContribution}
                </p>
              </div>

              {/* Technology Information */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="animate-stagger-5">
                  <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-[#A8E6D4] uppercase tracking-wider mb-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Technologies & Tools</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-md bg-[#101626]/90 border border-[#A8E6D4]/30 text-xs font-tech text-[#F7F0E6]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools Explored */}
              {project.toolsExplored && project.toolsExplored.length > 0 && (
                <div className="animate-stagger-5">
                  <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-[#F6B86F] uppercase tracking-wider mb-2">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Tools Explored</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.toolsExplored.map((tool) => (
                      <span
                        key={tool}
                        className="px-2.5 py-1 rounded-md bg-[#101626]/90 border border-[#F6B86F]/40 text-xs font-tech text-[#F6B86F]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer with Verified Links */}
            <div className="pt-3 border-t border-[#A8E6D4]/20 flex flex-wrap items-center justify-between gap-3 shrink-0 relative z-10 animate-stagger-5">
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
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#101626] border border-[#A8E6D4]/40 hover:border-[#AFA0FF] hover:text-[#AFA0FF] text-xs font-tech font-bold tracking-wider text-[#F7F0E6] transition-all active:scale-95"
                        >
                          <Github className="w-3.5 h-3.5" />
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
                          className="liquid-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-tech font-bold tracking-wider uppercase transition-all"
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
                  <span className="text-xs font-tech text-[#F7F0E6]/60 italic">
                    {project.isLocalOnly ? 'Available as local build / preview only' : 'Project in development'}
                  </span>
                )}
              </div>

              <button
                onClick={closeModal}
                className="px-4 py-1.5 rounded-lg bg-[#101626]/80 border border-[#A8E6D4]/30 hover:border-[#A8E6D4] text-xs font-tech font-bold tracking-wide text-[#F7F0E6] transition-all active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ENLARGED LIQUID GLASS LIGHTBOX VIEW ===================== */}
      {lightboxOpen && currentScreenshot && (
        <div
          className={`fixed inset-0 z-60 flex flex-col items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-md ${
            isLightboxClosing ? 'animate-glass-backdrop-out' : 'animate-glass-backdrop-in'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged screenshot preview"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
            <span className="text-xs font-tech text-[#A8E6D4] bg-[#101626]/85 px-2.5 py-1 rounded-md border border-[#A8E6D4]/30 backdrop-blur-xs">
              {currentScreenshot.caption}
            </span>
            <button
              onClick={closeLightbox}
              className="p-2 rounded-lg bg-[#101626]/90 text-[#F7F0E6] hover:text-[#AFA0FF] border border-[#A8E6D4]/40 transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
              aria-label="Close enlarged preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div 
            className={`max-w-5xl max-h-[85vh] w-full flex items-center justify-center p-2 relative ${
              isLightboxClosing ? 'animate-glass-modal-out' : 'animate-glass-modal-in'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentScreenshot.url}
              alt={currentScreenshot.alt}
              className="max-h-[82vh] max-w-full object-contain rounded-xl shadow-2xl border border-[#A8E6D4]/40 bg-[#101626]"
            />
          </div>

          <p className="mt-3 text-xs font-tech text-[#F7F0E6]/70">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[#101626] text-[#AFA0FF] border border-[#A8E6D4]/30">Esc</kbd> or click outside to return
          </p>
        </div>
      )}
    </>
  );
};
