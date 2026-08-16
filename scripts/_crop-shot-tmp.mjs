import { chromium } from "playwright";

const url = process.argv[2];
const outPath = process.argv[3];
const x = Number(process.argv[4]);
const y = Number(process.argv[5]);
const w = Number(process.argv[6]);
const h = Number(process.argv[7]);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 4032 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(async () => {
  await new Promise((resolve) => {
    let total = 0;
    const step = 400;
    const timer = setInterval(() => {
      window.scrollBy(0, step);
      total += step;
      if (total >= document.body.scrollHeight) {
        clearInterval(timer);
        window.scrollTo(0, 0);
        resolve(undefined);
      }
    }, 100);
  });
});
await page.waitForLoadState("networkidle");
await page.waitForTimeout(500);
await page.screenshot({ path: outPath, clip: { x, y, width: w, height: h } });
await browser.close();
console.log("saved", outPath);
