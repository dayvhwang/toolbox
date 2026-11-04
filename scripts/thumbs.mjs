// Screenshots every tool that has a url into assets/thumbs/<slug>.png (rendered at 1280x800, saved at 640x400).
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

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 0.5, // 1280x800 layout, 640x400 file: plenty for a card, a quarter of the bytes
  colorScheme: "light",
  reducedMotion: "reduce",
});

let failed = 0;
for (const t of tools) {
  const page = await ctx.newPage();
  const file = fileURLToPath(new URL(`${t.slug}.png`, outDir));
  try {
    await page.goto(t.url, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => page.goto(t.url, { waitUntil: "load", timeout: 30_000 }));
    await page.waitForTimeout(1500); // let fonts, canvases and intros settle
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1280, height: 800 }, scale: "device" });
    console.log(`ok   ${t.slug}  ← ${t.url}`);
  } catch (err) {
    failed++;
    console.error(`FAIL ${t.slug}  ${err.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

await browser.close();
console.log(`${tools.length - failed}/${tools.length} thumbnails written to assets/thumbs`);
process.exit(failed ? 1 : 0);
