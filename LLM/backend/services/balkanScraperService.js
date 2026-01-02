const { chromium } = require('playwright');

/**
 * Service za scraping Balkan Top 100 chart
 * Uporablja Playwright za zanesljiv scraping
 */
class BalkanScraperService {
  constructor() {
    this.url = 'https://balkantop100.com/chart/official-chart/';
    this.isScrapingInProgress = false;
  }

  /**
   * Glavni scraping metoda
   * Pridobi top 100 pesmi iz Balkan chart
   */
  async scrapeTop100() {
    // Preveri če scraping že poteka
    if (this.isScrapingInProgress) {
      throw new Error('Scraping že poteka. Počakaj da se konča.');
    }

    this.isScrapingInProgress = true;
    let browser;

    try {
      console.log('🎭 Začenjam scraping Balkan Top 100 z Playwright...');

      // Launch browser
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });

      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
      });

      const page = await context.newPage();

      console.log('🌐 Nalagam stran:', this.url);

      // Navigate to page
      await page.goto(this.url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait for chart items
      console.log('⏳ Čakam na elemente...');
      await page.waitForSelector('li.qt-collapsible-item', { timeout: 10000 });

      // Extract data
      console.log('📊 Izvlačim podatke...');
      const pesmi = await page.evaluate(() => {
        const items = document.querySelectorAll(
          'li.qt-collapsible-item.qt-part-chart.qt-chart-track.qt-card-s'
        );
        const results = [];

        items.forEach((item, index) => {
          const imePesmi =
            item.querySelector('h4.qt-ellipsis')?.textContent.trim() || '';

          const titlesDiv = item.querySelector('.qt-titles');
          const paragraphs = titlesDiv ? titlesDiv.querySelectorAll('p') : [];

          const avtor = paragraphs[0]?.textContent.trim() || '';
          const label = paragraphs[1]?.textContent.trim() || '';
          const drzava = paragraphs[2]?.textContent.trim() || 'N/A';

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

      // Validation
      if (pesmi.length === 0) {
        throw new Error('Ni najdenih pesmi. Mogoče se je struktura strani spremenila.');
      }

      console.log(`✅ Uspešno scrape-ano ${pesmi.length} pesmi`);

      // Log first few
      pesmi.slice(0, 5).forEach((pesem, index) => {
        console.log(
          `   ${index + 1}. ${pesem.imePesmi} - ${pesem.avtor} (${pesem.drzava})`
        );
      });

      if (pesmi.length > 5) {
        console.log(`   ... in še ${pesmi.length - 5} pesmi`);
      }

      this.isScrapingInProgress = false;
      return pesmi;
    } catch (error) {
      this.isScrapingInProgress = false;
      console.error('❌ Scraping napaka:', error.message);
      throw new Error(`Napaka pri scraping-u: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
        console.log('🔒 Browser zaprt');
      }
    }
  }

  /**
   * Format scrapped data za MongoDB
   */
  formatForDatabase(pesmi) {
    const chartWeek = this.getChartWeek();

    return pesmi.map((pesem) => ({
      scrapedId: `${chartWeek}_${pesem.pozicija}`,
      pozicija: pesem.pozicija,
      imePesmi: pesem.imePesmi,
      avtor: pesem.avtor,
      label: pesem.label,
      drzava: pesem.drzava,
      chartWeek: chartWeek,
    }));
  }

  /**
   * Generira chart week identifier (YYYY-Www)
   * Primer: "2024-W52"
   */
  getChartWeek() {
    const now = new Date();
    const year = now.getFullYear();

    // ISO week number
    const onejan = new Date(year, 0, 1);
    const week = Math.ceil(
      ((now - onejan) / 86400000 + onejan.getDay() + 1) / 7
    );

    return `${year}-W${String(week).padStart(2, '0')}`;
  }

  /**
   * Test metoda - vrne mock data za testing
   */
  getMockData() {
    console.log('🧪 Uporabljam mock data za testing');

    const mockPesmi = [
      {
        pozicija: 1,
        imePesmi: 'Test Pesem 1',
        avtor: 'Test Artist 1',
        label: 'Test Label',
        drzava: 'Slovenia',
      },
      {
        pozicija: 2,
        imePesmi: 'Test Pesem 2',
        avtor: 'Test Artist 2',
        label: 'Test Label',
        drzava: 'Croatia',
      },
      {
        pozicija: 3,
        imePesmi: 'Test Pesem 3',
        avtor: 'Test Artist 3',
        label: 'Test Label',
        drzava: 'Serbia',
      },
    ];

    return this.formatForDatabase(mockPesmi);
  }

  /**
   * Check če scraping poteka
   */
  isScrapingActive() {
    return this.isScrapingInProgress;
  }
}

module.exports = BalkanScraperService;