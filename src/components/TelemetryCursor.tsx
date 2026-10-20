import React, { useEffect, useRef } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  time: number;
  velocity: number;
}

interface PulseRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export const TelemetryCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Disable on touch devices or reduced motion
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || isReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', handleResize);

    const trail: TrailPoint[] = [];
    const pulseRings: PulseRing[] = [];
    let lastX = -100;
    let lastY = -100;
    let lastTime = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.hypot(dx, dy);
      const velocity = Math.min(dist / dt, 12); // px/ms capped

      trail.unshift({
        x: e.clientX,
        y: e.clientY,
        time: now,
        velocity
      });

      // Keep maximum 20 history points for smooth aerodynamic ribbon
      if (trail.length > 20) {
        trail.pop();
      }

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
    };

    const handleClick = (e: MouseEvent) => {
      // Clean, precision studio shutter impulse on click
      pulseRings.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: 42,
        alpha: 0.5,
        speed: 2.2
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const now = performance.now();

      // Prune old trail points (> 260ms lifespan)
      for (let i = trail.length - 1; i >= 0; i--) {
        if (now - trail[i].time > 260) {
          trail.splice(i, 1);
        }
      }

      // 1. Render Fluid Kinetic Ribbon Trail (NO DOT AT TIP)
      if (trail.length >= 3) {
        // Render dual-pass: subtle diffuse outer red halo, then crisp luminous core
        // A. Diffuse outer glow pass
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(225, 6, 0, 0.12)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length - 1; i++) {
          const xc = (trail[i].x + trail[i + 1].x) * 0.5;
          const yc = (trail[i].y + trail[i + 1].y) * 0.5;
          ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
        }
        ctx.stroke();
        ctx.restore();

        // B. Precision tapered Ferrari Red slipstream pass
        for (let i = 0; i < trail.length - 1; i++) {
          const pt = trail[i];
          const nextPt = trail[i + 1];
          const ageRatio = (now - pt.time) / 260; // 0 (newest) to 1 (oldest)
          const alpha = Math.max(0, (1 - ageRatio) * 0.65);
          const weight = Math.max(0.8, (1 - ageRatio) * (1.8 + pt.velocity * 0.35));

          ctx.save();
          ctx.strokeStyle = `rgba(225, 6, 0, ${alpha})`;
          ctx.lineWidth = weight;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(nextPt.x, nextPt.y);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 2. Render Click Impulse Rings
      for (let i = pulseRings.length - 1; i >= 0; i--) {
        const ring = pulseRings[i];
        ring.radius += ring.speed;
        ring.alpha -= 0.016;

        if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
          pulseRings.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(225, 6, 0, ${ring.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 hidden md:block"
      style={{
        mixBlendMode: 'screen',
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    />
  );
};
