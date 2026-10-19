const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

module.exports = asyncHandler(async (req, _res, next) => {
  const header = req.get('authorization') || '';
  if (!header.startsWith('Bearer ') || header.split(' ').length !== 2) {
    logger.warn('Authorization failed', { reason: 'missing_or_malformed_token', path: req.path });
    throw new AppError(401, 'AUTH_REQUIRED', 'A valid Bearer token is required');
  }

  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    const expired = error.name === 'TokenExpiredError';
    logger.warn('Authorization failed', { reason: expired ? 'expired_token' : 'invalid_token', path: req.path });
    throw new AppError(401, expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN', expired ? 'Token has expired' : 'Invalid token');
  }

  if (!payload.sub || typeof payload.sub !== 'string') {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid token');
  }
  const user = await User.findById(payload.sub);
  if (!user) throw new AppError(401, 'INVALID_TOKEN', 'Token user no longer exists');

  req.user = { id: user._id.toString() };
  next();
});
