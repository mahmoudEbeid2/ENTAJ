import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const svgPath = process.argv[2];
const outPath = process.argv[3];
const scale = Number(process.argv[4] || 8);

const svgContent = fs.readFileSync(svgPath, "utf-8");
const html = `<!doctype html><html><body style="margin:0;background:#fff"><div id="c">${svgContent}</div></body></html>`;
const tmpHtml = svgPath + ".html";
fs.writeFileSync(tmpHtml, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 800 }, deviceScaleFactor: scale });
await page.goto("file:///" + path.resolve(tmpHtml).replace(/\\/g, "/"));
await page.waitForTimeout(200);
const el = await page.$("svg");
await el.screenshot({ path: outPath });
await browser.close();
console.log("saved", outPath);
