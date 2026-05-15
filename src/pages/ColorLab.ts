import type { Page } from "../router";
import Color from "colorjs.io";
import { closestNames, normHex } from "../libs/Color";

const CSS = `
.colorlab {
  --cl-accent: #487A57;
  --cl-accent-soft: rgba(72,122,87,0.15);
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px 72px;
}

/* ── Hero ── */
.cl-hero {
  border-radius: 22px;
  overflow: hidden;
  margin-bottom: 28px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.cl-hero-strip {
  height: 176px;
  transition: background 420ms ease;
}
.cl-hero-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px 22px;
  background: var(--surface);
  border-top: 1px solid var(--border);
}
.cl-chip {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  flex-shrink: 0;
  border: 3px solid rgba(255,255,255,0.9);
  box-shadow: 0 0 0 5px var(--cl-accent-soft), 0 8px 20px rgba(0,0,0,0.16);
  cursor: pointer;
  transition: background 420ms ease, box-shadow 420ms ease;
}
.cl-hero-meta { flex: 1; min-width: 120px; }
.cl-hero-hex {
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}
.cl-hero-name { font-size: 0.8rem; color: var(--muted); margin-top: 5px; }
.cl-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cl-picker-wrap {
  position: relative;
  width: 50px;
  height: 42px;
  border-radius: 11px;
  overflow: hidden;
  border: 1px solid var(--border);
  cursor: pointer;
}
.cl-picker-wrap input[type="color"] {
  position: absolute;
  width: 160%; height: 160%;
  top: -30%; left: -30%;
  border: none; cursor: pointer; background: none; padding: 0;
}
.cl-hex-input {
  height: 42px;
  padding: 0 13px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--surface-soft);
  color: var(--text);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 0.9rem;
  width: 134px;
}
.cl-hex-input:focus { outline: 2px solid var(--cl-accent-soft); outline-offset: 1px; }
.cl-hex-input.bad { border-color: rgba(194,83,62,0.7); background: rgba(255,230,225,0.8); }
body.dark .cl-hex-input.bad { background: rgba(100,30,20,0.3); }
.cl-rand-btn {
  height: 42px;
  padding: 0 16px;
  border-radius: 11px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  color: var(--text);
  font-weight: 600;
  font-size: 0.86rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 120ms ease, transform 120ms ease;
}
.cl-rand-btn:hover { background: var(--surface); transform: translateY(-1px); }
.cl-status {
  min-height: 28px;
  font-size: 0.78rem;
  color: #c0392b;
  padding: 6px 22px 0;
  background: var(--surface);
}

/* ── Section ── */
.cl-sec { margin-bottom: 30px; }
.cl-sec-head { display: flex; align-items: center; gap: 10px; margin-bottom: 13px; }
.cl-sec-label {
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
}
.cl-sec-rule { flex: 1; height: 1px; background: var(--border); }

/* ── Values ── */
.cl-values-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(186px, 1fr));
}
.cl-val {
  padding: 12px 13px 12px 15px;
  border-radius: 13px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--cl-accent);
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 2px 8px rgba(15,23,42,0.03);
  transition: border-color 420ms ease;
}
.cl-val-text { flex: 1; min-width: 0; }
.cl-val-label {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 3px;
}
.cl-val-val {
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 0.84rem;
  line-height: 1.35;
  word-break: break-all;
}
.cl-val-copy {
  flex-shrink: 0;
  width: 30px; height: 30px;
  border-radius: 8px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  cursor: pointer;
  font-size: 0.64rem;
  font-weight: 700;
  color: var(--muted);
  transition: background 110ms ease, color 110ms ease, border-color 110ms ease;
}
.cl-val-copy:hover { background: var(--cl-accent); color: #fff; border-color: transparent; }

/* ── Variations ── */
.cl-var-row { margin-bottom: 12px; }
.cl-var-label { font-size: 0.72rem; font-weight: 700; color: var(--muted); margin-bottom: 5px; }
.cl-var-strip {
  display: flex;
  border-radius: 13px;
  overflow: hidden;
  height: 58px;
}
.cl-var-cell {
  flex: 1;
  cursor: pointer;
  position: relative;
  transition: flex 230ms cubic-bezier(0.34,1.56,0.64,1);
}
.cl-var-cell:hover { flex: 2.2; }
.cl-var-hex {
  position: absolute;
  bottom: 5px; left: 50%;
  transform: translateX(-50%);
  font-size: 0.53rem;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 4px;
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
  transition: opacity 130ms ease;
}
.cl-var-cell:hover .cl-var-hex { opacity: 1; }

/* ── Harmonies ── */
.cl-harmony-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(215px, 1fr));
}
.cl-harmony-card {
  padding: 15px 16px;
  border-radius: 15px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 2px 8px rgba(15,23,42,0.03);
}
.cl-harmony-name { font-size: 0.84rem; font-weight: 700; margin-bottom: 2px; }
.cl-harmony-desc { font-size: 0.71rem; color: var(--muted); line-height: 1.5; margin-bottom: 11px; }
.cl-harmony-swatches { display: flex; gap: 7px; flex-wrap: wrap; }
.cl-h-swatch {
  width: 40px; height: 40px;
  border-radius: 11px;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.14);
  transition: transform 130ms ease, box-shadow 130ms ease;
}
.cl-h-swatch:hover { transform: translateY(-3px); box-shadow: 0 6px 14px rgba(0,0,0,0.2); }

/* ── Contrast ── */
.cl-contrast-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(196px, 1fr));
}
.cl-contrast-card { border-radius: 15px; overflow: hidden; border: 1px solid var(--border); box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 2px 8px rgba(15,23,42,0.03); }
.cl-contrast-preview {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 700;
}
.cl-contrast-body { padding: 11px 13px; background: var(--surface); }
.cl-contrast-against { font-size: 0.7rem; color: var(--muted); margin-bottom: 3px; }
.cl-contrast-ratio { font-family: "SFMono-Regular",Consolas,monospace; font-size: 1rem; font-weight: 700; }
.cl-badges { display: flex; gap: 5px; margin-top: 6px; flex-wrap: wrap; }
.cl-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.cl-badge.pass { background: rgba(34,197,94,0.13); color: #15803d; }
.cl-badge.fail { background: rgba(239,68,68,0.11); color: #b91c1c; }
body.dark .cl-badge.pass { background: rgba(34,197,94,0.2); color: #86efac; }
body.dark .cl-badge.fail { background: rgba(239,68,68,0.18); color: #fca5a5; }

/* ── Mixer ── */
.cl-mix-desc { font-size: 0.8rem; color: var(--muted); margin: 0 0 10px; }
.cl-mix-layout {
  display: flex;
  border-radius: 15px;
  overflow: hidden;
  height: 74px;
  border: 1px solid var(--border);
}
.cl-mix-anchor {
  width: 74px;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  transition: width 150ms ease;
}
.cl-mix-anchor:hover { width: 82px; }
.cl-mix-anchor input[type="color"] {
  position: absolute;
  width: 160%; height: 160%;
  top: -30%; left: -30%;
  opacity: 0; cursor: pointer; border: none; padding: 0;
}
.cl-mix-strip { display: flex; flex: 1; }
.cl-mix-cell { flex: 1; cursor: pointer; transition: flex 190ms ease; }
.cl-mix-cell:hover { flex: 1.8; }

/* ── Named Colors ── */
.cl-names-list { display: grid; gap: 6px; }
.cl-name-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 13px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(15,23,42,0.05);
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: transform 130ms ease, background 130ms ease;
}
.cl-name-row:hover { transform: translateX(3px); background: var(--surface-soft); }
.cl-name-dot { width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.14); }
.cl-name-info { flex: 1; min-width: 0; }
.cl-name-primary { font-size: 0.86rem; font-weight: 600; display: block; }
.cl-name-secondary { font-size: 0.7rem; color: var(--muted); display: block; }
.cl-name-dist { font-family: monospace; font-size: 0.68rem; color: var(--muted); flex-shrink: 0; }

/* ── Export ── */
.cl-export-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
}
.cl-export-card {
  padding: 12px 15px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(15,23,42,0.05);
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 120ms ease;
}
.cl-export-card:hover { background: var(--surface-soft); }
.cl-export-name {
  display: block;
  font-size: 0.62rem;
  font-weight: 800;
  color: var(--muted);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.cl-export-value {
  display: block;
  font-family: "SFMono-Regular",Consolas,monospace;
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Toast ── */
.cl-toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: rgba(17, 24, 39, 0.92);
  color: #fff;
  padding: 9px 18px 9px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 9px;
  opacity: 0;
  transition: opacity 200ms ease, transform 200ms ease;
  z-index: 9999;
  pointer-events: none;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.28);
  white-space: nowrap;
}
.cl-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

@media (max-width: 760px) {
  .colorlab { padding: 0 12px 48px; }
  .cl-hero-strip { height: 120px; }
  .cl-values-grid { grid-template-columns: 1fr 1fr; }
  .cl-harmony-grid { grid-template-columns: 1fr; }
  .cl-contrast-grid { grid-template-columns: 1fr 1fr; }
  .cl-export-grid { grid-template-columns: 1fr; }
}
`;

type HarmonyMap = Record<string, string[]>;

function ensureCss(id: string, css: string) {
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.append(style);
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function toHex(color: Color) {
  return color.to("srgb").toString({ format: "hex" }).toUpperCase();
}

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((ch) => clamp(Math.round(ch), 0, 255).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function hexToRgba(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rotateHue(hex: string, degrees: number) {
  const [h, s, l] = new Color(hex).to("hsl").coords as [number, number, number];
  return toHex(new Color("hsl", [(h + degrees + 360) % 360, s, l]));
}

function withLightness(hex: string, lightness: number) {
  const [h, s] = new Color(hex).to("hsl").coords as [number, number, number];
  return toHex(new Color("hsl", [h, s, clamp(lightness, 0, 100)]));
}

function mixHex(hexA: string, hexB: string, ratio: number) {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const t = clamp(ratio, 0, 1);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

function spreadMix(baseHex: string, targetHex: string, count: number) {
  return Array.from({ length: count }, (_, i) =>
    mixHex(baseHex, targetHex, count === 1 ? 0 : i / (count - 1)),
  );
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  if (r === 0 && g === 0 && b === 0) return [0, 0, 0, 100];
  const c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255;
  const k = Math.min(c, m, y);
  return [
    round(((c - k) / (1 - k)) * 100),
    round(((m - k) / (1 - k)) * 100),
    round(((y - k) / (1 - k)) * 100),
    round(k * 100),
  ];
}

function channelToLinear(v: number) {
  const n = v / 255;
  return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

function getContrastRatio(a: string, b: string) {
  const la = relativeLuminance(a), lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function textColorFor(hex: string) {
  return getContrastRatio(hex, "#111111") >= 4.5 ? "#111111" : "#FFFFFF";
}

function getTemperature(hex: string) {
  const [hue] = new Color(hex).to("hsl").coords as [number, number, number];
  if ((hue >= 0 && hue < 70) || hue >= 320) return "Warm";
  if (hue >= 80 && hue < 190) return "Fresh";
  if (hue >= 190 && hue < 290) return "Cool";
  return "Balanced";
}

function getMood(hex: string) {
  const [, s, l] = new Color(hex).to("hsl").coords as [number, number, number];
  if (l >= 78) return "Light & airy";
  if (l <= 20) return "Dark & grounded";
  if (s >= 72) return "Energetic";
  if (s <= 28) return "Muted";
  return "Steady";
}

function getPalettes(hex: string): HarmonyMap {
  const [h, s] = new Color(hex).to("hsl").coords as [number, number, number];
  const material = [96, 88, 78, 64, 50, 36, 24].map((l) =>
    toHex(new Color("hsl", [h, clamp(s * 0.9 + 6, 0, 100), l])),
  );
  return {
    Tints: spreadMix(hex, "#FFFFFF", 10),
    Shades: spreadMix(hex, "#111111", 10),
    Tones: spreadMix(hex, "#808080", 10),
    Material: material,
  };
}

function getRandomColor() {
  return toHex(new Color("hsl", [Math.floor(Math.random() * 360), Math.floor(Math.random() * 35) + 55, Math.floor(Math.random() * 36) + 32]));
}

function buildValues(hex: string) {
  const color = new Color(hex);
  const [r, g, b] = (color.to("srgb").coords as [number, number, number]).map((v) => Math.round(v * 255)) as [number, number, number];
  const [h, s, l] = color.to("hsl").coords as [number, number, number];
  const [hwbH, white, black] = color.to("hwb").coords as [number, number, number];
  const [labL, labA, labB] = color.to("lab").coords as [number, number, number];
  const [lchL, chroma, lchHue] = color.to("lch").coords as [number, number, number];
  const [x, y, z] = color.to("xyz-d65").coords as [number, number, number];
  const [c, m, yk, k] = rgbToCmyk(r, g, b);
  return [
    ["HEX", hex],
    ["RGB", `${r}, ${g}, ${b}`],
    ["HSL", `${round(h)}° ${round(s)}% ${round(l)}%`],
    ["HWB", `${round(hwbH)}° ${round(white)}% ${round(black)}%`],
    ["LAB", `${round(labL, 1)}, ${round(labA, 1)}, ${round(labB, 1)}`],
    ["LCH", `${round(lchL, 1)}, ${round(chroma, 1)}, ${round(lchHue, 1)}°`],
    ["XYZ", `${round(x, 3)}, ${round(y, 3)}, ${round(z, 3)}`],
    ["CMYK", `${c}%, ${m}%, ${yk}%, ${k}%`],
  ];
}

function buildExports(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = new Color(hex).to("hsl").coords as [number, number, number];
  return [
    ["CSS Variable", `--color: ${hex};`],
    ["SCSS Variable", `$color: ${hex};`],
    ["Tailwind Token", `'brand': '${hex}'`],
    ["JSON", `{"color":"${hex}"}`],
    ["RGB CSS", `rgb(${r} ${g} ${b})`],
    ["HSL CSS", `hsl(${round(h)}deg ${round(s)}% ${round(l)}%)`],
    ["Swift", `UIColor(red: ${(r/255).toFixed(3)}, green: ${(g/255).toFixed(3)}, blue: ${(b/255).toFixed(3)}, alpha: 1)`],
    ["Android", `Color.parseColor("${hex}")`],
  ];
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

let _toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(hex: string) {
  let toast = document.getElementById("cl-hex-toast") as HTMLDivElement | null;
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cl-hex-toast";
    toast.className = "cl-toast";
    document.body.append(toast);
  }
  if (_toastTimer !== null) clearTimeout(_toastTimer);

  const dot = document.createElement("span");
  dot.style.cssText = `width:11px;height:11px;border-radius:50%;background:${hex};flex-shrink:0;display:block;border:1.5px solid rgba(255,255,255,0.22);`;
  const msg = document.createElement("span");
  msg.textContent = `${hex} copied to clipboard`;
  toast.replaceChildren(dot, msg);

  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");

  _toastTimer = setTimeout(() => {
    (document.getElementById("cl-hex-toast") as HTMLDivElement | null)?.classList.remove("show");
    _toastTimer = null;
  }, 2000);
}

const HARMONY_DEFS: Array<{ label: string; desc: string; fn: (hex: string) => string[] }> = [
  { label: "Complementary",      desc: "Opposite on the wheel — strong contrast, high energy.",         fn: (h) => [h, rotateHue(h, 180)] },
  { label: "Analogous",          desc: "Adjacent hues — harmonious and natural-looking.",               fn: (h) => [rotateHue(h,-30), h, rotateHue(h,30)] },
  { label: "Triadic",            desc: "Three equidistant hues — vibrant and balanced.",                fn: (h) => [h, rotateHue(h,120), rotateHue(h,240)] },
  { label: "Split-complementary",desc: "Base + neighbors of complement — softer than complementary.",   fn: (h) => [h, rotateHue(h,150), rotateHue(h,210)] },
  { label: "Tetradic",           desc: "Four equidistant hues — rich and versatile.",                  fn: (h) => [h, rotateHue(h,90), rotateHue(h,180), rotateHue(h,270)] },
  { label: "Monochromatic",      desc: "Single hue, varied lightness — elegant and unified.",          fn: (h) => [20,35,50,65,80].map((l) => withLightness(h, l)) },
];

const CONTRAST_PAIRS: Array<{ bg: string; fg: "hex" | string; label: string }> = [
  { bg: "#FFFFFF",  fg: "hex",     label: "Color on White"  },
  { bg: "#111111",  fg: "hex",     label: "Color on Black"  },
  { bg: "#F4F0E8",  fg: "hex",     label: "Color on Cream"  },
  { bg: "#1A2332",  fg: "hex",     label: "Color on Navy"   },
  { bg: "hex",      fg: "#FFFFFF", label: "White on Color"  },
  { bg: "hex",      fg: "#111111", label: "Black on Color"  },
];

const ColorLab: Page = {
  title: "ColorLab",
  mount(root) {
    ensureCss("colorlab-css", CSS);

    const INITIAL = "#487A57";
    let current = INITIAL;
    let mixB = "#E07A5F";

    const wrap = el("div", "colorlab");
    root.append(wrap);

    /* ── Hero ─────────────────────────────────────────────── */
    const heroDiv   = el("div", "cl-hero");
    const heroStrip = el("div", "cl-hero-strip");
    const heroBar   = el("div", "cl-hero-bar");

    const chip = el("div", "cl-chip") as HTMLDivElement;
    chip.title = "Click to pick color";
    chip.addEventListener("click", () => mainPicker.click());

    const heroMeta = el("div", "cl-hero-meta");
    const heroHex  = el("div", "cl-hero-hex", INITIAL);
    const heroName = el("div", "cl-hero-name", "—");
    heroMeta.append(heroHex, heroName);

    const controls   = el("div", "cl-controls");
    const pickerWrap = el("div", "cl-picker-wrap");
    const mainPicker = el("input") as HTMLInputElement;
    mainPicker.type  = "color";
    mainPicker.value = INITIAL;
    pickerWrap.append(mainPicker);

    const hexInput       = el("input", "cl-hex-input") as HTMLInputElement;
    hexInput.type        = "text";
    hexInput.value       = INITIAL;
    hexInput.spellcheck  = false;
    hexInput.placeholder = "#RRGGBB";

    const randBtn  = el("button", "cl-rand-btn", "↺ Random") as HTMLButtonElement;
    randBtn.type   = "button";

    controls.append(pickerWrap, hexInput, randBtn);
    heroBar.append(chip, heroMeta, controls);

    const statusDiv = el("div", "cl-status");
    heroDiv.append(heroStrip, heroBar, statusDiv);
    wrap.append(heroDiv);

    /* ── Section helper ───────────────────────────────────── */
    function sec(label: string) {
      const s    = el("div", "cl-sec");
      const head = el("div", "cl-sec-head");
      head.append(el("span", "cl-sec-label", label), el("div", "cl-sec-rule"));
      s.append(head);
      return s;
    }

    /* ── Values ───────────────────────────────────────────── */
    const valSec  = sec("Color Values");
    const valGrid = el("div", "cl-values-grid");
    valSec.append(valGrid);
    wrap.append(valSec);

    /* ── Variations ───────────────────────────────────────── */
    const varSec = sec("Variations");
    function makeVarRow(label: string) {
      const row   = el("div", "cl-var-row");
      const strip = el("div", "cl-var-strip");
      row.append(el("div", "cl-var-label", label), strip);
      varSec.append(row);
      return strip;
    }
    const tintsStrip    = makeVarRow("Tints");
    const shadesStrip   = makeVarRow("Shades");
    const tonesStrip    = makeVarRow("Tones");
    const materialStrip = makeVarRow("Material Scale");
    wrap.append(varSec);

    /* ── Harmonies ────────────────────────────────────────── */
    const harmSec  = sec("Color Harmonies");
    const harmGrid = el("div", "cl-harmony-grid");
    harmSec.append(harmGrid);
    wrap.append(harmSec);

    /* ── Contrast ─────────────────────────────────────────── */
    const contSec  = sec("Contrast & Accessibility");
    const contGrid = el("div", "cl-contrast-grid");
    contSec.append(contGrid);
    wrap.append(contSec);

    /* ── Mixer ────────────────────────────────────────────── */
    const mixSec    = sec("Color Mixer");
    const mixDesc   = el("p", "cl-mix-desc", "Mix the current color with any other — click a blend result to apply it.");
    const mixLayout = el("div", "cl-mix-layout");
    const mixAPane  = el("div", "cl-mix-anchor");
    mixAPane.title  = "Current color";
    const mixStrip  = el("div", "cl-mix-strip");
    const mixBPane  = el("div", "cl-mix-anchor");
    mixBPane.title  = "Click to change second color";
    const mixBPicker       = el("input") as HTMLInputElement;
    mixBPicker.type        = "color";
    mixBPicker.value       = mixB;
    mixBPane.append(mixBPicker);
    mixLayout.append(mixAPane, mixStrip, mixBPane);
    mixSec.append(mixDesc, mixLayout);
    wrap.append(mixSec);

    /* ── Named Colors ─────────────────────────────────────── */
    const namesSec  = sec("Nearest Named Colors");
    const namesList = el("div", "cl-names-list");
    namesSec.append(namesList);
    wrap.append(namesSec);

    /* ── Export ───────────────────────────────────────────── */
    const expSec  = sec("Export Code");
    const expGrid = el("div", "cl-export-grid");
    expSec.append(expGrid);
    wrap.append(expSec);

    /* ── Render functions ─────────────────────────────────── */

    function renderHero(hex: string) {
      const [,,l] = new Color(hex).to("hsl").coords as [number, number, number];
      const tint = withLightness(hex, Math.min(90, l + 34));
      heroStrip.style.background = `linear-gradient(120deg, ${hex} 0%, ${tint} 100%)`;
      chip.style.background = hex;
      mainPicker.value = hex;
      hexInput.value   = hex;
      heroHex.textContent = hex;
      const match = closestNames(hex, 1)[0];
      heroName.textContent = match
        ? `${match.name} · ${getTemperature(hex)} · ${getMood(hex)}`
        : `${getTemperature(hex)} · ${getMood(hex)}`;
    }

    function renderValues(hex: string) {
      valGrid.innerHTML = "";
      buildValues(hex).forEach(([label, value]) => {
        const card    = el("div", "cl-val");
        const txt     = el("div", "cl-val-text");
        const lbl     = el("div", "cl-val-label", label);
        const val     = el("div", "cl-val-val", value);
        const copyBtn = el("button", "cl-val-copy", "Copy") as HTMLButtonElement;
        copyBtn.type  = "button";
        copyBtn.addEventListener("click", async () => {
          await copyText(value);
          copyBtn.textContent = "✓";
          setTimeout(() => { copyBtn.textContent = "Copy"; }, 1000);
        });
        txt.append(lbl, val);
        card.append(txt, copyBtn);
        valGrid.append(card);
      });
    }

    function fillStrip(strip: HTMLElement, colors: string[]) {
      strip.innerHTML = "";
      colors.forEach((c) => {
        const cell    = el("div", "cl-var-cell");
        cell.style.background = c;
        const tc      = textColorFor(c);
        const hexLbl  = el("span", "cl-var-hex", c);
        hexLbl.style.color      = tc;
        hexLbl.style.background = tc === "#111111" ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.32)";
        cell.append(hexLbl);
        cell.addEventListener("click", () => updateAll(c));
        strip.append(cell);
      });
    }

    function renderVariations(hex: string) {
      const p = getPalettes(hex);
      fillStrip(tintsStrip,    p["Tints"]);
      fillStrip(shadesStrip,   p["Shades"]);
      fillStrip(tonesStrip,    p["Tones"]);
      fillStrip(materialStrip, p["Material"]);
    }

    function renderHarmonies(hex: string) {
      harmGrid.innerHTML = "";
      HARMONY_DEFS.forEach(({ label, desc, fn }) => {
        const card     = el("div", "cl-harmony-card");
        const swatches = el("div", "cl-harmony-swatches");
        fn(hex).forEach((c) => {
          const btn  = el("button", "cl-h-swatch") as HTMLButtonElement;
          btn.type   = "button";
          btn.style.background = c;
          btn.title  = `Click to copy ${c}`;
          btn.addEventListener("click", async () => {
            await copyText(c);
            showToast(c);
          });
          swatches.append(btn);
        });
        card.append(el("div", "cl-harmony-name", label), el("div", "cl-harmony-desc", desc), swatches);
        harmGrid.append(card);
      });
    }

    function renderContrast(hex: string) {
      contGrid.innerHTML = "";
      CONTRAST_PAIRS.forEach(({ bg, fg, label }) => {
        const resolvedBg = bg === "hex" ? hex : bg;
        const resolvedFg = fg === "hex" ? hex : fg;
        const ratio      = round(getContrastRatio(resolvedBg, resolvedFg), 2);
        const passAA     = ratio >= 4.5;
        const passAAA    = ratio >= 7;
        const passLarge  = ratio >= 3;

        const card    = el("div", "cl-contrast-card");
        const preview = el("div", "cl-contrast-preview", "Aa");
        preview.style.background = resolvedBg;
        preview.style.color      = resolvedFg;

        const body    = el("div", "cl-contrast-body");
        const badges  = el("div", "cl-badges");
        badges.append(
          el("span", `cl-badge ${passAA    ? "pass" : "fail"}`, `AA ${passAA    ? "✓" : "✗"}`),
          el("span", `cl-badge ${passAAA   ? "pass" : "fail"}`, `AAA ${passAAA  ? "✓" : "✗"}`),
          el("span", `cl-badge ${passLarge ? "pass" : "fail"}`, `Large ${passLarge ? "✓" : "✗"}`),
        );
        body.append(
          el("div", "cl-contrast-against", label),
          el("div", "cl-contrast-ratio",  `${ratio.toFixed(2)} : 1`),
          badges,
        );
        card.append(preview, body);
        contGrid.append(card);
      });
    }

    function renderMixer(hex: string) {
      mixAPane.style.background = hex;
      mixBPane.style.background = mixB;
      mixStrip.innerHTML        = "";
      spreadMix(hex, mixB, 7).forEach((c) => {
        const cell = el("div", "cl-mix-cell");
        cell.style.background = c;
        cell.title = c;
        cell.addEventListener("click", () => updateAll(c));
        mixStrip.append(cell);
      });
    }

    function renderNames(hex: string) {
      namesList.innerHTML = "";
      closestNames(hex, 10).forEach((match) => {
        const btn  = el("button", "cl-name-row") as HTMLButtonElement;
        btn.type   = "button";
        const dot  = el("div", "cl-name-dot");
        dot.style.background = match.swatch;
        const info = el("div", "cl-name-info");
        info.append(
          el("span", "cl-name-primary",   match.name),
          el("span", "cl-name-secondary", `${match.swatch} · ${match.palette}`),
        );
        const dist = el("span", "cl-name-dist", `Δ${round(match.distance, 1)}`);
        btn.append(dot, info, dist);
        btn.addEventListener("click", () => updateAll(match.swatch));
        namesList.append(btn);
      });
    }

    function renderExport(hex: string) {
      expGrid.innerHTML = "";
      buildExports(hex).forEach(([label, value]) => {
        const card = el("button", "cl-export-card") as HTMLButtonElement;
        card.type  = "button";
        card.append(el("span", "cl-export-name", label), el("span", "cl-export-value", value));
        card.addEventListener("click", async () => {
          await copyText(value);
          const n = card.querySelector(".cl-export-name")!;
          n.textContent = `${label} — copied!`;
          setTimeout(() => { n.textContent = label; }, 1100);
        });
        expGrid.append(card);
      });
    }

    function applyAll(hex: string) {
      current = hex;
      wrap.style.setProperty("--cl-accent",      hex);
      wrap.style.setProperty("--cl-accent-soft",  hexToRgba(hex, 0.15));
      renderHero(hex);
      renderValues(hex);
      renderVariations(hex);
      renderHarmonies(hex);
      renderContrast(hex);
      renderMixer(hex);
      renderNames(hex);
      renderExport(hex);
    }

    function updateAll(input: string) {
      try {
        applyAll(normHex(input));
        hexInput.classList.remove("bad");
        statusDiv.textContent = "";
      } catch {
        hexInput.classList.add("bad");
        statusDiv.textContent = "Enter a valid 3 or 6 digit hex value.";
      }
    }

    /* ── Events ───────────────────────────────────────────── */
    mainPicker.addEventListener("input", () => updateAll(mainPicker.value));
    randBtn.addEventListener("click",   () => updateAll(getRandomColor()));

    hexInput.addEventListener("input", () => {
      const raw  = hexInput.value.trim();
      const cand = raw.startsWith("#") ? raw : `#${raw}`;
      if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(cand)) {
        updateAll(cand);
      } else {
        hexInput.classList.add("bad");
        statusDiv.textContent = "Enter a valid 3 or 6 digit hex value.";
      }
    });

    hexInput.addEventListener("blur", () => {
      if (hexInput.classList.contains("bad")) {
        hexInput.value = current;
        hexInput.classList.remove("bad");
        statusDiv.textContent = "";
      }
    });

    mixBPicker.addEventListener("input", () => {
      mixB = mixBPicker.value;
      renderMixer(current);
    });

    applyAll(INITIAL);
  },
};

export default ColorLab;
