const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {

      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB povezan: ${connection.connection.host}`);
    console.log(`📊 Baza: ${connection.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB napaka pri povezavi:', error.message);
    process.exit(1);
  }
};


const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB povezava zaprta');
  } catch (error) {
    console.error('❌ Napaka pri zapiranju povezave:', error.message);
  }
};

module.exports = {
  connectDatabase,
  closeDatabase,
};