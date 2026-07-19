import { useEffect, useRef } from 'react';

/**
 * Animated Nebula gradient — vanilla WebGL fragment shader.
 *
 * Renders organic, slowly morphing plumes of color (orange / steel blue /
 * black / mint highlights) using domain-warped fBm noise. Significantly more
 * dynamic than a static CSS gradient, while staying tiny (no Three.js).
 */
type Props = {
  className?: string;
  /** Optional CSS opacity multiplier on top of shader output. */
  opacity?: number;
};

const VERT = `
attribute vec2 a_pos;
void main(){
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// Fragment shader: domain-warped fBm → color ramp through the brand palette.
// Designed to look like the monopo.london hero — large, smooth blobs of color
// gliding across a near-black canvas. Tweak palette / animation by editing the
// constants near the top.
const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;

// --- Hash + value-noise + fBm ---------------------------------------------
float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(
    mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
    mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++){
    v += a * vnoise(p);
    p = r * p * 2.05;
    a *= 0.55;
  }
  return v;
}

// Domain-warped fBm — gives organic plumes that twist around each other.
float warped(vec2 p, float t){
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + 0.15 * t),
    fbm(p + vec2(5.2, 1.3) - 0.10 * t)
  );
  vec2 r = vec2(
    fbm(p + 4.0 * q + vec2(1.7, 9.2) + 0.08 * t),
    fbm(p + 4.0 * q + vec2(8.3, 2.8) - 0.06 * t)
  );
  return fbm(p + 4.0 * r);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
  // Slight mouse parallax so the field reacts to the cursor (very subtle).
  vec2 m = (u_mouse - 0.5 * u_res) / min(u_res.x, u_res.y);
  p += m * 0.06;

  float t = u_time * 0.045;

  float n = warped(p * 1.55, t);
  // Boost contrast a touch.
  n = smoothstep(0.18, 0.92, n);

  // Brand-palette color ramp: black → blue → orange → mint highlight → black.
  vec3 black  = vec3(0.0);
  vec3 blue   = vec3(0.18, 0.32, 0.62);     // steel blue
  vec3 orange = vec3(0.815, 0.30, 0.045);   // monopo orange #cf520b ~
  vec3 amber  = vec3(0.85, 0.49, 0.10);     // warm highlight
  vec3 mint   = vec3(0.40, 0.86, 0.66);     // green-mint hint from gradient

  vec3 col = black;
  col = mix(col, blue,   smoothstep(0.20, 0.45, n));
  col = mix(col, orange, smoothstep(0.42, 0.62, n));
  col = mix(col, amber,  smoothstep(0.62, 0.78, n));
  col = mix(col, mint,   smoothstep(0.86, 0.99, n) * 0.55);

  // Vignette to keep typography crisp.
  float d = length(uv - 0.5);
  float vig = smoothstep(0.95, 0.20, d);
  col *= mix(0.55, 1.0, vig);

  // Soft film grain so big flat areas feel alive.
  float g = hash(gl_FragCoord.xy + u_time) - 0.5;
  col += g * 0.012;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const sh = gl.createShader(type);
  if (!sh) throw new Error('createShader failed');
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh) || '';
    gl.deleteShader(sh);
    throw new Error('Shader compile error: ' + log);
  }
  return sh;
}

export function NebulaCanvas({ className, opacity = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false }) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) {
      canvas.style.background =
        'radial-gradient(circle at 30% 40%, #cf520b, #1f3a8a 50%, #000 90%)';
      return;
    }

    let disposed = false;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link failed:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    // The fBm shader is expensive per pixel, and the output is soft and
    // organic — render at a fraction of CSS resolution and let the browser
    // upscale; visually indistinguishable, massively cheaper on the GPU.
    const RENDER_SCALE = 0.5;
    const MAX_INTERNAL_WIDTH = 1100;
    // Slow-morphing background doesn't need 60fps.
    const FRAME_MS = 1000 / 30;

    let scale = RENDER_SCALE;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      scale = RENDER_SCALE;
      if (r.width * scale > MAX_INTERNAL_WIDTH) {
        scale = MAX_INTERNAL_WIDTH / r.width;
      }
      const w = Math.max(1, Math.floor(r.width * scale));
      const h = Math.max(1, Math.floor(r.height * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) * scale;
      my = (r.height - (e.clientY - r.top)) * scale; // flip Y for GL coords
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });

    resize();

    const start = performance.now();
    let raf = 0;
    let last = 0;
    let inView = true;

    const drawFrame = () => {
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const render = (now: number) => {
      if (disposed) return;
      raf = requestAnimationFrame(render);
      if (now - last < FRAME_MS) return;
      last = now;
      drawFrame();
    };

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const updateLoop = () => {
      cancelAnimationFrame(raf);
      if (disposed || reducedMotion) return;
      if (inView && !document.hidden) {
        raf = requestAnimationFrame(render);
      }
    };

    // Render only while the canvas is actually on screen — the page has two
    // nebula instances (hero + contact) and at most one is visible at a time.
    const io = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      updateLoop();
    });
    io.observe(canvas);

    const onVis = () => updateLoop();
    document.addEventListener('visibilitychange', onVis);

    if (reducedMotion) {
      // Single static frame.
      drawFrame();
    } else {
      updateLoop();
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (buf) gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', opacity }}
      aria-hidden="true"
    />
  );
}
