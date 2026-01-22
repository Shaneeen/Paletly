import type { Page } from "../router";

const Home: Page = {
  title: "Home",
  mount(root) {
    root.innerHTML = `
      <section class="stack">
        <h2>Welcome to Paletly</h2>
        <p>Pick a tool from the nav. Start with the <a href="#/colorlab" data-link>Color Lab</a>.</p>
        <a data-link href="#/colorcube">ColorCube</a>
      </section>
    `;
  },
};

export default Home;
