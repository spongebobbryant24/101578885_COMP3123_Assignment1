const { rateLimit } = require('express-rate-limit');
const logger = require('../utils/logger');

function safeLimit(envName, fallback) {
  const number = Number(process.env[envName]);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function limiter(max, windowMs, type) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', { path: req.path, type });
      res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again later.' } });
    }
  });
}

const generalLimiter = limiter(safeLimit('API_RATE_LIMIT_MAX', 200), 15 * 60 * 1000, 'general');
const authLimiter = limiter(safeLimit('AUTH_RATE_LIMIT_MAX', 30), 15 * 60 * 1000, 'authentication');
module.exports = { generalLimiter, authLimiter };
