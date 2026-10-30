import { escapePose, handReach } from './work-escape-motion.js';
import { createRescueGame, hitRescueHand, finishRescue, rescueHandMotion, rescuedPose } from './work-rescue-game.js';

(() => {
  const layer = document.querySelector('.work-hands');
  if (!layer) return;
  const stage = layer.closest('.work-escape');
  const girl = stage.querySelector('.work-girl');
  const shadow = stage.querySelector('.work-girl-shadow');
  const thanks = stage.querySelector('.work-thanks');
  const status = stage.querySelector('.work-rescue-status');
  const replay = stage.querySelector('.work-replay');
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px)');
  const assetBase = import.meta.url;
  const gratefulArt = new Image();
  gratefulArt.src = new URL('work-girl-thanks.webp', assetBase).href;
  const ns = 'http://www.w3.org/2000/svg';
  const create = (tag, attributes = {}) => {
    const node = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };

  // Three painted reaching poses, registered at the cuff opening.
  const poses = [
    { asset: 'work-grasp-palm.webp', size: [1254, 1254], crop: [35, 24, 620, 567], pivot: [65, 413], scale: .3, orientation: 0,
      cuff: 'M83 331 C60 349 48 387 49 421 C49 456 64 485 86 495 C74 458 72 374 83 331Z' },
    { asset: 'work-hand-back-1.webp', size: [1312, 1199], crop: [0, 0, 1312, 1199], pivot: [210, 1015], scale: .13, orientation: 35,
      cuff: 'M96 916 C116 875 177 887 237 940 C291 989 332 1065 330 1113 C328 1150 301 1152 271 1127 C222 1088 185 1032 139 1005 C110 988 83 950 96 916Z' },
    { asset: 'work-hand-back-2.webp', size: [1536, 1024], crop: [0, 0, 1536, 1024], pivot: [165, 555], scale: .13, orientation: 0,
      cuff: 'M177 386 C214 423 215 528 194 608 C175 681 153 721 94 740 C56 751 49 717 61 660 C83 578 87 478 126 415 C141 390 161 378 177 386Z' }
  ];
  const cast = [
    { side: 'left', level: 'high', pose: 0, x: 414, angle: 18, bend: 24, delay: 0 },
    { side: 'right', level: 'high', pose: 1, x: 426, angle: -19, bend: 32, delay: .2 },
    { side: 'left', level: 'middle', pose: 2, x: 430, angle: -5, bend: -16, delay: .6 },
    { side: 'right', level: 'middle', pose: 0, x: 402, angle: -9, bend: 10, delay: .7 },
    { side: 'right', level: 'low', pose: 2, x: 422, angle: -19, bend: -12, delay: 1 }
  ];

  let game = createRescueGame(cast.map(({ side, level }) => `${side}-${level}`));
  const hands = cast.map(({ side, level, pose, x, angle, bend, delay }, index) => {
    const id = `${side}-${level}`;
    const name = `${side === 'left' ? 'Левая' : 'Правая'} ${level === 'high' ? 'верхняя' : level === 'low' ? 'нижняя' : 'средняя'} рука`;
    const svg = create('svg', {
      class: `work-hand work-hand-${side} work-hand-${level}`,
      viewBox: '0 0 600 320', focusable: 'false',
      'data-pose': pose + 1, 'data-hand': id
    });
    const tangent = angle * Math.PI / 180;
    const d = `M-160 208 C40 ${224 + bend} ${x - Math.cos(tangent) * 110} ${150 - Math.sin(tangent) * 110} ${x + Math.cos(tangent) * 26} ${150 + Math.sin(tangent) * 26}`;
    const paths = ['outline', 'fill', 'seam'].map(part => {
      const path = create('path', { class: `work-arm-${part}`, d });
      if (part === 'seam') path.setAttribute('transform', 'translate(0 -13)');
      svg.append(path);
      return path;
    });

    const { asset, size, crop: [left, top, width, height], pivot: [wristX, wristY], scale, orientation, cuff } = poses[pose];
    const maskId = `work-cuff-${index}`;
    const defs = create('defs');
    const mask = create('mask', {
      id: maskId, maskUnits: 'userSpaceOnUse', maskContentUnits: 'userSpaceOnUse',
      x: -600, y: -600, width: 1200, height: 1200, 'mask-type': 'luminance'
    });
    mask.append(create('rect', { x: -600, y: -600, width: 1200, height: 1200, fill: 'white' }));
    // Reveal the forearm inside the painted cuff, retaining its near rim above it.
    mask.append(create('path', { d: cuff, fill: 'black', transform: `rotate(${orientation}) scale(${scale}) translate(${-wristX} ${-wristY})` }));
    mask.append(create('rect', { x: -200, y: -18, width: 200, height: 36, fill: 'black' }));
    defs.append(mask);
    svg.append(defs);
    const glove = create('g', { class: 'work-glove', transform: `translate(${x} 150) rotate(${angle})` });
    const cuffOverlap = create('g', { mask: `url(#${maskId})` });
    const artwork = create('g', { transform: `rotate(${orientation})` });
    const crop = create('svg', {
      x: (left - wristX) * scale, y: (top - wristY) * scale,
      width: width * scale, height: height * scale,
      viewBox: `${left} ${top} ${width} ${height}`, overflow: 'hidden'
    });
    crop.append(create('image', { href: new URL(asset, assetBase).href, width: size[0], height: size[1] }));
    artwork.append(crop);
    cuffOverlap.append(artwork);
    glove.append(cuffOverlap);
    const burst = create('g', { class: 'work-hit-burst', opacity: '0', 'aria-hidden': 'true' });
    burst.append(create('path', {
      d: 'M0-51 12-23 40-37 29-9 54 6 25 16 34 44 7 30-13 53-18 24-48 31-32 5-53-17-23-18-22-48-6-29Z',
      fill: '#d2694d', stroke: '#f2e4c9', 'stroke-width': '3', 'stroke-linejoin': 'round'
    }));
    burst.append(create('path', { d: 'M-14-7 0-18 13-4 6 12-8 16-18 5Z', fill: '#f2e4c9' }));
    glove.append(burst);
    const target = create('rect', {
      class: 'work-hand-target', x: -3, y: -108, width: 180, height: 185, rx: 50,
      fill: 'transparent', role: 'button', focusable: 'true', tabindex: '0',
      'aria-label': `${name}. Ударить.`
    });
    glove.append(target);
    svg.append(glove);
    layer.append(svg);
    svg.addEventListener('click', () => strike(id));
    target.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if (!event.repeat) strike(id);
    });
    return { id, name, svg, target, paths, glove, burst, side, x, angle, bend, delay };
  });

  let time = 1.8;
  let previous = 0;
  let frame = 0;
  let visible = false;
  let victoryFrom = { x: 0, y: 0, angle: 0 };

  const still = () => reducedMotion.matches || root.classList.contains('motion-paused');
  const activeIds = () => game.hands.filter(hand => !compact.matches || hand.id !== 'right-low').map(hand => hand.id);

  function strike(id) {
    if (!activeIds().includes(id) || document.body.classList.contains('dialog-open')) return;
    const next = hitRescueHand(game, id, time);
    if (next === game) return;
    game = next;
    const remaining = activeIds().filter(key => game.hands.find(hand => hand.id === key).hp > 0).length;
    const target = game.hands.find(hand => hand.id === id);
    status.textContent = target.hp ? 'Попадание.' : `Рука прогнана. Осталось рук: ${remaining}.`;
    if (!target.hp && document.activeElement === hands.find(hand => hand.id === id).target) {
      const nextHand = hands.find(hand => activeIds().includes(hand.id) && game.hands.find(item => item.id === hand.id).hp > 0);
      (nextHand?.target || stage).focus({ preventScroll: true });
    }
    paint();
    sync();
  }

  replay.addEventListener('click', () => {
    game = createRescueGame(cast.map(({ side, level }) => `${side}-${level}`));
    time = 1.8;
    thanks.hidden = replay.hidden = true;
    status.textContent = 'Новая игра. Прогоните руки, чтобы спасти героиню.';
    paint();
    hands[0].target.focus({ preventScroll: true });
    sync();
  });

  function paint() {
    const reduced = still();
    const next = finishRescue(game, activeIds(), time, reduced);
    if (next !== game) {
      victoryFrom = escapePose(time, reduced);
      game = next;
      thanks.hidden = replay.hidden = false;
      status.textContent = 'You are my hero! Вы спасли героиню.';
    }
    stage.dataset.rescue = game.phase;
    let pose = escapePose(time, reduced);
    if (game.phase === 'won') {
      const elapsed = time - game.victoryAt;
      const settle = reduced ? 0 : Math.max(0, 1 - elapsed / .4);
      const grateful = rescuedPose(elapsed, reduced);
      pose = { ...grateful, x: victoryFrom.x * settle, y: grateful.y + victoryFrom.y * settle,
        angle: grateful.angle + victoryFrom.angle * settle, shadowScale: 1 };
    }
    girl.dataset.pose = pose.pose;
    girl.style.transform = `translateX(calc(-50% + ${pose.x}px)) translateY(${pose.y}px) rotate(${pose.angle}deg)`;
    shadow.style.transform = `translateX(calc(-50% + ${pose.x * .6}px)) scaleX(${pose.shadowScale})`;
    hands.forEach(({ id, name, svg, target, paths, glove, burst, side, x, angle, bend, delay }) => {
      const hand = game.hands.find(item => item.id === id);
      const reaction = rescueHandMotion(hand, time, reduced);
      const absent = hand.hp === 0 || game.phase === 'won';
      if (svg.dataset.defeated !== String(absent)) {
        svg.dataset.defeated = String(absent);
        target.setAttribute('aria-disabled', String(absent));
        target.setAttribute('tabindex', absent ? '-1' : '0');
        target.setAttribute('aria-label', `${name}. ${absent ? 'Прогнана.' : 'Ударить.'}`);
      }
      svg.style.opacity = game.phase === 'won' ? '0' : reaction.opacity;
      svg.dataset.exited = String(game.phase === 'won' || reaction.opacity === 0);
      svg.style.transform = `translate(${ -reaction.exitX }px,${reaction.exitY}px) rotate(${reaction.exitAngle}deg)`;
      const phase = (time - delay) / 12 * Math.PI * 2;
      const reach = handReach(time, side, delay, reduced);
      const drift = reduced ? 0 : Math.sin(phase) * 5;
      const wristX = x - 66 + reach * 76 - reaction.recoil;
      const wristY = 150 + drift;
      const rotation = angle + (reach - .5) * 5 + reaction.twist;
      const tangent = rotation * Math.PI / 180;
      const d = `M-160 208 C40 ${224 + bend + drift} ${wristX - Math.cos(tangent) * 110} ${wristY - Math.sin(tangent) * 110} ${wristX + Math.cos(tangent) * 26} ${wristY + Math.sin(tangent) * 26}`;
      paths.forEach(path => path.setAttribute('d', d));
      // Move the complete painted glove; its pose and finger silhouettes never change.
      glove.setAttribute('transform', `translate(${wristX} ${wristY}) rotate(${rotation})`);
      burst.setAttribute('opacity', reaction.burst);
      burst.setAttribute('transform', `translate(70 -20) scale(${1.2 - reaction.burst * .35})`);
    });
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);
    if (!previous) { previous = now; return; }
    if (now - previous < 1000 / 30) return;
    time += Math.min((now - previous) / 1000, .075);
    previous = now;
    paint();
  }

  function sync() {
    const running = visible && !document.hidden && !reducedMotion.matches
      && !root.classList.contains('motion-paused') && !root.classList.contains('intro-active')
      && !root.classList.contains('intro-pending') && !document.body.classList.contains('dialog-open');
    layer.dataset.motion = running ? 'running' : 'paused';
    if (running && !frame) { previous = 0; frame = requestAnimationFrame(tick); }
    else if (!running) {
      cancelAnimationFrame(frame);
      frame = previous = 0;
      if (still()) paint();
    }
  }

  const observer = new MutationObserver(sync);
  observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(stage);
  reducedMotion.addEventListener('change', sync);
  compact.addEventListener('change', () => { paint(); sync(); });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = previous = 0; });
  window.addEventListener('pageshow', sync);
  paint();
  sync();
})();
