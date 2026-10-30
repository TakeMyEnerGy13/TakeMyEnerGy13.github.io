import test from 'node:test';
import assert from 'node:assert/strict';
import { createRescueGame, hitRescueHand, finishRescue, rescueHandMotion, rescuedPose, HAND_EXIT_SECONDS } from '../assets/work-rescue-game.js';

const ids = ['left-high', 'right-high', 'left-middle', 'right-middle', 'right-low'];
const clear = (game, selected, time) => selected.reduce((state, id) => {
  for (let hit = 0; hit < 3; hit++) state = hitRescueHand(state, id, time);
  return state;
}, game);

test('each hand needs three hits, with independent health and no hits after defeat', () => {
  const original = createRescueGame(ids);
  let game = hitRescueHand(original, ids[0], 1);
  assert.equal(original.hands[0].hp, 3);
  assert.equal(game.hands[0].hp, 2);
  assert.equal(game.hands[1].hp, 3);
  game = hitRescueHand(hitRescueHand(game, ids[0], 1.2), ids[0], 1.4);
  assert.equal(game.hands[0].hp, 0);
  assert.equal(game.hands[0].defeatedAt, 1.4);
  assert.equal(hitRescueHand(game, ids[0], 1.6), game);
});

test('victory waits for the last hand to leave and ignores repeated activation', () => {
  let game = clear(createRescueGame(ids), ids.slice(0, 4), 0);
  assert.equal(finishRescue(game, ids, 2).phase, 'playing');
  game = clear(game, [ids[4]], 2);
  assert.equal(finishRescue(game, ids, 2.2).phase, 'playing');
  const won = finishRescue(game, ids, 2 + HAND_EXIT_SECONDS + .01);
  assert.equal(won.phase, 'won');
  assert.equal(hitRescueHand(won, ids[0], 4), won);
  assert.equal(finishRescue(won, ids, 5), won);
});

test('a hand hidden on mobile cannot block victory; resizing a won game keeps it won', () => {
  const mobile = ids.slice(0, 4);
  const game = clear(createRescueGame(ids), mobile, 1);
  assert.equal(finishRescue(game, ids, 2).phase, 'playing');
  const won = finishRescue(game, mobile, 2);
  assert.equal(won.phase, 'won');
  assert.equal(finishRescue(won, ids, 3).phase, 'won');
  assert.equal(finishRescue(game, [], 2).phase, 'playing');
});

test('reduced motion or pause allows immediate completion without an animation clock', () => {
  const game = clear(createRescueGame(ids), ids, 0);
  assert.equal(finishRescue(game, ids, 0, true).phase, 'won');
  const motion = rescueHandMotion(game.hands[0], 0, true);
  assert.equal(motion.opacity, 0);
  assert.equal(motion.burst, 0);
  assert.equal(motion.recoil, 0);
});

test('hit recoil settles, exit ends invisible, and replay restores all targets', () => {
  const game = hitRescueHand(createRescueGame(ids), ids[0], 1);
  assert.ok(rescueHandMotion(game.hands[0], 1).recoil > 0);
  assert.equal(rescueHandMotion(game.hands[0], 1.5).recoil, 0);
  const defeated = clear(game, [ids[0]], 2);
  assert.equal(rescueHandMotion(defeated.hands[0], 3).opacity, 0);
  const reset = createRescueGame(ids);
  assert.ok(reset.hands.every(hand => hand.hp === 3 && hand.hitAt === null));
  assert.equal(reset.phase, 'playing');
  assert.equal(rescuedPose(5.3).pose, 'thank-blink');
  assert.equal(rescuedPose(5.3, true).pose, 'thank');
});
