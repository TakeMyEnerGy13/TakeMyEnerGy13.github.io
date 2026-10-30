// Editable geometric props. Positions and normals stay in object space.
export const VERTEX_STRIDE = 9;
export const DIE_FACES = [
  { normal: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], pips: 1 },
  { normal: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0], pips: 6 },
  { normal: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0], pips: 3 },
  { normal: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0], pips: 4 },
  { normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1], pips: 2 },
  { normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1], pips: 5 }
];

const unit = v => {
  const length = Math.hypot(...v);
  return v.map(n => n / length);
};
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a.reduce((sum, n, i) => sum + n * b[i], 0);
const vertex = (p, n, uv = p.slice(0, 2), mark = 0) => [...p, ...n, ...uv, mark];

function triangle(data, a, b, c) {
  const ab = b.slice(0, 3).map((n, i) => n - a[i]);
  const ac = c.slice(0, 3).map((n, i) => n - a[i]);
  const averageNormal = a.slice(3, 6).map((n, i) => n + b[i + 3] + c[i + 3]);
  if (dot(cross(ab, ac), averageNormal) < 0) [b, c] = [c, b];
  data.push(...a, ...b, ...c);
}

function lathe(profile, segments) {
  const data = [];
  for (let j = 0; j < profile.length - 1; j++) {
    const [r, z] = profile[j];
    const [R, Z] = profile[j + 1];
    const [radial, axial] = unit([Z - z, r - R]);
    const sample = (radius, depth, angle) => vertex(
      [radius * Math.cos(angle), radius * Math.sin(angle), depth],
      [radial * Math.cos(angle), radial * Math.sin(angle), axial]
    );
    for (let i = 0; i < segments; i++) {
      const a = i / segments * Math.PI * 2;
      const b = (i + 1) / segments * Math.PI * 2;
      const p = sample(r, z, a), q = sample(R, Z, a);
      const s = sample(R, Z, b), t = sample(r, z, b);
      if (R > 0) triangle(data, p, q, s);
      if (r > 0) triangle(data, p, s, t);
    }
  }
  return data;
}

function raisedStar(data, side, depthScale) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 ? .105 : .235;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius];
  });
  const base = side * .076 * depthScale;
  const top = side * .112 * depthScale;
  const n = [0, 0, side];
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    triangle(data, vertex([0, 0, top], n, [0, 0], 8), vertex([...a, top], n, a, 8), vertex([...b, top], n, b, 8));
    const edge = unit([b[1] - a[1], a[0] - b[0], 0]);
    const p = vertex([...a, base], edge, a, 8), q = vertex([...b, base], edge, b, 8);
    const s = vertex([...b, top], edge, b, 8), t = vertex([...a, top], edge, a, 8);
    triangle(data, p, q, s);
    triangle(data, p, s, t);
  }
}

export function buildCoin(segments = 64) {
  const data = lathe([
    [0, -.075], [.37, -.075], [.39, -.098], [.445, -.098], [.48, -.08], [.5, -.05],
    [.5, .05], [.48, .08], [.445, .098], [.39, .098], [.37, .075], [0, .075]
  ].map(([radius, depth]) => [radius, depth * .7]), segments);
  raisedStar(data, -1, .7);
  raisedStar(data, 1, .7);
  return new Float32Array(data);
}

export function buildChip(segments = 64) {
  return new Float32Array(lathe([
    [0, -.1], [.445, -.1], [.48, -.09], [.5, -.065],
    [.5, .065], [.48, .09], [.445, .1], [0, .1]
  ], segments));
}

export function buildDie(steps = 12) {
  const data = [];
  const cornerRadius = .095;
  const core = .5 - cornerRadius;
  for (const face of DIE_FACES) {
    const sample = (u, v) => {
      const cube = face.normal.map((n, i) => n * .5 + face.u[i] * u + face.v[i] * v);
      const inner = cube.map(n => Math.max(-core, Math.min(core, n)));
      const normal = unit(cube.map((n, i) => n - inner[i]));
      const position = inner.map((n, i) => n + normal[i] * cornerRadius);
      return vertex(position, normal, [u, v], face.pips);
    };
    for (let y = 0; y < steps; y++) {
      for (let x = 0; x < steps; x++) {
        const u = x / steps - .5, U = (x + 1) / steps - .5;
        const v = y / steps - .5, V = (y + 1) / steps - .5;
        const a = sample(u, v), b = sample(U, v), c = sample(U, V), d = sample(u, V);
        triangle(data, a, b, c);
        triangle(data, a, c, d);
      }
    }
  }
  return new Float32Array(data);
}

export function rotationMatrix(x, y, z) {
  const sx = Math.sin(x), cx = Math.cos(x), sy = Math.sin(y), cy = Math.cos(y), sz = Math.sin(z), cz = Math.cos(z);
  return new Float32Array([
    cz * cy, sz * cy, -sy,
    cz * sy * sx - sz * cx, sz * sy * sx + cz * cx, cy * sx,
    cz * sy * cx + sz * sx, sz * sy * cx - cz * sx, cy * cx
  ]);
}

const vertexShader = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUV;
attribute float aPips;
uniform mat3 uRotation;
uniform vec2 uViewport;
uniform vec2 uCenter;
uniform float uSize;
uniform float uDepth;
varying vec3 vLocal;
varying vec3 vNormal;
varying vec3 vLocalNormal;
varying vec2 vUV;
varying float vPips;
void main() {
  float focal = 1400.0;
  float centerW = 1.0 - uDepth / focal;
  vec3 p = uRotation * aPosition * uSize * centerW;
  vec2 center = vec2(uCenter.x - uViewport.x * .5, uViewport.y * .5 - uCenter.y);
  vec3 world = p + vec3(center * centerW, uDepth);
  float w = 1.0 - world.z / focal;
  gl_Position = vec4(world.xy / (uViewport * .5), -world.z / focal, w);
  vLocal = aPosition;
  vNormal = uRotation * aNormal;
  vLocalNormal = aNormal;
  vUV = aUV;
  vPips = aPips;
}`;

const fragmentShader = `
precision mediump float;
uniform float uKind;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uTime;
varying vec3 vLocal;
varying vec3 vNormal;
varying vec3 vLocalNormal;
varying vec2 vUV;
varying float vPips;
float grain(vec3 p) { return fract(sin(dot(floor(p * 370.0), vec3(17.17, 31.73, 73.31))) * 193.17); }
float pipDistance(vec2 p, float count) {
  float center = length(p);
  float diagonal = min(length(p - vec2(.215)), length(p + vec2(.215)));
  float corners = length(abs(p) - vec2(.215));
  if (count < 1.5) return center;
  if (count < 2.5) return diagonal;
  if (count < 3.5) return min(center, diagonal);
  if (count < 4.5) return corners;
  if (count < 5.5) return min(center, corners);
  return min(corners, length(vec2(abs(p.x) - .215, p.y)));
}
void main() {
  vec3 n = normalize(vNormal);
  vec3 color = uColor;
  float metal = 0.0;
  float r = length(vLocal.xy);
  float angle = atan(vLocal.y, vLocal.x);
  float face = smoothstep(.65, .95, abs(vLocalNormal.z));
  if (uKind < .5) {
    metal = .75;
    float ring = 1.0 - smoothstep(.004, .012, abs(r - .325));
    color *= 1.0 - face * ring * .42;
    float milling = (.5 + .5 * sin(angle * 64.0)) * smoothstep(.475, .49, r);
    color *= 1.0 - milling * .22;
    if (vPips > 7.5) color = vec3(.98, .76, .33);
  } else if (uKind < 1.5) {
    float stripe = smoothstep(.58, .72, cos(angle * 8.0)) * smoothstep(.385, .405, r);
    float ring = (1.0 - smoothstep(.004, .012, abs(r - .325))) * face;
    float diamond = (1.0 - smoothstep(.095, .11, abs(vLocal.x) + abs(vLocal.y))) * face;
    color = mix(color, vec3(.89, .80, .62), max(stripe, max(ring * .85, diamond * .8)));
  } else {
    float pip = pipDistance(vUV, vPips);
    float rim = 1.0 - smoothstep(.062, .075, pip);
    color = mix(color, vec3(.49, .37, .28), rim * .65);
    color = mix(color, vec3(.065, .045, .075), 1.0 - smoothstep(.053, .063, pip));
  }
  float key = max(dot(n, normalize(vec3(-.45, .7, 1.0))), 0.0);
  float warm = max(dot(n, normalize(vec3(.25, -.8, .65))), 0.0);
  float cool = max(dot(n, normalize(vec3(-.8, .1, .3))), 0.0);
  float band = mix(key, floor(key * 5.0 + .5) / 5.0, .35);
  vec3 lit = color * (.28 + band * .68);
  lit += color * vec3(1.0, .42, .24) * warm * (.21 + .025 * sin(uTime * 2.1));
  lit += vec3(.15, .19, .40) * cool * .15;
  float shine = pow(max(dot(n, normalize(vec3(-.25, .4, 1.0))), 0.0), 28.0);
  lit += vec3(1.0, .81, .49) * shine * (.08 + metal * .38);
  lit *= .94 + grain(vLocal) * .08;
  float inkEdge = smoothstep(.025, .16, abs(n.z));
  lit = mix(vec3(.055, .035, .055), lit, .28 + inkEdge * .72);
  gl_FragColor = vec4(lit * uOpacity, uOpacity);
}`;

export function createTreasureRenderer(canvas, onStateChange = () => {}) {
  const gl = canvas.getContext('webgl', {
    alpha: true, antialias: true, premultipliedAlpha: true,
    preserveDrawingBuffer: true, powerPreference: 'low-power'
  });
  if (!gl) { onStateChange('sprites'); return null; }
  const geometry = [buildCoin(), buildChip(), buildDie()];
  let program;
  let meshes;
  let uniforms;
  let attributes;
  let available = false;

  function setup() {
    program = gl.createProgram();
    for (const [type, source] of [[gl.VERTEX_SHADER, vertexShader], [gl.FRAGMENT_SHADER, fragmentShader]]) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(error);
      }
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    uniforms = Object.fromEntries(['Rotation', 'Viewport', 'Center', 'Size', 'Depth', 'Kind', 'Color', 'Opacity', 'Time'].map(name => [name, gl.getUniformLocation(program, `u${name}`)]));
    attributes = ['Position', 'Normal', 'UV', 'Pips'].map(name => gl.getAttribLocation(program, `a${name}`));
    meshes = geometry.map(data => {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return { buffer, count: data.length / VERTEX_STRIDE };
    });
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    available = true;
    onStateChange('webgl');
  }

  function initialize() {
    try { setup(); }
    catch (error) {
      available = false;
      if (program) gl.deleteProgram(program);
      console.warn('3D treasure unavailable; using painted sprites.', error);
      onStateChange('sprites');
    }
  }
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    available = false;
    onStateChange('sprites');
  });
  canvas.addEventListener('webglcontextrestored', initialize);
  initialize();

  return {
    draw(ctx, items, width, height, pixels, time) {
      if (!available) return false;
      const targetWidth = Math.min(1500, pixels);
      const targetHeight = Math.round(targetWidth * height / width);
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(uniforms.Viewport, width, height);
      gl.uniform1f(uniforms.Time, time);
      const depthOf = item => (item.depth - 1) * 180 + Math.sin(item.angle) * 35;
      for (const item of [...items].sort((a, b) => depthOf(a) - depthOf(b))) {
        const type = item.kind < 2 ? 0 : item.kind === 7 ? 2 : 1;
        const mesh = meshes[type];
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
        [3, 3, 2, 1].forEach((size, i) => {
          gl.enableVertexAttribArray(attributes[i]);
          gl.vertexAttribPointer(attributes[i], size, gl.FLOAT, false, VERTEX_STRIDE * 4, [0, 12, 24, 32][i]);
        });
        const color = type === 0 ? [.88, .58, .19] : type === 2 ? [.91, .83, .66] : item.kind === 4 ? [.69, .20, .22] : [.22, .28, .60];
        gl.uniform3fv(uniforms.Color, color);
        gl.uniform1f(uniforms.Kind, type);
        gl.uniform1f(uniforms.Opacity, item.opacity);
        gl.uniform2f(uniforms.Center, item.x, item.y);
        gl.uniform1f(uniforms.Size, item.size * (type === 2 ? .82 : 1));
        gl.uniform1f(uniforms.Depth, depthOf(item));
        gl.uniformMatrix3fv(uniforms.Rotation, false, rotationMatrix(
          item.angle + time * (.72 + item.phase * .5),
          item.angle * .73 + time * (1.03 + item.phase * .35),
          item.angle + time * .47
        ));
        gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
      }
      ctx.drawImage(canvas, 0, 0, width, height);
      return true;
    }
  };
}
