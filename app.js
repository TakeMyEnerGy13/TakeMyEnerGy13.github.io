import { createEngineScene } from './engine-scene.js';
import { createEnergyScene } from './scene.js';
import { createVibeSection } from './vibe.js';

const canvas = document.querySelector('#energy-scene');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
let scene;
let engineScene;
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

reducedMotion.addEventListener('change', (event) => { paused = event.matches; scene?.setPaused(paused); engineScene?.setPaused(paused); });

const copyButton = document.querySelector('#copy-email');
const copyStatus = document.querySelector('#copy-status');
let statusTimer;
copyButton.addEventListener('click', async () => {
  clearTimeout(statusTimer);
  try {
    await navigator.clipboard.writeText('takemyenergy1337@gmail.com');
    copyStatus.textContent = 'Email скопирован: takemyenergy1337@gmail.com';
    copyButton.textContent = 'Скопировано ✓';
  } catch {
    copyStatus.textContent = 'Мой email: takemyenergy1337@gmail.com';
  }
  statusTimer = setTimeout(() => {
    copyButton.innerHTML = 'Скопировать email <span aria-hidden="true">⧉</span>';
    copyStatus.textContent = '';
  }, 6000);
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
