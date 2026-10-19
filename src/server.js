require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('./config/db');
const logger = require('./utils/logger');

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('REPLACE_WITH_')) {
    throw new Error('Set JWT_SECRET to a unique random string of at least 32 characters in .env');
  }
  await connectDatabase();
  const app = require('./app');
  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, () => logger.info('Server started', { port }));

  async function shutdown(signal) {
    logger.info('Server shutting down', { signal });
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  logger.error('Server failed to start', { name: error.name, reason: error.message.includes('JWT_SECRET') ? 'invalid_jwt_configuration' : 'startup_failure' });
  process.exit(1);
});
