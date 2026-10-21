import React, { useEffect, useRef, useState } from 'react';
import { domainAudio } from '../utils/audio';

interface LiquidTransitionProps {
  onComplete: () => void;
  isReducedMotion: boolean;
  durationMs?: number;
}

/**
 * LiquidTransition — High-Performance Dual-Path Liquid Wave Transition
 * 
 * Features:
 * - Primary WebGL Path: Procedural GLSL simplex noise, diagonal fluid wave propagation,
 *   Ferrari Red (#E10600) crest, specular white glint, and natural cubic-bezier easing.
 * - Dedicated 2D Canvas Fallback: Automatically activates if WebGL is unsupported, shader compilation
 *   fails, program linking fails, or context is lost. Uses an independent canvas element to avoid
 *   Canvas2D/WebGL context conflicts.
 * - Clock Protection: The animation duration starts strictly upon the FIRST painted frame (not during
 *   synchronous setup or shader compilation), preventing skips or premature completions.
 * - Idempotent Completion: Guaranteed single completion callback with full resource cleanup.
 */
export const LiquidTransition: React.FC<LiquidTransitionProps> = ({
  onComplete,
  isReducedMotion,
  durationMs = 1250
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webglCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [useFallback, setUseFallback] = useState<boolean>(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hasCompletedRef = useRef<boolean>(false);

  const safeComplete = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    domainAudio.stopWaterWave();
    onCompleteRef.current();
  };

  useEffect(() => {
    hasCompletedRef.current = false;
    domainAudio.playWaterWaveTransition(durationMs / 1000);

    // 1. Reduced Motion Mode: Gentle opacity fade-out
    if (isReducedMotion) {
      const container = containerRef.current;
      if (container) {
        container.style.opacity = '1';
        container.style.transition = 'opacity 380ms cubic-bezier(0.4, 0, 0.2, 1)';
        requestAnimationFrame(() => {
          if (container) container.style.opacity = '0';
        });
      }
      const timer = setTimeout(() => {
        safeComplete();
      }, 400);
      return () => {
        clearTimeout(timer);
        domainAudio.stopWaterWave();
      };
    }

    let animId = 0;
    let fallbackAnimId = 0;
    let isCleanedUp = false;

    // =========================================================================
    // 2D Canvas Fallback Renderer (Dedicated Canvas)
    // =========================================================================
    const start2DFallback = () => {
      if (isCleanedUp || hasCompletedRef.current) return;
      setUseFallback(true);

      const fCanvas = fallbackCanvasRef.current;
      if (!fCanvas) {
        // Fallback timer if canvas is somehow missing
        setTimeout(safeComplete, durationMs);
        return;
      }

      const ctx = fCanvas.getContext('2d');
      if (!ctx) {
        setTimeout(safeComplete, durationMs);
        return;
      }

      const updateFallbackSize = () => {
        if (!fCanvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;
        fCanvas.width = Math.floor(w * dpr);
        fCanvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      updateFallbackSize();
      window.addEventListener('resize', updateFallbackSize, { passive: true });

      let fallbackStartTime: number | null = null;
      let renderedFrames = 0;

      const render2D = (now: number) => {
        if (isCleanedUp || hasCompletedRef.current) return;

        // Clock starts strictly when intermediate painting begins
        if (fallbackStartTime === null) {
          fallbackStartTime = now;
        }

        renderedFrames++;
        const elapsed = now - fallbackStartTime;
        const rawProgress = Math.min(elapsed / durationMs, 1.0);
        const eased = rawProgress < 0.5
          ? 4.0 * rawProgress * rawProgress * rawProgress
          : 1.0 - Math.pow(-2.0 * rawProgress + 2.0, 3.0) / 2.0;

        const w = window.innerWidth;
        const h = window.innerHeight;

        ctx.clearRect(0, 0, w, h);

        // Fluid diagonal wave sweep: sweeps from bottom-left to top-right
        const sweepProgress = eased * (w + h + 200);
        const startX = -100 + sweepProgress * 0.7;
        const startY = h + 100 - sweepProgress * 0.6;
        const endX = w + 100;
        const endY = -100;

        // Draw dark fluid mass ahead of the wave
        ctx.fillStyle = '#0A0A0A';
        ctx.beginPath();
        ctx.moveTo(w, 0);
        ctx.lineTo(w, h);
        ctx.lineTo(Math.max(0, startX), h);
        ctx.bezierCurveTo(
          startX + (endX - startX) * 0.35 + Math.sin(elapsed * 0.005) * 40,
          startY + (endY - startY) * 0.35 + Math.cos(elapsed * 0.005) * 40,
          startX + (endX - startX) * 0.65 - Math.sin(elapsed * 0.005) * 30,
          startY + (endY - startY) * 0.65 - Math.cos(elapsed * 0.005) * 30,
          endX,
          Math.min(h, startY)
        );
        ctx.lineTo(endX, 0);
        ctx.closePath();
        ctx.fill();

        // Ferrari Red glowing crest wave boundary
        ctx.strokeStyle = 'rgba(225, 6, 0, 0.85)';
        ctx.lineWidth = 4;
        ctx.shadowColor = 'rgba(225, 6, 0, 0.6)';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(Math.max(0, startX), h);
        ctx.bezierCurveTo(
          startX + (endX - startX) * 0.35 + Math.sin(elapsed * 0.005) * 40,
          startY + (endY - startY) * 0.35 + Math.cos(elapsed * 0.005) * 40,
          startX + (endX - startX) * 0.65 - Math.sin(elapsed * 0.005) * 30,
          startY + (endY - startY) * 0.65 - Math.cos(elapsed * 0.005) * 30,
          endX,
          Math.min(h, startY)
        );
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (rawProgress < 1.0 || renderedFrames < 8) {
          fallbackAnimId = requestAnimationFrame(render2D);
        } else {
          safeComplete();
        }
      };

      fallbackAnimId = requestAnimationFrame(render2D);
    };

    // =========================================================================
    // Primary WebGL Rendering Pipeline
    // =========================================================================
    const canvas = webglCanvasRef.current;
    if (!canvas) {
      start2DFallback();
      return () => {
        isCleanedUp = true;
      };
    }

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
        depth: false,
        stencil: false,
        antialias: false,
        powerPreference: 'high-performance'
      }) || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    } catch {
      gl = null;
    }

    if (!gl) {
      start2DFallback();
      return () => {
        isCleanedUp = true;
      };
    }

    // Handle WebGL context loss safely
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      if (animId) cancelAnimationFrame(animId);
      start2DFallback();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);

    const updateDimensions = () => {
      if (!canvas || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });

    // Shaders
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
      #else
      precision mediump float;
      #endif

      uniform vec2 u_resolution;
      uniform float u_progress;
      uniform float u_time;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
        m = m * m; m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float n1 = snoise(uv * 4.2 + vec2(u_time * 0.45, -u_time * 0.35));
        float n2 = snoise(uv * 8.5 - vec2(u_time * 0.25, u_time * 0.4));
        float waveRipple = sin(uv.x * 14.0 + uv.y * 8.0 - u_time * 2.2) * 0.035;
        float distortion = n1 * 0.11 + n2 * 0.045 + waveRipple;

        float waveMetric = (uv.y * 0.65 + uv.x * 0.35) + distortion;
        float threshold = mix(-0.25, 1.35, u_progress);
        float d = waveMetric - threshold;

        vec3 cBlack = vec3(0.0392, 0.0392, 0.0392);
        vec3 cFerrari = vec3(0.882, 0.0235, 0.0);
        vec3 cWhite = vec3(1.0, 1.0, 1.0);

        if (d < 0.0) {
          if (d > -0.065) {
            float tailFactor = smoothstep(-0.065, 0.0, d);
            vec3 wakeCol = mix(cFerrari * 0.8, cWhite * 0.6, 0.25);
            gl_FragColor = vec4(wakeCol, tailFactor * 0.45 * (1.0 - u_progress));
          } else {
            discard;
          }
        } else {
          float edgeWidth = 0.09;
          float crest = 1.0 - smoothstep(0.0, edgeWidth, d);
          vec3 color = mix(cBlack, cFerrari, crest * 0.88);
          float specular = exp(-pow((d - 0.007) * 110.0, 2.0));
          color += cWhite * specular * 0.65;
          float alpha = smoothstep(0.0, 0.035, d);
          alpha = max(alpha, crest * 0.95);
          gl_FragColor = vec4(color, alpha);
        }
      }
    `;

    const createShader = (type: number, source: string) => {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('[LiquidTransition] Shader compilation issue:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);

    if (!vs || !fs) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      start2DFallback();
      return () => {
        isCleanedUp = true;
      };
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      start2DFallback();
      return () => {
        isCleanedUp = true;
      };
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('[LiquidTransition] Program linking issue:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      start2DFallback();
      return () => {
        isCleanedUp = true;
      };
    }

    gl.useProgram(program);

    const quadVerts = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uResLoc = gl.getUniformLocation(program, 'u_resolution');
    const uProgLoc = gl.getUniformLocation(program, 'u_progress');
    const uTimeLoc = gl.getUniformLocation(program, 'u_time');

    let animStartTime: number | null = null;
    let renderedFrames = 0;

    // Render loop with protected timing
    const render = (now: number) => {
      if (isCleanedUp || hasCompletedRef.current || !gl) return;

      // Clock starts only on the first painted frame!
      if (animStartTime === null) {
        animStartTime = now;
      }

      renderedFrames++;
      const elapsed = now - animStartTime;
      const rawProgress = Math.min(elapsed / durationMs, 1.0);
      const easedProgress = rawProgress < 0.5 
        ? 4.0 * rawProgress * rawProgress * rawProgress 
        : 1.0 - Math.pow(-2.0 * rawProgress + 2.0, 3.0) / 2.0;

      gl.useProgram(program);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.uniform1f(uProgLoc, easedProgress);
      gl.uniform1f(uTimeLoc, elapsed * 0.001);

      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Keep rendering intermediate frames before allowing completion
      if (rawProgress < 1.0 || renderedFrames < 8) {
        animId = requestAnimationFrame(render);
      } else {
        safeComplete();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      isCleanedUp = true;
      window.removeEventListener('resize', updateDimensions);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      if (animId) cancelAnimationFrame(animId);
      if (fallbackAnimId) cancelAnimationFrame(fallbackAnimId);
      domainAudio.stopWaterWave();

      if (gl) {
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
      }
    };
  }, [durationMs, isReducedMotion]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Primary WebGL Canvas */}
      <canvas 
        ref={webglCanvasRef}
        className="w-full h-full block"
        style={{ display: useFallback ? 'none' : 'block' }}
      />

      {/* Dedicated 2D Fallback Canvas (activated if WebGL is unavailable or fails compilation) */}
      <canvas
        ref={fallbackCanvasRef}
        className="w-full h-full block"
        style={{ display: useFallback ? 'block' : 'none' }}
      />
    </div>
  );
};
