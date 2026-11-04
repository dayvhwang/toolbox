// Rewrites the catalog table in README.md between <!-- tools:start --> and <!-- tools:end -->.
// Usage: node scripts/readme.mjs   (also `npm run readme`)

import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const tools = JSON.parse(await readFile(new URL("tools.json", root), "utf8"));
const readmePath = new URL("README.md", root);
const readme = await readFile(readmePath, "utf8");

const link = (label, href) => (href ? `[${label}](${href})` : label);
const row = (t) => {
  const name = link(t.name, `https://dayvhwang.com/toolbox/tool.html?t=${encodeURIComponent(t.slug)}`);
  const live = t.url ? link(new URL(t.url).host, t.url) : "";
  const repo = t.repo && t.repoPublic ? link("source", t.repo) : t.repo ? "private" : "";
  return `| ${name} | ${t.tagline.replace(/\|/g, "\\|")} | \`${t.kind}\` | ${live} | ${repo} |`;
};

const header = "| Tool | What it does | Kind | Live | Repo |\n|---|---|---|---|---|";
const active = tools.filter((t) => t.status === "active").map(row).join("\n");
const archived = tools.filter((t) => t.status === "archived").map(row).join("\n");

const table = [
  header,
  active,
  "",
  archived ? `<details><summary>Archived</summary>\n\n${header}\n${archived}\n\n</details>` : "",
]
  .join("\n")
  .trim();

const start = "<!-- tools:start -->";
const end = "<!-- tools:end -->";
const a = readme.indexOf(start);
const b = readme.indexOf(end);
if (a < 0 || b < 0 || b < a) {
  console.error(`README.md needs ${start} and ${end} markers`);
  process.exit(1);
}
const next = `${readme.slice(0, a + start.length)}\n\n${table}\n\n${readme.slice(b)}`;
if (next !== readme) {
  await writeFile(readmePath, next);
  console.log(`README.md: catalog updated (${tools.length} tools)`);
} else {
  console.log("README.md: already up to date");
}
