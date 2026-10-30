# Casino interlude — 2026-10-25

Current limb revision (2026-10-26): the live scene and fallback now use `casino-devil-claws.webp`, `casino-devil-claws-laugh.webp` and `casino-master-claws.webp`. Gray bare clawed hands and shaggy charcoal forearms replace the gloves; the cape and five digits remain. See [FOREST-PUPPET.md](FOREST-PUPPET.md) for registration, generated sources and verification. Earlier cape-only assets below remain preserved.

Generated with built-in imagegen. The user's roulette, coral-fire and cobalt-smoke reference defines the composition and palette; the existing imp-smile.webp defines the cartoon ink style. The complete master was generated first, followed by five transparent layer exports. No visible text or new controls are added.

## Delivery and source files

All delivery assets are in this directory. Original generated PNGs are copied unchanged to ../../output/casino-source/. That directory also contains inventory.json with original paths, dimensions, alpha status and delivery sizes.

| Asset | Dimensions | Bytes | Role |
| --- | --- | --- | --- |
| casino-master-cape.webp | 1672 × 941 | 280958 | Complete composition and loading/error fallback |
| casino-devil-cape.webp | 1672 × 941 | 240442 | Red-caped, five-digit open-eye character cel |
| casino-devil-cape-laugh.webp | 1671 × 941 | 226630 | Registered laugh cel with closed eyes |
| casino-roulette.webp | 1672 × 941 | 214032 | Independent foreground roulette |
| casino-smoke.webp | 1672 × 941 | 227104 | Transparent smoke banks |
| casino-treasure.webp | 1774 × 887 | 283148 | 4 × 2 atlas: two coins, two notes, two chips, ingot, die |

## Scene assembly

The canvas world is 1672 × 941. Devil registration: (216, 4), width 1240; waist pivot (836, 620). Roulette registration: (167, 180), width 1338. These compensate for the generator's recentering of the extracted sprites. The two Devil cels share the same registration and alternate only during the laugh burst. The entire silhouette moves gently around its waist; fingers and joints are never morphed.

The runtime uses a soft background glow, distant painted smoke, three independently contoured procedural fire layers, rising embers, rear treasure, Devil, middle treasure, wheel/contact shadow, two overlapping feathered foreground smoke banks and front treasure. Money falls in side lanes that preserve the face. Painted shadows on the wheel are supplemented by a soft grounding shadow and reflected fire glow. Subtle pointer parallax uses different offsets per depth.

Rendering is capped at 30 fps and 1800 pixels wide. Transparent assets load within 700px of the viewport; animation stops offscreen, in hidden documents, behind the entry curtain/dialogs, with reduced motion and with the existing site pause control. The complete master remains visible until all layers are ready. Desktop width is min(94%, 1540px, 170svh); mobile keeps the complete composition at full width. No dependency or new audio is added.

## Cape and five-digit hands revision — 2026-10-25

Built-in imagegen edited the existing Devil sprite to add a red cape and exactly five digits on each glove (one thumb and four fingers). A second registered facial cel preserves the same cape and hands. The complete fallback composition received the same costume and anatomy correction. Original uncaped assets remain available; the live scene now loads the three versioned assets below. Roulette, fire, smoke, particles, layout and animation timing are unchanged.

- [casino-devil-cape.webp](casino-devil-cape.webp): 1672 × 941, alpha, 240442 bytes.
- [casino-devil-cape-laugh.webp](casino-devil-cape-laugh.webp): 1671 × 941, alpha, 226630 bytes. Canvas rendering uses the same explicit destination rectangle for both cels.
- [casino-master-cape.webp](casino-master-cape.webp): 1672 × 941, opaque, 280958 bytes.

Original PNGs: ../../output/casino-source/devil-cape.png, devil-cape-laugh.png and master-cape.png. Source paths and metadata: ../../output/casino-source/cape-inventory.json.

### Cape and hands edit prompt

Use case: precise-object-edit.
Edit target: the supplied transparent Devil animation sprite, on its existing 1672 × 941 canvas.
Make exactly TWO changes:
1. Add a rich vermilion-red theatrical cape with darker crimson folds, matching the existing ink outlines, distressed gouache grain and warm coral rim light. A modest raised collar sits BEHIND his neck and shoulders, never obscuring his face, ears or goatee. The cape is open at the front, draped behind the shoulders and both arms, flowing down to his waist. Keep the black chest visible. No accessories beyond the cape.
2. BOTH cream-gloved hands must each have exactly FIVE clearly readable digits: ONE raised opposing thumb plus FOUR separate long rounded fingers extended sideways, with visible separation and distinct fingertips. Count all five on each hand. Preserve the existing welcoming outstretched hand gesture, cuff positions and overall hand size; add the missing finger. Left hand extends toward the left; right hand extends toward the right. These are five-digit gloves, NOT the usual four-digit rubber-hose cartoon hands.
Keep EVERYTHING ELSE unchanged: same Devil identity, open eyes, laughing open mouth and teeth, horns, ears, goatee, body shape, arm pose, wrist coordinates, full canvas, scale and exact placement. Do not recenter, crop, zoom, change head expression, move the arms, add legs or create a background. Preserve actual transparent alpha around the character and cape. No roulette, fire, smoke, coins, text or other scenery. This sprite must register directly over the existing one in an animated website scene.

### Laugh cel edit prompt

Use case: precise-object-edit. Create the second animation cel from this EXACT transparent red-caped Devil sprite. Change ONLY his facial expression: close both eyes into joyful crescent curves during a hearty laugh, with the open mouth laughing slightly wider. Keep the mouth visibly open, upper fangs and tongue inside. Preserve absolutely everything else pixel-aligned: EXACT same 1672 × 941 canvas, horns, ears, goatee, cape silhouette and folds, chest, arms, cuffs, palms, all FIVE digits on EACH hand (one thumb and four fingers), position, scale, outlines, colors, grain and lighting. Do not redraw or move either hand or the cape. Do not recenter, crop, zoom, tilt the head or alter the pose. Preserve real transparent alpha. Only eyes and the inside of the open mouth change so the two cels can alternate without the body jumping.

### Complete composition edit prompt

Use case: precise-object-edit. Image 1 is the EDIT TARGET: the complete casino illustration. Image 2 is the exact new Devil costume and hands reference. Change ONLY the Devil in image 1: dress him in the same red theatrical cape and raised collar from image 2, and give EACH of his two cream-gloved hands exactly FIVE distinct digits (one thumb plus four fingers), matching image 2. Keep the Devil's original position, scale, pose, horns, open eyes and laughing face from image 1. The cape stays behind his arms and behind the roulette, with rich red folds and a black visible chest. Preserve all other pixels/content as closely as possible: exact roulette position, perspective and spindle; every existing banknote, coin, chip, die, ingot; blue smoke banks; coral fire; background; colors and grain; exact 1672 × 941 framing. No new elements, no rearrangement, no text. This is a minimal costume and hand-anatomy correction to the existing finished composition.

## Procedural 3D treasure revision — 2026-10-25

The live scene now replaces the atlas coins, chips and dice with separate native WebGL meshes from `casino-treasure-3d.js`. Bills and ingots still use the original atlas, which is also retained as the WebGL fallback. Original generated art and prompts below remain unchanged. Geometry, lighting, integration, verification and preview are documented in [CASINO-3D.md](CASINO-3D.md).

## Original generation prompts

### Master composition

Create one cinematic wide 16:9 illustrated composition for a text-free website interlude. Reference 1 supplies the roulette, coral flames and deep indigo smoke composition. Reference 2 supplies the hand-inked 1930s rubber-hose cartoon drawing style, cream gloves, plum-black ink and paper grain. This is a dark fairy-tale CASINO vignette, not a website mockup. A magnificent large roulette wheel fills the lower center, seen in dramatic three-quarter perspective, black lacquer rim, brass/cream inlay and coral/ink alternating wedges, prominent central spindle. BEHIND the roulette towers the true Devil, a grown powerful cartoon showman with long ivory curved horns, pointed ears, black fur/plum body, a small pointed goatee, huge cream gloves, sharp playful eyebrows and a wicked JOYOUS OPEN-MOUTH LAUGH. His eyes are gleefully narrowed, upper teeth and a separate dark open mouth clearly drawn; tongue only inside the OPEN mouth. Both hands spread outward at shoulder level as though showering his treasure. His head is centered around x50% y26%, horns reach y7%, shoulders y43%, waist hidden behind wheel at y62%. His silhouette must be readable and separate from the wheel. Broad coral-red stylized flames rise behind his shoulders, warm reflected light below. Chunky curling cobalt/indigo smoke frames both sides and rolls across the foreground; some smaller wisps create depth. A few gold coins, folded green banknotes, poker chips, small golden ingots and dice fall through the space around him, never obscure his face. Restrained near-black plum background, warm coral fire, midnight blue smoke, muted jade and gold accents. Matte hand-painted gouache and authentic distressed fine film grain; bold imperfect ink outlines, rich shadows and layer overlap. Match the references, no glossy plastic 3D. No words, no letters, no logos, no title, no UI, no frame. Beautiful cohesive silhouette with deep soft dark edges for website blending, no scenery outside this single self-contained infernal casino stage.

### Devil

Extract only the large laughing Devil from this exact composition, as a clean transparent animation layer. Preserve the exact same full 16:9 canvas, character scale, pose and placement: head centered above the roulette, long ivory horns, dark plum-black body, pointed goatee and ears, both outstretched cream gloves. Keep the magnificent OPEN laughing mouth, teeth and tongue entirely inside the open mouth, same eyes and expression, original fine gouache grain and coral rim lighting. Remove roulette, fire, smoke, ALL coins/chips/dice/money, and all background. Reconstruct the small obscured lower torso down to the waist as a simple dark taper under the roulette, ending around y72%; no legs. Do not add anything. Full character isolated with actual transparent alpha; do not move or recenter the character inside the canvas. No text.

### Roulette

Extract only the roulette wheel from this exact composition, as a transparent foreground animation layer. Preserve exact same 16:9 canvas, wheel perspective, size, position and central spindle. The wheel occupies the lower center, spindle rises from it. Reconstruct the portions of the outer rim currently hidden by smoke so it is a complete coherent wheel, retaining same lowest position. Preserve dark black lacquer, cream/brass thin rings, red/ink alternating wedges, painterly grain and warm coral reflection. Remove Devil, all hands/body/tail, flames, smoke, coins, chips, dice, banknotes and all background. Absolutely only the roulette wheel and its spindle, no extra ground shadow. True transparent alpha, no text. Do not enlarge or recenter.

### Smoke banks

Extract ONLY the blue-indigo clouds and smoke from the supplied composition into a transparent layered-animation plate. Same 16:9 canvas, exact same cloud placement: curling wisps at far left and far right, generous billowing cloud banks on both sides and along the very bottom, center and upper center remain completely transparent. Remove the Devil, roulette wheel, all fire, ALL money/coins/chips/dice/gold, and black background. Reconstruct cloud shapes behind removed small objects. Retain the saturated cobalt blue and violet, subtle pink-lit upper rims and fine grain. Matte gouache illustrated smoke, no photographic vapor. Smooth feathered transparent outer edges, genuine alpha. Only smoke, no remaining objects, no letters.

### Treasure atlas

Create a clean sprite atlas of the small treasures in the reference, same ink-and-gouache 1930s cartoon style, warm ivory/coral reflected light and fine paper grain. True transparent background. EXACT 4 columns by 2 rows of equal invisible cells, all eight items centered with ample 20% empty padding and completely separated. Top row: one golden coin face-on with a decorative star symbol, one tilted golden coin with visible ridged edge, one curled green banknote with oval ornament and no writing, one differently folded green banknote. Bottom row: one red/black poker chip, one blue/cream poker chip, one small gold ingot, one ivory die in three-quarter view with black pips. No labels, no text, no other items, no shadows outside the objects, no divider lines, no scenery. Eight separate small sprites total. Keep the same lighting and illustration style as the reference; make each silhouette easy to read when small.

### Laugh cel

Create a second animation cel from this exact transparent Devil sprite. Keep the SAME canvas dimensions, placement, scale, silhouette, horns, ears, arms, hands, body, lighting and grain completely unchanged. Change ONLY the facial expression: both eyes squeeze shut into cheerful crescent curves during a hearty laugh; the open mouth laughs a little wider, retaining a clearly OPEN dark mouth cavity, upper fangs and tongue entirely inside. No new objects. This must align with the original sprite for a short two-cel laugh animation. Do not recenter, zoom, crop, rotate, move the head, or change the pose. Preserve transparent alpha background.
