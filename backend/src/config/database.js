const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const connectMongoDB = async () => {
  const MAX_RETRIES = 5;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4 — prevents ::1 (IPv6) ECONNREFUSED issues
      });
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      attempt++;
      logger.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);
      if (attempt === MAX_RETRIES) {
        logger.error('❌ Could not connect to MongoDB. Make sure it is running:');
        logger.error('   Option 1: brew services start mongodb-community');
        logger.error('   Option 2: docker run -d -p 27017:27017 --name mongo mongo:7');
        logger.error('   Option 3: docker compose up mongodb -d');
        process.exit(1);
      }
      const delay = attempt * 2000;
      logger.info(`Retrying in ${delay / 1000}s…`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

module.exports = { connectMongoDB };
