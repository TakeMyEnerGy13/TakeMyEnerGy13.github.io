export const HAND_HITS = 3;
export const HAND_EXIT_SECONDS = .65;

export function createRescueGame(ids) {
  return {
    phase: 'playing', victoryAt: null,
    hands: ids.map(id => ({ id, hp: HAND_HITS, hitAt: null, defeatedAt: null }))
  };
}

export function hitRescueHand(game, id, time) {
  const target = game.hands.find(hand => hand.id === id);
  if (game.phase !== 'playing' || !target || target.hp === 0) return game;
  return {
    ...game,
    hands: game.hands.map(hand => hand !== target ? hand : {
      ...hand, hp: hand.hp - 1, hitAt: time,
      defeatedAt: hand.hp === 1 ? time : null
    })
  };
}

export function finishRescue(game, activeIds, time, immediate = false) {
  if (game.phase === 'won' || activeIds.length === 0) return game;
  const cleared = activeIds.every(id => {
    const hand = game.hands.find(item => item.id === id);
    return hand?.hp === 0 && (immediate || time - hand.defeatedAt >= HAND_EXIT_SECONDS);
  });
  return cleared ? { ...game, phase: 'won', victoryAt: time } : game;
}

export function rescueHandMotion(hand, time, immediate = false) {
  const hitAge = hand.hitAt === null ? Infinity : Math.max(0, time - hand.hitAt);
  const impact = immediate ? 0 : Math.max(0, 1 - hitAge / .36);
  const exit = hand.defeatedAt === null ? 0 : immediate ? 1
    : Math.min(1, Math.max(0, (time - hand.defeatedAt) / HAND_EXIT_SECONDS));
  return {
    recoil: impact * 42,
    twist: impact * -12,
    exitX: exit * exit * 1100,
    exitY: -Math.sin(exit * Math.PI / 2) * 80,
    exitAngle: exit * -24,
    opacity: exit === 1 ? 0 : 1 - Math.max(0, (exit - .55) / .45),
    burst: !immediate && hitAge < .3 ? 1 - hitAge / .3 : 0
  };
}

export function rescuedPose(elapsed, reduced = false) {
  const phase = Math.max(0, elapsed) % 5.4;
  return {
    pose: !reduced && phase > 5.22 ? 'thank-blink' : 'thank',
    y: reduced ? 0 : -(Math.sin(elapsed * Math.PI / 4) ** 2) * 1.5,
    angle: reduced ? 0 : Math.sin(elapsed * Math.PI / 4) * .35
  };
}
