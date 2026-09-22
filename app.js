import { createHelmetScene } from './helmet-scene.js';
import { initializeLanguage, translate } from './i18n.js';
import { createEngineScene } from './engine-scene.js';
import { createEnergyScene } from './scene.js';
import { createVibeSection } from './vibe.js';

const canvas = document.querySelector('#energy-scene');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
let scene;
let engineScene;
let helmetScene;
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

reducedMotion.addEventListener('change', (event) => { paused = event.matches; scene?.setPaused(paused); engineScene?.setPaused(paused); helmetScene?.setPaused(paused); });

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
