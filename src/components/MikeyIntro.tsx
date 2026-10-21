import React, { useState, useEffect, useRef } from 'react';
import { MikeySprite, CatState } from './MikeySprite';
import { domainAudio } from '../utils/audio';

interface MikeyIntroProps {
  onStartReveal?: () => void;
  onContinue: (landingX?: number) => void;
  isReducedMotion: boolean;
  isInteractive?: boolean;
}

/**
 * MikeyIntro — Dedicated Character Reveal Scene
 * 
 * - Mutually exclusive stage: Mounts ONLY after the liquid wave transition completes.
 * - Perfectly centered inside the layout stage from frame 1 (zero teleportation or layout jumps).
 * - Canonical copy:
 *   "Meet Mikey!"
 *   "Rophe's very own kitty cat."
 *   "1½ years old. Professional troublemaker."
 *   "Tap him to say hi — or drag and drop him around. Just don't expect him to enjoy the landing."
 * - Full drag-and-drop support with simulated gravity return to resting position.
 * - Dual-guaranteed completion on tap (transitionend + fallback timer) so homepage handoff always finishes.
 */
export const MikeyIntro: React.FC<MikeyIntroProps> = ({
  onStartReveal,
  onContinue,
  isReducedMotion,
  isInteractive = true
}) => {
  // Cat states
  const [catState, setCatState] = useState<CatState>('idle');
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [showHeart, setShowHeart] = useState<boolean>(false);
  const [showHissIcon, setShowHissIcon] = useState<boolean>(false);
  const [facingLeft, setFacingLeft] = useState<boolean>(false);

  // Position relative to stage center:
  // Starts at (0, 0), which is already perfectly centered in the stage by CSS flexbox!
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Presentation scale (2.5 on desktop, 2.2 on mobile)
  const [scale, setScale] = useState<number>(() => {
    if (typeof window === 'undefined') return 2.5;
    return window.innerWidth < 768 ? 2.2 : 2.5;
  });

  const [isHandoff, setIsHandoff] = useState<boolean>(false);

  // Drag tracking refs
  const isDraggingRef = useRef<boolean>(false);
  const dragStartPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);
  const fallRafRef = useRef<number | null>(null);

  // Handoff state guards
  const isHandoffStartedRef = useRef<boolean>(false);
  const hasCompletedHandoffRef = useRef<boolean>(false);
  const handoffTimerRef = useRef<NodeJS.Timeout | null>(null);

  // DOM node references
  const mikeyElRef = useRef<HTMLDivElement | null>(null);
  const onStartRevealRef = useRef(onStartReveal);
  onStartRevealRef.current = onStartReveal;
  const onContinueRef = useRef(onContinue);
  onContinueRef.current = onContinue;

  // Base cat dimensions
  const BASE_CAT_W = 76;
  const BASE_CAT_H = 58;

  // Window resize handler: update presentation scale smoothly
  useEffect(() => {
    const handleResize = () => {
      if (!isHandoffStartedRef.current && typeof window !== 'undefined') {
        setScale(window.innerWidth < 768 ? 2.2 : 2.5);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Idle animations (blinking and curious tilt)
  useEffect(() => {
    if (isReducedMotion) return;

    let blinkTimer: NodeJS.Timeout | null = null;
    let curiousTimer: NodeJS.Timeout | null = null;

    const scheduleBlink = () => {
      const delay = 2200 + Math.random() * 3600;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 180);
      }, delay);
    };
    scheduleBlink();

    const scheduleCurious = () => {
      const delay = 3600 + Math.random() * 4200;
      curiousTimer = setTimeout(() => {
        if (!isDraggingRef.current && !isHandoffStartedRef.current) {
          setCatState((prev) => (prev === 'idle' ? 'curious' : prev));
          setTimeout(() => {
            setCatState((prev) => (prev === 'curious' ? 'idle' : prev));
            scheduleCurious();
          }, 2000);
        } else {
          scheduleCurious();
        }
      }, delay);
    };
    scheduleCurious();

    return () => {
      if (blinkTimer) clearTimeout(blinkTimer);
      if (curiousTimer) clearTimeout(curiousTimer);
    };
  }, [isReducedMotion]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (fallRafRef.current) cancelAnimationFrame(fallRafRef.current);
      if (handoffTimerRef.current) clearTimeout(handoffTimerRef.current);
    };
  }, []);

  // Physics gravity fall simulation after drag release
  const startGravityFallToIntroRest = (startX: number, startY: number) => {
    // Target resting floor inside the intro stage is y = 0
    const targetY = 0;

    if (startY >= targetY - 4) {
      setPos({ x: 0, y: 0 });
      setCatState('landing');
      setTimeout(() => setCatState('idle'), 260);
      return;
    }

    setCatState('falling');
    let currentY = startY;
    let vy = 40;
    const gravity = 1800;
    const maxSpeed = 1500;
    let lastTime = performance.now();

    const stepFall = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;
      vy = Math.min(maxSpeed, vy + gravity * dt);
      currentY += vy * dt;

      if (currentY >= targetY) {
        setPos({ x: 0, y: targetY });
        setCatState('landing');
        setTimeout(() => {
          setCatState('idle');
          setPos({ x: 0, y: 0 });
        }, 260);
        return;
      }

      setPos({ x: startX, y: currentY });
      fallRafRef.current = requestAnimationFrame(stepFall);
    };

    if (fallRafRef.current) cancelAnimationFrame(fallRafRef.current);
    fallRafRef.current = requestAnimationFrame(stepFall);
  };

  // Pointer drag interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isHandoffStartedRef.current || !isInteractive) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Safe fallback
    }

    if (fallRafRef.current) cancelAnimationFrame(fallRafRef.current);

    dragStartPointerRef.current = { x: e.clientX, y: e.clientY };
    dragStartPosRef.current = { x: pos.x, y: pos.y };
    hasDraggedRef.current = false;
    isDraggingRef.current = true;
    setCatState('dragging');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || isHandoffStartedRef.current) return;

    const dx = e.clientX - dragStartPointerRef.current.x;
    const dy = e.clientY - dragStartPointerRef.current.y;

    if (Math.hypot(dx, dy) > 8) {
      hasDraggedRef.current = true;
    }

    const nextX = dragStartPosRef.current.x + dx;
    const nextY = dragStartPosRef.current.y + dy;

    if (dx < -3) setFacingLeft(true);
    if (dx > 3) setFacingLeft(false);

    setPos({ x: nextX, y: nextY });
  };

  const finishDragOrTap = (pointerId?: number, currentTarget?: HTMLDivElement) => {
    if (!isDraggingRef.current || isHandoffStartedRef.current) return;
    isDraggingRef.current = false;

    if (currentTarget && pointerId !== undefined) {
      try {
        currentTarget.releasePointerCapture(pointerId);
      } catch {
        // Safe fallback
      }
    }

    if (hasDraggedRef.current) {
      // 1. Drag & drop completed: play playful cat hiss and drop back under gravity
      domainAudio.playCatHiss();
      setShowHissIcon(true);
      setTimeout(() => setShowHissIcon(false), 1200);

      startGravityFallToIntroRest(pos.x, pos.y);
    } else {
      // 2. Click or tap: trigger seamless handoff to homepage
      triggerHomepageTransition();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    finishDragOrTap(e.pointerId, e.currentTarget);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    finishDragOrTap(e.pointerId, e.currentTarget);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isHandoffStartedRef.current || !isInteractive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerHomepageTransition();
    }
  };

  // Safe handoff completion handler — guaranteed to fire exactly once
  const completeHandoff = (groundX: number) => {
    if (hasCompletedHandoffRef.current) return;
    hasCompletedHandoffRef.current = true;

    if (handoffTimerRef.current) {
      clearTimeout(handoffTimerRef.current);
      handoffTimerRef.current = null;
    }

    onContinueRef.current(groundX);
  };

  // Seamless transition from Mikey introduction scene to homepage
  const triggerHomepageTransition = () => {
    if (isHandoffStartedRef.current || !isInteractive) return;
    isHandoffStartedRef.current = true;

    // Cancel physics loop if running
    isDraggingRef.current = false;
    if (fallRafRef.current) {
      cancelAnimationFrame(fallRafRef.current);
      fallRafRef.current = null;
    }

    // Warm cat purr and heart bubble
    domainAudio.playCatPurr();
    setCatState('purring');
    setShowHeart(true);

    // Target companion coordinates on the homepage bottom line
    const targetGroundX = Math.round(
      Math.max(40, Math.min(window.innerWidth - BASE_CAT_W - 32, window.innerWidth * 0.22))
    );
    const targetGroundY = window.innerHeight - 62;

    // Signal to parent IntroController to dissolve the dark background
    onStartRevealRef.current?.();

    if (isReducedMotion) {
      completeHandoff(targetGroundX);
      return;
    }

    // Measure screen delta from current position to target ground position
    let deltaX = targetGroundX;
    let deltaY = targetGroundY;
    if (mikeyElRef.current) {
      const rect = mikeyElRef.current.getBoundingClientRect();
      deltaX = pos.x + (targetGroundX - rect.left);
      deltaY = pos.y + (targetGroundY - rect.top);
    }

    // Start visual scale-down and translation to the bottom of the viewport
    setIsHandoff(true);
    setPos({ x: deltaX, y: deltaY });
    setScale(1.0);

    // Dual-guaranteed completion:
    // 1. Fallback timer at 760ms (always executes if transitionend does not)
    handoffTimerRef.current = setTimeout(() => {
      completeHandoff(targetGroundX);
    }, 760);
  };

  // 2. Event-based completion on transform transition end
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName === 'transform' && isHandoff) {
      const targetGroundX = Math.round(
        Math.max(40, Math.min(window.innerWidth - BASE_CAT_W - 32, window.innerWidth * 0.22))
      );
      completeHandoff(targetGroundX);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden select-none flex items-center justify-center p-4 sm:p-6 md:p-8"
      role="region"
      aria-label="Meet Mikey Introduction"
    >
      {/* Main Content Layout: Intro Card & Mikey's Dedicated Spotlight */}
      <div
        className={`relative z-10 w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-14 transition-all duration-400 ${
          isHandoff ? 'opacity-0 -translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Mikey's Spotlight Stage:
            Naturally centers Mikey via flexbox from frame 1 (zero teleporting or layout shift) */}
        <div className="relative w-[240px] sm:w-[260px] md:w-[280px] h-[170px] sm:h-[190px] md:h-[220px] flex items-center justify-center shrink-0">
          
          {/* Atmospheric Ferrari Red Radial Glow right behind Mikey */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(225,6,0,0.22)_0%,transparent_70%)] pointer-events-none" />

          {/* Mikey Character Container */}
          <div
            ref={mikeyElRef}
            role="button"
            tabIndex={0}
            aria-label="Meet Mikey the Cat — Tap to say hi and continue to portfolio, or drag and drop him around"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onKeyDown={handleKeyDown}
            onTransitionEnd={handleTransitionEnd}
            className={`select-none group touch-none outline-hidden relative z-20 ${
              catState === 'dragging' ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
              transition: isHandoff
                ? 'transform 0.75s cubic-bezier(0.25, 1, 0.45, 1)'
                : catState !== 'dragging' && catState !== 'falling'
                ? 'transform 0.25s ease-out'
                : 'none',
              willChange: 'transform'
            }}
          >
            {/* Scale Wrapper: Dedicated DOM node for scale prevents conflicts with translation */}
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                transition: isHandoff
                  ? 'transform 0.75s cubic-bezier(0.25, 1, 0.45, 1)'
                  : 'none',
                willChange: 'transform'
              }}
              className="relative"
            >
              {/* Heart bubble on tap / purr */}
              {showHeart && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce z-50">
                  <div className="px-2 py-0.5 rounded-full bg-white/[0.2] backdrop-blur-md border border-white/[0.3] shadow-[0_4px_16px_rgba(225,6,0,0.5)] flex items-center gap-1">
                    <span className="text-[#E10600] text-[10px]">♥</span>
                    <span className="font-tech text-[9px] text-[#FFFFFF] tracking-wider uppercase font-bold">
                      purr~
                    </span>
                  </div>
                </div>
              )}

              {/* Hiss bubble on drag release */}
              {showHissIcon && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce z-50">
                  <div className="px-2 py-0.5 rounded-full bg-[#18181A]/95 backdrop-blur-md border border-[#E10600]/60 shadow-[0_4px_16px_rgba(225,6,0,0.4)] flex items-center gap-1">
                    <span className="text-[#E10600] text-[10px] font-bold">!</span>
                    <span className="font-tech text-[9px] text-[#FFFFFF] tracking-wider uppercase font-bold">
                      hiss!
                    </span>
                  </div>
                </div>
              )}

              {/* Hover Cue when waiting */}
              {!showHeart && !showHissIcon && !isHandoff && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-[#121214]/90 backdrop-blur-md border border-[#E10600]/40 text-[8px] font-tech font-bold uppercase tracking-widest text-[#FFFFFF] shadow-lg flex items-center gap-1">
                    <span>Tap or Drag Me!</span>
                  </span>
                </div>
              )}

              {/* Mikey's Sprite Component */}
              <MikeySprite
                catState={catState}
                isBlinking={isBlinking}
                pawStep={0}
                facingLeft={facingLeft}
                idPrefix="mikey_intro_"
                className="w-[76px] h-[58px]"
              />
            </div>
          </div>
        </div>

        {/* Introduction Text & Spec Sheet */}
        <div className="w-full max-w-md sm:max-w-lg">
          <div className="rounded-2xl p-6 sm:p-7 border border-white/[0.12] bg-[#121214]/90 backdrop-blur-xl relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.12)]">
            {/* Top Spec Bar */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E10600]" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
              </div>
              <span className="text-[11px] font-tech font-bold text-[#E10600] tracking-widest uppercase">
                COMPANION PROTOCOL · GREY TABBY
              </span>
            </div>

            {/* Exact Canonical Copy */}
            <div className="space-y-3">
              <div>
                <h1 className="font-cyber text-3xl sm:text-4xl font-extrabold text-[#FFFFFF] tracking-wide flex items-center gap-2">
                  <span>Meet Mikey!</span>
                  <span className="text-xl sm:text-2xl text-[#E10600] animate-pulse">🐾</span>
                </h1>
                <p className="font-sans text-sm sm:text-base italic text-neutral-300 font-medium mt-1">
                  Rophe&apos;s very own kitty cat.
                </p>
              </div>

              <div className="pt-1">
                <p className="font-cyber text-base sm:text-lg font-bold text-[#FFFFFF] tracking-wide">
                  1½ years old. Professional troublemaker.
                </p>
              </div>

              <div className="pt-1 pb-2">
                <p className="font-sans text-xs sm:text-sm text-neutral-300 leading-relaxed italic border-l-2 border-[#E10600]/70 pl-3">
                  Tap him to say hi — or drag and drop him around. Just don&apos;t expect him to enjoy the landing.
                </p>
              </div>
            </div>

            {/* Interactive Action Prompt Button */}
            <div className="mt-4 pt-3.5 border-t border-neutral-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={triggerHomepageTransition}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-[#E10600]/40 hover:border-[#E10600] transition-all cursor-pointer shadow-[0_0_16px_rgba(225,6,0,0.25)] active:scale-95"
                aria-label="Tap Mikey to continue into portfolio"
              >
                <span className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse" />
                <span className="font-tech text-xs uppercase tracking-widest text-[#FFFFFF] font-bold group-hover:text-[#FFFFFF]">
                  Tap Mikey to continue →
                </span>
              </button>

              <span className="text-[11px] font-tech text-neutral-400">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
