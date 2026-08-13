/**
 * API key authentication middleware.
 *
 * Description: Requires an X-API-Key header matching process.env.API_KEY
 *   on every request. This is a public internet-facing mock API holding
 *   synthetic PII (name/phone/zip) and allowing ticket create/update/delete,
 *   so it should not be left fully open. If API_KEY is not set in the
 *   environment, auth is skipped with a console warning (useful for local
 *   dev only - always set API_KEY in the deployed environment).
 * Author: NA Professional Services
 * Created: 2026-08-13
 * Dependencies: none
 * Inputs: process.env.API_KEY, req.header('x-api-key')
 * Expected output: calls next() if valid/disabled, else 401 JSON error
 */

function apiKeyAuth(req, res, next) {
  const configuredKey = process.env.API_KEY;

  if (!configuredKey) {
    console.warn(
      "[apiKeyAuth] WARNING: API_KEY is not set - running with auth disabled. " +
        "Set API_KEY in your deployment environment before sharing the URL."
    );
    return next();
  }

  const providedKey = req.header("x-api-key");

  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({
      error: {
        message: "Missing or invalid X-API-Key header.",
        status: 401,
      },
    });
  }

  return next();
}

module.exports = apiKeyAuth;
