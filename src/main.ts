import { Router } from "./router";

const app = document.getElementById("app")!;
const router = new Router(app, [
  { path: "/",          load: () => import("./pages/Home") },
  { path: "/colorlab",  load: () => import("./pages/ColorLab") },
  { path: "/palette",   load: () => import("./pages/PaletteMaker") },
  { path: "*",          load: () => import("./pages/NotFound") },
]);

const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav a[data-link]"));
const themeToggle = document.getElementById("theme-toggle") as HTMLButtonElement | null;

function renderActiveNav() {
  const path = location.hash.replace(/^#/, "") || "/";
  navLinks.forEach((link) => {
    const target = link.getAttribute("href")?.replace(/^#/, "");
    link.classList.toggle("active", target === path);
  });
}

function setTheme(theme: "light" | "dark") {
  const next = theme === "dark" ? "dark" : "light";
  document.body.classList.toggle("dark", next === "dark");
  if (themeToggle) {
    themeToggle.textContent = next === "dark" ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", next === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }
  localStorage.setItem("theme", next);
}

const savedTheme = (localStorage.getItem("theme") as "light" | "dark" | null) ?? null;
const defaultTheme = savedTheme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
setTheme(defaultTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(document.body.classList.contains("dark") ? "light" : "dark");
  });
}

window.addEventListener("hashchange", renderActiveNav);
renderActiveNav();
router.start();
