import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const SUB_DIR = process.argv[2] || ""; // e.g. "before" or "after"
const OUTPUT_DIR = SUB_DIR
  ? path.join(__dirname, "screenshots", SUB_DIR)
  : path.join(__dirname, "screenshots");

// Pages to capture
const pages = [
  { name: "home", path: "/" },
  { name: "models", path: "/models" },
  { name: "library", path: "/library" },
  { name: "model-detail", path: "/model/1" },
  { name: "upload", path: "/library/upload" },
];

// Viewports
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

async function run() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  for (const viewport of viewports) {
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
    });

    for (const p of pages) {
      const url = `${BASE_URL}${p.path}`;
      console.log(`📸 ${viewport.name} — ${p.name} (${url})`);

      try {
        await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
        // Wait for React to render and CSS to load
        await page.waitForSelector("#root", { timeout: 5000 });
        await new Promise((r) => setTimeout(r, 3000));

        // Log any console errors
        const errors: string[] = [];
        page.on("console", (msg) => {
          if (msg.type() === "error") errors.push(msg.text());
        });
        // Check if body has content
        const bodyHTML = await page.evaluate(() => document.body.innerHTML.length);
        const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
        console.log(`   Body length: ${bodyHTML}, bg: ${bgColor}`);
        if (errors.length) console.log(`   Errors: ${errors.join("; ")}`);

        const filename = `${p.name}-${viewport.name}.png`;
        await page.screenshot({
          path: path.join(OUTPUT_DIR, filename),
          fullPage: true,
        });
        console.log(`   ✅ Saved ${filename}`);
      } catch (err) {
        console.error(`   ❌ Failed: ${err}`);
      }
    }
  }

  await browser.close();
  console.log(`\n🎉 All screenshots saved to ${OUTPUT_DIR}`);
}

run().catch(console.error);
