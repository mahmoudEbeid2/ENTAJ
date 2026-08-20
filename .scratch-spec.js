const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://127.0.0.1:3000/divisions", { waitUntil: "networkidle" });

  const specLink = page.locator("a.contents").first();
  const count = await page.locator("a.contents").count();
  console.log("contents-link count:", count);

  await specLink.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "C:/Users/ASTORE~1/AppData/Local/Temp/claude/d--turk-enta/0f519872-79fc-4102-85bb-a443d72b7d14/scratchpad/spec-table-real.png" });

  await browser.close();
})();
