(() => {
  const scene = document.querySelector('.composition');
  if (!scene) return;
  const canvas = scene.querySelector('.living-plate');
  const plate = scene.querySelector('.plate');
  const puppet = scene.hasAttribute('data-forest-puppet');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, premultipliedAlpha: true, powerPreference: 'low-power' });
  if (!gl) return;

  // All masks use the approved composition's 1672 × 941 coordinate system.
  const vertexSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position;
      gl_Position = vec4(a_position.x * 2.0 - 1.0, 1.0 - a_position.y * 2.0, 0.0, 1.0);
    }
  `;
  const fragmentSource = `
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_open;
    uniform sampler2D u_closed;
    uniform sampler2D u_path;
    uniform sampler2D u_dance;
    uniform float u_time;
    uniform float u_wind;
    uniform float u_puppet;
    uniform float u_blinks[11];
    const vec2 size = vec2(1672.0, 941.0);

    float ellipse(vec2 p, vec2 center, vec2 radius, float angle, float edge) {
      vec2 d = p - center;
      float c = cos(angle), s = sin(angle);
      d = vec2(c * d.x + s * d.y, -s * d.x + c * d.y) / radius;
      return 1.0 - smoothstep(edge, 1.0, length(d));
    }

    vec2 plant(vec2 p, vec2 center, vec2 radius, float root, float phase, float strength) {
      float mask = ellipse(p, center, radius, 0.0, .58);
      float height = clamp((root - p.y) / (radius.y * 1.7), 0.0, 1.0);
      float breeze = sin(u_time * 1.12 + phase) * .72 + sin(u_time * .47 + phase) * .28 + u_wind * 1.25;
      return vec2(breeze * strength * height * mask, sin(u_time * .82 + phase) * .35 * mask * height);
    }

    void main() {
      vec2 p = v_uv * size;
      vec2 drift = vec2(0.0);
      drift += plant(p, vec2(48.0, 644.0), vec2(78.0, 133.0), 758.0, .3, 11.0);
      drift += plant(p, vec2(141.0, 717.0), vec2(68.0, 100.0), 790.0, 1.8, 9.0);
      drift += plant(p, vec2(256.0, 760.0), vec2(67.0, 66.0), 808.0, 2.7, 7.0);
      drift += plant(p, vec2(352.0, 811.0), vec2(52.0, 53.0), 851.0, 4.1, 6.0);
      drift += plant(p, vec2(1328.0, 605.0), vec2(69.0, 101.0), 692.0, 1.2, 10.0);
      drift += plant(p, vec2(1292.0, 708.0), vec2(66.0, 88.0), 779.0, 3.8, 9.0);
      drift += plant(p, vec2(1581.0, 789.0), vec2(83.0, 80.0), 859.0, 2.2, 8.0);

      // The hands and branch remain pinned while the dress, head and feet breathe.
      float girl = max(ellipse(p, vec2(1075.0, 564.0), vec2(340.0, 294.0), -.3, .64),
                       ellipse(p, vec2(1207.0, 336.0), vec2(151.0, 131.0), 0.0, .65));
      float hands = ellipse(p, vec2(1409.0, 388.0), vec2(90.0, 127.0), 0.0, .25);
      girl *= 1.0 - u_puppet;
      float sway = sin(u_time * 1.2) * .8 + sin(u_time * .51) * .2;
      vec2 pivot = p - vec2(1405.0, 374.0);
      drift += vec2(-pivot.y, pivot.x) * (sway * .014 + u_wind * .009) * girl * (1.0 - hands);
      drift.y += sin(u_time * 1.6) * 1.8 * girl * (1.0 - hands);
      float hem = ellipse(p, vec2(1124.0, 617.0), vec2(140.0, 99.0), .4, .5);
      drift.x += sin(u_time * 2.8 + p.y * .04) * (2.6 + abs(u_wind) * 3.0) * hem * (1.0 - u_puppet);

      // Ribbon anchors remain fixed; only their suspended lengths catch the gust.
      float ribbon = ellipse(p, vec2(865.0, 252.0), vec2(50.0, 215.0), .48, .45)
                   + ellipse(p, vec2(1049.0, 270.0), vec2(39.0, 156.0), -.06, .5)
                   + ellipse(p, vec2(1422.0, 216.0), vec2(40.0, 135.0), .22, .5);
      drift.x += sin(u_time * 2.1 - p.y * .017) * (4.5 + abs(u_wind) * 5.0) * ribbon * (1.0 - u_puppet);

      vec2 samplePoint = p - drift;
      vec2 uv = clamp(samplePoint / size, 0.0, 1.0);
      vec4 color = texture2D(u_open, uv);
      float pathMask = smoothstep(380.0, 430.0, samplePoint.x) * (1.0 - smoothstep(930.0, 980.0, samplePoint.x))
                     * smoothstep(373.0, 425.0, samplePoint.y) * (1.0 - smoothstep(815.0, 863.0, samplePoint.y));
      color = mix(color, texture2D(u_path, uv), pathMask);

      // Project the theatre's four dance cels onto the ground, preserving its grain.
      float beat = sin(u_time * 6.9813);
      float sy = (p.y - 449.0 - beat * 4.0) / (345.0 + sin(u_time * 3.49) * 9.0);
      float sx = (p.x - 360.0 - sy * 205.0 - sin(u_time * 1.7) * 10.0 - u_wind * 8.0) / 470.0;
      vec2 local = vec2(sx, sy);
      if (sx > .005 && sx < .995 && sy > .005 && sy < .995) {
        float cel = mod(floor(u_time / .45), 4.0);
        vec2 atlas = (local + vec2(mod(cel, 2.0), floor(cel / 2.0))) * .5;
        vec4 imp = texture2D(u_dance, atlas);
        float alpha = imp.a * .5;
        alpha += texture2D(u_dance, atlas + vec2(.0012, 0.0)).a * .125;
        alpha += texture2D(u_dance, atlas - vec2(.0012, 0.0)).a * .125;
        alpha += texture2D(u_dance, atlas + vec2(0.0, .0012)).a * .125;
        alpha += texture2D(u_dance, atlas - vec2(0.0, .0012)).a * .125;
        float face = ellipse(local, vec2(.5, .265), vec2(.25, .22), 0.0, .8);
        float grin = smoothstep(.48, .76, dot(imp.rgb, vec3(.3, .59, .11))) * face;
        float boot = ellipse(p, vec2(775.0, 480.0), vec2(69.0, 70.0), .35, .8) * (1.0 - u_puppet);
        float grain = fract(sin(dot(floor(p * 1.8), vec2(12.9898, 78.233))) * 43758.5453);
        alpha *= (1.0 - grin * .94) * (.79 + beat * .025) * (.94 + grain * .06) * (1.0 - boot);
        color.rgb *= 1.0 - alpha * vec3(.81, .83, .72);
      }

      // Only eyelid regions read the alternate cel; scenery never changes frames.
      float blink = 0.0;
      blink = max(blink, u_blinks[0] * ellipse(samplePoint, vec2(1207.0, 345.0), vec2(75.0, 43.0), .22, .73) * (1.0 - u_puppet));
      blink = max(blink, u_blinks[1] * ellipse(samplePoint, vec2(189.0, 94.0), vec2(35.0, 61.0), .43, .76));
      blink = max(blink, u_blinks[2] * ellipse(samplePoint, vec2(61.0, 204.0), vec2(35.0, 62.0), .45, .76));
      blink = max(blink, u_blinks[3] * ellipse(samplePoint, vec2(1606.0, 124.0), vec2(36.0, 63.0), -.23, .76));
      blink = max(blink, u_blinks[4] * ellipse(samplePoint, vec2(47.0, 614.0), vec2(34.0, 25.0), .35, .73));
      blink = max(blink, u_blinks[5] * ellipse(samplePoint, vec2(140.0, 683.0), vec2(29.0, 22.0), .35, .73));
      blink = max(blink, u_blinks[6] * ellipse(samplePoint, vec2(257.0, 760.0), vec2(23.0, 20.0), 0.0, .73));
      blink = max(blink, u_blinks[7] * ellipse(samplePoint, vec2(353.0, 811.0), vec2(20.0, 19.0), 0.0, .73));
      blink = max(blink, u_blinks[8] * ellipse(samplePoint, vec2(1327.0, 580.0), vec2(30.0, 24.0), -.45, .73));
      blink = max(blink, u_blinks[9] * ellipse(samplePoint, vec2(1291.0, 684.0), vec2(29.0, 24.0), -.32, .73));
      blink = max(blink, u_blinks[10] * ellipse(samplePoint, vec2(1578.0, 788.0), vec2(28.0, 27.0), 0.0, .73));
      if (blink > .001) color = mix(color, texture2D(u_closed, uv), blink);

      float candle = .6 + sin(u_time * 3.7) * .18 + sin(u_time * 8.3) * .1;
      float windows = ellipse(samplePoint, vec2(331.0, 278.0), vec2(13.0, 37.0), -.05, .55)
                    + ellipse(samplePoint, vec2(478.0, 283.0), vec2(12.0, 34.0), .06, .55);
      float spill = ellipse(samplePoint, vec2(331.0, 280.0), vec2(33.0, 55.0), 0.0, .1)
                  + ellipse(samplePoint, vec2(478.0, 285.0), vec2(32.0, 53.0), 0.0, .1);
      color.rgb += vec3(.19, .09, .018) * candle * windows + vec3(.032, .014, .003) * candle * spill;
      gl_FragColor = vec4(color.rgb * color.a, color.a);
    }
  `;

  const blinkImage = new Image();
  blinkImage.src = new URL('forest-living-blink.webp', plate.src).href;
  const pathImage = new Image();
  pathImage.src = puppet ? plate.src : new URL('forest-path-clear.webp', plate.src).href;
  const danceImage = new Image();
  danceImage.src = new URL('imp-dance.webp', plate.src).href;
  const values = new Float32Array(11);
  const names = ['girl', 'tree-left-upper', 'tree-left-lower', 'tree-right', 'flower-left', 'flower-left-small', 'mushroom-left', 'mushroom-left-small', 'flower-right-upper', 'flower-right-lower', 'mushroom-right'];
  const eyes = [3.3, 5.1, 9.3, 7.6, 2.1, 4.3, 6.4, 8.6, 3.8, 6.9, 5.6].map(next => ({ next, start: -1 }));
  let randomSeed = 417;
  const random = () => { randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0; return randomSeed / 4294967296; };
  let program, buffer, uniforms;
  let textures = [];
  let ready = false;
  let lost = false;
  let frame = 0;
  let previous = 0;
  let time = 0;
  let lastBlink = '';
  let wind = 0;
  let windVelocity = 0;
  const weather = document.createElement('div');
  weather.className = 'forest-weather';
  weather.setAttribute('aria-hidden', 'true');
  ['near', 'far'].forEach(depth => {
    const mist = document.createElement('img');
    mist.className = `forest-mist forest-mist-${depth}`;
    mist.src = new URL('stage-mist.webp', plate.src).href;
    mist.alt = '';
    weather.append(mist);
  });
  const svgNS = 'http://www.w3.org/2000/svg';
  const air = document.createElementNS(svgNS, 'svg');
  air.setAttribute('viewBox', '0 0 1672 941');
  air.classList.add('forest-air');
  const leaves = Array.from({ length: 7 }, (_, i) => {
    const leaf = document.createElementNS(svgNS, 'path');
    leaf.classList.add('forest-leaf');
    leaf.setAttribute('d', i % 2 ? 'M-10 0Q-1-9 10-2Q6 5-4 5L-10 0M-7 1L8-1' : 'M-10 0L-5-3L-5-7L0-5L4-9L5-3L10-2L6 1L9 5L2 5L-2 8L-4 3ZM-8 1L6-1');
    air.append(leaf);
    return leaf;
  });
  const motes = Array.from({ length: 9 }, () => {
    const mote = document.createElementNS(svgNS, 'circle');
    mote.classList.add('forest-mote');
    mote.setAttribute('r', String(1.1 + random() * 1.1));
    air.append(mote);
    return { node: mote, x: random() > .5 ? 1150 + random() * 400 : 60 + random() * 320, y: 480 + random() * 350, phase: random() * 6.28 };
  });
  weather.append(air);
  scene.append(weather);

  function paintWeather() {
    weather.style.setProperty('--mist-drift', (Math.sin(time * .23) * 12 + wind * 7).toFixed(2));
    weather.style.setProperty('--mist-rise', (Math.cos(time * .31) * 5).toFixed(2));
    leaves.forEach((leaf, i) => {
      const phase = ((time + i * .43) % 13) / 6;
      const travel = Math.min(1, phase);
      leaf.setAttribute('opacity', phase < 1 ? String(Math.sin(travel * Math.PI) * .72) : '0');
      leaf.setAttribute('transform', `translate(${-120 + travel * 1940} ${720 + Math.sin(travel * 6.28 + i) * 65 + i * 17}) rotate(${travel * 640 + i * 41}) scale(${.55 + i * .07})`);
    });
    motes.forEach(({ node, x, y, phase }) => {
      node.setAttribute('cx', String(x + Math.sin(time * .56 + phase) * 19 + wind * 4));
      node.setAttribute('cy', String(y + Math.cos(time * .73 + phase) * 16));
      node.setAttribute('opacity', String(Math.max(0, Math.sin(time * 1.3 + phase)) ** 3 * .6));
    });
  }

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message || 'Forest shader unavailable');
    }
    return shader;
  }

  function resize() {
    if (!ready) return;
    const scale = Math.min(1, scene.clientWidth * Math.min(devicePixelRatio || 1, 2) / 1672);
    canvas.width = Math.max(1, Math.round(1672 * scale));
    canvas.height = Math.max(1, Math.round(941 * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
  }

  function draw() {
    if (!ready || lost) return;
    gl.uniform1f(uniforms.time, time);
    gl.uniform1f(uniforms.wind, wind);
    gl.uniform1fv(uniforms.blinks, values);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (puppet) scene.dispatchEvent(new CustomEvent('forest-frame', { detail: { time, wind, blink: values[0] } }));
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);
    if (!previous) { previous = now; return; }
    if (now - previous < 1000 / 30) return;
    const dt = Math.min((now - previous) / 1000, .075);
    time += dt;
    previous = now;
    const gust = Math.max(0, Math.sin(time * Math.PI * 2 / 13)) ** 2;
    const targetWind = gust * (.8 + Math.sin(time * 2.1) * .2);
    windVelocity += ((targetWind - wind) * 5.4 - windVelocity * 2.1) * dt;
    wind += windVelocity * dt;
    const blinking = [];
    eyes.forEach((eye, index) => {
      if (time >= eye.next) {
        eye.start = time;
        eye.next = time + (index === 0 ? 3.8 : 6) + random() * 5;
      }
      const elapsed = eye.start < 0 ? 1 : time - eye.start;
      values[index] = elapsed < .045 ? elapsed / .045 : elapsed < .125 ? 1 : elapsed < .21 ? 1 - (elapsed - .125) / .085 : 0;
      if (values[index] > .5) blinking.push(names[index]);
    });
    const blinkState = blinking.join(' ');
    if (blinkState !== lastBlink) { scene.dataset.blink = lastBlink = blinkState; }
    draw();
    paintWeather();
  }

  function sync() {
    const running = ready && !lost && !scene.classList.contains('still') && !document.hidden;
    if (running && !frame) { previous = 0; frame = requestAnimationFrame(tick); }
    else if (!running) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      values.fill(0);
      eyes.forEach(eye => { eye.start = -1; });
      scene.dataset.blink = lastBlink = '';
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { time = 0; wind = windVelocity = 0; }
      draw();
      paintWeather();
    }
    scene.dataset.motion = running ? 'running' : 'paused';
  }

  function initialize() {
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    textures = [plate, blinkImage, pathImage, danceImage].map((image, index) => {
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.uniform1i(gl.getUniformLocation(program, ['u_open', 'u_closed', 'u_path', 'u_dance'][index]), index);
      return texture;
    });
    uniforms = { time: gl.getUniformLocation(program, 'u_time'), wind: gl.getUniformLocation(program, 'u_wind'), blinks: gl.getUniformLocation(program, 'u_blinks[0]') };
    gl.uniform1f(gl.getUniformLocation(program, 'u_puppet'), puppet ? 1 : 0);
    ready = true;
    resize();
    scene.classList.add('is-rendered');
    sync();
  }

  function fallback(error) {
    ready = false;
    cancelAnimationFrame(frame);
    frame = 0;
    scene.classList.remove('is-rendered');
    if (!lost) {
      textures.forEach(texture => gl.deleteTexture(texture));
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
    }
    console.warn('Forest motion unavailable; using the still composition.', error);
  }

  scene.addEventListener('scene-motion', sync);
  new ResizeObserver(resize).observe(scene);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); lost = true; ready = false;
    cancelAnimationFrame(frame); frame = 0;
    scene.classList.remove('is-rendered');
  });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; try { initialize(); } catch (error) { fallback(error); } });
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; });
  window.addEventListener('pageshow', sync);
  Promise.all([plate.decode(), blinkImage.decode(), pathImage.decode(), danceImage.decode()]).then(initialize).catch(fallback);
})();
