const { AppError } = require('../utils/errors');
const { logger } = require('../utils/logger');

const handleCastErrorDB = (err) => new AppError(`Invalid ${err.path}: ${err.value}`, 400);
const handleDuplicateFieldsDB = (err) => new AppError(`Duplicate value for field: ${Object.keys(err.keyValue).join(', ')}`, 409);
const handleValidationErrorDB = (err) => new AppError(Object.values(err.errors).map(e => e.message).join('; '), 400);
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Token has expired. Please log in again.', 401);

const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    logger.error(err);
  }

  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    logger.error('UNHANDLED ERROR:', err);
    return res.status(500).json({ status: 'error', message: 'Something went wrong' });
  }

  res.status(error.statusCode).json({
    status: error.status || 'error',
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { globalErrorHandler };
