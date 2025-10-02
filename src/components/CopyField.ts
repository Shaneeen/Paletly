export function CopyField(label: string, value: string): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "field";
    const l = document.createElement("label");
    l.textContent = label;
    const row = document.createElement("div");
    row.className = "row";
    const input = document.createElement("input");
    input.readOnly = true;
    input.value = value;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.title = "Copy";
    btn.textContent = "⧉";
    btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(input.value);
      btn.textContent = "✓";
      setTimeout(() => (btn.textContent = "⧉"), 800);
    });
    row.append(input, btn);
    wrap.append(l, row);
    return wrap;
  }
  