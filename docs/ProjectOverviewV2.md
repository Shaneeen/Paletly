# 🎨 Colorly — Project Overview (v2)

## 🖍 Name Change

The project was renamed from **Paletly** to **Colorly** to better reflect its expanding scope.  
While *Paletly* emphasized palette generation, the project has grown beyond palettes into broader areas such as color systems, visual exploration, interactive labs, and inspiration-driven workflows.

The name **Colorly** provides more flexibility for future features — including color spaces, image extraction, experimentation, and creative tools — without constraining the project to palettes alone.


## 🔧 Tech Stack

* **Vite** → Dev server & bundler (`npm run dev` starts Vite)
* **TypeScript** → Core logic written in `.ts`, compiled during build (`tsc && vite build`)
* **Vanilla TypeScript + DOM** → No React, Vue, or Svelte. UI is created using `document.createElement` and mounted directly.
* **colorjs.io** → Accurate color conversions across multiple color spaces
* **color-namer** → Human-readable color naming

**Summary:**
Colorly is a **Vanilla TypeScript SPA** powered by Vite, focused on **performance, clarity, and full control over rendering**, without relying on heavy frameworks.

---

## 📂 Project Structure

```text
src/
├── pages/
│   ├── Home.ts          # Landing / introduction page
│   ├── ColorLab.ts      # Core color lab (conversion, inspection, visual tools)
│   └── NotFound.ts      # 404 page
│
├── lib/
│   └── color.ts         # Color helpers (normalization, conversions, naming)
│
├── types/
│   └── color-namer.d.ts # Type definitions for color-namer
│
├── router.ts            # Lightweight hash-based router
├── main.ts              # App entrypoint (mounts router into #app)
└── index.html           # HTML shell with nav + <main id="app">
```

The structure is intentionally **page-based and modular**, making it easy to add new labs, tools, and experiments without restructuring the app.

---

## 🎯 Current Focus

Colorly currently focuses on **accurate color inspection and understanding**, providing:

* **Color Conversion**

  * HEX, RGB, HSL, CMY (and related models)
  * Powered by `colorjs.io`
* **Color Naming**

  * Closest human-readable names via `color-namer`
* **ColorLab**

  * Pick a color → inspect its values → understand its structure
  * Designed as a foundation for more advanced tools

At this stage, Colorly acts as a **reliable color reference and exploration tool**.

---

## 🧪 Visual & Exploratory Labs

Alongside traditional color utilities, Colorly introduces **visual representations of color systems** to support learning and intuition.

Planned and experimental lab features include:

* **CMY Color Cube** — a 3D visualization of subtractive color mixing
* **RGB / HSL Space Views** — spatial representations of color relationships
* **Live Syncing** — interactions update numeric values and palettes in real time

These labs are designed to **complement workflows**, not replace standard tools.

---

## 🔮 Roadmap & Future Plans

Colorly is designed to grow gradually from a utility into a **creative color ecosystem**.

---

### 1. Color Harmony & Palette Assistance

Expanding beyond single-color inspection:

* **Complementary Colors** — instantly show opposites for contrast
* **Triadic & Tetradic Schemes** — balanced multi-color combinations
* **Analogous Palettes** — smooth, cohesive color groupings
* **Exports** — CSS variables, Tailwind configs, JSON design tokens

This positions Colorly as a **design assistant**, not just a converter.

---

### 2. Image Color Picker / Extractor

Supporting inspiration-driven workflows:

* Upload images or paste image URLs
* Extract **dominant, secondary, and accent colors**
* Pixel-level picking with magnification
* Automatic naming of extracted colors

Useful for **branding, UI design, and mood exploration**.

---

### 3. Palette Builder

A dedicated workspace for palette creation:

* Manually assemble palettes (add, remove, reorder)
* Name and organize palettes locally
* Export palettes as:

  * JSON
  * Images
  * Design tokens
  * Figma-compatible formats
* Share palettes via links or downloads

This turns Colorly into a **creative workspace**, not just a viewer.

---

### 4. Vibe Finder / Moodboard Generator

Bridging color data with visual inspiration:

* Generate moodboards from selected palettes
* Discover images and aesthetics with similar color profiles
* Integrations with free image libraries
* AI-assisted matching between palettes and visuals

This feature connects **abstract color choices** to **real-world aesthetics**.

---

### 5. Optional & Polish Features

Future enhancements may include:

* **Accessibility testing**

  * Color blindness simulations (protanopia, deuteranopia, tritanopia)
* **Export flexibility**

  * CSS / SCSS variables
  * Tailwind configs
  * Design tokens
* **Community sharing**

  * Public palette gallery
  * Browsing and remixing shared palettes

---

## 🧭 Vision

Colorly’s roadmap follows a natural progression:

**conversion → harmony → extraction → creation → inspiration**

The long-term goal is to make Colorly a place where users can:

* understand color systems
* build practical palettes
* explore visual ideas
* and translate color into real design decisions

Colorly is not just about picking colors — it’s about **working with color end-to-end**.

---

If you want next, I can:

* convert this into a **polished GitHub README**
* align feature sections with planned `pages/` (e.g. `Lab`, `Palette`, `Play`)
* help write **ProjectOverview v3** once CMY cube & palette builder land
* or review this as if it were being graded / evaluated

Just tell me what’s next 💛
