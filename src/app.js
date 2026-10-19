const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { generalLimiter } = require('./middleware/rateLimits');
const requestLogger = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const connectDatabase = require('./config/db');

const app = express();
app.disable('x-powered-by');
// Vercel loads src/app.js directly; ensure the Atlas connection is ready.
if (process.env.VERCEL) {
  app.use(async (_req, _res, next) => {
    try {
      if (mongoose.connection.readyState !== 1) await connectDatabase();
      next();
    } catch (error) {
      next(error);
    }
  });
}
app.use(helmet());
app.use(requestLogger);
app.use(generalLimiter);
app.use(express.json({ limit: '16kb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'COMP3123 Assignment 1 API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/emp', employeeRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
