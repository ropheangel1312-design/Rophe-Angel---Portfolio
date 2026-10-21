import React, { useRef, useEffect, useState, useCallback, ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { sharedPointer, geometryCache, observeElementVisibility } from '../utils/performance';

interface MagneticProps {
  magneticDistance?: number;
  strength?: number;
  stiffness?: number;
  damping?: number;
  className?: string;
  children: ReactNode | ((isHovering: boolean) => ReactNode);
}

/**
 * High-Performance Magnetic Component
 * 
 * Optimizations (Zero Feature Loss):
 * - Shared Input Tracker: Eliminates redundant window.addEventListener('mousemove') per instance.
 * - Shared Geometry Cache: Caches bounding box and center calculations, eliminating layout thrashing.
 * - Frustum Culling / LOD: Bypasses magnetic distance calculations when element is outside the viewport.
 * - Exact spring physics, hover state, and visual pull choreography preserved.
 */
export function Magnetic({
  magneticDistance = 160,
  strength = 0.45,
  stiffness = 80,
  damping = 12,
  className = '',
  children,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness, damping });
  const springY = useSpring(y, { stiffness, damping });
  const [isHovering, setIsHovering] = useState(false);
  const isHoveringRef = useRef(false);
  const isVisibleRef = useRef(true);

  // Update hover state safely avoiding redundant React re-renders
  const setHoverSafe = useCallback((hover: boolean) => {
    if (isHoveringRef.current !== hover) {
      isHoveringRef.current = hover;
      setIsHovering(hover);
    }
  }, []);

  useEffect(() => {
    // Respect reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const el = ref.current;
    if (!el) return;

    // 1. Frustum culling: Only calculate magnetic pull when element is in viewport
    const unobserve = observeElementVisibility(el, (inView) => {
      isVisibleRef.current = inView;
      if (!inView && isHoveringRef.current) {
        x.set(0);
        y.set(0);
        setHoverSafe(false);
      }
    });

    // 2. Shared pointer subscription (single window listener, throttled to animation frames)
    const unsubscribePointer = sharedPointer.subscribe((clientX, clientY) => {
      if (!isVisibleRef.current || !ref.current) return;

      // 3. Cached geometry (avoids forced synchronous reflows on every mousemove)
      const { cx, cy } = geometryCache.getGeometry(ref.current);
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < magneticDistance) {
        const pull = Math.pow(1 - dist / magneticDistance, 0.5);
        x.set(dx * pull * strength);
        y.set(dy * pull * strength);
        setHoverSafe(true);
      } else {
        if (isHoveringRef.current) {
          x.set(0);
          y.set(0);
          setHoverSafe(false);
        }
      }
    });

    return () => {
      unobserve();
      unsubscribePointer();
    };
  }, [x, y, magneticDistance, strength, setHoverSafe]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY, display: 'inline-block' }}
    >
      {typeof children === 'function' ? children(isHovering) : children}
    </motion.div>
  );
}

export default Magnetic;
