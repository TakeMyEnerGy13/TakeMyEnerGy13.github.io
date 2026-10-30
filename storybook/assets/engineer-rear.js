(() => {
  const scene = document.querySelector('.engineer-rear-scene');
  if (!scene) return;
  const section = scene.closest('.about--engineer');
  // Fixed sequences keep the atmosphere stable across reloads; CSS owns the clock.
  const alphabet = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ012345789{}<>:=';
  function populate(selector, count, screen = false) {
    const layer = section.querySelector(selector);
    if (!layer) return;
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < count; index += 1) {
      const stream = document.createElement('span');
      stream.className = 'rear-code-stream';
      const length = screen ? 12 + index % 7 : 22 + (index * 7) % 19;
      stream.textContent = Array.from({ length }, (_, row) => alphabet[(index * 13 + row * 7 + row * row) % alphabet.length]).join('');
      stream.style.cssText = `--x:${(index + .35) / count * 100}%;--duration:${screen ? 2.5 + index % 4 : 5 + (index * 3) % 8}s;--delay:${-index * 1.73}s;--size:${screen ? 11 : 12 + index % 3 * 4}px;--strength:${.28 + index % 5 * .14}`;
      fragment.append(stream);
    }
    layer.append(fragment);
  }
  populate('.rear-matrix-back', 38);
  populate('.rear-matrix-front', 11);
  populate('.rear-screen-matrix', 14, true);

  const person = scene.querySelector('.rear-person');
  const image = person.querySelector('img');
  const canvas = person.querySelector('.rear-character');
  const mouse = scene.querySelector('.rear-mouse');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // Both small bursts share the character's clock: typing first, mouse clicks second.
  const flightPaths = {
    'paper-left':  { start: 1.8,  life: 2.65, x: .43, y: .50, vx: -.15,  vy: -.44, gravity: .34, spin: -135, flutter: 1 },
    'code-right':  { start: 2.08, life: 2.45, x: .58, y: .50, vx: .155,  vy: -.46, gravity: .36, spin: 100,  flutter: .45 },
    'spark-left':  { start: 2.24, life: 1.6,  x: .43, y: .49, vx: -.205, vy: -.32, gravity: .28, spin: -160, flutter: 0 },
    'paper-right': { start: 7.05, life: 2.8,  x: .59, y: .50, vx: .14,   vy: -.44, gravity: .34, spin: 155,  flutter: 1 },
    'code-left':   { start: 7.28, life: 2.45, x: .43, y: .50, vx: -.145, vy: -.46, gravity: .36, spin: -110, flutter: .45 },
    'spark-right': { start: 7.47, life: 1.6,  x: .59, y: .49, vx: .205,  vy: -.31, gravity: .28, spin: 180,  flutter: 0 }
  };
  const flights = Array.from(scene.querySelectorAll('[data-flight]'), node => ({
    node, path: flightPaths[node.dataset.flight],
    art: node.querySelector('.rear-flight-art'), tail: node.querySelector('.rear-flight-tail')
  }));
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true });
  if (!gl) return;

  // The arm's reach is drawn into the sprite; only the gloves make small working motions.
  const vertexSource = `
    attribute vec2 a_position;
    uniform vec2 u_mouse;
    uniform vec2 u_tap;
    varying vec2 v_uv;
    void main() {
      vec2 p = a_position;
      v_uv = p;
      float height = smoothstep(.30, .35, p.y) * (1. - smoothstep(.44, .49, p.y));
      float right = smoothstep(.77, .83, p.x) * height;
      float left = (1. - smoothstep(.28, .345, p.x)) * height;
      p += u_mouse * right;
      p.y += u_tap.x * left + u_tap.y * right;
      gl_Position = vec4(p.x * 2. - 1., 1. - p.y * 2., 0., 1.);
    }
  `;
  const fragmentSource = `
    precision mediump float;
    uniform sampler2D u_image;
    varying vec2 v_uv;
    void main() {
      gl_FragColor = texture2D(u_image, v_uv);
    }
  `;
  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source);
    gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(result));
    }
    return result;
  }

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (error) {
    console.warn('Engineer character keeps its complete still pose:', error);
    return;
  }
  gl.useProgram(program);
  const cells = 80;
  const vertices = [];
  const indices = [];
  for (let y = 0; y <= cells; y += 1) {
    for (let x = 0; x <= cells; x += 1) {
      vertices.push(x / cells, y / cells);
      if (x < cells && y < cells) {
        const a = y * (cells + 1) + x;
        const b = a + cells + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
  const tapLocation = gl.getUniformLocation(program, 'u_tap');
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let ready = false;
  let frame = 0;
  let lastFrame = 0;
  let time = 0;
  let sceneWidth = 0;
  let sceneHeight = 0;
  let lastCel = -1;
  const ease = value => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  function drawFlights() {
    const cel = Math.floor(time * 12);
    if (cel === lastCel) return;
    lastCel = cel;
    const cycle = (cel / 12) % 12;
    for (const { node, path, art, tail } of flights) {
      const age = cycle - path.start;
      if (reducedMotion.matches || age < 0 || age >= path.life) {
        node.style.opacity = '0';
        continue;
      }
      const progress = age / path.life;
      const flutter = Math.sin(age * 10) * path.flutter * ease(progress / .35);
      const x = path.x + path.vx * age + flutter * .007;
      const y = path.y + path.vy * age + .5 * path.gravity * age * age;
      const scale = .7 + .3 * ease(progress / .25);
      const roll = path.spin * progress + flutter * 17;
      const tangent = Math.atan2((path.vy + path.gravity * age) * sceneHeight, path.vx * sceneWidth) * 180 / Math.PI;
      node.style.opacity = String(1 - ease((progress - .72) / .28));
      node.style.transform = `translate3d(${x * sceneWidth}px,${y * sceneHeight}px,0) translate(-50%,-50%) scale(${scale})`;
      art.style.transform = `rotate(${roll}deg) scaleX(${1 - Math.abs(flutter) * .28}) skewY(${flutter * 7}deg)`;
      tail.style.transform = `rotate(${tangent}deg) scaleX(${.5 + .5 * (1 - progress)})`;
      tail.style.opacity = String(.38 * (1 - ease((progress - .15) / .35)));
    }
  }
  function draw() {
    if (!ready) return;
    const cycle = time % 12;
    const usingMouse = ease((cycle - 6.8) / .3) * (1 - ease((cycle - 9.1) / .3));
    const nudgeX = Math.sin(time * 4) * .0018 * usingMouse;
    const nudgeY = Math.sin(time * 5.3) * .0011 * usingMouse;
    gl.uniform2f(mouseLocation, nudgeX, nudgeY);
    gl.uniform2f(tapLocation, Math.sin(time * 15) * .0018 * (1 - .6 * usingMouse), Math.sin(time * 8) * .0012 * usingMouse);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    mouse.style.transform = `translate(${nudgeX * person.clientWidth}px,${nudgeY * person.clientWidth}px) rotate(8deg)`;
    drawFlights();
  }
  function resize() {
    const size = Math.min(1024, Math.round(person.clientWidth * Math.min(devicePixelRatio || 1, 2)));
    canvas.width = canvas.height = Math.max(1, size);
    gl.viewport(0, 0, canvas.width, canvas.height);
    sceneWidth = scene.clientWidth;
    sceneHeight = scene.clientHeight;
    lastCel = -1;
    draw();
  }
  function tick(now) {
    frame = requestAnimationFrame(tick);
    if (!lastFrame) lastFrame = now;
    const elapsed = now - lastFrame;
    if (elapsed < 1000 / 30) return;
    time += Math.min(elapsed, 80) / 1000;
    lastFrame = now;
    draw();
  }
  function syncPlayback() {
    const running = ready && scene.classList.contains('is-moving') && !document.hidden && !reducedMotion.matches;
    if (running && !frame) frame = requestAnimationFrame(tick);
    else if (!running) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
    }
  }
  function prepare() {
    if (!image.naturalWidth) return;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    ready = true;
    resize();
    person.classList.add('is-rendered');
    syncPlayback();
  }
  canvas.addEventListener('webglcontextlost', () => {
    ready = false;
    person.classList.remove('is-rendered');
    mouse.style.removeProperty('transform');
    flights.forEach(({ node }) => { node.style.opacity = '0'; });
    syncPlayback();
  });
  new ResizeObserver(resize).observe(person);
  new MutationObserver(syncPlayback).observe(scene, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener('change', syncPlayback);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; lastFrame = 0; });
  window.addEventListener('pageshow', syncPlayback);
  if (image.complete) prepare();
  else image.addEventListener('load', prepare, { once: true });
})();
