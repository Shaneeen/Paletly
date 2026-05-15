import type { Page } from "../router";
import { closestNames, normHex } from "../libs/Color";

/* ─── Types ─────────────────────────────────────────────────── */

type Palette = {
  id: string;
  name: string;
  colors: string[];
  createdAt: string;
};

/* ─── Storage ────────────────────────────────────────────────── */

const STORAGE_KEY = "paletly-palettes";

function loadPalettes(): Palette[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); }
  catch { return []; }
}

function savePalettes(list: Palette[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function mkPalette(name = "Untitled Palette"): Palette {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    colors: [],
    createdAt: new Date().toISOString(),
  };
}

/* ─── Color utilities ────────────────────────────────────────── */

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const x = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${x(f(0))}${x(f(8))}${x(f(4))}`.toUpperCase();
}

function randomColor(): string {
  return hslToHex(
    Math.floor(Math.random() * 360),
    Math.floor(Math.random() * 35) + 55,
    Math.floor(Math.random() * 36) + 32,
  );
}

function hexToHsl(hex: string): [number, number, number] {
  const [rr, gg, bb] = hexToRgb(hex);
  const r = rr / 255, g = gg / 255, b = bb / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r)      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else                h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

function suggestFixes(fg: string, bg: string, count = 3): string[] {
  const [h, s] = hexToHsl(fg);
  const passing: string[] = [];
  for (let l = 5; l <= 95; l += 5) {
    const c = hslToHex(h, Math.min(s + 10, 85), l);
    if (contrastRatio(c, bg) >= 4.5) passing.push(c);
  }
  if (passing.length === 0) return [];
  if (passing.length <= count) return passing;
  const step = (passing.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => passing[Math.round(i * step)]);
}

function generateColors(n: number): string[] {
  const offset = Math.floor(Math.random() * 360);
  return Array.from({ length: n }, (_, i) => {
    const hue = (offset + Math.round((360 / n) * i)) % 360;
    return hslToHex(hue, Math.round(48 + Math.random() * 32), Math.round(36 + Math.random() * 32));
  });
}

function channelToLinear(v: number) {
  const n = v / 255;
  return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

function contrastRatio(a: string, b: string) {
  const la = relativeLuminance(a), lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function textColorFor(hex: string) {
  return contrastRatio(hex, "#111111") >= 4.5 ? "#111111" : "#FFFFFF";
}

function round(v: number, d = 2) {
  return Math.round(v * 10 ** d) / 10 ** d;
}

/* ─── DOM helpers ────────────────────────────────────────────── */

function ensureCss(id: string, css: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id; s.textContent = css;
  document.head.append(s);
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, className?: string, text?: string,
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}

async function copyText(t: string) { await navigator.clipboard.writeText(t); }

/* ─── CSS ────────────────────────────────────────────────────── */

const CSS = `
.pm {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px 72px;
}

/* ── Tabs ── */
.pm-tabs-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}
.pm-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  flex: 1;
}
.pm-tabs::-webkit-scrollbar { display: none; }
.pm-tab {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 0.84rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 130ms ease, color 130ms ease, border-color 130ms ease;
}
.pm-tab.active {
  background: var(--text);
  color: var(--bg);
  border-color: transparent;
  font-weight: 600;
}
.pm-tab-dots { display: flex; gap: 3px; }
.pm-tab-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
}
.pm-new-btn {
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px dashed var(--border);
  background: transparent;
  color: var(--muted);
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 130ms ease, color 130ms ease;
}
.pm-new-btn:hover { background: var(--surface-soft); color: var(--text); }

/* ── Header ── */
.pm-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.pm-name-input {
  flex: 1;
  min-width: 180px;
  font-size: 1.55rem;
  font-weight: 700;
  border: none;
  background: transparent;
  color: var(--text);
  padding: 2px 0;
  font-family: inherit;
  outline: none;
  border-bottom: 2px solid transparent;
  transition: border-color 160ms ease;
}
.pm-name-input:focus { border-bottom-color: var(--border); }
.pm-delete-btn {
  padding: 7px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 130ms ease, color 130ms ease, border-color 130ms ease;
}
.pm-delete-btn:hover {
  background: rgba(239,68,68,0.1);
  color: #b91c1c;
  border-color: rgba(239,68,68,0.3);
}
body.dark .pm-delete-btn:hover { background: rgba(239,68,68,0.15); color: #fca5a5; }

/* ── Sections ── */
.pm-sec { margin-bottom: 28px; }
.pm-sec-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.pm-sec-label {
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
}
.pm-sec-rule { flex: 1; height: 1px; background: var(--border); }

/* ── Canvas ── */
.pm-canvas {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  min-height: 80px;
  align-items: flex-start;
}
.pm-empty {
  color: var(--muted);
  font-size: 0.88rem;
  padding: 20px 0 8px;
}
.pm-swatch {
  width: 152px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: 0 2px 8px rgba(15,23,42,0.08);
  flex-shrink: 0;
}
.pm-swatch-color {
  height: 120px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
}
.pm-swatch-top { display: flex; justify-content: flex-end; }
.pm-swatch-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
.pm-swatch-remove,
.pm-order-btn {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  border: none;
  background: rgba(0,0,0,0.22);
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 110ms ease;
  flex-shrink: 0;
}
.pm-swatch-remove:hover,
.pm-order-btn:hover { background: rgba(0,0,0,0.42); }
.pm-order-btns { display: flex; gap: 4px; }
.pm-swatch-info {
  padding: 10px 12px;
  background: var(--surface);
  display: grid;
  gap: 2px;
}
.pm-swatch-hex {
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 0.82rem;
  font-weight: 700;
}
.pm-swatch-name {
  font-size: 0.7rem;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 6px;
}
.pm-swatch-copy {
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: background 110ms ease, color 110ms ease;
}
.pm-swatch-copy:hover { background: var(--text); color: var(--bg); border-color: transparent; }

/* ── Add bar ── */
.pm-add-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.pm-add-picker-wrap {
  position: relative;
  width: 52px;
  height: 44px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  cursor: pointer;
  flex-shrink: 0;
}
.pm-add-picker-wrap input[type="color"] {
  position: absolute;
  width: 160%; height: 160%;
  top: -30%; left: -30%;
  border: none; cursor: pointer; background: none; padding: 0;
}
.pm-add-hex {
  height: 44px;
  padding: 0 13px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-soft);
  color: var(--text);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 0.9rem;
  width: 136px;
}
.pm-add-hex:focus { outline: 2px solid rgba(72,122,87,0.3); outline-offset: 1px; }
.pm-add-hex.bad { border-color: rgba(194,83,62,0.7); background: rgba(255,230,225,0.8); }
body.dark .pm-add-hex.bad { background: rgba(100,30,20,0.3); }
.pm-add-btn {
  height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  border: none;
  background: var(--text);
  color: var(--bg);
  font-weight: 700;
  font-size: 0.86rem;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 120ms ease;
}
.pm-add-btn:hover { opacity: 0.82; }
.pm-add-rand-btn {
  height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  color: var(--text);
  font-weight: 600;
  font-size: 0.86rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 120ms ease;
}
.pm-add-rand-btn:hover { background: var(--surface); }

/* ── Export ── */
.pm-export-tabs { display: flex; gap: 6px; margin-bottom: 10px; }
.pm-export-tab {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background 110ms ease, color 110ms ease;
}
.pm-export-tab.active { background: var(--text); color: var(--bg); border-color: transparent; }
.pm-export-wrap { position: relative; }
.pm-export-code {
  padding: 16px;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 1px 4px rgba(15,23,42,0.06);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 0.82rem;
  line-height: 1.75;
  white-space: pre;
  overflow-x: auto;
  min-height: 56px;
  color: var(--text);
}
.pm-export-copy {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 110ms ease, color 110ms ease;
}
.pm-export-copy:hover { background: var(--text); color: var(--bg); border-color: transparent; }

/* ── Accessibility ── */
.pm-a11y-grid { display: grid; gap: 8px; }
.pm-a11y-empty { color: var(--muted); font-size: 0.86rem; padding: 6px 0; }
.pm-a11y-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(15,23,42,0.05);
  flex-wrap: wrap;
}
.pm-a11y-preview {
  width: 52px;
  height: 38px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  flex-shrink: 0;
}
.pm-a11y-ratio {
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 0.92rem;
  font-weight: 700;
  min-width: 72px;
  flex-shrink: 0;
}
.pm-a11y-badges { display: flex; gap: 5px; flex-shrink: 0; }
.pm-a11y-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.pm-a11y-badge.pass { background: rgba(34,197,94,0.13); color: #15803d; }
.pm-a11y-badge.fail { background: rgba(239,68,68,0.11); color: #b91c1c; }
body.dark .pm-a11y-badge.pass { background: rgba(34,197,94,0.2); color: #86efac; }
body.dark .pm-a11y-badge.fail { background: rgba(239,68,68,0.18); color: #fca5a5; }
.pm-a11y-label {
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 0.72rem;
  color: var(--muted);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pm-a11y-more { font-size: 0.78rem; color: var(--muted); padding: 4px 0; }

/* ── Suggestions ── */
.pm-a11y-suggestions {
  flex: 0 0 100%;
  display: flex;
  align-items: center;
  gap: 7px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}
.pm-suggest-label {
  font-size: 0.64rem;
  font-weight: 700;
  color: var(--muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}
.pm-suggest-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--surface);
  cursor: pointer;
  box-shadow: 0 1px 5px rgba(0,0,0,0.2);
  transition: transform 120ms ease, box-shadow 120ms ease;
  flex-shrink: 0;
}
.pm-suggest-dot:hover { transform: scale(1.32); box-shadow: 0 2px 8px rgba(0,0,0,0.26); }

/* ── Generate ── */
.pm-generate-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}
.pm-generate-label {
  font-size: 0.78rem;
  color: var(--muted);
  font-weight: 500;
  white-space: nowrap;
}
.pm-count-input {
  width: 66px;
  height: 44px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-soft);
  color: var(--text);
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  font-family: inherit;
}
.pm-count-input:focus { outline: 2px solid rgba(72,122,87,0.3); outline-offset: 1px; }
.pm-generate-btn {
  height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  border: none;
  background: var(--text);
  color: var(--bg);
  font-weight: 700;
  font-size: 0.86rem;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 120ms ease;
}
.pm-generate-btn:hover { opacity: 0.82; }

/* ── Responsive ── */
@media (max-width: 720px) {
  .pm { padding: 0 12px 48px; }
  .pm-swatch { width: calc(50% - 6px); }
  .pm-a11y-row { gap: 10px; }
}
`;

/* ─── Page ───────────────────────────────────────────────────── */

const PaletteMaker: Page = {
  title: "Palette Maker",
  mount(root) {
    ensureCss("pm-css", CSS);

    /* state */
    let palettes = loadPalettes();
    if (palettes.length === 0) {
      const first = mkPalette("My First Palette");
      first.colors = ["#487A57", "#F4F0E8", "#1A2332"];
      palettes = [first];
      savePalettes(palettes);
    }
    let activeId = palettes[0].id;
    let exportFmt: "css" | "tailwind" | "json" = "css";

    const getActive = () => palettes.find(p => p.id === activeId)!;

    /* ── wrapper ──────────────────────────────────────────── */
    const wrap = el("div", "pm");
    root.append(wrap);

    /* ── tabs ─────────────────────────────────────────────── */
    const tabsWrap  = el("div", "pm-tabs-wrap");
    const tabsRow   = el("div", "pm-tabs");
    const newBtn    = el("button", "pm-new-btn", "+ New Palette") as HTMLButtonElement;
    newBtn.type     = "button";
    tabsWrap.append(tabsRow, newBtn);
    wrap.append(tabsWrap);

    /* ── header ───────────────────────────────────────────── */
    const header    = el("div", "pm-header");
    const nameInput = el("input", "pm-name-input") as HTMLInputElement;
    nameInput.type  = "text";
    nameInput.placeholder = "Palette name";
    const delBtn    = el("button", "pm-delete-btn", "Delete palette") as HTMLButtonElement;
    delBtn.type     = "button";
    header.append(nameInput, delBtn);
    wrap.append(header);

    /* ── swatches ─────────────────────────────────────────── */
    const swatchSec = makeSec("Swatches");
    const canvas    = el("div", "pm-canvas");
    swatchSec.append(canvas);
    wrap.append(swatchSec);

    /* ── add color ────────────────────────────────────────── */
    const addSec    = makeSec("Add Color");
    const addBar    = el("div", "pm-add-bar");

    const pickerWrap = el("div", "pm-add-picker-wrap");
    const addPicker  = el("input") as HTMLInputElement;
    addPicker.type   = "color";
    addPicker.value  = "#487A57";
    pickerWrap.append(addPicker);

    const addHex        = el("input", "pm-add-hex") as HTMLInputElement;
    addHex.type         = "text";
    addHex.value        = "#487A57";
    addHex.placeholder  = "#RRGGBB";
    addHex.spellcheck   = false;

    const addBtn    = el("button", "pm-add-btn", "Add to Palette") as HTMLButtonElement;
    addBtn.type     = "button";
    const randBtn   = el("button", "pm-add-rand-btn", "↺ Random") as HTMLButtonElement;
    randBtn.type    = "button";

    addBar.append(pickerWrap, addHex, addBtn, randBtn);

    const genBar      = el("div", "pm-generate-bar");
    const genLabel    = el("span", "pm-generate-label", "Generate");
    const countInput  = el("input", "pm-count-input") as HTMLInputElement;
    countInput.type   = "number";
    countInput.min    = "1";
    countInput.max    = "20";
    countInput.value  = "5";
    const genBtn      = el("button", "pm-generate-btn", "Generate Palette") as HTMLButtonElement;
    genBtn.type       = "button";
    genBar.append(genLabel, countInput, genBtn);

    addSec.append(addBar, genBar);
    wrap.append(addSec);

    /* ── export ───────────────────────────────────────────── */
    const expSec    = makeSec("Export Palette");
    const expTabs   = el("div", "pm-export-tabs");
    const expWrap   = el("div", "pm-export-wrap");
    const expCode   = el("pre", "pm-export-code");
    const expCopy   = el("button", "pm-export-copy", "Copy") as HTMLButtonElement;
    expCopy.type    = "button";
    expWrap.append(expCode, expCopy);
    expSec.append(expTabs, expWrap);
    wrap.append(expSec);

    /* ── accessibility ────────────────────────────────────── */
    const a11ySec   = makeSec("Accessibility Quick Check");
    const a11yGrid  = el("div", "pm-a11y-grid");
    a11ySec.append(a11yGrid);
    wrap.append(a11ySec);

    /* ── helpers ──────────────────────────────────────────── */
    function makeSec(label: string) {
      const s    = el("div", "pm-sec");
      const head = el("div", "pm-sec-head");
      head.append(el("span", "pm-sec-label", label), el("div", "pm-sec-rule"));
      s.append(head);
      return s;
    }

    /* ── render: tabs ─────────────────────────────────────── */
    function renderTabs() {
      tabsRow.innerHTML = "";
      palettes.forEach(p => {
        const tab  = el("button", `pm-tab${p.id === activeId ? " active" : ""}`) as HTMLButtonElement;
        tab.type   = "button";

        const dots = el("div", "pm-tab-dots");
        p.colors.slice(0, 5).forEach(c => {
          const d = el("div", "pm-tab-dot");
          d.style.background = c;
          dots.append(d);
        });

        const lbl = document.createElement("span");
        lbl.textContent = p.name;
        tab.append(dots, lbl);

        tab.addEventListener("click", () => { activeId = p.id; renderAll(); });
        tabsRow.append(tab);
      });
    }

    /* ── render: header ───────────────────────────────────── */
    function renderHeader() {
      nameInput.value = getActive().name;
    }

    /* ── render: canvas ───────────────────────────────────── */
    function renderCanvas() {
      const p = getActive();
      canvas.innerHTML = "";

      if (p.colors.length === 0) {
        canvas.append(el("div", "pm-empty", "No colors yet — add one below."));
        return;
      }

      p.colors.forEach((hex, i) => {
        const match = closestNames(hex, 1)[0];
        const name  = match ? match.name : "Unknown";
        const tc    = textColorFor(hex);

        const card       = el("div", "pm-swatch");
        const colorBlock = el("div", "pm-swatch-color");
        colorBlock.style.background = hex;

        /* top row: remove button */
        const top    = el("div", "pm-swatch-top");
        const removeB = el("button", "pm-swatch-remove", "×") as HTMLButtonElement;
        removeB.type  = "button";
        removeB.style.color = tc;
        removeB.title = "Remove";
        removeB.addEventListener("click", () => {
          p.colors.splice(i, 1);
          savePalettes(palettes);
          renderAll();
        });
        top.append(removeB);

        /* bottom row: reorder arrows */
        const bot      = el("div", "pm-swatch-bottom");
        const orderDiv = el("div", "pm-order-btns");
        if (i > 0) {
          const lb   = el("button", "pm-order-btn", "‹") as HTMLButtonElement;
          lb.type    = "button";
          lb.style.color = tc;
          lb.title   = "Move left";
          lb.addEventListener("click", () => {
            [p.colors[i - 1], p.colors[i]] = [p.colors[i], p.colors[i - 1]];
            savePalettes(palettes); renderAll();
          });
          orderDiv.append(lb);
        }
        if (i < p.colors.length - 1) {
          const rb   = el("button", "pm-order-btn", "›") as HTMLButtonElement;
          rb.type    = "button";
          rb.style.color = tc;
          rb.title   = "Move right";
          rb.addEventListener("click", () => {
            [p.colors[i], p.colors[i + 1]] = [p.colors[i + 1], p.colors[i]];
            savePalettes(palettes); renderAll();
          });
          orderDiv.append(rb);
        }
        bot.append(orderDiv);

        colorBlock.append(top, bot);

        /* info strip */
        const info    = el("div", "pm-swatch-info");
        const copyBtn = el("button", "pm-swatch-copy", "Copy hex") as HTMLButtonElement;
        copyBtn.type  = "button";
        copyBtn.addEventListener("click", async () => {
          await copyText(hex);
          copyBtn.textContent = "Copied!";
          setTimeout(() => { copyBtn.textContent = "Copy hex"; }, 1000);
        });
        info.append(el("div", "pm-swatch-hex", hex), el("div", "pm-swatch-name", name), copyBtn);

        card.append(colorBlock, info);
        canvas.append(card);
      });
    }

    /* ── render: export ───────────────────────────────────── */
    function buildExportText(p: Palette): string {
      if (p.colors.length === 0) return "";
      if (exportFmt === "css") {
        return `:root {\n${p.colors.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`;
      }
      if (exportFmt === "tailwind") {
        return `colors: {\n${p.colors.map((c, i) => `  'color-${i + 1}': '${c}',`).join("\n")}\n}`;
      }
      return JSON.stringify(p.colors, null, 2);
    }

    function renderExport() {
      const p = getActive();
      expTabs.innerHTML = "";
      (["css", "tailwind", "json"] as const).forEach(fmt => {
        const btn  = el("button", `pm-export-tab${exportFmt === fmt ? " active" : ""}`) as HTMLButtonElement;
        btn.type   = "button";
        btn.textContent = fmt === "tailwind" ? "Tailwind" : fmt.toUpperCase();
        btn.addEventListener("click", () => { exportFmt = fmt; renderExport(); });
        expTabs.append(btn);
      });

      if (p.colors.length === 0) {
        expCode.textContent = "Add colors to generate export code.";
        expCopy.style.display = "none";
        return;
      }
      const text = buildExportText(p);
      expCode.textContent = text;
      expCopy.style.display = "";
      expCopy.onclick = async () => {
        await copyText(text);
        expCopy.textContent = "Copied!";
        setTimeout(() => { expCopy.textContent = "Copy"; }, 1100);
      };
    }

    /* ── render: accessibility ────────────────────────────── */
    function renderA11y() {
      a11yGrid.innerHTML = "";
      const p = getActive();

      if (p.colors.length < 2) {
        a11yGrid.append(el("div", "pm-a11y-empty", "Add at least 2 colors to check contrast pairs."));
        return;
      }

      const pairs: Array<{ fg: string; bg: string; ratio: number }> = [];
      for (let i = 0; i < p.colors.length; i++) {
        for (let j = i + 1; j < p.colors.length; j++) {
          pairs.push({ fg: p.colors[i], bg: p.colors[j], ratio: contrastRatio(p.colors[i], p.colors[j]) });
        }
      }
      pairs.sort((a, b) => a.ratio - b.ratio);

      const MAX = 20;
      pairs.slice(0, MAX).forEach(({ fg, bg, ratio }) => {
        const passAA    = ratio >= 4.5;
        const passLarge = ratio >= 3;
        const passAAA   = ratio >= 7;

        const row     = el("div", "pm-a11y-row");

        const preview = el("div", "pm-a11y-preview", "Aa");
        preview.style.background = bg;
        preview.style.color      = fg;

        const ratioEl = el("div", "pm-a11y-ratio", `${round(ratio, 2).toFixed(2)} : 1`);

        const badges  = el("div", "pm-a11y-badges");
        badges.append(
          el("span", `pm-a11y-badge ${passAA    ? "pass" : "fail"}`, `AA ${passAA    ? "✓" : "✗"}`),
          el("span", `pm-a11y-badge ${passAAA   ? "pass" : "fail"}`, `AAA ${passAAA  ? "✓" : "✗"}`),
          el("span", `pm-a11y-badge ${passLarge ? "pass" : "fail"}`, `Large ${passLarge ? "✓" : "✗"}`),
        );

        const lbl = el("div", "pm-a11y-label", `${fg} on ${bg}`);
        row.append(preview, ratioEl, badges, lbl);

        if (!passAA) {
          const fixes = suggestFixes(fg, bg);
          if (fixes.length > 0) {
            const sugg = el("div", "pm-a11y-suggestions");
            sugg.append(el("span", "pm-suggest-label", "Try instead:"));
            fixes.forEach(c => {
              const dot  = el("button", "pm-suggest-dot") as HTMLButtonElement;
              dot.type   = "button";
              dot.style.background = c;
              dot.title  = `${c} — ${round(contrastRatio(c, bg), 2).toFixed(2)}:1 contrast — click to add`;
              dot.addEventListener("click", () => {
                const p = getActive();
                if (!p.colors.includes(c)) { p.colors.push(c); savePalettes(palettes); renderAll(); }
              });
              sugg.append(dot);
            });
            row.append(sugg);
          }
        }

        a11yGrid.append(row);
      });

      if (pairs.length > MAX) {
        a11yGrid.append(el("div", "pm-a11y-more", `Showing ${MAX} of ${pairs.length} pairs — remove colors to see all.`));
      }
    }

    /* ── render all ───────────────────────────────────────── */
    function renderAll() {
      renderTabs();
      renderHeader();
      renderCanvas();
      renderExport();
      renderA11y();
    }

    /* ── events ───────────────────────────────────────────── */

    nameInput.addEventListener("input", () => {
      const p = getActive();
      p.name  = nameInput.value.trim() || "Untitled Palette";
      savePalettes(palettes);
      renderTabs();
    });

    delBtn.addEventListener("click", () => {
      if (palettes.length === 1) {
        getActive().colors = [];
        savePalettes(palettes);
        renderAll();
        return;
      }
      palettes = palettes.filter(p => p.id !== activeId);
      activeId = palettes[0].id;
      savePalettes(palettes);
      renderAll();
    });

    newBtn.addEventListener("click", () => {
      const p = mkPalette();
      palettes.push(p);
      activeId = p.id;
      savePalettes(palettes);
      renderAll();
    });

    function tryAddColor(hex: string) {
      const p = getActive();
      try {
        const h = normHex(hex);
        if (!p.colors.includes(h)) {
          p.colors.push(h);
          savePalettes(palettes);
          renderAll();
        }
        addHex.classList.remove("bad");
      } catch {
        addHex.classList.add("bad");
      }
    }

    addPicker.addEventListener("input", () => {
      addHex.value = addPicker.value.toUpperCase();
      addHex.classList.remove("bad");
    });

    addHex.addEventListener("input", () => {
      const raw  = addHex.value.trim();
      const cand = raw.startsWith("#") ? raw : `#${raw}`;
      if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(cand)) {
        addPicker.value = cand;
        addHex.classList.remove("bad");
      } else {
        addHex.classList.add("bad");
      }
    });

    addBtn.addEventListener("click", () => tryAddColor(addPicker.value));

    randBtn.addEventListener("click", () => {
      const c       = randomColor();
      addPicker.value = c;
      addHex.value    = c;
      addHex.classList.remove("bad");
      tryAddColor(c);
    });

    genBtn.addEventListener("click", () => {
      const n = Math.min(20, Math.max(1, parseInt(countInput.value, 10) || 5));
      countInput.value = String(n);
      const p = getActive();
      generateColors(n).forEach(c => {
        if (!p.colors.includes(c)) p.colors.push(c);
      });
      savePalettes(palettes);
      renderAll();
    });

    /* ── init ─────────────────────────────────────────────── */
    renderAll();
  },
};

export default PaletteMaker;
