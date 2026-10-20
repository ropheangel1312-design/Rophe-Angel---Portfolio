import React, { useEffect, useRef } from 'react';

interface AmbientMotionSystemProps {
  isReducedMotion: boolean;
}

interface LightShaft {
  angle: number;
  width: number;
  speed: number;
  phase: number;
  alpha: number;
  color: 'red' | 'white';
}

interface MicroSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  depth: number;
  alpha: number;
  baseAlpha: number;
  pulsePhase: number;
  color: 'red' | 'white';
}

export const AmbientMotionSystem: React.FC<AmbientMotionSystemProps> = ({
  isReducedMotion
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Inertial smooth cursor coordinates (spring-damped physics)
    let currentX = width * 0.5;
    let currentY = height * 0.4;
    let targetX = width * 0.5;
    let targetY = height * 0.4;
    let velocityX = 0;
    let velocityY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Studio lighting shafts (anamorphic volumetric passes)
    const shafts: LightShaft[] = [
      { angle: -0.42, width: 420, speed: 0.00035, phase: 0.0, alpha: 0.035, color: 'red' },
      { angle: -0.38, width: 280, speed: 0.00045, phase: 2.1, alpha: 0.025, color: 'white' },
      { angle: -0.45, width: 550, speed: 0.00028, phase: 4.2, alpha: 0.03, color: 'red' }
    ];

    // High-end ambient micro-sparks (delicate, depth-mapped studio luminescence)
    const sparkCount = 28;
    const sparks: MicroSpark[] = [];
    for (let i = 0; i < sparkCount; i++) {
      const depth = Math.random() * 0.7 + 0.3; // 0.3 to 1.0
      sparks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15 * depth,
        vy: -(Math.random() * 0.22 + 0.08) * depth, // slow ambient buoyancy
        size: (Math.random() * 1.2 + 0.6) * depth,
        depth,
        alpha: (Math.random() * 0.3 + 0.1) * depth,
        baseAlpha: (Math.random() * 0.3 + 0.1) * depth,
        pulsePhase: Math.random() * Math.PI * 2,
        color: Math.random() < 0.35 ? 'red' : 'white'
      });
    }

    let time = 0;

    const render = () => {
      time += 0.006;
      ctx.clearRect(0, 0, width, height);

      // Smooth inertia tracking
      const spring = 0.035;
      const damping = 0.82;
      const ax = (targetX - currentX) * spring;
      const ay = (targetY - currentY) * spring;
      velocityX = (velocityX + ax) * damping;
      velocityY = (velocityY + ay) * damping;
      currentX += velocityX;
      currentY += velocityY;

      const normX = (currentX / width - 0.5) * 2;
      const normY = (currentY / height - 0.5) * 2;

      // 1. Subtle Anamorphic Studio Light Sweep (Directional Caustic Horizon)
      shafts.forEach((shaft) => {
        ctx.save();
        const offsetX = Math.sin(time * 0.8 + shaft.phase) * (width * 0.18) + normX * 45;
        const originX = width * 0.5 + offsetX;
        const originY = -50;

        ctx.translate(originX, originY);
        ctx.rotate(shaft.angle);

        const grad = ctx.createLinearGradient(-shaft.width * 0.5, 0, shaft.width * 0.5, 0);
        if (shaft.color === 'red') {
          grad.addColorStop(0, 'rgba(225, 6, 0, 0)');
          grad.addColorStop(0.5, `rgba(225, 6, 0, ${shaft.alpha})`);
          grad.addColorStop(1, 'rgba(225, 6, 0, 0)');
        } else {
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(0.5, `rgba(255, 255, 255, ${shaft.alpha})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(-shaft.width * 0.5, 0, shaft.width, height * 1.6);
        ctx.restore();
      });

      // 2. Precision Paddock Horizon Telemetry Marks (Hairline spatial calipers)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.016)';
      ctx.lineWidth = 1;

      // Subtle horizontal datum lines with parallax
      const horizonCount = 4;
      for (let i = 1; i <= horizonCount; i++) {
        const y = (height / (horizonCount + 1)) * i + normY * (i * 3.5);
        ctx.beginPath();
        ctx.moveTo(width * 0.05, y);
        ctx.lineTo(width * 0.95, y);
        ctx.stroke();

        // Technical tick notches at datum endpoints
        ctx.beginPath();
        ctx.moveTo(width * 0.05, y - 3);
        ctx.lineTo(width * 0.05, y + 3);
        ctx.moveTo(width * 0.95, y - 3);
        ctx.lineTo(width * 0.95, y + 3);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Delicate Ambient Studio Particles (Depth-of-field soft focus)
      for (let i = 0; i < sparks.length; i++) {
        const p = sparks[i];

        // Motion update
        p.x += p.vx;
        p.y += p.vy;

        // Soft deflection if cursor passes close
        const dx = p.x - currentX;
        const dy = p.y - currentY;
        const distSq = dx * dx + dy * dy;
        const maxDist = 140;
        if (distSq < maxDist * maxDist && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / maxDist) * 0.35 * p.depth;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // Screen wrap
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Organic luminescence breathing
        p.alpha = p.baseAlpha + Math.sin(time * 1.8 + p.pulsePhase) * 0.05;

        // Render with soft radial falloff (depth-of-field look)
        const parallaxX = p.x + normX * p.depth * 18;
        const parallaxY = p.y + normY * p.depth * 18;

        ctx.save();
        const rad = p.size * (1 + (1 - p.depth) * 0.8); // background particles blur larger
        const glow = ctx.createRadialGradient(
          parallaxX, parallaxY, 0,
          parallaxX, parallaxY, rad * 2.2
        );

        if (p.color === 'red') {
          glow.addColorStop(0, `rgba(225, 6, 0, ${Math.max(0, p.alpha * 1.2)})`);
          glow.addColorStop(0.5, `rgba(225, 6, 0, ${Math.max(0, p.alpha * 0.4)})`);
          glow.addColorStop(1, 'rgba(225, 6, 0, 0)');
        } else {
          glow.addColorStop(0, `rgba(255, 255, 255, ${Math.max(0, p.alpha)})`);
          glow.addColorStop(0.6, `rgba(255, 255, 255, ${Math.max(0, p.alpha * 0.25)})`);
          glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(parallaxX, parallaxY, rad * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isReducedMotion]);

  if (isReducedMotion) {
    return (
      <div 
        className="fixed inset-0 pointer-events-none -z-10 bg-[#0A0A0A] f1-telemetry-grid opacity-30"
        aria-hidden="true" 
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      style={{
        pointerEvents: 'none',
        mixBlendMode: 'screen'
      }}
      aria-hidden="true"
    />
  );
};
