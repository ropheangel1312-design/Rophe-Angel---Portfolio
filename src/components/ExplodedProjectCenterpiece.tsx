import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { useScroll, useTransform, useSpring } from 'motion/react';
import { 
  Layers, 
  Rotate3d, 
  Play, 
  Pause, 
  ExternalLink, 
  Github, 
  Terminal, 
  Radio, 
  Cpu, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ChevronRight, 
  ShieldAlert, 
  Sparkles, 
  Minimize2 
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { ProjectItem } from '../types';
import { observeElementVisibility, pageVisibility } from '../utils/performance';

interface ExplodedProjectCenterpieceProps {
  isReducedMotion?: boolean;
}

export const ExplodedProjectCenterpiece: React.FC<ExplodedProjectCenterpieceProps> = ({ 
  isReducedMotion = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const chassisRigRef = useRef<HTMLDivElement>(null);
  const posReadoutRef = useRef<HTMLDivElement>(null);
  const disassemblyReadoutRef = useRef<HTMLSpanElement>(null);
  const baseId = useId();

  // Selected project state (HUSH, ICHNOVA, THADAM)
  const projects = portfolioData.projects;
  const [selectedProjectId, setSelectedProjectId] = useState<string>('hush');
  const currentProject: ProjectItem = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Screenshot viewer within the centerpiece
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState<number>(0);

  // Layer inspection state (null = whole chassis overview, 0..3 = specific layer isolated)
  const [activeLayerIndex, setActiveLayerIndex] = useState<number | null>(null);

  // Manual Explosion override (can be toggled in addition to scroll)
  const [isManualExploded, setIsManualExploded] = useState<boolean>(false);

  // Auto-rotation toggle
  const [isAutoRotatePaused, setIsAutoRotatePaused] = useState<boolean>(false);

  // -------------------------------------------------------------
  // REFS FOR BUTTERY-SMOOTH DRAG (Zero React re-renders on pointer move)
  // -------------------------------------------------------------
  const rotRef = useRef<{ x: number; y: number }>({ x: 8, y: -12 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number }>({ x: 0, y: 0, rotX: 8, rotY: -12 });
  const rafPendingRef = useRef<boolean>(false);
  const ambientAngleRef = useRef<number>(0);
  const explosionValRef = useRef<number>(0);

  // Apply transform directly to the DOM node via GPU compositor
  const applyChassisTransform = useCallback((x: number, y: number) => {
    if (!chassisRigRef.current) return;
    chassisRigRef.current.style.transform = `rotateX(${x.toFixed(2)}deg) rotateY(${y.toFixed(2)}deg)`;
    if (posReadoutRef.current) {
      posReadoutRef.current.textContent = `POS: X[${x.toFixed(0)}°] Y[${y.toFixed(0)}°] // PITCH & YAW`;
    }
  }, []);

  // Update CSS custom property for explosion depth on the chassis
  const setExplosionDepth = useCallback((depth: number) => {
    explosionValRef.current = depth;
    if (chassisRigRef.current) {
      chassisRigRef.current.style.setProperty('--explode', depth.toFixed(3));
    }
    if (disassemblyReadoutRef.current) {
      disassemblyReadoutRef.current.textContent = `DISASSEMBLY: ${Math.round(depth * 100)}%`;
    }
  }, []);

  // Reset active screenshot index and active layer when project changes
  useEffect(() => {
    setActiveScreenshotIdx(0);
    setActiveLayerIndex(null);
  }, [selectedProjectId]);

  // Scroll-linked explosion progress (0 = assembled, 1 = fully exploded)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const rawScrollExplosion = useTransform(
    scrollYProgress,
    [0.1, 0.35, 0.65, 0.9],
    [0, 1, 1, 0]
  );

  const smoothExplosion = useSpring(rawScrollExplosion, {
    stiffness: 140,
    damping: 26,
    mass: 0.7
  });

  // Track scroll explosion without forcing component re-renders
  useEffect(() => {
    if (isReducedMotion) {
      setExplosionDepth(isManualExploded || activeLayerIndex !== null ? 1 : 0);
      return;
    }

    const unsubscribe = smoothExplosion.on('change', (val) => {
      if (isManualExploded || activeLayerIndex !== null) {
        setExplosionDepth(1);
      } else {
        setExplosionDepth(val);
      }
    });

    return () => unsubscribe();
  }, [smoothExplosion, isManualExploded, activeLayerIndex, isReducedMotion, setExplosionDepth]);

  // Keep explosion updated when manual toggle or layer selection changes
  useEffect(() => {
    if (isManualExploded || activeLayerIndex !== null) {
      setExplosionDepth(1);
    } else {
      setExplosionDepth(isReducedMotion ? 0 : smoothExplosion.get());
    }
  }, [isManualExploded, activeLayerIndex, isReducedMotion, setExplosionDepth, smoothExplosion]);

  // Ambient oscillation loop (runs only when in viewport, not dragging, not paused, and reduced-motion is off)
  useEffect(() => {
    if (isReducedMotion) {
      applyChassisTransform(0, 0);
      return;
    }

    let animId: number = 0;
    let lastTime = performance.now();
    let isVisible = true;
    let isTabVisible = !document.hidden;

    const renderLoop = (currentTime: number) => {
      if (!isVisible || !isTabVisible) {
        animId = 0;
        return;
      }

      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isDraggingRef.current && !isAutoRotatePaused) {
        ambientAngleRef.current += dt * 0.9;
        const oscillationY = Math.sin(ambientAngleRef.current) * 3.5;
        applyChassisTransform(rotRef.current.x, rotRef.current.y + oscillationY);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    const startLoopIfNeeded = () => {
      if (!animId && isVisible && isTabVisible && !isReducedMotion) {
        lastTime = performance.now();
        animId = requestAnimationFrame(renderLoop);
      }
    };

    const unsubVis = pageVisibility.subscribe((vis) => {
      isTabVisible = vis;
      if (vis) {
        startLoopIfNeeded();
      } else if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    });

    let unsubObserver = () => {};
    if (containerRef.current) {
      unsubObserver = observeElementVisibility(containerRef.current, (intersecting) => {
        isVisible = intersecting;
        if (intersecting) {
          startLoopIfNeeded();
        } else if (animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      });
    }

    startLoopIfNeeded();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      unsubVis();
      unsubObserver();
    };
  }, [isReducedMotion, isAutoRotatePaused, applyChassisTransform]);

  // -------------------------------------------------------------
  // HIGH-PERFORMANCE POINTER DRAG HANDLERS
  // -------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isReducedMotion) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotRef.current.x,
      rotY: rotRef.current.y
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || isReducedMotion) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Direct, immediate pitch and yaw with bounded limits
    const nextRotX = Math.max(-22, Math.min(25, dragStartRef.current.rotX - deltaY * 0.18));
    const nextRotY = Math.max(-38, Math.min(38, dragStartRef.current.rotY + deltaX * 0.18));

    rotRef.current = { x: nextRotX, y: nextRotY };

    // Batch DOM mutation into requestAnimationFrame (no React state updates!)
    if (!rafPendingRef.current) {
      rafPendingRef.current = true;
      requestAnimationFrame(() => {
        rafPendingRef.current = false;
        applyChassisTransform(rotRef.current.x, rotRef.current.y);
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }
  };

  const handleResetOrientation = () => {
    rotRef.current = { x: 8, y: -12 };
    ambientAngleRef.current = 0;
    applyChassisTransform(8, -12);
  };

  // 4 Documented Spatial Layers with calibrated resting depth & exploded coordinates
  const layerDefinitions = [
    {
      id: 'layer-schematic',
      number: '01',
      tag: 'SCHEMATIC & PROBLEM',
      title: 'Problem & Motivation',
      icon: Cpu,
      zDistance: -125,
      yOffset: -32,
      baseZ: -32,
      explodedZ: -125,
      baseY: -8,
      explodedY: -32,
      accentColor: '#E10600'
    },
    {
      id: 'layer-workflow',
      number: '02',
      tag: 'ARCHITECTURE & APPROACH',
      title: 'How It Was Built',
      icon: Compass,
      zDistance: -42,
      yOffset: -12,
      baseZ: -10,
      explodedZ: -42,
      baseY: -3,
      explodedY: -12,
      accentColor: '#FF4136'
    },
    {
      id: 'layer-interface',
      number: '03',
      tag: 'INTERFACE & TELEMETRY',
      title: 'Working Interface View',
      icon: Terminal,
      zDistance: 50,
      yOffset: 14,
      baseZ: 14,
      explodedZ: 50,
      baseY: 4,
      explodedY: 14,
      accentColor: '#FFFFFF'
    },
    {
      id: 'layer-avionics',
      number: '04',
      tag: 'STACK & CONTRIBUTION',
      title: 'Tech Stack & Personal Role',
      icon: Radio,
      zDistance: 138,
      yOffset: 34,
      baseZ: 38,
      explodedZ: 138,
      baseY: 10,
      explodedY: 34,
      accentColor: '#E10600'
    }
  ];

  return (
    <div 
      ref={containerRef} 
      className="relative w-full my-8 sm:my-12 select-none"
      role="region"
      aria-label="3D Exploded Project Architecture Centerpiece"
    >
      {/* Outer telemetry container */}
      <div className="relative rounded-2xl border border-white/[0.12] bg-[#0A0A0A]/90 backdrop-blur-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)]">
        
        {/* Top Control Bar: Project Switcher Tabs & Telemetry Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-6 bg-black/40 gap-3">
          
          {/* Project Switcher */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none" role="tablist">
            <div className="text-[10px] font-tech font-bold uppercase tracking-widest text-[#E10600] mr-2 shrink-0 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse" />
              SELECT PROJECT:
            </div>
            {projects.map((proj, idx) => {
              const isSelected = proj.id === selectedProjectId;
              return (
                <button
                  key={proj.id}
                  role="tab"
                  id={`${baseId}-tab-${proj.id}`}
                  aria-selected={isSelected}
                  aria-controls={`${baseId}-panel-${proj.id}`}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold tracking-wider transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#E10600] text-white shadow-[0_0_15px_rgba(225,6,0,0.4)] border border-[#E10600]'
                      : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  <span className="text-[10px] opacity-70">0{idx + 1}</span>
                  <span>{proj.title}</span>
                </button>
              );
            })}
          </div>

          {/* Telemetry controls: Explode toggle, Auto-rotate toggle, Reset view */}
          <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
            {/* Explode / Assemble toggle */}
            <button
              onClick={() => {
                setIsManualExploded(!isManualExploded);
                if (activeLayerIndex !== null) setActiveLayerIndex(null);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-tech tracking-wider border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isManualExploded || activeLayerIndex !== null
                  ? 'bg-white/[0.1] text-[#FFFFFF] border-[#E10600]/70'
                  : 'bg-white/[0.03] text-neutral-400 border-white/[0.08] hover:text-white'
              }`}
              title="Toggle exploded spatial separation"
              aria-label="Toggle exploded view"
            >
              <Layers className="w-3.5 h-3.5 text-[#E10600]" />
              <span>{isManualExploded || activeLayerIndex !== null ? 'ASSEMBLE' : 'EXPLODE'}</span>
            </button>

            {/* Auto-rotation pause/play */}
            {!isReducedMotion && (
              <button
                onClick={() => setIsAutoRotatePaused(!isAutoRotatePaused)}
                className={`p-1.5 rounded-md text-[11px] font-tech border transition-colors cursor-pointer ${
                  isAutoRotatePaused
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-white/[0.03] text-neutral-400 border-white/[0.08] hover:text-white'
                }`}
                title={isAutoRotatePaused ? 'Resume rotation' : 'Pause rotation'}
                aria-label={isAutoRotatePaused ? 'Resume rotation' : 'Pause rotation'}
              >
                {isAutoRotatePaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Reset angle */}
            <button
              onClick={handleResetOrientation}
              className="p-1.5 rounded-md text-[11px] font-tech bg-white/[0.03] text-neutral-400 border border-white/[0.08] hover:text-white transition-colors cursor-pointer"
              title="Reset 3D viewing angle"
              aria-label="Reset viewing angle"
            >
              <Rotate3d className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status / Category Banner */}
        <div className="px-4 py-2 sm:px-6 bg-white/[0.02] border-b border-white/[0.05] flex flex-wrap items-center justify-between gap-2 text-xs font-tech">
          <div className="flex items-center gap-2 text-neutral-300">
            <span className="text-[#E10600] font-bold">TYPE //</span>
            <span>{currentProject.category}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-neutral-400">
            {currentProject.isLocalOnly ? (
              <span className="flex items-center gap-1.5 text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <ShieldAlert className="w-3 h-3" />
                <span>LOCAL TESTBED · NOT PUBLICLY HOSTED</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>VERIFIED REPO & DEMO AVAILABLE</span>
              </span>
            )}
            <span className="hidden sm:inline text-neutral-500">|</span>
            <span 
              ref={disassemblyReadoutRef}
              className="hidden sm:inline font-mono text-[10px] text-neutral-500"
            >
              DISASSEMBLY: 0%
            </span>
          </div>
        </div>

        {/* ================= 3D VIEWPORT STAGE ================= */}
        <div 
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full h-[460px] sm:h-[520px] md:h-[580px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
          style={{
            touchAction: 'pan-y' // Allows natural vertical page scrolling on touch devices while enabling horizontal drag-rotation
          }}
        >
          {/* Blueprint background grid lines */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]" />
          
          <div 
            ref={posReadoutRef}
            className="absolute top-4 left-6 pointer-events-none font-tech text-[10px] text-neutral-600 tracking-wider"
          >
            POS: X[8°] Y[-12°] // PITCH & YAW
          </div>
          <div className="absolute top-4 right-6 pointer-events-none font-tech text-[10px] text-neutral-600 tracking-widest hidden sm:block">
            CSS 3D HARDWARE ACCELERATED // 1200PX
          </div>

          {/* Drag instruction pill overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-30">
            <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/[0.1] text-[10px] font-tech text-neutral-300 flex items-center gap-2 shadow-lg">
              <Rotate3d className="w-3 h-3 text-[#E10600]" />
              <span>DRAG TO ROTATE IN 3D · SCROLL TO SEPARATE LAYERS</span>
            </div>
          </div>

          {/* 3D Perspective Parent Container */}
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              perspective: '1200px',
              perspectiveOrigin: '50% 50%'
            }}
          >
            {/* The 3D Rotatable Chassis Rig (Transformed directly via GPU compositor) */}
            <div
              ref={chassisRigRef}
              className="relative w-[310px] sm:w-[460px] md:w-[560px] h-[340px] sm:h-[380px] md:h-[400px] will-change-transform transition-none"
              style={{
                transformStyle: 'preserve-3d',
                transform: isReducedMotion ? 'none' : 'rotateX(8deg) rotateY(-12deg)'
              }}
            >
              {/* ================= LAYER 0: BASE SCHEMATIC & PROBLEM ================= */}
              {(() => {
                const layer = layerDefinitions[0];
                const isFocused = activeLayerIndex === 0;
                const isAnyFocused = activeLayerIndex !== null;
                const isSubdued = isAnyFocused && !isFocused;

                const layerTransform = isReducedMotion
                  ? 'none'
                  : isFocused
                  ? 'translateZ(160px) translateY(0px) scale(1.02)'
                  : `translateZ(calc(${layer.baseZ}px + (${layer.explodedZ - layer.baseZ}px * var(--explode, 0)))) translateY(calc(${layer.baseY}px + (${layer.explodedY - layer.baseY}px * var(--explode, 0))))`;

                return (
                  <div
                    key={layer.id}
                    onClick={() => setActiveLayerIndex(isFocused ? null : 0)}
                    className={`absolute inset-0 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden p-5 flex flex-col justify-between ${
                      isFocused
                        ? 'border-[#E10600] bg-neutral-950/95 ring-2 ring-[#E10600]/60 shadow-[0_0_35px_rgba(225,6,0,0.35)] z-40'
                        : isSubdued
                        ? 'border-white/[0.06] bg-black/80 opacity-25 shadow-none z-0'
                        : 'border-white/15 hover:border-[#E10600]/60 border-l-4 border-l-[#E10600]/70 bg-[linear-gradient(135deg,rgba(16,16,20,0.84)_0%,rgba(10,10,12,0.76)_100%)] shadow-[0_12px_28px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.14)] z-0'
                    }`}
                    style={{
                      transform: layerTransform,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#E10600_1px,transparent_1px)] bg-[size:16px_16px]" />
                    
                    <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-tech font-bold bg-[#E10600]/25 text-[#E10600] border border-[#E10600]/50 shadow-[0_0_6px_rgba(225,6,0,0.3)]">
                          LAYER {layer.number}
                        </span>
                        <span className="font-tech text-xs tracking-wider text-neutral-200 font-semibold">
                          {layer.tag}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {isFocused ? '● PINNED' : 'CLICK TO INSPECT'}
                      </span>
                    </div>

                    <div className="relative z-10 my-2">
                      <div className="p-2.5 rounded-lg bg-black/45 border border-white/[0.06]">
                        <div className="text-[10px] font-tech text-[#E10600] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3 text-[#E10600]" />
                          THE PROBLEM WE SET OUT TO SOLVE
                        </div>
                        <p className="font-body text-xs sm:text-sm text-neutral-200 leading-relaxed line-clamp-3 sm:line-clamp-4">
                          {currentProject.problem}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-tech text-neutral-400">
                      <span className="truncate max-w-[280px]">HARD PART: {currentProject.challenges}</span>
                      <span className="text-[#E10600] shrink-0 font-mono font-bold">FOUNDATION // L01</span>
                    </div>
                  </div>
                );
              })()}

              {/* ================= LAYER 1: ARCHITECTURE & APPROACH ================= */}
              {(() => {
                const layer = layerDefinitions[1];
                const isFocused = activeLayerIndex === 1;
                const isAnyFocused = activeLayerIndex !== null;
                const isSubdued = isAnyFocused && !isFocused;

                const layerTransform = isReducedMotion
                  ? 'none'
                  : isFocused
                  ? 'translateZ(160px) translateY(0px) scale(1.02)'
                  : `translateZ(calc(${layer.baseZ}px + (${layer.explodedZ - layer.baseZ}px * var(--explode, 0)))) translateY(calc(${layer.baseY}px + (${layer.explodedY - layer.baseY}px * var(--explode, 0))))`;

                return (
                  <div
                    key={layer.id}
                    onClick={() => setActiveLayerIndex(isFocused ? null : 1)}
                    className={`absolute inset-0 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden p-5 flex flex-col justify-between ${
                      isFocused
                        ? 'border-[#FF4136] bg-neutral-950/95 ring-2 ring-[#FF4136]/60 shadow-[0_0_35px_rgba(255,65,54,0.35)] z-40'
                        : isSubdued
                        ? 'border-white/[0.06] bg-black/80 opacity-25 shadow-none z-10'
                        : 'border-white/18 hover:border-[#FF4136]/60 border-l-4 border-l-[#FF4136]/70 bg-[linear-gradient(135deg,rgba(18,18,22,0.68)_0%,rgba(10,10,14,0.58)_100%)] shadow-[0_14px_30px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.16)] z-10'
                    }`}
                    style={{
                      transform: layerTransform,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-tech font-bold bg-[#FF4136]/25 text-[#FF4136] border border-[#FF4136]/50 shadow-[0_0_6px_rgba(255,65,54,0.3)]">
                          LAYER {layer.number}
                        </span>
                        <span className="font-tech text-xs tracking-wider text-neutral-200 font-semibold">
                          {layer.tag}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {isFocused ? '● PINNED' : 'CLICK TO INSPECT'}
                      </span>
                    </div>

                    <div className="relative z-10 my-2 space-y-1.5">
                      <div className="text-[10px] font-tech text-neutral-400 font-bold uppercase tracking-widest mb-1">
                        HOW IT WAS ASSEMBLED ({currentProject.approach.length} PHASES)
                      </div>
                      {currentProject.approach.slice(0, 3).map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-neutral-200 font-body bg-black/35 p-1.5 rounded border border-white/[0.04]">
                          <span className="font-tech text-[10px] text-[#FF4136] font-bold mt-0.5">0{idx + 1}.</span>
                          <span className="line-clamp-1">{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="relative z-10 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-tech text-neutral-400">
                      <span>PIPELINE VALIDATED</span>
                      <span className="text-[#FF4136] font-mono font-bold">PIPELINE // L02</span>
                    </div>
                  </div>
                );
              })()}

              {/* ================= LAYER 2: INTERFACE VIEW ================= */}
              {(() => {
                const layer = layerDefinitions[2];
                const isFocused = activeLayerIndex === 2;
                const isAnyFocused = activeLayerIndex !== null;
                const isSubdued = isAnyFocused && !isFocused;
                const currentScreenshot = currentProject.screenshots[activeScreenshotIdx] || currentProject.screenshots[0];

                const layerTransform = isReducedMotion
                  ? 'none'
                  : isFocused
                  ? 'translateZ(160px) translateY(0px) scale(1.02)'
                  : `translateZ(calc(${layer.baseZ}px + (${layer.explodedZ - layer.baseZ}px * var(--explode, 0)))) translateY(calc(${layer.baseY}px + (${layer.explodedY - layer.baseY}px * var(--explode, 0))))`;

                return (
                  <div
                    key={layer.id}
                    onClick={() => setActiveLayerIndex(isFocused ? null : 2)}
                    className={`absolute inset-0 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden p-4 flex flex-col justify-between ${
                      isFocused
                        ? 'border-white bg-neutral-950/95 ring-2 ring-white/50 shadow-[0_0_35px_rgba(255,255,255,0.25)] z-40'
                        : isSubdued
                        ? 'border-white/[0.06] bg-black/80 opacity-25 shadow-none z-20'
                        : 'border-white/20 hover:border-white/50 border-l-4 border-l-white/70 bg-[linear-gradient(135deg,rgba(18,18,22,0.50)_0%,rgba(10,10,14,0.40)_100%)] shadow-[0_16px_36px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.22)] z-20'
                    }`}
                    style={{
                      transform: layerTransform,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-tech font-bold bg-white/20 text-white border border-white/40 shadow-[0_0_6px_rgba(255,255,255,0.2)]">
                          LAYER {layer.number}
                        </span>
                        <span className="font-tech text-xs tracking-wider text-white font-bold">
                          {layer.tag}
                        </span>
                      </div>
                      
                      {currentProject.screenshots.length > 1 && (
                        <div 
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {currentProject.screenshots.map((_, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => setActiveScreenshotIdx(sIdx)}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-tech tracking-wider transition-colors cursor-pointer ${
                                activeScreenshotIdx === sIdx
                                  ? 'bg-[#E10600] text-white shadow-[0_0_8px_rgba(225,6,0,0.5)]'
                                  : 'bg-white/[0.08] text-neutral-300 hover:text-white'
                              }`}
                              title={`View screenshot 0${sIdx + 1}`}
                            >
                              VIEW {sIdx + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative z-10 my-1.5 rounded-lg overflow-hidden border border-white/[0.12] bg-black/60 h-[190px] sm:h-[220px] group shadow-inner">
                      {currentScreenshot ? (
                        <img
                          src={currentScreenshot.url}
                          alt={currentScreenshot.alt || currentProject.title}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-tech text-xs text-neutral-500">
                          PREVIEW NOT AVAILABLE
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded bg-black/85 backdrop-blur-md border border-white/10 text-[10px] font-tech text-neutral-200">
                        <span className="truncate max-w-[200px] sm:max-w-[300px]">
                          {currentScreenshot?.caption || currentProject.title}
                        </span>
                        <span className="text-[#E10600] font-bold shrink-0">ACTUAL SCREEN</span>
                      </div>
                    </div>

                    <div className="relative z-10 pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-tech text-neutral-400">
                      <span>WORKING UI SCREENSHOT</span>
                      <span className="text-white font-mono font-bold">VIEWPORT // L03</span>
                    </div>
                  </div>
                );
              })()}

              {/* ================= LAYER 3: TECH STACK & CONTRIBUTION (FOREGROUND LAYER) ================= */}
              {/* Refactored with optical liquid-glass transparency so rear layers show through and around it */}
              {(() => {
                const layer = layerDefinitions[3];
                const isFocused = activeLayerIndex === 3;
                const isAnyFocused = activeLayerIndex !== null;
                const isSubdued = isAnyFocused && !isFocused;

                const layerTransform = isReducedMotion
                  ? 'none'
                  : isFocused
                  ? 'translateZ(160px) translateY(0px) scale(1.02)'
                  : `translateZ(calc(${layer.baseZ}px + (${layer.explodedZ - layer.baseZ}px * var(--explode, 0)))) translateY(calc(${layer.baseY}px + (${layer.explodedY - layer.baseY}px * var(--explode, 0))))`;

                return (
                  <div
                    key={layer.id}
                    onClick={() => setActiveLayerIndex(isFocused ? null : 3)}
                    className={`absolute inset-0 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden p-5 flex flex-col justify-between ${
                      isFocused
                        ? 'border-[#E10600] bg-neutral-950/95 ring-2 ring-[#E10600]/60 shadow-[0_0_35px_rgba(225,6,0,0.4)] z-40'
                        : isSubdued
                        ? 'border-white/[0.06] bg-black/80 opacity-25 shadow-none z-30'
                        : 'border-white/30 hover:border-[#E10600]/85 border-l-4 border-l-[#E10600] bg-[linear-gradient(135deg,rgba(18,18,24,0.34)_0%,rgba(10,10,14,0.24)_100%)] shadow-[0_22px_48px_rgba(0,0,0,0.65),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_0_24px_rgba(225,6,0,0.06)] z-30'
                    }`}
                    style={{
                      transform: layerTransform,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* Top edge specular highlight line */}
                    <div className="absolute top-0 inset-x-5 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between border-b border-white/[0.12] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-tech font-bold bg-[#E10600] text-white border border-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.4)]">
                          LAYER {layer.number}
                        </span>
                        <span className="font-tech text-xs tracking-wider text-white font-bold">
                          {layer.tag}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-neutral-300">
                        {isFocused ? '● PINNED' : 'CLICK TO INSPECT'}
                      </span>
                    </div>

                    {/* Selective translucent content pads for 100% text readability while keeping card transparent */}
                    <div className="relative z-10 my-2 space-y-2">
                      <div className="p-2.5 rounded-lg bg-black/55 backdrop-blur-[2px] border border-white/[0.08]">
                        <div className="text-[10px] font-tech text-[#E10600] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] shadow-[0_0_6px_rgba(225,6,0,0.8)]" />
                          WHAT I PERSONALLY WORKED ON
                        </div>
                        <p className="font-body text-xs text-white leading-relaxed line-clamp-2">
                          {currentProject.myContribution}
                        </p>
                      </div>

                      <div className="p-2 rounded-lg bg-black/45 backdrop-blur-[2px] border border-white/[0.06]">
                        <div className="text-[10px] font-tech text-neutral-300 font-bold uppercase tracking-widest mb-1.5">
                          TOOLS & TECHNOLOGIES
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {currentProject.technologies.slice(0, 5).map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-tech tracking-wider bg-white/[0.08] border border-white/20 text-white font-semibold shadow-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div 
                      className="relative z-10 pt-2 border-t border-white/[0.08] flex items-center justify-between"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        {currentProject.links && currentProject.links.length > 0 ? (
                          currentProject.links.map((link) => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded text-[10px] font-tech font-bold tracking-wider bg-[#E10600] hover:bg-[#c00500] text-white flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(225,6,0,0.35)]"
                            >
                              {link.type === 'github' ? <Github className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                              <span>{link.label}</span>
                            </a>
                          ))
                        ) : (
                          <span className="px-2 py-1 rounded text-[10px] font-tech text-neutral-300 bg-black/50 border border-white/10">
                            LOCAL EXPERIMENT ONLY
                          </span>
                        )}
                      </div>
                      <span className="text-[#E10600] font-mono text-[10px] font-bold">FOREGROUND // L04</span>
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        </div>

        {/* ================= LAYER INSPECTION HUD & CONTROLS ================= */}
        <div className="border-t border-white/[0.08] bg-black/60 p-4 sm:p-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-tech font-bold tracking-wider text-neutral-400">
                INSPECT COMPONENT LAYER:
              </span>
              {activeLayerIndex !== null && (
                <button
                  onClick={() => setActiveLayerIndex(null)}
                  className="text-[10px] font-tech text-[#E10600] hover:underline flex items-center gap-1 ml-2 cursor-pointer"
                >
                  <Minimize2 className="w-3 h-3" />
                  <span>RESET TO OVERVIEW</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
              {layerDefinitions.map((layer, lIdx) => {
                const isSelected = activeLayerIndex === lIdx;
                const LayerIcon = layer.icon;
                return (
                  <button
                    key={layer.id}
                    onClick={() => setActiveLayerIndex(isSelected ? null : lIdx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-tech tracking-wider border transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#E10600] text-white border-[#E10600] shadow-[0_0_12px_rgba(225,6,0,0.4)]'
                        : 'bg-white/[0.03] text-neutral-400 border-white/[0.08] hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <LayerIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>L{layer.number} // {layer.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
            {activeLayerIndex === null ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-tech text-[#E10600] font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentProject.title} · OVERVIEW</span>
                  </div>
                  <p className="font-body text-xs sm:text-sm text-neutral-300 max-w-3xl">
                    {currentProject.overview}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => setActiveLayerIndex(2)}
                    className="px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-tech text-white flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>VIEW UI SCREENSHOT</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#E10600]" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-tech font-bold bg-[#E10600] text-white">
                      LAYER {layerDefinitions[activeLayerIndex].number}
                    </span>
                    <span className="font-display font-bold text-sm text-white">
                      {layerDefinitions[activeLayerIndex].title}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveLayerIndex(null)}
                    className="text-xs font-tech text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    CLOSE [ESC]
                  </button>
                </div>

                {activeLayerIndex === 0 && (
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] font-tech text-neutral-400 uppercase tracking-widest mb-1">
                        PROBLEM & MOTIVATION
                      </div>
                      <p className="font-body text-xs sm:text-sm text-neutral-200 leading-relaxed">
                        {currentProject.problem}
                      </p>
                    </div>
                    <div>
                      <div className="text-[10px] font-tech text-neutral-400 uppercase tracking-widest mb-1">
                        WHERE WE RAN INTO CHALLENGES
                      </div>
                      <p className="font-body text-xs sm:text-sm text-neutral-300 leading-relaxed">
                        {currentProject.challenges}
                      </p>
                    </div>
                  </div>
                )}

                {activeLayerIndex === 1 && (
                  <div className="space-y-3">
                    <div className="text-[10px] font-tech text-neutral-400 uppercase tracking-widest mb-1">
                      STEP-BY-STEP IMPLEMENTATION
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {currentProject.approach.map((step, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-black/40 border border-white/[0.06] flex items-start gap-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-tech font-bold bg-[#E10600]/20 text-[#E10600] shrink-0 mt-0.5">
                            0{idx + 1}
                          </span>
                          <span className="font-body text-xs text-neutral-200">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeLayerIndex === 2 && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-[10px] font-tech text-neutral-400 uppercase tracking-widest">
                        INTERFACE PREVIEWS
                      </div>
                      {currentProject.screenshots.length > 1 && (
                        <div className="flex items-center gap-1.5">
                          {currentProject.screenshots.map((s, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => setActiveScreenshotIdx(sIdx)}
                              className={`px-2 py-1 rounded text-xs font-tech cursor-pointer ${
                                activeScreenshotIdx === sIdx
                                  ? 'bg-[#E10600] text-white'
                                  : 'bg-white/[0.04] text-neutral-400 hover:text-white'
                              }`}
                            >
                              SCREEN 0{sIdx + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="font-body text-xs sm:text-sm text-neutral-200">
                      {currentProject.screenshots[activeScreenshotIdx]?.caption || currentProject.title}
                    </p>
                  </div>
                )}

                {activeLayerIndex === 3 && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-tech text-neutral-400 uppercase tracking-widest mb-1">
                        MY ACTUAL CONTRIBUTION
                      </div>
                      <p className="font-body text-xs sm:text-sm text-neutral-200">
                        {currentProject.myContribution}
                      </p>
                    </div>

                    {currentProject.outcome && (
                      <div>
                        <div className="text-[10px] font-tech text-emerald-400 uppercase tracking-widest mb-1">
                          RESULT / DEMO OUTCOME
                        </div>
                        <p className="font-body text-xs sm:text-sm text-neutral-200">
                          {currentProject.outcome}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
                      {currentProject.links && currentProject.links.length > 0 ? (
                        currentProject.links.map((link) => (
                          <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-tech font-bold tracking-wider bg-[#E10600] hover:bg-[#c00500] text-white flex items-center gap-1.5 transition-colors"
                          >
                            {link.type === 'github' ? <Github className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                            <span>{link.label}</span>
                          </a>
                        ))
                      ) : (
                        <div className="text-xs font-tech text-amber-400/90 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                          <Info className="w-3.5 h-3.5" />
                          <span>Built as a personal local testbed. No public live deployment or public repository for this item.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
