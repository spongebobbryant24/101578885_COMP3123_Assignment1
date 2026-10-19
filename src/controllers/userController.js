const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (await User.exists({ $or: [{ username }, { email }] })) {
    logger.warn('Signup rejected', { reason: 'duplicate_user' });
    throw new AppError(409, 'DUPLICATE_RESOURCE', 'Username or email already exists');
  }
  const user = await User.create({ username, email, password });
  logger.info('User signup succeeded', { userId: user._id.toString() });
  res.status(201).json({ success: true, message: 'User registered successfully', data: { user: user.toJSON() } });
});

const login = asyncHandler(async (req, res) => {
  const lookup = req.body.username ? { username: req.body.username } : { email: req.body.email };
  const user = await User.findOne(lookup).select('+password');
  if (!user || !(await user.verifyPassword(req.body.password))) {
    logger.warn('Authentication attempt failed', { reason: 'bad_credentials' });
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid username/email or password');
  }
  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  });
  logger.info('Authentication succeeded', { userId: user._id.toString() });
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { token, token_type: 'Bearer', user: user.toJSON() }
  });
});

module.exports = { signup, login };
