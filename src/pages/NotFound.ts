import type { Page } from "../router";

const NotFound: Page = {
  title: "Not Found",
  mount(root) {
    root.innerHTML = `
      <section class="stack">
        <h2>404</h2>
        <p>Route not found. Go <a href="#/" data-link>home</a>.</p>
      </section>
    `;
  },
};
export default NotFound;
