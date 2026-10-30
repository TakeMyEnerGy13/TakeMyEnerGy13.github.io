# Devil limbs and forest puppet — 2026-10-26

Current layout: a standalone hand-and-girl installation centered in the footer, with a transparent background. Its desktop width is now up to 1040px (previously 620px), without a viewport-height restriction; mobile retains the complete composition at 94% width. The forest, sky, chapel, plants, weather and ground shadow are removed from the live contact block. The earlier forest composition is retained in `../../output/puppet-isolated-before/` and its artwork remains available. No raster asset was changed for this layout correction.

## Asset contract

Built-in imagegen edited the existing illustrations using the user's gray, clawed Devil reference. The casino keeps its red cape, five digits per hand, composition and animation; only the forearms and hands change to charcoal fur and bare gray paws. Both expression cels and the complete static fallback use the new design.

The earlier forest revision separated the girl from the scenery. `forest-puppet-ground.webp` remains preserved but is no longer loaded by the live contact block.

| Delivery file | Dimensions | Role |
| --- | --- | --- |
| `casino-devil-claws.webp` | 1672 × 941 | Open-eye Devil cel |
| `casino-devil-claws-laugh.webp` | 1672 × 941 | Closed-eye laugh cel |
| `casino-master-claws.webp` | 1672 × 941 | Complete casino fallback |
| `forest-puppet-ground.webp` | 1672 × 941 | Forest without the puppet |
| `devil-puppeteer-hand.webp` | 1774 × 887 | Separate giant hand |
| `suspended-girl-blink.webp` | 900 × 1350 | Only the two closed-eye regions are sampled |

The original `suspended-girl.webp` remains the body cel. Generated originals, exact prompts, source paths and sizes are retained in [the source inventory](../../output/puppet-source/inventory.json). Pre-change source files are saved in `../../output/puppet-source/before/`. Earlier artwork is not overwritten.

## Registration and motion

Original world registration is preserved; the standalone view is `(800, -190, 1000, 1110)`, framing only the hand and girl. Hand rectangle: `(760, -175, 1000, 500)`; pivot `(1660, -140)`. Girl rectangle: `(985, 91.111111, 500, 750)`; pivot `(1230, 215)`. The upper ribbons are clipped at world Y=330, corresponding to source Y=430. Five painted ribbon strands are continued with curved, outlined red paths. Their endpoints follow the girl transform, while their two upper attachments follow the hand. The hand occludes the path ends, with a small visible wrap around each supporting claw.

The girl swings as one rigid cel, with mild changes in amplitude. Blinking replaces only two eye patches; it does not dissolve or deform the face. A blink lasts 0.21 seconds and repeats every 6.7 seconds. Tears form on alternating cheeks, release after 1.05 seconds, fall independently under gravity, and fade. The tear cycle lasts 10.7 seconds with a 2.8-second active interval.

`forest-puppet.js` now owns a single Canvas 2D loop capped at 30 fps. It stops offscreen, in hidden documents, behind site dialogs/the intro, under reduced motion and with the site pause control. Rendering is capped at 1200 pixels wide. Static SVG layers remain available while images load or if Canvas 2D is unavailable. The live page no longer loads `forest-master.css`, `forest-master-preview.js` or `forest-master-motion.js`; the independent forest preview retains them. No dependency or audio change is introduced.

## Verification

- `npm run check`: syntax checks pass, including both new modules.
- `npm run test:puppet`: four tests pass for attachment registration during gusts, bounded swing/deterministic paused poses, standalone blink timing and tear timing/alternating eyes.
- Standalone installation checked in the browser at 1600 × 1200, 872 × 869 and 390 × 844; no horizontal overflow. Desktop width reaches 1040px.
- Pause switches the standalone animation to `paused`; resuming restores `running` and changing swing angles. Tears were observed forming in the standalone scene; eyelid cels and falling tears were visually verified in the earlier layered version.
- No browser warnings or errors in the checked session. No forest layers remain in the live contact DOM.
- Current screenshot: `../../output/puppet-isolated-large.png`. Earlier composition screenshots and original artwork remain preserved.
