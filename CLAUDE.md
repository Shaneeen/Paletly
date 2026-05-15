# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (hot reload)
npm run build     # Type-check (tsc --noEmit) then bundle with Vite
npm run preview   # Serve the production build locally
```

No test framework is configured. Type-check manually with `npx tsc --noEmit`.

## Architecture

Vanilla TypeScript + Vite SPA. No framework. All routing, rendering, and state management is hand-rolled.

### Routing

`src/router.ts` implements a hash-based router (`#/`, `#/colorlab`, `#/palette`). Each route lazy-loads its page module via dynamic `import()`. The router:
- Exports the `Page` interface: `{ mount(root: HTMLElement, params: Record<string,string>): void | (() => void); title?: string }`
- Calls `mount(root)` on navigation; stores the optional cleanup return value and calls it before the next route
- Sets `document.title` automatically

### Page pattern

Every page is a self-contained `.ts` module exporting a `default` object implementing `Page`. Pages inject their own CSS using an `ensureCss(id, css)` helper (checks `document.getElementById` before inserting — idempotent on re-mount). CSS class names are prefixed per page (`.cl-` for ColorLab, `.pm-` for PaletteMaker) to avoid collisions.

### Theming

Global CSS variables live in `index.html` (`--bg`, `--surface`, `--surface-soft`, `--text`, `--muted`, `--border`, `--shadow`). Dark mode is toggled by adding `body.dark` class. `src/main.ts` reads/writes `localStorage.getItem("theme")` and handles the toggle button.

Pages can set dynamic accent variables directly on their wrapper element (e.g. `--cl-accent`, `--cl-accent-soft`) rather than on `:root` to avoid polluting global scope.

### Color utilities

- `src/libs/Color.ts` — naming only: `normHex`, `closestNames`, `topNamesByPalette`, `pantonePrimaryName`. Uses the `color-namer` npm package.
- Math operations (HSL conversion, contrast ratios, harmony generation) are implemented inline within each page that needs them to keep pages self-contained.
- `colorjs.io` is available for color space conversions (HSL, HWB, LAB, LCH, XYZ) — used in ColorLab.

### State persistence

PaletteMaker persists palettes to `localStorage` under the key `"paletly-palettes"` as a JSON array of `Palette` objects (`{ id, name, colors, createdAt }`).

### Components

Small reusable DOM helpers live in `src/components/` (e.g. `ColorChip.ts`, `CopyField.ts`). These are plain functions returning `HTMLElement`, not class-based components.
