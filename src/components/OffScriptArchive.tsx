import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Headphones
} from 'lucide-react';
import { TextScramble } from './TextScramble';
import { domainAudio } from '../utils/audio';

export interface ArchiveCardItem {
  id: string;
  collection: 'grandstand' | 'on-repeat';
  title: string;
  subtitle: string;
  imageUrl?: string;
  fallbackUrl?: string;
  isQuoteOnly?: boolean;
  quote?: string;
}

// 01 — THE GRANDSTAND
// Quote displayed exactly once in dedicated quote-only card, followed by the 5 items.
const GRANDSTAND_ITEMS: ArchiveCardItem[] = [
  {
    id: 'grandstand-quote',
    collection: 'grandstand',
    title: '',
    subtitle: '',
    isQuoteOnly: true,
    quote: '“If through goes Hamilton, then so can you!”'
  },
  {
    id: 'grandstand-ferrari',
    collection: 'grandstand',
    title: 'Ferrari',
    subtitle: 'F1 Team',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/DM6NX1g9Qh7b3QWLEtse/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/DM6NX1g9Qh7b3QWLEtse'
  },
  {
    id: 'grandstand-hamilton',
    collection: 'grandstand',
    title: 'Lewis Hamilton',
    subtitle: 'F1 Driver',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/3WqZGt1Q1FUXDVokZg99/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/3WqZGt1Q1FUXDVokZg99'
  },
  {
    id: 'grandstand-barcelona',
    collection: 'grandstand',
    title: 'FC Barcelona',
    subtitle: 'Football Team',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/Qp4CXb0EgEnDvX9GkYIk/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/Qp4CXb0EgEnDvX9GkYIk'
  },
  {
    id: 'grandstand-haaland',
    collection: 'grandstand',
    title: 'Erling Haaland',
    subtitle: 'Football Player',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/IxXtIYnR3oOLUNVQyPyJ/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/IxXtIYnR3oOLUNVQyPyJ'
  },
  {
    id: 'grandstand-abu-dhabi',
    collection: 'grandstand',
    title: '2021 Abu Dhabi GP',
    subtitle: 'Favourite Race',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/b8DFdxbOGUKWfF2POs57/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/b8DFdxbOGUKWfF2POs57'
  }
];

// 02 — ON REPEAT
// Malcolm Todd, Ado, YOASOBI, Rosa Walton song, Dean Martin song with exact images.
const ON_REPEAT_ITEMS: ArchiveCardItem[] = [
  {
    id: 'repeat-malcolm-todd',
    collection: 'on-repeat',
    title: 'Malcolm Todd',
    subtitle: 'Artist',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/TF1ANMDjOQGJ4bLPXtdD/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/TF1ANMDjOQGJ4bLPXtdD'
  },
  {
    id: 'repeat-ado',
    collection: 'on-repeat',
    title: 'Ado',
    subtitle: 'Artist',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/JAxjsGXdfII7xuMHBPtM/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/JAxjsGXdfII7xuMHBPtM'
  },
  {
    id: 'repeat-yoasobi',
    collection: 'on-repeat',
    title: 'YOASOBI',
    subtitle: 'Artist',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/AWvqxVgYwI46jMpNRfgc/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/AWvqxVgYwI46jMpNRfgc'
  },
  {
    id: 'repeat-rosa-walton',
    collection: 'on-repeat',
    title: 'I Really Want to Stay at Your House',
    subtitle: 'Rosa Walton',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/kCn0CIz4YAbW9AQt8Efm/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/kCn0CIz4YAbW9AQt8Efm'
  },
  {
    id: 'repeat-dean-martin',
    collection: 'on-repeat',
    title: 'Everybody Loves Somebody',
    subtitle: 'Dean Martin',
    imageUrl: 'https://plain-apac-prod-public.komododecks.com/202610/22/zsrizpVYSX0ADt9Z0kjj/image.jpg',
    fallbackUrl: 'https://kommodo.ai/i/zsrizpVYSX0ADt9Z0kjj'
  }
];

interface LiquidGlassCardProps {
  item: ArchiveCardItem;
  isReducedMotion: boolean;
  onCardClick: (item: ArchiveCardItem) => void;
}

const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({ item, isReducedMotion, onCardClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({
    rotX: 0,
    rotY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isReducedMotion || e.pointerType === 'touch') return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const relX = (e.clientX - rect.left) / rect.width; // 0 to 1
    const relY = (e.clientY - rect.top) / rect.height; // 0 to 1

    const rotX = (0.5 - relY) * 18; // -9deg to +9deg
    const rotY = (relX - 0.5) * 18; // -9deg to +9deg

    setTilt({
      rotX,
      rotY,
      glareX: Math.round(relX * 100),
      glareY: Math.round(relY * 100),
      isHovered: true
    });
  };

  const handlePointerLeave = () => {
    setTilt({
      rotX: 0,
      rotY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false
    });
  };

  // Dedicated Quote-Only Card:
  // Strictly only the quote — no image, heading, label, icon, or other text.
  if (item.isQuoteOnly) {
    return (
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="w-[230px] sm:w-[260px] md:w-[280px] aspect-[4/5] rounded-2xl relative overflow-hidden shrink-0 transition-all duration-300 select-none flex items-center justify-center p-6 sm:p-8"
        style={{
          perspective: '1200px',
          transform: tilt.isHovered && !isReducedMotion
            ? `perspective(1200px) rotateX(${tilt.rotX.toFixed(2)}deg) rotateY(${tilt.rotY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`
            : 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
          transition: tilt.isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out, border-color 0.3s, box-shadow 0.3s',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: tilt.isHovered ? '#E10600' : 'rgba(255, 255, 255, 0.12)',
          boxShadow: tilt.isHovered
            ? '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(225,6,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2)'
            : '0 15px 40px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.1)'
        }}
      >
        {/* Subtle Ambient Red Core Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[radial-gradient(circle,_rgba(225,6,0,0.18)_0%,_transparent_70%)] pointer-events-none" />

        {/* Dynamic Liquid-Glass Glare Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 z-10"
          style={{
            opacity: tilt.isHovered ? 1 : 0,
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 45%, transparent 70%)`
          }}
        />

        {/* The Quote — Strictly ONLY the quote text */}
        <p className="relative z-20 font-display text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug text-center">
          {item.quote}
        </p>
      </div>
    );
  }

  // Regular Card:
  // Contains ONLY its relevant image and essential identifying text (Title + Category/Subtitle).
  return (
    <div
      ref={cardRef}
      onClick={() => onCardClick(item)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="w-[230px] sm:w-[260px] md:w-[280px] aspect-[4/5] rounded-2xl relative overflow-hidden shrink-0 cursor-pointer transition-all duration-300 select-none flex flex-col justify-end p-5 group"
      style={{
        perspective: '1200px',
        transform: tilt.isHovered && !isReducedMotion
          ? `perspective(1200px) rotateX(${tilt.rotX.toFixed(2)}deg) rotateY(${tilt.rotY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`
          : 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transformStyle: 'preserve-3d',
        transition: tilt.isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out, border-color 0.3s, box-shadow 0.3s',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: tilt.isHovered ? '#E10600' : 'rgba(255, 255, 255, 0.12)',
        boxShadow: tilt.isHovered
          ? '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(225,6,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2)'
          : '0 15px 40px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.1)'
      }}
    >
      {/* Artwork Image Container */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <img
          src={item.imageUrl}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (item.fallbackUrl && target.src !== item.fallbackUrl) {
              target.src = item.fallbackUrl;
            }
          }}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none brightness-90 group-hover:brightness-100"
        />
        {/* Editorial Legibility Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Dynamic Liquid-Glass Glare Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 z-10"
        style={{
          opacity: tilt.isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 45%, transparent 70%)`
        }}
      />

      {/* Essential Identifying Text Only */}
      <div className="relative z-20">
        <div className="text-[11px] font-mono text-[#E10600] font-semibold tracking-wide uppercase mb-0.5">
          {item.subtitle}
        </div>
        <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
          {item.title}
        </h3>
      </div>
    </div>
  );
};

interface OffScriptArchiveProps {
  isReducedMotion: boolean;
}

export const OffScriptArchive: React.FC<OffScriptArchiveProps> = ({ isReducedMotion }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [activeCollection, setActiveCollection] = useState<'grandstand' | 'on-repeat'>('grandstand');
  const [expandedItem, setExpandedItem] = useState<ArchiveCardItem | null>(null);
  const [isAudioSectionActive, setIsAudioSectionActive] = useState<boolean>(false);

  // Drag interaction refs
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftStartRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);

  // --------------------------------------------------------------------------
  // DEDICATED SECTION BACKGROUND MUSIC (Crossfading with Main BGM)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let isSectionCurrentlyActive = false;

    const checkVisibility = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // Active when viewport middle overlaps section
      const inView = rect.top < vh * 0.70 && rect.bottom > vh * 0.30;
      if (inView !== isSectionCurrentlyActive) {
        isSectionCurrentlyActive = inView;
        setIsAudioSectionActive(inView);
        domainAudio.setOffScriptSectionActive(inView);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const vh = window.innerHeight;
        const rect = entry.boundingClientRect;
        const inView = rect.top < vh * 0.70 && rect.bottom > vh * 0.30;
        if (inView !== isSectionCurrentlyActive) {
          isSectionCurrentlyActive = inView;
          setIsAudioSectionActive(inView);
          domainAudio.setOffScriptSectionActive(inView);
        }
      },
      { threshold: [0, 0.2, 0.5, 0.8, 1] }
    );

    observer.observe(el);

    window.addEventListener('scroll', checkVisibility, { passive: true });
    checkVisibility();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', checkVisibility);
      domainAudio.setOffScriptSectionActive(false);
    };
  }, []);

  // --------------------------------------------------------------------------
  // TRACK SCROLL & COLLECTION SYNC
  // --------------------------------------------------------------------------
  const updateActiveCollectionFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const repeatAnchor = track.querySelector('[data-collection-anchor="on-repeat"]') as HTMLElement | null;
    if (!repeatAnchor) return;

    // If scrollLeft reaches near On Repeat anchor, highlight On Repeat
    const threshold = repeatAnchor.offsetLeft - 120;
    if (track.scrollLeft >= threshold) {
      setActiveCollection('on-repeat');
    } else {
      setActiveCollection('grandstand');
    }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScroll = () => {
      updateActiveCollectionFromScroll();
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, [updateActiveCollectionFromScroll]);

  // Convert vertical wheel to horizontal scroll inside reel without trapping page at boundaries
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) return;

    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

    const atStart = track.scrollLeft <= 2 && e.deltaY < 0;
    const atEnd = track.scrollLeft >= maxScroll - 2 && e.deltaY > 0;

    if (atStart || atEnd) return;

    e.preventDefault();
    track.scrollLeft += e.deltaY * 1.15;
  };

  // Pointer drag interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftStartRef.current = track.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;

    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 6) {
      hasMovedRef.current = true;
    }
    track.scrollLeft = scrollLeftStartRef.current - dx;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Scroll to designated collection anchor milestone
  const scrollToCollection = (coll: 'grandstand' | 'on-repeat') => {
    const track = trackRef.current;
    if (!track) return;

    const targetEl = track.querySelector(`[data-collection-anchor="${coll}"]`);
    if (targetEl) {
      const elLeft = (targetEl as HTMLElement).offsetLeft;
      track.scrollTo({
        left: elLeft - 24,
        behavior: isReducedMotion ? 'auto' : 'smooth'
      });
      setActiveCollection(coll);
    }
  };

  // Step scroll buttons
  const scrollStep = (direction: 'left' | 'right') => {
    const track = trackRef.current;
    if (!track) return;
    const offset = direction === 'left' ? -340 : 340;
    track.scrollBy({ left: offset, behavior: isReducedMotion ? 'auto' : 'smooth' });
  };

  // Modal ESC listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedItem(null);
      }
    };
    if (expandedItem) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedItem]);

  const handleCardClick = (item: ArchiveCardItem) => {
    if (hasMovedRef.current) return;
    if (!item.isQuoteOnly) {
      setExpandedItem(item);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="off-script"
      className="relative w-full pt-10 pb-12 sm:pt-14 sm:pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 overflow-visible"
    >
      {/* ===================== SECTION HEADER ===================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-tech font-bold uppercase tracking-widest text-[#E10600] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.8)]" />
            <span>09 // OFF-SCRIPT ARCHIVE</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400 font-mono text-[11px]">PARALLAX REEL</span>
          </div>

          <TextScramble
            as="h2"
            text="OFF-SCRIPT ARCHIVE"
            triggerOnView={true}
            isReducedMotion={isReducedMotion}
            className="font-display text-3xl sm:text-5xl font-bold text-[#FFFFFF] tracking-tight block"
          />

          <p className="font-body text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Trackside loyalties and uncurated vinyl rotations. Scroll or drag across collections.
          </p>
        </div>

        {/* Audio Badge & Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div 
            className={`px-3 py-1.5 rounded-lg text-xs font-tech tracking-wider uppercase inline-flex items-center gap-2 border transition-colors ${
              isAudioSectionActive
                ? 'bg-[#E10600]/10 border-[#E10600]/40 text-[#FFFFFF]'
                : 'bg-white/[0.03] border-white/[0.08] text-neutral-400'
            }`}
          >
            <Headphones className={`w-3.5 h-3.5 ${isAudioSectionActive ? 'text-[#E10600] animate-pulse' : 'text-neutral-500'}`} />
            <span className="text-[11px] font-mono">
              {isAudioSectionActive ? 'OFF-SCRIPT AUDIO // ACTIVE' : 'OFF-SCRIPT AUDIO'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scrollStep('left')}
              aria-label="Scroll left in archive"
              className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollStep('right')}
              aria-label="Scroll right in archive"
              className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================== COLLECTION MILESTONE TABS (NO EMOJIS) ===================== */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => scrollToCollection('grandstand')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-tech font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeCollection === 'grandstand'
              ? 'bg-[#E10600] text-white shadow-[0_0_12px_rgba(225,6,0,0.4)] border border-[#E10600]'
              : 'bg-white/[0.04] text-neutral-400 hover:text-white border border-white/[0.08]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span>01 // THE GRANDSTAND</span>
        </button>

        <button
          onClick={() => scrollToCollection('on-repeat')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-tech font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeCollection === 'on-repeat'
              ? 'bg-[#E10600] text-white shadow-[0_0_12px_rgba(225,6,0,0.4)] border border-[#E10600]'
              : 'bg-white/[0.04] text-neutral-400 hover:text-white border border-white/[0.08]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span>02 // ON REPEAT</span>
        </button>

        <span className="text-[11px] font-mono text-neutral-500 ml-auto hidden sm:inline">
          Drag horizontally · Click card to inspect
        </span>
      </div>

      {/* ===================== HORIZONTAL SCROLL REEL ===================== */}
      <div
        ref={trackRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full overflow-x-auto overflow-y-hidden select-none cursor-grab active:cursor-grabbing pb-4 touch-pan-x scrollbar-none"
        style={{ scrollBehavior: isDraggingRef.current ? 'auto' : 'smooth' }}
      >
        <div className="inline-flex items-stretch gap-5 py-2">
          
          {/* ========================================================= */}
          {/* COLLECTION 01: THE GRANDSTAND                             */}
          {/* Dedicated Quote Card (only quote) + 5 Image Cards         */}
          {/* ========================================================= */}
          <div data-collection-anchor="grandstand" className="inline-flex items-stretch gap-5">
            {GRANDSTAND_ITEMS.map((item) => (
              <LiquidGlassCard
                key={item.id}
                item={item}
                isReducedMotion={isReducedMotion}
                onCardClick={handleCardClick}
              />
            ))}
          </div>

          {/* Clean Vertical Glass Divider */}
          <div className="w-px bg-gradient-to-b from-transparent via-white/20 to-transparent my-6 shrink-0 mx-2" />

          {/* ========================================================= */}
          {/* COLLECTION 02: ON REPEAT                                  */}
          {/* Malcolm Todd, Ado, YOASOBI, Rosa Walton, Dean Martin      */}
          {/* ========================================================= */}
          <div data-collection-anchor="on-repeat" className="inline-flex items-stretch gap-5">
            {ON_REPEAT_ITEMS.map((item) => (
              <LiquidGlassCard
                key={item.id}
                item={item}
                isReducedMotion={isReducedMotion}
                onCardClick={handleCardClick}
              />
            ))}
          </div>

        </div>
      </div>

      {/* ===================== CLEAN INSPECT LIGHTBOX MODAL ===================== */}
      {expandedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={expandedItem.title}
          onClick={() => setExpandedItem(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xl w-full bg-[#0E0E0E] border border-white/15 rounded-2xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col"
          >
            {/* Modal Top Bar */}
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2 text-xs font-tech">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                <span className="text-[#E10600] font-bold">{expandedItem.subtitle}</span>
                <span className="text-neutral-500">·</span>
                <span className="text-white font-semibold">{expandedItem.title}</span>
              </div>
              <button
                onClick={() => setExpandedItem(null)}
                aria-label="Close detail view"
                className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.14] text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image Body */}
            {expandedItem.imageUrl && (
              <div className="relative max-h-[70vh] bg-black/60 flex items-center justify-center overflow-hidden">
                <img
                  src={expandedItem.imageUrl}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (expandedItem.fallbackUrl && target.src !== expandedItem.fallbackUrl) {
                      target.src = expandedItem.fallbackUrl;
                    }
                  }}
                  alt={expandedItem.title}
                  className="w-full max-h-[70vh] object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
