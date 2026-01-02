const mongoose = require('mongoose');

/**
 * Schema za pesmi iz XML datotek
 */
const SongSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    artist: {
      type: String,
      required: true,
      index: true,
    },
    genre: {
      type: String,
      required: true,
      index: true,
    },
    region: {
      type: String,
      required: true,
      index: true,
    },
    // Unique identifier - kombinacija title + artist
    songId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Metadata
    addedAt: {
      type: Date,
      default: Date.now,
    },
    playCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound indexes
 */
SongSchema.index({ region: 1, genre: 1 });
SongSchema.index({ genre: 1, artist: 1 });

/**
 * Text index za search
 */
SongSchema.index({
  title: 'text',
  artist: 'text',
});

/**
 * Static: Bulk upsert
 */
SongSchema.statics.bulkUpsertSongs = async function (songs) {
  if (!songs || songs.length === 0) return { inserted: 0, updated: 0 };

  const bulkOps = songs.map((song) => ({
    updateOne: {
      filter: { songId: song.songId },
      update: { $set: song },
      upsert: true,
    },
  }));

  try {
    const result = await this.bulkWrite(bulkOps);
    return {
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      total: result.upsertedCount + result.modifiedCount,
    };
  } catch (error) {
    console.error('❌ Bulk upsert napaka:', error.message);
    throw error;
  }
};

/**
 * Static: Find by genre
 */
SongSchema.statics.findByGenre = function (genre, limit = 20) {
  return this.find({ genre: new RegExp(genre, 'i') })
    .sort({ playCount: -1 })
    .limit(limit);
};

/**
 * Static: Find by region
 */
SongSchema.statics.findByRegion = function (region, limit = 20) {
  return this.find({ region })
    .sort({ playCount: -1 })
    .limit(limit);
};

/**
 * Static: Search
 */
SongSchema.statics.searchSongs = function (query, limit = 20) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit);
};

/**
 * Static: Random songs
 */
SongSchema.statics.getRandomSongs = function (limit = 10, filter = {}) {
  return this.aggregate([
    { $match: filter },
    { $sample: { size: limit } },
  ]);
};

const Song = mongoose.model('Song', SongSchema);

module.exports = Song;