const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

function notFound(req, _res, next) {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Route ${req.method} ${req.path} not found`));
}

function errorHandler(error, req, res, _next) {
  let status = error.status || 500;
  let code = error.code || 'INTERNAL_ERROR';
  let message = error.message || 'Internal server error';
  let details = error.details;

  if (error.type === 'entity.parse.failed' && error instanceof SyntaxError) {
    status = 400; code = 'INVALID_JSON'; message = 'Malformed JSON request body'; details = undefined;
  } else if (error.code === 11000) {
    status = 409; code = 'DUPLICATE_RESOURCE';
    const fields = Object.keys(error.keyPattern || {});
    message = fields.length ? `${fields.join(', ')} already exists` : 'User already exists';
    details = undefined;
  } else if (error.name === 'ValidationError') {
    status = 400; code = 'VALIDATION_ERROR'; message = 'Database validation failed';
    details = Object.entries(error.errors).map(([field, issue]) => ({ field, message: issue.message }));
  } else if (error.name === 'CastError') {
    status = 400; code = 'INVALID_ID'; message = 'Invalid resource ID'; details = undefined;
  }

  if (status >= 500) {
    // Detailed diagnostics stay in local logs, never in HTTP responses.
    logger.error('Unexpected API error', { path: req.path, name: error.name, category: 'server_error' });
    status = 500; code = 'INTERNAL_ERROR'; message = 'Internal server error'; details = undefined;
  } else {
    logger.warn('API error', { path: req.path, status, code });
  }
  const payload = { success: false, error: { code, message } };
  if (details) payload.error.details = details;
  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };
