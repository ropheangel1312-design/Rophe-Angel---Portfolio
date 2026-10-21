import React, { useState, useEffect, useRef, useCallback } from 'react';
import { domainAudio } from '../utils/audio';
import { MikeySprite, CatState } from './MikeySprite';

interface MikeyTheCatProps {
  isReducedMotion?: boolean;
  initialX?: number;
}

/**
 * Mikey the Grey Tabby Cat — Interactive Companion with Simulated Gravity
 * 
 * - Recognisable grey tabby cat with silver-grey fur, darker charcoal stripes,
 *   lighter silvery muzzle & chest, distinct forehead 'M', and emerald-gold eyes.
 * - Sized slightly bigger (~76px wide) for clear visibility and effortless grabbing.
 * - Draggable ANYWHERE in the visible viewport (top, middle, sides, bottom).
 * - Smooth simulated gravity on release: accelerates naturally downward and lands with
 *   a subtle squish reaction.
 * - Autonomous walking is strictly restricted to the bottom of the visible viewport.
 * - Interactive sounds:
 *   - Soft warm purr when touched / tapped without dragging.
 *   - Playful cat hiss when dragged and dropped upon release.
 * - Non-blocking pointer events: clicks on other elements pass right through.
 * - Full prefers-reduced-motion support.
 */
export const MikeyTheCat: React.FC<MikeyTheCatProps> = ({ isReducedMotion = false, initialX }) => {
  // Height offset from bottom for base ground standing position
  const BASE_BOTTOM_OFFSET = 62; // px from viewport bottom
  const CAT_WIDTH = 76; // sprite width
  const CAT_HEIGHT = 58; // sprite height
  const MIN_X = 12;

  // Viewport-based coordinates
  const [posX, setPosX] = useState<number>(() => {
    if (typeof window === 'undefined') return 120;
    if (initialX !== undefined) return Math.max(MIN_X, Math.min(window.innerWidth - CAT_WIDTH - 24, initialX));
    return Math.max(MIN_X, Math.min(window.innerWidth - CAT_WIDTH - 24, 140));
  });

  const [posY, setPosY] = useState<number>(() => {
    if (typeof window === 'undefined') return 600;
    return window.innerHeight - BASE_BOTTOM_OFFSET;
  });

  const [targetX, setTargetX] = useState<number>(posX);
  const [facingLeft, setFacingLeft] = useState<boolean>(false);
  const [catState, setCatState] = useState<CatState>('idle');
  const [transitionDuration, setTransitionDuration] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [showHeart, setShowHeart] = useState<boolean>(false);
  const [showHissIcon, setShowHissIcon] = useState<boolean>(false);
  const [pawStep, setPawStep] = useState<number>(0);

  // Drag tracking refs
  const isDraggingRef = useRef<boolean>(false);
  const dragStartPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartCatPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);

  // Physics animation ref
  const fallRafRef = useRef<number | null>(null);

  // Timers
  const moveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const posXRef = useRef(posX);
  posXRef.current = posX;
  const posYRef = useRef(posY);
  posYRef.current = posY;
  const catStateRef = useRef(catState);
  catStateRef.current = catState;

  // Periodic blinking
  useEffect(() => {
    const scheduleBlink = () => {
      const nextDelay = 2200 + Math.random() * 4500;
      blinkTimerRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 180);
      }, nextDelay);
    };
    scheduleBlink();
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  // Paw walking cycle during 'walking' state
  useEffect(() => {
    if (catState === 'walking') {
      stepTimerRef.current = setInterval(() => {
        setPawStep((prev) => (prev + 1) % 4);
      }, 130);
    } else {
      setPawStep(0);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    }
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [catState]);

  // Main autonomous roaming along the bottom of the viewport
  const roamToNextDestination = useCallback(() => {
    if (typeof window === 'undefined' || isReducedMotion || isDraggingRef.current) return;
    if (catStateRef.current === 'falling' || catStateRef.current === 'landing') return;

    const width = window.innerWidth;
    const maxX = Math.max(MIN_X + 60, width - CAT_WIDTH - 16);

    const currentX = posXRef.current;

    // Pick an unpredictable horizontal destination across the bottom strip
    let nextX = MIN_X + Math.random() * (maxX - MIN_X);

    // Ensure it travels a noticeable distance (at least 90px away from current)
    if (Math.abs(nextX - currentX) < 90) {
      nextX = currentX < width / 2 
        ? Math.min(maxX, currentX + 160 + Math.random() * 180)
        : Math.max(MIN_X, currentX - 160 - Math.random() * 180);
    }

    // Keep strict Y at bottom of visible viewport
    const groundY = window.innerHeight - BASE_BOTTOM_OFFSET;

    const distance = Math.abs(nextX - currentX);
    const speed = 50 + Math.random() * 25; // px per second
    const duration = Math.max(2.0, Math.min(distance / speed, 6.5));

    setFacingLeft(nextX < currentX);
    setTransitionDuration(duration);
    setCatState('walking');
    setTargetX(nextX);
    setPosY(groundY);

    if (moveTimerRef.current) clearTimeout(moveTimerRef.current);

    moveTimerRef.current = setTimeout(() => {
      if (isDraggingRef.current || catStateRef.current === 'falling') return;

      setPosX(nextX);
      setTransitionDuration(0);

      // Natural pause at destination: idle look around or curious head tilt
      const pauseDuration = 2000 + Math.random() * 3500;
      const isCurious = Math.random() > 0.45;
      setCatState(isCurious ? 'curious' : 'idle');

      moveTimerRef.current = setTimeout(() => {
        roamToNextDestination();
      }, pauseDuration);
    }, duration * 1000);
  }, [isReducedMotion, BASE_BOTTOM_OFFSET, CAT_WIDTH, MIN_X]);

  // Start roaming on mount
  useEffect(() => {
    if (isReducedMotion) {
      if (typeof window !== 'undefined') {
        setPosX(window.innerWidth - CAT_WIDTH - 30);
        setPosY(window.innerHeight - BASE_BOTTOM_OFFSET);
      }
      return;
    }

    const initialTimer = setTimeout(() => {
      roamToNextDestination();
    }, 1500);

    return () => {
      clearTimeout(initialTimer);
      if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      if (fallRafRef.current) cancelAnimationFrame(fallRafRef.current);
    };
  }, [isReducedMotion, roamToNextDestination, BASE_BOTTOM_OFFSET, CAT_WIDTH]);

  // Keep Mikey inside bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      const width = window.innerWidth;
      const groundY = window.innerHeight - BASE_BOTTOM_OFFSET;
      
      setPosX((prev) => Math.max(MIN_X, Math.min(prev, width - CAT_WIDTH - 16)));
      // If idle/walking/landing, stay at bottom
      if (!isDraggingRef.current && catStateRef.current !== 'falling') {
        setPosY(groundY);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [BASE_BOTTOM_OFFSET, CAT_WIDTH, MIN_X]);

  // =========================================================================
  // Physics Gravity Fall Simulation
  // =========================================================================
  const startGravityFall = useCallback((initialX: number, startY: number) => {
    if (typeof window === 'undefined') return;

    const groundY = window.innerHeight - BASE_BOTTOM_OFFSET;
    
    // If already at or past ground level, land immediately
    if (startY >= groundY - 3) {
      setPosY(groundY);
      setCatState('landing');
      setTimeout(() => {
        setCatState('idle');
        resumeTimerRef.current = setTimeout(() => {
          roamToNextDestination();
        }, 1800);
      }, 250);
      return;
    }

    setCatState('falling');
    setTransitionDuration(0);

    let currentY = startY;
    let vy = 40; // initial downward speed (px/s)
    const gravity = 1900; // downward acceleration (px/s^2)
    const maxFallSpeed = 1600; // terminal velocity
    let lastTime = performance.now();

    const stepFall = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;

      vy = Math.min(maxFallSpeed, vy + gravity * dt);
      currentY += vy * dt;

      if (currentY >= groundY) {
        // Reached the ground!
        currentY = groundY;
        setPosY(groundY);
        setCatState('landing');

        // Brief landing compression reaction
        setTimeout(() => {
          setCatState('idle');

          // Resume autonomous roaming after a natural pause
          if (!isReducedMotion) {
            if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = setTimeout(() => {
              roamToNextDestination();
            }, 2000);
          }
        }, 260);

        return;
      }

      setPosY(currentY);
      fallRafRef.current = requestAnimationFrame(stepFall);
    };

    if (fallRafRef.current) cancelAnimationFrame(fallRafRef.current);
    fallRafRef.current = requestAnimationFrame(stepFall);
  }, [BASE_BOTTOM_OFFSET, isReducedMotion, roamToNextDestination]);

  // =========================================================================
  // Pointer Drag Handling (Mouse & Touch) — Drag Anywhere in Viewport
  // =========================================================================
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Capture pointer so dragging is smooth anywhere on the screen
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Safe fallback
    }

    // Stop autonomous roaming and any ongoing fall loop
    if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    if (fallRafRef.current) cancelAnimationFrame(fallRafRef.current);

    const currentX = catState === 'walking' ? targetX : posXRef.current;
    const currentY = posYRef.current;

    // Freeze at current spot immediately
    setPosX(currentX);
    setPosY(currentY);
    setTransitionDuration(0);

    dragStartPointerRef.current = { x: e.clientX, y: e.clientY };
    dragStartCatPosRef.current = { x: currentX, y: currentY };
    hasDraggedRef.current = false;
    isDraggingRef.current = true;

    setCatState('dragging');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - dragStartPointerRef.current.x;
    const deltaY = e.clientY - dragStartPointerRef.current.y;

    if (Math.hypot(deltaX, deltaY) > 6) {
      hasDraggedRef.current = true;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const groundY = height - BASE_BOTTOM_OFFSET;

    // Freely draggable ANYWHERE in the visible viewport:
    // Top boundary: 52px (under nav bar)
    // Bottom boundary: groundY
    // Left boundary: MIN_X
    // Right boundary: width - CAT_WIDTH - MIN_X
    const rawX = dragStartCatPosRef.current.x + deltaX;
    const rawY = dragStartCatPosRef.current.y + deltaY;

    const clampedX = Math.max(MIN_X, Math.min(width - CAT_WIDTH - MIN_X, rawX));
    const clampedY = Math.max(52, Math.min(groundY, rawY));

    // Update facing direction based on horizontal pull
    if (deltaX < -2) setFacingLeft(true);
    if (deltaX > 2) setFacingLeft(false);

    setPosX(clampedX);
    setPosY(clampedY);
  };

  const finishDrag = (pointerId?: number, currentTarget?: HTMLDivElement) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (currentTarget && pointerId !== undefined) {
      try {
        currentTarget.releasePointerCapture(pointerId);
      } catch {
        // Safe fallback
      }
    }

    const groundY = typeof window !== 'undefined' ? window.innerHeight - BASE_BOTTOM_OFFSET : posY;
    const currentCatX = posXRef.current;
    const currentCatY = posYRef.current;

    if (hasDraggedRef.current) {
      // 1. DRAG AND DROP COMPLETED:
      // Play a short, playful cat hiss sound once per completed drag!
      domainAudio.playCatHiss();

      // Show brief playful hiss bubble
      setShowHissIcon(true);
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = setTimeout(() => {
        setShowHissIcon(false);
      }, 1200);

      // Natural release and falling under simulated gravity
      startGravityFall(currentCatX, currentCatY);
    } else {
      // 2. TAP / CLICK WITHOUT DRAGGING:
      // Play a soft, warm cat-purring sound!
      domainAudio.playCatPurr();

      setCatState('purring');
      setShowHeart(true);

      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = setTimeout(() => {
        setShowHeart(false);
        setCatState('idle');
      }, 1400);

      // If somehow clicked slightly above ground, return gently
      if (currentCatY < groundY - 4) {
        startGravityFall(currentCatX, currentCatY);
      } else {
        setPosY(groundY);
        if (!isReducedMotion) {
          if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
          resumeTimerRef.current = setTimeout(() => {
            roamToNextDestination();
          }, 2000);
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(e.pointerId, e.currentTarget);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(e.pointerId, e.currentTarget);
  };

  // Keyboard accessibility: ArrowLeft / ArrowRight to nudge Mikey along the bottom, Space/Enter to pet
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (typeof window === 'undefined') return;
    const width = window.innerWidth;
    const step = 32;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setFacingLeft(true);
      setPosX((prev) => Math.max(MIN_X, prev - step));
      setCatState('walking');
      setTimeout(() => setCatState('idle'), 300);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setFacingLeft(false);
      setPosX((prev) => Math.min(width - CAT_WIDTH - MIN_X, prev + step));
      setCatState('walking');
      setTimeout(() => setCatState('idle'), 300);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      domainAudio.playCatPurr();
      setCatState('purring');
      setShowHeart(true);
      setTimeout(() => {
        setShowHeart(false);
        setCatState('idle');
      }, 1400);
    }
  };

  // Coordinates for rendering
  const currentRenderX = catState === 'walking' && !isDraggingRef.current ? targetX : posX;
  const currentRenderY = posY;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Mikey Draggable Interactive Anchor */}
      <div
        role="slider"
        tabIndex={0}
        aria-label="Mikey the Grey Tabby Cat — Draggable companion. Grab to drag anywhere; release to let gravity drop him back."
        aria-valuemin={MIN_X}
        aria-valuemax={typeof window !== 'undefined' ? window.innerWidth - CAT_WIDTH - MIN_X : 800}
        aria-valuenow={Math.round(posX)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        className={`absolute pointer-events-auto select-none group touch-none outline-hidden w-[76px] h-[58px] ${
          catState === 'dragging' ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          left: 0,
          top: 0,
          transform: `translate3d(${currentRenderX}px, ${currentRenderY}px, 0)`,
          transition:
            catState !== 'dragging' && catState !== 'falling' && transitionDuration > 0
              ? `transform ${transitionDuration}s cubic-bezier(0.25, 1, 0.45, 1)`
              : 'none',
          willChange: 'transform'
        }}
      >
        {/* Heart / Purr bubble on tap */}
        {showHeart && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce">
            <div className="px-2.5 py-0.5 rounded-full bg-white/[0.14] backdrop-blur-md border border-white/[0.25] shadow-[0_4px_16px_rgba(225,6,0,0.4)] flex items-center gap-1.5">
              <span className="text-[#E10600] text-xs">♥</span>
              <span className="font-tech text-[11px] text-[#FFFFFF] tracking-wider uppercase font-bold">
                purr~
              </span>
            </div>
          </div>
        )}

        {/* Hiss bubble on drag release */}
        {showHissIcon && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce">
            <div className="px-2.5 py-0.5 rounded-full bg-[#18181A]/90 backdrop-blur-md border border-[#E10600]/40 shadow-[0_4px_16px_rgba(225,6,0,0.3)] flex items-center gap-1.5">
              <span className="text-[#E10600] text-xs font-bold">!</span>
              <span className="font-tech text-[11px] text-[#FFFFFF] tracking-wider uppercase font-bold">
                hiss!
              </span>
            </div>
          </div>
        )}

        {/* Liquid-glass name tag tooltip on hover (when not purring or hissing) */}
        {!showHeart && !showHissIcon && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <span className="px-2.5 py-0.5 rounded-md bg-[#121214]/90 backdrop-blur-md border border-white/[0.14] text-[10px] font-tech font-bold uppercase tracking-widest text-[#FFFFFF] shadow-lg whitespace-nowrap flex items-center gap-1.5">
              <span className="text-[#E10600]">🐾</span>
              <span>Mikey</span>
            </span>
          </div>
        )}

        {/* Grey Tabby Cat SVG Sprite (76px x 58px) */}
        <MikeySprite
          catState={catState}
          isBlinking={isBlinking}
          pawStep={pawStep}
          facingLeft={facingLeft}
          idPrefix="mikey_companion_"
          className="w-[76px] h-[58px]"
        />
      </div>
    </div>
  );
};
