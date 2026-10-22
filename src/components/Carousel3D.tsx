import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Github, 
  X, 
  Users, 
  Wrench, 
  Eye
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { papersData } from '../data/papersData';
import { wipData } from '../data/wipData';

export interface CarouselItemData {
  id: string;
  type: 'project' | 'paper' | 'wip';
  categoryLabel: string;
  title: string;
  kicker: string;
  description: string;
  primaryImage: string;
  fallbackImage?: string;
  // Details for "See More"
  fullName: string;
  role: string;
  collaborators?: string[];
  toolsUsed: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  screenshots?: { url: string; caption: string; alt?: string }[];
  status?: string;
  overviewLong?: string;
  challenges?: string;
}

interface Carousel3DProps {
  isReducedMotion: boolean;
}

export const Carousel3D: React.FC<Carousel3DProps> = ({ isReducedMotion }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'project' | 'paper' | 'wip'>('all');
  const [selectedItem, setSelectedItem] = useState<CarouselItemData | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  // Build the 8 verified items strictly from codebase data
  const allItems: CarouselItemData[] = useMemo(() => {
    // 1. Projects (HUSH, ICHNOVA, Thadam)
    const projectItems: CarouselItemData[] = portfolioData.projects.map((p) => {
      const gh = p.links.find(l => l.type === 'github')?.url;
      const demo = p.links.find(l => l.type === 'demo')?.url;
      return {
        id: p.id,
        type: 'project',
        categoryLabel: 'PROJECT',
        title: p.title,
        kicker: p.category,
        description: p.overview,
        primaryImage: p.screenshots[0]?.url || '',
        fullName: p.title,
        role: p.myContribution,
        collaborators: p.category.includes('Team Project') ? ['Multidisciplinary Hackathon Team'] : undefined,
        toolsUsed: p.technologies,
        githubUrl: gh,
        liveDemoUrl: demo,
        screenshots: p.screenshots,
        overviewLong: p.problem,
        challenges: p.challenges
      };
    });

    // 2. Research Papers (ASSURE, Jana Nayagan, SAMAY & SAAKSHI)
    const paperItems: CarouselItemData[] = papersData.map((paper) => {
      return {
        id: paper.id,
        type: 'paper',
        categoryLabel: 'RESEARCH PAPER',
        title: paper.id === 'paper-samay-saakshi' ? 'SAMAY & SAAKSHI' : paper.id === 'paper-jana-nayagan' ? 'Jana Nayagan' : 'ASSURE',
        kicker: `${paper.number} // ${paper.status} RESEARCH`,
        description: paper.abstract,
        primaryImage: paper.logoUrl,
        fallbackImage: paper.fallbackLogoUrl,
        fullName: paper.title,
        role: paper.myRoleClarification || paper.contribution,
        collaborators: paper.authors,
        toolsUsed: paper.id === 'paper-assure' 
          ? ['Document Intelligence Framework', 'Requirement Extraction', 'Source-Traceable Parsing']
          : paper.id === 'paper-jana-nayagan'
          ? ['Web Application', 'AI-Assisted Text/Image Classification', 'Geocoding', 'Administrative Triage']
          : ['Multi-Source Evidence Fusion', 'Transaction Verification Architecture', 'Legal Enforcement Models'],
        githubUrl: paper.repositoryUrl,
        status: `${paper.status} · ${paper.researchStage}`,
        overviewLong: paper.limitations?.join(' ')
      };
    });

    // 3. WIPs (ASTA-NOVARA, LOCK IN)
    const wipItems: CarouselItemData[] = wipData.map((wip) => {
      return {
        id: wip.id,
        type: 'wip',
        categoryLabel: 'WORK IN PROGRESS',
        title: wip.title,
        kicker: `${wip.number} // ${wip.status}`,
        description: wip.shortTeaser,
        primaryImage: wip.logoUrl,
        fallbackImage: wip.fallbackLogoUrl,
        fullName: wip.title,
        role: wip.role,
        toolsUsed: wip.id === 'wip-asta-novara'
          ? ['Progression Mechanics', 'Evidence Verification Principles', 'Character Identity Systems']
          : ['Study Room Interface', 'Persistent Soundtrack Library', 'Chrome Extension Architecture'],
        status: `${wip.status} · ${wip.atmosphericTheme.toUpperCase()} THEME`,
        overviewLong: wip.visionStatement,
        challenges: wip.statusClarification
      };
    });

    return [...projectItems, ...paperItems, ...wipItems];
  }, []);

  // Filtered items
  const items = useMemo(() => {
    if (activeFilter === 'all') return allItems;
    return allItems.filter(item => item.type === activeFilter);
  }, [allItems, activeFilter]);

  // Carousel physics state refs
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLElement | null)[]>([]);

  const stateRef = useRef({
    index: 0,
    pos: 0,
    slideW: 410,
    gap: 24,
    zDepth: 130,
    rotateY: 26,
    scaleDrop: 0.08,
    blurMax: 2.0,
    activeLeftBias: 0.08,
    dragging: false,
    pointerId: null as number | null,
    x0: 0,
    v: 0,
    t0: 0,
    animating: false,
    hovering: false,
    startTime: 0,
    pausedAt: 0,
    interval: 5000,
    transitionMs: 800
  });

  // Clamp/mod helper
  const mod = (i: number, count: number) => ((i % count) + count) % count;

  // Render slides using the 3D physics adapted for 4:5 portrait cards
  const renderSlides = useCallback((markActive = false) => {
    if (!rootRef.current || !viewportRef.current || items.length === 0) return;
    const count = items.length;
    const st = stateRef.current;
    const span = st.slideW + st.gap;
    const tiltX = parseFloat(rootRef.current.style.getPropertyValue('--mzaTiltX') || '0');
    const tiltY = parseFloat(rootRef.current.style.getPropertyValue('--mzaTiltY') || '0');

    for (let i = 0; i < count; i++) {
      const slide = slidesRef.current[i];
      if (!slide) continue;

      let d = i - st.pos;
      if (d > count / 2) d -= count;
      if (d < -count / 2) d += count;

      const weight = Math.max(0, 1 - Math.abs(d) * 2);
      const biasActive = -st.slideW * st.activeLeftBias * weight;
      const tx = d * span + biasActive;
      const depth = isReducedMotion ? 0 : -Math.abs(d) * st.zDepth;
      const rot = isReducedMotion ? 0 : -d * st.rotateY;
      const scale = 1 - Math.min(Math.abs(d) * st.scaleDrop, 0.40);
      const blur = isReducedMotion ? 0 : Math.min(Math.abs(d) * st.blurMax, st.blurMax);
      const z = Math.round(1000 - Math.abs(d) * 10);

      slide.style.transform = `translate3d(${tx}px, -50%, ${depth}px) rotateY(${rot}deg) scale(${scale})`;
      slide.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
      slide.style.zIndex = `${z}`;

      if (markActive) {
        slide.dataset.state = Math.round(st.index) === i ? 'active' : 'rest';
      }

      // Parallax layers on card
      const card = slide.querySelector('.mzaCard') as HTMLElement | null;
      if (card) {
        const parBase = Math.max(-1, Math.min(1, -d));
        const parX = parBase * 28 + tiltY * 1.5;
        const parY = tiltX * -1.2;
        const bgX = parBase * -36 + tiltY * -1.8;
        card.style.setProperty('--mzaParX', `${parX.toFixed(2)}px`);
        card.style.setProperty('--mzaParY', `${parY.toFixed(2)}px`);
        card.style.setProperty('--mzaParBgX', `${bgX.toFixed(2)}px`);
        card.style.setProperty('--mzaParBgY', `${(parY * 0.35).toFixed(2)}px`);
      }
    }

    const currentActive = mod(Math.round(st.pos), count);
    setActiveIndex(currentActive);
  }, [items.length, isReducedMotion]);

  // Measure carousel dimensions responsively for 4:5 portrait cards
  const measure = useCallback(() => {
    if (!viewportRef.current || !rootRef.current) return;
    const viewRect = viewportRef.current.getBoundingClientRect();
    const width = viewRect.width;

    // Standard Instagram 4:5 portrait card width calculations:
    let slideW = 410;
    let gap = 24;
    let zDepth = 130;
    let rotateY = 26;

    if (width < 640) {
      slideW = Math.min(width * 0.82, 310);
      gap = 14;
      zDepth = 60;
      rotateY = 16;
    } else if (width < 960) {
      slideW = Math.min(width * 0.75, 360);
      gap = 18;
      zDepth = 95;
      rotateY = 22;
    } else {
      slideW = 410;
      gap = 24;
      zDepth = 130;
      rotateY = 26;
    }

    stateRef.current.slideW = slideW;
    stateRef.current.gap = gap;
    stateRef.current.zDepth = zDepth;
    stateRef.current.rotateY = rotateY;

    rootRef.current.style.setProperty('--mzaSlideW', `${slideW}px`);
    renderSlides();
  }, [renderSlides]);

  // Navigate to slide index
  const goTo = useCallback((i: number, animate = true) => {
    if (items.length === 0) return;
    const count = items.length;
    const st = stateRef.current;
    const start = st.pos;
    
    // Nearest circular index
    let d = i - Math.round(start);
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    const end = Math.round(start) + d;

    const dur = animate && !isReducedMotion ? st.transitionMs : 0;
    const t0 = performance.now();
    const ease = (x: number) => 1 - Math.pow(1 - x, 4);

    st.animating = true;
    const step = (now: number) => {
      const t = dur ? Math.min(1, (now - t0) / dur) : 1;
      const p = dur ? ease(t) : 1;
      st.pos = start + (end - start) * p;
      renderSlides();

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        st.index = mod(Math.round(st.pos), count);
        st.pos = st.index;
        st.animating = false;
        renderSlides(true);
        st.startTime = performance.now();
      }
    };
    requestAnimationFrame(step);
  }, [items.length, isReducedMotion, renderSlides]);

  const prev = useCallback(() => {
    if (items.length === 0) return;
    goTo(mod(stateRef.current.index - 1, items.length));
  }, [goTo, items.length]);

  const next = useCallback(() => {
    if (items.length === 0) return;
    goTo(mod(stateRef.current.index + 1, items.length));
  }, [goTo, items.length]);

  // Initialize and handle filters
  useEffect(() => {
    stateRef.current.index = 0;
    stateRef.current.pos = 0;
    stateRef.current.startTime = performance.now();
    measure();
    goTo(0, false);
  }, [activeFilter, measure, goTo]);

  // Autoplay animation loop with progress
  useEffect(() => {
    let loopRaf = 0;
    const loop = (t: number) => {
      const st = stateRef.current;
      if (!st.dragging && !st.hovering && !st.animating && items.length > 1) {
        const elapsed = t - st.startTime;
        const p = Math.min(1, elapsed / st.interval);
        setProgress(p);
        if (elapsed >= st.interval) {
          next();
        }
      }
      loopRaf = requestAnimationFrame(loop);
    };
    loopRaf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(loopRaf);
  }, [items.length, next]);

  // Pointer drag & 3D tilt bindings
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const st = stateRef.current;
      st.dragging = true;
      st.pointerId = e.pointerId;
      try {
        vp.setPointerCapture(e.pointerId);
      } catch {}
      st.x0 = e.clientX;
      st.t0 = performance.now();
      st.v = 0;
      st.pausedAt = performance.now();
    };

    const onPointerMove = (e: PointerEvent) => {
      const st = stateRef.current;
      // Mouse tilt calculation
      const r = vp.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width - 0.5;
      const my = (e.clientY - r.top) / r.height - 0.5;
      if (rootRef.current) {
        rootRef.current.style.setProperty('--mzaTiltX', (my * -5).toFixed(3));
        rootRef.current.style.setProperty('--mzaTiltY', (mx * 5).toFixed(3));
      }

      if (!st.dragging || e.pointerId !== st.pointerId || items.length === 0) return;
      const dx = e.clientX - st.x0;
      const dt = Math.max(16, performance.now() - st.t0);
      st.v = dx / dt;
      const slideSpan = st.slideW + st.gap;
      st.pos = mod(st.index - dx / slideSpan, items.length);
      renderSlides();
    };

    const onPointerUp = (e: PointerEvent) => {
      const st = stateRef.current;
      if (!st.dragging || (e && e.pointerId !== st.pointerId)) return;
      st.dragging = false;
      try {
        if (st.pointerId !== null) vp.releasePointerCapture(st.pointerId);
      } catch {}
      st.pointerId = null;

      if (st.pausedAt) {
        st.startTime += performance.now() - st.pausedAt;
        st.pausedAt = 0;
      }

      const v = st.v;
      const threshold = 0.18;
      const target = Math.round(st.pos - Math.sign(v) * (Math.abs(v) > threshold ? 0.5 : 0));
      goTo(mod(target, items.length));
    };

    vp.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    const onMouseEnter = () => {
      stateRef.current.hovering = true;
      stateRef.current.pausedAt = performance.now();
    };
    const onMouseLeave = () => {
      if (stateRef.current.pausedAt) {
        stateRef.current.startTime += performance.now() - stateRef.current.pausedAt;
        stateRef.current.pausedAt = 0;
      }
      stateRef.current.hovering = false;
      if (rootRef.current) {
        rootRef.current.style.setProperty('--mzaTiltX', '0');
        rootRef.current.style.setProperty('--mzaTiltY', '0');
      }
    };

    vp.addEventListener('mouseenter', onMouseEnter);
    vp.addEventListener('mouseleave', onMouseLeave);

    const ro = new ResizeObserver(() => measure());
    ro.observe(vp);

    return () => {
      vp.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      vp.removeEventListener('mouseenter', onMouseEnter);
      vp.removeEventListener('mouseleave', onMouseLeave);
      ro.disconnect();
    };
  }, [items.length, goTo, measure, renderSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedItem) {
        if (e.key === 'Escape') setSelectedItem(null);
        return;
      }
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prev, next, selectedItem]);

  return (
    <div className="w-full relative my-8 sm:my-12 overflow-x-clip py-2">
      {/* Top Filter Tabs & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8 px-2 sm:px-0">
        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/[0.08] rounded-xl backdrop-blur-md">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#E10600] text-white shadow-[0_0_12px_rgba(225,6,0,0.5)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All (8)
          </button>
          <button
            onClick={() => setActiveFilter('project')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'project'
                ? 'bg-[#E10600] text-white shadow-[0_0_12px_rgba(225,6,0,0.5)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Projects (3)
          </button>
          <button
            onClick={() => setActiveFilter('paper')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'paper'
                ? 'bg-[#E10600] text-white shadow-[0_0_12px_rgba(225,6,0,0.5)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Papers (3)
          </button>
          <button
            onClick={() => setActiveFilter('wip')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'wip'
                ? 'bg-[#E10600] text-white shadow-[0_0_12px_rgba(225,6,0,0.5)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            WIPs (2)
          </button>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            aria-label="Previous card"
            className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-[#E10600]/20 border border-white/10 hover:border-[#E10600]/50 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-200" />
          </button>
          <button
            onClick={next}
            aria-label="Next card"
            className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-[#E10600]/20 border border-white/10 hover:border-[#E10600]/50 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-lg"
          >
            <ChevronRight className="w-5 h-5 text-neutral-200" />
          </button>
        </div>
      </div>

      {/* 3D CAROUSEL THEATER CONTAINER - Expanded vertical room & overflow-visible to prevent cropping */}
      <div 
        ref={rootRef}
        className="relative w-full h-[520px] sm:h-[600px] md:h-[660px] select-none touch-none overflow-visible rounded-2xl flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        <div 
          ref={viewportRef}
          className="relative w-full h-full cursor-grab active:cursor-grabbing outline-none flex items-center justify-center overflow-visible"
        >
          <div 
            ref={trackRef}
            className="relative w-full h-full flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {items.map((item, idx) => {
              const isPaperOrWip = item.type === 'paper' || item.type === 'wip';
              return (
                <article
                  key={item.id}
                  ref={(el) => { slidesRef.current[idx] = el; }}
                  /* STRICT REQUIREMENT: Standard Instagram 4:5 portrait ratio (1080 x 1350) */
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(82vw,310px)] sm:w-[360px] md:w-[410px] aspect-[4/5] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.75)] transition-filter duration-300"
                  style={{
                    transformStyle: 'preserve-3d',
                    willChange: 'transform, filter'
                  }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} of ${items.length}: ${item.title}`}
                >
                  <div 
                    className="mzaCard relative w-full h-full rounded-2xl overflow-hidden bg-neutral-900/90 border border-white/15 backdrop-blur-md"
                    style={{ transform: 'translateZ(0)' }}
                  >
                    {/* Background Layer with Parallax Shift */}
                    <div 
                      className="absolute inset-[-4%] bg-cover bg-center transition-transform duration-700 ease-out"
                      style={{
                        backgroundImage: isPaperOrWip 
                          ? undefined 
                          : `url('${item.primaryImage}')`,
                        transform: 'translateZ(-40px) scale(1.12) translate3d(var(--mzaParBgX, 0px), var(--mzaParBgY, 0px), 0)',
                        backgroundColor: '#090a0f'
                      }}
                    >
                      {/* Paper or WIP distinctive logo stage */}
                      {isPaperOrWip && (
                        <div className="w-full h-full flex items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_rgba(225,6,0,0.18)_0%,_rgba(10,10,12,0.95)_75%)]">
                          <img 
                            src={item.primaryImage}
                            onError={(e) => {
                              if (item.fallbackImage) {
                                (e.currentTarget as HTMLImageElement).src = item.fallbackImage;
                              }
                            }}
                            alt={`${item.title} emblem`}
                            className="max-h-36 sm:max-h-44 max-w-[70%] object-contain drop-shadow-[0_0_35px_rgba(225,6,0,0.35)] opacity-90"
                          />
                        </div>
                      )}
                    </div>

                    {/* Gradient Overlay for Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/35 pointer-events-none" />

                    {/* Header Strip (Parallax 1) */}
                    <header 
                      className="mzaPar-1 absolute top-4 left-4 right-4 sm:top-5 sm:left-5 sm:right-5 z-10 flex items-start justify-between gap-3"
                      style={{
                        transform: 'translate3d(calc(var(--mzaParX, 0px) * 0.35), calc(var(--mzaParY, 0px) * 0.35), 0)'
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.8)]" />
                          <span className="text-[10px] sm:text-[11px] font-tech font-bold uppercase tracking-widest text-[#FF2800] drop-shadow-md">
                            {item.kicker}
                          </span>
                        </div>
                        <h2 className="font-display text-xl sm:text-2xl font-black text-white tracking-wide uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] leading-tight">
                          {item.title}
                        </h2>
                      </div>

                      <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono uppercase tracking-wider bg-white/[0.08] text-neutral-300 border border-white/10 shrink-0">
                        {item.categoryLabel}
                      </span>
                    </header>

                    {/* Description Bubble (Parallax 2) */}
                    <div 
                      className="mzaPar-2 absolute bottom-16 sm:bottom-18 left-4 right-4 sm:left-5 sm:right-5 z-10"
                      style={{
                        transform: 'translate3d(calc(var(--mzaParX, 0px) * 0.22), calc(var(--mzaParY, 0px) * 0.22), 0)'
                      }}
                    >
                      <div className="p-3 sm:p-3.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-xs sm:text-[13px] font-body text-neutral-200 leading-relaxed shadow-lg">
                        <p className="line-clamp-2 sm:line-clamp-3">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Footer: See More Button (Parallax 3) */}
                    <footer 
                      className="mzaPar-3 absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 z-10 flex items-center justify-between"
                      style={{
                        transform: 'translate3d(calc(var(--mzaParX, 0px) * 0.15), calc(var(--mzaParY, 0px) * 0.15), 0)'
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#E10600] hover:bg-[#FF2800] border border-[#FF5533]/40 text-white font-tech text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-[0_4px_20px_rgba(225,6,0,0.4)] hover:shadow-[0_4px_28px_rgba(225,6,0,0.6)] cursor-pointer active:scale-95 inline-flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>SEE MORE</span>
                      </button>

                      {/* Optional direct quick link */}
                      {item.githubUrl && (
                        <a
                          href={item.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 sm:p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
                          title="Open GitHub repository"
                          aria-label="GitHub repository"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </footer>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-2 z-20 pointer-events-auto">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              type="button"
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                i === activeIndex
                  ? 'w-7 h-2 bg-[#E10600] shadow-[0_0_10px_rgba(225,6,0,0.8)]'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={i === activeIndex}
              role="tab"
            />
          ))}
        </div>

        {/* Subtle Auto-Cycle Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.08] overflow-hidden z-20">
          <div 
            className="h-full bg-[#E10600] transition-transform duration-100 ease-linear"
            style={{ 
              transformOrigin: 'left',
              transform: `scaleX(${progress})` 
            }}
          />
        </div>
      </div>

      {/* ===================== "SEE MORE" COMPREHENSIVE DETAIL MODAL ===================== */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d0f14]/95 border border-white/15 p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.8)] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.8)]" />
                  <span className="text-xs font-tech font-bold uppercase tracking-wider text-[#FF2800]">
                    {selectedItem.categoryLabel} // DOSSIER
                  </span>
                  {selectedItem.status && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-neutral-300 border border-white/10">
                      {selectedItem.status}
                    </span>
                  )}
                </div>
                <h3 id="modal-title" className="font-display text-2xl sm:text-3xl font-bold text-white">
                  {selectedItem.fullName}
                </h3>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95 shrink-0"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 pt-5">
              
              {/* Screenshots or Logo Gallery */}
              {selectedItem.screenshots && selectedItem.screenshots.length > 0 ? (
                <div>
                  <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
                    SCREENSHOTS & INTERFACE VIEWS
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedItem.screenshots.map((s, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden border border-white/10 bg-black/40 group">
                        <img 
                          src={s.url} 
                          alt={s.alt || s.caption} 
                          className="w-full h-44 object-cover object-top hover:scale-102 transition-transform duration-300" 
                        />
                        <div className="p-2 text-[11px] font-tech text-neutral-400 border-t border-white/5">
                          {s.caption}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
                  <img 
                    src={selectedItem.primaryImage} 
                    onError={(e) => {
                      if (selectedItem.fallbackImage) {
                        (e.currentTarget as HTMLImageElement).src = selectedItem.fallbackImage;
                      }
                    }}
                    alt={selectedItem.title} 
                    className="max-h-36 object-contain drop-shadow-[0_0_20px_rgba(225,6,0,0.3)]" 
                  />
                </div>
              )}

              {/* My Role */}
              {selectedItem.role && (
                <div>
                  <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#E10600]" />
                    <span>MY ROLE & RESPONSIBILITY</span>
                  </h4>
                  <p className="font-body text-sm text-neutral-200 leading-relaxed bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.06]">
                    {selectedItem.role}
                  </p>
                </div>
              )}

              {/* Collaborators (Only if available) */}
              {selectedItem.collaborators && selectedItem.collaborators.length > 0 && (
                <div>
                  <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#E10600]" />
                    <span>COLLABORATORS / AUTHORS</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.collaborators.map((c, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-lg bg-white/[0.04] text-xs font-tech text-neutral-300 border border-white/10">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools Used */}
              {selectedItem.toolsUsed && selectedItem.toolsUsed.length > 0 && (
                <div>
                  <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#E10600]" />
                    <span>TOOLS & TECHNOLOGIES USED</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.toolsUsed.map((tool, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-lg bg-[#E10600]/10 border border-[#E10600]/30 text-white text-xs font-tech tracking-wider">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Overview */}
              {selectedItem.overviewLong && (
                <div>
                  <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    SPECIFICATION & CONTEXT
                  </h4>
                  <p className="font-body text-xs sm:text-sm text-neutral-300 leading-relaxed bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.06]">
                    {selectedItem.overviewLong}
                  </p>
                </div>
              )}

              {/* Action Links: GitHub & Demo */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
                {selectedItem.githubUrl && (
                  <a
                    href={selectedItem.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-tech font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Github className="w-4 h-4 text-[#E10600]" />
                    <span>OPEN GITHUB REPOSITORY</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </a>
                )}

                {selectedItem.liveDemoUrl && (
                  <a
                    href={selectedItem.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#E10600] hover:bg-[#FF2800] text-white text-xs font-tech font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-[0_0_16px_rgba(225,6,0,0.4)]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>LAUNCH LIVE DEMO</span>
                  </a>
                )}

                <button
                  onClick={() => setSelectedItem(null)}
                  className="ml-auto px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-tech tracking-wider uppercase cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
