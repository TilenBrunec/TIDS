const mongoose = require('mongoose');

/**
 * Schema za shranjene pesmi
 */
const SavedSongSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    // Dodatni metadata
    savedAt: {
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
 * Index za hitro iskanje
 */
SavedSongSchema.index({ sessionId: 1, savedAt: -1 });

/**
 * Metoda za povečanje števila predvajanj
 */
SavedSongSchema.methods.incrementPlayCount = function () {
  this.playCount += 1;
  return this.save();
};

const SavedSong = mongoose.model('SavedSong', SavedSongSchema);

module.exports = SavedSong;