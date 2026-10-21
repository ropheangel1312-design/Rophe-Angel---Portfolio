import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ConstellationNode, constellationNodes } from '../data/constellationData';
import { observeElementVisibility, pageVisibility } from '../utils/performance';
import { 
  RotateCcw, 
  ExternalLink, 
  X, 
  Sparkles, 
  Layers, 
  Code2, 
  ArrowUpRight, 
  Compass,
  CheckCircle2
} from 'lucide-react';

interface ConstellationSkillsProps {
  isReducedMotion: boolean;
}

interface StarParticle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  layer: number;
}

export const ConstellationSkills: React.FC<ConstellationSkillsProps> = ({ isReducedMotion }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const animFrameRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  const isTabVisibleRef = useRef<boolean>(pageVisibility.getIsVisible());
  const shockwaveRef = useRef<{ x: number; y: number; radius: number; maxRadius: number; active: boolean }>({
    x: 0,
    y: 0,
    radius: 0,
    maxRadius: 0,
    active: false
  });

  const selectedNode = constellationNodes.find((n) => n.id === selectedNodeId) || null;

  // Major constellation connections (bone topology between nodes)
  const constellationBones = [
    ['ai-systems', 'software-dev'],
    ['ai-systems', 'research-systems'],
    ['research-systems', 'product-thinking'],
    ['product-thinking', 'business-ops'],
    ['business-ops', 'creative-comm'],
    ['creative-comm', 'software-dev'],
    ['ai-systems', 'creative-comm'],
    ['research-systems', 'creative-comm'],
    ['product-thinking', 'creative-comm']
  ];

  // Handle escape key to dismiss panel and reset to overview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedNodeId) {
        setSelectedNodeId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId]);

  // Handle canvas animation & generative constellation simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: StarParticle[] = [];

    // Resize handler with high-DPI crispness
    const resize = () => {
      if (!canvas || !container || !ctx) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 460);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Initialize generative starfield
      const starCount = Math.floor(Math.min(width, 1000) * 0.08) + 40;
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const layer = Math.random() < 0.6 ? 1 : Math.random() < 0.85 ? 2 : 3;
        stars.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * (0.15 / layer),
          vy: (Math.random() - 0.5) * (0.15 / layer),
          radius: layer === 1 ? 0.75 : layer === 2 ? 1.25 : 1.8,
          alpha: layer === 1 ? 0.25 : layer === 2 ? 0.5 : 0.75,
          twinkleSpeed: 0.0015 + Math.random() * 0.002,
          twinkleOffset: Math.random() * Math.PI * 2,
          layer
        });
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Frustum culling via performance utility: pauses loop when container is offscreen
    const unobserveVisibility = observeElementVisibility(container, (inView) => {
      isVisibleRef.current = inView;
      if (inView && !animFrameRef.current && !isReducedMotion) {
        lastTime = performance.now();
        animFrameRef.current = requestAnimationFrame(render);
      }
    });

    // Tab visibility handling: pauses loop when user switches browser tab
    const unsubscribeTab = pageVisibility.subscribe((vis) => {
      isTabVisibleRef.current = vis;
      if (vis && isVisibleRef.current && !animFrameRef.current && !isReducedMotion) {
        lastTime = performance.now();
        animFrameRef.current = requestAnimationFrame(render);
      }
    });

    let lastTime = performance.now();

    // Main render loop
    const render = (now: number) => {
      if (!ctx || !canvas) return;
      animFrameRef.current = null;

      // Stop loop if offscreen or tab hidden
      if (!isVisibleRef.current || !isTabVisibleRef.current) return;

      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      // 1. Deep Obsidian Space Canvas Fill with Subtle Radial Vignette
      ctx.fillStyle = '#080808';
      ctx.fillRect(0, 0, width, height);

      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        Math.min(width, height) * 0.15,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.75
      );
      vignette.addColorStop(0, 'rgba(18, 18, 22, 0.4)');
      vignette.addColorStop(0.65, 'rgba(8, 8, 8, 0.75)');
      vignette.addColorStop(1, 'rgba(4, 4, 4, 0.95)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // 2. Compute absolute screen coordinates for the 6 Major Nodes
      const nodeCoords: Record<string, { x: number; y: number }> = {};
      const paddingX = Math.min(width * 0.08, 60);
      const paddingY = Math.min(height * 0.10, 60);
      const usableW = width - paddingX * 2;
      const usableH = height - paddingY * 2;

      const isMobile = width < 640;

      const mobilePositions: Record<string, { x: number; y: number }> = {
        'ai-systems': { x: 0.28, y: 0.18 },
        'software-dev': { x: 0.26, y: 0.48 },
        'research-systems': { x: 0.72, y: 0.22 },
        'product-thinking': { x: 0.74, y: 0.52 },
        'business-ops': { x: 0.72, y: 0.82 },
        'creative-comm': { x: 0.28, y: 0.80 },
      };

      const basePositions: Record<string, { x: number; y: number }> = {
        'ai-systems': { x: 0.22, y: 0.28 },
        'software-dev': { x: 0.18, y: 0.68 },
        'research-systems': { x: 0.50, y: 0.20 },
        'product-thinking': { x: 0.80, y: 0.32 },
        'business-ops': { x: 0.82, y: 0.70 },
        'creative-comm': { x: 0.50, y: 0.76 },
      };

      const activePositions = isMobile ? mobilePositions : basePositions;

      const activeNodeId = selectedNodeId;
      const hoveredId = hoveredNodeId;

      constellationNodes.forEach((node) => {
        const pos = activePositions[node.id] || { x: node.x, y: node.y };
        nodeCoords[node.id] = {
          x: paddingX + pos.x * usableW,
          y: paddingY + pos.y * usableH
        };
      });

      // 3. Shockwave ripple expansion on node activation
      if (shockwaveRef.current.active) {
        const sw = shockwaveRef.current;
        sw.radius += dt * 0.45;
        const progress = sw.radius / sw.maxRadius;
        if (progress >= 1) {
          sw.active = false;
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 40, 0, ${Math.max(0, (1 - progress) * 0.45)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 4. Update & Draw Background Star Particles with gentle cursor interaction
      const mouse = mouseRef.current;
      const mouseDistThreshold = 130;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        if (!isReducedMotion) {
          s.x += s.vx * (dt * 0.06);
          s.y += s.vy * (dt * 0.06);

          // Wrap edges
          if (s.x < 0) s.x = width;
          if (s.x > width) s.x = 0;
          if (s.y < 0) s.y = height;
          if (s.y > height) s.y = 0;

          // Subtle cursor repulsion
          if (mouse.active) {
            const dx = s.x - mouse.x;
            const dy = s.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < mouseDistThreshold && dist > 1) {
              const force = (1 - dist / mouseDistThreshold) * 0.6;
              s.x += (dx / dist) * force;
              s.y += (dy / dist) * force;
            }
          }
        }

        // Draw star
        const twinkle = Math.sin(now * s.twinkleSpeed + s.twinkleOffset) * 0.25;
        const alpha = Math.max(0.1, Math.min(1, s.alpha + twinkle));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.fill();

        // Connect nearby background stars lightly (distant faint web)
        for (let j = i + 1; j < Math.min(i + 4, stars.length); j++) {
          const s2 = stars[j];
          const dist = Math.hypot(s.x - s2.x, s.y - s2.y);
          if (dist < 65) {
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 65) * 0.04})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // 5. Draw Major Constellation Bones (lines between core nodes)
      constellationBones.forEach(([idA, idB]) => {
        const ptA = nodeCoords[idA];
        const ptB = nodeCoords[idB];
        if (!ptA || !ptB) return;

        const isConnectionActive =
          activeNodeId && (idA === activeNodeId || idB === activeNodeId);
        const isHoverConnected =
          hoveredId && (idA === hoveredId || idB === hoveredId);

        ctx.beginPath();
        ctx.moveTo(ptA.x, ptA.y);
        ctx.lineTo(ptB.x, ptB.y);

        if (isConnectionActive) {
          // Radiant Ferrari Red for active cluster connections
          ctx.strokeStyle = 'rgba(255, 40, 0, 0.75)';
          ctx.lineWidth = 1.8;
          ctx.shadowColor = '#FF2800';
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Pulse particle traveling along active connection
          const pulseT = ((now * 0.0006) % 1);
          const px = ptA.x + (ptB.x - ptA.x) * pulseT;
          const py = ptA.y + (ptB.y - ptA.y) * pulseT;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#FF2800';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (isHoverConnected) {
          // Gentle preview glow on hover
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          // Muted fine white/grey line for ambient constellation bones
          const dimAlpha = activeNodeId ? 0.04 : 0.12;
          ctx.strokeStyle = `rgba(255, 255, 255, ${dimAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      // 6. Draw the 6 Major Interactive Nodes & Labels
      constellationNodes.forEach((node) => {
        const pt = nodeCoords[node.id];
        if (!pt) return;

        const isSelected = activeNodeId === node.id;
        const isHovered = hoveredId === node.id;

        // Check if mouse is hovering this node
        let distToMouse = 999;
        if (mouse.active) {
          distToMouse = Math.hypot(pt.x - mouse.x, pt.y - mouse.y);
        }

        // Draw Satellites if selected
        if (isSelected && node.satelliteNodes) {
          node.satelliteNodes.forEach((sat, sIdx) => {
            const rot = isReducedMotion ? sat.angle : sat.angle + now * 0.0003;
            const sx = pt.x + Math.cos(rot) * sat.distance;
            const sy = pt.y + Math.sin(rot) * sat.distance;

            // Satellite connecting thread
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(sx, sy);
            ctx.strokeStyle = 'rgba(255, 40, 0, 0.35)';
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Satellite dot
            ctx.beginPath();
            ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = '#FF2800';
            ctx.shadowColor = '#FF2800';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Satellite text
            ctx.font = '500 10px Rajdhani, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.textAlign = 'center';
            ctx.fillText(sat.label, sx, sy - 6);
          });
        }

        // Outer Glow / Halo
        const baseRadius = isSelected ? 8 : isHovered ? 7 : 5.5;
        const glowRadius = isSelected ? 26 : isHovered ? 20 : 12;

        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, glowRadius, 0, Math.PI * 2);
        if (isSelected) {
          ctx.fillStyle = 'rgba(255, 40, 0, 0.18)';
        } else if (isHovered) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        }
        ctx.fill();

        // Concentric beacon pulse for selected node
        if (isSelected && !isReducedMotion) {
          const pulseR = 12 + ((now * 0.02) % 20);
          const pulseAlpha = 1 - (pulseR - 12) / 20;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 40, 0, ${pulseAlpha * 0.6})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Outer ring
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, baseRadius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected
          ? '#FF2800'
          : isHovered
          ? 'rgba(255, 255, 255, 0.85)'
          : 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();

        // Core star body
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, baseRadius, 0, Math.PI * 2);
        if (isSelected) {
          ctx.fillStyle = '#FF2800';
          ctx.shadowColor = '#FF2800';
          ctx.shadowBlur = 14;
        } else if (isHovered) {
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = 'rgba(240, 240, 245, 0.9)';
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.restore();

        // Node Label (clean, typography-driven, zero slop)
        ctx.save();
        ctx.font = isSelected
          ? '700 12px Rajdhani, sans-serif'
          : '600 11px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Red node number prefix
        ctx.fillStyle = isSelected ? '#FF2800' : '#888888';
        ctx.fillText(`${node.number} //`, pt.x, pt.y + baseRadius + 7);

        // Label title
        ctx.fillStyle = isSelected
          ? '#FFFFFF'
          : isHovered
          ? '#FFFFFF'
          : 'rgba(220, 220, 225, 0.82)';
        ctx.fillText(node.label, pt.x, pt.y + baseRadius + 19);
        ctx.restore();
      });

      if (!isReducedMotion) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (!isReducedMotion) {
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      render(0);
    }

    return () => {
      window.removeEventListener('resize', resize);
      unobserveVisibility();
      unsubscribeTab();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isReducedMotion, selectedNodeId, hoveredNodeId]);

  // Click / tap detection on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;
    const paddingX = Math.min(width * 0.08, 60);
    const paddingY = Math.min(height * 0.10, 60);
    const usableW = width - paddingX * 2;
    const usableH = height - paddingY * 2;

    const isMobile = width < 640;
    const mobilePositions: Record<string, { x: number; y: number }> = {
      'ai-systems': { x: 0.28, y: 0.18 },
      'software-dev': { x: 0.26, y: 0.48 },
      'research-systems': { x: 0.72, y: 0.22 },
      'product-thinking': { x: 0.74, y: 0.52 },
      'business-ops': { x: 0.72, y: 0.82 },
      'creative-comm': { x: 0.28, y: 0.80 },
    };
    const basePositions: Record<string, { x: number; y: number }> = {
      'ai-systems': { x: 0.22, y: 0.28 },
      'software-dev': { x: 0.18, y: 0.68 },
      'research-systems': { x: 0.50, y: 0.20 },
      'product-thinking': { x: 0.80, y: 0.32 },
      'business-ops': { x: 0.82, y: 0.70 },
      'creative-comm': { x: 0.50, y: 0.76 },
    };
    const activePositions = isMobile ? mobilePositions : basePositions;

    // Check hit within touch-friendly radius (40px)
    let hitNode: ConstellationNode | null = null;
    let hitDist = 42;

    constellationNodes.forEach((node) => {
      const pos = activePositions[node.id] || { x: node.x, y: node.y };
      const nx = paddingX + pos.x * usableW;
      const ny = paddingY + pos.y * usableH;
      const d = Math.hypot(clickX - nx, clickY - ny);
      if (d < hitDist) {
        hitDist = d;
        hitNode = node;
      }
    });

    if (hitNode) {
      triggerNodeActivation((hitNode as ConstellationNode).id, clickX, clickY);
    } else {
      // Clicked empty void -> reset to overview
      setSelectedNodeId(null);
    }
  };

  const triggerNodeActivation = (nodeId: string, clientX?: number, clientY?: number) => {
    setSelectedNodeId(nodeId);

    // Trigger visual shockwave
    if (clientX !== undefined && clientY !== undefined) {
      shockwaveRef.current = {
        x: clientX,
        y: clientY,
        radius: 0,
        maxRadius: 280,
        active: true
      };
    }
  };

  // Pointer move handler for hover discovery & subtle starfield reaction
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseRef.current = { x, y, active: true };

    // Hover discovery
    const width = rect.width;
    const height = rect.height;
    const paddingX = Math.min(width * 0.08, 60);
    const paddingY = Math.min(height * 0.10, 60);
    const usableW = width - paddingX * 2;
    const usableH = height - paddingY * 2;
    const isMobile = width < 640;

    const mobilePositions: Record<string, { x: number; y: number }> = {
      'ai-systems': { x: 0.28, y: 0.18 },
      'software-dev': { x: 0.26, y: 0.48 },
      'research-systems': { x: 0.72, y: 0.22 },
      'product-thinking': { x: 0.74, y: 0.52 },
      'business-ops': { x: 0.72, y: 0.82 },
      'creative-comm': { x: 0.28, y: 0.80 },
    };
    const basePositions: Record<string, { x: number; y: number }> = {
      'ai-systems': { x: 0.22, y: 0.28 },
      'software-dev': { x: 0.18, y: 0.68 },
      'research-systems': { x: 0.50, y: 0.20 },
      'product-thinking': { x: 0.80, y: 0.32 },
      'business-ops': { x: 0.82, y: 0.70 },
      'creative-comm': { x: 0.50, y: 0.76 },
    };
    const activePositions = isMobile ? mobilePositions : basePositions;

    let nearestId: string | null = null;
    let minDist = 38;

    constellationNodes.forEach((node) => {
      const pos = activePositions[node.id] || { x: node.x, y: node.y };
      const nx = paddingX + pos.x * usableW;
      const ny = paddingY + pos.y * usableH;
      const d = Math.hypot(x - nx, y - ny);
      if (d < minDist) {
        minDist = d;
        nearestId = node.id;
      }
    });

    setHoveredNodeId(nearestId);
  };

  const handlePointerLeave = () => {
    mouseRef.current = { x: -1000, y: -1000, active: false };
    setHoveredNodeId(null);
  };

  const scrollToTarget = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ===================== THE CONSTELLATION CONTAINER ===================== */}
      <div 
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden f1-card border border-white/[0.1] shadow-2xl min-h-[500px] sm:min-h-[560px] flex flex-col justify-between"
        style={{
          background: 'linear-gradient(180deg, #09090C 0%, #060608 100%)'
        }}
      >
        {/* Top Control Bar & Header */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2800] animate-pulse" />
              <span className="text-xs font-tech font-bold uppercase tracking-widest text-[#FF2800]">
                THE CONSTELLATION
              </span>
              <span className="text-neutral-700">|</span>
              <span className="text-[11px] font-mono text-neutral-400">
                {selectedNode ? `CLUSTER: ${selectedNode.label.toUpperCase()}` : '6 DOMAINS ACTIVE'}
              </span>
            </div>
            <p className="font-tech text-xs sm:text-sm text-neutral-300 font-medium">
              Explore the things I build · Click any star node to reveal engineering architecture
            </p>
          </div>

          {/* Reset Overview Control */}
          <div className="flex items-center gap-2">
            {selectedNodeId && (
              <button
                onClick={() => setSelectedNodeId(null)}
                className="f1-btn-secondary px-3 py-1.5 rounded-lg text-xs font-tech uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer text-neutral-200 hover:text-white"
                title="Restore all constellation domains"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#FF2800]" />
                <span>Reset Overview</span>
              </button>
            )}

            {/* Quick Domain Filter Selector */}
            <div className="flex flex-wrap items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/[0.08]">
              {constellationNodes.map((n) => {
                const isActive = selectedNodeId === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => triggerNodeActivation(n.id)}
                    aria-label={`Select domain ${n.number}: ${n.label}`}
                    title={`${n.number} // ${n.label}`}
                    className={`px-2 sm:px-2.5 py-1 rounded text-[11px] font-tech font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#FF2800] text-white shadow-sm' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>{n.number}</span>
                    <span className="hidden xl:inline ml-1">{n.label.split('&')[0].trim()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Generative Interactive Canvas */}
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="w-full h-full min-h-[460px] sm:min-h-[520px] cursor-crosshair block select-none"
          aria-label="Interactive Constellation Canvas. Star nodes represent technical domains: AI Systems, Software Development, Research, Product Thinking, Business Operations, and Creative Communication."
        />

        {/* ===================== INFORMATION REVEAL PANEL ===================== */}
        {selectedNode && (
          <div 
            className="relative z-30 mx-3 sm:mx-6 mb-4 sm:mb-6 p-5 sm:p-7 rounded-xl bg-[#101014]/94 backdrop-blur-2xl border border-[#FF2800]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] animate-modal-in"
            role="region"
            aria-live="polite"
            aria-label={`Details for ${selectedNode.label}`}
          >
            {/* Top Red racing accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF2800] to-transparent" />

            <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-tech font-bold uppercase tracking-widest text-[#FF2800]">
                    {selectedNode.number} // DOMAIN ARCHITECTURE
                  </span>
                  <span className="text-neutral-700">|</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FF2800]/15 text-[#FF2800] border border-[#FF2800]/30 font-semibold">
                    ACTIVE CLUSTER
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#FFFFFF]">
                  {selectedNode.label}
                </h3>
              </div>

              {/* Close / Return to Overview Control */}
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1.5 rounded-lg bg-[#18181C] border border-neutral-700 hover:border-[#FF2800] hover:text-[#FF2800] text-neutral-300 transition-all cursor-pointer active:scale-95 shrink-0"
                aria-label="Close domain panel and restore overview"
                title="Close panel (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Explanation & Methods */}
              <div className="md:col-span-7 space-y-4">
                <p className="font-body text-sm sm:text-base text-neutral-200 leading-relaxed">
                  {selectedNode.explanation}
                </p>

                {/* Methods & Principles */}
                <div>
                  <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#FF2800]" />
                    <span>Core Methods & Architecture</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedNode.methods.map((method, mIdx) => (
                      <div 
                        key={mIdx} 
                        className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-xs font-tech text-neutral-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF2800] shrink-0" />
                        <span>{method}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Tools & Linked Portfolio Projects */}
              <div className="md:col-span-5 space-y-4">
                {/* Tools & Production Stack */}
                <div>
                  <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[#FF2800]" />
                    <span>Applied Tools & Frameworks</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.toolsAndLanguages.map((tool, tIdx) => (
                      <span 
                        key={tIdx} 
                        className="px-2.5 py-1 rounded bg-white/[0.04] text-[11px] font-tech text-neutral-300 border border-white/[0.08]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Related Projects in Portfolio */}
                <div>
                  <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#FF2800]" />
                    <span>Related Projects in Portfolio</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedNode.relatedProjects.map((proj, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => scrollToTarget(proj.targetId)}
                        className="w-full text-left p-2.5 rounded-lg bg-black/40 border border-white/[0.08] hover:border-[#FF2800]/50 hover:bg-[#FF2800]/10 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <span className="font-tech text-xs sm:text-sm font-bold text-white group-hover:text-[#FF2800] transition-colors">
                            {proj.title}
                          </span>
                          <span className="text-[11px] font-tech text-neutral-400 block">
                            {proj.tag}
                          </span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#FF2800] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Panel Actions */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-tech text-neutral-400">
              <span>Press Escape or click anywhere in the void to restore full constellation</span>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-xs font-tech font-bold uppercase tracking-wider text-[#FF2800] hover:underline cursor-pointer"
              >
                Restore Overview ↑
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
