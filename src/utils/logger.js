const fs = require('fs');
const path = require('path');
const winston = require('winston');

const transports = [];

// Vercel's deployment filesystem is read-only; use console logs there.
if (!process.env.VERCEL) {
  const logDir = path.resolve(__dirname, '../../logs');
  fs.mkdirSync(logDir, { recursive: true });
  transports.push(new winston.transports.File({ filename: path.join(logDir, 'app.log') }));
  transports.push(new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }));
}

if (process.env.NODE_ENV !== 'test') {
  transports.push(new winston.transports.Console({
    format: winston.format.combine(winston.format.timestamp(), winston.format.simple())
  }));
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports
});

module.exports = logger;
