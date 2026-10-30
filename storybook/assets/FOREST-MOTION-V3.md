# Forest scene — motion revision 03

Date: 2026-10-25. User request: reduce the scene scale, preserve the reference composition and make its movement as legible as the Hero theatre.

## Composition and assets

The contact scene is centered at `min(86%, 1480px, 160svh)` on desktop, with dark side margins and the original aspect ratio. Mobile keeps the complete composition at full width. Contact copy remains below the scene.

- `forest-path-clear.png`: original imagegen output, 1672 × 941, transparent sky. Copied from `C:/Users/Тёма/.codex/generated_images/01a16cfd-9145-7cb2-bc23-69498e48faac/exec-3d9054d5-9324-4fad-9f29-8b4a0c982507.png`.
- `forest-path-clear.webp`: registered delivery copy, 1672 × 941, 582796 bytes, alpha preserved. Only the central path patch is sampled at runtime; the rest of the approved painting stays unchanged.
- `imp-dance.webp`: existing four-pose theatre sprite sheet, reused without editing as a projected shadow.
- `stage-mist.webp`: existing painted mist, reused in two independent moving layers.

## Motion

The old painted devil shadow is replaced locally with the clear path. Four theatre poses are projected into its ground plane at a 1.8-second cycle, with soft edges, small distortion, face cutouts and surface grain. This avoids deforming the ground with the shadow. The girl's raised shoe is excluded from the shadow projection.

Girl, dress, ribbons and botanical characters use stronger local deformation, with the girl's hands and ribbon anchors held in place. These remain registered painted regions rather than separate skeletal sprites. The existing eleven eyelid masks remain active. A damped 13-second wind cycle drives plants, ribbons, drifting mist and seven falling leaves. Nine small fireflies and two flickering chapel windows add separate motion. Procedural clouds cross the sky faster than in revision 02.

The renderer remains capped at 30 fps and 1672 × 941. Existing offscreen, document visibility, intro/dialog, site pause and reduced-motion controls apply to all layers. Static original artwork remains the fallback if a texture or WebGL fails. No production dependency added. Frame-rate cap is a design limit, not a device performance measurement.

## Background edit prompt

Tool: built-in imagegen. Transparent background: true. Edit target: `forest-living-open.webp`.

Use case: precise-object-edit. Edit target: the supplied transparent-sky 1672 x 941 fairy-tale forest illustration. Make ONLY ONE LOCALIZED EDIT: completely remove the large grinning devil-shaped cast shadow from the central sandy path, approximately x430–900 y425–805. Reconstruct the empty amber moonlit sandy path naturally underneath, matching the existing ink and gouache texture, scattered small stones, leaves and lighting. It is crucial that this whole dark character silhouette, including its horns, head, face, arms, tail, body and feet, is gone. Do not remove normal small terrain shadows. Preserve absolutely everything else as closely as possible: the exact framing; girl, expression, pose, limbs, clothing and red ribbons; all tree branches and watching eyes; chapel and gravestones; gate; flowers, mushrooms, pumpkins and mist. Keep their exact pixel positions and dimensions. Keep the sky transparent exactly as in the input. Do not add a sky, moon, stars, background fill or any new character. Return one complete 1672 x 941 scene with true alpha sky openings, with only that central devil shadow removed. This is a registered background plate for animation, not a redesign.
