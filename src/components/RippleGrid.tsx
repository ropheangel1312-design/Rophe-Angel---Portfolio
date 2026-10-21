import React, { useEffect, useRef } from 'react';

interface RippleGridProps {
  isReducedMotion?: boolean;
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

/** How hard a dot at `distance` is pushed by a ring of `age` ms */
function ringStrength(distance: number, age: number): number {
  const gap = distance - age * SPEED; // from the dot to the ring's edge
  const spread = 2 * WIDTH * WIDTH;
  const closeness = Math.exp(-(gap * gap) / spread);
  const fade = Math.exp(-age / 900);
  return closeness * fade;
}

export const RippleGrid: React.FC<RippleGridProps> = ({ isReducedMotion = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
      // Clear transparently to preserve the animated liquid motion background underneath
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = HUE;
      ripples = ripples.filter((r) => now - r.born < LIFE);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = ox + i * GAP;
          const y = oy + j * GAP;
          let dx = 0;
          let dy = 0;
          let lift = 0;

          for (let k = 0; k < ripples.length; k++) {
            const r = ripples[k];
            const vx = x - r.x;
            const vy = y - r.y;
            const d = Math.hypot(vx, vy) || 1;
            const s = ringStrength(d, now - r.born);
            // Push outwards from the ripple's centre
            dx += (vx / d) * s * PUSH;
            dy += (vy / d) * s * PUSH;
            lift += s;
          }

          // Pushed dots also brighten, grow, and cast a restrained soft luminous glow
          ctx.globalAlpha = Math.min(0.85, 0.30 + lift * 0.75);
          if (lift > 0.08) {
            ctx.shadowColor = 'rgba(215, 25, 25, 0.35)';
            ctx.shadowBlur = Math.min(lift, 1.2) * 3;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.beginPath();
          ctx.arc(x + dx, y + dy, 1.4 + Math.min(lift, 1.5) * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    const drop = (x: number, y: number) => {
      ripples.push({ x, y, born: performance.now() });
    };

    resize();

    if (isReducedMotion) {
      // Two ripples caught mid-spread and crossing, drawn once
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
      window.addEventListener('resize', handleResizeStill);

      return () => {
        window.removeEventListener('resize', handleResizeStill);
      };
    }

    // Active animation mode
    const handleResize = () => {
      resize();
    };
    window.addEventListener('resize', handleResize);

    const handlePointerDown = (e: PointerEvent) => {
      drop(e.clientX, e.clientY);
      lastClick = performance.now();
    };
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // Initial center ripple
    drop(w / 2, h / 2);

    // Periodically drop subtle ambient ripple if user has not clicked recently
    intervalId = window.setInterval(() => {
      if (performance.now() - lastClick > 6000) {
        drop(w * (0.2 + Math.random() * 0.6), h * (0.2 + Math.random() * 0.6));
      }
    }, 2600);

    const loop = (now: number) => {
      draw(now);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(intervalId);
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
