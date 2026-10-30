export const GIRL = { x: 985, y: 91.111111, width: 500, height: 750, cut: 330 };
export const HAND = { x: 760, y: -175, width: 1000, height: 500 };
export const VIEW = { x: 800, y: -190, width: 1000, height: 1110 };
const handPivot = { x: 1660, y: -140 };
const girlPivot = { x: 1230, y: 215 };
const handPins = [{ x: 1084, y: 222 }, { x: 1374, y: 217 }];
const ribbonEnds = [
  { x: 234, width: 11, pin: 0 }, { x: 307, width: 17, pin: 0 },
  { x: 710, width: 15, pin: 1 }, { x: 749, width: 8, pin: 1 }, { x: 784, width: 11, pin: 1 }
];

export function transformPoint(point, transform) {
  const x = point.x - transform.pivot.x;
  const y = point.y - transform.pivot.y;
  const c = Math.cos(transform.angle), s = Math.sin(transform.angle);
  return { x: transform.pivot.x + x * c - y * s + transform.x, y: transform.pivot.y + x * s + y * c + transform.y };
}

export function puppetPose(time, wind = 0) {
  const hand = { pivot: handPivot, angle: Math.sin(time * .47) * .006, x: 0, y: Math.sin(time * .65) * 2.5 };
  const suspension = transformPoint(girlPivot, hand);
  const girl = {
    pivot: girlPivot,
    angle: Math.sin(time * .95) * .045 + Math.sin(time * .43) * .012 + wind * .012,
    x: suspension.x - girlPivot.x,
    y: suspension.y - girlPivot.y
  };
  return { hand, girl, ribbons: ribbonEnds.map(ribbon => ({
    start: transformPoint(handPins[ribbon.pin], hand),
    end: transformPoint({ x: GIRL.x + ribbon.x * 5 / 9, y: GIRL.cut }, girl),
    width: ribbon.width
  })) };
}

export function tearState(time) {
  const elapsed = time - 2.2;
  if (elapsed < 0) return null;
  const cycle = Math.floor(elapsed / 10.7);
  const age = elapsed - cycle * 10.7;
  if (age >= 2.8) return null;
  return { cycle, age, falling: age >= 1.05, releasedAt: 2.2 + cycle * 10.7 + 1.05, eye: cycle % 2 };
}

export function blinkAmount(time) {
  if (time < 1.8) return 0;
  const age = (time - 1.8) % 6.7;
  if (age < .045) return age / .045;
  if (age < .125) return 1;
  if (age < .21) return 1 - (age - .125) / .085;
  return 0;
}
