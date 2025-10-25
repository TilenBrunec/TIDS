const express = require("express");
const { chromium } = require("playwright");

const app = express();
const PORT = 8080;

app.get("/scrape100balkan", async (req, res) => {
  let browser;
  try {
    console.log("Začenjam scraping Balkan Top 100 z Playwright...");
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    });

    const page = await context.newPage();
    await page.goto("https://balkantop100.com/chart/official-chart/", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForSelector("li.qt-collapsible-item", { timeout: 10000 });

    const pesmi = await page.evaluate(() => {
      const items = document.querySelectorAll(
        "li.qt-collapsible-item.qt-part-chart.qt-chart-track.qt-card-s"
      );
      const results = [];

      items.forEach((item, index) => {
        const imePesmi =
          item.querySelector("h4.qt-ellipsis")?.textContent.trim() || "";

        const titlesDiv = item.querySelector(".qt-titles");
        const paragraphs = titlesDiv ? titlesDiv.querySelectorAll("p") : [];

        const avtor = paragraphs[0]?.textContent.trim() || "";
        const label = paragraphs[1]?.textContent.trim() || "";
        const drzava = paragraphs[2]?.textContent.trim() || "N/A";

        if (imePesmi && avtor) {
          results.push({
            pozicija: index + 1,
            imePesmi: imePesmi,
            avtor: avtor,
            label: label,
            drzava: drzava,
          });
        }
      });

      return results;
    });
    pesmi.forEach((pesem, index) => {
      console.log(
        ` Scrape-ana pesem ${index + 1}: ${pesem.imePesmi} - ${pesem.avtor} (${
          pesem.drzava
        })`
      );
    });
    console.log(` Uspešno scrape-ano ${pesmi.length} pesmi`);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      stevilo_pesmi: pesmi.length,
      pesmi: pesmi,
    });
  } catch (error) {
    console.error(" Napaka pri scraping-u:", error.message);
    res.status(500).json({
      success: false,
      error: "Napaka pri pridobivanju podatkov",
      message: error.message,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "Balkan Top 100 Scraper API (Playwright)",
    endpoints: {
      scrape: "/scrape100balkan - Scrape trenutni Balkan Top 100 chart",
    },
    info: "Uporablja Playwright za zanesljiv scraping dinamičnih vsebin",
  });
});

app.listen(PORT, () => {
  console.log(` Server teče na http://localhost:${PORT}`);
  console.log(` Scraping endpoint: http://localhost:${PORT}/scrape100balkan`);
  console.log(`🎭 Uporablja Playwright za scraping`);
});
