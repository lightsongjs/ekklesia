const { chromium } = require("playwright");
const fs = require("fs");

const months = [
  {
    name: "februarie",
    url: "https://sites.google.com/site/ortodox007/mineiele-bisericii-ortodoxe/mineiul-pe-februarie",
  },
  {
    name: "martie",
    url: "https://sites.google.com/site/ortodox007/mineiele-bisericii-ortodoxe/mineiul-pe-martie",
  },
  {
    name: "aprilie",
    url: "https://sites.google.com/site/ortodox007/mineiele-bisericii-ortodoxe/mineiul-pe-aprilie",
  },
];

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const month of months) {
    const outFile = `minei_${month.name}_complet.txt`;

    // Skip if already downloaded
    if (fs.existsSync(outFile)) {
      const stat = fs.statSync(outFile);
      if (stat.size > 10000) {
        console.log(`[SKIP] ${outFile} already exists (${stat.size} bytes)`);
        continue;
      }
    }

    console.log(`\n[SCRAPE] ${month.name} -> ${outFile}`);
    console.log(`  URL: ${month.url}`);

    const page = await browser.newPage();
    try {
      await page.goto(month.url, {
        waitUntil: "networkidle",
        timeout: 90000,
      });

      // Wait for content to render (Google Sites uses JS)
      await page.waitForTimeout(3000);

      // Extract all text content
      const pageText = await page.evaluate(() => document.body.innerText);

      fs.writeFileSync(outFile, pageText, "utf-8");
      console.log(`  -> ${pageText.length} chars written`);
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log("\nDone!");
})();
