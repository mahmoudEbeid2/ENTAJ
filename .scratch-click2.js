const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (err) => errors.push("pageerror: " + err.message));
  page.on("framenavigated", (frame) => { if (frame === page.mainFrame()) console.log("navigated ->", frame.url()); });

  await page.goto("http://127.0.0.1:3000/divisions", { waitUntil: "networkidle" });

  const card = page.locator("a[href^='/products/']").first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const box = await card.boundingBox();
  console.log("bbox after scroll:", JSON.stringify(box));

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const topEl = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { tag: el.tagName, cls: el.className, id: el.id, rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height }, outerHTMLStart: el.outerHTML.slice(0,150) };
  }, { x: cx, y: cy });
  console.log("element at card center:", JSON.stringify(topEl));

  await page.screenshot({ path: "C:/Users/ASTORE~1/AppData/Local/Temp/claude/d--turk-enta/0f519872-79fc-4102-85bb-a443d72b7d14/scratchpad/scrolled-to-card.png" });

  console.log("URL before click:", page.url());
  await card.click({ timeout: 5000 });
  await page.waitForTimeout(1500);
  console.log("URL after click:", page.url());
  console.log("errors:", JSON.stringify(errors));

  await browser.close();
})();
