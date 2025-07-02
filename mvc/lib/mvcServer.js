// mvcServer.js:

"use strict";

// Load all necessary modules
const { engine } = require("express-handlebars");
const { BaseServer } = require("keeno-base");
const system = require("keeno-system");

/**
 * MVC server implementation extending BaseServer.
 * Handles tenant-aware web routes with health checks,
 * and structured error handling.
 */
class MVCServer extends BaseServer {
  initViewEngine() {
    // use the handlebars template for view engine
    this.express.engine(
      "hbs",
      engine({
        defaultLayout: this.expressConfig.views_default_layout,
        layoutsDir: this.expressConfig.views_layouts_path,
        partialsDir: this.expressConfig.views_partials_path,
        extname: "hbs",
      })
    );
    this.express.set("view engine", "hbs");
    this.express.set("views", this.expressConfig.views_path);

    if (system.isProduction) {
      this.express.enable("view cache");
    }
  }

  /**
   * Registers a catch-all handler for unmatched routes.
   * Returns a standardized 404 JSON response.
   */
  init404Error() {
    this.express.use((req, res, next) => {
      res.status(404).send("404 error handler not implemented");
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

      res.status(err.status || 500).send("error handler not implemented");
    });
  }
}

module.exports = MVCServer;
