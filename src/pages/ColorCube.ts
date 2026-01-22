import type { Page } from "../router";

const ColorCubePage: Page = {
  title: "ColorCube",
  mount(root) {
    root.innerHTML = `
      <div class="ccRoot">
        <canvas id="c"></canvas>

        <!-- Hover preview -->
        <div class="ccHover" id="ccHover" aria-hidden="true">
          <span class="ccHoverSw" id="ccHoverSw"></span>
          <span class="ccHoverTxt" id="ccHoverTxt">#FFFFFF</span>
        </div>

        <aside class="ccDock" aria-label="ColorCube dock">
          <div class="ccDockTop">
            <div class="ccRow">
              <div class="ccSwatch" id="swatch"></div>
              <div class="ccMono" id="readout">#FFFFFF · RGB 255 255 255 · CMY C0 M0 Y0</div>
            </div>

            <div class="ccRow">
              <button class="ccBtn" id="copyBtn">Copy</button>
              <button class="ccBtn" id="addBtn">Add</button>
              <button class="ccBtn ccBtnGhost" id="resetBtn">Reset</button>
            </div>

            <div class="ccTiny">
              Drag to rotate · Click or Right-click to sample · Hover to preview
            </div>
          </div>

          <div class="ccPanel">
            <div class="ccPanelTitle">Background</div>

            <div class="ccRow2">
              <label class="ccLab">
                Color
                <input id="bgColor" type="color" value="#111111" />
              </label>

              <label class="ccToggle">
                <input id="checker" type="checkbox" />
                Checker
              </label>
            </div>

            <div class="ccChipsRow">
              <button class="ccChipBtn2" data-bg="#111111">Dark</button>
              <button class="ccChipBtn2" data-bg="#F5F5F5">Light</button>
              <button class="ccChipBtn2" data-bg="#0B1B2B">Navy</button>
              <button class="ccChipBtn2" data-bg="#2B0B1F">Plum</button>
              <button class="ccChipBtn2" data-bg="#1B2B0B">Olive</button>
            </div>
          </div>

          <div class="ccPanel">
            <div class="ccPanelTitle">Cube</div>

            <div class="ccRow2">
              <label class="ccLab ccLabWide">
                Translucency
                <input id="alpha" type="range" min="15" max="100" value="55" />
                <span class="ccVal" id="alphaVal">55%</span>
              </label>
            </div>

            <div class="ccRow2">
              <label class="ccLab ccLabWide">
                Blend
                <select id="blend">
                  <option value="multiply" selected>Multiply (ink / glass)</option>
                  <option value="source-over">Normal</option>
                  <option value="overlay">Overlay</option>
                  <option value="screen">Screen</option>
                </select>
              </label>

              <label class="ccToggle">
                <input id="outline" type="checkbox" checked />
                Outline
              </label>
            </div>

            <div class="ccTiny">
              Screen/Overlay can look faint on white — an automatic vignette helps contrast.
            </div>
          </div>

          <div class="ccPanel">
            <div class="ccPanelTitle">Palette</div>
            <div class="ccPalette" id="palette"></div>

            <div class="ccRow2">
              <button class="ccBtn ccBtnGhost" id="exportJson">JSON</button>
              <button class="ccBtn ccBtnGhost" id="exportCss">CSS</button>
              <button class="ccBtn ccBtnGhost" id="clearPalette">Clear</button>
            </div>
            <div class="ccTiny" id="exportHint"></div>
          </div>
        </aside>
      </div>
    `;

    // ---------- styles ----------
    const style = document.createElement("style");
    style.textContent = `
      :root{
        --cc-radius-lg: 18px;
        --cc-radius-md: 14px;
        --cc-radius-sm: 12px;
        --cc-border: rgba(255,255,255,0.10);
        --cc-border-soft: rgba(255,255,255,0.08);
        --cc-glass: rgba(20,20,24,0.72);
        --cc-panel: rgba(255,255,255,0.05);
        --cc-panel2: rgba(255,255,255,0.035);
        --cc-text-soft: rgba(255,255,255,0.78);
      }

      .ccRoot{
        position:relative;
        width:100%;
        height:100vh;
        margin:0;
        overflow:hidden;
        background:#0e0e11;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
      }
      #c{ display:block; width:100%; height:100%; }

      /* Hover preview tooltip */
      .ccHover{
        position:absolute;
        z-index: 3;
        pointer-events:none;
        display:none;
        align-items:center;
        gap:8px;
        padding:8px 10px;
        border-radius: 12px;
        background: rgba(0,0,0,0.60);
        border: 1px solid var(--cc-border-soft);
        backdrop-filter: blur(12px);
        color:#fff;
        box-shadow: 0 14px 44px rgba(0,0,0,0.35);
        transform: translate(12px, 12px);
      }
      .ccHoverSw{
        width:14px; height:14px;
        border-radius: 5px;
        border: 1px solid rgba(255,255,255,0.22);
        box-shadow: inset 0 0 0 1px rgba(0,0,0,0.25);
        background:#fff;
        flex: 0 0 auto;
      }
      .ccHoverTxt{
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 12px;
        opacity: 0.95;
      }

      /* Dock on the RIGHT */
      .ccDock{
        position:absolute;
        top:16px;
        right:16px;
        bottom:16px;
        width: 368px;
        max-width: calc(100vw - 32px);
        z-index:2;

        overflow:auto;
        padding: 14px;

        /* Theme vars updated by selection */
        --dock-accent: #FFFFFF;
        --dock-tint-1: rgba(255,255,255,0.18);
        --dock-tint-2: rgba(255,255,255,0.10);
        --dock-surface: rgba(20,20,24,0.72);
        --dock-border: rgba(255,255,255,0.10);
        --dock-text: #fff;

        color: var(--dock-text);

        background:
          radial-gradient(740px 420px at 12% 0%, var(--dock-tint-1), rgba(0,0,0,0) 62%),
          radial-gradient(680px 420px at 92% 20%, var(--dock-tint-2), rgba(0,0,0,0) 58%),
          var(--dock-surface);

        border: 1px solid var(--dock-border);
        border-radius: var(--cc-radius-lg);
        backdrop-filter: blur(16px);
        box-shadow: 0 24px 70px rgba(0,0,0,0.35);
      }

      .ccDockTop{ margin-bottom: 12px; }
      .ccRow{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
      .ccRow2{ display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-top:10px; }

      .ccSwatch{
        width:34px; height:34px; border-radius:12px;
        border:1px solid rgba(255,255,255,0.18);
        background:#fff;
        box-shadow:
          0 0 0 3px rgba(255,255,255,0.08),
          0 14px 34px rgba(0,0,0,0.28);
        flex: 0 0 auto;
      }

      .ccMono{
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size:12px;
        color: rgba(255,255,255,0.86);
        flex: 1 1 auto;
        min-width: 220px;
      }

      .ccBtn{
        padding:7px 12px;
        border-radius:999px;
        background: rgba(255,255,255,0.10);
        border: 1px solid rgba(255,255,255,0.14);
        color:#fff;
        cursor:pointer;
        font-weight:800;
        font-size:12px;
        letter-spacing: 0.01em;
      }
      .ccBtn:hover{
        background: rgba(255,255,255,0.14);
        border-color: rgba(255,255,255,0.18);
      }
      .ccBtn:active{ transform: translateY(1px); }
      .ccBtnGhost{
        background: transparent;
        border-color: rgba(255,255,255,0.12);
        opacity: 0.82;
      }
      .ccBtnGhost:hover{
        background: rgba(255,255,255,0.08);
        opacity: 1;
      }

      .ccPanel{
        background: linear-gradient(180deg, var(--cc-panel), var(--cc-panel2));
        border: 1px solid rgba(255,255,255,0.10);
        border-radius: var(--cc-radius-md);
        padding: 12px;
        margin-top: 12px;
      }
      .ccPanelTitle{
        font-weight:900;
        font-size:11px;
        opacity:0.62;
        margin-bottom:10px;
        letter-spacing:0.10em;
        text-transform: uppercase;
        display:flex;
        align-items:center;
        gap:8px;
      }
      .ccPanelTitle::before{
        content:"";
        width:10px;
        height:10px;
        border-radius:4px;
        background: var(--dock-accent);
        box-shadow: 0 0 0 3px rgba(255,255,255,0.06);
        opacity: 0.9;
      }

      .ccLab{
        font-size:12px;
        color: var(--cc-text-soft);
        display:flex;
        gap:8px;
        align-items:center;
      }
      .ccLabWide{ width: 100%; justify-content: space-between; }
      .ccLab input[type="range"]{ width: 170px; }
      .ccVal{
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        opacity:0.85;
        color: rgba(255,255,255,0.82);
      }

      .ccToggle{
        font-size:12px;
        color: var(--cc-text-soft);
        display:flex; gap:8px; align-items:center;
      }

      /* Inputs */
      .ccLab select, select{
        appearance: none;
        background: rgba(255,255,255,0.10);
        border: 1px solid rgba(255,255,255,0.14);
        color:#fff;
        border-radius: 999px;
        padding: 7px 34px 7px 12px;
        outline: none;
        font-size: 12px;
        font-weight: 750;
        letter-spacing: 0.01em;

        background-image:
          linear-gradient(45deg, transparent 50%, rgba(255,255,255,0.85) 50%),
          linear-gradient(135deg, rgba(255,255,255,0.85) 50%, transparent 50%);
        background-position:
          calc(100% - 18px) 52%,
          calc(100% - 12px) 52%;
        background-size: 6px 6px;
        background-repeat: no-repeat;
      }
      /* ✅ Fix: dropdown options visibility */
      select option{
        background-color: #111;
        color: #fff;
      }

      input[type="color"]{
        width:38px;
        height:32px;
        padding:0;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.16);
        background: rgba(0,0,0,0.25);
      }

      .ccChipsRow{ display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .ccChipBtn2{
        padding:6px 12px;
        border-radius:999px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.07);
        color:#fff;
        cursor:pointer;
        font-weight:800;
        font-size:11px;
        letter-spacing: 0.01em;
      }
      .ccChipBtn2:hover{ background: rgba(255,255,255,0.12); }

      .ccPalette{
        margin-top:8px;
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        min-height: 34px;
      }
      .ccChip{
        display:flex;
        align-items:center;
        gap:8px;
        padding:6px 10px;
        border-radius:999px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.05);
      }
      .ccChipSw{
        width:14px;
        height:14px;
        border-radius:5px;
        border:1px solid rgba(255,255,255,0.16);
      }
      .ccChipTxt{
        font-size:12px;
        opacity:0.92;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }
      .ccChipBtn{
        margin-left:2px;
        width:24px;
        height:24px;
        border-radius:10px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.08);
        color:#fff;
        cursor:pointer;
        line-height: 22px;
      }
      .ccChipBtn:hover{ background: rgba(255,255,255,0.12); }

      .ccTiny{
        margin-top:8px;
        font-size:11px;
        opacity:0.60;
        color: rgba(255,255,255,0.70);
      }

      /* On small screens, dock becomes bottom sheet */
      @media (max-width: 820px){
        .ccDock{
          left:12px;
          right:12px;
          width:auto;
          top:auto;
          height: auto;
          max-height: 46vh;
        }
      }
    `;
    document.head.appendChild(style);

    const canvas = root.querySelector<HTMLCanvasElement>("#c")!;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    const swatch = root.querySelector<HTMLDivElement>("#swatch")!;
    const readout = root.querySelector<HTMLDivElement>("#readout")!;
    const copyBtn = root.querySelector<HTMLButtonElement>("#copyBtn")!;
    const addBtn = root.querySelector<HTMLButtonElement>("#addBtn")!;
    const resetBtn = root.querySelector<HTMLButtonElement>("#resetBtn")!;
    const paletteEl = root.querySelector<HTMLDivElement>("#palette")!;

    const bgColor = root.querySelector<HTMLInputElement>("#bgColor")!;
    const checker = root.querySelector<HTMLInputElement>("#checker")!;
    const alpha = root.querySelector<HTMLInputElement>("#alpha")!;
    const alphaVal = root.querySelector<HTMLSpanElement>("#alphaVal")!;
    const blend = root.querySelector<HTMLSelectElement>("#blend")!;
    const outline = root.querySelector<HTMLInputElement>("#outline")!;
    const exportJson = root.querySelector<HTMLButtonElement>("#exportJson")!;
    const exportCss = root.querySelector<HTMLButtonElement>("#exportCss")!;
    const clearPalette = root.querySelector<HTMLButtonElement>("#clearPalette")!;
    const exportHint = root.querySelector<HTMLDivElement>("#exportHint")!;

    // hover preview elems
    const hoverEl = root.querySelector<HTMLDivElement>("#ccHover")!;
    const hoverSw = root.querySelector<HTMLSpanElement>("#ccHoverSw")!;
    const hoverTxt = root.querySelector<HTMLSpanElement>("#ccHoverTxt")!;

    // ---------- sizing ----------
    let W = 0,
      H = 0,
      dpr = 1;

    function resize() {
      dpr = window.devicePixelRatio || 1;

      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, Math.floor(rect.width));
      H = Math.max(1, Math.floor(rect.height));

      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener("resize", resize);
    resize();

    // ---------- interaction (drag rotate) ----------
    let rx = -0.6,
      ry = 0.6;
    let dragging = false;
    let px = 0,
      py = 0;
    let dragDist = 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      dragDist = 0;
      px = e.clientX;
      py = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const onUp = () => {
      dragging = false;
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;

      const dx = e.clientX - px;
      const dy = e.clientY - py;
      dragDist += Math.abs(dx) + Math.abs(dy);

      ry += dx * 0.005;
      rx += dy * 0.005;

      px = e.clientX;
      py = e.clientY;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointermove", onMove);

    // ---------- math ----------
    type V3 = [number, number, number];
    type V2 = [number, number];

    const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const rot = ([x, y, z]: V3): V3 => {
      const cy = Math.cos(ry),
        sy = Math.sin(ry);
      const cx = Math.cos(rx),
        sx = Math.sin(rx);

      const x1 = x * cy - z * sy;
      const z1 = x * sy + z * cy;

      const y1 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;

      return [x1, y1, z2];
    };

    const invRot = ([x, y, z]: V3): V3 => {
      const cx = Math.cos(-rx),
        sx = Math.sin(-rx);
      const y1 = y * cx - z * sx;
      const z1 = y * sx + z * cx;

      const cy = Math.cos(-ry),
        sy = Math.sin(-ry);
      const x2 = x * cy - z1 * sy;
      const z2 = x * sy + z1 * cy;

      return [x2, y1, z2];
    };

    let scale = 1;

    // shift cube slightly left so dock never feels like it blocks it
    const proj = ([x, y, z]: V3): V2 => {
      const s = (Math.min(W, H) / 3.4) * scale;
      const cx = W * 0.42;
      const cy = H * 0.5;
      return [cx + x * s, cy + y * s];
    };

    const cmyToRgb = (c: number, m: number, y: number) => {
      const r = Math.round(255 * (1 - clamp01(c)));
      const g = Math.round(255 * (1 - clamp01(m)));
      const b = Math.round(255 * (1 - clamp01(y)));
      return { r, g, b };
    };

    const rgbToHex = (r: number, g: number, b: number) => {
      const to2 = (v: number) => v.toString(16).padStart(2, "0").toUpperCase();
      return `#${to2(r)}${to2(g)}${to2(b)}`;
    };

    const hexToRgb01 = (hex: string) => {
      const h = hex.replace("#", "").trim();
      if (h.length !== 6) return { r: 0, g: 0, b: 0 };
      const r = parseInt(h.slice(0, 2), 16) / 255;
      const g = parseInt(h.slice(2, 4), 16) / 255;
      const b = parseInt(h.slice(4, 6), 16) / 255;
      return { r, g, b };
    };

    const luminance = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

    const pointToCMY = ([x, y, z]: V3) => ({
      c: clamp01((x + 1) / 2),
      m: clamp01((y + 1) / 2),
      y: clamp01((z + 1) / 2),
    });

    // ---------- dock theme helpers ----------
    function mixRgb(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) {
      const cl = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
      return { r: cl(a.r + (b.r - a.r) * t), g: cl(a.g + (b.g - a.g) * t), b: cl(a.b + (b.b - a.b) * t) };
    }

    function hexToRgb255(hex: string) {
      const h = hex.replace("#", "").trim();
      if (h.length !== 6) return { r: 255, g: 255, b: 255 };
      return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
    }

    function rgba({ r, g, b }: { r: number; g: number; b: number }, a: number) {
      return `rgba(${r},${g},${b},${a})`;
    }

    function applyDockTheme(hex: string) {
      const dock = root.querySelector<HTMLElement>(".ccDock");
      if (!dock) return;

      const rgb = hexToRgb255(hex);
      const L = luminance(rgb.r / 255, rgb.g / 255, rgb.b / 255);

      const dockText = L > 0.78 ? "#0B0B0B" : "#FFFFFF";

      // soften slightly so neon colors feel classy
      const soft = mixRgb(rgb, { r: 255, g: 255, b: 255 }, 0.12);

      const t1 = rgba(soft, 0.18);
      const t2 = rgba(soft, 0.10);

      const surface = L > 0.78 ? "rgba(255,255,255,0.20)" : "rgba(20,20,24,0.72)";
      const border = L > 0.78 ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.10)";

      dock.style.setProperty("--dock-accent", rgbToHex(soft.r, soft.g, soft.b));
      dock.style.setProperty("--dock-tint-1", t1);
      dock.style.setProperty("--dock-tint-2", t2);
      dock.style.setProperty("--dock-surface", surface);
      dock.style.setProperty("--dock-border", border);
      dock.style.setProperty("--dock-text", dockText);

      // swatch glow follows accent a bit
      swatch.style.boxShadow = `0 0 0 3px ${rgba(soft, 0.10)}, 0 14px 34px rgba(0,0,0,0.28)`;
    }

    // ---------- selection ----------
    let selC = 0,
      selM = 0,
      selY = 0;
    let selHex = "#FFFFFF";

    function setSelected(c: number, m: number, y: number, displayed?: { r: number; g: number; b: number }) {
      selC = clamp01(c);
      selM = clamp01(m);
      selY = clamp01(y);

      const ideal = cmyToRgb(selC, selM, selY);
      const shown = displayed ?? ideal;

      selHex = rgbToHex(shown.r, shown.g, shown.b);
      swatch.style.background = selHex;
      applyDockTheme(selHex);

      readout.textContent =
        `${selHex} · RGB ${shown.r} ${shown.g} ${shown.b}` +
        ` · CMY C${Math.round(selC * 100)} M${Math.round(selM * 100)} Y${Math.round(selY * 100)}`;

      (copyBtn as any)._hex = selHex;
    }

    setSelected(0, 0, 0);

    // ---------- face textures (TRUE CMY ink) ----------
    type FaceId = "x0" | "x1" | "y0" | "y1" | "z0" | "z1";
    const TEX = 256;

    function makeFaceTexture(face: FaceId): HTMLCanvasElement {
      const off = document.createElement("canvas");
      off.width = TEX;
      off.height = TEX;
      const octx = off.getContext("2d")!;
      octx.imageSmoothingEnabled = true;

      for (let j = 0; j < TEX; j++) {
        const v = j / (TEX - 1);
        for (let i = 0; i < TEX; i++) {
          const u = i / (TEX - 1);

          let x = 0,
            y = 0,
            z = 0;

          if (face === "x0") {
            x = -1;
            y = lerp(-1, 1, v);
            z = lerp(-1, 1, u);
          }
          if (face === "x1") {
            x = 1;
            y = lerp(-1, 1, v);
            z = lerp(-1, 1, u);
          }
          if (face === "y0") {
            y = -1;
            x = lerp(-1, 1, u);
            z = lerp(-1, 1, v);
          }
          if (face === "y1") {
            y = 1;
            x = lerp(-1, 1, u);
            z = lerp(-1, 1, v);
          }
          if (face === "z0") {
            z = -1;
            x = lerp(-1, 1, u);
            y = lerp(-1, 1, v);
          }
          if (face === "z1") {
            z = 1;
            x = lerp(-1, 1, u);
            y = lerp(-1, 1, v);
          }

          const { c, m, y: yy } = pointToCMY([x, y, z]);

          octx.globalCompositeOperation = "source-over";
          octx.globalAlpha = 1;
          octx.fillStyle = "rgb(255,255,255)";
          octx.fillRect(i, j, 1, 1);

          octx.globalCompositeOperation = "multiply";
          const ink = 1.0;

          octx.globalAlpha = c * ink;
          octx.fillStyle = "rgb(0,255,255)";
          octx.fillRect(i, j, 1, 1);

          octx.globalAlpha = m * ink;
          octx.fillStyle = "rgb(255,0,255)";
          octx.fillRect(i, j, 1, 1);

          octx.globalAlpha = yy * ink;
          octx.fillStyle = "rgb(255,255,0)";
          octx.fillRect(i, j, 1, 1);
        }
      }

      octx.globalAlpha = 1;
      octx.globalCompositeOperation = "source-over";
      return off;
    }

    const tex = {
      x0: makeFaceTexture("x0"),
      x1: makeFaceTexture("x1"),
      y0: makeFaceTexture("y0"),
      y1: makeFaceTexture("y1"),
      z0: makeFaceTexture("z0"),
      z1: makeFaceTexture("z1"),
    } as const;

    // ---------- cube corners + faces ----------
    const P: V3[] = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ];

    const FACE = [
      { id: "z0" as FaceId, idx: [0, 1, 2, 3] as const },
      { id: "z1" as FaceId, idx: [4, 5, 6, 7] as const },
      { id: "y0" as FaceId, idx: [0, 1, 5, 4] as const },
      { id: "y1" as FaceId, idx: [3, 2, 6, 7] as const },
      { id: "x1" as FaceId, idx: [1, 2, 6, 5] as const },
      { id: "x0" as FaceId, idx: [0, 3, 7, 4] as const },
    ];

    function drawFaceTextured(p00: V2, p10: V2, p11: V2, p01: V2, image: HTMLCanvasElement) {
      ctx.save();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.beginPath();
      ctx.moveTo(p00[0], p00[1]);
      ctx.lineTo(p10[0], p10[1]);
      ctx.lineTo(p11[0], p11[1]);
      ctx.lineTo(p01[0], p01[1]);
      ctx.closePath();
      ctx.clip();

      const w = image.width;
      const h = image.height;

      const a = (p10[0] - p00[0]) / w;
      const b = (p10[1] - p00[1]) / w;
      const c = (p01[0] - p00[0]) / h;
      const d = (p01[1] - p00[1]) / h;
      const e = p00[0];
      const f = p00[1];

      const alpha01 = Number(alpha.value) / 100;

      ctx.globalAlpha = alpha01;
      ctx.globalCompositeOperation = blend.value as GlobalCompositeOperation;

      ctx.setTransform(dpr * a, dpr * b, dpr * c, dpr * d, dpr * e, dpr * f);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(image, 0, 0);

      ctx.restore();
    }

    // ---------- background ----------
    function drawChecker() {
      const size = 24;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 0.14;
      for (let y = 0; y < H; y += size) {
        for (let x = 0; x < W; x += size) {
          const odd = ((x / size) | 0) + ((y / size) | 0);
          ctx.fillStyle = odd % 2 ? "#fff" : "#000";
          ctx.fillRect(x, y, size, size);
        }
      }
      ctx.restore();
    }

    function drawBackground() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = bgColor.value;
      ctx.fillRect(0, 0, W, H);
      if (checker.checked) drawChecker();
    }

    function drawAutoVignette() {
      const { r, g, b } = hexToRgb01(bgColor.value);
      const L = luminance(r, g, b);

      const strength = L > 0.7 ? 0.28 : 0.10;
      const dark = L > 0.7;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      const cx = W * 0.42;
      const cy = H * 0.5;
      const rad = Math.min(W, H) * 0.55;

      const g1 = ctx.createRadialGradient(cx, cy, rad * 0.15, cx, cy, rad);
      g1.addColorStop(0, "rgba(0,0,0,0)");
      g1.addColorStop(1, dark ? `rgba(0,0,0,${strength})` : `rgba(255,255,255,${strength})`);

      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // bg preset buttons
    root.querySelectorAll<HTMLButtonElement>(".ccChipBtn2").forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = btn.getAttribute("data-bg");
        if (v) bgColor.value = v;
      });
    });

    // ---------- picking helpers ----------
    function intersectRayAABB(origin: V3, dir: V3, min: V3, max: V3): number | null {
      let tmin = -Infinity;
      let tmax = Infinity;

      for (let axis = 0; axis < 3; axis++) {
        const o = origin[axis];
        const d = dir[axis];
        const mn = min[axis];
        const mx = max[axis];

        if (Math.abs(d) < 1e-8) {
          if (o < mn || o > mx) return null;
        } else {
          let t1 = (mn - o) / d;
          let t2 = (mx - o) / d;
          if (t1 > t2) [t1, t2] = [t2, t1];
          tmin = Math.max(tmin, t1);
          tmax = Math.min(tmax, t2);
          if (tmin > tmax) return null;
        }
      }

      if (tmax < 0) return null;
      return tmin >= 0 ? tmin : tmax;
    }

    function pickCMYAtCanvasPoint(cx: number, cy: number): { c: number; m: number; y: number } | null {
      const s = (Math.min(W, H) / 3.4) * scale;
      const cx0 = W * 0.42;
      const cy0 = H * 0.5;

      const wx = (cx - cx0) / s;
      const wy = (cy - cy0) / s;

      const originWorld: V3 = [wx, wy, -3];
      const dirWorld: V3 = [0, 0, 1];

      const originLocal = invRot(originWorld);
      const dirLocal = invRot(dirWorld);

      const t = intersectRayAABB(originLocal, dirLocal, [-1, -1, -1], [1, 1, 1]);
      if (t == null) return null;

      const hit: V3 = [
        originLocal[0] + dirLocal[0] * t,
        originLocal[1] + dirLocal[1] * t,
        originLocal[2] + dirLocal[2] * t,
      ];

      return pointToCMY(hit);
    }

    function sampleCanvasPixelAtCanvasPoint(cx: number, cy: number) {
      const ix = Math.max(0, Math.min(canvas.width - 1, Math.floor(cx * dpr)));
      const iy = Math.max(0, Math.min(canvas.height - 1, Math.floor(cy * dpr)));
      const data = ctx.getImageData(ix, iy, 1, 1).data;
      return { r: data[0], g: data[1], b: data[2], a: data[3] };
    }

    function doPickAtClientPoint(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const cx = clientX - rect.left;
      const cy = clientY - rect.top;

      if (cx < 0 || cy < 0 || cx > rect.width || cy > rect.height) return;

      const cmy = pickCMYAtCanvasPoint(cx, cy);
      if (!cmy) return;

      const px = sampleCanvasPixelAtCanvasPoint(cx, cy);
      setSelected(cmy.c, cmy.m, cmy.y, { r: px.r, g: px.g, b: px.b });
    }

    // RIGHT CLICK = pick
    const onContextMenuPick = (e: MouseEvent) => {
      e.preventDefault();
      if (dragging && dragDist > 8) return;
      doPickAtClientPoint(e.clientX, e.clientY);
    };
    canvas.addEventListener("contextmenu", onContextMenuPick);

    // LEFT CLICK = pick (only if it wasn't a drag)
    const onClickPick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (dragDist > 8) return;
      doPickAtClientPoint(e.clientX, e.clientY);
    };
    canvas.addEventListener("click", onClickPick);

    // ---------- hover preview (throttled) ----------
    let hoverOn = false;
    let hoverCX = 0;
    let hoverCY = 0;
    let hoverRaf = 0;

    function showHover() {
      if (!hoverOn) {
        hoverOn = true;
        hoverEl.style.display = "flex";
      }
    }

    function hideHover() {
      hoverOn = false;
      hoverEl.style.display = "none";
      if (hoverRaf) {
        cancelAnimationFrame(hoverRaf);
        hoverRaf = 0;
      }
    }

    function updateHoverAt(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const cx = clientX - rect.left;
      const cy = clientY - rect.top;

      if (cx < 0 || cy < 0 || cx > rect.width || cy > rect.height) {
        hideHover();
        return;
      }

      if (dragging && dragDist > 2) {
        hideHover();
        return;
      }

      showHover();

      hoverCX = cx;
      hoverCY = cy;

      const x = Math.min(window.innerWidth - 160, Math.max(8, clientX));
      const y = Math.min(window.innerHeight - 64, Math.max(8, clientY));
      hoverEl.style.left = `${x}px`;
      hoverEl.style.top = `${y}px`;

      if (!hoverRaf) {
        hoverRaf = requestAnimationFrame(() => {
          hoverRaf = 0;

          const cmy = pickCMYAtCanvasPoint(hoverCX, hoverCY);
          if (!cmy) {
            hoverEl.style.display = "none";
            hoverOn = false;
            return;
          }

          const px = sampleCanvasPixelAtCanvasPoint(hoverCX, hoverCY);
          const hex = rgbToHex(px.r, px.g, px.b);
          hoverSw.style.background = hex;
          hoverTxt.textContent = hex;
        });
      }
    }

    const onHoverMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      updateHoverAt(e.clientX, e.clientY);
    };
    const onHoverLeave = () => hideHover();

    canvas.addEventListener("pointermove", onHoverMove);
    canvas.addEventListener("pointerleave", onHoverLeave);

    // ---------- palette dock ----------
    const palette: string[] = [];

    function renderPalette() {
      paletteEl.innerHTML = "";
      for (let i = 0; i < palette.length; i++) {
        const hex = palette[i];
        const chip = document.createElement("div");
        chip.className = "ccChip";
        chip.innerHTML = `
          <span class="ccChipSw" style="background:${hex}"></span>
          <span class="ccChipTxt">${hex}</span>
          <button class="ccChipBtn" title="copy">⧉</button>
          <button class="ccChipBtn" title="remove">×</button>
        `;
        const [copy, del] = Array.from(chip.querySelectorAll("button")) as HTMLButtonElement[];

        copy.onclick = async () => {
          try {
            await navigator.clipboard.writeText(hex);
          } catch {}
          exportHint.textContent = "Copied swatch.";
          setTimeout(() => (exportHint.textContent = ""), 900);
        };

        del.onclick = () => {
          palette.splice(i, 1);
          renderPalette();
        };

        paletteEl.appendChild(chip);
      }
    }

    addBtn.addEventListener("click", () => {
      if (!palette.includes(selHex)) palette.unshift(selHex);
      if (palette.length > 12) palette.pop();
      renderPalette();
    });

    clearPalette.addEventListener("click", () => {
      palette.length = 0;
      renderPalette();
    });

    copyBtn.addEventListener("click", async () => {
      const hex = (copyBtn as any)._hex || "#FFFFFF";
      try {
        await navigator.clipboard.writeText(hex);
      } catch {}
      exportHint.textContent = "Copied HEX.";
      setTimeout(() => (exportHint.textContent = ""), 900);
    });

    exportJson.addEventListener("click", async () => {
      const text = JSON.stringify(palette, null, 2);
      try {
        await navigator.clipboard.writeText(text);
      } catch {}
      exportHint.textContent = "Copied palette JSON.";
      setTimeout(() => (exportHint.textContent = ""), 1200);
    });

    exportCss.addEventListener("click", async () => {
      const lines = palette.map((hex, i) => `  --pal-${String(i + 1).padStart(2, "0")}: ${hex};`);
      const text = `:root {\n${lines.join("\n")}\n}`;
      try {
        await navigator.clipboard.writeText(text);
      } catch {}
      exportHint.textContent = "Copied CSS variables.";
      setTimeout(() => (exportHint.textContent = ""), 1200);
    });

    resetBtn.addEventListener("click", () => {
      rx = -0.6;
      ry = 0.6;
      scale = 1;
    });

    const syncAlphaLabel = () => (alphaVal.textContent = `${alpha.value}%`);
    alpha.addEventListener("input", syncAlphaLabel);
    syncAlphaLabel();

    // ---------- render loop ----------
    let raf = 0;

    function loop() {
      drawBackground();
      drawAutoVignette();

      const rP = P.map((p) => rot(p));
      const sP = rP.map((p) => proj(p));

      const order = FACE.map((f, i) => {
        const z = (rP[f.idx[0]][2] + rP[f.idx[1]][2] + rP[f.idx[2]][2] + rP[f.idx[3]][2]) / 4;
        return { i, z };
      }).sort((a, b) => a.z - b.z);

      for (const o of order) {
        const f = FACE[o.i];
        const p00 = sP[f.idx[0]];
        const p10 = sP[f.idx[1]];
        const p11 = sP[f.idx[2]];
        const p01 = sP[f.idx[3]];

        drawFaceTextured(p00, p10, p11, p01, tex[f.id]);

        if (outline.checked) {
          ctx.save();
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = "rgba(255,255,255,0.12)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p00[0], p00[1]);
          ctx.lineTo(p10[0], p10[1]);
          ctx.lineTo(p11[0], p11[1]);
          ctx.lineTo(p01[0], p01[1]);
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }
      }

      // selection marker
      const selLocal: V3 = [selC * 2 - 1, selM * 2 - 1, selY * 2 - 1];
      const selRot = rot(selLocal);
      const sel2 = proj(selRot);

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.arc(sel2[0], sel2[1], 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      raf = requestAnimationFrame(loop);
    }

    (copyBtn as any)._hex = selHex;
    loop();

    // ---------- cleanup ----------
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);

      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointermove", onMove);

      canvas.removeEventListener("contextmenu", onContextMenuPick);
      canvas.removeEventListener("click", onClickPick);

      canvas.removeEventListener("pointermove", onHoverMove);
      canvas.removeEventListener("pointerleave", onHoverLeave);

      style.remove();
    };
  },
};

export default ColorCubePage;
