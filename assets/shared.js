// Shared bits for index and tool pages: manifest loading, theme, small helpers.

import { stamp } from "./thumbs/stamp.js";

let cache;
export async function loadTools() {
  if (cache) return cache;
  const res = await fetch(new URL("../tools.json", import.meta.url), { cache: "no-cache" });
  if (!res.ok) throw new Error(`tools.json: ${res.status}`);
  cache = await res.json();
  return cache;
}

// Stable hue per slug, for the tinted placeholder when there is no thumbnail.
export function hueFor(slug) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 360;
}

// Short label under a tool's name: its first tag, capitalised, else its kind.
export function categoryOf(t) {
  const s = (t.tags && t.tags[0]) || t.kind || "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const c of [].concat(children)) if (c != null) n.append(c);
  return n;
}

// Cover image for a tool. The stamp changes whenever the covers are regenerated.
export function thumbUrl(t) {
  return `./assets/thumbs/${t.slug}.jpg?${stamp}`;
}

export function toolHref(t) {
  return `./tool.html?t=${encodeURIComponent(t.slug)}`;
}

// Theme: three-way control, persisted. "system" clears the attribute.
export function initTheme() {
  const buttons = [...document.querySelectorAll("[data-theme-set]")];
  const read = () => {
    try {
      return localStorage.getItem("theme") || "system";
    } catch {
      return "system";
    }
  };
  const apply = (mode) => {
    if (mode === "light" || mode === "dark") document.documentElement.setAttribute("data-theme", mode);
    else document.documentElement.removeAttribute("data-theme");
    for (const b of buttons) b.setAttribute("aria-pressed", String(b.dataset.themeSet === mode));
  };
  apply(read());
  for (const b of buttons) {
    b.addEventListener("click", () => {
      const mode = b.dataset.themeSet;
      try {
        if (mode === "system") localStorage.removeItem("theme");
        else localStorage.setItem("theme", mode);
      } catch {}
      apply(mode);
    });
  }
}
