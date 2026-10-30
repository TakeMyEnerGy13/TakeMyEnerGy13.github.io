import test from 'node:test';
import assert from 'node:assert/strict';
import { escapePose, handReach } from '../assets/work-escape-motion.js';

test('the girl faces the approaching side and retreats away from it', () => {
  for (const [time, side, sign] of [[3, 'left', 1], [9, 'right', -1]]) {
    const pose = escapePose(time);
    assert.equal(pose.pose, side);
    assert.ok(pose.x * sign > 0);
    const otherSide = side === 'left' ? 'right' : 'left';
    for (const delay of [0, .2, .6, .7, 1]) {
      assert.ok(handReach(time, side, delay) > handReach(time, otherSide, delay));
    }
  }
});

test('turns have a brief closed-eye cel, with restrained continuous displacement', () => {
  let blinkFrames = 0;
  let previous = escapePose(0);
  for (let frame = 1; frame <= 360; frame++) {
    const pose = escapePose(frame / 30);
    if (pose.pose === 'blink') blinkFrames++;
    assert.ok(Math.abs(pose.x) <= 24 && Math.abs(pose.angle) <= 2);
    assert.ok(Math.abs(pose.x - previous.x) < .5, 'No teleport when a cel changes');
    assert.ok(pose.y >= -3 && pose.y <= 0);
    previous = pose;
  }
  assert.ok(blinkFrames > 0 && blinkFrames < 20);
  assert.equal(escapePose(3).pose, 'left');
  assert.equal(escapePose(6).pose, 'blink');
  assert.equal(escapePose(9).pose, 'right');
});

test('a frozen clock is stable and reduced motion keeps the eyes open', () => {
  const still = escapePose(0, true);
  for (const t of [0, 1.8, 6, 9, 12, 120]) {
    assert.deepEqual(escapePose(t, true), still);
    assert.notEqual(still.pose, 'blink');
    assert.deepEqual(escapePose(t), escapePose(t));
    assert.equal(handReach(t, 'left', .6, true), .5);
    assert.equal(handReach(t, 'right', 1, true), .5);
  }
});
