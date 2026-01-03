const Song = require('../models/Song');
const JsonUploadService = require('../services/jsonUploadService');

/**
 * Controller za JSON file upload operacije
 */
class JsonUploadController {
  constructor() {
    this.jsonUploadService = new JsonUploadService();
  }

  /**
   * Upload in import JSON file
   */
  async uploadAndImport(req, res) {
    let filePath = null;

    try {
      const startTime = Date.now();

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({
          error: 'Ni fila',
          message: 'Prosim naloži JSON file',
        });
      }

      filePath = req.file.path;
      console.log('📤 JSON file uploaded:', req.file.originalname);
      console.log(`   Size: ${(req.file.size / 1024).toFixed(2)} KB`);

      // Parse JSON
      const jsonData = await this.jsonUploadService.parseJsonFile(filePath);

      // Validate structure
      this.jsonUploadService.validateJsonStructure(jsonData);

      // Transform to song format
      const songs = this.jsonUploadService.transformToSongFormat(jsonData);

      // Get statistics
      const stats = this.jsonUploadService.getStatistics(songs);
      console.log('📊 Statistika:', stats);

      // Bulk insert v MongoDB
      console.log(`💾 Shranjujem ${songs.length} pesmi v bazo...`);
      const result = await Song.bulkUpsertSongs(songs);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`✅ Upload in import končan: ${result.total} pesmi v ${duration}s`);

      // Cleanup uploaded file
      await this.jsonUploadService.cleanupFile(filePath);

      res.json({
        success: true,
        stats: {
          fileName: req.file.originalname,
          fileSize: `${(req.file.size / 1024).toFixed(2)} KB`,
          totalSongs: songs.length,
          inserted: result.inserted,
          updated: result.updated,
          byGenre: stats.byGenre,
          byRegion: stats.byRegion,
          duration: `${duration}s`,
        },
        message: `Uspešno uploadanih in importiranih ${result.total} pesmi`,
      });
    } catch (error) {
      console.error('❌ Upload/import napaka:', error.message);

      // Cleanup on error
      if (filePath) {
        await this.jsonUploadService.cleanupFile(filePath);
      }

      res.status(500).json({
        error: 'Napaka pri uploadu/importu',
        message: error.message,
      });
    }
  }

  /**
   * Get upload info/help
   */
  async getUploadInfo(req, res) {
    try {
      res.json({
        success: true,
        info: {
          description: 'Upload JSON file s pesmimi in shrani v bazo',
          acceptedFormat: 'JSON (.json)',
          maxFileSize: '10 MB',
          requiredStructure: {
            type: 'Array of objects',
            example: [
              {
                title: 'Song Title',
                artist: 'Artist Name',
                genre: 'Pop',
                region: 'USA',
              },
            ],
          },
          requiredFields: ['title', 'artist', 'genre', 'region'],
          notes: [
            'File mora biti valid JSON',
            'Vse pesmi morajo imeti vse 4 obvezna polja',
            'Duplikati se avtomatsko updatajo (по songId)',
          ],
        },
      });
    } catch (error) {
      console.error('❌ Info napaka:', error.message);
      res.status(500).json({
        error: 'Napaka pri pridobivanju info',
        message: error.message,
      });
    }
  }
}

module.exports = JsonUploadController;