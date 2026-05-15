import type { Page } from "../router";

const HOME_CSS = `
.home-swatches {
  display: flex;
  gap: 8px;
  height: 50px;
  align-items: flex-end;
  margin-top: 8px;
}

.home-swatches span {
  height: 8px;
  flex: 1;
  border-radius: 4px;
  opacity: 0.55;
  transition:
    height 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
    border-radius 380ms ease,
    opacity 260ms ease;
  cursor: default;
}

.home-swatches span:hover {
  height: 44px;
  border-radius: 9px;
  opacity: 1;
}
`;

const PALETTE = [
  "#E07A5F",
  "#C4A882",
  "#8FB87A",
  "#487A57",
  "#5B9EA0",
  "#7B8FA8",
  "#A88BBD",
  "#C97B8E",
];

function ensureCss(id: string, css: string) {
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.append(style);
}

const Home: Page = {
  title: "Home",
  mount(root) {
    ensureCss("home-css", HOME_CSS);

    const section = document.createElement("section");
    section.className = "stack";

    section.innerHTML = `
      <p class="eyebrow">Palette toolkit</p>
      <h2>Smooth, minimal, and ready for focused color work.</h2>
      <p>Paletly keeps the interface clean so you can explore swatches, inspect values, and switch themes without distractions.</p>
      <div class="cta-row">
        <a href="#/colorlab" data-link class="button">Open Color Lab</a>
      </div>
    `;

    const swatches = document.createElement("div");
    swatches.className = "home-swatches";
    PALETTE.forEach((color) => {
      const span = document.createElement("span");
      span.style.background = color;
      swatches.append(span);
    });
    section.append(swatches);

    root.append(section);
  },
};

export default Home;
