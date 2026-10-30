import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../assets/engineer-rear.js', import.meta.url), 'utf8');

function fixture({ webgl = true, loaded = true, reduced = false } = {}) {
  const callbacks = new Map();
  const uniforms = new Map();
  const observers = new Map();
  const listeners = new Map();
  let nextFrame = 0;
  let now = 1;
  let draws = 0;
  const element = () => {
    const classes = new Set();
    return {
      classList: { contains: name => classes.has(name), add: name => classes.add(name), remove: name => classes.delete(name) },
      style: { removeProperty(name) { delete this[name]; } },
      append() {},
      addEventListener(name, callback) { listeners.set(this, { ...listeners.get(this), [name]: callback }); }
    };
  };
  const gl = new Proxy({
    getShaderParameter: () => true,
    getProgramParameter: () => true,
    getUniformLocation: (_, name) => name,
    uniform2f: (name, x, y) => uniforms.set(name, [x, y]),
    drawElements: () => { draws += 1; }
  }, { get: (target, key) => key in target ? target[key] : key === key.toUpperCase() ? 1 : () => ({}) });
  const scene = element();
  scene.clientWidth = 800;
  scene.clientHeight = 800 / 1.08;
  scene.classList.add('is-moving');
  const flights = Object.fromEntries(['paper-left', 'code-right', 'spark-left', 'paper-right', 'code-left', 'spark-right'].map(name => {
    const node = Object.assign(element(), { dataset: { flight: name } });
    const art = element();
    const tail = element();
    node.querySelector = selector => selector === '.rear-flight-art' ? art : tail;
    return [name, node];
  }));
  const person = element();
  person.clientWidth = 608;
  const image = Object.assign(element(), { complete: loaded, naturalWidth: loaded ? 1024 : 0 });
  const canvas = Object.assign(element(), { getContext: () => webgl ? gl : null });
  const mouse = element();
  const section = { querySelector: () => element() };
  person.querySelector = selector => selector === 'img' ? image : canvas;
  scene.closest = () => section;
  scene.querySelector = selector => selector === '.rear-person' ? person : mouse;
  scene.querySelectorAll = () => Object.values(flights);
  const document = Object.assign(element(), {
    hidden: false,
    querySelector: () => scene,
    createElement: element,
    createDocumentFragment: element
  });
  runInNewContext(source, {
    document, window: element(), console, devicePixelRatio: 1,
    matchMedia: () => Object.assign(element(), { matches: reduced }),
    requestAnimationFrame: callback => { callbacks.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: id => callbacks.delete(id),
    ResizeObserver: class { constructor(callback) { this.callback = callback; } observe(target) { observers.set(target, this.callback); } },
    MutationObserver: class { constructor(callback) { this.callback = callback; } observe(target) { observers.set(target, this.callback); } }
  });
  return {
    person, image, uniforms, callbacks, flights,
    get draws() { return draws; },
    advance(ms) {
      for (let elapsed = 0; elapsed < ms; elapsed += 40) {
        const pending = [...callbacks.values()];
        callbacks.clear();
        pending.forEach(callback => callback(now));
        now += 40;
      }
    },
    pause() { scene.classList.remove('is-moving'); observers.get(scene)(); },
    resume() { scene.classList.add('is-moving'); observers.get(scene)(); },
    hide() { document.hidden = true; listeners.get(document).visibilitychange(); },
    resize(width) { scene.clientHeight *= width / scene.clientWidth; scene.clientWidth = width; person.clientWidth = width * .76; observers.get(person)(); },
    load() { image.naturalWidth = 1024; listeners.get(image).load(); }
  };
}

test('keeps the complete image visible until its texture is ready', () => {
  const scene = fixture({ loaded: false });
  assert.equal(scene.person.classList.contains('is-rendered'), false);
  assert.equal(scene.draws, 0);
  scene.load();
  assert.equal(scene.person.classList.contains('is-rendered'), true);
  assert.ok(scene.draws > 0);
});

test('whole-character fallback remains visible without WebGL', () => {
  const scene = fixture({ webgl: false });
  assert.equal(scene.person.classList.contains('is-rendered'), false);
  assert.equal(scene.callbacks.size, 0);
});

test('mouse activity stays subtle and stops outside its working interval', () => {
  const scene = fixture();
  assert.ok(scene.uniforms.get('u_mouse').every(value => value === 0));
  scene.advance(8040);
  const mousePose = scene.uniforms.get('u_mouse');
  assert.ok(mousePose.some(value => Math.abs(value) > .0001));
  assert.ok(mousePose.every(value => Math.abs(value) < .002));
  scene.advance(4080);
  assert.ok(scene.uniforms.get('u_mouse').every(value => Math.abs(value) < .0001));
});

test('pause preserves the pose and resume does not jump forward', () => {
  const scene = fixture();
  scene.advance(8200);
  scene.pause();
  const pose = [...scene.uniforms.get('u_mouse')];
  const draws = scene.draws;
  scene.advance(30000);
  assert.equal(scene.draws, draws);
  assert.equal(scene.callbacks.size, 0);
  scene.resume();
  scene.advance(40);
  assert.deepEqual([...scene.uniforms.get('u_mouse')], pose);
  scene.hide();
  assert.equal(scene.callbacks.size, 0);
});

test('reduced motion renders the complete resting pose without a loop', () => {
  const scene = fixture({ reduced: true });
  assert.ok(scene.draws > 0);
  assert.equal(scene.callbacks.size, 0);
  assert.ok(scene.uniforms.get('u_mouse').every(value => value === 0));
  assert.ok(Object.values(scene.flights).every(node => node.style.opacity === '0'));
});

test('paper bursts follow typing and mouse activity with quiet intervals', () => {
  const scene = fixture();
  const visible = name => Number(scene.flights[name].style.opacity) > 0;
  assert.ok(Object.values(scene.flights).every(node => node.style.opacity === '0'));
  scene.advance(2640);
  assert.ok(visible('paper-left') && visible('code-right') && visible('spark-left'));
  assert.equal(visible('paper-right'), false);
  scene.advance(2600);
  assert.ok(Object.values(scene.flights).every(node => node.style.opacity === '0'));
  scene.advance(3000);
  assert.ok(visible('paper-right') && visible('code-left') && visible('spark-right'));
  scene.advance(2200);
  assert.ok(Object.values(scene.flights).every(node => node.style.opacity === '0'));
});

test('flying details preserve their position while paused and scale with the scene', () => {
  const scene = fixture();
  scene.advance(2800);
  scene.pause();
  const paper = scene.flights['paper-left'];
  const position = paper.style.transform;
  scene.advance(20000);
  assert.equal(paper.style.transform, position);
  const coordinates = value => value.match(/translate3d\(([-\d.]+)px,([-\d.]+)px/).slice(1).map(Number);
  const before = coordinates(position);
  scene.resize(400);
  const after = coordinates(paper.style.transform);
  assert.deepEqual(after, before.map(value => value / 2));
  scene.resume();
  scene.advance(40);
  assert.deepEqual(coordinates(paper.style.transform), after);
});
