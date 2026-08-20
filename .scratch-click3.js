const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("framenavigated", (frame) => { if (frame === page.mainFrame()) console.log("navigated ->", frame.url()); });
  page.on("console", (msg) => { if (msg.type() === "error") console.log("console-error:", msg.text()); });
  page.on("pageerror", (err) => console.log("pageerror:", err.message));

  await page.goto("http://127.0.0.1:3000/divisions", { waitUntil: "networkidle" });

  // Find a spec-table row link (desktop grid, "contents" links) further down the page
  const specLink = page.locator("a.contents[href^='/products/']").first();
  const specCount = await page.locator("a.contents[href^='/products/']").count();
  console.log("spec-table anchors found:", specCount);

  if (specCount > 0) {
    await specLink.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const href = await specLink.getAttribute("href");
    console.log("spec link href:", href);
    console.log("URL before click:", page.url());
    await specLink.click({ timeout: 5000 });
    await page.waitForTimeout(1200);
    console.log("URL after click:", page.url());
  }

  await browser.close();
})();
