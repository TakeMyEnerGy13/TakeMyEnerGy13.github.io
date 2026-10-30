(() => {
  const scene = document.querySelector('.casino-scene');
  if (!scene) return;
  const canvas = scene.querySelector('.casino-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const W = 1672;
  const H = 941;
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const precisePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const assetRoot = new URL('.', document.currentScript.src);
  const art = {};
  const smoke = [];
  const sprites = [];
  let treasure3D = null;
  let roulette = null;
  const fire = document.createElement('canvas');
  fire.width = 1000;
  fire.height = Math.round(1000 * H / W);
  const flame = fire.getContext('2d');
  const grain = document.createElement('canvas');
  grain.width = grain.height = 96;
  const grainCtx = grain.getContext('2d');
  let texture;
  let flameTexture;
  let background;
  let ready = false;
  let loading = false;
  let visible = false;
  let frame = 0;
  let lastFrame = 0;
  let time = 2.6;
  let pointer = 0;
  let targetPointer = 0;

  const random = n => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const particles = Array.from({ length: 30 }, (_, i) => ({
    kind: [0, 1, 2, 0, 3, 4, 1, 5, 0, 6, 2, 7][i % 12],
    depth: i % 3,
    x: i % 2 ? 1040 + random(i + 1) * 410 : 200 + random(i + 1) * 390,
    phase: random(i + 20),
    duration: 8 + random(i + 30) * 7,
    size: 50 + random(i + 40) * 40,
    angle: random(i + 50) * Math.PI * 2,
    drift: 22 + random(i + 60) * 55
  }));

  async function loadArt() {
    if (loading) return;
    loading = true;
    try {
      await Promise.all(['devil', 'devil-laugh', 'roulette', 'smoke', 'treasure'].map(async name => {
        const img = new Image();
        img.decoding = 'async';
        const file = ({ devil: 'devil-claws', 'devil-laugh': 'devil-claws-laugh' })[name] || name;
        img.src = new URL(`casino-${file}.webp`, assetRoot).href;
        await img.decode();
        art[name] = img;
      }));
      prepareLayers();
      const { createRouletteRenderer } = await import(new URL('casino-roulette-motion.js', assetRoot).href);
      roulette = createRouletteRenderer(art.roulette);
      try {
        const { createTreasureRenderer } = await import(new URL('casino-treasure-3d.js', assetRoot).href);
        treasure3D = createTreasureRenderer(document.createElement('canvas'), mode => { scene.dataset.treasureRenderer = mode; });
      } catch (error) {
        scene.dataset.treasureRenderer = 'sprites';
        console.warn('3D treasure could not be loaded; using painted sprites.', error);
      }
      ready = true;
      resize();
      scene.classList.add('is-ready');
      sync();
    } catch (error) {
      // The complete painting stays visible if any transparent layer fails.
      console.warn('Casino artwork could not be loaded.', error);
    }
  }

  function prepareLayers() {
    for (let y = 0; y < 96; y++) {
      for (let x = 0; x < 96; x++) {
        grainCtx.fillStyle = `rgba(10,4,19,${random(x + y * 96) * .18})`;
        grainCtx.fillRect(x, y, 1, 1);
      }
    }
    texture = ctx.createPattern(grain, 'repeat');
    flameTexture = flame.createPattern(grain, 'repeat');

    // The two banks have overlapping feathered edges, not a moving center seam.
    for (let side = 0; side < 2; side++) {
      const bank = document.createElement('canvas');
      bank.width = W;
      bank.height = H;
      const brush = bank.getContext('2d');
      brush.drawImage(art.smoke, 0, 0, W, H);
      brush.globalCompositeOperation = 'destination-in';
      const fade = brush.createLinearGradient(680, 0, 990, 0);
      fade.addColorStop(0, side ? 'transparent' : '#000');
      fade.addColorStop(1, side ? '#000' : 'transparent');
      brush.fillStyle = fade;
      brush.fillRect(0, 0, W, H);
      smoke.push(bank);
    }

    // Trim each atlas cell once so coins and notes have consistent visual sizes.
    const cellW = art.treasure.width / 4;
    const cellH = art.treasure.height / 2;
    for (let i = 0; i < 8; i++) {
      const cell = document.createElement('canvas');
      cell.width = Math.ceil(cellW);
      cell.height = Math.ceil(cellH);
      const brush = cell.getContext('2d', { willReadFrequently: true });
      brush.drawImage(art.treasure, (i % 4) * cellW, Math.floor(i / 4) * cellH, cellW, cellH, 0, 0, cellW, cellH);
      const pixels = brush.getImageData(0, 0, cell.width, cell.height).data;
      let left = cell.width, top = cell.height, right = 0, bottom = 0;
      for (let y = 0; y < cell.height; y++) {
        for (let x = 0; x < cell.width; x++) {
          if (pixels[(y * cell.width + x) * 4 + 3] < 16) continue;
          left = Math.min(left, x); top = Math.min(top, y);
          right = Math.max(right, x); bottom = Math.max(bottom, y);
        }
      }
      sprites.push({ image: cell, x: left, y: top, w: right - left + 1, h: bottom - top + 1 });
    }
  }

  function glow(x, y, rx, ry, color, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(rx, ry);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    ctx.globalAlpha = opacity;
    ctx.fillStyle = gradient;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }

  function flamePath(x, base, width, height, phase) {
    const tipX = x + Math.sin(time * 2.1 + phase) * width * .55 + pointer * 7;
    const tipY = base - height * (.91 + Math.sin(time * 2.7 + phase) * .09);
    const bend = Math.sin(time * 2.8 + phase * 1.3) * width * .2;
    flame.beginPath();
    flame.moveTo(x - width * .62, base);
    flame.bezierCurveTo(x - width, base - height * .2, x - width * .22 + bend, base - height * .37, x - width * .35, base - height * .57);
    flame.bezierCurveTo(x - width * .45, base - height * .74, tipX + width * .2, tipY + height * .18, tipX, tipY);
    flame.bezierCurveTo(tipX + width * .82, tipY + height * .15, x + width * .1 + bend, base - height * .32, x + width * .6, base - height * .24);
    flame.bezierCurveTo(x + width, base - height * .04, x + width * .58, base + 12, x - width * .62, base);
    flame.closePath();
  }

  function drawFire() {
    flame.setTransform(fire.width / W, 0, 0, fire.height / H, 0, 0);
    flame.clearRect(0, 0, W, H);
    for (let layer = 0; layer < 3; layer++) {
      const fill = flame.createLinearGradient(0, 160, 0, 820);
      fill.addColorStop(0, ['#f47a70', '#ffa184', '#ffd5a1'][layer]);
      fill.addColorStop(.6, ['#e8666a', '#f98f77', '#ffb68a'][layer]);
      fill.addColorStop(1, 'rgba(111,36,57,0)');
      flame.fillStyle = fill;
      for (let i = 0; i < 16; i++) {
        const phase = i * 2.17 + layer * .8;
        const x = 210 + i * 84 + layer * 17;
        const height = (400 + random(i + 72) * 240) * (1 - layer * .19);
        flamePath(x, 760 - layer * 7, 98 - layer * 13, height, phase);
        flame.fill();
      }
    }
    flame.globalCompositeOperation = 'source-atop';
    flame.fillStyle = flameTexture;
    flame.fillRect(0, 0, W, H);
    flame.globalCompositeOperation = 'source-over';
    ctx.drawImage(fire, pointer * 3, 0, W, H);
  }

  function drawTreasure(depth) {
    const models = [];
    for (const p of particles) {
      if (p.depth !== depth) continue;
      const progress = (time / p.duration + p.phase) % 1;
      const x = p.x + Math.sin(progress * Math.PI * 3 + p.angle) * p.drift + pointer * (depth * 6 + 3);
      const y = -100 + progress * 1100;
      const scale = [.62, .82, 1.12][depth];
      const size = p.size * scale;
      const opacity = Math.min(1, progress * 12, (1 - progress) * 9) * [.6, .9, 1][depth];
      const item = { ...p, x, y, size, opacity };
      if (p.kind < 2 || p.kind === 4 || p.kind === 5 || p.kind === 7) models.push(item);
      else drawTreasureSprite(item);
    }
    if (!treasure3D?.draw(ctx, models, W, H, canvas.width, time)) models.forEach(drawTreasureSprite);
  }

  function drawTreasureSprite(item) {
    const sprite = sprites[item.kind];
    const isNote = item.kind === 2 || item.kind === 3;
    const spin = Math.sin(time * (isNote ? 1.3 : 2) + item.angle);
    ctx.save();
    ctx.globalAlpha = item.opacity;
    ctx.translate(item.x, item.y);
    ctx.rotate(item.angle + (isNote ? spin * .55 : time * .6));
    ctx.scale(isNote ? .78 + spin * .2 : .3 + Math.abs(spin) * .7, 1);
    ctx.drawImage(sprite.image, sprite.x, sprite.y, sprite.w, sprite.h, -item.size / 2, -item.size * sprite.h / sprite.w / 2, item.size, item.size * sprite.h / sprite.w);
    ctx.restore();
  }

  function drawDevil() {
    const cycle = time % 7.8;
    const laughing = cycle > 1 && cycle < 3.1;
    const beat = laughing ? Math.sin((cycle - 1) * Math.PI * 3.2) : 0;
    const envelope = laughing ? Math.sin((cycle - 1) / 2.1 * Math.PI) : 0;
    const bob = beat * envelope * 10;
    const closedEyes = laughing && beat > -.2;
    ctx.save();
    ctx.translate(836 + pointer * 7, 620 + bob + Math.sin(time * .9) * 2.5);
    ctx.rotate(Math.sin(time * .65) * .008 + beat * envelope * .012);
    ctx.scale(1 + envelope * .005, 1 - envelope * .009);
    ctx.drawImage(closedEyes ? art['devil-laugh'] : art.devil, -620, -616, 1240, 1240 * H / W);
    ctx.restore();
  }

  function drawSmoke() {
    ctx.save();
    ctx.globalAlpha = .94;
    ctx.drawImage(smoke[0], -18 + Math.sin(time * .33) * 14 + pointer * 12, Math.sin(time * .48) * 7, W + 25, H + 15);
    ctx.drawImage(smoke[1], 8 + Math.sin(time * .29 + 2) * 18 + pointer * 15, Math.sin(time * .41 + 1) * 9, W, H + 15);
    ctx.restore();
  }

  function drawEmbers() {
    for (let i = 0; i < 32; i++) {
      const progress = (time / (5 + random(i + 4) * 3) + random(i + 7)) % 1;
      const x = 260 + random(i + 90) * 1150 + Math.sin(time + i) * 11;
      const y = 780 - progress * 620;
      ctx.fillStyle = `rgba(255,183,117,${Math.sin(progress * Math.PI) * .6})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 1 + random(i) * 1.5, 2 + random(i + 2) * 2, -.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw() {
    if (!ready) return;
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, W, H);
    glow(830, 530, 690, 480, '#9f3e61', .24 + Math.sin(time * 1.8) * .025);
    ctx.save();
    ctx.globalAlpha = .25;
    ctx.drawImage(art.smoke, 72 + Math.sin(time * .17) * 14 - pointer * 4, -66, W - 140, H - 20);
    ctx.restore();
    drawFire();
    drawEmbers();
    drawTreasure(0);
    drawDevil();
    drawTreasure(1);
    glow(836, 865, 630, 88, '#000', .85);
    ctx.save();
    ctx.translate(167 + pointer * 10, 180);
    ctx.scale(1338 / W, 1338 / W);
    ctx.drawImage(art.roulette, 0, 0, W, H);
    roulette.draw(ctx, time);
    ctx.restore();
    glow(840 + pointer * 10, 854, 490, 70, '#e87069', .08 + Math.sin(time * 2.5) * .018);
    drawSmoke();
    drawTreasure(2);
    ctx.fillStyle = texture;
    ctx.globalAlpha = .45;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  function resize() {
    const pixels = Math.min(1800, Math.round(scene.getBoundingClientRect().width * Math.min(devicePixelRatio || 1, 1.3)));
    canvas.width = Math.max(1, pixels);
    canvas.height = Math.max(1, Math.round(pixels * H / W));
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    background = ctx.createRadialGradient(836, 610, 80, 836, 420, 900);
    background.addColorStop(0, '#241824');
    background.addColorStop(.65, '#13101b');
    background.addColorStop(1, '#19151d');
    draw();
  }

  function canAnimate() {
    return ready && visible && !document.hidden && !reducedMotion.matches
      && !root.classList.contains('motion-paused') && !root.classList.contains('intro-active')
      && !root.classList.contains('intro-pending') && !document.body.classList.contains('dialog-open');
  }

  function tick(stamp) {
    if (!canAnimate()) { frame = 0; lastFrame = 0; return; }
    frame = requestAnimationFrame(tick);
    if (lastFrame && stamp - lastFrame < 1000 / 30) return;
    const delta = lastFrame ? Math.min(.08, (stamp - lastFrame) / 1000) : 0;
    lastFrame = stamp;
    time += delta;
    pointer += (targetPointer - pointer) * .07;
    draw();
  }

  function sync() {
    if (canAnimate()) {
      if (!frame) { lastFrame = 0; frame = requestAnimationFrame(tick); }
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
    }
  }

  const visibility = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  });
  visibility.observe(scene);
  const preload = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    preload.disconnect();
    loadArt();
  }, { rootMargin: '700px 0px' });
  preload.observe(scene);
  new ResizeObserver(resize).observe(scene);
  const motionObserver = new MutationObserver(sync);
  motionObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
  motionObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  scene.addEventListener('pointermove', event => {
    if (!precisePointer.matches || !canAnimate()) return;
    const rect = scene.getBoundingClientRect();
    targetPointer = (event.clientX - rect.left) / rect.width * 2 - 1;
  });
  scene.addEventListener('pointerleave', () => { targetPointer = 0; });
})();
