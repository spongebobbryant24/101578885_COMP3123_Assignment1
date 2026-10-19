const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required');
  // Enforce the exact database name specified in the assignment.
  await mongoose.connect(uri, { dbName: 'comp3123_assignment1', serverSelectionTimeoutMS: 10000 });
  logger.info('MongoDB connected', { database: mongoose.connection.name });
}

module.exports = connectDatabase;
