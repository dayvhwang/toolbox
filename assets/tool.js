import { loadTools, categoryOf, el, toolHref, thumbUrl, initTheme } from "./shared.js";

initTheme();

const main = document.getElementById("tool");
const crumb = document.getElementById("crumb");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const tpl = document.getElementById("detail");

function notFound(slug) {
  document.title = "Not found · toolbox";
  crumb.textContent = "not found";
  main.replaceChildren(
    el("div", { class: "detail" }, [
      el("header", { class: "head" }, [
        el("b", { class: "name", text: `No tool called “${slug}”` }),
        el("p", { class: "links" }, [el("a", { href: "./", text: "All tools" })]),
      ]),
    ])
  );
}

function render(tools, t) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  document.title = `${t.name} · toolbox`;
  crumb.textContent = t.name;

  node.querySelector(".name").textContent = t.name;
  node.querySelector(".tagline").textContent = t.tagline;
  node.querySelector(".description").textContent = t.description || "";

  const links = node.querySelector(".links");
  const add = (a) => {
    if (links.childElementCount) links.append(el("span", { class: "dot", "aria-hidden": "true", text: "·" }));
    links.append(a);
  };
  if (t.url) add(el("a", { href: t.url, target: "_blank", rel: "noopener", text: "Open ↗" }));
  if (t.kind === "extension" && t.repo) add(el("a", { href: t.repo, target: "_blank", rel: "noopener", text: "Install from repo" }));
  if (t.repo && t.repoPublic) add(el("a", { href: t.repo, target: "_blank", rel: "noopener", text: "Source" }));
  add(el("span", { text: `${categoryOf(t)}${t.year ? `, ${t.year}` : ""}${t.status === "archived" ? ", archived" : ""}` }));

  if (t.embed && t.url) {
    const embed = node.querySelector(".embed");
    const frame = embed.querySelector("iframe");
    embed.hidden = false;
    frame.title = t.name;
    frame.src = t.url;
    // If the site refuses to be framed there is no reliable cross-origin signal; hide only on an explicit error.
    frame.addEventListener("error", () => (embed.hidden = true), { once: true });
  } else if (t.url) {
    const hero = node.querySelector(".hero");
    const img = hero.querySelector("img");
    img.src = thumbUrl(t);
    img.alt = `${t.name} screenshot`;
    img.addEventListener("load", () => (hero.hidden = false), { once: true });
    hero.href = t.url;
  }

  // prev / next among the tools that share this one's status
  const ring = tools.filter((x) => x.status === t.status);
  const i = ring.findIndex((x) => x.slug === t.slug);
  if (ring.length > 1) {
    const p = ring[(i - 1 + ring.length) % ring.length];
    const n = ring[(i + 1) % ring.length];
    prev.textContent = p.name;
    prev.href = toolHref(p);
    next.textContent = n.name;
    next.href = toolHref(n);
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
  main.replaceChildren(el("p", { class: "note", text: `Could not load tools.json (${err.message}).` }));
}
