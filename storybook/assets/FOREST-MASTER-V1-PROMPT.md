# Forest master composition — iteration 01

Date: 2026-10-24. Built-in imagegen; no CLI/API fallback.

This is a composition study before extracting individual actors. The existing website scene is retained until this composition is reviewed. One coherent illustrated plate preserves the supplied reference layout; only the sky opening is transparent. The preview renders a procedural SVG sky, grain, clouds, stars and crescent behind the plate. No independent sprite extraction was performed in this iteration.

- Reference: `C:/Users/5CD9~1/AppData/Local/Temp/codex-clipboard-4f480ee5-f7af-4963-b9bd-30ed829e2e8a.png`
- Original generation: `C:/Users/Тёма/.codex/generated_images/01a16cfd-9145-7cb2-bc23-69498e48faac/exec-7a969af2-10a2-481a-b039-27541f70e793.png`
- Workspace master: `storybook/assets/forest-master-v1.png` (1672 × 941, RGBA).
- Preview delivery: `storybook/assets/forest-master-v1.webp` (1672 × 941, 804572 bytes, alpha preserved).
- Procedural preview: `http://127.0.0.1:4181/assets/forest-master-preview.html`

## Final prompt

Use case: illustration-story.
Asset type: ONE finished wide 16:9 master composition for a gothic cartoon website scene, with a transparent sky opening for a procedural sky behind it.
Input image: the attached image is the strict composition, character, art-style, palette and mood reference. Recreate it extremely closely; do not invent a new layout.
Keep the same cinematic framing: two massive gnarled watching trees at the extreme left and right with branches arching across the top; a small crooked stone chapel and cemetery in the upper-left middle distance; a winding warm earthen path from the chapel through the center to the bottom; the large playful sinister devil SHADOW on the path; the anxious adult dark-haired cartoon woman in her plum dress and bright red shoes occupying the right half, caught in long crimson ribbons tied to the upper branch, reaching toward the crooked iron gate on the right. Preserve the readable red ribbon paths and the woman's graceful tilted pose, not a symmetrical hanging puppet pose. Preserve the anthropomorphic violinist at lower left, a few cream daisy characters and red mushroom characters along the edges, orange pumpkins in the bottom corners, restrained blue-violet ground mist and sparse forest plants. Keep the path clear. Match the reference's relative sizes, positions and perspective very faithfully.
Style: 1930s rubber-hose cartoon cel characters with pie-cut eyes, dark imperfect ink outlines, warm cream skin, matte detailed gouache and watercolor scenery, subtle aged film grain, deep ink-plum shadows, dusty violets, soft moonlit ochre and crimson accents. No glossy rendering, no flat modern vector look, no neon, no new characters, no UI or text.
IMPORTANT SKY TREATMENT: remove ONLY the distant sky and the moon, leaving genuinely transparent alpha in the open sky between branches, chapel roof and distant cypress silhouettes. No painted sky, no stars, no clouds, no moon, no checkerboard. The fully finished foreground, girl, trees, cemetery, chapel, plants, path, mist and gate stay opaque, with clean natural alpha silhouettes against the sky opening. The distant cypress silhouettes remain part of the composition. The sky and moon will be rendered procedurally behind this single composition plate in code. Do NOT split objects into a sprite sheet. ONE coherent, complete illustration plate.
