import { loadTools, hueFor, categoryOf, el, toolHref, initTheme } from "./shared.js";

initTheme();

const grid = document.getElementById("grid");
const archive = document.getElementById("archive");
const toggle = document.getElementById("toggle-archive");
const tpl = document.getElementById("item");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

function item(t, clone = false) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.href = toolHref(t);
  const pic = node.querySelector(".pic");
  pic.style.setProperty("--h", hueFor(t.slug));
  const img = pic.querySelector("img");
  img.src = `./assets/thumbs/${t.slug}.png`;
  img.addEventListener("error", () => img.remove(), { once: true });
  node.querySelector(".name").textContent = t.name;
  node.querySelector(".cat").textContent = categoryOf(t);
  if (clone) {
    // Repeats exist only so the row can loop; keep them out of the tab order and the accessibility tree.
    node.setAttribute("aria-hidden", "true");
    node.tabIndex = -1;
  }
  return node;
}

// An endless row: the set is repeated enough times to fill the viewport three times over,
// the scroll position wraps from one copy to the next, and it drifts slowly until touched.
function carousel(section, tools, direction = 1) {
  const track = section.querySelector(".track");
  if (!tools.length) return;

  let setWidth = 0;
  let pos = 0;
  let paused = false;
  let dragging = false;
  let resumeAt = 0;

  function build() {
    track.replaceChildren(...tools.map((t) => item(t)));
    const first = track.firstElementChild;
    const last = track.lastElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    setWidth = last.offsetLeft + last.offsetWidth - first.offsetLeft + gap;
    const copies = Math.ceil(track.clientWidth / setWidth) + 3;
    for (let c = 1; c < copies; c++) track.append(...tools.map((t) => item(t, true)));
    pos = setWidth;
    track.scrollLeft = pos;
  }

  function wrap() {
    const max = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft < setWidth * 0.5) pos = track.scrollLeft += setWidth;
    else if (track.scrollLeft > max - setWidth * 0.5) pos = track.scrollLeft -= setWidth;
  }

  const speed = 18 * direction; // px per second
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const drifting = !paused && !dragging && !reduceMotion.matches && !document.hidden && now > resumeAt;
    if (drifting) {
      if (Math.abs(track.scrollLeft - pos) > 1.5) pos = track.scrollLeft; // the user scrolled; pick up from there
      pos += speed * dt;
      if (Math.abs(pos - track.scrollLeft) >= 1) track.scrollLeft = pos;
    }
    requestAnimationFrame(tick);
  }

  track.addEventListener("scroll", wrap, { passive: true });
  track.addEventListener("pointerenter", () => (paused = true));
  track.addEventListener("pointerleave", () => (paused = false));
  track.addEventListener("focusin", () => (paused = true));
  track.addEventListener("focusout", () => (paused = false));
  track.addEventListener("touchstart", () => (resumeAt = Infinity), { passive: true });
  track.addEventListener("touchend", () => (resumeAt = performance.now() + 2500), { passive: true });

  // Mouse drag scrolls the row. A real drag swallows the click that would follow it.
  let startX = 0;
  let startScroll = 0;
  let moved = false;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    dragging = true;
    moved = false;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    if (moved) track.scrollLeft = startScroll - dx;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.toggle("dragged", moved);
    setTimeout(() => track.classList.remove("dragged"), 0);
  };
  track.addEventListener("pointerup", end);
  track.addEventListener("pointercancel", end);
  track.addEventListener("click", (e) => moved && e.preventDefault(), true);

  let raf;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(build);
  });

  build();
  requestAnimationFrame(tick);
}

// The archive row is linkable: #archive opens it.
function setArchive(open) {
  archive.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "Close archive" : "Archive";
  const want = open ? "#archive" : "";
  if (location.hash !== want) history.replaceState(null, "", want || location.pathname + location.search);
  if (open) window.dispatchEvent(new Event("resize")); // measure the row now that it is visible
}

try {
  const tools = await loadTools();
  const active = tools.filter((t) => t.status !== "archived");
  const archived = tools.filter((t) => t.status === "archived");
  carousel(grid, active, 1);
  if (archived.length) {
    toggle.hidden = false;
    toggle.addEventListener("click", () => setArchive(archive.hidden));
    const sync = () => setArchive(location.hash === "#archive");
    window.addEventListener("hashchange", sync);
    sync();
    carousel(archive, archived, -1);
  }
} catch (err) {
  grid.replaceChildren(el("p", { class: "note", text: `Could not load tools.json (${err.message}).` }));
}
