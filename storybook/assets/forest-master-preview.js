(() => {
  const scene = document.querySelector('.composition');
  if (!scene) return;
  const stars = scene.querySelector('.stars');
  let seed = 31;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 65; i++) {
    const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    star.setAttribute('cx', String(60 + random() * 1550));
    star.setAttribute('cy', String(20 + random() * 480));
    star.setAttribute('r', String(.45 + random() * .85));
    star.setAttribute('fill', '#ecdabc');
    star.setAttribute('class', 'star');
    star.style.setProperty('--period', `${5 + random() * 5}s`);
    star.style.setProperty('--delay', `${random() * -10}s`);
    fragment.append(star);
  }
  stars.append(fragment);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionToggle = document.querySelector('[data-scene-motion-toggle]');
  const root = document.documentElement;
  let paused = false;
  let visible = false;
  const sync = () => {
    const sitePaused = root.classList.contains('motion-paused') || root.classList.contains('intro-active') || root.classList.contains('intro-pending') || document.body.classList.contains('dialog-open');
    const running = !document.hidden && !reducedMotion.matches && !paused && !sitePaused && visible;
    scene.classList.toggle('still', !running);
    if (motionToggle) {
      motionToggle.disabled = reducedMotion.matches;
      motionToggle.setAttribute('aria-pressed', String(paused));
      motionToggle.setAttribute('aria-label', paused ? 'Включить движение' : 'Остановить движение');
      motionToggle.title = motionToggle.getAttribute('aria-label');
      motionToggle.textContent = paused ? '▷' : 'Ⅱ';
    }
    scene.dispatchEvent(new CustomEvent('scene-motion', { detail: { running, reduced: reducedMotion.matches } }));
  };
  motionToggle?.addEventListener('click', () => { paused = !paused; sync(); });
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  const siteState = new MutationObserver(sync);
  siteState.observe(root, { attributes: true, attributeFilter: ['class'] });
  siteState.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(scene);
  sync();
})();
