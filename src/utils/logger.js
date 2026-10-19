const fs = require('fs');
const path = require('path');
const winston = require('winston');

const logDir = path.resolve(__dirname, '../../logs');
fs.mkdirSync(logDir, { recursive: true });

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'app.log') }),
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' })
  ]
});

if (process.env.NODE_ENV !== 'test') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.timestamp(), winston.format.simple())
  }));
}

module.exports = logger;
