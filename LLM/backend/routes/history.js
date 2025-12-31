const express = require('express');
const router = express.Router();


function setupHistoryRoutes(historyController) {
  /**
   * GET /api/history
   * Pridobi vse chat sessions
   */
  router.get('/', (req, res) => historyController.getAllSessions(req, res));

  /**
   * GET /api/history/:sessionId
   * Pridobi zgodovino za specifičen session
   */
  router.get('/:sessionId', (req, res) => historyController.getHistory(req, res));

  /**
   * DELETE /api/history/:sessionId
   * Izbriši zgodovino za specifičen session
   */
  router.delete('/:sessionId', (req, res) =>
    historyController.deleteHistory(req, res)
  );

  return router;
}

module.exports = setupHistoryRoutes;