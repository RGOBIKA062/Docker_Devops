/**
 * ERROR HANDLING UTILITY
 * Enterprise-Grade Error Management & Recovery
 * @author Senior Software Developer (25+ Years)
 * @version 2.0.0
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
  }
}

export const ErrorCodes = {
  // Validation Errors
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 400 },
  INVALID_EMAIL: { code: 'INVALID_EMAIL', status: 400 },
  INVALID_PHONE: { code: 'INVALID_PHONE', status: 400 },
  MISSING_REQUIRED_FIELD: { code: 'MISSING_REQUIRED_FIELD', status: 400 },

  // Authentication Errors
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401 },
  TOKEN_EXPIRED: { code: 'TOKEN_EXPIRED', status: 401 },
  INVALID_TOKEN: { code: 'INVALID_TOKEN', status: 401 },
  NOT_AUTHENTICATED: { code: 'NOT_AUTHENTICATED', status: 401 },

  // Authorization Errors
  FORBIDDEN: { code: 'FORBIDDEN', status: 403 },
  INSUFFICIENT_PERMISSIONS: { code: 'INSUFFICIENT_PERMISSIONS', status: 403 },

  // Resource Errors
  NOT_FOUND: { code: 'NOT_FOUND', status: 404 },
  RESOURCE_NOT_FOUND: { code: 'RESOURCE_NOT_FOUND', status: 404 },

  // Conflict Errors
  CONFLICT: { code: 'CONFLICT', status: 409 },
  DUPLICATE_ENTRY: { code: 'DUPLICATE_ENTRY', status: 409 },
  ALREADY_EXISTS: { code: 'ALREADY_EXISTS', status: 409 },

  // Server Errors
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500 },
  DATABASE_ERROR: { code: 'DATABASE_ERROR', status: 500 },
  SERVICE_UNAVAILABLE: { code: 'SERVICE_UNAVAILABLE', status: 503 },
  EXTERNAL_SERVICE_ERROR: { code: 'EXTERNAL_SERVICE_ERROR', status: 503 },
};

/**
 * Centralized error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';

  // Handle AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
  }

  // Handle MongoDB validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Handle MongoDB duplicate key errors
  else if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid token';
  }

  // Handle JWT expiration
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Token has expired';
  }

  // Handle Mongoose CastError
  else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid ID format';
  }

  res.status(statusCode).json({
    success: false,
    errorCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack }),
  });
};

/**
 * Async error wrapper for route handlers
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error helper
 */
export const validationError = (errors) => {
  const errorList = errors.map((e) => ({
    field: e.param,
    message: e.msg,
  }));
  throw new AppError(`Validation failed: ${errorList.map((e) => e.message).join(', ')}`, 400, 'VALIDATION_ERROR');
};

/**
 * Not found error helper
 */
export const notFoundError = (resource) => {
  throw new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

/**
 * Conflict error helper
 */
export const conflictError = (message) => {
  throw new AppError(message, 409, 'CONFLICT');
};

/**
 * Unauthorized error helper
 */
export const unauthorizedError = (message = 'Unauthorized') => {
  throw new AppError(message, 401, 'UNAUTHORIZED');
};

/**
 * Forbidden error helper
 */
export const forbiddenError = (message = 'Forbidden') => {
  throw new AppError(message, 403, 'FORBIDDEN');
};
