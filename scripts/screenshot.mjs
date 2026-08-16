import { chromium } from "playwright";

const url = process.argv[2];
const outPath = process.argv[3];
const width = Number(process.argv[4] || 1440);
const height = Number(process.argv[5] || 900);
const fullPage = process.argv[6] !== "false";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(url, { waitUntil: "networkidle" });

// Trigger lazy-loaded images by scrolling through the full page first.
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

await page.screenshot({ path: outPath, fullPage });
await browser.close();
console.log("saved", outPath);
