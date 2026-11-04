import { KINDS, loadTools, hueFor, el, initTheme } from "./shared.js";

initTheme();

const grid = document.getElementById("grid");
const chips = document.getElementById("chips");
const q = document.getElementById("q");
const count = document.getElementById("count");
const empty = document.getElementById("empty");
const tpl = document.getElementById("card");

const state = { filter: "all", query: "" };

// ---- URL hash <-> state, so a filtered view is linkable ----
function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  state.filter = p.get("f") || "all";
  state.query = p.get("q") || "";
}
function writeHash() {
  const p = new URLSearchParams();
  if (state.filter !== "all") p.set("f", state.filter);
  if (state.query) p.set("q", state.query);
  const h = p.toString();
  history.replaceState(null, "", h ? `#${h}` : location.pathname);
}

let tools = [];

function matches(t) {
  const [type, value] = state.filter.includes(":") ? state.filter.split(":") : [state.filter, null];
  if (type === "all" && t.status === "archived") return false;
  if (type === "archive" && t.status !== "archived") return false;
  if (type === "kind" && (t.kind !== value || t.status === "archived")) return false;
  if (type === "tag" && !(t.tags || []).includes(value)) return false;
  if (state.query) {
    const hay = [t.name, t.tagline, t.kind, ...(t.tags || [])].join(" ").toLowerCase();
    if (!state.query.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  return true;
}

function card(t) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.classList.toggle("archived", t.status === "archived");
  node.dataset.slug = t.slug;

  const thumb = node.querySelector(".thumb");
  const img = thumb.querySelector("img");
  const fallback = thumb.querySelector(".fallback");
  fallback.style.setProperty("--h", hueFor(t.slug));
  fallback.textContent = t.name.slice(0, 2);
  img.src = `./assets/thumbs/${t.slug}.png`;
  img.addEventListener("error", () => thumb.classList.add("no-image"), { once: true });

  const title = node.querySelector(".title");
  title.textContent = t.name;
  title.href = `./tool.html?t=${encodeURIComponent(t.slug)}`;

  node.querySelector(".tagline").textContent = t.tagline;
  node.querySelector(".kind").textContent = t.kind;
  const tags = node.querySelector(".tags");
  for (const tag of t.tags || []) tags.append(el("span", { text: tag }));

  const open = node.querySelector(".open");
  if (t.url) open.href = t.url;
  else open.hidden = true;

  return node;
}

function render() {
  const shown = tools.filter(matches);
  grid.replaceChildren(...shown.map(card));
  empty.hidden = shown.length > 0;
  const active = tools.filter((t) => t.status !== "archived").length;
  count.textContent = shown.length === active || state.filter === "all" && !state.query
    ? `${active} tools`
    : `${shown.length} of ${active}`;
  for (const c of chips.querySelectorAll(".chip")) c.setAttribute("aria-pressed", String(c.dataset.filter === state.filter));
}

function buildChips() {
  const active = tools.filter((t) => t.status !== "archived");
  const byKind = Object.fromEntries(KINDS.map((k) => [k, active.filter((t) => t.kind === k).length]));
  const tagCount = {};
  for (const t of active) for (const tag of t.tags || []) tagCount[tag] = (tagCount[tag] || 0) + 1;
  // Only tags shared by two or more tools earn a chip; the rest are still searchable.
  const tags = Object.entries(tagCount)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const archived = tools.length - active.length;

  const chip = (filter, label, n) =>
    el("button", { type: "button", class: "chip", "data-filter": filter, "aria-pressed": "false", onclick: () => setFilter(filter) }, [
      label,
      n != null ? el("span", { class: "n", text: n }) : null,
    ]);

  const items = [chip("all", "All", active.length)];
  for (const k of KINDS) if (byKind[k]) items.push(chip(`kind:${k}`, k, byKind[k]));
  if (tags.length) items.push(el("span", { class: "chip sep", "aria-hidden": "true", text: "·" }));
  for (const [tag, n] of tags) items.push(chip(`tag:${tag}`, `#${tag}`, n));
  if (archived) {
    items.push(el("span", { class: "chip sep", "aria-hidden": "true", text: "·" }));
    items.push(chip("archive", "Archive", archived));
  }
  chips.replaceChildren(...items);
}

function setFilter(f) {
  state.filter = state.filter === f && f !== "all" ? "all" : f;
  writeHash();
  render();
}

// ---- search ----
q.addEventListener("input", () => {
  state.query = q.value.trim();
  writeHash();
  render();
});
document.getElementById("clear").addEventListener("click", () => {
  q.value = "";
  state.query = "";
  state.filter = "all";
  writeHash();
  render();
  q.focus();
});

document.addEventListener("keydown", (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
    e.preventDefault();
    q.focus();
    q.select();
  } else if (e.key === "Escape" && document.activeElement === q) {
    if (q.value) {
      q.value = "";
      state.query = "";
      writeHash();
      render();
    } else q.blur();
  }
});

window.addEventListener("hashchange", () => {
  readHash();
  q.value = state.query;
  render();
});

// ---- boot ----
try {
  tools = await loadTools();
  readHash();
  q.value = state.query;
  buildChips();
  render();
} catch (err) {
  grid.replaceChildren(el("p", { class: "empty", text: `Could not load tools.json (${err.message}).` }));
}
