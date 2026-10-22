import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Menu, X, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface NavigationProps {
  isReducedMotion: boolean;
  isMuted?: boolean;
  onToggleSound?: () => void;
  onReplayIntro?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isReducedMotion,
  isMuted = true,
  onToggleSound,
  onReplayIntro
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exactly five navigation items in required order
  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact', href: '#contact' },
  ];

  // Map all page sections to one of the 5 canonical navigation tabs
  const sectionToTabMap: Record<string, string> = {
    '#hero': '#hero',
    '#about': '#about',
    '#skills': '#skills',
    '#projects': '#projects',
    '#papers': '#projects',
    '#wip': '#projects',
    '#venture': '#projects',
    '#experience': '#projects',
    '#poetry': '#about',
    '#off-script': '#about',
    '#contact': '#contact',
  };

  // Determine initial active tab from window.location.hash on page load or refresh
  const getInitialHref = useCallback(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      const mapped = sectionToTabMap[hash] || hash;
      if (navLinks.some((l) => l.href === mapped)) {
        return mapped;
      }
    }
    return '#hero';
  }, []);

  const [activeHref, setActiveHref] = useState<string>(getInitialHref);
  const [pillStyle, setPillStyle] = useState<{
    left: number;
    width: number;
    ready: boolean;
    animate: boolean;
  }>({
    left: 0,
    width: 0,
    ready: false,
    animate: false
  });

  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  
  // Guard against scroll-based active-section detection overriding clicked tab
  const isClickScrollingRef = useRef<boolean>(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Accurate positioning calculation derived from the actual active tab DOM element
  const updatePill = useCallback((href: string, animate: boolean = true) => {
    const navContainer = navRef.current;
    const targetBtn = itemRefs.current[href];
    if (!navContainer || !targetBtn) return;

    const left = targetBtn.offsetLeft;
    const width = targetBtn.offsetWidth;

    // Guard against zero-width unrendered elements
    if (width === 0) return;

    setPillStyle({
      left,
      width,
      ready: true,
      animate: animate && !isReducedMotion
    });
  }, [isReducedMotion]);

  // Synchronous post-layout measurement via useLayoutEffect before initial paint
  useLayoutEffect(() => {
    const initialHref = getInitialHref();
    setActiveHref(initialHref);
    updatePill(initialHref, false);
  }, [getInitialHref, updatePill]);

  // Update pill position whenever activeHref changes
  useEffect(() => {
    updatePill(activeHref, true);
  }, [activeHref, updatePill]);

  // Font-load listener: recalculates without animation when custom fonts render
  useEffect(() => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        updatePill(activeHref, false);
      });
    }
  }, [activeHref, updatePill]);

  // ResizeObserver: keeps pill aligned across container reflows and responsive adjustments
  useEffect(() => {
    const navContainer = navRef.current;
    if (!navContainer) return;

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        updatePill(activeHref, false);
      });

      ro.observe(navContainer);
      Object.values(itemRefs.current).forEach((btn) => {
        if (btn) ro.observe(btn);
      });

      return () => ro.disconnect();
    } else {
      const handleResize = () => updatePill(activeHref, false);
      window.addEventListener('resize', handleResize, { passive: true });
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [activeHref, updatePill]);

  // User input listeners: cancel click-lock if user manually scrolls or touches
  useEffect(() => {
    const handleManualScroll = () => {
      isClickScrollingRef.current = false;
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    };

    const handleScrollEnd = () => {
      isClickScrollingRef.current = false;
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    };

    window.addEventListener('wheel', handleManualScroll, { passive: true });
    window.addEventListener('touchmove', handleManualScroll, { passive: true });
    window.addEventListener('scrollend', handleScrollEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleManualScroll);
      window.removeEventListener('touchmove', handleManualScroll);
      window.removeEventListener('scrollend', handleScrollEnd);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  // History & hash listener
  useEffect(() => {
    const handleLocationChange = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash;
        const mapped = sectionToTabMap[hash] || hash;
        if (navLinks.some((l) => l.href === mapped)) {
          setActiveHref(mapped);
          updatePill(mapped, true);
        }
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [updatePill]);

  // IntersectionObserver to sync active tab with scroll position (Zero scroll event overhead)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observedIds = [
      '#hero',
      '#about',
      '#skills',
      '#projects',
      '#papers',
      '#wip',
      '#venture',
      '#experience',
      '#poetry',
      '#off-script',
      '#contact',
    ];

    const sectionElements: { id: string; el: HTMLElement }[] = [];
    observedIds.forEach((id) => {
      const section = document.querySelector(id) as HTMLElement | null;
      if (section) {
        sectionElements.push({ id, el: section });
      }
    });

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Critical: Do NOT override clicked destination while programmatic smooth scroll is active!
        if (isClickScrollingRef.current) return;

        // Bottom of page detection for Contact section
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const clientHeight = window.innerHeight || document.documentElement.clientHeight;
        if (scrollHeight > clientHeight && scrollHeight - (scrollTop + clientHeight) <= 36) {
          setActiveHref('#contact');
          return;
        }

        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
          const topVisible = visible[0];
          const targetId = `#${topVisible.target.id}`;
          const mappedTab = sectionToTabMap[targetId] || targetId;
          if (navLinks.some((l) => l.href === mappedTab)) {
            setActiveHref(mappedTab);
          }
        }
      },
      {
        rootMargin: '-20% 0px -50% 0px',
        threshold: [0, 0.2, 0.5]
      }
    );

    sectionElements.forEach(({ el }) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleScroll = (href: string) => {
    setMobileMenuOpen(false);

    // 1. Lock click-scrolling flag so observer cannot override this choice while scrolling
    isClickScrollingRef.current = true;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 950);

    // 2. Immediately update state and target pill to the clicked tab
    setActiveHref(href);
    updatePill(href, true);

    // 3. Update URL hash cleanly
    if (typeof window !== 'undefined' && window.location.hash !== href) {
      window.history.replaceState(null, '', href);
    }

    // 4. Smooth scroll to destination
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full f1-nav-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Zone 1: Logo & Brand Lockup */}
        <a 
          href="#hero"
          onClick={(e) => { e.preventDefault(); handleScroll('#hero'); }}
          className="flex items-center gap-2.5 group focus:outline-hidden focus:ring-1 focus:ring-[#E10600] rounded transition-all active:scale-98 shrink-0"
          aria-label="Rophe Angel Home"
        >
          <img
            src="/logo.png"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://plain-apac-prod-public.komododecks.com/202610/20/YZgT7SnpXc2zs3CnoXeZ/image.png';
            }}
            alt="Rophe Angel Logo"
            className="h-9 sm:h-10 w-auto max-w-[130px] object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-display text-sm sm:text-base font-bold text-[#FFFFFF] tracking-wide group-hover:text-[#E10600] transition-colors whitespace-nowrap">
              Rophe Angel
            </span>
          </div>
        </a>

        {/* Zone 2: Five Navigation Items with Animated Sliding Pill */}
        <nav 
          ref={navRef}
          aria-label="Primary Navigation"
          className="relative hidden md:flex items-center gap-1 p-1 rounded-lg bg-black/30 border border-white/[0.06] backdrop-blur-md"
        >
          {/* Sliding Navigation Pill */}
          {pillStyle.ready && (
            <div
              aria-hidden="true"
              className="absolute top-1 bottom-1 rounded-md pointer-events-none bg-[#E10600]/20 border border-[#E10600]/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_0_14px_rgba(225,6,0,0.3)] z-0"
              style={{
                left: `${pillStyle.left}px`,
                width: `${pillStyle.width}px`,
                transition: isReducedMotion || !pillStyle.animate
                  ? 'none'
                  : 'left 0.28s cubic-bezier(0.16, 1, 0.3, 1), width 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          )}

          {navLinks.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <button
                key={item.href}
                ref={(el) => { itemRefs.current[item.href] = el; }}
                onClick={() => handleScroll(item.href)}
                className={`relative z-10 px-3.5 py-1.5 text-xs font-tech font-bold tracking-wider uppercase rounded-md transition-colors cursor-pointer select-none focus:outline-hidden focus:ring-1 focus:ring-[#E10600] whitespace-nowrap ${
                  isActive 
                    ? 'text-[#FFFFFF]' 
                    : 'text-neutral-300 hover:text-[#FFFFFF]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Audio & Replay Intro Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Sound Toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg font-tech text-xs uppercase tracking-wider bg-white/[0.04] backdrop-blur-md text-neutral-300 border border-white/[0.08] hover:border-[#E10600]/60 hover:text-[#FFFFFF] hover:bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all cursor-pointer flex items-center gap-1.5 focus:outline-hidden focus:ring-1 focus:ring-[#E10600]"
              aria-label={isMuted ? "Unmute audio and enable pit wall radio" : "Mute audio"}
              title={isMuted ? "Unmute audio" : "Mute audio"}
              aria-pressed={!isMuted}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="hidden sm:inline text-[11px]">Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#E10600] animate-pulse" />
                  <span className="hidden sm:inline text-[11px] text-[#FFFFFF]">Audio On</span>
                </>
              )}
            </button>
          )}

          {/* Replay Intro button */}
          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-tech text-xs uppercase tracking-wider bg-white/[0.04] backdrop-blur-md text-neutral-300 border border-white/[0.08] hover:border-[#E10600]/60 hover:text-[#FFFFFF] hover:bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all cursor-pointer"
              title="Replay Chibi greeting intro"
            >
              <RotateCcw className="w-3 h-3 text-[#E10600]" />
              <span className="text-[11px] hidden min-[420px]:inline">Replay Intro</span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-[#FFFFFF] hover:text-[#E10600] hover:border-[#E10600]/60 active:scale-95 focus:outline-hidden focus:ring-1 focus:ring-[#E10600] cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121214]/94 backdrop-blur-2xl px-4 py-4 space-y-2 shadow-[0_16px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)]">
          <div className="flex flex-col gap-1 py-1">
            {navLinks.map((item) => {
              const isActive = activeHref === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => handleScroll(item.href)}
                  className={`text-left px-3.5 py-2.5 text-xs font-tech font-semibold uppercase tracking-wider rounded-lg transition-all active:scale-98 cursor-pointer flex items-center justify-between ${
                    isActive 
                      ? 'bg-[#E10600]/15 text-[#FFFFFF] border border-[#E10600]/40' 
                      : 'text-[#E0E0E0] hover:bg-[#171717] hover:text-[#E10600]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />}
                </button>
              );
            })}
          </div>

          <div className="pt-3 mt-2 flex items-center justify-between gap-2 border-t border-white/[0.06]">
            {onReplayIntro && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onReplayIntro();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141414] border border-neutral-700 text-xs font-tech text-neutral-300 hover:text-[#FFFFFF] cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-[#E10600]" />
                <span>Replay Intro</span>
              </button>
            )}

            <button
              onClick={() => handleScroll('#contact')}
              className="text-xs font-tech font-bold uppercase tracking-wider text-[#E10600] py-1 cursor-pointer ml-auto"
            >
              Contact →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
