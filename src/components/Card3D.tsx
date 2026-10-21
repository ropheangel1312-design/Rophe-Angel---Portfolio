import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'motion/react';

export interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  index?: number;
  isReducedMotion?: boolean;
  maxTilt?: number; // maximum degrees of tilt, default 5.5
  depth?: number; // translateZ on hover in px, default 10
  showGlare?: boolean;
  glareColor?: string;
  lateralTilt?: boolean; // left tilt / right tilt on entrance
  role?: string;
  tabIndex?: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  'aria-haspopup'?: boolean | 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid';
  'aria-label'?: string;
}

const cinematicEase = [0.16, 1, 0.3, 1] as const;

export const Card3D = forwardRef<HTMLDivElement, Card3DProps>(({
  children,
  className = '',
  containerClassName = '',
  index = 0,
  isReducedMotion = false,
  maxTilt = 5.5,
  depth = 10,
  showGlare = true,
  glareColor = 'rgba(225, 6, 0, 0.12)',
  lateralTilt = true,
  role,
  tabIndex,
  onClick,
  onKeyDown,
  'aria-haspopup': ariaHasPopup,
  'aria-label': ariaLabel,
  style,
  ...restProps
}, ref) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const tiltRafRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

  useEffect(() => {
    return () => {
      if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion) return;
    if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(pointer: fine)').matches) return;
    const card = innerRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    const tiltX = -ny * (maxTilt * 2);
    const tiltY = nx * (maxTilt * 2);
    const glareX = (nx + 0.5) * 100;
    const glareY = (ny + 0.5) * 100;

    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    tiltRafRef.current = requestAnimationFrame(() => {
      if (!card) return;
      card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(${depth}px) translateY(-3px)`;
      card.style.boxShadow = `${(-tiltY * 1.8).toFixed(1)}px ${(tiltX * 1.8 + 14).toFixed(1)}px 32px rgba(0, 0, 0, 0.88), 0 0 24px rgba(225, 6, 0, 0.14)`;

      if (glareRef.current && showGlare) {
        glareRef.current.style.opacity = '0.14';
        glareRef.current.style.background = `radial-gradient(circle 320px at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255, 255, 255, 0.14), ${glareColor} 40%, transparent 70%)`;
      }
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    setIsHovered(false);
    const card = innerRef.current;
    if (card) {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) translateY(0px)';
      card.style.boxShadow = '';
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  // Lateral spatial divergence for group stagger (left card tilts slightly left, right slightly right)
  const lateralRotations = [-5, 0, 5];
  const initialRotateY = lateralTilt ? (lateralRotations[index % 3] ?? 0) : 0;
  const staggerDelay = Math.min(0.3, (index % 6) * 0.08);

  const entranceInitial = isReducedMotion
    ? { opacity: 0, y: 14 }
    : {
        opacity: 0.35, // Visibly present right away - genuine 3D movement is visible as it enters
        y: 38,
        z: -120,
        rotateX: 14,
        rotateY: initialRotateY,
        scale: 0.94
      };

  const entranceAnimate = isReducedMotion
    ? { opacity: 1, y: 0 }
    : {
        opacity: 1,
        y: 0,
        z: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1
      };

  const entranceTransition = isReducedMotion
    ? { duration: 0.35, delay: staggerDelay, ease: 'easeOut' as const }
    : {
        opacity: { duration: 0.35, ease: 'easeOut' as const, delay: staggerDelay },
        y: { duration: 0.85, ease: cinematicEase, delay: staggerDelay },
        z: { duration: 0.85, ease: cinematicEase, delay: staggerDelay },
        rotateX: { duration: 0.9, ease: cinematicEase, delay: staggerDelay },
        rotateY: { duration: 0.9, ease: cinematicEase, delay: staggerDelay },
        scale: { duration: 0.85, ease: cinematicEase, delay: staggerDelay }
      };

  return (
    <div
      className={`w-full flex ${containerClassName}`}
      style={{
        perspective: isReducedMotion ? 'none' : '1100px',
        perspectiveOrigin: 'center center'
      }}
    >
      <motion.div
        initial={entranceInitial}
        whileInView={entranceAnimate}
        viewport={{ once: true, amount: 0.15, margin: '0px 0px -30px 0px' }}
        transition={entranceTransition}
        style={{
          transformStyle: isReducedMotion ? 'flat' : 'preserve-3d',
          willChange: isReducedMotion ? 'auto' : 'transform, opacity'
        }}
        className="flex w-full"
      >
        <div
          ref={innerRef}
          role={role}
          tabIndex={tabIndex}
          onClick={onClick}
          onKeyDown={onKeyDown}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-haspopup={ariaHasPopup}
          aria-label={ariaLabel}
          style={{
            transformStyle: isReducedMotion ? 'flat' : 'preserve-3d',
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) translateY(0px)',
            transition: isHovered
              ? 'border-color 0.25s ease-out'
              : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease-out',
            ...style
          }}
          className={`relative group w-full ${className}`}
          {...restProps}
        >
          {showGlare && (
            <div
              ref={glareRef}
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none rounded-[inherit] opacity-0 transition-opacity duration-300 z-20"
            />
          )}
          {children}
        </div>
      </motion.div>
    </div>
  );
});

Card3D.displayName = 'Card3D';
