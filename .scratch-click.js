const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (err) => errors.push("pageerror: " + err.message));

  await page.goto("http://127.0.0.1:3000/divisions", { waitUntil: "networkidle" });
  await page.screenshot({ path: "C:/Users/ASTORE~1/AppData/Local/Temp/claude/d--turk-enta/0f519872-79fc-4102-85bb-a443d72b7d14/scratchpad/divisions-page.png", fullPage: true });

  // Inspect the first product card in the recommended grid
  const card = page.locator("a[href^='/products/']").first();
  const count = await page.locator("a[href^='/products/']").count();
  console.log("product-linking anchors found:", count);
  const href = await card.getAttribute("href");
  console.log("first card href:", href);

  const box = await card.boundingBox();
  console.log("first card bbox:", JSON.stringify(box));

  // What's actually at the click point (topmost element)?
  if (box) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const topEl = await page.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return null;
      return { tag: el.tagName, cls: el.className, closestA: !!el.closest("a") };
    }, { x: cx, y: cy });
    console.log("element at card center:", JSON.stringify(topEl));
  }

  await card.click();
  await page.waitForTimeout(1500);
  console.log("URL after click:", page.url());
  console.log("console/page errors:", JSON.stringify(errors));

  await page.screenshot({ path: "C:/Users/ASTORE~1/AppData/Local/Temp/claude/d--turk-enta/0f519872-79fc-4102-85bb-a443d72b7d14/scratchpad/after-click.png" });

  await browser.close();
})();
