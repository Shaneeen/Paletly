# 🔧 Your Stack

- **Vite** → The dev server & bundler (`npm run dev` starts Vite).  
- **TypeScript** → Code is written in `.ts`, compiled with `tsc` during build (`tsc && vite build`).  
- **Vanilla TS + DOM** → no React, Vue, Svelte etc. Directly creating elements with `document.createElement` and mounting them.  
- **color-namer** + **colorjs.io** → libraries used for naming and color conversions.  

**Summary:** Vanilla TS app + Vite bundler (not React, not plain `tsc` only).  

---

# 📂 Project Structure
```text
src/
├── pages/
│   ├── Home.ts          # Welcome page
│   ├── ColorLab.ts      # (previously Convert.ts) → The color converter page (pick a color find out the hex and name)
│   └── NotFound.ts      # 404 page
│
├── lib/
│   └── color.ts         # Color helpers: normalize hex, closest names, etc.
│
├── types/
│   └── color-namer.d.ts # Type definitions for color-namer
│
├── router.ts            # Lightweight hash-based router
├── main.ts              # Entrypoint that mounts the router into #app
└── index.html           # HTML shell with nav + <main id="app">
```
## 🔮 Future Plans

Paletly is currently focused on accurate color conversion and naming, but the long-term vision is to turn it into a **creative hub for palettes, inspiration, and design workflows**. Below are the planned features and directions:

---

### 1. Complement Colors & Advanced Color Harmony
The next step is to make Paletly more than a converter by adding **color harmony features**:
- **Complementary Colors**: instantly show the opposite on the color wheel for high-contrast pairings.  
- **Triadic & Tetradic Schemes**: automatically generate three- and four-color combinations that feel balanced.  
- **Analogous Palettes**: display nearby hues for smooth, cohesive designs.  
- **Practical Exports**: output palettes as CSS variables, Tailwind configs, or JSON for design systems.  

This turns Paletly into a **design assistant** for creating harmonious color sets.

---

### 2. Image Color Picker / Extractor
Users will be able to **upload an image or paste a link**, then:
- Detect **dominant colors** from the image using clustering (k-means, median cut, or libraries like `color-thief`).  
- Build a palette representing the mood of the photo (primary, secondary, accent).  
- Allow pixel-level picking with a magnifier for exact hex values.  
- Label extracted colors with names (Pantone, Crayola, HTML) for easier reference.  

This makes Paletly useful for **branding, web design, and inspiration boards**.

---

### 3. Palette Maker
A dedicated interactive builder where users can:
- **Assemble palettes manually**: drag, drop, add, delete, and reorder swatches.  
- **Save & organize**: name palettes like *“Summer Vibes”* or *“Retro Neon”* and store them locally.  
- **Export options**: JSON, PNG, Adobe Swatch Exchange (ASE), or direct Figma-compatible data.  
- **Sharing**: one-click shareable links or downloadable images of palettes.  

This makes Paletly a **workspace for color creativity**, not just a tool.

---

### 4. “Vibe Finder” / Moodboard Generator
A more ambitious feature: use palettes to generate **inspiration boards**.
- **Pinterest-style matching**: find boards or images with similar palettes.  
- **Unsplash/Pexels integration**: query free image libraries by hex tags or keywords.  
- **AI-powered vibe search**: use models like CLIP to match palettes with visually similar images.  
- **User flow**: pick 3–5 colors → Paletly suggests interiors, outfits, art, or photography that share that vibe.  

This turns Paletly into an **inspiration engine**, helping users connect colors to real-world aesthetics.

---

### 5. Optional Extras
Future polish features may include:
- **Accessibility testing**: simulate color blindness modes (protanopia, deuteranopia, tritanopia) to ensure palettes are inclusive.  
- **Export flexibility**: generate CSS/SCSS variables, Tailwind configs, or design tokens.  
- **Community sharing**: allow users to publish palettes publicly and browse a gallery of community-created palettes.  

---

👉 The roadmap flows naturally: **conversion → harmony → extraction → creation → inspiration**. Each step expands Paletly from a utility into a **full creative ecosystem for colors and palettes**.
