/**
 * @fileoverview Error handling middleware for the application.
 * Provides a 404 handler for unknown API routes and a global error handler.
 * @module middleware/errorHandler
 */

/**
 * 404 handler for unknown API routes.
 * Returns a JSON response listing available endpoints when an unknown
 * /api/* path is requested. Non-API paths fall through to static file handling.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
const notFoundHandler = (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: 'Not Found',
      message: `The endpoint ${req.method} ${req.path} does not exist`,
      availableEndpoints: [
        'GET /api/health',
        'GET /api/quiz/start',
        'GET /api/quiz/question/:sessionId',
        'POST /api/quiz/hint',
        'POST /api/quiz/answer',
        'GET /api/states',
        'GET /api/states/:id',
        'GET /api/leaderboard',
        'POST /api/scores',
      ],
    });
  }
  next();
};

/**
 * Global error handler middleware.
 * Logs the error and returns a structured JSON response.
 * Stack traces are hidden in production for security.
 * @param {Error} err - The error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const response = {
    error: err.message || 'Internal Server Error',
  };

  // Hide stack trace in production
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { notFoundHandler, errorHandler };
