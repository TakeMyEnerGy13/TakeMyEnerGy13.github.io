import test from 'node:test';
import assert from 'node:assert/strict';
import { puppetPose, transformPoint, tearState, blinkAmount, GIRL, VIEW } from '../assets/forest-puppet-motion.js';

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

test('ribbon ends stay registered to both moving sprites throughout a gust', () => {
  const rest = puppetPose(0);
  for (let t = 0; t < 90; t += .13) {
    const pose = puppetPose(t, Math.sin(t));
    pose.ribbons.forEach((ribbon, i) => {
      assert.ok(distance(ribbon.start, transformPoint(rest.ribbons[i].start, pose.hand)) < 1e-8);
      assert.ok(distance(ribbon.end, transformPoint(rest.ribbons[i].end, pose.girl)) < 1e-8);
      assert.ok(ribbon.end.y > ribbon.start.y, 'Ribbons hang below the claws');
    });
    assert.ok(Math.abs(distance(pose.ribbons[0].end, pose.ribbons[4].end) - distance(rest.ribbons[0].end, rest.ribbons[4].end)) < 1e-8, 'The girl and attached ribbons move as one rigid cel');
  }
});

test('swing keeps the visible cel inside the scene and is stable at a paused clock', () => {
  for (let t = 0; t < 90; t += .2) {
    const pose = puppetPose(t, 1);
    for (const point of [
      { x: GIRL.x, y: GIRL.cut }, { x: GIRL.x + GIRL.width, y: GIRL.cut },
      { x: GIRL.x, y: GIRL.y + GIRL.height }, { x: GIRL.x + GIRL.width, y: GIRL.y + GIRL.height }
    ]) {
      const moved = transformPoint(point, pose.girl);
      assert.ok(moved.x > VIEW.x && moved.x < VIEW.x + VIEW.width && moved.y > VIEW.y && moved.y < VIEW.y + VIEW.height);
    }
    assert.deepEqual(puppetPose(t, 1), pose);
  }
});

test('standalone blink closes briefly and leaves a long open-eye interval', () => {
  assert.equal(blinkAmount(0), 0);
  assert.equal(blinkAmount(1.9), 1);
  assert.equal(blinkAmount(2.1), 0);
  assert.equal(blinkAmount(7), 0);
  assert.equal(blinkAmount(8.6), 1);
  for (let time = 0; time < 30; time += .01) {
    assert.ok(blinkAmount(time) >= 0 && blinkAmount(time) <= 1);
  }
});

test('tears form before falling, alternate eyes and leave a quiet interval', () => {
  assert.equal(tearState(0), null);
  assert.equal(tearState(2), null);
  assert.equal(tearState(2.7).falling, false);
  assert.equal(tearState(3.5).falling, true);
  assert.equal(tearState(6), null);
  assert.equal(tearState(12), null);
  const first = tearState(3.5), second = tearState(14.2);
  assert.notEqual(first.eye, second.eye);
  assert.ok(Math.abs(second.releasedAt - first.releasedAt - 10.7) < 1e-9);
});
