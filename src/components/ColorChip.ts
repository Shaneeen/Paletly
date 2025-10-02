export function ColorChip(hex: string, name?: string): HTMLElement {
    const el = document.createElement("div");
    el.className = "chip";
    el.style.background = hex;
    el.title = name ?? hex;
    el.textContent = name ?? hex;
    return el;
  }
  