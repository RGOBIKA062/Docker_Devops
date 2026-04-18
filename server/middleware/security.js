/**
 * ==========================================
 * SECURITY MIDDLEWARE
 * ==========================================
 * Rate limiting, CORS, Helmet, input validation
 */

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import config from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Rate limiting middleware
 */
const createRateLimiter = (windowMs = config.RATE_LIMIT_WINDOW_MS, maxRequests = config.RATE_LIMIT_MAX_REQUESTS) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
      });
      res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
    },
  });
};

/**
 * Code execution rate limiter (stricter)
 */
const codeExecutionLimiter = createRateLimiter(
  config.RATE_LIMIT_WINDOW_MS,
  Math.floor(config.RATE_LIMIT_MAX_REQUESTS / 5) // 5x stricter for code execution
);

/**
 * Helmet security headers
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

/**
 * CORS middleware
 */
const corsMiddleware = (req, res, next) => {
  const allowedOrigins = config.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,DELETE,OPTIONS,PATCH'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type,Authorization,X-Requested-With'
    );

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
  }

  next();
};

/**
 * JSON limit middleware
 */
const jsonLimitMiddleware = (req, res, next) => {
  if (req.is('application/json')) {
    const contentLength = parseInt(req.headers['content-length']);
    if (contentLength > config.MAX_CODE_LENGTH) {
      return res.status(413).json({
        success: false,
        message: 'Request body too large',
      });
    }
  }
  next();
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    success: false,
    message: config.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
};

export {
  createRateLimiter,
  codeExecutionLimiter,
  securityHeaders,
  corsMiddleware,
  jsonLimitMiddleware,
  requestLogger,
  errorHandler,
};
