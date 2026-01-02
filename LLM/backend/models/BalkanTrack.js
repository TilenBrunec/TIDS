const mongoose = require('mongoose');

/**
 * Schema za Balkan Top 100 pesmi
 */
const BalkanTrackSchema = new mongoose.Schema(
  {
    // Unique identifier - kombinacija pozicije + datum scrapa
    scrapedId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Pozicija na chart-u
    pozicija: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      index: true,
    },
    // Ime pesmi
    imePesmi: {
      type: String,
      required: true,
      index: true,
    },
    // Avtor/izvajalec
    avtor: {
      type: String,
      required: true,
      index: true,
    },
    // Label
    label: {
      type: String,
      required: true,
    },
    // Država
    drzava: {
      type: String,
      required: true,
      default: 'N/A',
    },
    // Metadata
    scrapedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Chart week identifier (za tracking skozi čas)
    chartWeek: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound index za hitro iskanje po tednu
 */
BalkanTrackSchema.index({ chartWeek: 1, pozicija: 1 });

/**
 * Text index za search
 */
BalkanTrackSchema.index({
  imePesmi: 'text',
  avtor: 'text',
});

/**
 * Static metoda: Pridobi current chart (zadnji scrape)
 */
BalkanTrackSchema.statics.getCurrentChart = function () {
  return this.find()
    .sort({ scrapedAt: -1, pozicija: 1 })
    .limit(100);
};

/**
 * Static metoda: Pridobi chart za določen teden
 */
BalkanTrackSchema.statics.getChartByWeek = function (chartWeek) {
  return this.find({ chartWeek })
    .sort({ pozicija: 1 });
};

/**
 * Static metoda: Bulk upsert za nov scrape
 */
BalkanTrackSchema.statics.bulkUpsertChart = async function (tracks, chartWeek) {
  if (!tracks || tracks.length === 0) return { inserted: 0, updated: 0 };

  const bulkOps = tracks.map((track) => ({
    updateOne: {
      filter: { scrapedId: track.scrapedId },
      update: {
        $set: {
          ...track,
          chartWeek,
          scrapedAt: new Date(),
        },
      },
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
    console.error('❌ Balkan bulk upsert napaka:', error.message);
    throw error;
  }
};

/**
 * Static metoda: Pridobi trending (pesmi ki so se najbolj izboljšale)
 */
BalkanTrackSchema.statics.getTrending = async function (limit = 10) {
  // Pridobi zadnji 2 tedna
  const weeks = await this.distinct('chartWeek').sort().limit(2);
  
  if (weeks.length < 2) return [];

  const [currentWeek, previousWeek] = weeks.reverse();
  
  const current = await this.find({ chartWeek: currentWeek });
  const previous = await this.find({ chartWeek: previousWeek });

  // Izračunaj spremembe pozicije
  const trending = current.map((curr) => {
    const prev = previous.find(
      (p) => p.imePesmi === curr.imePesmi && p.avtor === curr.avtor
    );

    return {
      ...curr.toObject(),
      previousPosition: prev ? prev.pozicija : null,
      positionChange: prev ? prev.pozicija - curr.pozicija : null,
      isNew: !prev,
    };
  });

  // Sortiraj po največji spremembi
  return trending
    .filter((t) => t.positionChange !== null || t.isNew)
    .sort((a, b) => {
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return (b.positionChange || 0) - (a.positionChange || 0);
    })
    .slice(0, limit);
};

const BalkanTrack = mongoose.model('BalkanTrack', BalkanTrackSchema);

module.exports = BalkanTrack;