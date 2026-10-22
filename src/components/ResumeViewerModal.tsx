import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck,
  Maximize2
} from 'lucide-react';

interface ResumeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isReducedMotion?: boolean;
}

export const ResumeViewerModal: React.FC<ResumeViewerModalProps> = ({
  isOpen,
  onClose,
  isReducedMotion = false
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const pdfUrl = '/Rophe_Angel_Resume.pdf';
  const pdfFilename = 'Rophe_Angel_Resume.pdf';

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/92 backdrop-blur-xl ${
        isClosing ? 'animate-modal-out' : 'animate-modal-in'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={modalRef}
        className={`f1-modal-surface rounded-2xl w-full max-w-5xl h-[92vh] max-h-[960px] flex flex-col overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(225,6,0,0.18)] relative border border-white/15 text-white ${
          isClosing ? 'animate-modal-out' : 'animate-modal-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Ferrari Racing Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#E10600] to-transparent z-20" />

        {/* ================= MODAL HEADER BAR ================= */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-white/[0.08] bg-[#0c0c0e]/95 flex flex-wrap items-center justify-between gap-3 relative z-10">
          
          {/* Left: Back Action & Document Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-[#E10600]/60 text-neutral-300 hover:text-white text-xs font-tech font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 focus:outline-hidden focus:ring-1 focus:ring-[#E10600]"
              aria-label="Back to Portfolio"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#E10600]" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E10600] shadow-[0_0_6px_rgba(225,6,0,0.9)]" />
                <h2 
                  id="resume-modal-title"
                  className="font-display text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2"
                >
                  <span>Rophe Angel — Official Resume</span>
                </h2>
              </div>
              <span className="font-mono text-[10px] sm:text-[11px] text-neutral-400">
                ROPHE_ANGEL_RESUME.PDF · 131 KB · VERIFIED DOSSIER
              </span>
            </div>
          </div>

          {/* Right: Actions (Download PDF, Open in New Tab, Close X) */}
          <div className="flex items-center gap-2 sm:gap-2.5 ml-auto">
            {/* Primary Download Action */}
            <a
              href={pdfUrl}
              download={pdfFilename}
              className="f1-btn-primary px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-tech font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-[0_2px_12px_rgba(225,6,0,0.4)] focus:outline-hidden focus:ring-2 focus:ring-[#E10600]"
              aria-label="Download Resume PDF directly"
              title="Download original PDF directly"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>

            {/* Open in New Window Tab */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:px-3 sm:py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/30 text-neutral-300 hover:text-white text-xs font-tech font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-white"
              title="Open PDF in new tab"
              aria-label="Open PDF in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
              <span className="hidden md:inline">Open Tab</span>
            </a>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-[#141416] hover:bg-[#1f1f24] border border-white/10 hover:border-[#E10600]/60 text-neutral-300 hover:text-[#E10600] transition-all cursor-pointer active:scale-95 focus:outline-hidden focus:ring-1 focus:ring-[#E10600]"
              aria-label="Close resume viewer"
              title="Close [Esc]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= SUB-HEADER TELEMETRY BAR ================= */}
        <div className="px-4 py-1.5 sm:px-6 bg-[#08080a] border-b border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-bold uppercase tracking-wider text-[10px]">SOURCE OF TRUTH</span>
            </span>
            <span className="hidden sm:inline text-neutral-600">/</span>
            <span className="hidden sm:inline text-neutral-400 text-[10px]">
              Computer Science & Engineering · AI Systems · Venture Founder
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://linkjar.to/b0d41eec/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-neutral-400 hover:text-[#E10600] flex items-center gap-1 transition-colors"
              title="View on Linkjar mirror"
            >
              <span>Linkjar Mirror</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span className="text-neutral-600 hidden sm:inline">|</span>
            <span className="font-tech text-neutral-400 text-[11px] hidden sm:inline">
              100% VECTOR CLARITY
            </span>
          </div>
        </div>

        {/* ================= PDF VIEWER DISPLAY CONTAINER ================= */}
        <div className="flex-1 w-full bg-[#141418] relative overflow-hidden flex flex-col">
          {/* Main Embedded PDF Frame */}
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
            className="w-full flex-1 border-0 bg-[#222226]"
            title="Rophe Angel Resume"
          />

          {/* Bottom Bar: Mobile Quick Fallback & Status */}
          <div className="px-4 py-2 sm:px-6 bg-[#0a0a0c] border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs font-tech">
            <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
              <FileText className="w-3.5 h-3.5 text-[#E10600]" />
              <span>Full 1-page resume with education, technical skillsets, ventures, and contact telemetries.</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <a
                href={pdfUrl}
                download={pdfFilename}
                className="text-xs font-tech font-bold uppercase tracking-wider text-[#E10600] hover:text-white flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Save to Device</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
