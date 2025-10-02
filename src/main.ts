import { Router } from "./router";

const app = document.getElementById("app")!;
const router = new Router(app, [
  { path: "/",         load: () => import("./pages/Home") },
  { path: "/colorlab",  load: () => import("./pages/ColorLab") },
  { path: "*",         load: () => import("./pages/NotFound") },
]);

router.start();
