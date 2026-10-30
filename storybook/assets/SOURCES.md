# Asset sources

All assets are served locally. No runtime font service, analytics, or image CDN.

## Fonts

- Yeseva One, Google Fonts. Downloaded from `https://fonts.gstatic.com/s/yesevaone/v24/OpNJno4ck8vc-xYpwWWxpio.ttf`; SIL Open Font License in `YesevaOne-OFL.txt`, from `https://raw.githubusercontent.com/google/fonts/main/ofl/yesevaone/OFL.txt`.
- Manrope regular and bold copied from the existing portfolio (`assets/body.ttf`, `assets/body-bold.ttf`). License in `Manrope-OFL.txt`.

## Illustrations

Generated with built-in imagegen in this conversation, with the user's supplied/approved retro-cartoon Red Shoes image as the reference. WebP delivery copies were encoded with Sharp at quality 86, preserving alpha for the imp. Originals remain untouched in the conversation's generated_images folder.

- `forest.webp`: dedicated hero illustration with dark negative space on the left and girl, red ribbons, devil shadow, violin and watching trees on the right. Original: `exec-a54380fa-f95c-4bff-b5f4-c13383761305.png`.
- `imp.webp`: isolated transparent rubber-hose shadow guide. Original: `exec-15443afc-2aa1-48fe-850f-aab88ec0d67a.png`.
- `snow-queen.webp`: previously generated Snow Queen scene, used as an editorial cover for HeadHunter Agent. Original: `exec-09bd34e2-03c9-4172-b7ac-1f8ce8287ee5.png`.
- `mermaid.webp`: previously generated Little Mermaid scene, used as an editorial cover for Learny.ai. Original: `exec-eb8c7103-1454-4eb0-bd8b-cacf73977648.png`.
- `red-shoes.webp`: previously generated Red Shoes scene, used as an editorial cover for Yandex Music Bot. Original: `exec-2bc042ce-ed65-468f-8a89-cd5024f7e13b.png`.

The editorial covers illustrate the project stories; actual product functionality is described separately in the case dialogs.

## Current revised assets

### Current single botanical sprites

The Hero's bottom coal imps and flame spirits have been removed; the side trees remain. Outside the Hero, grouped flowers and mushrooms are replaced by single characters with two-frame blinking sheets: `flower-blink.webp` and `mushroom-blink.webp`, both 800 × 600 with alpha. Built-in imagegen source records and final prompts: [BOTANICAL-PROMPTS.md](BOTANICAL-PROMPTS.md). Blink intervals vary between 6.1 and 8.1 seconds; each blink lasts roughly 180–240 ms. Blinking and sway use the existing visibility, intro and motion pause controls.

Generated with the built-in imagegen tool; WebP files are stored alongside this document. No CLI image API was used. The original PNGs are under `C:/Users/Тёма/.codex/generated_images/01a16cfd-9145-7cb2-bc23-69498e48faac/`. Previous versions are retained but no longer loaded as the hero or guide.

- `hell-theatre.webp`: empty theatrical backdrop, 1672 × 941, 287 KB. Original `exec-91237e10-5b04-4383-9dd3-ac69d411dbbd.png`.
- `imp-dance.webp`: four equal sprite cells in a 2 × 2 transparent sheet, 1000 × 1000, 199 KB. Original `exec-e763c7b5-54a3-4aa3-ab9b-ff6ec4e39b42.png`.
- `violin-player.webp`: violin body, left arm and legs, transparent, 420 × 630, 48 KB. Original `exec-f4a7591c-8093-4b76-9e50-fc28f1597d25.png`.
- `violin-bow.webp`: separate bow, right glove and forearm, transparent, 600 × 400, 28 KB. Original `exec-2cd5323e-1ac4-443e-ad2a-c08fe479307e.png`.
- `imp-smile.webp`: corrected closed grin without a tongue, transparent. Original `exec-50b7b896-cadd-46a6-ac9a-8989a0e46e85.png`.
- `suspended-girl.webp`: girl with suspension ribbons, transparent. Original `exec-68ec446c-8f0e-4b23-8d29-265a5980eee6.png`.
- `forest-ribbons.webp`: previous forest hero with stronger red ribbons, retained as an alternative. Original `exec-379f081d-bd76-49b1-adcb-5bd8a13a90c1.png`.

Final prompts are recorded in [THEATRE-PROMPTS.md](THEATRE-PROMPTS.md). Fire is now procedural Canvas 2D geometry with changing contours, sparks and heat distortion; the previous repeated SVG flames are removed. Original music is composed in `theatre.js` and synthesized using Web Audio, with no sampled or licensed recording.

### Living stage revision

- `theatre-clean.webp`: cleaned backdrop without painted side drapes, smoke or flame tongues, 1672 × 941, 249 KB. Original `exec-e726e061-bd97-4b69-8fac-d7d79c7e62f3.png`. The upper valance, carved frame, floor and composition are preserved.
- `curtain-panel.webp`: independent opaque fabric with transparent surroundings, 720 × 1080, 228 KB. Original `exec-eb20302b-297f-43e8-92da-2c9edb15aaad.png`. Reused for the two fullscreen entry curtains; no longer overlaid on the Hero stage.
- `stage-mist.webp`: transparent painted violet smoke, 1100 × 733, 133 KB. Original `exec-9c1572c6-0602-4478-83fd-98294ede4bdd.png`. Two drifting depth layers reuse the same asset.

All three assets use built-in imagegen. Existing source files are retained. Shadows use the existing imp sprite's alpha silhouette, projected with CSS and synchronized with the dancer frames; no new image is required.

## Casino interlude — 2026-10-25

Six active built-in imagegen assets form the text-free interlude after the project theatre: a complete master, two registered Devil expressions, a roulette, transparent smoke banks, and a treasure atlas. The Devil now wears a red cape and has five digits on each glove in both facial cels and the fallback composition. Active WebP delivery totals 1,472,314 bytes; original PNGs and the earlier uncaped artwork remain in `output/casino-source/` and `assets/`. `casino-scene.js` adds procedural flames, embers, staggered falling treasure, laugh bursts, feathered smoke drift and depth parallax. The complete painting remains as a loading/error fallback. Motion follows the site's pause control, reduced motion, visibility, entry curtain and dialogs. Exact prompts, registrations and inventory: [CASINO-PROMPTS.md](CASINO-PROMPTS.md).

### Procedural 3D treasure — 2026-10-25

Coins, chips and dice now use original code-generated geometry and procedural materials in `casino-treasure-3d.js`, rendered with native WebGL. These meshes have no external model or texture source. The painted atlas remains in use for banknotes, ingots and fallback. Source contract, geometry counts and verification: [CASINO-3D.md](CASINO-3D.md).

## Project theatre hands — 2026-10-25

`work-hands.js` combines the approved open palm from `work-grasp-palm.webp` with the user's selected dorsal candidates 1 and 2: `work-hand-back-1.webp` (1312 × 1199, 233,218 bytes) and `work-hand-back-2.webp` (1536 × 1024, 310,828 bytes). Transparent alpha is preserved; original PNGs remain in `output/hand-variants/`. Each glove is registered to its cuff opening. The complete arms extend and retreat smoothly; fingers never change pose. There are exactly two left arms and three right arms (two on narrow screens). SVG dorsal gloves and frame tugging remain removed. Candidates 3 and 4 are unused. No new dependency. Prompts, provenance and registration notes: [WORK-GRASP-PROMPTS.md](WORK-GRASP-PROMPTS.md).

## Living forest contact scene — 2026-10-24

Motion revision 03 (2026-10-25): built-in imagegen removed the painted devil shadow from `forest-living-open.webp` to create `forest-path-clear.png` / `forest-path-clear.webp`. The four-pose `imp-dance.webp` sheet now supplies an independent projected shadow; `stage-mist.webp` supplies two moving atmospheric layers. Full source path, prompt and runtime details: [FOREST-MOTION-V3.md](FOREST-MOTION-V3.md).

The reference-faithful composition at `/assets/forest-master-preview.html` now also appears in the main contact section (integrated 2026-10-25). Its second iteration removes the violinist and adds local plant sway, tree/plant/girl blinks and restrained girl/shadow deformation. It uses two registered alpha plates generated with built-in imagegen. Source paths, exact prompts and animation constraints: [FOREST-LIVING-V2-PROMPTS.md](FOREST-LIVING-V2-PROMPTS.md). The sky remains procedural. The following earlier assembly and its assets are retained as historical iterations.

Built-in imagegen produced three transparent layers: `forest-tree-blink.webp` (1600 × 800, 328610 bytes), `forest-ground.webp` (1920 × 640, 355856 bytes), and `forest-grass.webp` (600 × 400, 98166 bytes). The reference was the existing `environment-tree.webp`. The girl, flowers, mushrooms and mist are reused. Source filenames and full prompts: [FOREST-WORLD-PROMPTS.md](FOREST-WORLD-PROMPTS.md). Original PNGs remain unchanged; delivery files are stored beside this document. CSS/SVG stars, a crescent and small windblown leaves supply independent atmospheric layers.

### Open work scene — 2026-10-26

The arched screenshot frame and tabs have been replaced by an open character vignette and two independent website previews. `work-girl-atlas.webp` is a transparent 1680 × 936, three-cell sprite atlas (339,428 bytes), generated with built-in imagegen using `suspended-girl.webp` as the character/style reference. One transparent padding column was trimmed from the 1681 × 936 original; each delivery cell is 560 × 936. Left / blink / right poses retain their painted silhouettes. The girl's recoil, gaze and existing reaching arms share one clock; reduced motion, pause, dialogs, background tabs and offscreen visibility stop movement. Full prompt, original PNG, preparation script, design contract and metadata are in `../../output/work-girl-source/`.

### Website showcase — 2026-10-26

`site-hrum.webp` and `site-prootdyh.webp` are format conversions of the existing portfolio screenshots in `../../assets/site-hrum.jpg` and `../../assets/site-prootdyh.jpg`. Original 1440 × 1000 dimensions and full image content are preserved; WebP quality is 92. Delivered sizes: 43,010 and 105,378 bytes. Project names, descriptions, technology lists and links come from `../../index.html` (`#websites`), cross-checked against `../../designer/src/main.js`. Both live website URLs returned HTTP 200 during integration. The storybook showcase now contains these two websites, with full screenshots, external website links and project dialogs; the decorative frame and reaching hands remain.

### Devil limbs and forest puppet — 2026-10-26

Six versioned imagegen assets add gray clawed hands to the casino Devil and separate the forest puppet from its scenery. The new giant hand, original girl cel, local eyelid patches, procedural connecting ribbons and falling tears share the existing forest clock. Original artwork is preserved. Asset contracts, dimensions, source inventory, animation behavior and verification: [FOREST-PUPPET.md](FOREST-PUPPET.md).

### Cemetery and botanical revision — 2026-10-24

The contact forest now uses ten additional built-in imagegen assets matched to `red-shoes.webp`: a textured night sky, chapel, cemetery, iron fence, pumpkins, green grass, ferns, and three botanical blink sheets (bluebell, golden chanterelle, purple inkcap). The existing daisy and red fly agaric remain, giving five distinct character designs. Plants occupy the verges and foreground corners; the winding path remains clear. The chapel, cemetery and fence are separate transparent scenery layers. Clouds, SVG moon, halo, stars, chapel window light and tree pupils/eyelids animate independently in code.

`forest-tree-rest.webp` is extracted from the closed-eye cell of the earlier tree sheet. Its body stays still during blinks; overlaid SVG eyes close and look around independently. The existing gust and suspended girl motion are preserved. All delivery assets together total 1,568,544 bytes. Exact dimensions, source paths and final prompts are in [FOREST-CEMETERY-PROMPTS.md](FOREST-CEMETERY-PROMPTS.md), with a machine-readable inventory in [forest-v2-assets.json](forest-v2-assets.json). Earlier PNG sources remain unchanged.

## Imagegen prompts for new website assets

### Woodland environment revision — 2026-10-24

Built-in imagegen, using `red-shoes.webp` as the style reference. Transparent WebP delivery assets:

- `environment-mushrooms.webp`: 600 × 500, 98,136 bytes. Source `exec-747b99b5-d401-4dec-a549-973047cc4e28.png`.
- `environment-flowers.webp`: 480 × 562, 81,834 bytes. Source `exec-4808e5f5-5748-46b1-b600-06ef0f9ec228.png`.
- `environment-tree.webp`: 650 × 1428, 274,716 bytes. Source `exec-8bf4f8a1-38e3-4b05-896a-c09f2814e4b2.png`.

Original PNGs remain in the generated_images directory listed above. Final prompts: [ENVIRONMENT-PROMPTS.md](ENVIRONMENT-PROMPTS.md). These are separate decorative layers around the Hero, work, guide and contact sections. Ambient sway pauses offscreen, while the intro is showing, when the document is hidden, and under the site's motion control or reduced-motion preference.

### Infernal Hero environment — 2026-10-24

Hero-only replacements generated with built-in imagegen, matching `imp-smile.webp`; the tree also uses the woodland tree as a composition reference. Full transparent alpha is preserved in WebP. The woodland illustrations remain in the work, about and contact sections.

- `hero-coal-imps.webp`: 600 × 500, 82,702 bytes. Source `exec-4fc32ae1-da16-4ee6-bde4-c968ba10065f.png`.
- `hero-flame-spirits.webp`: 480 × 562, 75,422 bytes. Source `exec-40e14f73-55d3-4452-b667-e07601a8e581.png`.
- `hero-infernal-tree.webp`: 650 × 1435, 269,548 bytes. Source `exec-c32de806-e2c8-43ff-a22a-cfeb43d9c4a9.png`.

Source PNGs remain under the generated_images directory listed above. Final prompts: [INFERNAL-PROMPTS.md](INFERNAL-PROMPTS.md). Existing Hero positioning, responsive sizes, scene fade and motion controls are reused.

### Forest backdrop prompt

Create a wide 16:9 cinematic hand-painted illustration for a premium artist/developer portfolio website, based very closely on the supplied reference's exact 1930s rubber-hose cartoon style, character design, distressed watercolor background and muted ink-purple, moon-cream, vermilion palette. This is a carefully recomposed WEBSITE HERO BACKGROUND, NOT a website mockup. NO TEXT, NO LETTERS, NO UI. Composition requirement: the entire LEFT 47% is very dark quiet dusky plum forest atmosphere, empty central space suitable for readable cream typography later; only faint silhouetted trees on extreme left and distant tiny chapel. Almost all narrative detail and lighting goes on the RIGHT 53%. On the right, the same charming anxious adult dark-haired cartoon woman in plum dress and red dance shoes is caught in long crimson ribbons from branches, reaching toward a crooked iron gate, BOTH FEET fully visible inside frame. On the winding path below her is a very clear grinning devil shadow that has independent long curling arms. The friendly animated violin musician and a few sweet but eerie eye-faced flowers occupy the lower right edge. Watching tree eyes near top right, pale crescent moon upper middle-right, violet mist at bottom. The woman, devil shadow, ribbons and violin must all be clearly distinct. Frame the world like an old theatrical cartoon film still. Flat cel-painted figures with ink outlines, rubber limbs, pie-cut eyes, white gloves, detailed matte gouache forest, fine authentic film grain. No photographic elements, no glossy 3D, no neon. Dark vignette, dramatic negative space on left, restrained quiet background. Keep the edges especially bottom organically dissolving into dark ink-plum #19151d for website integration. One beautiful cohesive frame.

### Imp

Create one isolated original cartoon shadow imp character for an interactive portfolio, on a genuinely TRANSPARENT background. Match the supplied image's adorable-but-sinister 1930s rubber-hose character design exactly: dark ink-plum charcoal body with film grain, thin bendy limbs, small horns, pie-cut cream eyes, huge toothy cream grin, cream white gloves, curved pointed tail, playful old animation cel style, imperfect thick hand-inked outline. Full body in portrait 3:4 framing. The imp stands leaning sideways in a theatrical bow, one hand raised as though introducing a story, other hand behind back, one foot crossed over the other. He is made of darkness and looks like the independent devil shadow on the path in the reference, but friendly enough to be a mischievous portfolio guide. Simple iconic silhouette, visible from small size, no scenery, no letters, no extra objects, no ground plane, no cast shadow outside the character, no frame, no 3D. Delicate distressed ink texture, limited palette of near-black plum, warm cream, tiny muted red inner mouth. Character fills 85% of the image with enough padding for all fingers, horns and tail.
