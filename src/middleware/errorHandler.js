/**
 * Centralized error-handling middleware.
 *
 * Description: Catches errors thrown/passed via next(err) in any route and
 *   returns a consistent JSON error shape instead of leaking stack traces
 *   or letting Express fall back to its default HTML error page.
 * Author: NA Professional Services
 * Created: 2026-08-13
 * Dependencies: none
 * Inputs: (err, req, res, next) - standard Express error middleware signature
 * Expected output: JSON response { error: { message, status } }
 */

function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: `No route matches ${req.method} ${req.originalUrl}`,
      status: 404,
    },
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  console.error(`[error] ${req.method} ${req.originalUrl} ->`, err.message);
  res.status(status).json({
    error: {
      message: err.message || "Internal server error",
      status,
    },
  });
}

module.exports = { notFoundHandler, errorHandler };
