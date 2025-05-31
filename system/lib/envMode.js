// envMode.js:

"use strict";

/**
 * Normalized environment mode (e.g., "dev", "production", etc.)
 * Defaults to "dev" if NODE_ENV is not set.
 * @type {string}
 */
const envMode = process.env.NODE_ENV
  ? process.env.NODE_ENV.toLowerCase()
  : "dev";

/**
 * True if running in debug or debugging mode.
 * @type {boolean}
 */
const isDebugging = envMode === "debug" || envMode === "debugging";

/**
 * True if running in development mode.
 * @type {boolean}
 */
const isDevelopment = envMode === "dev" || envMode === "development";

/**
 * True if running in production mode.
 * @type {boolean}
 */
const isProduction = envMode === "prod" || envMode === "production";

/**
 * True if running in test mode.
 * @type {boolean}
 */
const isTesting = envMode === "test" || envMode === "testing";

module.exports = {
  envMode,
  isDebugging,
  isDevelopment,
  isProduction,
  isTesting,
};
