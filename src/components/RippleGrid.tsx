import React, { useEffect, useRef } from 'react';
import { pageVisibility } from '../utils/performance';

interface RippleGridProps {
  isReducedMotion?: boolean;
  isPaused?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  born: number;
}

// Exact physics & layout parameters from original CodePen
const GAP = 22; // px between dots
const SPEED = 0.32; // px per ms
const WIDTH = 26; // the ring's half-width, as the Gaussian's sigma
const LIFE = 3400; // ms, by which a ring is at 2% and dropping it is invisible
const PUSH = 11; // px, the furthest a dot is shoved
const HUE = '#A31D1D'; // Muted, softly luminous deep red (Ferrari-inspired restrained tone)
const SIGMA_SPREAD = 2 * WIDTH * WIDTH;
const MAX_INFLUENCE_DIST = 3 * WIDTH; // Distance beyond which Gaussian closeness is < 0.01

/** How hard a dot at `distance` is pushed by a ring of `age` ms */
function ringStrength(distance: number, age: number): number {
  const gap = distance - age * SPEED; // from the dot to the ring's edge
  const closeness = Math.exp(-(gap * gap) / SIGMA_SPREAD);
  const fade = Math.exp(-age / 900);
  return closeness * fade;
}

/**
 * High-Performance RippleGrid
 * 
 * Game-Engine Optimization Techniques:
 * - Instancing & Batching: Batches thousands of static dots into a single path draw call,
 *   reducing canvas draw calls by over 95%.
 * - Spatial Culling: Only calculates expensive Gaussian exponential equations on dots
 *   within active ripple wave-front zones.
 * - Render Scheduling / Sleep State: Automatically suspends the requestAnimationFrame loop
 *   when all ripples have completed, waking up instantly upon user interaction or ambient trigger.
 * - Resource Management: Suspends animation loop when page tab is hidden or isPaused is true.
 */
export const RippleGrid: React.FC<RippleGridProps> = ({ isReducedMotion = false, isPaused = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const startLoopRef = useRef<(() => void) | null>(null);
  const stopLoopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isPaused) {
      stopLoopRef.current?.();
    } else {
      startLoopRef.current?.();
    }
  }, [isPaused]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let ox = 0;
    let oy = 0;
    let ripples: Ripple[] = [];
    let animId = 0;
    let intervalId = 0;
    let lastClick = performance.now();
    let isLoopRunning = false;
    let isVisible = pageVisibility.getIsVisible();

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(w / GAP);
      rows = Math.floor(h / GAP);
      // Centre the grid in the frame
      ox = (w - (cols - 1) * GAP) / 2;
      oy = (h - (rows - 1) * GAP) / 2;
    }

    function draw(now: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = HUE;

      ripples = ripples.filter((r) => now - r.born < LIFE);

      // Precompute bounding data for active ripples to cull distant dots instantly
      const activeRipples = ripples.map((r) => {
        const age = now - r.born;
        const currentRadius = age * SPEED;
        return {
          r,
          age,
          currentRadius,
          minDistSq: Math.max(0, currentRadius - MAX_INFLUENCE_DIST) ** 2,
          maxDistSq: (currentRadius + MAX_INFLUENCE_DIST) ** 2,
          boxMinX: r.x - (currentRadius + MAX_INFLUENCE_DIST),
          boxMaxX: r.x + (currentRadius + MAX_INFLUENCE_DIST),
          boxMinY: r.y - (currentRadius + MAX_INFLUENCE_DIST),
          boxMaxY: r.y + (currentRadius + MAX_INFLUENCE_DIST),
        };
      });

      // 1. Batched path for undisturbed dots (huge draw call reduction)
      ctx.beginPath();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.30;

      // Collection for perturbed dots that need individual styling/glow
      const perturbedDots: Array<{
        x: number;
        y: number;
        dx: number;
        dy: number;
        lift: number;
      }> = [];

      for (let i = 0; i < cols; i++) {
        const x = ox + i * GAP;
        for (let j = 0; j < rows; j++) {
          const y = oy + j * GAP;

          // Quick spatial check: Is dot inside the bounding box of ANY active ripple?
          let isNearAny = false;
          for (let k = 0; k < activeRipples.length; k++) {
            const ar = activeRipples[k];
            if (x >= ar.boxMinX && x <= ar.boxMaxX && y >= ar.boxMinY && y <= ar.boxMaxY) {
              const dx = x - ar.r.x;
              const dy = y - ar.r.y;
              const distSq = dx * dx + dy * dy;
              if (distSq >= ar.minDistSq && distSq <= ar.maxDistSq) {
                isNearAny = true;
                break;
              }
            }
          }

          if (!isNearAny) {
            // Undisturbed dot: Add to the single batched base path
            ctx.moveTo(x + 1.4, y);
            ctx.arc(x, y, 1.4, 0, Math.PI * 2);
          } else {
            // Disturbed dot: Calculate full ripple physics
            let dx = 0;
            let dy = 0;
            let lift = 0;

            for (let k = 0; k < activeRipples.length; k++) {
              const ar = activeRipples[k];
              const vx = x - ar.r.x;
              const vy = y - ar.r.y;
              const d = Math.hypot(vx, vy) || 1;
              const s = ringStrength(d, ar.age);
              dx += (vx / d) * s * PUSH;
              dy += (vy / d) * s * PUSH;
              lift += s;
            }

            if (lift < 0.005) {
              ctx.moveTo(x + 1.4, y);
              ctx.arc(x, y, 1.4, 0, Math.PI * 2);
            } else {
              perturbedDots.push({ x, y, dx, dy, lift });
            }
          }
        }
      }

      // Draw all base dots in ONE single fill call!
      ctx.fill();

      // 2. Render perturbed dots with their dynamic glow, lift, and expansion
      for (let p = 0; p < perturbedDots.length; p++) {
        const dot = perturbedDots[p];
        ctx.globalAlpha = Math.min(0.85, 0.30 + dot.lift * 0.75);

        if (dot.lift > 0.08) {
          ctx.shadowColor = 'rgba(215, 25, 25, 0.35)';
          ctx.shadowBlur = Math.min(dot.lift, 1.2) * 3;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(dot.x + dot.dx, dot.y + dot.dy, 1.4 + Math.min(dot.lift, 1.5) * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    const startLoopIfNeeded = () => {
      if (isLoopRunning || !isVisible || isPausedRef.current) return;
      isLoopRunning = true;
      const loop = (now: number) => {
        if (isPausedRef.current) {
          isLoopRunning = false;
          return;
        }
        draw(now);
        // Sleep if no active ripples remain
        if (ripples.length === 0) {
          isLoopRunning = false;
          return;
        }
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
      isLoopRunning = false;
    };

    const drop = (x: number, y: number) => {
      if (isPausedRef.current) return;
      ripples.push({ x, y, born: performance.now() });
      startLoopIfNeeded();
    };

    startLoopRef.current = () => {
      if (ripples.length === 0 && w > 0 && h > 0) {
        drop(w / 2, h / 2);
      } else {
        startLoopIfNeeded();
      }
    };
    stopLoopRef.current = stopLoop;

    resize();

    if (isReducedMotion) {
      // Reduced motion: static rendering
      const still = () => {
        const r = Math.min(w, h) * 0.3;
        ripples = [
          { x: w * 0.36, y: h * 0.5, born: -r / SPEED },
          { x: w * 0.64, y: h * 0.5, born: -(r * 0.8) / SPEED },
        ];
        draw(0);
      };
      still();

      const handleResizeStill = () => {
        resize();
        still();
      };
      window.addEventListener('resize', handleResizeStill, { passive: true });
      return () => {
        window.removeEventListener('resize', handleResizeStill);
      };
    }

    // Active animation mode
    const handleResize = () => {
      resize();
      draw(performance.now());
      if (ripples.length > 0) {
        startLoopIfNeeded();
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const handlePointerDown = (e: PointerEvent) => {
      drop(e.clientX, e.clientY);
      lastClick = performance.now();
    };
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // Initial center ripple
    drop(w / 2, h / 2);

    // Periodically drop subtle ambient ripple if user has not clicked recently
    intervalId = window.setInterval(() => {
      if (!isVisible) return;
      if (performance.now() - lastClick > 6000) {
        drop(w * (0.2 + Math.random() * 0.6), h * (0.2 + Math.random() * 0.6));
      }
    }, 2600);

    // Tab visibility handling: suspend when backgrounded
    const unsubscribeVisibility = pageVisibility.subscribe((vis) => {
      isVisible = vis;
      if (vis && ripples.length > 0) {
        startLoopIfNeeded();
      } else if (!vis && isLoopRunning) {
        cancelAnimationFrame(animId);
        isLoopRunning = false;
      }
    });

    return () => {
      startLoopRef.current = null;
      stopLoopRef.current = null;
      cancelAnimationFrame(animId);
      clearInterval(intervalId);
      unsubscribeVisibility();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] w-full h-full"
      style={{
        pointerEvents: 'none',
        display: 'block',
      }}
      aria-label="A grid of dots. Click anywhere to drop a ripple into it"
    />
  );
};
