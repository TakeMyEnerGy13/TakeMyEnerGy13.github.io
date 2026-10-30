const TAU = Math.PI * 2;

export function escapePose(time, reduced = false) {
  if (reduced) return { pose: 'left', x: 0, y: 0, angle: 0, shadowScale: 1 };
  const phase = time / 12 * TAU;
  const pressure = Math.sin(phase);
  return {
    pose: Math.abs(pressure) < .055 ? 'blink' : pressure > 0 ? 'left' : 'right',
    x: pressure * 24,
    y: -(Math.sin(phase * 2) ** 2) * 3,
    angle: pressure * 2,
    shadowScale: 1 - Math.sin(phase * 2) ** 2 * .04
  };
}

export function handReach(time, side, delay, reduced = false) {
  if (reduced) return .5;
  const phase = (time - delay) / 12 * TAU;
  return .5 + Math.sin(phase) * (side === 'left' ? .46 : -.46);
}
