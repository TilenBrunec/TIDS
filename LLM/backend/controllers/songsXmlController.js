const Song = require('../models/Song');
const XmlParserService = require('../services/xmlParserService');

/**
 * Controller za Songs operacije
 */
class SongsXmlController {
  constructor() {
    this.xmlParser = new XmlParserService();
  }

  /**
   * Import pesmi iz XML files v bazo
   */
  async importFromXml(req, res) {
    try {
      const startTime = Date.now();
      console.log('🎵 Začenjam XML import...');

      // Parse XML files
      const songs = await this.xmlParser.parseAllXmlFiles();

      if (songs.length === 0) {
        return res.status(404).json({
          error: 'Ni najdenih pesmi',
          message: 'No XML files ali prazni XML files v data directory',
        });
      }

      // Get statistics
      const stats = this.xmlParser.getStatistics(songs);
      console.log('📊 Statistika:', stats);

      // Bulk insert v MongoDB
      console.log(`💾 Shranjujem ${songs.length} pesmi v bazo...`);
      const result = await Song.bulkUpsertSongs(songs);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`✅ Import končan: ${result.total} pesmi v ${duration}s`);

      res.json({
        success: true,
        stats: {
          totalSongs: songs.length,
          inserted: result.inserted,
          updated: result.updated,
          byRegion: stats.byRegion,
          byGenre: Object.keys(stats.byGenre).length,
          duration: `${duration}s`,
        },
        message: `Uspešno importiranih ${result.total} pesmi iz XML`,
      });
    } catch (error) {
      console.error('❌ XML import napaka:', error.message);
      res.status(500).json({
        error: 'Napaka pri XML importu',
        message: error.message,
      });
    }
  }

  /**
   * Pridobi vse pesmi iz baze
   */
  async getAllSongs(req, res) {
    try {
      const {
        limit = 50,
        page = 1,
        region,
        genre,
        search,
      } = req.query;

      let query = {};

      // Filters
      if (region) query.region = region;
      if (genre) query.genre = new RegExp(genre, 'i');

      let results;

      if (search) {
        // Text search
        results = await Song.searchSongs(search, parseInt(limit));
      } else {
        // Normal query
        const skip = (parseInt(page) - 1) * parseInt(limit);
        results = await Song.find(query)
          .sort({ playCount: -1, title: 1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean();
      }

      const total = await Song.countDocuments(query);

      res.json({
        songs: results,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error('❌ Get songs napaka:', error.message);
      res.status(500).json({
        error: 'Napaka pri pridobivanju pesmi',
        message: error.message,
      });
    }
  }

  /**
   * Pridobi statistiko
   */
  async getStats(req, res) {
    try {
      // Total songs
      const totalSongs = await Song.countDocuments();

      // By region
      const byRegion = await Song.aggregate([
        {
          $group: {
            _id: '$region',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      // By genre (top 20)
      const byGenre = await Song.aggregate([
        {
          $group: {
            _id: '$genre',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 20,
        },
      ]);

      // Top artists (top 20)
      const topArtists = await Song.aggregate([
        {
          $group: {
            _id: '$artist',
            songCount: { $sum: 1 },
            totalPlays: { $sum: '$playCount' },
          },
        },
        {
          $sort: { songCount: -1 },
        },
        {
          $limit: 20,
        },
      ]);

      res.json({
        totalSongs,
        byRegion,
        byGenre,
        topArtists,
      });
    } catch (error) {
      console.error('❌ Stats napaka:', error.message);
      res.status(500).json({
        error: 'Napaka pri pridobivanju statistike',
        message: error.message,
      });
    }
  }

  /**
   * Search pesmi za AI
   */
  async searchForAI(req, res) {
    try {
      const { query, genre, region, limit = 10 } = req.body;

      let filter = {};

      if (region) filter.region = region;
      if (genre) filter.genre = new RegExp(genre, 'i');

      let songs;

      if (query) {
        // Text search
        songs = await Song.find(
          {
            ...filter,
            $text: { $search: query },
          },
          { score: { $meta: 'textScore' } }
        )
          .sort({ score: { $meta: 'textScore' } })
          .limit(parseInt(limit));
      } else {
        // Random songs
        songs = await Song.getRandomSongs(parseInt(limit), filter);
      }

      res.json({
        songs,
        count: songs.length,
      });
    } catch (error) {
      console.error('❌ AI search napaka:', error.message);
      res.status(500).json({
        error: 'Napaka pri iskanju pesmi',
        message: error.message,
      });
    }
  }

  /**
   * Clear database
   */
  async clearDatabase(req, res) {
    try {
      const result = await Song.deleteMany({});

      res.json({
        success: true,
        message: `Izbrisanih ${result.deletedCount} pesmi`,
      });
    } catch (error) {
      console.error('❌ Clear napaka:', error.message);
      res.status(500).json({
        error: 'Napaka pri brisanju baze',
        message: error.message,
      });
    }
  }
}

module.exports = SongsXmlController;