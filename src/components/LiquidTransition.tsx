import React, { useEffect, useRef } from 'react';

interface LiquidTransitionProps {
  onComplete: () => void;
  isReducedMotion: boolean;
  durationMs?: number;
}

/**
 * LiquidTransition
 * 
 * Elegant, subtle liquid wave wipe connecting the Chibi intro to the main portfolio.
 * - Fluid organic ripple propagation with custom GLSL fragment shader
 * - Palette: deep black #0A0A0A, Ferrari red #E10600 crest, and subtle specular white #FFFFFF glint
 * - Smooth natural easing (smoothstep cubic) without abrupt cuts or full-screen explosions
 * - Seamlessly reveals the underlying portfolio and its ambient WebGL liquid background
 * - Respects prefers-reduced-motion with a clean, subtle opacity fade
 */
export const LiquidTransition: React.FC<LiquidTransitionProps> = ({
  onComplete,
  isReducedMotion,
  durationMs = 1250
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // 1. Reduced Motion Mode: Simple, subtle fade-out
    if (isReducedMotion) {
      const container = containerRef.current;
      if (container) {
        container.style.opacity = '1';
        container.style.transition = 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)';
        requestAnimationFrame(() => {
          container.style.opacity = '0';
        });
      }
      const timer = setTimeout(() => {
        onCompleteRef.current();
      }, 420);
      return () => clearTimeout(timer);
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      onCompleteRef.current();
      return;
    }

    // Try WebGL
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
        depth: false,
        stencil: false,
        antialias: true
      }) || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    } catch {
      gl = null;
    }

    let animId = 0;
    const startTime = performance.now();

    // Resize handler
    const updateDimensions = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    if (gl) {
      // Vertex Shader
      const vsSource = `
        attribute vec2 a_position;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

      // GLSL Fragment Shader for organic liquid wipe transition
      const fsSource = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif

        uniform vec2 u_resolution;
        uniform float u_progress;
        uniform float u_time;

        // Simplex noise for organic wave distortion
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
          
          // Organic fluid wave propagating gently diagonally across the viewport
          float n1 = snoise(uv * 4.2 + vec2(u_time * 0.45, -u_time * 0.35));
          float n2 = snoise(uv * 8.5 - vec2(u_time * 0.25, u_time * 0.4));
          float waveRipple = sin(uv.x * 14.0 + uv.y * 8.0 - u_time * 2.2) * 0.035;
          float distortion = n1 * 0.11 + n2 * 0.045 + waveRipple;

          // Diagonal wave travel metric
          float waveMetric = (uv.y * 0.65 + uv.x * 0.35) + distortion;

          // Scaled progress threshold to ensure wave covers screen from start to finish
          float threshold = mix(-0.25, 1.35, u_progress);
          float d = waveMetric - threshold;

          // Strict color palette
          vec3 cBlack = vec3(0.0392, 0.0392, 0.0392); // #0A0A0A
          vec3 cFerrari = vec3(0.882, 0.0235, 0.0);   // #E10600
          vec3 cWhite = vec3(1.0, 1.0, 1.0);          // #FFFFFF

          if (d < 0.0) {
            // Region swept by the wave: reveals portfolio underneath
            if (d > -0.065) {
              // Gentle refractive trailing wake
              float tailFactor = smoothstep(-0.065, 0.0, d);
              vec3 wakeCol = mix(cFerrari * 0.8, cWhite * 0.6, 0.25);
              gl_FragColor = vec4(wakeCol, tailFactor * 0.45 * (1.0 - u_progress));
            } else {
              // Fully transparent -> reveals the real portfolio and WebGL liquid background
              discard;
            }
          } else {
            // Ahead of the wave: the dark intro screen melting away
            float edgeWidth = 0.09;
            float crest = 1.0 - smoothstep(0.0, edgeWidth, d);
            
            // Subtle Ferrari red highlight along the fluid wave crest
            vec3 color = mix(cBlack, cFerrari, crest * 0.88);
            
            // Specular liquid reflection right on the crest boundary
            float specular = exp(-pow((d - 0.007) * 110.0, 2.0));
            color += cWhite * specular * 0.65;
            
            // Alpha transitions at the crest
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
          gl.deleteShader(s);
          return null;
        }
        return s;
      };

      const vs = createShader(gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl.FRAGMENT_SHADER, fsSource);

      if (vs && fs) {
        const program = gl.createProgram();
        if (program) {
          gl.attachShader(program, vs);
          gl.attachShader(program, fs);
          gl.linkProgram(program);

          if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.useProgram(program);

            // Fullscreen quad
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

            // Render loop with smooth easing
            const render = (now: number) => {
              const elapsed = now - startTime;
              const rawProgress = Math.min(elapsed / durationMs, 1.0);
              // Natural cubic-bezier easing (ease-in-out)
              const easedProgress = rawProgress < 0.5 
                ? 4.0 * rawProgress * rawProgress * rawProgress 
                : 1.0 - Math.pow(-2.0 * rawProgress + 2.0, 3.0) / 2.0;

              gl!.useProgram(program);
              gl!.uniform2f(uResLoc, canvas.width, canvas.height);
              gl!.uniform1f(uProgLoc, easedProgress);
              gl!.uniform1f(uTimeLoc, elapsed * 0.001);

              gl!.clearColor(0.0, 0.0, 0.0, 0.0);
              gl!.clear(gl!.COLOR_BUFFER_BIT);
              gl!.drawArrays(gl!.TRIANGLES, 0, 6);

              if (rawProgress < 1.0) {
                animId = requestAnimationFrame(render);
              } else {
                // Wave fully exited viewport -> complete transition
                onCompleteRef.current();
              }
            };

            animId = requestAnimationFrame(render);

            return () => {
              window.removeEventListener('resize', updateDimensions);
              cancelAnimationFrame(animId);
              if (buffer) gl?.deleteBuffer(buffer);
              if (program) gl?.deleteProgram(program);
              if (vs) gl?.deleteShader(vs);
              if (fs) gl?.deleteShader(fs);
            };
          }
        }
      }
    }

    // 2D Canvas Fallback if WebGL is unavailable
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const render2DFallback = (now: number) => {
        const elapsed = now - startTime;
        const rawProgress = Math.min(elapsed / durationMs, 1.0);
        const eased = rawProgress < 0.5 
          ? 4.0 * rawProgress * rawProgress * rawProgress 
          : 1.0 - Math.pow(-2.0 * rawProgress + 2.0, 3.0) / 2.0;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const w = canvas.width;
        const h = canvas.height;
        const waveY = (1.0 - eased) * (h + 100);

        // Dark surface
        ctx.fillStyle = '#0A0A0A';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w, 0);
        ctx.lineTo(w, waveY);
        // Subtle wave curve
        ctx.bezierCurveTo(w * 0.65, waveY + 40, w * 0.35, waveY - 30, 0, waveY);
        ctx.closePath();
        ctx.fill();

        // Ferrari red crest line
        ctx.strokeStyle = 'rgba(225, 6, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, waveY);
        ctx.bezierCurveTo(w * 0.35, waveY - 30, w * 0.65, waveY + 40, w, waveY);
        ctx.stroke();

        if (rawProgress < 1.0) {
          animId = requestAnimationFrame(render2DFallback);
        } else {
          onCompleteRef.current();
        }
      };

      animId = requestAnimationFrame(render2DFallback);
      return () => {
        window.removeEventListener('resize', updateDimensions);
        cancelAnimationFrame(animId);
      };
    }

    // Default immediate fallback
    const fallbackTimer = setTimeout(() => {
      onCompleteRef.current();
    }, durationMs);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(fallbackTimer);
    };
  }, [durationMs, isReducedMotion]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <canvas 
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};
