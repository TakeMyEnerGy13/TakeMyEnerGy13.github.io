(() => {
  const stage = document.querySelector('.stage-world');
  const canvas = stage.querySelector('.stage-atmosphere');
  const context = canvas.getContext('2d');
  if (!context) return;
  const backdrop = stage.querySelector('.stage-backdrop');
  const hero = document.querySelector('.prologue');
  const precisePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const width = 1000;
  const height = 563;
  const plate = document.createElement('canvas');
  plate.width = width;
  plate.height = height;
  const plateContext = plate.getContext('2d');
  const fire = document.createElement('canvas');
  fire.width = width;
  fire.height = height;
  const paint = fire.getContext('2d');
  const grain = document.createElement('canvas');
  grain.width = grain.height = 64;
  const grainContext = grain.getContext('2d');
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const value = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
      grainContext.fillStyle = `rgba(43,16,29,${Math.abs(value) * .18})`;
      grainContext.fillRect(x, y, 1, 1);
    }
  }
  const texture = paint.createPattern(grain, 'repeat');
  const portals = [
    { x: 465, base: 378, width: 104, height: 160, seed: 1.4, floor: 447 },
    { x: 671, base: 402, width: 132, height: 226, seed: 4.1, floor: 468 },
    { x: 855, base: 399, width: 110, height: 167, seed: 7.2, floor: 451 }
  ];
  let plateReady = false;
  let frame = 0;
  let lastFrame = 0;
  let time = 3;
  let wind = 0;
  let targetWind = 0;

  function portalPath(ctx, portal) {
    const { x, base, width: w, height: h } = portal;
    ctx.beginPath();
    ctx.moveTo(x - w * .5, base);
    ctx.lineTo(x - w * .5, base - h * .45);
    ctx.bezierCurveTo(x - w * .5, base - h * .77, x - w * .15, base - h * .91, x, base - h);
    ctx.bezierCurveTo(x + w * .17, base - h * .9, x + w * .5, base - h * .77, x + w * .5, base - h * .45);
    ctx.lineTo(x + w * .5, base);
    ctx.closePath();
  }

  function flamePath(ctx, x, y, w, h, phase) {
    const bend = Math.sin(time * 2.7 + phase) * w * .55 + wind * w * .8;
    const tipX = x + bend;
    const tipY = y - h * (.86 + Math.sin(time * 3.3 + phase * 1.7) * .13);
    const shoulder = Math.sin(time * 4.2 + phase) * w * .22;
    ctx.beginPath();
    ctx.moveTo(x - w * .62, y);
    ctx.bezierCurveTo(x - w * .95, y - h * .2, x + shoulder - w * .28, y - h * .45, x + shoulder - w * .35, y - h * .56);
    ctx.bezierCurveTo(x - w * .4, y - h * .72, tipX + w * .22, tipY + h * .21, tipX, tipY);
    ctx.bezierCurveTo(tipX + w * .9, tipY + h * .21, x + w * .15 + shoulder, y - h * .34, x + w * .57, y - h * .23);
    ctx.bezierCurveTo(x + w * 1.05, y - h * .06, x + w * .57, y + 2, x - w * .62, y);
    ctx.closePath();
  }

  function drawHeat(portal) {
    if (!plateReady) return;
    context.save();
    portalPath(context, portal);
    context.clip();
    // Displace small horizontal strips only inside the distant arch openings.
    const top = Math.floor(portal.base - portal.height);
    for (let y = top; y < portal.base; y += 5) {
      const distance = (portal.base - y) / portal.height;
      const edgeFade = distance * (1 - distance);
      const offset = (Math.sin(y * .045 - time * 2.1 + portal.seed) * 6 + wind * 3) * edgeFade;
      context.drawImage(plate, 0, y, width, 5, offset, y, width, 5);
    }
    context.restore();
  }

  function drawFire(portal) {
    paint.save();
    portalPath(paint, portal);
    paint.clip();
    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < 7; i++) {
        const phase = portal.seed + i * 1.83 + layer * .7;
        const x = portal.x + (i - 3) * portal.width / 7;
        const size = portal.width * (.14 + .025 * Math.sin(phase));
        const flameHeight = portal.height * (.5 + .26 * (1 + Math.sin(phase * 1.3)) / 2) * (1 - layer * .2);
        const y = portal.base - 4 - layer;
        const gradient = paint.createLinearGradient(0, y - flameHeight, 0, y);
        gradient.addColorStop(0, ['#bd644a', '#e0a065', '#f0d29a'][layer]);
        gradient.addColorStop(.55, ['#a74b37', '#d78142', '#e3ac5d'][layer]);
        gradient.addColorStop(.94, 'rgba(154,62,40,0)');
        gradient.addColorStop(1, 'rgba(154,62,40,0)');
        paint.globalAlpha = [.72, .75, .8][layer];
        paint.fillStyle = gradient;
        flamePath(paint, x + layer * 1.5, y, size * (1 - layer * .18), flameHeight, phase);
        paint.fill();
      }
    }
    paint.restore();
  }

  function drawFloorLight(portal) {
    context.save();
    context.translate(portal.x + 12, portal.floor);
    context.scale(1, .25);
    const radius = portal.width * 1.1;
    const glow = context.createRadialGradient(0, 0, 0, 0, 0, radius);
    const intensity = .1 + .035 * Math.sin(time * 2.4 + portal.seed) + .018 * Math.sin(time * 4.7 + portal.seed);
    glow.addColorStop(0, `rgba(238,151,70,${intensity})`);
    glow.addColorStop(.45, `rgba(217,98,46,${intensity * .5})`);
    glow.addColorStop(1, 'rgba(204,77,43,0)');
    context.globalCompositeOperation = 'screen';
    context.fillStyle = glow;
    context.fillRect(-radius, -radius, radius * 2, radius * 2);
    context.restore();
  }

  function drawSparks(portal) {
    for (let i = 0; i < 9; i++) {
      const duration = 3.1 + (i % 4) * .53;
      const phase = ((time + i * .62 + portal.seed) % duration) / duration;
      const x = portal.x + Math.sin(i * 3.7) * portal.width * .34 + Math.sin(time + i) * 4 + phase * wind * 24;
      const y = portal.base - phase * portal.height * 1.1;
      context.fillStyle = `rgba(239,186,109,${Math.sin(phase * Math.PI) * .55})`;
      context.beginPath();
      context.ellipse(x, y, .45 + (i % 3) * .2, 1.3 * (1 - phase) + .3, .3, 0, Math.PI * 2);
      context.fill();
    }
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    paint.clearRect(0, 0, width, height);
    portals.forEach(portal => {
      drawHeat(portal);
      drawFire(portal);
      drawFloorLight(portal);
    });
    paint.save();
    paint.globalCompositeOperation = 'source-atop';
    paint.fillStyle = texture;
    paint.fillRect(0, 0, width, height);
    paint.restore();
    context.drawImage(fire, 0, 0);
    portals.forEach(drawSparks);
  }

  function resize() {
    const pixels = Math.min(1400, Math.round(stage.getBoundingClientRect().width * Math.min(devicePixelRatio || 1, 1.25)));
    canvas.width = pixels;
    canvas.height = Math.round(pixels * height / width);
    context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    draw();
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);
    if (!lastFrame) lastFrame = now;
    const elapsed = now - lastFrame;
    if (elapsed < 1000 / 30) return;
    time += Math.min(elapsed, 80) / 1000;
    lastFrame = now;
    wind += (targetWind - wind) * .06;
    draw();
  }

  function syncPlayback() {
    const running = stage.classList.contains('is-running') && !document.hidden;
    if (running && !frame) {
      lastFrame = 0;
      frame = requestAnimationFrame(tick);
    } else if (!running) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
    }
  }

  function preparePlate() {
    if (!backdrop.naturalWidth) return;
    plateContext.drawImage(backdrop, 0, 0, width, height);
    plateReady = true;
    draw();
  }
  if (backdrop.complete) preparePlate();
  else backdrop.addEventListener('load', preparePlate, { once: true });
  hero.addEventListener('pointermove', event => {
    if (!precisePointer.matches || !stage.classList.contains('is-running')) return;
    const bounds = hero.getBoundingClientRect();
    targetWind = ((event.clientX - bounds.left) / bounds.width - .5) * 1.2;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { targetWind = 0; });
  new ResizeObserver(resize).observe(stage);
  new MutationObserver(syncPlayback).observe(stage, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', syncPlayback);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; });
  window.addEventListener('pageshow', syncPlayback);
  resize();
  syncPlayback();
})();
