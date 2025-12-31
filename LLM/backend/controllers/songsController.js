const ChatHistory = require('../models/ChatHistory');
const GeminiService = require('../utils/geminiService');


class SongsController {
  constructor(geminiApiKey) {
    this.geminiService = new GeminiService(geminiApiKey);
  }

  /**
   * Validacija input podatkov
   */
  validateInput(message, count, genre) {
    if (!message || typeof message !== 'string') {
      throw new Error('Manjka ali je neveljavno polje "message"');
    }

    const validCount = Math.min(10, Math.max(1, Number(count) || 5));
    const validGenre = genre && typeof genre === 'string' ? genre : 'any';

    return { validCount, validGenre };
  }

  /**
   * Glavni endpoint - pridobi priporočila pesmi
   */
  async getRecommendations(req, res) {
    try {
      const { message, count, genre, sessionId } = req.body;

      // Validacija
      const { validCount, validGenre } = this.validateInput(
        message,
        count,
        genre
      );

      // Pridobi priporočila od AI
      const recommendations = await this.geminiService.getSongRecommendations(
        message,
        validCount,
        validGenre
      );

      // Če imamo sessionId, shranimo v zgodovino
      if (sessionId) {
        await this.saveChatHistory(
          sessionId,
          message,
          validCount,
          validGenre,
          recommendations.songs
        );
      }

      res.json(recommendations);
    } catch (error) {
      console.error('❌ Controller napaka:', error.message);


      const statusCode = error.message.includes('Manjka') ? 400 : 500;
      res.status(statusCode).json({
        error: error.message || 'Napaka pri pridobivanju podatkov',
      });
    }
  }

  /**
   * Shrani chat v zgodovino
   */
  async saveChatHistory(sessionId, message, count, genre, songs) {
    try {
      const chatSession = await ChatHistory.findOrCreateSession(sessionId);

      // Dodaj uporabniško sporočilo
      await chatSession.addMessage({
        type: 'user',
        content: `(${count} pesmi, žanr: ${genre}) ${message}`,
      });

      // Dodaj bot odgovor
      await chatSession.addMessage({
        type: 'bot',
        content: `Super! Našel sem ${songs.length} ${this.getSongCountText(
          songs.length
        )} (${genre}):`,
        songs: songs,
      });
    } catch (error) {
      console.error('⚠️  Napaka pri shranjevanju zgodovine:', error.message);
      
    }
  }

  /**
   * Helper funkcija za pravilno sklanjatvijo
   */
  getSongCountText(count) {
    if (count === 1) return 'pesem';
    if (count === 2) return 'pesmi';
    if (count === 3 || count === 4) return 'pesmi';
    return 'pesmi';
  }
}

module.exports = SongsController;