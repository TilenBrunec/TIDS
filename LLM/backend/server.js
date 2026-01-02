const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import konfiguracij in middleware
const { connectDatabase } = require('./config/database');
const {
  errorHandler,
  notFound,
  requestLogger,
} = require('./middleware/errorHandler');

// Import kontrolerjev
const SongsController = require('./controllers/songsController');
const HistoryController = require('./controllers/historyController');
const BalkanController = require('./controllers/balkanController');

// Import routes
const setupSongsRoutes = require('./routes/songs');
const setupHistoryRoutes = require('./routes/history');
const setupBalkanRoutes = require('./routes/balkan');

/**
 * Glavni aplikacijski server
 */
class MusicChatbotServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;

    // Inicializacija kontrolerjev
    this.songsController = new SongsController(process.env.GEMINI_API_KEY);
    this.historyController = new HistoryController();
    this.balkanController = new BalkanController();
  }

  /**
   * Konfiguracija middleware
   */
  setupMiddleware() {
    // CORS za frontend
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      })
    );

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use(requestLogger);
  }

  /**
   * Konfiguracija routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Music Chatbot API',
      });
    });

    // API routes
    this.app.use('/api/songs', setupSongsRoutes(this.songsController));
    this.app.use('/api/history', setupHistoryRoutes(this.historyController));
    this.app.use('/api/balkan', setupBalkanRoutes(this.balkanController));

    // 404 handler
    this.app.use(notFound);

    // Error handler (mora biti zadnji)
    this.app.use(errorHandler);
  }

  /**
   * Inicializacija in zagon strežnika
   */
  async start() {
    try {
      // Povezava z MongoDB
      await connectDatabase();

      // Setup middleware in routes
      this.setupMiddleware();
      this.setupRoutes();

      // Zagon strežnika
      this.app.listen(this.port, () => {
        console.log('');
        console.log('🎵 ═══════════════════════════════════════════');
        console.log(`🎵 Music Chatbot Server`);
        console.log(`🎵 Port: ${this.port}`);
        console.log(`🎵 URL: http://localhost:${this.port}`);
        console.log(`🎵 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('🎵 ═══════════════════════════════════════════');
        console.log('');
      });
    } catch (error) {
      console.error('❌ Napaka pri zagonu strežnika:', error.message);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} signal prejet, zapiranje strežnika...`);

      try {
        const { closeDatabase } = require('./config/database');
        await closeDatabase();
        process.exit(0);
      } catch (error) {
        console.error('❌ Napaka pri zapiranju:', error.message);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

// Zagon strežnika
if (require.main === module) {
  const server = new MusicChatbotServer();
  server.setupGracefulShutdown();
  server.start();
}

module.exports = MusicChatbotServer;