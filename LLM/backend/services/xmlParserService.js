const fs = require('fs').promises;
const path = require('path');
const { parseStringPromise } = require('xml2js');

/**
 * Service za parsanje XML files in konverzijo v JSON
 */
class XmlParserService {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
  }

  /**
   * Parse en XML file in vrni array pesmi
   */
  async parseXmlFile(filePath) {
    try {
      console.log(`📄 Parsing XML file: ${path.basename(filePath)}`);

      // Read XML file
      const xmlContent = await fs.readFile(filePath, 'utf-8');

      // Parse XML to JSON
      const result = await parseStringPromise(xmlContent, {
        explicitArray: false,
        trim: true,
      });

      // Extract songs
      if (!result.songs || !result.songs.song) {
        console.warn(`⚠️  No songs found in ${path.basename(filePath)}`);
        return [];
      }

      // Normalize songs (lahko je array ali single object)
      const songsArray = Array.isArray(result.songs.song)
        ? result.songs.song
        : [result.songs.song];

      // Format songs
      const formattedSongs = songsArray.map((song) => ({
        title: song.title,
        artist: song.artist,
        genre: song.genre,
        region: song.region,
        songId: this.generateSongId(song.title, song.artist),
      }));

      console.log(`✅ Parsed ${formattedSongs.length} songs from ${path.basename(filePath)}`);
      return formattedSongs;
    } catch (error) {
      console.error(`❌ Error parsing ${path.basename(filePath)}:`, error.message);
      throw error;
    }
  }

  /**
   * Parse vse XML files v data directory
   */
  async parseAllXmlFiles() {
    try {
      console.log(`📂 Scanning directory: ${this.dataDir}`);

      // Read directory
      const files = await fs.readdir(this.dataDir);

      // Filter XML files
      const xmlFiles = files.filter((file) =>
        file.toLowerCase().endsWith('.xml')
      );

      if (xmlFiles.length === 0) {
        console.warn('⚠️  No XML files found in data directory');
        return [];
      }

      console.log(`🎵 Found ${xmlFiles.length} XML files`);

      // Parse all files
      const allSongs = [];
      for (const file of xmlFiles) {
        const filePath = path.join(this.dataDir, file);
        const songs = await this.parseXmlFile(filePath);
        allSongs.push(...songs);
      }

      // Remove duplicates based on songId
      const uniqueSongs = this.removeDuplicates(allSongs);

      console.log(`🎯 Total unique songs: ${uniqueSongs.length}`);
      return uniqueSongs;
    } catch (error) {
      console.error('❌ Error parsing XML files:', error.message);
      throw error;
    }
  }

  /**
   * Remove duplicate songs
   */
  removeDuplicates(songs) {
    const uniqueMap = new Map();

    songs.forEach((song) => {
      if (!uniqueMap.has(song.songId)) {
        uniqueMap.set(song.songId, song);
      }
    });

    return Array.from(uniqueMap.values());
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
   * Get statistics o parsanih pesmih
   */
  getStatistics(songs) {
    const stats = {
      total: songs.length,
      byRegion: {},
      byGenre: {},
    };

    songs.forEach((song) => {
      // By region
      stats.byRegion[song.region] = (stats.byRegion[song.region] || 0) + 1;

      // By genre
      stats.byGenre[song.genre] = (stats.byGenre[song.genre] || 0) + 1;
    });

    return stats;
  }

  /**
   * Export parsed data to JSON file (optional)
   */
  async exportToJson(songs, outputPath) {
    try {
      const jsonContent = JSON.stringify(songs, null, 2);
      await fs.writeFile(outputPath, jsonContent, 'utf-8');
      console.log(`✅ Exported to JSON: ${outputPath}`);
    } catch (error) {
      console.error('❌ Error exporting to JSON:', error.message);
      throw error;
    }
  }
}

module.exports = XmlParserService;