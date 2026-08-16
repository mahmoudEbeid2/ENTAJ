import { chromium } from "playwright";
import path from "path";

const imgPath = process.argv[2];
const outPath = process.argv[3];
const x = Number(process.argv[4]);
const y = Number(process.argv[5]);
const w = Number(process.argv[6]);
const h = Number(process.argv[7]);
const zoom = Number(process.argv[8] || 1);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 2200 }, deviceScaleFactor: zoom });
await page.goto("file:///" + path.resolve(imgPath).replace(/\\/g, "/"));
await page.waitForTimeout(200);
await page.evaluate(() => {
  document.body.style.margin = "0";
  const img = document.querySelector("img");
  if (img) { img.style.display = "block"; }
});
await page.screenshot({ path: outPath, clip: { x, y, width: w, height: h } });
await browser.close();
console.log("saved", outPath);
