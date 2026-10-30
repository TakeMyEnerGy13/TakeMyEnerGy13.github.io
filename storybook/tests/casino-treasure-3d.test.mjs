import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCoin, buildChip, buildDie, rotationMatrix, createTreasureRenderer, DIE_FACES, VERTEX_STRIDE } from '../assets/casino-treasure-3d.js';

for (const [name, build] of [['coin', buildCoin], ['chip', buildChip], ['die', buildDie]]) {
  test(`${name}: finite solid geometry, unit normals and outward triangle winding`, () => {
    const mesh = build();
    assert.equal(mesh.length % (VERTEX_STRIDE * 3), 0);
    let minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < mesh.length; i += VERTEX_STRIDE) {
      assert.ok([...mesh.slice(i, i + VERTEX_STRIDE)].every(Number.isFinite));
      assert.ok(Math.abs(Math.hypot(...mesh.slice(i + 3, i + 6)) - 1) < 1e-5);
      minZ = Math.min(minZ, mesh[i + 2]); maxZ = Math.max(maxZ, mesh[i + 2]);
    }
    assert.ok(maxZ - minZ > .15, 'Prop must have real depth, not a billboard');
    for (let i = 0; i < mesh.length; i += VERTEX_STRIDE * 3) {
      const a = mesh.slice(i, i + VERTEX_STRIDE);
      const b = mesh.slice(i + VERTEX_STRIDE, i + VERTEX_STRIDE * 2);
      const c = mesh.slice(i + VERTEX_STRIDE * 2, i + VERTEX_STRIDE * 3);
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const normal = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      assert.ok(Math.hypot(...normal) > 1e-8, 'No zero-area triangles');
      assert.ok(normal.reduce((sum, n, j) => sum + n * (a[j + 3] + b[j + 3] + c[j + 3]), 0) > 0, 'Back-face culling must retain the outer surface');
    }
  });
}

test('die: six distinct pip counts and opposite faces sum to seven', () => {
  assert.deepEqual(DIE_FACES.map(f => f.pips).sort(), [1, 2, 3, 4, 5, 6]);
  for (const face of DIE_FACES) {
    const opposite = DIE_FACES.find(f => f.normal.every((n, i) => n === -face.normal[i]));
    assert.equal(face.pips + opposite.pips, 7);
  }
  const mesh = buildDie();
  assert.deepEqual([...new Set(Array.from({ length: mesh.length / VERTEX_STRIDE }, (_, i) => mesh[i * VERTEX_STRIDE + 8]))].sort(), [1, 2, 3, 4, 5, 6]);
});

test('coin is thinner than a chip while its star projects above the face', () => {
  const depth = mesh => {
    const values = Array.from({ length: mesh.length / VERTEX_STRIDE }, (_, i) => Math.abs(mesh[i * VERTEX_STRIDE + 2]));
    return Math.max(...values) * 2;
  };
  const coin = buildCoin();
  assert.ok(depth(coin) < depth(buildChip()));
  const star = [], face = [];
  for (let i = 0; i < coin.length; i += VERTEX_STRIDE) {
    (coin[i + 8] === 8 ? star : face).push(Math.abs(coin[i + 2]));
  }
  assert.ok(Math.max(...star) > Math.max(...face));
});

test('three-axis rotations preserve lengths, orthogonality and handedness', () => {
  for (const angles of [[0, 0, 0], [.3, .7, 1.2], [7, -3, 11], [Math.PI / 2, Math.PI, 0]]) {
    const m = rotationMatrix(...angles);
    const columns = [m.slice(0, 3), m.slice(3, 6), m.slice(6, 9)];
    for (const c of columns) assert.ok(Math.abs(Math.hypot(...c) - 1) < 1e-6);
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) assert.ok(Math.abs(columns[i].reduce((sum, n, k) => sum + n * columns[j][k], 0)) < 1e-6);
    const determinant = m[0] * (m[4] * m[8] - m[7] * m[5]) - m[3] * (m[1] * m[8] - m[7] * m[2]) + m[6] * (m[1] * m[5] - m[4] * m[2]);
    assert.ok(Math.abs(determinant - 1) < 1e-6);
  }
});

test('unavailable WebGL selects the existing sprite fallback without throwing', () => {
  let status;
  const renderer = createTreasureRenderer({ getContext: () => null }, mode => { status = mode; });
  assert.equal(renderer, null);
  assert.equal(status, 'sprites');
});
