// src/lib/color.ts
import namer from "color-namer";

export type Match = { name: string; hex: string; distance: number };
export type NamerResult = Record<string, Match[]>;

// Ensure #RRGGBB (uppercase)
const asHex = (s: string): string => {
  let h = s.trim();
  if (!h.startsWith("#")) h = "#" + h;
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h)) return "#FFFFFF";
  if (h.length === 4) h = "#" + [...h.slice(1)].map(c => c + c).join("");
  return h.toUpperCase();
};

export function normHex(hex: string): string {
  return asHex(hex.toLowerCase());
}

/** Generic best name across ALL palettes (kept for convenience; no Pantone bias). */
export function pantonePrimaryName(hex: string): { name: string; hex: string } {
  const res = namer(hex) as NamerResult;
  let best: Match | undefined;
  for (const arr of Object.values(res)) {
    const m = arr?.[0];
    if (m && (!best || m.distance < best.distance)) best = m;
  }
  return best ? { name: best.name, hex: asHex(best.hex) } : { name: "Unknown", hex: "#FFFFFF" };
}

/** Top hit from each palette, sorted by distance only (no preference list). */
export function topNamesByPalette(
  hex: string
): Array<{ palette: string; name: string; swatch: string; distance: number }> {
  const res = namer(hex) as NamerResult;

  const rows = Object.entries(res)
    .filter(([, arr]) => Array.isArray(arr) && arr.length)
    .map(([palette, arr]) => ({
      palette,
      name: arr[0].name,
      swatch: asHex(arr[0].hex),
      distance: arr[0].distance,
    }))
    .sort((a, b) => a.distance - b.distance);

  return rows;
}

/** Closest matches across ALL palettes, sorted by distance; de-dupes by palette+name. */
export function closestNames(
  hex: string,
  limit = 8
): Array<{ palette: string; name: string; swatch: string; distance: number }> {
  const res = namer(hex) as NamerResult;

  const rows: Array<{ palette: string; name: string; swatch: string; distance: number }> = [];
  for (const [palette, arr] of Object.entries(res)) {
    if (!arr?.length) continue;
    for (const m of arr) {
      rows.push({ palette, name: m.name, swatch: asHex(m.hex), distance: m.distance });
    }
  }

  rows.sort((a, b) => a.distance - b.distance);

  const out: typeof rows = [];
  const seen = new Set<string>();
  for (const r of rows) {
    const k = r.palette + "|" + r.name;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
    if (out.length >= limit) break;
  }
  return out;
}
