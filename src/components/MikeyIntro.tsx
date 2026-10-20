import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MikeySprite, CatState } from './MikeySprite';
import { domainAudio } from '../utils/audio';

interface MikeyIntroProps {
  onContinue: (landingX?: number) => void;
  isReducedMotion: boolean;
  isInteractive?: boolean;
}

/**
 * MikeyIntro — Dedicated Character Reveal Scene
 * 
 * - Positioned prominently before the homepage becomes visible.
 * - Displays Mikey as a large, beautifully detailed grey tabby illustrated character.
 * - Canonical copy:
 *   "Meet Mikey!"
 *   "Rophe's very own kitty cat."
 *   "1½ years old. Professional troublemaker."
 *   "Tap him to say hi — or drag and drop him around. Just don't expect him to enjoy the landing."
 * - Interactive:
 *   - Idle animations (blinking, head curious tilt, tail swishing).
 *   - Draggable anywhere: if dragged and dropped, plays short playful hiss, shows hiss bubble, and falls with gravity back down.
 *   - Tapping Mikey triggers a warm purr, heart bubble, and smoothly scales Mikey down while gliding to the bottom viewport to unveil the homepage.
 * - Strict palette: #0A0A0A black, #E10600 Ferrari red, #FFFFFF white.
 */
export const MikeyIntro: React.FC<MikeyIntroProps> = ({
  onContinue,
  isReducedMotion,
  isInteractive = true
}) => {
  // Cat animation states
  const [catState, setCatState] = useState<CatState>('idle');
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [showHeart, setShowHeart] = useState<boolean>(false);
  const [showHissIcon, setShowHissIcon] = useState<boolean>(false);
  const [facingLeft, setFacingLeft] = useState<boolean>(false);

  // Position state during the intro scene
  // Mikey is initially positioned prominently in the hero area
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(3.2); // Large presentation size (~243px wide)
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isTransitioningDown, setIsTransitioningDown] = useState<boolean>(false);

  // Drag tracking refs
  const isDraggingRef = useRef<boolean>(false);
  const dragStartPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);
  const fallRafRef = useRef<number | null>(null);

  // Timers
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const curiousTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onContinueRef = useRef(onContinue);
  onContinueRef.current = onContinue;

  // Resting anchor position in the scene
  const restingPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const calculateRestingPosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    if (w < 768) {
      // Mobile: Centered horizontally, upper half
      return {
        x: w * 0.5 - 38,
        y: h * 0.32 - 29
      };
    } else {
      // Desktop: Left-center hero spotlight
      return {
        x: w * 0.34 - 38,
        y: h * 0.48 - 29
      };
    }
  }, []);

  // Initialize and schedule subtle idle behaviors
  useEffect(() => {
    const initialPos = calculateRestingPosition();
    restingPosRef.current = initialPos;
    setPos(initialPos);

    if (isReducedMotion) {
      setScale(2.6);
      return;
    }

    // Natural blinking
    const scheduleBlink = () => {
      const delay = 2200 + Math.random() * 3800;
      blinkTimerRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 180);
      }, delay);
    };
    scheduleBlink();

    // Occasional curious head tilt or ear twitch
    const scheduleCurious = () => {
      const delay = 3500 + Math.random() * 4500;
      curiousTimerRef.current = setTimeout(() => {
        if (!isDraggingRef.current && catState === 'idle') {
          setCatState('curious');
          setTimeout(() => {
            setCatState('idle');
            scheduleCurious();
          }, 2000);
        } else {
          scheduleCurious();
        }
      }, delay);
    };
    scheduleCurious();

    const handleResize = () => {
      if (!isDraggingRef.current && !isExiting) {
        const next = calculateRestingPosition();
        restingPosRef.current = next;
        setPos(next);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
      if (curiousTimerRef.current) clearTimeout(curiousTimerRef.current);
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      if (fallRafRef.current) cancelAnimationFrame(fallRafRef.current);
    };
  }, [calculateRestingPosition, isReducedMotion, catState, isExiting]);

  // Physics gravity fall simulation after completed drag in the intro scene
  const startGravityFallToIntroRest = (startX: number, startY: number) => {
    if (typeof window === 'undefined') return;
    const targetY = restingPosRef.current.y;

    if (startY >= targetY - 4) {
      setPos({ x: startX, y: targetY });
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
        setPos({ x: startX, y: targetY });
        setCatState('landing');
        setTimeout(() => {
          setCatState('idle');
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
    if (isExiting || !isInteractive) return;
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
    if (!isDraggingRef.current || isExiting) return;

    const dx = e.clientX - dragStartPointerRef.current.x;
    const dy = e.clientY - dragStartPointerRef.current.y;

    if (Math.hypot(dx, dy) > 8) {
      hasDraggedRef.current = true;
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    const rawX = dragStartPosRef.current.x + dx;
    const rawY = dragStartPosRef.current.y + dy;

    // Keep within visible viewport
    const clampedX = Math.max(20, Math.min(w - 90, rawX));
    const clampedY = Math.max(30, Math.min(h - 80, rawY));

    if (dx < -3) setFacingLeft(true);
    if (dx > 3) setFacingLeft(false);

    setPos({ x: clampedX, y: clampedY });
  };

  const finishDragOrTap = (pointerId?: number, currentTarget?: HTMLDivElement) => {
    if (!isDraggingRef.current || isExiting) return;
    isDraggingRef.current = false;

    if (currentTarget && pointerId !== undefined) {
      try {
        currentTarget.releasePointerCapture(pointerId);
      } catch {
        // Safe fallback
      }
    }

    if (hasDraggedRef.current) {
      // 1. Drag & drop completed: Play playful hiss and fall under gravity
      domainAudio.playCatHiss();
      setShowHissIcon(true);
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = setTimeout(() => {
        setShowHissIcon(false);
      }, 1200);

      startGravityFallToIntroRest(pos.x, pos.y);
    } else {
      // 2. Click or Tap: Trigger the transition to the main homepage!
      triggerHomepageTransition();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    finishDragOrTap(e.pointerId, e.currentTarget);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    finishDragOrTap(e.pointerId, e.currentTarget);
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isExiting || !isInteractive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerHomepageTransition();
    }
  };

  // Smooth transition from Mikey introduction scene to homepage
  const triggerHomepageTransition = () => {
    if (isExiting || !isInteractive) return;
    setIsExiting(true);

    // Warm cat purr and heart bubble
    domainAudio.playCatPurr();
    setCatState('purring');
    setShowHeart(true);

    if (isReducedMotion) {
      setTimeout(() => {
        onContinueRef.current();
      }, 350);
      return;
    }

    // Step 1: Trigger scale down and glide toward the bottom edge
    setIsTransitioningDown(true);

    const targetGroundX = Math.max(24, Math.min(window.innerWidth - 120, window.innerWidth * 0.22));
    const targetGroundY = window.innerHeight - 62;

    // Animate Mikey scaling from large introduction size (~3.2) down to normal companion size (1.0)
    // and moving down to the bottom viewport roaming line
    setPos({ x: targetGroundX, y: targetGroundY });
    setScale(1.0);

    // Step 2: Once Mikey settles at the bottom and background dissolves, complete the transition
    setTimeout(() => {
      onContinueRef.current(targetGroundX);
    }, 780);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-[#0A0A0A] flex flex-col items-center justify-center p-4 sm:p-8 select-none transition-opacity duration-700 ${
        isTransitioningDown ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="region"
      aria-label="Meet Mikey Introduction"
    >
      {/* Background Subtle Telemetry Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 f1-telemetry-grid" />

      {/* Atmospheric Ferrari Red Radial Glow behind Mikey */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(225,6,0,0.18)_0%,transparent_70%)] pointer-events-none transition-all duration-700"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* Main Content Layout: Intro Card & Typography (Fades out when transitioning) */}
      <div
        className={`relative z-10 w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 transition-all duration-500 ${
          isTransitioningDown ? 'opacity-0 -translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Placeholder spacer for Mikey's prominent hero area on desktop */}
        <div className="w-[220px] sm:w-[260px] md:w-[280px] h-[190px] sm:h-[220px] md:h-[240px] shrink-0 pointer-events-none" />

        {/* Introduction Text & Liquid-Glass Spec Sheet */}
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl p-6 sm:p-7 border border-white/[0.12] bg-[#121214]/90 backdrop-blur-xl relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.12)]"
          >
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

            {/* Exact Required Copy */}
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

            {/* Interactive Action Prompt */}
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

      {/* Prominently Positioned, Draggable & Interactive Mikey */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Meet Mikey the Cat — Tap to say hi and continue to portfolio, or drag and drop him around"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        className={`fixed z-50 select-none group touch-none outline-hidden ${
          catState === 'dragging' ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale})`,
          transformOrigin: 'top left',
          transition:
            isTransitioningDown
              ? 'transform 0.75s cubic-bezier(0.25, 1, 0.45, 1)'
              : catState !== 'dragging' && catState !== 'falling'
              ? 'transform 0.35s ease-out'
              : 'none',
          willChange: 'transform'
        }}
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
        {!showHeart && !showHissIcon && !isExiting && (
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
  );
};
