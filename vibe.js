// Cursor image trail and word-by-word quote reveal for the pause section.
const FRAMES = ['01', '02', '03', '04', '05', '06', '07', '08'];
const STEP = 130;
const AUTO_DELAY = 1100;

export function createVibeSection(section) {
  const gsap = window.gsap;
  if (!section || !gsap) return null;

  const trail = section.querySelector('.quote-trail');
  const intro = section.querySelector('.quote-intro');
  const statement = section.querySelector('.quote-statement');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(hover: none), (pointer: coarse)');

  const images = FRAMES.map((name) => {
    const img = document.createElement('img');
    img.src = `./assets/bliss/${name}.png`;
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'lazy';
    trail.append(img);
    return img;
  });
  gsap.set(images, { xPercent: -50, yPercent: -50 });

  let index = 0;
  let depth = 0;
  let lastX = 0;
  let lastY = 0;
  let primed = false;
  let visible = false;
  let split;
  let revealAnimation;

  const show = (x, y) => {
    const img = images[index % images.length];
    if (!img.complete || !img.naturalWidth) return;
    index += 1;
    depth = (depth % 40) + 1;
    gsap.killTweensOf(img);
    gsap.set(img, {
      x,
      y,
      zIndex: depth,
      scale: 0.72,
      opacity: 0,
      rotation: gsap.utils.random(-14, 14),
    });
    gsap
      .timeline()
      .to(img, { opacity: 1, scale: 1, duration: 0.26, ease: 'power2.out' })
      .to(img, { opacity: 0, scale: 0.94, y: y + 80, duration: 0.6, ease: 'power1.in' }, '+=0.22');
  };

  const onMove = (event) => {
    const box = section.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    if (!primed) {
      primed = true;
      lastX = x;
      lastY = y;
      return;
    }
    if (Math.hypot(x - lastX, y - lastY) < STEP) return;
    lastX = x;
    lastY = y;
    show(x, y);
  };

  const onLeave = () => {
    primed = false;
  };

  let autoTimer;
  const autoPlay = () => {
    const box = section.getBoundingClientRect();
    const angle = gsap.utils.random(0, Math.PI * 2);
    const radius = gsap.utils.random(0.3, 0.46);
    show(
      box.width / 2 + Math.cos(angle) * box.width * radius,
      box.height / 2 + Math.sin(angle) * box.height * radius * 1.2,
    );
  };

  const startAuto = () => {
    if (autoTimer) return;
    autoTimer = setInterval(autoPlay, AUTO_DELAY);
  };

  const stopAuto = () => {
    clearInterval(autoTimer);
    autoTimer = undefined;
  };

  const enableTrail = () => {
    if (reduced.matches || !visible || document.hidden) return;
    for (const img of images) img.loading = 'eager';
    if (coarse.matches) {
      startAuto();
      return;
    }
    section.addEventListener('pointermove', onMove);
    section.addEventListener('pointerleave', onLeave);
  };

  const disableTrail = () => {
    stopAuto();
    primed = false;
    section.removeEventListener('pointermove', onMove);
    section.removeEventListener('pointerleave', onLeave);
    gsap.killTweensOf(images);
    gsap.set(images, { opacity: 0 });
  };

  const revealQuote = async () => {
    if (reduced.matches || !window.SplitText) return;
    try {
      await document.fonts.ready;
    } catch {
      /* font loading status is optional */
    }
    if (reduced.matches) return;
    split = new window.SplitText(statement, { type: 'words', mask: 'words' });
    gsap.set(split.words, { yPercent: 120 });
    revealAnimation = gsap
      .timeline()
      .from(intro, { opacity: 0, y: 16, duration: 0.6, ease: 'power2.out' })
      .to(split.words, { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07 }, '-=0.35');
  };

  let revealed = false;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visible = entry.isIntersecting;
        if (visible) {
          if (!revealed) {
            revealed = true;
            revealQuote();
          }
          enableTrail();
        } else {
          disableTrail();
        }
      }
    },
    { threshold: 0.35 },
  );
  observer.observe(section);

  const onPreferencesChange = () => {
    disableTrail();
    if (reduced.matches) {
      revealAnimation?.kill();
      split?.revert();
      split = undefined;
      gsap.set(intro, { clearProps: 'opacity,transform' });
    }
    enableTrail();
  };
  const onVisibilityChange = () => { disableTrail(); enableTrail(); };
  reduced.addEventListener('change', onPreferencesChange);
  coarse.addEventListener('change', onPreferencesChange);
  document.addEventListener('visibilitychange', onVisibilityChange);

  return { destroy: () => {
    observer.disconnect();
    visible = false;
    disableTrail();
    revealAnimation?.kill();
    split?.revert();
    reduced.removeEventListener('change', onPreferencesChange);
    coarse.removeEventListener('change', onPreferencesChange);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    images.forEach((img) => img.remove());
  } };

}
