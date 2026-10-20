import React, { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface SpatialHeroObjectProps {
  isReducedMotion: boolean;
}

export const SpatialHeroObject: React.FC<SpatialHeroObjectProps> = ({
  isReducedMotion
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 320;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // ================== AERO GEOMETRY DEFINITIONS ==================
    // 1. Dual Aerodynamic Rings (Outer Venturi Shroud & Inner Titanium Ring)
    const ringSegments = 40;
    const outerRingRadius = 95;
    const innerRingRadius = 65;

    const outerRing: Point3D[] = [];
    const innerRing: Point3D[] = [];
    for (let i = 0; i < ringSegments; i++) {
      const theta = (i / ringSegments) * Math.PI * 2;
      outerRing.push({
        x: Math.cos(theta) * outerRingRadius,
        y: Math.sin(theta) * outerRingRadius,
        z: Math.sin(theta * 2) * 12 // subtle aerodynamic wave
      });
      innerRing.push({
        x: Math.cos(theta) * innerRingRadius,
        y: Math.sin(theta) * innerRingRadius,
        z: Math.cos(theta * 2) * -8
      });
    }

    // 2. Aerodynamic Stator Blades (12 precision curved titanium aero blades)
    const bladeCount = 12;
    const blades: { root: Point3D; tip: Point3D; camber: Point3D }[] = [];
    for (let i = 0; i < bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2;
      const rootR = 24;
      const tipR = 88;
      const twist = 0.35; // aerodynamic pitch angle

      blades.push({
        root: {
          x: Math.cos(angle) * rootR,
          y: Math.sin(angle) * rootR,
          z: -18
        },
        tip: {
          x: Math.cos(angle + twist) * tipR,
          y: Math.sin(angle + twist) * tipR,
          z: 22
        },
        camber: {
          x: Math.cos(angle + twist * 0.6) * (rootR + tipR) * 0.52,
          y: Math.sin(angle + twist * 0.6) * (rootR + tipR) * 0.52,
          z: 8
        }
      });
    }

    // 3. Central Kinetic Monocoque Core (Precision Octahedral Gimbal)
    const coreScale = 22;
    const coreVertices: Point3D[] = [
      { x: 0, y: -coreScale * 1.5, z: 0 },
      { x: coreScale, y: 0, z: coreScale },
      { x: -coreScale, y: 0, z: coreScale },
      { x: -coreScale, y: 0, z: -coreScale },
      { x: coreScale, y: 0, z: -coreScale },
      { x: 0, y: coreScale * 1.5, z: 0 }
    ];

    const coreEdges: [number, number][] = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [5, 1], [5, 2], [5, 3], [5, 4],
      [1, 2], [2, 3], [3, 4], [4, 1]
    ];

    // Inertial angular physics
    let angleX = 0.45;
    let angleY = 0.6;
    let angleZ = 0.15;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.5;
      targetTiltY = (e.clientX - cx) * 0.0008;
      targetTiltX = (e.clientY - cy) * -0.0008;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let time = 0;

    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, size, size);

      if (!isReducedMotion) {
        angleY += 0.0075;
        angleX = 0.35 + Math.sin(time * 0.4) * 0.08;
        angleZ = Math.cos(time * 0.3) * 0.05;
      }

      // Smooth spring damping for mouse tilt
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;

      const finalRotX = angleX + currentTiltX;
      const finalRotY = angleY + currentTiltY;
      const finalRotZ = angleZ;

      // Precalculate rotation matrices
      const cosX = Math.cos(finalRotX), sinX = Math.sin(finalRotX);
      const cosY = Math.cos(finalRotY), sinY = Math.sin(finalRotY);
      const cosZ = Math.cos(finalRotZ), sinZ = Math.sin(finalRotZ);

      const project = (p: Point3D) => {
        // Rotate Z
        const x0 = p.x * cosZ - p.y * sinZ;
        const y0 = p.x * sinZ + p.y * cosZ;
        const z0 = p.z;

        // Rotate Y
        const x1 = x0 * cosY + z0 * sinY;
        const z1 = -x0 * sinY + z0 * cosY;

        // Rotate X
        const y2 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;

        // True perspective projection
        const cameraDistance = 340;
        const fov = cameraDistance / (cameraDistance + z2);

        return {
          x: size * 0.5 + x1 * fov,
          y: size * 0.5 + y2 * fov,
          z: z2,
          scale: fov
        };
      };

      // 1. Ambient Volumetric Backlight Glow (Ferrari Red aura)
      const glowGrad = ctx.createRadialGradient(
        size * 0.5, size * 0.5, 0,
        size * 0.5, size * 0.5, 130
      );
      glowGrad.addColorStop(0, 'rgba(225, 6, 0, 0.14)');
      glowGrad.addColorStop(0.5, 'rgba(225, 6, 0, 0.04)');
      glowGrad.addColorStop(1, 'rgba(225, 6, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, size, size);

      // 2. Render Outer Aerodynamic Shroud
      const projOuter = outerRing.map(project);
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < projOuter.length; i++) {
        if (i === 0) ctx.moveTo(projOuter[i].x, projOuter[i].y);
        else ctx.lineTo(projOuter[i].x, projOuter[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      // Outer Vernier Telemetry Notches (F1 aero rim calibration)
      for (let i = 0; i < projOuter.length; i += 4) {
        const pt = projOuter[i];
        const alpha = Math.max(0.15, Math.min(0.9, (pt.z + 90) / 180));
        ctx.fillStyle = i % 8 === 0 ? `rgba(225, 6, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, (i % 8 === 0 ? 2.4 : 1.4) * pt.scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 3. Render Inner Counter-Rotating Aerodynamic Ring
      const projInner = innerRing.map(project);
      ctx.save();
      ctx.strokeStyle = 'rgba(225, 6, 0, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < projInner.length; i++) {
        if (i === 0) ctx.moveTo(projInner[i].x, projInner[i].y);
        else ctx.lineTo(projInner[i].x, projInner[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // 4. Render Aerodynamic Stator Blades with Curvature & Specular Edges
      ctx.save();
      for (let i = 0; i < blades.length; i++) {
        const b = blades[i];
        const r = project(b.root);
        const c = project(b.camber);
        const t = project(b.tip);

        const avgZ = (r.z + c.z + t.z) / 3;
        const depthAlpha = Math.max(0.12, Math.min(0.85, (avgZ + 90) / 180));

        // Blade leading edge (Ferrari Red)
        ctx.strokeStyle = `rgba(225, 6, 0, ${depthAlpha * 0.85})`;
        ctx.lineWidth = 1.4 * ((avgZ + 100) / 200);
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.quadraticCurveTo(c.x, c.y, t.x, t.y);
        ctx.stroke();

        // Tip aerodynamic vortex bead (White hot highlight)
        ctx.fillStyle = `rgba(255, 255, 255, ${depthAlpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.6 * t.scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 5. Render Central Kinetic Gimbal Core
      const projCore = coreVertices.map(project);
      ctx.save();
      for (let i = 0; i < coreEdges.length; i++) {
        const [a, b] = coreEdges[i];
        const p1 = projCore[a];
        const p2 = projCore[b];

        const avgZ = (p1.z + p2.z) * 0.5;
        const alpha = Math.max(0.2, Math.min(1.0, (avgZ + 40) / 80));

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.lineWidth = 1.2 * p1.scale;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Core apex luminous nodes
      for (let i = 0; i < projCore.length; i++) {
        const pt = projCore[i];
        const alpha = Math.max(0.3, Math.min(1.0, (pt.z + 40) / 80));

        // Red halo
        ctx.fillStyle = `rgba(225, 6, 0, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4 * pt.scale, 0, Math.PI * 2);
        ctx.fill();

        // White specular center
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.8 * pt.scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (!isReducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isReducedMotion]);

  return (
    <div 
      className="relative flex items-center justify-center pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Studio lighting background vignette */}
      <div className="absolute w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(225,6,0,0.15)_0%,rgba(10,10,10,0)_70%)] pointer-events-none -z-10" />

      <canvas
        ref={canvasRef}
        className="w-[260px] h-[260px] sm:w-[310px] sm:h-[310px] object-contain drop-shadow-[0_12px_40px_rgba(0,0,0,0.85)]"
      />
    </div>
  );
};
