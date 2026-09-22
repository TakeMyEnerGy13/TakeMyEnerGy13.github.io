# Portfolio visual direction

Based on the user-provided `DESIGN (4).md`, https://resend.com/, and the supplied Wise composition reference. The user's request takes precedence over recommendations in the attached style document.

- Pure black canvas, white headings, muted gray copy, 1px graphite borders.
- Centered hero: headline, supporting copy, two actions, then the 3D scene. No decorative badges, stickers, or scrolling ribbons.
- Instrument Serif for the English hero and contact headline; Inter for Russian content and interface text. Local font files, no runtime font service.
- Earth with surface, normal, and night-light textures. Four separate extruded silhouettes: Claude, ChatGPT, Gemini, and Perplexity.
- Local particle halos explicitly requested by the user: copper, green, blue/violet, and cyan. These are an intentional exception to the reference document's no-glow recommendation. No page-wide color wash.
- Logos represent tools, not endorsements or partnerships.
- Slow planet rotation and restrained logo movement; pointer response on desktop. Respect reduced motion and stop rendering when offscreen or hidden.
- Scrolling through the hero drives a reversible 180° orbit. Velocity eases into and out of motion and is capped at 0.6 radians per second to soften abrupt wheel/touch input. Logos, particle emitters, and surface light positions share the same orbital coordinates; Earth occludes logos passing behind it. The orbit also respects reduced motion.
- Functional sections use the same dark palette with subdued project illustrations. Preserve project descriptions and working contact links.

- Hero pause button and model captions are removed at the user's request. System reduced-motion settings still stop animation.
- Project articles use continuous charcoal surfaces, subtle procedural grain, and local red (HeadHunter), yellow (Yandex Music), and sky-blue (Learny.ai outer card and inner illustration) lighting, following the user's card reference.

- Learny.ai replaces Task Manager with a voice-practice illustration, live Agentplace and source links, and a linked Best Agent award from the Agentplace hackathon.
- Learny appears before Yandex Music. Its compact top-right award badge uses white with restrained champagne accents. A realistic gold crown render sits over the left corner with a subtle lift, respecting reduced motion.
- Learny uses a charcoal outer card with saturated sky-blue lighting and a matching blue-cyan inner illustration. The compact white award badge aligns right, retaining its gold gradient border and six-second shine.

- About: Instrument Serif heading “Curiosity drives me.” (font has no Cyrillic), Russian biography below on the left, procedural WebGL turbine on the right. Metallic housing, rotating fan, fixed initial body orientation and blue particle halo; pauses offscreen, on hidden tabs and for reduced motion.
- Removed decorative section labels and project captions. Engine uses 1,100 blue particles and a stronger blue halo; engine materials remain neutral metal with subtle cool reflections. Mouse dragging and arrow keys control its orientation; Home restores the fixed initial angle.

- Skills section and its navigation link removed. Engine body stays at the reference angle; only fan blades animate automatically. Manual mouse rotation remains available. Blue backlight strengthened.
- About copy focuses on Python/TypeScript, AI agents, LLM/RAG and the author’s design practice, followed by a practice-first philosophy. The quote is a separate decorative section after Experience, with a subdued introduction, a large statement and fine dividers above and below.
- Websites section uses real screenshots of Hrum and Prootdyh redesign, alternating wide image/text rows on desktop and image-first stacks on mobile. Shared typography and links preserve visual continuity. About philosophy ends with the requested call to action.

- The Russian quote after Experience becomes an English pause section: a muted Inter introduction ("I'm not trying to sell myself.") over a large Instrument Serif statement ("I'm just vibing."), matching every other display heading on the site. Words rise into place once on entry through GSAP SplitText.
- The same section carries a cursor image trail: ten locally generated macro frames (lichen, crystal, dunes, ripples, nebula, circuit board, droplet, frost, smoke, growth rings) in black, silver and the site's lavender accent. Frames fade in behind the quote as the pointer moves, then drift down and out. A radial vignette keeps the text readable over them.
- Touch devices get a slow automatic version of the trail instead of pointer tracking. Reduced motion leaves a plain static quote with no images.
- GSAP 3.13 core and SplitText are vendored in assets/vendor, following the same local-files rule as the fonts. No runtime CDN.
- Bliss pause section uses a solid black background and eight PNG nature details as a cursor trail. Touch devices autoplay the trail only in view; reduced motion preserves the black background and readable quote.
- Hero particles use depth testing against the Earth rather than a silhouette stencil. Quote pause sits between About and Experience; Experience is immediately before Contact. Company artwork replaces the mouse pointer on all four experience rows, with normal cursor fallback on touch and image failure.

- Company cursors are square. Freelance uses the supplied emoji with transparent background and no border or box shadow; Tvaity uses the supplied logo.
- Hero logo positions and light emitters are fixed: no scroll orbit. Local pointer proximity drives damped tilt and slight scale feedback. Footer time, copyright and back-to-top text removed; contact section has no top divider.
- Dark primary CTAs share a violet gradient hover, subtle border glow, 2px lift and single sheen sweep. Keyboard focus exposes the gradient; reduced motion disables movement. Contact Email is a single mailto link styled as a button; clipboard action removed.
- Experience is a continuous dark glass panel with square company artwork, duration pills and restrained purple hover lighting. Rows open a native dialog with company logo, role, tenure and confirmed description. Escape, backdrop and close button dismiss it; focus and page scrolling are restored. Motion respects reduced-motion preferences.
- Experience logos appear only as borderless hover cursors. Header and dialog share a persistent RU/EN switch translating page copy, metadata, accessible labels and dialog descriptions. Tvaity role is Full-stack Developer with the supplied end-to-end AI-assisted website delivery description.
- Experience hover now shares the violet CTA palette with a wider, slower sheen. Contact features a procedural 3D construction helmet with a moulded golden shell, raised ribs, ventilation slots, brim and suspension band. Orange backlighting and particles echo the existing WebGL scenes. Hover gently tilts the helmet; arrow keys rotate it and Home resets its pose. Reduced motion changes pose immediately, and rendering stops offscreen.
