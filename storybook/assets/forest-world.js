(() => {
  const world = document.querySelector('.forest-world');
  const stars = world.querySelector('.forest-stars');
  const leftRibbon = world.querySelector('.forest-ribbon-left');
  const rightRibbon = world.querySelector('.forest-ribbon-right');
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const precisePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let seed = 137;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const starNodes = document.createDocumentFragment();
  for (let i = 0; i < 58; i++) {
    const star = document.createElement('i');
    const spark = i % 5 === 0;
    star.className = `forest-star${spark ? ' forest-star-spark' : ''}`;
    star.style.cssText = `--star-x:${random() * 100}%;--star-y:${random() * 90}%;--star-size:${spark ? 5 + random() * 4 : 1 + random() * 1.6}px;--star-opacity:${.25 + random() * .55};--star-period:${3 + random() * 4}s;--star-delay:${-random() * 8}s`;
    starNodes.append(star);
  }
  stars.append(starNodes);

  let visible = false;
  let frame = 0;
  let previous = 0;
  let time = 0;
  let nextGust = 3;
  let gustStart = -20;
  let gustLength = 6;
  let gustStrength = 1;
  let nextBlink = 4.7;
  let blinkEnd = 0;
  let angle = 0;
  let velocity = 0;
  let depth = 0;
  let targetDepth = 0;
  let pointerInside = false;
  let gazeX = 0;
  let gazeY = 0;

  function updateRibbons(drift, degrees) {
    // The two short flexible ties keep both sprite knots attached to the branch.
    const radians = degrees * Math.PI / 180;
    const origin = 110 + 460 * .52;
    [leftRibbon, rightRibbon].forEach((path, index) => {
      const knotX = 110 + 460 * (index ? .688 : .376);
      const dx = knotX - origin;
      const x = origin + dx * Math.cos(radians) - 14 * Math.sin(radians) + drift;
      const y = 230 + dx * Math.sin(radians) + 14 * Math.cos(radians);
      const anchor = index ? { x: 427, y: 210 } : { x: 283, y: 213 };
      path.setAttribute('d', `M${anchor.x} ${anchor.y} C${anchor.x - 9} ${anchor.y + 17} ${x + 7} ${y - 7} ${x} ${y}`);
    });
  }

  function paint(wind, phase) {
    const drift = wind * 4;
    world.style.setProperty('--tree-lean', `${wind * .48}deg`);
    world.style.setProperty('--girl-angle', `${angle}deg`);
    world.style.setProperty('--girl-drift', `${drift / 460 * 100}%`);
    world.style.setProperty('--grass-bend', `${wind * -7 + Math.sin(time * 1.4) * .7}deg`);
    world.style.setProperty('--plant-bend', `${wind * 3}deg`);
    world.style.setProperty('--fog-drift', `${Math.sin(time * .18) * 12 + wind * 8}px`);
    world.style.setProperty('--shadow-drift', `${-angle * 4}px`);
    world.style.setProperty('--leaf-opacity', `${Math.max(0, Math.sin(phase * Math.PI)) * .65}`);
    world.style.setProperty('--leaf-x', `${25 + phase * 60}%`);
    world.style.setProperty('--leaf-y', `${64 - Math.sin(phase * Math.PI) * 12}%`);
    world.style.setProperty('--leaf-turn', `${phase * 420}deg`);
    world.style.setProperty('--cloud-x', `${Math.sin(time * .037) * 55 + wind * 10}px`);
    world.style.setProperty('--moonlight', `${.9 + Math.sin(time * .13) * .07}`);
    world.style.setProperty('--candle-left', `${.8 + Math.sin(time * 2.9) * .06 + Math.sin(time * 7.7) * .025}`);
    world.style.setProperty('--candle-right', `${.76 + Math.sin(time * 2.3 + 1.4) * .065 + Math.sin(time * 6.1) * .02}`);
    world.style.setProperty('--depth-x', `${depth}px`);
    world.style.setProperty('--eye-x', `${-4 + (pointerInside ? gazeX * 6 : Math.sin(time * .28) * 3.5)}px`);
    world.style.setProperty('--eye-y', `${pointerInside ? gazeY * 4 : Math.sin(time * .23) * 1.5}px`);
    updateRibbons(drift, angle);
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);
    if (!previous) { previous = now; return; }
    const elapsed = now - previous;
    if (elapsed < 1000 / 30) return;
    const dt = Math.min(elapsed / 1000, .06);
    previous = now;
    time += dt;
    if (time >= nextGust) {
      gustStart = time;
      gustLength = 5.5 + random() * 2;
      gustStrength = .7 + random() * .45;
      nextGust = time + gustLength + 10 + random() * 8;
    }
    const phase = Math.min(1, Math.max(0, (time - gustStart) / gustLength));
    const envelope = Math.sin(phase * Math.PI) ** 2;
    const wind = envelope * gustStrength * (.78 + .22 * Math.sin(time * 3.1));
    const targetAngle = wind * -3.4 + Math.sin(time * 1.05) * .25;
    velocity += ((targetAngle - angle) * 4.2 - velocity * 1.3) * dt;
    angle += velocity * dt;
    depth += (targetDepth - depth) * Math.min(1, dt * 3);
    paint(wind, phase);
    if (time >= nextBlink) {
      world.classList.add('is-blinking');
      blinkEnd = time + .2;
      nextBlink = time + 5.5 + random() * 4;
    }
    if (blinkEnd && time >= blinkEnd) {
      world.classList.remove('is-blinking');
      blinkEnd = 0;
    }
  }

  function sync() {
    const paused = reducedMotion.matches || root.classList.contains('motion-paused');
    const running = visible && !paused && !document.hidden && !root.classList.contains('intro-active') && !root.classList.contains('intro-pending') && !document.body.classList.contains('dialog-open');
    world.classList.toggle('is-awake', running);
    if (running && !frame) {
      previous = 0;
      frame = requestAnimationFrame(tick);
    } else if (!running) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      world.classList.remove('is-blinking');
      blinkEnd = 0;
      if (paused) {
        angle = velocity = 0;
        depth = targetDepth = 0;
        pointerInside = false;
        paint(0, 0);
        world.style.setProperty('--grass-bend', '0deg');
        world.style.setProperty('--fog-drift', '0px');
      }
    }
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }, { threshold: .04 }).observe(world);
  const observer = new MutationObserver(sync);
  observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  world.closest('.contact').addEventListener('pointermove', event => {
    if (!precisePointer.matches || !world.classList.contains('is-awake')) return;
    const bounds = world.getBoundingClientRect();
    pointerInside = event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    gazeX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    gazeY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    targetDepth = pointerInside ? gazeX * -4 : 0;
  }, { passive: true });
  world.closest('.contact').addEventListener('pointerleave', () => {
    pointerInside = false;
    targetDepth = 0;
  });
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; });
  window.addEventListener('pageshow', sync);
  updateRibbons(0, 0);
  sync();
})();
