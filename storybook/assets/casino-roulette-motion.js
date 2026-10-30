const TAU = Math.PI * 2;
const ART_WIDTH = 1672;
const ART_HEIGHT = 941;
const SEGMENTS = 96;
const STRIP_WIDTH = 1536;
const STRIP_HEIGHT = 48;

// Move the pocket textures between fixed, separately traced painted rims.
const RIMS = [
  { cx: 836, cy: 654, rx: 440, top: 499, bottom: 811 },
  { cx: 836, cy: 662, rx: 356, top: 536, bottom: 788 },
  { cx: 838, cy: 655, rx: 261, top: 566, bottom: 745 }
];

// Measured radial corrections follow the artwork's non-elliptical gold rims.
const RIM_PROFILES = [
  [1.0086,1.0128,1.0173,1.0249,1.0341,1.0429,1.0462,1.0389,1.045,1.0486,1.0421,1.0371,1.0175,1.0019,.9985,.9953,.9924,.9894,.9869,.9874,.993,1.002,1.0165,1.0314,1.0455,1.0523,1.0515,1.0469,1.039,1.0297,1.0224,1.017,1.0135,1.0127,1.0131,1.0149,1.0175,1.0204,1.0252,1.0303,1.0354,1.0389,1.0418,1.0435,1.0431,1.0423,1.0414,1.0406,1.0397,1.0389,1.0381,1.0372,1.0363,1.0349,1.031,1.0269,1.0237,1.0204,1.0167,1.0126,1.0095,1.0064,1.0056,1.0059],
  [1.0017,1.0039,1.008,1.0112,1.015,1.0196,1.0217,1.0229,1.0229,1.0216,1.0166,1.0118,1.0075,1.0014,.9971,.9921,.9893,.9863,.9834,.9824,.9822,.9837,.9861,.9889,.9943,.9988,1.0023,1.003,1.0034,1.0038,1.0036,1.0028,1.0025,1.0033,1.005,1.0083,1.0124,1.0167,1.0213,1.0258,1.0319,1.0375,1.0414,1.0431,1.0422,1.0404,1.0386,1.0368,1.035,1.0332,1.0314,1.0296,1.0278,1.0252,1.0207,1.0165,1.0121,1.0076,1.0052,1.0026,1.0004,.9992,.999,1]
];

function rimPoint(index, angle, inset) {
  const rim = RIMS[index];
  const profile = RIM_PROFILES[index];
  const position = ((angle / TAU % 1) + 1) % 1 * 64;
  const i = Math.floor(position), fraction = position - i;
  const correction = profile ? profile[i] * (1 - fraction) + profile[(i + 1) % 64] * fraction : 1;
  const sine = Math.sin(angle);
  const ry = sine < 0 ? rim.cy - rim.top : rim.bottom - rim.cy;
  return [rim.cx + (rim.rx * correction + inset) * Math.cos(angle), rim.cy + (ry * correction + inset * ry / rim.rx) * sine];
}

export function pocketPoint(band, angle, depth) {
  const outer = rimPoint(band, angle, band ? -4 : -8);
  const inner = rimPoint(band + 1, angle, 4);
  return [inner[0] + (outer[0] - inner[0]) * depth, inner[1] + (outer[1] - inner[1]) * depth];
}

function makeSpindleMask() {
  const mask = new Path2D();
  mask.rect(0, 0, ART_WIDTH, ART_HEIGHT);
  mask.moveTo(775, 475);
  mask.bezierCurveTo(774, 496, 782, 511, 800, 521);
  mask.lineTo(799, 524);
  mask.bezierCurveTo(783, 523, 780, 531, 781, 542);
  mask.bezierCurveTo(765, 546, 761, 551, 763, 562);
  mask.bezierCurveTo(750, 565, 747, 576, 748, 592);
  mask.lineTo(748, 625);
  mask.lineTo(926, 625);
  mask.lineTo(926, 583);
  mask.bezierCurveTo(926, 572, 920, 565, 911, 562);
  mask.bezierCurveTo(912, 550, 900, 545, 892, 542);
  mask.bezierCurveTo(896, 531, 890, 526, 879, 523);
  mask.lineTo(879, 520);
  mask.bezierCurveTo(894, 510, 901, 495, 899, 475);
  mask.closePath();
  return mask;
}

function makeTriangle(points, transform) {
  const path = new Path2D();
  const cx = points.reduce((sum, p) => sum + p[0], 0) / 3;
  const cy = points.reduce((sum, p) => sum + p[1], 0) / 3;
  // A subpixel overlap avoids hairline seams between adjacent texture slices.
  points.forEach(([x, y], i) => {
    const distance = Math.hypot(x - cx, y - cy);
    const px = x + (x - cx) / distance * .45;
    const py = y + (y - cy) / distance * .45;
    if (i) path.lineTo(px, py); else path.moveTo(px, py);
  });
  path.closePath();
  return { path, transform };
}

export function createRouletteRenderer(image) {
  const source = document.createElement('canvas');
  source.width = ART_WIDTH;
  source.height = ART_HEIGHT;
  const sourceCtx = source.getContext('2d', { willReadFrequently: true });
  sourceCtx.drawImage(image, 0, 0, ART_WIDTH, ART_HEIGHT);
  const pixels = sourceCtx.getImageData(0, 0, ART_WIDTH, ART_HEIGHT).data;
  const spindleMask = makeSpindleMask();


  const bands = [0, 1].map(band => {
    const strip = document.createElement('canvas');
    strip.width = STRIP_WIDTH * 3;
    strip.height = STRIP_HEIGHT;
    const brush = strip.getContext('2d');
    const texture = brush.createImageData(STRIP_WIDTH, STRIP_HEIGHT);
    for (let x = 0; x < STRIP_WIDTH; x++) {
      let angle = (x + .5) / STRIP_WIDTH * TAU;
      // Only the hidden far arc borrows pockets from the unobstructed front.
      if (Math.abs(angle - Math.PI * 1.5) < (band ? .46 : .32)) angle = TAU - angle;
      for (let y = 0; y < STRIP_HEIGHT; y++) {
        const [px, py] = pocketPoint(band, angle, .15 + (y + .5) / STRIP_HEIGHT * .7);
        const sx = Math.floor(px), sy = Math.floor(py);
        const fx = px - sx, fy = py - sy;
        const i = (sy * ART_WIDTH + sx) * 4;
        const target = (y * STRIP_WIDTH + x) * 4;
        for (let channel = 0; channel < 3; channel++) {
          const top = pixels[i + channel] * (1 - fx) + pixels[i + 4 + channel] * fx;
          const bottom = pixels[i + ART_WIDTH * 4 + channel] * (1 - fx) + pixels[i + ART_WIDTH * 4 + 4 + channel] * fx;
          texture.data[target + channel] = top * (1 - fy) + bottom * fy;
        }
        texture.data[target + 3] = 255;
      }
    }
    brush.putImageData(texture, 0, 0);
    brush.putImageData(texture, STRIP_WIDTH, 0);
    brush.putImageData(texture, STRIP_WIDTH * 2, 0);

    const slices = Array.from({ length: SEGMENTS }, (_, i) => {
      const a = i / SEGMENTS * TAU, b = (i + 1) / SEGMENTS * TAU;
      const p = pocketPoint(band, a, 0), q = pocketPoint(band, a, 1);
      const r = pocketPoint(band, b, 1), s = pocketPoint(band, b, 0);
      return [
        makeTriangle([p, q, r], [r[0] - q[0], r[1] - q[1], q[0] - p[0], q[1] - p[1], ...p]),
        makeTriangle([p, r, s], [s[0] - p[0], s[1] - p[1], r[0] - s[0], r[1] - s[1], ...p])
      ];
    });
    return { strip, slices };
  });

  return {
    draw(ctx, time) {
      const offset = STRIP_WIDTH + (time / 18 % 1) * STRIP_WIDTH;
      const width = STRIP_WIDTH / SEGMENTS;
      ctx.save();
      ctx.clip(spindleMask, 'evenodd');
      for (const { strip, slices } of bands) {
        slices.forEach((triangles, i) => {
          for (const { path, transform } of triangles) {
            ctx.save();
            ctx.clip(path);
            ctx.transform(...transform);
            ctx.drawImage(strip, offset + i * width - 1, 0, width + 2, STRIP_HEIGHT, -1 / width, 0, 1 + 2 / width, 1);
            ctx.restore();
          }
        });
      }
      ctx.restore();

    }
  };
}


