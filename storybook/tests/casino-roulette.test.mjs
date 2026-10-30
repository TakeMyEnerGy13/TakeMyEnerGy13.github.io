import test from 'node:test';
import assert from 'node:assert/strict';
import { pocketPoint } from '../assets/casino-roulette-motion.js';

const TAU = Math.PI * 2;
test('each pocket track closes without a seam after a full revolution', () => {
  for (const band of [0, 1]) {
    for (const depth of [0, .5, 1]) {
      const a = pocketPoint(band, 0, depth);
      const b = pocketPoint(band, TAU, depth);
      a.forEach((n, i) => assert.ok(Math.abs(n - b[i]) < 1e-9));
    }
  }
});

test('pocket tracks stay separated by the stationary middle gold rim', () => {
  for (let i = 0; i < 360; i++) {
    const angle = i / 360 * TAU;
    const outerTrack = pocketPoint(0, angle, 0);
    const innerTrack = pocketPoint(1, angle, 1);
    assert.ok(Math.hypot(outerTrack[0] - innerTrack[0], outerTrack[1] - innerTrack[1]) > 2.5);
    for (const band of [0, 1]) {
      const inner = pocketPoint(band, angle, 0);
      const outer = pocketPoint(band, angle, 1);
      assert.ok(Math.hypot(outer[0] - inner[0], outer[1] - inner[1]) > 16, 'No inverted or collapsed pocket slices');
      for (const n of [...inner, ...outer]) assert.ok(Number.isFinite(n));
    }
  }
});
