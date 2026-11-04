// Checks tools.json: required fields, unique slugs, valid enums, URL shape.
// Usage: node scripts/validate.mjs   (also `npm test`)

import { readFile } from "node:fs/promises";

const KINDS = new Set(["web", "cli", "extension", "site"]);
const STATUS = new Set(["active", "archived"]);
const SLUG = /^[a-z0-9][a-z0-9-]*$/;

const tools = JSON.parse(await readFile(new URL("../tools.json", import.meta.url), "utf8"));
const errors = [];
const seen = new Set();

const isUrl = (s) => {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

if (!Array.isArray(tools)) {
  errors.push("tools.json must be an array");
} else {
  tools.forEach((t, i) => {
    const where = `#${i} (${t?.slug ?? "?"})`;
    if (!t || typeof t !== "object") return errors.push(`${where}: not an object`);
    for (const k of ["slug", "name", "tagline", "kind", "status"]) {
      if (typeof t[k] !== "string" || !t[k].trim()) errors.push(`${where}: "${k}" is required`);
    }
    if (typeof t.slug === "string" && !SLUG.test(t.slug)) errors.push(`${where}: slug must be lowercase letters, digits, dashes`);
    if (seen.has(t.slug)) errors.push(`${where}: duplicate slug`);
    seen.add(t.slug);
    if (!KINDS.has(t.kind)) errors.push(`${where}: kind must be one of ${[...KINDS].join(", ")}`);
    if (!STATUS.has(t.status)) errors.push(`${where}: status must be one of ${[...STATUS].join(", ")}`);
    if (t.url != null && !isUrl(t.url)) errors.push(`${where}: url is not a valid http(s) URL`);
    if (t.repo != null && !isUrl(t.repo)) errors.push(`${where}: repo is not a valid http(s) URL`);
    if (t.embed && !t.url) errors.push(`${where}: embed needs a url`);
    if (t.tags != null && (!Array.isArray(t.tags) || t.tags.some((x) => typeof x !== "string"))) errors.push(`${where}: tags must be an array of strings`);
    if (t.year != null && !(Number.isInteger(t.year) && t.year > 2000 && t.year < 2100)) errors.push(`${where}: year looks wrong`);
    if (t.tagline && t.tagline.length > 140) errors.push(`${where}: tagline over 140 chars (${t.tagline.length})`);
  });
}

if (errors.length) {
  console.error(`tools.json: ${errors.length} problem${errors.length === 1 ? "" : "s"}`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`tools.json ok: ${tools.length} tools, ${tools.filter((t) => t.status === "active").length} active`);
