# Living composition — iteration 02

Date: 2026-10-24. Built-in imagegen; no CLI/API fallback.

The approved composition is retained in the existing preview at `/assets/forest-master-preview.html`. The violinist is removed. On 2026-10-25, this composition was integrated into the main portfolio contact chapter, replacing the earlier assembled forest.

## Assets

- `forest-living-open.png`: 1672 × 941 original edited plate, copied from `C:/Users/Тёма/.codex/generated_images/01a16cfd-9145-7cb2-bc23-69498e48faac/exec-d7de6192-31af-489b-9ac7-ce66bf736417.png`.
- `forest-living-open.webp`: 1672 × 941, 705552 bytes, alpha preserved.
- `forest-living-blink.png`: 1671 × 941 original closed-eyelid frame, copied from `C:/Users/Тёма/.codex/generated_images/01a16cfd-9145-7cb2-bc23-69498e48faac/exec-fd1444f3-535e-4092-8c5d-dd17056fe132.png`.
- `forest-living-blink.webp`: delivery frame normalized to 1672 × 941 for registration, 590636 bytes, alpha preserved.

## Motion

The two paintings are sampled through separate local masks in `forest-master-motion.js`. Only eye regions use the closed frame; all other scenery stays on the open plate. Eleven independently scheduled blinks cover the girl, three tree eyes, four flowers and three mushrooms. The blink lasts 210 ms, with staggered intervals.

Small inverse image deformations animate plants from their roots, the girl's body about her hands at the gate, and the shadow along the path. This preserves the approved layout without cutting out and repositioning characters. It is deliberately limited to subtle motion; larger independent character animation would require separated sprites and reconstructed scenery.

The sky remains procedural SVG. The renderer is capped at 30 fps and at the original illustration resolution. Main page and standalone preview share `forest-master.css`, `forest-master-preview.js` and `forest-master-motion.js`. The site's existing motion control, entry/dialog state, hidden-page pause, offscreen pause and reduced-motion preference control the integrated scene. Only the standalone preview has its own motion button. The still plate remains visible if WebGL or image decoding fails. No production dependency was added.

`forest-contact.css` preserves the complete 1672 × 941 composition at every viewport, with a soft edge into the page. Contact text and actions sit below the illustration, side by side on desktop and stacked on mobile. The earlier forest files and source paintings are retained for reference.

Revision 03 now adds a separately projected dancing shadow, a generated clear-path patch, stronger wind response, drifting mist, leaves, fireflies and candle flicker. See [FOREST-MOTION-V3.md](FOREST-MOTION-V3.md) for the current implementation and exact asset prompt.

## Final removal prompt

Edit target: the supplied 1672 x 941 transparent-sky composition.
Make exactly ONE localized change: completely remove the anthropomorphic violin musician and its bow, gloves, arms, legs and shoes from the lower-left middle ground (approximately x90–375, y350–670). Reconstruct the forest floor, rocks, small sparse plants, mist and cemetery scenery naturally behind it. Do not replace the musician with any character or focal object.
Preserve the rest of the image as precisely as possible: same framing and exact positions, scales, silhouettes, colors and details of the woman, all red ribbons, devil shadow, tree eyes, all flowers and mushrooms, chapel, gravestones, iron gate, pumpkins and sky-opening edges. Do not redraw or reposition any of these. Keep the full 1672 x 941 canvas and its original composition. Keep the sky transparent, exactly as in the input. No moon, no stars, no painted sky. Same ink and gouache texture. No new elements. Return the single full edited composition.

## Final blink prompt

Precise animation-frame edit of the supplied 1672 x 941 illustration. This image is a registered animation frame; preserve every pixel position, canvas size, character pose, face contour, lighting, color, scenery and transparency as closely as possible.
CHANGE ONLY EYELIDS: close both eyes of the girl naturally, close the eyes of the two cream daisy characters at lower left, the two cream daisy characters beside the gate at lower right, the two red mushroom characters at lower left and the one large red mushroom at lower right. Replace their open pie-cut eyes with natural curved closed eyelid lines in the same hand-inked retro cartoon style, filled with their existing cream face tone. Keep their mouths, noses, hair, petals and caps exactly unchanged.
Also close the watching eyes embedded in the trees: two on the far left trunk and the one at upper right. Their eyelids are dark textured bark drawn shut, a slim curved seam, not cream circles and not bright new eyes. Preserve the exact eye sockets and surrounding bark. All eyes in these specified faces should be fully closed in this one frame. The devil shadow is untouched and its eyes stay as-is.
No other changes. Do not redraw or move anything, do not add characters. Keep the sky transparent. Keep the musician absent. One full-frame closed-eye image, not a sprite sheet, not a collage. Same exact 1672 x 941 framing as the input.
