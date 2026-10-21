import React, { useRef, useEffect, useState, useCallback, ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface MagneticProps {
  magneticDistance?: number;
  strength?: number;
  stiffness?: number;
  damping?: number;
  className?: string;
  children: ReactNode | ((isHovering: boolean) => ReactNode);
}

/**
 * Magnetic component based on user attachment mag_ty_ce080b50.txt.
 * Uses spring physics to smoothly attract interactive elements towards the cursor
 * when within magneticDistance, and gently springs back when the cursor moves away.
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

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < magneticDistance) {
        const pull = Math.pow(1 - dist / magneticDistance, 0.5);
        x.set(dx * pull * strength);
        y.set(dy * pull * strength);
        setIsHovering(true);
      } else {
        x.set(0);
        y.set(0);
        setIsHovering(false);
      }
    },
    [x, y, magneticDistance, strength]
  );

  useEffect(() => {
    // Respect reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove]);

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
