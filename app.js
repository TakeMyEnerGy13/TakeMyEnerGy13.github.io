import { createPortalScene } from './portal-scene.js';
import { createHelmetScene } from './helmet-scene.js';
import { initializeLanguage, translate } from './i18n.js';
import { createEngineScene } from './engine-scene.js';
import { createEnergyScene } from './scene.js?v=20261026-halos2';
import { createVibeSection } from './vibe.js';

const canvas = document.querySelector('#energy-scene');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
let scene;
let engineScene;
let helmetScene;
let portalScene;
try { portalScene = createPortalScene(document.querySelector('#portal-scene'), paused); } catch (error) { console.warn('Portal scene unavailable.', error); }
try { helmetScene = createHelmetScene(document.querySelector('#helmet-scene'), paused); } catch (error) { console.warn('Helmet scene unavailable.', error); }
try { engineScene = createEngineScene(document.querySelector('#engine-scene'), paused); } catch (error) { console.warn('Engine scene unavailable.', error); }
try { createVibeSection(document.querySelector('#vibe')); } catch (error) { console.warn('Vibe section unavailable.', error); }
async function initializeScene() {
  try {
    scene = await createEnergyScene(canvas, paused);
    scene.setPaused(paused);
    canvas.parentElement.classList.add('ready');
  } catch (error) {
    console.warn('3D scene unavailable; using the static illustration.', error);
    canvas.hidden = true;
  }
}
initializeScene();

reducedMotion.addEventListener('change', (event) => { paused = event.matches; scene?.setPaused(paused); engineScene?.setPaused(paused); helmetScene?.setPaused(paused); portalScene?.setPaused(paused); });

const portalStage = document.querySelector('.portal-stage');
const portalTrigger = portalStage.querySelector('.portal-trigger');
const portalNotice = document.querySelector('#my-design .portal-notice');
let portalPointerInside = false;
let portalPinned = false;
let portalTravelling = false;
let portalFlightFrame = 0;
let portalRecoveryTimer = 0;
const portalFlight = document.querySelector('.portal-flight');
const portalCanvas = document.querySelector('#portal-scene');
const portalCanvasAnchor = portalCanvas.nextSibling;
const smoothRange = (from, to, value) => {
  const t = Math.max(0, Math.min(1, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
};
function restorePortalFlight() {
  if (!portalTravelling) return;
  cancelAnimationFrame(portalFlightFrame);
  clearTimeout(portalRecoveryTimer);
  portalStage.insertBefore(portalCanvas, portalCanvasAnchor);
  portalScene?.endFlight();
  portalFlight.close();
  portalFlight.removeAttribute('style');
  portalFlight.classList.remove('has-webgl');
  document.documentElement.classList.remove('portal-travelling');
  portalTrigger.removeAttribute('aria-busy');
  portalTravelling = false;
  portalPinned = false;
  portalPointerInside = false;
  portalTrigger.focus({ preventScroll: true });
  setPortalOpen(false);
}
portalFlight.addEventListener('cancel', event => { event.preventDefault(); restorePortalFlight(); });
window.addEventListener('pageshow', restorePortalFlight);
window.addEventListener('resize', restorePortalFlight);
document.addEventListener('visibilitychange', () => { if (document.hidden) restorePortalFlight(); });
reducedMotion.addEventListener('change', restorePortalFlight);
function setPortalOpen(open) {
  if (portalTravelling && !open) return;
  portalStage.classList.toggle('is-open', open);
  portalTrigger.setAttribute('aria-expanded', String(open));
  portalScene?.setOpen(open);
}
portalTrigger.addEventListener('pointerenter', event => {
  if (event.pointerType === 'touch') return;
  portalPointerInside = true;
  setPortalOpen(true);
});
portalTrigger.addEventListener('pointerleave', event => {
  if (event.pointerType === 'touch') return;
  portalPointerInside = false;
  if (!portalStage.contains(document.activeElement) && !portalPinned) setPortalOpen(false);
});
portalStage.addEventListener('focusin', () => setPortalOpen(true));
portalStage.addEventListener('focusout', () => queueMicrotask(() => {
  if (!portalStage.contains(document.activeElement)) { portalPinned = false; if (!portalPointerInside) setPortalOpen(false); }
}));
function enterDesignPortfolio() {
  if (portalTravelling) return;
  portalPinned = true;
  setPortalOpen(true);
  portalNotice.hidden = true;
  const rect = portalCanvas.getBoundingClientRect();
  const framing = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height };
  portalTravelling = true;
  portalTrigger.setAttribute('aria-busy', 'true');
  document.documentElement.classList.add('portal-travelling');
  portalFlight.classList.toggle('has-webgl', Boolean(portalScene && portalStage.classList.contains('ready')));
  portalFlight.style.setProperty('--flight-x', framing.x + 'px');
  portalFlight.style.setProperty('--flight-y', framing.y + 'px');
  portalFlight.showModal();
  portalFlight.insertBefore(portalCanvas, portalFlight.querySelector('.portal-flight-veil'));
  portalScene?.beginFlight(framing);
  portalFlight.focus({ preventScroll: true });
  const started = performance.now(), duration = paused ? 320 : 1850;
  function advance(now) {
    if (!portalTravelling) return;
    const progress = Math.min(1, (now - started) / duration);
    // A gentle initial pull gives way to an accelerating, short plunge.
    const plunge = Math.max(0, Math.min(1, (progress - .50) / .40));
    const approach = .14 * smoothRange(0, .56, progress) + .86 * plunge * plunge * plunge;
    const rush = paused ? 0 : smoothRange(.50, .84, progress) * (1 - smoothRange(.94, 1, progress));
    portalScene?.setFlight(paused ? 0 : approach, rush);
    portalFlight.style.setProperty('--flight-backdrop', smoothRange(0, .4, progress));
    portalFlight.style.setProperty('--flight-veil', paused ? progress : smoothRange(.89, 1, progress));
    portalFlight.style.setProperty('--flight-scale', paused ? 1 : 1 + approach * 10);
    portalFlight.style.setProperty('--flight-blur', (rush * 1.3) + 'px');
    if (progress < 1) {
      portalFlightFrame = requestAnimationFrame(advance);
      return;
    }
    const destination = portalTrigger.dataset.destination?.trim();
    if (destination) {
      window.location.assign(destination);
      // Recover the controls if navigation is cancelled or fails to leave this document.
      portalRecoveryTimer = window.setTimeout(restorePortalFlight, 1800);
    } else {
      restorePortalFlight();
      portalNotice.hidden = false;
    }
  }
  portalFlightFrame = requestAnimationFrame(advance);
}
portalTrigger.addEventListener('click', enterDesignPortfolio);
portalStage.addEventListener('keydown', event => {
  if (event.key === 'Escape') { portalPinned = false; setPortalOpen(false); portalTrigger.focus({ preventScroll: true }); setPortalOpen(false); }
});
document.addEventListener('pointerdown', event => {
  if (!portalTravelling && !portalStage.contains(event.target)) { portalPinned = false; portalPointerInside = false; setPortalOpen(false); }
});

// Company artwork replaces the pointer only when a mouse and the image are available.
const companyPointer = document.createElement('img');
companyPointer.className = 'company-pointer';
companyPointer.alt = '';
companyPointer.setAttribute('aria-hidden', 'true');
document.body.append(companyPointer);
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
let activeCompanyRow;
const hideCompanyPointer = () => {
  activeCompanyRow?.classList.remove('has-company-pointer');
  activeCompanyRow = undefined;
  companyPointer.classList.remove('is-visible');
};
for (const row of document.querySelectorAll('[data-company-logo]')) {
  const artwork = new Image();
  artwork.src = row.dataset.companyLogo;
  row.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || event.pointerType !== 'mouse' || !artwork.complete || !artwork.naturalWidth) return;
    if (activeCompanyRow !== row) {
      hideCompanyPointer();
      activeCompanyRow = row;
      companyPointer.src = artwork.src;
      companyPointer.classList.toggle('is-cutout', row.hasAttribute('data-cursor-cutout'));
      row.classList.add('has-company-pointer');
    }
    const x = Math.max(56, Math.min(innerWidth - 56, event.clientX));
    const y = Math.max(56, Math.min(innerHeight - 56, event.clientY));
    companyPointer.style.left = `${x}px`;
    companyPointer.style.top = `${y}px`;
    companyPointer.classList.add('is-visible');
  });
  row.addEventListener('pointerleave', hideCompanyPointer);
}
window.addEventListener('scroll', hideCompanyPointer, { passive: true });
window.addEventListener('blur', hideCompanyPointer);
finePointer.addEventListener('change', hideCompanyPointer);

const experienceDialog = document.querySelector('#experience-dialog');
let experienceOpener;
let previousOverflow = '';
let closeTimer;
function closeExperience() {
  if (!experienceDialog.open || experienceDialog.classList.contains('is-closing')) return;
  experienceDialog.classList.add('is-closing');
  if (reducedMotion.matches) experienceDialog.close();
  else closeTimer = setTimeout(() => experienceDialog.close(), 180);
}
for (const trigger of document.querySelectorAll('[data-experience]')) {
  trigger.addEventListener('click', () => {
    if (experienceDialog.open) return;
    hideCompanyPointer();
    experienceOpener = trigger;
    renderExperience();
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    experienceDialog.showModal();
  });
}
experienceDialog.querySelector('.experience-close').addEventListener('click', closeExperience);
experienceDialog.addEventListener('cancel', (event) => { event.preventDefault(); closeExperience(); });
let backdropPress = false;
const outsideDialog = (event) => {
  const box = experienceDialog.getBoundingClientRect();
  return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
};
experienceDialog.addEventListener('pointerdown', (event) => { backdropPress = outsideDialog(event); });
experienceDialog.addEventListener('click', (event) => { if (backdropPress && outsideDialog(event)) closeExperience(); backdropPress = false; });
experienceDialog.addEventListener('close', () => {
  clearTimeout(closeTimer);
  experienceDialog.classList.remove('is-closing');
  document.documentElement.style.overflow = previousOverflow;
  experienceOpener?.focus({ preventScroll: true });
});

function renderExperience() {
    experienceDialog.querySelector('h2').textContent = experienceOpener.querySelector('.experience-role').firstChild.textContent;
    experienceDialog.querySelector('.experience-dialog-period').textContent = experienceOpener.querySelector('.experience-period').textContent;
    experienceDialog.querySelector('.experience-dialog-description').replaceChildren(document.querySelector(`#experience-${experienceOpener.dataset.experience}`).content.cloneNode(true));
    experienceDialog.querySelector('.experience-dialog-role').textContent = experienceOpener.querySelector('.experience-job')?.textContent || 'AI Engineer';
    translate(experienceDialog);
}
document.addEventListener('languagechange', () => { if (experienceDialog.open) renderExperience(); });
initializeLanguage();
