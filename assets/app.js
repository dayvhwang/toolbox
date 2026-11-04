import { loadTools, hueFor, categoryOf, el, toolHref, initTheme } from "./shared.js";

initTheme();

const grid = document.getElementById("grid");
const tpl = document.getElementById("item");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

function item(t, clone = false) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.href = toolHref(t);
  node.draggable = false;
  const pic = node.querySelector(".pic");
  pic.style.setProperty("--h", hueFor(t.slug));
  const img = pic.querySelector("img");
  img.src = `./assets/thumbs/${t.slug}.png`;
  img.draggable = false;
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

// An endless row. The set is repeated enough times to cover the viewport, the strip is moved with a
// transform (sub-pixel, so the drift is smooth), and the offset wraps from one copy to the next.
// It drifts slowly until hovered, focused, dragged, scrolled or touched; a fling keeps its momentum.
function carousel(section, tools, direction = 1) {
  const track = section.querySelector(".track");
  const strip = section.querySelector(".strip");
  if (!tools.length) return;

  const speed = 22 * direction; // px per second
  let setWidth = 0;
  let x = 0; // how far the strip is shifted left
  let v = 0; // leftover velocity from a fling, px per second
  let hover = false;
  let focus = false;
  let dragging = false;
  let holdUntil = 0; // no drift until this time, after the user has moved it

  function paint() {
    // Keep x inside the middle copy so the strip never runs out on either side.
    if (x < setWidth * 0.5) x += setWidth;
    else if (x >= setWidth * 1.5) x -= setWidth;
    strip.style.transform = `translate3d(${-x}px, 0, 0)`;
  }

  function build() {
    strip.replaceChildren(...tools.map((t) => item(t)));
    const first = strip.firstElementChild;
    const last = strip.lastElementChild;
    const gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
    setWidth = last.offsetLeft + last.offsetWidth - first.offsetLeft + gap;
    const copies = Math.ceil(track.clientWidth / setWidth) + 3;
    for (let c = 1; c < copies; c++) strip.append(...tools.map((t) => item(t, true)));
    x = setWidth;
    v = 0;
    paint();
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!dragging) {
      if (Math.abs(v) > 2) {
        x += v * dt;
        v *= Math.exp(-4 * dt); // friction: halves every ~0.17s
      } else {
        v = 0;
        const drift = !hover && !focus && !reduceMotion.matches && !document.hidden && now > holdUntil;
        if (drift) x += speed * dt;
      }
      paint();
    }
    requestAnimationFrame(tick);
  }

  // Trackpad / wheel: horizontal deltas move the row (shift+wheel too).
  track.addEventListener(
    "wheel",
    (e) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      x += dx;
      v = 0;
      holdUntil = performance.now() + 1500;
      paint();
    },
    { passive: false }
  );

  // Drag with mouse, pen or finger. A real drag swallows the click that would follow it.
  let startX = 0;
  let startPos = 0;
  let lastX = 0;
  let lastT = 0;
  let moved = false;
  track.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    dragging = true;
    moved = false;
    startX = lastX = e.clientX;
    startPos = x;
    lastT = performance.now();
    v = 0;
    track.setPointerCapture(e.pointerId);
    track.classList.add("dragging");
  });
  track.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 4) moved = true;
    if (!moved) return;
    const now = performance.now();
    const dt = (now - lastT) / 1000;
    if (dt > 0) v = ((lastX - e.clientX) / dt) * 0.5 + v * 0.5;
    lastX = e.clientX;
    lastT = now;
    x = startPos - dx;
    paint();
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("dragging");
    if (!moved || performance.now() - lastT > 100) v = 0; // a pause before letting go means no fling
    holdUntil = performance.now() + 2000;
  };
  track.addEventListener("pointerup", end);
  track.addEventListener("pointercancel", end);
  track.addEventListener("click", (e) => moved && e.preventDefault(), true);

  track.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && (hover = true));
  track.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && (hover = false));

  // Keyboard: bring the focused tile into view and hold still while it has focus.
  track.addEventListener("focusin", (e) => {
    focus = true;
    const tile = e.target.closest(".item");
    if (!tile) return;
    const left = tile.offsetLeft;
    const right = left + tile.offsetWidth;
    const edge = parseFloat(getComputedStyle(strip).paddingLeft) || 0;
    if (left < x + edge) x = left - edge;
    else if (right > x + track.clientWidth - edge) x = right - track.clientWidth + edge;
    v = 0;
    paint();
  });
  track.addEventListener("focusout", () => (focus = false));

  let raf;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(build);
  });

  build();
  requestAnimationFrame(tick);
}

try {
  const tools = await loadTools();
  // Archived tools stay in the manifest (and keep their tool pages) but are not shown here.
  carousel(grid, tools.filter((t) => t.status !== "archived"));
} catch (err) {
  grid.replaceChildren(el("p", { class: "note", text: `Could not load tools.json (${err.message}).` }));
}
