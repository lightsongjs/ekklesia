const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Navigating to Minei pe Martie...");
  await page.goto(
    "https://sites.google.com/site/ortodox007/mineiele-bisericii-ortodoxe/mineiul-pe-martie",
    { waitUntil: "networkidle", timeout: 60000 }
  );

  const pageText = await page.evaluate(() => document.body.innerText);

  // Find the SECOND occurrence of "ZIUA A PATRA" (the actual content, not the TOC)
  const firstIdx = pageText.indexOf("ZIUA A PATRA");
  const secondIdx = pageText.indexOf("ZIUA A PATRA", firstIdx + 20);

  // Find the start of ZIUA A CINCEA (content section) to end our extract
  const endFirstCincea = pageText.indexOf("ZIUA A CINCEA");
  const endSecondCincea = pageText.indexOf("ZIUA A CINCEA", endFirstCincea + 20);

  // The content section ends at the second "ZIUA A CINCEA"
  const startIdx = secondIdx;
  const endIdx = endSecondCincea !== -1 ? endSecondCincea : startIdx + 30000;

  const section = pageText.substring(startIdx, endIdx);
  fs.writeFileSync("minei_ziua4.txt", section, "utf-8");
  console.log(`Extracted ${section.length} chars`);
  console.log(section);

  await browser.close();
})();
