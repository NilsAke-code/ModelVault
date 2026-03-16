import puppeteer from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Capture all console messages
  page.on("console", (msg) => console.log(`[${msg.type()}] ${msg.text()}`));
  page.on("pageerror", (err) => console.log(`[PAGE ERROR] ${err.message}`));

  await page.goto("http://localhost:5173", { waitUntil: "domcontentloaded", timeout: 15000 });
  await new Promise((r) => setTimeout(r, 5000));

  const rootContent = await page.evaluate(() => {
    const root = document.getElementById("root");
    return {
      innerHTML: root?.innerHTML?.substring(0, 500) || "EMPTY",
      childCount: root?.childElementCount || 0,
      bodyBg: getComputedStyle(document.body).backgroundColor,
    };
  });
  console.log("Root:", JSON.stringify(rootContent, null, 2));

  await browser.close();
}

run().catch(console.error);
