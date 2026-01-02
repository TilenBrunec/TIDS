const BalkanTrack = require('../models/BalkanTrack');
const BalkanScraperService = require('../services/balkanScraperService');

/**
 * Controller za Balkan Top 100 operacije
 */
class BalkanController {
  constructor() {
    this.scraperService = new BalkanScraperService();
  }

  /**
   * Scrape in shrani Balkan Top 100
   */
  async scrapeAndSave(req, res) {
    // Preveri če scraping že poteka
    if (this.scraperService.isScrapingActive()) {
      return res.status(409).json({
        error: 'Scraping že poteka',
        message: 'Počakaj da se trenutni scraping konča',
      });
    }

    try {
      const startTime = Date.now();
      console.log('🎵 Začenjam scraping Balkan Top 100...');

      // Scrape data
      const scrapedData = await this.scraperService.scrapeTop100();

      // Format za bazo
      const formattedData = this.scraperService.formatForDatabase(scrapedData);
      const chartWeek = this.scraperService.getChartWeek();

      console.log(`💾 Shranjujem ${formattedData.length} pesmi v bazo...`);

      // Save to database
      const result = await BalkanTrack.bulkUpsertChart(
        formattedData,
        chartWeek
      );

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(
        `✅ Scraping končan: ${result.total} pesmi v ${duration}s`
      );

      res.json({
        success: true,
        stats: {
          totalScraped: scrapedData.length,
          inserted: result.inserted,
          updated: result.updated,
          chartWeek: chartWeek,
          duration: `${duration}s`,
        },
        message: `Uspešno scrape-ano in shranjeno ${result.total} pesmi`,
      });
    } catch (error) {
      console.error('❌ Scraping napaka:', error.message);
      res.status(500).json({
        error: 'Napaka pri scraping-u',
        message: error.message,
      });
    }
  }

  /**
   * Pridobi current chart iz baze
   */
  async getCurrentChart(req, res) {
    try {
      const { limit = 100 } = req.query;

      const tracks = await BalkanTrack.getCurrentChart();
      const limitedTracks = tracks.slice(0, parseInt(limit));

      res.json({
        success: true,
        count: limitedTracks.length,
        chartWeek: limitedTracks[0]?.chartWeek || null,
        lastUpdated: limitedTracks[0]?.scrapedAt || null,
        tracks: limitedTracks,
      });
    } catch (error) {
      console.error('❌ Get chart napaka:', error.message);
      res.status(500).json({
        error: 'Napaka pri pridobivanju chart-a',
        message: error.message,
      });
    }
  }

  /**
   * Pridobi chart za določen teden
   */
  async getChartByWeek(req, res) {
    try {
      const { week } = req.params;

      if (!week) {
        return res.status(400).json({
          error: 'Manjka parameter "week"',
          example: '2024-W52',
        });
      }

      const tracks = await BalkanTrack.getChartByWeek(week);

      if (tracks.length === 0) {
        return res.status(404).json({
          error: 'Chart ni najden',
          message: `Ni podatkov za teden ${week}`,
        });
      }

      res.json({
        success: true,
        count: tracks.length,
        chartWeek: week,
        tracks: tracks,
      });
    } catch (error) {
      console.error('❌ Get week chart napaka:', error.message);
      res.status(500).json({
        error: 'Napaka pri pridobivanju chart-a',
        message: error.message,
      });
    }
  }

  /**
   * Pridobi trending pesmi
   */
  async getTrending(req, res) {
    try {
      const { limit = 10 } = req.query;

      const trending = await BalkanTrack.getTrending(parseInt(limit));

      res.json({
        success: true,
        count: trending.length,
        trending: trending,
      });
    } catch (error) {
      console.error('❌ Get trending napaka:', error.message);
      res.status(500).json({
        error: 'Napaka pri pridobivanju trending pesmi',
        message: error.message,
      });
    }
  }

  /**
   * Search pesmi v Balkan chartu
   */
  async searchTracks(req, res) {
    try {
      const { query, country } = req.query;

      if (!query) {
        return res.status(400).json({
          error: 'Manjka query parameter',
        });
      }

      let filter = {
        $text: { $search: query },
      };

      if (country) {
        filter.drzava = country;
      }

      const tracks = await BalkanTrack.find(filter, {
        score: { $meta: 'textScore' },
      })
        .sort({ score: { $meta: 'textScore' } })
        .limit(20);

      res.json({
        success: true,
        count: tracks.length,
        query: query,
        tracks: tracks,
      });
    } catch (error) {
      console.error('❌ Search napaka:', error.message);
      res.status(500).json({
        error: 'Napaka pri iskanju',
        message: error.message,
      });
    }
  }

  /**
   * Pridobi statistiko
   */
  async getStats(req, res) {
    try {
      const totalTracks = await BalkanTrack.countDocuments();

      const statsByCountry = await BalkanTrack.aggregate([
        {
          $group: {
            _id: '$drzava',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      const weeks = await BalkanTrack.distinct('chartWeek');

      res.json({
        success: true,
        stats: {
          totalTracks: totalTracks,
          totalWeeks: weeks.length,
          byCountry: statsByCountry,
          latestWeek: weeks.sort().reverse()[0] || null,
        },
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
   * Izbriši stare chart-e (cleanup)
   */
  async cleanupOldCharts(req, res) {
    try {
      const { weeksToKeep = 4 } = req.query;

      const allWeeks = await BalkanTrack.distinct('chartWeek');
      const sortedWeeks = allWeeks.sort().reverse();

      const weeksToDelete = sortedWeeks.slice(parseInt(weeksToKeep));

      if (weeksToDelete.length === 0) {
        return res.json({
          success: true,
          message: 'Ni starih chart-ov za izbris',
          deleted: 0,
        });
      }

      const result = await BalkanTrack.deleteMany({
        chartWeek: { $in: weeksToDelete },
      });

      res.json({
        success: true,
        message: `Izbrisanih ${result.deletedCount} starih chart-ov`,
        deleted: result.deletedCount,
        weeksDeleted: weeksToDelete,
      });
    } catch (error) {
      console.error('❌ Cleanup napaka:', error.message);
      res.status(500).json({
        error: 'Napaka pri cleanup-u',
        message: error.message,
      });
    }
  }
}

module.exports = BalkanController;