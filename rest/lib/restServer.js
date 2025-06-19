// RestServer.js:

"use strict";

// Load all necessary modules
const { BaseServer } = require("keeno-base");
const system = require("keeno-system");

/**
 * REST server implementation extending BaseServer.
 * Handles tenant-aware REST APIs with health checks, versioned routes,
 * and structured error handling.
 */
class RestServer extends BaseServer {
  /**
   * Registers a catch-all handler for unmatched routes.
   * Returns a standardized 404 JSON response.
   */
  init404Error() {
    this.express.use((req, res) => {
      res.status(404).json({ success: false, error: "Not Found" });
    });
  }

  /**
   * Registers a centralized Express error handler.
   * Logs error to tenant-specific logger if available.
   * In development, returns the error message. In production, returns a generic message.
   */
  initErrorHandler() {
    this.express.use((err, req, res, next) => {
      req.log?.error?.(err.stack || err.message);

      const message = system.isDevelopment ? err.message : "Server Error";

      res.status(err.status || 500).json({
        success: false,
        error: message,
        ...(system.isDevelopment ? { stack: err.stack } : {}),
      });
    });
  }
}

module.exports = RestServer;
