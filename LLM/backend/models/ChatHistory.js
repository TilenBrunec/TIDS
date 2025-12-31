const mongoose = require('mongoose');

/**
 * Schema za eno sporočilo v chatu
 */
const MessageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'bot'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  songs: [
    {
      title: String,
      artist: String,
      genre: String,
      link: String,
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Schema za celotno chat session (pogovor)
 */
const ChatHistorySchema = new mongoose.Schema(
  {
    // Unikatni ID za identifikacijo uporabnika (lahko je sessionID ali userID)
    sessionId: {
      type: String,
      required: true,
      index: true, // Index za hitrejše iskanje
    },
    // Seznam vseh sporočil v tem pogovoru
    messages: [MessageSchema],
    // Metadata
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Avtomatsko dodaja createdAt in updatedAt
  }
);

/**
 * Index za boljše performance pri iskanju
 * - sessionId: hitro iskanje po uporabniku
 * - lastActivity: sortiranje po aktivnosti
 */
ChatHistorySchema.index({ sessionId: 1, lastActivity: -1 });

/**
 * Metoda za dodajanje novega sporočila
 */
ChatHistorySchema.methods.addMessage = function (messageData) {
  this.messages.push(messageData);
  this.lastActivity = new Date();
  return this.save();
};

/**
 * Statična metoda za pridobivanje ali kreiranje chat session
 */
ChatHistorySchema.statics.findOrCreateSession = async function (sessionId) {
  let session = await this.findOne({ sessionId });

  if (!session) {
    session = await this.create({
      sessionId,
      messages: [],
    });
  }

  return session;
};

const ChatHistory = mongoose.model('ChatHistory', ChatHistorySchema);

module.exports = ChatHistory;