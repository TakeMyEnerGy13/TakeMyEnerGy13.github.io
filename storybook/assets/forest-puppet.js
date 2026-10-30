import { GIRL, HAND, VIEW, puppetPose, transformPoint, tearState, blinkAmount } from './forest-puppet-motion.js';

const scene = document.querySelector('[data-forest-puppet]');
if (scene) {
  const canvas = document.createElement('canvas');
  canvas.className = 'forest-puppet-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  const images = {};
  let ready = false;
  let state = { time: 0, wind: 0, blink: 0 };
  let released = null;
  let frame = 0;
  let previous = null;
  let visible = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  scene.append(canvas);

  function apply(transform) {
    ctx.translate(transform.pivot.x + transform.x, transform.pivot.y + transform.y);
    ctx.rotate(transform.angle);
    ctx.translate(-transform.pivot.x, -transform.pivot.y);
  }

  function drawRibbon({ start, end, width }, index) {
    const bend = Math.sin(state.time * 1.4 + index) * 3 + state.wind * 4;
    const path = new Path2D();
    path.moveTo(start.x, start.y - 6);
    path.bezierCurveTo(start.x + bend, start.y + 32, end.x + bend, end.y - 28, end.x, end.y + 5);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#32131d';
    ctx.lineWidth = width + 3;
    ctx.stroke(path);
    ctx.strokeStyle = '#cf302f';
    ctx.lineWidth = width;
    ctx.stroke(path);
    ctx.strokeStyle = '#ec6555';
    ctx.lineWidth = 1.5;
    ctx.stroke(path);
  }

  function drawGirl(pose) {
    ctx.save();
    apply(pose.girl);
    ctx.beginPath();
    ctx.rect(850, GIRL.cut, 750, 610);
    ctx.clip();
    ctx.drawImage(images.girl, GIRL.x, GIRL.y, GIRL.width, GIRL.height);
    if (state.blink > .45) {
      // Only the two eyes use the alternate cel, keeping the body perfectly registered.
      ctx.save();
      ctx.translate(GIRL.x, GIRL.y);
      ctx.scale(5 / 9, 5 / 9);
      ctx.beginPath();
      ctx.ellipse(477, 557, 39, 43, .2, 0, Math.PI * 2);
      ctx.ellipse(550, 588, 41, 38, .3, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(images.blink, 0, 0, 900, 1350);
      ctx.restore();
    }
    ctx.restore();
  }

  function eyePoint(eye, slide = 0) {
    const point = eye ? { x: 463, y: 584 } : { x: 548, y: 616 };
    return { x: GIRL.x + (point.x + slide * 2) * 5 / 9, y: GIRL.y + (point.y + slide * 19) * 5 / 9 };
  }

  function drawTear(pose) {
    const tear = tearState(state.time);
    if (!tear) { released = null; scene.dataset.tear = 'rest'; return; }
    let position;
    let alpha = Math.min(1, tear.age / .35);
    if (tear.falling) {
      if (released?.cycle !== tear.cycle) {
        released = { cycle: tear.cycle, point: transformPoint(eyePoint(tear.eye, 1), puppetPose(tear.releasedAt, state.wind).girl) };
      }
      const fall = tear.age - 1.05;
      position = { x: released.point.x - fall * 7, y: released.point.y + fall * 35 + fall * fall * 115 };
      alpha *= Math.min(1, (2.8 - tear.age) / .45);
    } else position = transformPoint(eyePoint(tear.eye, tear.age / 1.05), pose.girl);
    ctx.save();
    ctx.translate(position.x, position.y);
    const scale = .55 + Math.min(1, tear.age / .75) * .45;
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha * .9;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.bezierCurveTo(-1, -3, -4, 0, -3, 3);
    ctx.bezierCurveTo(-1.5, 6, 3, 5, 3, 1);
    ctx.bezierCurveTo(3, -2, 1, -4, 0, -7);
    ctx.fillStyle = '#c0dce5';
    ctx.strokeStyle = '#56657d';
    ctx.lineWidth = .7;
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-.8, .8, .65, 1.5, .2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff1d3'; ctx.fill();
    ctx.restore();
    scene.dataset.tear = tear.falling ? 'falling' : 'forming';
  }

  function draw() {
    if (!ready || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(canvas.width / VIEW.width, canvas.height / VIEW.height);
    ctx.translate(-VIEW.x, -VIEW.y);
    const pose = puppetPose(state.time, state.wind);
    pose.ribbons.forEach(drawRibbon);
    drawGirl(pose);
    ctx.save(); apply(pose.hand);
    ctx.drawImage(images.hand, HAND.x, HAND.y, HAND.width, HAND.height);
    ctx.restore();
    // Small wraps cross the claw roots; the string ends are occluded by the hand.
    [pose.ribbons[0], pose.ribbons[2]].forEach(({ start }, i) => {
      ctx.save(); ctx.translate(start.x, start.y - 4); ctx.rotate(i ? -.25 : .2);
      ctx.beginPath(); ctx.ellipse(0, 0, 15, 4, 0, 0, Math.PI);
      ctx.strokeStyle = '#5e1725'; ctx.lineWidth = 6; ctx.stroke();
      ctx.strokeStyle = '#d2423b'; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
    });
    drawTear(pose);
    scene.dataset.puppetAngle = pose.girl.angle.toFixed(4);
    scene.dataset.blink = state.blink > .45 ? 'girl' : '';
  }

  function resize() {
    canvas.width = Math.max(1, Math.round(Math.min(1200, scene.clientWidth * Math.min(devicePixelRatio || 1, 1.5))));
    canvas.height = Math.round(canvas.width * VIEW.height / VIEW.width);
    draw();
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);
    if (previous === null) { previous = now; return; }
    if (now - previous < 1000 / 30) return;
    state.time += Math.min((now - previous) / 1000, .075);
    previous = now;
    state.wind = Math.max(0, Math.sin(state.time * Math.PI * 2 / 13)) ** 2 * .65;
    state.blink = blinkAmount(state.time);
    draw();
  }

  function sync() {
    const sitePaused = root.classList.contains('motion-paused') || root.classList.contains('intro-active') || root.classList.contains('intro-pending') || document.body.classList.contains('dialog-open');
    const running = ready && visible && !document.hidden && !reducedMotion.matches && !sitePaused;
    if (running && !frame) { previous = null; frame = requestAnimationFrame(tick); }
    else if (!running) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = null;
      if (reducedMotion.matches) state = { time: 0, wind: 0, blink: 0 };
      draw();
    }
    scene.dataset.motion = running ? 'running' : 'paused';
  }

  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  const siteState = new MutationObserver(sync);
  siteState.observe(root, { attributes: true, attributeFilter: ['class'] });
  siteState.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(scene);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; previous = null; });
  window.addEventListener('pageshow', sync);
  new ResizeObserver(resize).observe(scene);
  Promise.all(Object.entries({ girl: 'suspended-girl.webp', blink: 'suspended-girl-blink.webp', hand: 'devil-puppeteer-hand.webp' }).map(async ([key, file]) => {
    const image = new Image();
    image.src = new URL(file, import.meta.url).href;
    await image.decode();
    images[key] = image;
  })).then(() => {
    if (!ctx) return;
    ready = true; resize(); scene.classList.add('puppet-ready'); sync();
  }).catch(error => console.warn('Puppet motion unavailable; using the static layers.', error));
}
