const express = require('express');
const router = express.Router();

/**
 * Konfiguracija routes za Balkan Top 100 scraper
 */
function setupBalkanRoutes(balkanController, cronService = null) {
  /**
   * POST /api/balkan/scrape
   * Scrape in shrani Balkan Top 100
   */
  router.post('/scrape', (req, res) =>
    balkanController.scrapeAndSave(req, res)
  );

  /**
   * GET /api/balkan/current
   * Pridobi trenutni chart iz baze
   *
   * Query params:
   * - limit: število rezultatov (default: 100)
   */
  router.get('/current', (req, res) =>
    balkanController.getCurrentChart(req, res)
  );

  /**
   * GET /api/balkan/week/:week
   * Pridobi chart za določen teden
   *
   * Params:
   * - week: chart week (npr. "2024-W52")
   */
  router.get('/week/:week', (req, res) =>
    balkanController.getChartByWeek(req, res)
  );

  /**
   * GET /api/balkan/trending
   * Pridobi trending pesmi (največje spremembe)
   *
   * Query params:
   * - limit: število rezultatov (default: 10)
   */
  router.get('/trending', (req, res) =>
    balkanController.getTrending(req, res)
  );

  /**
   * GET /api/balkan/search
   * Išči pesmi v Balkan chartu
   *
   * Query params:
   * - query: iskalni niz (obvezen)
   * - country: filter po državi (opcijsko)
   */
  router.get('/search', (req, res) =>
    balkanController.searchTracks(req, res)
  );

  /**
   * GET /api/balkan/stats
   * Pridobi statistiko o Balkan chart-ih
   */
  router.get('/stats', (req, res) => balkanController.getStats(req, res));

  /**
   * DELETE /api/balkan/cleanup
   * Izbriši stare chart-e
   *
   * Query params:
   * - weeksToKeep: število tednov za obdržati (default: 4)
   */
  router.delete('/cleanup', (req, res) =>
    balkanController.cleanupOldCharts(req, res)
  );

  /**
   * GET /api/balkan/cron/status
   * Pridobi status avtomatskega scrapinga
   */
  if (cronService) {
    router.get('/cron/status', (req, res) => {
      const status = cronService.getJobsStatus();
      res.json({
        success: true,
        jobs: status,
      });
    });

    /**
     * POST /api/balkan/cron/test
     * Ročni test scraping (takoj)
     */
    router.post('/cron/test', async (req, res) => {
      try {
        await cronService.runTestScrape();
        res.json({
          success: true,
          message: 'Test scraping zagnan',
        });
      } catch (error) {
        res.status(500).json({
          error: 'Napaka pri test scrapingu',
          message: error.message,
        });
      }
    });
  }

  return router;
}

module.exports = setupBalkanRoutes;