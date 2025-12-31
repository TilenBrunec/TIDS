
const errorHandler = (err, req, res, next) => {
  console.error('🔴 Error:', err);

  // Default status code
  const statusCode = err.statusCode || 500;

  // Pošlji error response
  res.status(statusCode).json({
    error: {
      message: err.message || 'Interna napaka strežnika',
      status: statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

/**
 *  za handling 404 - route not found
 */
const notFound = (req, res, next) => {
  const error = new Error(`Pot ni najdena - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Request logger 
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📝 [${timestamp}] ${req.method} ${req.url}`);
  next();
};

module.exports = {
  errorHandler,
  notFound,
  requestLogger,
};






