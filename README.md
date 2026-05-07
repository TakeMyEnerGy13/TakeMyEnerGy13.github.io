# Portfolio — TakeMyEnerGy (AI Engineer)

Personal portfolio site built with Vite + React + TypeScript and Tailwind CSS v4.
Visual language follows the **monopo london** design system: midnight canvas,
Roobert (with Space Grotesk fallback), 0.15em letter-spacing, and a Nebula
gradient hero.

## Signature interaction — liquid-glass loupe

The cursor is replaced by a transparent "liquid glass" magnifying lens. When
the lens passes over text, the underlying English copy is revealed in
**Russian** through the lens — implemented with a per-element
`clip-path: circle(...)` mask tied to the global mouse position via
`requestAnimationFrame`-batched updates.

Use `<T en="..." ru="..." />` from `src/lens/T.tsx` to make any piece of text
bilingual.

## Stack

- Vite 8 + React 19 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- No runtime dependencies beyond React

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint
```

## Project layout

```
src/
  App.tsx
  main.tsx
  index.css            # design tokens + base styles (monopo)
  data.ts              # profile + projects content
  components/
    Nav.tsx
    Hero.tsx
    Projects.tsx
    About.tsx
    Contact.tsx
  lens/
    LensProvider.tsx   # global mouse tracker + cursor element
    T.tsx              # bilingual text wrapper
    useLensRegistry.ts
    lens.css           # cursor + clip-path styles
legacy/
  portfolio_2.html     # previous static portfolio (kept for reference)
```

## Notes

- The lens is automatically disabled on touch devices (`hover: none` /
  `pointer: coarse`).
- Roobert is proprietary; the site falls back to Space Grotesk via Google
  Fonts. Drop a Roobert `@font-face` into `index.css` if licensed.
