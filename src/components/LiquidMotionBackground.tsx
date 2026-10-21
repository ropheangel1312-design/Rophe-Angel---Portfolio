import React, { useEffect, useRef } from 'react';

interface LiquidMotionBackgroundProps {
  isReducedMotion: boolean;
  isPaused?: boolean;
}

/**
 * Premium Liquid Motion Background System
 * 
 * - WebGL with custom GLSL fragment shader.
 * - Continuous domain-warped fluid flow field and organic ripple propagation.
 * - Animates automatically via continuously advancing time uniform (idle-ready, zero mouse dependency).
 * - Exact palette: dominant deep black #0A0A0A, restrained Ferrari red #E10600, specular white #FFFFFF glints.
 * - Behind all content (fixed z-0), non-blocking (pointer-events-none).
 * - Responsive to DPR, handles resize, clean unmount cleanup, and graceful static fallback.
 * - Full prefers-reduced-motion support.
 */
export const LiquidMotionBackground: React.FC<LiquidMotionBackgroundProps> = ({
  isReducedMotion,
  isPaused = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const startLoopRef = useRef<(() => void) | null>(null);
  const stopLoopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isPaused) {
      stopLoopRef.current?.();
    } else {
      startLoopRef.current?.();
    }
  }, [isPaused]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reduced motion mode: calm static rendering
    if (isReducedMotion) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const grad = ctx.createRadialGradient(
          canvas.width * 0.5,
          canvas.height * 0.35,
          40,
          canvas.width * 0.5,
          canvas.height * 0.5,
          Math.max(canvas.width, canvas.height) * 0.75
        );
        grad.addColorStop(0, '#150606');
        grad.addColorStop(0.3, '#0f0808');
        grad.addColorStop(0.65, '#0a0a0a');
        grad.addColorStop(1, '#070707');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: false,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance'
      }) || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    } catch {
      gl = null;
    }

    let animId = 0;

    // =========================================================================
    // WebGL Pipeline
    // =========================================================================
    if (gl) {
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
        uniform float u_time;

        // High-grade 2D Simplex Noise for smooth, non-repetitive fluid displacement
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187,
                              0.366025403784439,
                             -0.577350269189626,
                              0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
          m = m * m;
          m = m * m;
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

        // Multi-octave continuous flow distortion (domain warping)
        float fbm(vec2 p, float t) {
          float value = 0.0;
          float amp = 0.5;
          float freq = 1.0;
          mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
          for (int i = 0; i < 3; i++) {
            value += amp * snoise(p * freq + vec2(t * 0.12, -t * 0.09));
            p = rot * p;
            freq *= 2.0;
            amp *= 0.5;
          }
          return value;
        }

        // Continuous liquid height field with procedural ripple propagation
        float calculateLiquid(vec2 uv, float t) {
          // 1. Organic domain warping (liquid flow field)
          vec2 q = vec2(
            fbm(uv + vec2(0.0, 0.0), t * 0.35),
            fbm(uv + vec2(5.2, 1.3), t * 0.35)
          );

          vec2 r = vec2(
            fbm(uv + 2.0 * q + vec2(1.7, 9.2), t * 0.25),
            fbm(uv + 2.0 * q + vec2(8.3, 2.8), t * 0.25)
          );

          vec2 p = uv + 0.38 * r;

          // 2. Autonomous, traveling ripple origins propagating outward
          // Wave A: North-west roaming ripple
          vec2 originA = vec2(sin(t * 0.16) * 0.6 - 0.25, cos(t * 0.12) * 0.45 + 0.15);
          float distA = length(p - originA);
          float waveA = sin(distA * 13.0 - t * 2.1) * (1.0 / (1.0 + distA * 1.8));

          // Wave B: South-east counter-propagating ripple
          vec2 originB = vec2(cos(t * 0.14 + 1.8) * 0.65 + 0.2, sin(t * 0.19 + 2.2) * 0.4 - 0.2);
          float distB = length(p - originB);
          float waveB = sin(distB * 16.0 - t * 2.5) * (1.0 / (1.0 + distB * 2.2));

          // Wave C: Central pulsing liquid well
          vec2 originC = vec2(sin(t * 0.11 + 3.5) * 0.45, cos(t * 0.15 + 4.1) * 0.35);
          float distC = length(p - originC);
          float waveC = sin(distC * 10.0 - t * 1.7) * (1.0 / (1.0 + distC * 1.4));

          // Wave D: Ambient sweeping fluid swells
          float swell1 = sin(p.x * 2.8 + p.y * 2.1 - t * 0.75) * 0.4;
          float swell2 = cos(-p.x * 2.2 + p.y * 3.2 + t * 0.65) * 0.35;

          return waveA * 0.38 + waveB * 0.32 + waveC * 0.30 + swell1 + swell2;
        }

        void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
          float t = u_time;

          float h = calculateLiquid(uv, t);

          // Calculate surface gradient & normal for liquid light refraction
          float eps = 0.007;
          float hR = calculateLiquid(uv + vec2(eps, 0.0), t);
          float hU = calculateLiquid(uv + vec2(0.0, eps), t);

          vec3 normal = normalize(vec3(
            (h - hR) / eps,
            (h - hU) / eps,
            1.4
          ));

          // Directional studio lighting
          vec3 lightDir = normalize(vec3(0.45, 0.65, 0.75));
          vec3 viewDir = vec3(0.0, 0.0, 1.0);

          float diffuse = max(dot(normal, lightDir), 0.0);
          vec3 halfVec = normalize(lightDir + viewDir);
          float spec = pow(max(dot(normal, halfVec), 0.0), 28.0);
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

          // Exact brand palette:
          // Deep Black: #0A0A0A = (0.0392, 0.0392, 0.0392)
          // Ferrari Red: #E10600 = (0.8824, 0.0235, 0.0)
          // White: #FFFFFF = (1.0, 1.0, 1.0)
          vec3 blackBase = vec3(0.0392, 0.0392, 0.0392);
          vec3 ferrariRed = vec3(0.8824, 0.0235, 0.0);
          vec3 deepGlow = vec3(0.22, 0.015, 0.01);

          // Liquid wave crests & curvature
          float crest = smoothstep(-0.35, 0.65, h);
          float slope = clamp(length(normal.xy) * 0.55, 0.0, 1.0);

          // Travelling liquid caustic ribbon that weaves organically across waves
          float caustic = sin(uv.x * 2.2 - uv.y * 1.7 + t * 0.45 + h * 2.0) * 0.5 + 0.5;

          // Ferrari Red highlight: travels along wave crests and refraction slopes
          float redFactor = (crest * 0.45 + slope * 0.35) * (0.35 + 0.65 * caustic) * (0.45 + 0.55 * diffuse);
          redFactor = clamp(redFactor * 0.85, 0.0, 0.75);

          // Faint, crisp specular glint (white) catching wave apexes
          float glint = smoothstep(0.45, 0.96, spec) * (0.2 + 0.8 * crest) * 0.28;

          // Composite color
          vec3 color = mix(blackBase, deepGlow, slope * 0.4);
          color = mix(color, ferrariRed, redFactor);
          color += vec3(1.0) * glint;

          // Subtle perimeter vignette to focus eye on central content
          float vignette = 1.0 - smoothstep(0.7, 1.6, length(uv));
          color *= (0.82 + 0.18 * vignette);

          gl_FragColor = vec4(color, 1.0);
        }
      `;

      const createShader = (type: number, source: string): WebGLShader | null => {
        if (!gl) return null;
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('[LiquidMotion] Shader error:', gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vs = createShader(gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl.FRAGMENT_SHADER, fsSource);

      let program: WebGLProgram | null = null;
      if (vs && fs) {
        program = gl.createProgram();
        if (program) {
          gl.attachShader(program, vs);
          gl.attachShader(program, fs);
          gl.linkProgram(program);
          if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('[LiquidMotion] Program error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            program = null;
          }
        }
      }

      if (program) {
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array([
          -1.0, -1.0,
           1.0, -1.0,
          -1.0,  1.0,
          -1.0,  1.0,
           1.0, -1.0,
           1.0,  1.0,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const posAttr = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(posAttr);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

        const resUniform = gl.getUniformLocation(program, 'u_resolution');
        const timeUniform = gl.getUniformLocation(program, 'u_time');

        const updateSize = () => {
          if (!canvas || !gl) return;
          const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
          const w = Math.floor(window.innerWidth * dpr);
          const h = Math.floor(window.innerHeight * dpr);
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            gl.viewport(0, 0, w, h);
            if (resUniform && program) {
              gl.useProgram(program);
              gl.uniform2f(resUniform, w, h);
            }
          }
        };

        updateSize();
        window.addEventListener('resize', updateSize, { passive: true });

        const startTime = performance.now();
        let isRunning = false;
        let isTabVisible = !document.hidden;

        const renderWebGL = () => {
          if (!gl || !program || !isTabVisible || isPausedRef.current) {
            isRunning = false;
            return;
          }
          const elapsed = (performance.now() - startTime) * 0.001;

          if (timeUniform) {
            gl.uniform1f(timeUniform, elapsed);
          }

          gl.drawArrays(gl.TRIANGLES, 0, 6);
          animId = requestAnimationFrame(renderWebGL);
        };

        const startLoop = () => {
          if (isRunning || !isTabVisible || isPausedRef.current) return;
          isRunning = true;
          animId = requestAnimationFrame(renderWebGL);
        };

        const stopLoop = () => {
          if (animId) {
            cancelAnimationFrame(animId);
            animId = 0;
          }
          isRunning = false;
        };

        startLoopRef.current = startLoop;
        stopLoopRef.current = stopLoop;

        if (!isPausedRef.current) {
          startLoop();
        }

        const handleVisibilityChange = () => {
          isTabVisible = !document.hidden;
          if (isTabVisible && !isPausedRef.current) {
            startLoop();
          } else {
            stopLoop();
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

        return () => {
          startLoopRef.current = null;
          stopLoopRef.current = null;
          stopLoop();
          window.removeEventListener('resize', updateSize);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          if (gl) {
            if (positionBuffer) gl.deleteBuffer(positionBuffer);
            if (program) gl.deleteProgram(program);
            if (vs) gl.deleteShader(vs);
            if (fs) gl.deleteShader(fs);
          }
        };
      }
    }

    // =========================================================================
    // Canvas2D Fallback (Only reached if WebGL completely failed)
    // =========================================================================
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize2D = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize2D, { passive: true });

    let t = 0;
    const render2D = () => {
      t += 0.012;
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, width, height);

      // Autonomous liquid waves
      for (let w = 0; w < 4; w++) {
        const progress = (t * 0.2 + w / 4) % 1;
        const waveY = height * 0.15 + (height * 0.75) * progress;
        const alpha = Math.sin(progress * Math.PI) * 0.25;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, waveY);

        for (let x = 0; x <= width; x += 30) {
          const waveOffset = Math.sin(x * 0.004 + t * 0.9 + w * 1.5) * 40 +
                             Math.cos(x * 0.007 - t * 0.7) * 20;
          ctx.lineTo(x, waveY + waveOffset);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, waveY - 30, 0, waveY + 90);
        grad.addColorStop(0, `rgba(225, 6, 0, ${alpha * 0.9})`);
        grad.addColorStop(0.5, `rgba(225, 6, 0, ${alpha * 0.3})`);
        grad.addColorStop(1, 'rgba(10, 10, 10, 0)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render2D);
    };

    animId = requestAnimationFrame(render2D);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize2D);
    };
  }, [isReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{
        pointerEvents: 'none',
        display: 'block'
      }}
      aria-hidden="true"
    />
  );
};
