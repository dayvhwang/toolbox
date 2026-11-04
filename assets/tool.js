import { loadTools, el, initTheme, hostOf } from "./shared.js";

initTheme();

const main = document.getElementById("tool");
const crumb = document.getElementById("crumb");
const tpl = document.getElementById("detail");

function notFound(slug) {
  document.title = "Not found · dave's toolbox";
  main.replaceChildren(
    el("div", { class: "notfound" }, [
      el("h1", { text: `No tool called "${slug}".` }),
      el("p", {}, [el("a", { href: "./", text: "← All tools" })]),
    ])
  );
}

function render(tools, t) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  document.title = `${t.name} · dave's toolbox`;
  crumb.textContent = t.name;

  node.querySelector(".kind").textContent = t.kind;
  node.querySelector(".year").textContent = t.year ?? "";
  node.querySelector(".name").textContent = t.name;
  node.querySelector(".tagline").textContent = t.tagline;
  node.querySelector(".description").textContent = t.description || "";
  const tags = node.querySelector(".tags");
  for (const tag of t.tags || []) tags.append(el("a", { href: `./#f=tag:${encodeURIComponent(tag)}`, text: tag }));

  const actions = node.querySelector(".actions");
  if (t.url) actions.append(el("a", { class: "btn primary", href: t.url, target: "_blank", rel: "noopener", text: "Open ↗" }));
  if (t.kind === "extension" && t.repo) actions.append(el("a", { class: "btn", href: t.repo, target: "_blank", rel: "noopener", text: "Install from repo" }));
  if (t.repo && t.repoPublic) actions.append(el("a", { class: "btn", href: t.repo, target: "_blank", rel: "noopener", text: "Source" }));
  if (t.status === "archived") actions.append(el("span", { class: "btn", "aria-disabled": "true", text: "Archived" }));

  const hero = node.querySelector(".hero");
  if (!t.embed && t.url) {
    const img = hero.querySelector("img");
    img.src = `./assets/thumbs/${t.slug}.png`;
    img.alt = `${t.name} screenshot`;
    img.addEventListener("load", () => (hero.hidden = false), { once: true });
    hero.href = t.url;
  }

  if (t.embed && t.url) {
    const embed = node.querySelector(".embed");
    const frame = embed.querySelector("iframe");
    embed.hidden = false;
    embed.querySelector(".embed-url").textContent = hostOf(t.url);
    embed.querySelector(".embed-open").href = t.url;
    frame.title = t.name;
    frame.src = t.url;
    // If the site refuses to be framed (X-Frame-Options / CSP) the frame errors or stays blank.
    // There is no reliable cross-origin signal, so hide the frame on an explicit error only.
    frame.addEventListener("error", () => (embed.hidden = true), { once: true });
  }

  // prev / next among the tools that share this one's status
  const ring = tools.filter((x) => x.status === t.status);
  const i = ring.findIndex((x) => x.slug === t.slug);
  const prev = ring[(i - 1 + ring.length) % ring.length];
  const next = ring[(i + 1) % ring.length];
  const pv = node.querySelector(".prev");
  const nx = node.querySelector(".next");
  if (ring.length > 1) {
    pv.textContent = prev.name;
    pv.href = `./tool.html?t=${encodeURIComponent(prev.slug)}`;
    nx.textContent = next.name;
    nx.href = `./tool.html?t=${encodeURIComponent(next.slug)}`;
  }

  main.replaceChildren(node);
}

try {
  const tools = await loadTools();
  const slug = new URLSearchParams(location.search).get("t") || "";
  const t = tools.find((x) => x.slug === slug);
  if (!t) notFound(slug);
  else render(tools, t);
} catch (err) {
  main.replaceChildren(el("p", { class: "empty", text: `Could not load tools.json (${err.message}).` }));
}
