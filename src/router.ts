export interface Page {
    /** Mount into #app; return optional unmount cleanup */
    mount: (root: HTMLElement, params: Record<string, string>) => void | (() => void);
    title?: string;
  }
  
  type Route = {
    path: string;                    // e.g. "/", "/color lab"
    load: () => Promise<{ default: Page }>;
  };
  
  export class Router {
    private routes: Route[];
    private root: HTMLElement;
    private cleanup: (() => void) | null = null;
  
    constructor(root: HTMLElement, routes: Route[]) {
      this.root = root;
      this.routes = routes;
    }
  
    start() {
      window.addEventListener("hashchange", () => this.resolve());
      document.addEventListener("click", (e) => {
        const a = (e.target as HTMLElement)?.closest<HTMLAnchorElement>("a[data-link]");
        if (a && a.getAttribute("href")?.startsWith("#/")) {
          // default hash navigation is fine; just prevent mixed default behaviors
          e.preventDefault();
          location.hash = a.getAttribute("href")!;
        }
      });
      if (!location.hash) location.hash = "#/"; // default
      this.resolve();
    }
  
    private parse(): string {
      return location.hash.replace(/^#/, "") || "/";
    }
  
    private match(path: string): Route | undefined {
      return this.routes.find(r => r.path === path) ?? this.routes.find(r => r.path === "*");
    }
  
    async resolve() {
      const path = this.parse();
      const route = this.match(path);
      if (!route) return;
  
      // cleanup previous page
      if (this.cleanup) {
        try { this.cleanup(); } catch {}
        this.cleanup = null;
      }
  
      // swap content
      this.root.innerHTML = "";
      const { default: page } = await route.load();
      const maybeCleanup = page.mount(this.root, {});
      if (typeof maybeCleanup === "function") this.cleanup = maybeCleanup;
      if (page.title) document.title = page.title + " · Paletly";
    }
  }
  