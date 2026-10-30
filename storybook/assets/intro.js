(() => {
  const root = document.documentElement;
  const intro = document.querySelector('.intro');
  if (!root.classList.contains('intro-pending')) return;

  const enter = intro.querySelector('.intro-enter');
  const skip = intro.querySelector('.intro-skip');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let opening = false;
  let finished = false;
  let finishTimer;

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(finishTimer);
    root.classList.remove('intro-pending', 'intro-active', 'intro-opening');
    intro.close();
    document.querySelector('#hero-title').focus({ preventScroll: true });
  }

  function open() {
    if (opening || finished) return;
    if (reducedMotion.matches || root.classList.contains('motion-paused')) {
      finish();
      return;
    }
    opening = true;
    enter.setAttribute('aria-disabled', 'true');
    intro.classList.add('is-opening');
    root.classList.add('intro-opening');
    // Keep Escape and the skip control available throughout the reveal.
    finishTimer = setTimeout(finish, 2800);
  }

  enter.addEventListener('click', open);
  skip.addEventListener('click', finish);
  intro.addEventListener('cancel', event => { event.preventDefault(); finish(); });
  intro.addEventListener('close', finish);
  intro.addEventListener('curtain-revealed', finish);
  intro.addEventListener('keydown', event => {
    if (event.target === intro && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      open();
    }
  });
  intro.querySelector('.intro-curtain-right').addEventListener('transitionend', event => {
    if (opening && !intro.classList.contains('has-live-fabric') && event.propertyName === 'transform') finish();
  });
  reducedMotion.addEventListener('change', () => { if (opening && reducedMotion.matches) finish(); });
  new MutationObserver(() => {
    if (opening && root.classList.contains('motion-paused')) finish();
  }).observe(root, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('pagehide', finish, { once: true });

  intro.showModal();
  root.classList.add('intro-active');
  intro.focus({ preventScroll: true });
  Promise.race([
    Promise.allSettled([
      document.fonts.load('48px Yeseva'),
      ...[...intro.querySelectorAll('img')].map(image => image.decode())
    ]),
    new Promise(resolve => setTimeout(resolve, 1200))
  ]).then(() => {
    if (!finished) intro.classList.add('is-presenting');
  });
})();
