const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://127.0.0.1:3000/divisions", { waitUntil: "networkidle" });

  // Scroll down in small steps so IntersectionObserver-based reveals actually fire,
  // mimicking real user scrolling instead of Playwright's instant fullPage resize.
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 400) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  // Recommended grid should be right after hero
  await page.evaluate(() => window.scrollTo(0, 420));
  await page.waitForTimeout(400);
  await page.screenshot({ path: "C:/Users/ASTORE~1/AppData/Local/Temp/claude/d--turk-enta/0f519872-79fc-4102-85bb-a443d72b7d14/scratchpad/recommended-grid.png" });

  await page.evaluate(() => window.scrollTo(0, 1150));
  await page.waitForTimeout(400);
  await page.screenshot({ path: "C:/Users/ASTORE~1/AppData/Local/Temp/claude/d--turk-enta/0f519872-79fc-4102-85bb-a443d72b7d14/scratchpad/recommended-grid-2.png" });

  // Find first spec-table section
  const specTop = await page.evaluate(() => {
    const el = document.querySelector("a.contents");
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return rect.top + window.scrollY - 150;
  });
  console.log("specTop:", specTop);
  if (specTop) {
    await page.evaluate((y) => window.scrollTo(0, y), specTop);
    await page.waitForTimeout(400);
    await page.screenshot({ path: "C:/Users/ASTORE~1/AppData/Local/Temp/claude/d--turk-enta/0f519872-79fc-4102-85bb-a443d72b7d14/scratchpad/spec-table.png" });
  }

  await browser.close();
})();
