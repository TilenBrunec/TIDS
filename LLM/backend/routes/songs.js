const express = require('express');
const router = express.Router();


function setupSongsRoutes(songsController) {
  /**
   * POST /api/songs
   * Pridobi priporočila pesmi
   *
   * Body:
   * {
   *   message: string,
   *   count: number,
   *   genre: string,
   *   sessionId: string (optional)
   * }
   */
  router.post('/', (req, res) => songsController.getRecommendations(req, res));

  return router;
}

module.exports = setupSongsRoutes;






