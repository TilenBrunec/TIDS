const fs = require('fs').promises;

/**
 * Service za JSON file upload in parsing
 * Uporabnik lahko uploada svoj JSON file s pesmimi
 */
class JsonUploadService {
  /**
   * Parse uploaded JSON file
   */
  async parseJsonFile(filePath) {
    try {
      console.log('📥 Reading uploaded JSON file...');
      console.log(`   Path: ${filePath}`);

      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);

      console.log(`✅ JSON parsed successfully`);
      return data;
    } catch (error) {
      console.error('❌ JSON parse napaka:', error.message);
      throw new Error(`Napaka pri branju JSON fila: ${error.message}`);
    }
  }

  /**
   * Validate JSON structure
   * Pričakovan format:
   * [
   *   {"title": "...", "artist": "...", "genre": "...", "region": "..."},
   *   ...
   * ]
   */
  validateJsonStructure(data) {
    console.log('🔍 Validating JSON structure...');

    // Check if array
    if (!Array.isArray(data)) {
      throw new Error(
        'JSON mora biti array. Format: [{"title": "...", "artist": "...", "genre": "...", "region": "..."}]'
      );
    }

    if (data.length === 0) {
      throw new Error('JSON array je prazen');
    }

    // Validate each song
    const errors = [];
    data.forEach((song, index) => {
      const missing = [];

      if (!song.title) missing.push('title');
      if (!song.artist) missing.push('artist');
      if (!song.genre) missing.push('genre');
      if (!song.region) missing.push('region');

      if (missing.length > 0) {
        errors.push(`Song #${index + 1}: missing fields: ${missing.join(', ')}`);
      }
    });

    if (errors.length > 0) {
      throw new Error(
        `Validation napaka:\n${errors.slice(0, 5).join('\n')}\n${
          errors.length > 5 ? `...in ${errors.length - 5} more errors` : ''
        }`
      );
    }

    console.log(`✅ Validation uspešna: ${data.length} pesmi`);
    return true;
  }

  /**
   * Transform uploaded data → Song format
   */
  transformToSongFormat(jsonData) {
    console.log('🔄 Transforming uploaded data...');

    const songs = jsonData.map((song) => {
      const songId = this.generateSongId(song.title, song.artist);

      return {
        title: String(song.title).trim(),
        artist: String(song.artist).trim(),
        genre: String(song.genre).trim(),
        region: String(song.region).trim(),
        songId: songId,
      };
    });

    console.log(`✅ Transformed ${songs.length} pesmi`);
    return songs;
  }

  /**
   * Generate unique song ID
   */
  generateSongId(title, artist) {
    const normalized = `${title}_${artist}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');
    return normalized;
  }

  /**
   * Get statistics
   */
  getStatistics(songs) {
    const stats = {
      total: songs.length,
      byGenre: {},
      byRegion: {},
    };

    songs.forEach((song) => {
      // By genre
      stats.byGenre[song.genre] = (stats.byGenre[song.genre] || 0) + 1;

      // By region
      stats.byRegion[song.region] = (stats.byRegion[song.region] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clean up uploaded file
   */
  async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log('🗑️  Temporary file deleted');
    } catch (error) {
      console.error('⚠️  Cleanup warning:', error.message);
    }
  }
}

module.exports = JsonUploadService;