const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const details = result.array().map(({ path, msg, location }) => ({ field: path, message: msg, location }));
    logger.warn('Validation failure', { path: req.path, fields: details.map((item) => item.field) });
    return next(new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', details));
  }
  next();
};

const allowOnly = (allowed, location = 'body') => (req, _res, next) => {
  const data = req[location];
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return next(new AppError(400, 'VALIDATION_ERROR', `${location} must be an object`));
  }
  const unexpected = Object.keys(data).filter((field) => !allowed.includes(field));
  if (unexpected.length > 0) {
    logger.warn('Validation failure', { path: req.path, fields: unexpected });
    return next(new AppError(400, 'VALIDATION_ERROR', 'Unexpected fields', unexpected.map((field) => ({ field, message: 'Not allowed', location }))));
  }
  next();
};

module.exports = { validate, allowOnly };
