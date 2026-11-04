import { loadTools, hueFor, categoryOf, el, toolHref } from "./shared.js";

const grid = document.getElementById("grid");
const archive = document.getElementById("archive");
const toggle = document.getElementById("toggle-archive");
const tpl = document.getElementById("item");

function item(t) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.href = toolHref(t);
  const pic = node.querySelector(".pic");
  pic.style.setProperty("--h", hueFor(t.slug));
  const img = pic.querySelector("img");
  img.src = `./assets/thumbs/${t.slug}.png`;
  img.addEventListener("error", () => img.remove(), { once: true });
  node.querySelector(".name").textContent = t.name;
  node.querySelector(".cat").textContent = categoryOf(t);
  return node;
}

// The archive row is linkable: #archive opens it.
function setArchive(open) {
  archive.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "Close archive" : "Archive";
  const want = open ? "#archive" : "";
  if (location.hash !== want) history.replaceState(null, "", want || location.pathname + location.search);
}

try {
  const tools = await loadTools();
  const active = tools.filter((t) => t.status !== "archived");
  const archived = tools.filter((t) => t.status === "archived");
  // One column count for both rows so every thumbnail is the same size.
  document.documentElement.style.setProperty("--n", Math.max(active.length, archived.length, 1));
  grid.replaceChildren(...active.map(item));
  archive.replaceChildren(...archived.map(item));
  if (archived.length) {
    toggle.hidden = false;
    toggle.addEventListener("click", () => setArchive(archive.hidden));
    const sync = () => setArchive(location.hash === "#archive");
    window.addEventListener("hashchange", sync);
    sync();
  }
} catch (err) {
  grid.replaceChildren(el("p", { class: "note", text: `Could not load tools.json (${err.message}).` }));
}
