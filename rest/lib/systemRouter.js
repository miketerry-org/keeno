// systemRouter.js:

"use strict";

const { BaseRouter } = require("keeno-base");

/**
 * Returns an Express router with system-level diagnostic endpoints.
 *
 * Routes:
 *   GET /api/system/health     → Health status of the server
 *   GET /api/system/readiness  → Readiness probe (e.g. for orchestration)
 *   GET /api/system/routes     → List of registered routes
 *   GET /api/system/timestamp  → Server-side timestamp
 *
 * @returns {import("express").Router} Express router instance
 */
class SystemRouter extends BaseRouter {
  define() {
    // GET /api/system/health
    this.get("/health", (req, res) => {
      res.status(200).json({ ok: true, message: "health check" });
    });

    // GET /api/system/routes
    this.get("/routes", (req, res) => {
      res.status(200).json({ ok: true, routes: { ...req.routes } });
    });

    // GET /api/system/readiness
    this.get("/readiness", (req, res) => {
      res.status(200).json({ ok: true, message: "readiness" });
    });

    // GET /api/system/timestamp
    this.get("/timestamp", (req, res) => {
      res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
    });
  }
}

module.exports = SystemRouter;
