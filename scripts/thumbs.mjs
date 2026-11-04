// Composes a cover for every tool that has a url into assets/thumbs/<slug>.jpg:
// a 1440x900 screenshot of the tool set as a floating window on a softly tinted square.
// Usage: node scripts/thumbs.mjs [slug ...]     (also `npm run thumbs`)
// Needs: npm i, then `npx playwright install chromium` once.

import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = new URL("../", import.meta.url);
const outDir = new URL("assets/thumbs/", root);
await mkdir(outDir, { recursive: true });

const only = new Set(process.argv.slice(2));
const tools = JSON.parse(await readFile(new URL("tools.json", root), "utf8")).filter(
  (t) => t.url && (only.size === 0 || only.has(t.slug))
);

// Same hue per slug as assets/shared.js, so the cover and the tile's placeholder agree.
function hueFor(slug) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 360;
}

const SIZE = 1024;
const cover = (hue, shot) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html, body { margin: 0; width: ${SIZE}px; height: ${SIZE}px; overflow: hidden; }
  body {
    position: relative;
    background:
      radial-gradient(120% 90% at 85% 0%, oklch(0.985 0.012 ${hue}) 0%, transparent 60%),
      linear-gradient(160deg, oklch(0.965 0.02 ${hue}) 0%, oklch(0.9 0.05 ${hue}) 100%);
  }
  .win {
    position: absolute; left: 8%; top: 31%; width: 96%; aspect-ratio: 16 / 10;
    border-radius: 18px; overflow: hidden;
    background: #fff;
    box-shadow:
      0 0 0 1px oklch(0 0 0 / 0.06),
      0 2px 4px oklch(0 0 0 / 0.04),
      0 40px 80px -24px oklch(0.3 0.06 ${hue} / 0.45);
  }
  .win img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top left; }
</style></head>
<body><div class="win"><img src="${shot}"></div></body></html>`;

const browser = await chromium.launch();
const site = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: "light",
  reducedMotion: "reduce",
});
const studio = await browser.newContext({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 });

let failed = 0;
for (const t of tools) {
  const page = await site.newPage();
  const canvas = await studio.newPage();
  const file = fileURLToPath(new URL(`${t.slug}.jpg`, outDir));
  try {
    await page.goto(t.url, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => page.goto(t.url, { waitUntil: "load", timeout: 30_000 }));
    await page.waitForTimeout(1500); // let fonts, canvases and intros settle
    const shot = await page.screenshot({ type: "png" });
    await canvas.setContent(cover(hueFor(t.slug), `data:image/png;base64,${shot.toString("base64")}`), { waitUntil: "load" });
    await canvas.screenshot({ path: file, type: "jpeg", quality: 88 });
    console.log(`ok   ${t.slug}  ← ${t.url}`);
  } catch (err) {
    failed++;
    console.error(`FAIL ${t.slug}  ${err.message.split("\n")[0]}`);
  } finally {
    await page.close();
    await canvas.close();
  }
}

await browser.close();
console.log(`${tools.length - failed}/${tools.length} covers written to assets/thumbs`);
process.exit(failed ? 1 : 0);
