# Casino treasure — procedural 3D, 2026-10-25

Coins, poker chips and dice are independent triangle meshes rendered with native WebGL. The existing composition, falling paths, three depth passes, red-caped Devil, roulette, smoke and fire are preserved. Bills and ingots continue to use the painted atlas. No production dependency was added.

## Editable source and geometry

`casino-treasure-3d.js` is both editable source and delivery module. There is no external model or texture download. `casino-scene.js` supplies each object's position, size, depth, opacity and shared animation time.

| Shared mesh | Vertices | Triangles | Vertex buffer bytes |
| --- | ---: | ---: | ---: |
| Coin | 4020 | 1340 | 144720 |
| Poker chip | 2304 | 768 | 82944 |
| Rounded die | 5184 | 1728 | 186624 |

The three unindexed buffers total 414288 bytes. Vertex layout is position 3, normal 3, UV 2 and face-mark index 1, all Float32. CPU geometry is retained for context restoration. Pivots are centered; rotations use three axes and perspective projection. Winding faces outward and normals have unit length.

Coins have a thin beveled solid profile, a raised rim and a geometric star on both faces. Chips are thicker, with a beveled edge and procedural cream sectors. Dice use rounded geometry; opposite pip counts sum to seven. Pips are procedural material detail, not holes cut into the mesh.

The existing scene configuration creates 13 coins, 5 chips and 2 dice: 24716 model triangles and 20 model draw calls across three depth passes. These are calculated configuration counts, not GPU-profiler measurements. Eight banknotes and two ingots remain sprites.

## Rendering contract

Materials use warm animated underlight, a cream key light, a faint blue fill, restrained highlights, silhouette shading and stable object-space grain. All materials are procedural. Depth testing, back-face culling and premultiplied alpha are enabled. The transparent WebGL canvas is composited into the existing scene canvas behind the Devil, between the Devil and roulette, and in front of the smoke.

The WebGL surface is capped at 1500 pixels wide. Rendering uses the existing 30 fps scheduling cap; there is no separate animation loop. Site pause, reduced motion, offscreen visibility, hidden documents, entry curtain and dialogs therefore use the same clock and controls as the rest of the casino. Actual device FPS has not been benchmarked.

`data-treasure-renderer` on `.casino-scene` exposes `webgl` or `sprites` for inspection. Missing WebGL or a lost context selects the original painted treasure; restoration rebuilds shaders and buffers. The original `casino-treasure.webp` and its PNG source remain untouched and are still required for banknotes, ingots and fallback rendering.

## Verification and preview

- `npm run test:casino`: seven passing tests for finite geometry, nondegenerate outward triangles, normals, die face counts, coin thickness, rotation matrices and unavailable-WebGL fallback.
- `npm run check`: syntax checks pass, including both casino modules.
- Main scene checked at 1846 × 1000 and 390 × 844 with WebGL active and no horizontal overflow. Pause/resume checked through the existing site control.
- Actual `WEBGL_lose_context` loss/restoration checked in the local model preview: `webgl` → `sprites` → `webgl`.
- Browser console: no errors or warnings in the checked main scene.

Local model preview: `/output/casino-3d-preview.html`. It shows large models and test-only rotation/context controls; these controls are not added to the portfolio.

Screenshots: `../../output/casino-3d-desktop.jpg`, `../../output/casino-3d-mobile.jpg`, `../../output/casino-3d-props.jpg`.
