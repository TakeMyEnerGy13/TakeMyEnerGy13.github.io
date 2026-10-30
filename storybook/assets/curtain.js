(() => {
  const root = document.documentElement;
  if (!root.classList.contains('intro-pending')) return;
  const intro = document.querySelector('.intro');
  const canvas = intro.querySelector('.intro-fabric');
  const image = intro.querySelector('.intro-curtain img');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const precisePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, depth: false, powerPreference: 'low-power' });
  if (!gl) return;

  const vertexSource = `
    precision highp float;
    attribute vec2 a_uv;
    uniform mediump float u_side;
    uniform float u_time;
    uniform float u_open;
    uniform mediump vec3 u_pointer;
    varying mediump vec2 v_uv;
    varying mediump vec2 v_world;
    varying mediump float v_light;
    varying mediump float v_fold;

    void main() {
      float u = a_uv.x;
      float v = a_uv.y;
      float localTime = max(0.0, u_open - v * .38 - max(u_side, 0.0) * .06);
      float pull = smoothstep(0.0, 1.9, localTime);
      float width = .532 * (1.0 - pull);
      float outer = u_side < 0.0 ? -.027 : 1.027;
      outer += u_side * .16 * pull * pull;
      float x = outer - u_side * u * width;
      float freeFabric = sin(u * 3.14159265) * pow(v, .75);
      float wind = sin(v * 6.5 - u_time * 1.1 + u * 3.0 + u_side) * .6
                 + sin(v * 12.0 + u_time * .73 + u * 5.0) * .4;
      float distanceToPointer = length(vec2((x - u_pointer.x) * 1.3, v - u_pointer.y));
      float touch = exp(-distanceToPointer * distanceToPointer * 16.0) * u_pointer.z;
      float wave = sin(distanceToPointer * 22.0 - u_time * 3.0) * touch;
      float release = sin(v * 9.0 - localTime * 8.0 + u_side) * sin(pull * 3.14159265);
      x += freeFabric * (wind * .012 + wave * .017 + release * .025) * (1.0 - pull);
      float y = -.045 + v * 1.105;
      y += freeFabric * (.009 * wind + .015 * touch) - u * pull * .07;
      float foldPhase = u * 58.0 + wind * (.45 + v * .55) + wave * 1.1 + release * .5;
      float fold = sin(foldPhase) + sin(foldPhase * 2.05 + .4) * .22;
      vec3 normal = normalize(vec3(cos(foldPhase) * (.85 + pull), .1 + wind * .1, 1.0));
      vec3 light = normalize(vec3((u_pointer.x - x) * .5 - u_side * .25, -.45, 1.0));
      v_light = max(dot(normal, light), 0.0);
      v_fold = fold;
      v_world = vec2(x, v);
      v_uv = vec2(u + (wind * .006 + wave * .01) * sin(u * 3.14159265), v);
      gl_Position = vec4(x * 2.0 - 1.0, 1.0 - y * 2.0, 0.0, 1.0);
    }
  `;
  const fragmentSource = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform mediump float u_side;
    uniform mediump vec3 u_pointer;
    varying mediump vec2 v_uv;
    varying mediump vec2 v_world;
    varying mediump float v_light;
    varying mediump float v_fold;
    void main() {
      vec2 uv = vec2(.065 + v_uv.x * .87, .045 + v_uv.y * .83);
      vec3 cloth = texture2D(u_texture, uv).rgb;
      float velvet = .64 + .44 * v_light + .09 * v_fold;
      float spotlight = exp(-pow((v_world.x - .5) * 1.5, 2.0) - pow((v_world.y - .32) * 1.15, 2.0));
      float cursorLight = exp(-dot(v_world - u_pointer.xy, v_world - u_pointer.xy) * 8.0) * u_pointer.z;
      float seam = 1.0 - smoothstep(.975, 1.0, v_uv.x) * .58;
      float vignette = 1.0 - .3 * pow(abs(v_world.x - .5) * 2.0, 1.5);
      vec3 color = cloth * velvet * (.65 + spotlight * .37 + cursorLight * .12) * seam * vignette;
      color += vec3(.05, .014, .012) * pow(v_light, 8.0) * spotlight;
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  let program;
  let vertices;
  let indices;
  let texture;
  let uniforms;
  let indexCount = 0;
  let frame = 0;
  let lastFrame = 0;
  let time = 0;
  let openingTime = -1;
  let ready = false;
  let disposed = false;
  let wasOpen = false;
  const pointer = { x: .5, y: .45, strength: 0, targetX: .5, targetY: .45, targetStrength: 0 };

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const reason = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(reason || 'Curtain shader unavailable');
    }
    return shader;
  }

  function initialize() {
    if (disposed || intro.classList.contains('is-opening')) return;
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Curtain program unavailable');
    gl.useProgram(program);

    const columns = 96;
    const rows = 56;
    const points = [];
    const triangles = [];
    for (let y = 0; y <= rows; y++) {
      for (let x = 0; x <= columns; x++) points.push(x / columns, y / rows);
    }
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const top = y * (columns + 1) + x;
        const bottom = top + columns + 1;
        triangles.push(top, bottom, top + 1, top + 1, bottom, bottom + 1);
      }
    }
    indexCount = triangles.length;
    vertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_uv');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    indices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangles), gl.STATIC_DRAW);

    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    uniforms = Object.fromEntries(['u_side', 'u_time', 'u_open', 'u_pointer'].map(name => [name, gl.getUniformLocation(program, name)]));
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
    gl.clearColor(0, 0, 0, 0);
    ready = true;
    canvas.dataset.renderer = 'webgl';
    resize();
    intro.classList.add('has-live-fabric');
    sync();
  }

  function draw() {
    if (!ready || disposed) return;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uniforms.u_time, time);
    gl.uniform1f(uniforms.u_open, Math.max(0, openingTime));
    gl.uniform3f(uniforms.u_pointer, pointer.x, pointer.y, pointer.strength);
    for (const side of [-1, 1]) {
      gl.uniform1f(uniforms.u_side, side);
      gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
    }
  }

  function resize() {
    if (!ready || disposed) return;
    const bounds = intro.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const ratio = Math.min(devicePixelRatio || 1, 1.5, 1600 / bounds.width, 1200 / bounds.height);
    canvas.width = Math.round(bounds.width * ratio);
    canvas.height = Math.round(bounds.height * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);
    if (!lastFrame) lastFrame = now;
    const elapsed = now - lastFrame;
    if (openingTime < 0 && elapsed < 1000 / 30) return;
    const delta = Math.min(elapsed, 50) / 1000;
    lastFrame = now;
    time += delta;
    const ease = 1 - Math.exp(-delta * 7);
    pointer.x += (pointer.targetX - pointer.x) * ease;
    pointer.y += (pointer.targetY - pointer.y) * ease;
    pointer.strength += (pointer.targetStrength - pointer.strength) * ease;
    if (openingTime >= 0) openingTime += delta;
    draw();
    if (openingTime >= 2.4) {
      cancelAnimationFrame(frame);
      frame = 0;
      intro.dispatchEvent(new Event('curtain-revealed'));
    }
  }

  function sync() {
    if (disposed) return;
    if (intro.open) wasOpen = true;
    else if (wasOpen) { dispose(); return; }
    if (!ready) return;
    if (intro.classList.contains('is-opening') && openingTime < 0) openingTime = 0;
    const paused = reducedMotion.matches || root.classList.contains('motion-paused');
    const running = intro.open && intro.classList.contains('is-presenting') && !document.hidden && !paused;
    canvas.dataset.state = running ? (openingTime < 0 ? 'idle' : 'opening') : 'paused';
    if (running && !frame) {
      lastFrame = 0;
      frame = requestAnimationFrame(tick);
    } else if (!running) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      draw();
    }
  }

  function movePointer(event) {
    if (!precisePointer.matches || openingTime >= 0 || disposed) return;
    const bounds = intro.getBoundingClientRect();
    pointer.targetX = (event.clientX - bounds.left) / bounds.width;
    pointer.targetY = (event.clientY - bounds.top) / bounds.height;
    pointer.targetStrength = 1;
  }
  function leavePointer() { pointer.targetStrength = 0; }
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    frame = 0;
    observer.disconnect();
    resizeObserver.disconnect();
    intro.removeEventListener('pointermove', movePointer);
    intro.removeEventListener('pointerleave', leavePointer);
    document.removeEventListener('visibilitychange', sync);
    reducedMotion.removeEventListener('change', sync);
    if (vertices) gl.deleteBuffer(vertices);
    if (indices) gl.deleteBuffer(indices);
    if (texture) gl.deleteTexture(texture);
    if (program) gl.deleteProgram(program);
    canvas.dataset.state = 'stopped';
  }

  const observer = new MutationObserver(sync);
  observer.observe(intro, { attributes: true, attributeFilter: ['class', 'open'] });
  observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(intro);
  intro.addEventListener('pointermove', movePointer, { passive: true });
  intro.addEventListener('pointerleave', leavePointer);
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  canvas.addEventListener('webglcontextlost', () => {
    intro.classList.remove('has-live-fabric');
    dispose();
  });
  image.decode().then(initialize).catch(error => {
    canvas.dataset.fallbackReason = error.message;
    intro.classList.remove('has-live-fabric');
    dispose();
  });
})();
