const ChatHistory = require('../models/ChatHistory');

class HistoryController {
  /**
   * Pridobi celotno zgodovino za določen session
   */
  async getHistory(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ error: 'SessionId je obvezen' });
      }

      const chatSession = await ChatHistory.findOne({ sessionId });

      if (!chatSession) {
        return res.json({
          sessionId,
          messages: [],
          message: 'Ni zgodovine za ta session',
        });
      }

      res.json({
        sessionId: chatSession.sessionId,
        messages: chatSession.messages,
        lastActivity: chatSession.lastActivity,
        totalMessages: chatSession.messages.length,
      });
    } catch (error) {
      console.error('❌ History napaka:', error.message);
      res.status(500).json({ error: 'Napaka pri pridobivanju zgodovine' });
    }
  }

  /**
   * Pridobi seznam vseh sessions (za sidebar)
   */
  async getAllSessions(req, res) {
    try {
      const sessions = await ChatHistory.find()
        .select('sessionId lastActivity messages')
        .sort({ lastActivity: -1 })
        .limit(50); 

      const formattedSessions = sessions.map((session) => ({
        sessionId: session.sessionId,
        lastActivity: session.lastActivity,
        messageCount: session.messages.length,
       
        preview:
          session.messages.find((m) => m.type === 'user')?.content ||
          'Nov pogovor',
      }));

      res.json({
        sessions: formattedSessions,
        total: sessions.length,
      });
    } catch (error) {
      console.error('❌ Sessions napaka:', error.message);
      res.status(500).json({ error: 'Napaka pri pridobivanju sessions' });
    }
  }

  /**
   * Izbriši zgodovino za določen session
   */
  async deleteHistory(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ error: 'SessionId je obvezen' });
      }

      const result = await ChatHistory.deleteOne({ sessionId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Session ni najden' });
      }

      res.json({
        message: 'Zgodovina uspešno izbrisana',
        sessionId,
      });
    } catch (error) {
      console.error('❌ Delete napaka:', error.message);
      res.status(500).json({ error: 'Napaka pri brisanju zgodovine' });
    }
  }
}

module.exports = HistoryController;