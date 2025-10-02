// src/pages/colorlab.ts
import type { Page } from "../router";
import Color from "colorjs.io";
import { normHex, closestNames } from "../libs/Color";

/* ------------------------------- Scoped CSS -------------------------------- */

const CSS = `
.colorlab .stack > * + * { margin-top: 12px; }
.colorlab .row { display:flex; align-items:center; gap:8px; }
.colorlab .grid { display:grid; gap:10px; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); }
.colorlab .field label { display:block; font-size:12px; color:#555; margin-bottom:4px; }
.colorlab .field input { width:100%; padding:8px 10px; border:1px solid #ddd; border-radius:10px; outline:none; }
.colorlab .field input.bad { border-color:#f55; background:#fff5f5; }
.colorlab .field button { padding:8px 10px; border:1px solid #ddd; background:#f8f8f8; border-radius:10px; cursor:pointer; user-select:none; }
.colorlab .chip { width:44px; height:44px; border-radius:10px; border:1px solid #0001; }
.colorlab .hexbig { font-family: ui-monospace,SFMono-Regular,Menlo,monospace; opacity:.9; }

.colorlab .related-list { margin-top: 6px; }
.colorlab .related-row { border-radius:16px; padding:14px 16px; box-shadow: inset 0 0 0 1px #0001; }
`;

function ensureCss(id: string, css: string) {
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.append(style);
}

/* ------------------------------- UI helpers -------------------------------- */

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text) e.textContent = text;
  return e as HTMLElementTagNameMap[K];
}

function copyField(id: string, label: string): {
  wrap: HTMLDivElement;
  input: HTMLInputElement;
  button: HTMLButtonElement;
} {
  const wrap = el("div", "field");
  const lab = el("label"); lab.htmlFor = id; lab.textContent = label;

  const row = el("div", "row");
  const input = el("input"); input.id = id; (input as HTMLInputElement).readOnly = true;

  const btn = el("button");
  (btn as HTMLButtonElement).type = "button";
  (btn as HTMLButtonElement).title = "Copy";
  btn.textContent = "⧉";
  btn.addEventListener("click", async () => {
    await navigator.clipboard.writeText((input as HTMLInputElement).value);
    btn.textContent = "✓"; setTimeout(() => (btn.textContent = "⧉"), 800);
  });

  row.append(input, btn);
  wrap.append(lab, row);
  return { wrap, input: input as HTMLInputElement, button: btn as HTMLButtonElement };
}

/* --------------------------- Conversion utilities -------------------------- */

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  if (r === 0 && g === 0 && b === 0) return [0, 0, 0, 100];
  const c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255;
  const k = Math.min(c, m, y);
  return [
    Math.round(((c - k) / (1 - k)) * 100),
    Math.round(((m - k) / (1 - k)) * 100),
    Math.round(((y - k) / (1 - k)) * 100),
    Math.round(k * 100),
  ];
}
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function textColorFor(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L < 140 ? "#fff" : "#111";
}

/* ---------------------------------- Page ----------------------------------- */

const colorlab: Page = {
  title: "colorlab",
  mount(root) {
    ensureCss("colorlab-css", CSS);

    const wrap = el("div", "colorlab");
    const section = el("section", "stack");
    const h2 = el("h2", "", "Color Conversion");

    // Picker + HEX
    const pickRow = el("div", "row");
    const pickLabel = el("label", "", "Pick");
    const picker = el("input") as HTMLInputElement;
    picker.type = "color";
    picker.value = "#487a57";

    const hexField = copyField("hex", "HEX");
    hexField.input.readOnly = false; hexField.input.spellcheck = false;

    pickRow.append(pickLabel, picker, hexField.wrap);

    // Swatch + HEX text (no Pantone headline)
    const swatch = el("div", "row");
    const chip = el("div", "chip") as HTMLDivElement;
    const hexBig = el("div", "hexbig");
    swatch.append(chip, hexBig);

    // Outputs
    const grid = el("div", "grid");
    const rgb = copyField("rgb", "RGB");
    const hsl = copyField("hsl", "HSL");
    const hwb = copyField("hwb", "HWB");
    const xyz = copyField("xyz", "XYZ (D65)");
    const lab = copyField("lab", "LAB");
    const luv = copyField("luv", "LUV");
    const cmyk = copyField("cmyk", "CMYK");
    grid.append(rgb.wrap, hsl.wrap, hwb.wrap, xyz.wrap, lab.wrap, luv.wrap, cmyk.wrap);

    // Closely Related only
    const relatedHeader = el("h3", "", "Closely Related");
    const relatedList = el("div", "related-list");

    section.append(h2, pickRow, swatch, grid, relatedHeader, relatedList);
    wrap.append(section);
    root.append(wrap);

    /* ------------------------------- Behavior ------------------------------- */

    function renderRelated(hex: string) {
      relatedList.innerHTML = "";
      const rows = closestNames(hex, 8);
      for (const r of rows) {
        const item = el("div", "related-row") as HTMLDivElement;
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.justifyContent = "space-between";

        item.style.backgroundColor = r.swatch;
        const fg = textColorFor(r.swatch);
        item.style.color = fg;

        const left = el("div");
        const name = el("div"); name.style.fontWeight = "600"; name.textContent = r.name;
        const hexLine = el("div");
        hexLine.style.opacity = "0.9";
        hexLine.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, monospace";
        hexLine.textContent = r.swatch;
        left.append(name, hexLine);

        const badge = el("div");
        badge.textContent = r.palette;
        badge.style.fontSize = "12px";
        badge.style.padding = "4px 8px";
        badge.style.borderRadius = "999px";
        badge.style.backgroundColor = fg === "#fff" ? "#ffffff33" : "#00000014";
        badge.style.boxShadow = "inset 0 0 0 1px " + (fg === "#fff" ? "#ffffff55" : "#0001");
        badge.style.color = fg;

        item.append(left, badge);
        relatedList.append(item);
      }
    }

    function updateAll(fromHex: string) {
      const hx = normHex(fromHex);
      const c = new Color(hx);

      picker.value = hx;
      hexField.input.value = hx;
      hexBig.textContent = hx;
      chip.style.backgroundColor = hx;

      const rgbCoords = c.to("srgb").coords.map(v => Math.round(v * 255)) as [number, number, number];
      const hslCoords = c.to("hsl").coords.map((v, i) => (i === 0 ? Math.round(v) : Math.round(v * 100))) as [number, number, number];
      const hwbCoords = c.to("hwb").coords.map((v, i) => (i === 0 ? Math.round(v) : Math.round(v * 100))) as [number, number, number];
      const xyzCoords = c.to("xyz-d65").coords.map(v => Math.round(v * 100)) as [number, number, number];
      const labCoords = c.to("lab").coords.map(v => Math.round(v)) as [number, number, number];
      const luvCoords = c.to("luv").coords.map(v => Math.round(v)) as [number, number, number];

      const [r, g, b] = rgbCoords;
      const cmykCoords = rgbToCmyk(r, g, b);

      rgb.input.value  = `${r}, ${g}, ${b}`;
      hsl.input.value  = `${hslCoords[0]}, ${hslCoords[1]}, ${hslCoords[2]}`;
      hwb.input.value  = `${hwbCoords[0]}, ${hwbCoords[1]}, ${hwbCoords[2]}`;
      xyz.input.value  = `${xyzCoords[0]}, ${xyzCoords[1]}, ${xyzCoords[2]}`;
      lab.input.value  = `${labCoords[0]}, ${labCoords[1]}, ${labCoords[2]}`;
      luv.input.value  = `${luvCoords[0]}, ${luvCoords[1]}, ${luvCoords[2]}`;
      cmyk.input.value = `${cmykCoords[0]}, ${cmykCoords[1]}, ${cmykCoords[2]}, ${cmykCoords[3]}`;

      renderRelated(hx);
    }

    picker.addEventListener("input", e => updateAll((e.target as HTMLInputElement).value));
    hexField.input.addEventListener("input", () => {
      try { updateAll(hexField.input.value); hexField.input.classList.remove("bad"); }
      catch { hexField.input.classList.add("bad"); }
    });

    updateAll(picker.value);
  },
};

export default colorlab;
