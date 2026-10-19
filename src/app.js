const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { generalLimiter } = require('./middleware/rateLimits');
const requestLogger = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();
app.disable('x-powered-by');
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
