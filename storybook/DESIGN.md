# A slightly dark story

An independent portfolio direction based on the user's Red Shoes illustration. The existing root portfolio is preserved. Content and contact destinations come from its index.html.

## Visual contract

- Ink `#19151d`, forest `#24202c`, fog `#aaa0b1`, paper `#ddceb5`, moon `#f2e4c9`, ribbon `#c75149`.
- Yeseva One for Cyrillic storybook titles; locally hosted Manrope for readable descriptions and controls. Display sizes 48 / 64 / 96, body 16 / 20, labels 12 / 14.
- Space scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128.
- Four consecutive chapters: animated infernal theatre, project stories, the author, invitation to contact. Normal browser scrolling; direct chapter navigation always available.
- An antique proscenium frames three dancing imps, painted cavern arches and separate flames. Center the existing scene within a symmetrical dark vignette, with the title above and the journey ticket below. Preserve the original painted scenery, including its upper valance. A winding red thread joins the chapters and suspends the girl in the footer. Lower sections use more negative space. No game HUD, score, fake progress counters, scroll hijacking, or invented portfolio results.
- Four drawn poses make the dance; independent fire and ember layers give depth. Click an imp to make it jump. Subtle pointer parallax is limited to precise pointers. Offscreen/hidden scenes pause. Motion control and system reduced-motion stop decorative motion. The violin is a persistent music switch; its bow moves only while the user-selected original synthesized waltz plays.
- Remove decorative micro-labels, numbered chapter kickers, redundant tags and instructions. Keep meaningful controls and readable descriptions. Closed-grin characters must not show a contradictory tongue.
- The separate side-curtain overlays and pull cord are removed from Hero. Reuse the cloth asset only in a fullscreen entry: black film title `.TakeMyEnerGy`, a dissolve to closed burgundy fabric, then a cinematic split on click or Enter/Space. Allow skip/Escape at any point. Use native dialog focus containment; return focus to the hero heading after entry. Deep links to other chapters bypass entry, and navigation within the page never replays it. Motion preferences make entry instantaneous. No extra runtime library or regenerated scenery.
- Entry has no visible central button or caption. The cloth itself is interactive, with an accessible button layer and a grab cursor. Render the existing painted material on two deforming WebGL meshes: slow fabric waves, restrained pointer response, fold lighting, and a curved opening that pulls the upper rows before the hem. Preserve the illustrated velvet rather than introducing glossy plastic. Keep the CSS version as a fallback and release graphics resources once entry finishes.
- Fire changes contour procedurally inside the arches, with restrained heat distortion, sparks, floor lighting and two drifting painted mist layers. Keep the period illustration palette; avoid a photorealistic fire simulation or bright neon bloom. Ground each dancer with a soft projected silhouette and a small contact shadow. Both follow the pose and jump height; remove hard offset sprite drop shadows.

```text
 [wordmark]                  [works / author / map]
 [          centered story title             ]
 [      cavern, flames and dancing imps      ]
 [             journey ticket               ]
 -------- a red thread leads down ----------------
 [chapter intro]         [project-selection context]
 [         illustrated project theatre           ]
 [three project tabs]    [description + open case]
 [imp on paper]          [author + experience]
 [       full-width living forest scene       ]
 [contact invitation]    [telegram / email]
 [footer]                [violin music switch]
```

Review: a generic grid of equally styled project cards would dilute the journey. Use one theatre with three genuinely distinct scenes, meaningful project tabs, and readable case details. Keep the fairy-tale illustration separate from claims about actual product interfaces.

## Cardboard interface

Use theatre props as the interface material: cut ticket buttons, paper project tabs, a printed programme for project dialogs, a folded paper route map, and an ink-framed chapter index. Retain Yeseva and Manrope, the current text, scene layouts and palette. Add only material tokens for dark cut edges and brown paper stock. Fine fibrous grain belongs to paper surfaces, never a layer that reduces text contrast. Slightly irregular outlines and short hard shadows represent ink and cardboard thickness. Red stock identifies selected tabs and primary contact actions. Hover lifts a paper control by 2px; press seats it against its edge. Keyboard focus stays clearly visible and motion preferences remove movement. Do not add decorative captions, UI animations on a loop, extra cards around prose, or additional scene characters.

The composition stays: scene -> paper project selector -> illustrated author page -> contact invitation. The art remains the focal point; material treatment makes controls feel part of the same cartoon world. All new styling is scoped to the interface in assets/paper-ui.css, leaving the cinematic entry curtain intact.

Two rubber-hose arms emerge from the left of the project theatre and three from the right (two on narrow screens). Keep the three painted glove poses fixed: the approved widely splayed palm and selected dorsal candidates 1 and 2. Dorsal 1 is at upper right; dorsal 2 is at lower left and lower right, alternating with the palm. Animate only the complete arms: slow staggered extension and retreat, a small vertical drift and subtle wrist rotation. Never animate individual fingers, swap glove cels or tug the project frame. Align the flexible SVG forearms to each sprite's cuff pivot and orientation. Pause offscreen, behind dialogs and entry, in hidden documents, under reduced motion and with the site pause control. Keep the project title and actions unobstructed; the decorative artwork never captures clicks. Candidates 3 and 4 remain unused in output/hand-variants. Implementation: assets/work-hands.css and assets/work-hands.js. Artwork and original generation prompt: assets/WORK-GRASP-PROMPTS.md.

## Casino interlude

After the full project theatre and before About, place a text-free, softly faded 16:9 casino scene. Preserve the reference's black roulette, coral fire, cobalt smoke and grainy cartoon finish. A larger horned Devil laughs behind the wheel. His two registered expressions and whole-body motion stay separate from the roulette, procedural flames, falling coins/notes/ingots/chips/dice and independently drifting smoke banks. Keep the face readable and money in side lanes. No heading, caption, CTA or new chapter navigation item. Scale the full composition to the viewport; pause through existing motion, visibility and dialog controls. Assets, exact prompts and runtime registrations: assets/CASINO-PROMPTS.md. Implementation is scoped to assets/casino-scene.css and assets/casino-scene.js.

## Asset handling

The contact chapter uses the approved reference-faithful forest composition, shared with assets/forest-master-preview.html. Preserve its complete 1672 × 941 framing: chapel and cemetery at left, a clear moonlit path and devil shadow through the center, the girl on red ribbons at right, watching trees, flowers, mushrooms and foreground pumpkins. The violinist is absent from this illustration; the site's existing music switch is unchanged. A soft edge blends the artwork into the ink background. On desktop, center it at min(86%, 1480px, 160svh) so dark margins frame the scene; on mobile preserve full width and the complete aspect ratio. Place the invitation and contact actions below the scene, in two columns on desktop and one column on mobile, without covering the art.

Procedural SVG supplies the sky, moon, drifting clouds and stars. Two registered painted plates supply local eyelid animation: eleven independently scheduled blinks for the girl, tree eyes, flowers and mushrooms. Wind-driven local deformation moves plants, girl, dress and ribbons, with hands and branch anchors held in place. A clear-path patch removes the painted shadow; four existing imp dance cels are independently projected onto the ground. Two moving mist layers, airborne leaves, small fireflies and flickering chapel windows make the atmosphere legible. See assets/FOREST-MOTION-V3.md for the current source and prompt. Main page and preview share assets/forest-master.css, assets/forest-master-preview.js and assets/forest-master-motion.js; assets/forest-contact.css handles the page layout. Pause offscreen, behind dialogs and entry, in hidden documents and with reduced motion or the existing site motion control. Keep the still painting as a rendering fallback. Source records and exact prompts are in assets/FOREST-LIVING-V2-PROMPTS.md. Earlier forest-world and cemetery assembly files are retained as historical iterations.

The theatre's horizontal alpha fade belongs to the entire stage, so the backdrop, fire, mist and frame blend into the surrounding ink at the same right edge. The Hero is framed by charred grinning trees; its lower corners are clear of extra creatures. Outside the Hero, use single woodland flowers and mushrooms, not clusters. Each botanical character has two registered sprite cells for open and closed eyes, with short blinks on staggered 6.1–8.1 second cycles and independent gentle sway. Keep all text and controls clear. Scale the scenery down on mobile; pause both motions offscreen, behind the intro, in hidden documents, or when motion is disabled, returning to the open-eye frame. Delivery assets and prompts are recorded in assets/SOURCES.md and assets/BOTANICAL-PROMPTS.md; earlier environment concepts remain documented alongside them.

Hero, dance sprite sheet, corrected imp, hanging girl and two violin layers generated using built-in imagegen from the user's approved Red Shoes reference. Project backgrounds reuse illustrations generated earlier in this chat. WebP files are delivery copies; original source images remain untouched. Source records and final prompt set are in assets/SOURCES.md and assets/THEATRE-PROMPTS.md.
