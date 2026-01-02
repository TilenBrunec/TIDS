const express = require('express');
const router = express.Router();

/**
 * Konfiguracija routes za Songs XML operacije
 */
function setupSongsXmlRoutes(songsXmlController) {
  /**
   * POST /api/songs-xml/import
   * Import pesmi iz XML files v bazo
   */
  router.post('/import', (req, res) =>
    songsXmlController.importFromXml(req, res)
  );

  /**
   * GET /api/songs-xml/all
   * Pridobi vse pesmi iz baze
   *
   * Query params:
   * - limit: število rezultatov (default: 50)
   * - page: stran (default: 1)
   * - region: filter po regiji
   * - genre: filter po žanru
   * - search: text search
   */
  router.get('/all', (req, res) => songsXmlController.getAllSongs(req, res));

  /**
   * GET /api/songs-xml/stats
   * Pridobi statistiko
   */
  router.get('/stats', (req, res) => songsXmlController.getStats(req, res));

  /**
   * POST /api/songs-xml/search-ai
   * Search pesmi za AI
   *
   * Body:
   * - query: search text
   * - genre: filter po žanru
   * - region: filter po regiji
   * - limit: število rezultatov
   */
  router.post('/search-ai', (req, res) =>
    songsXmlController.searchForAI(req, res)
  );

  /**
   * DELETE /api/songs-xml/clear
   * Izbriši vse pesmi
   */
  router.delete('/clear', (req, res) =>
    songsXmlController.clearDatabase(req, res)
  );

  return router;
}

module.exports = setupSongsXmlRoutes;