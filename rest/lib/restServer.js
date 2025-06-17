// restserver.js:

"use strict";

// load all necessary modules
const { BaseServer } = require("keeno-base");
const system = require("keeno-system");

/**
 * REST server implementation extending BaseServer.
 * Handles tenant-aware REST APIs with health checks, versioned routes,
 * and structured error handling.
 */
class RestServer extends BaseServer {
  /**
   * Initializes the tenant manager and applies REST middleware
   * to attach tenant info to `req.tenant` for each request.
   * Ensures tenant-specific services like DB and logging are available.
   */
  async initTenantManager() {
    await super.initTenantManager();

    // Bind tenant manager middleware to maintain correct context
    this.app.use(this.tenantManager.restMiddleware.bind(this.tenantManager));
  }

  /**
   * Sets up health and readiness check endpoints.
   * - `/health`: Always returns HTTP 200 with timestamp.
   * - `/readiness`: Returns HTTP 200 if all tenants have DB connections, else 503.
   */
  async initHealthCheck() {
    this.app.get("/health", (req, res) => {
      const data = { status: "OK", timestamp: new Date().toISOString() };
      res.status(200).json(data);
    });

    this.app.get("/readiness", (req, res) => {
      const allTenants = this.tenantManager.getAll();
      const ready = allTenants.every(tenant => !!tenant.db);

      const data = {
        status: ready ? "READY" : "NOT_READY",
        tenantCount: allTenants.length,
        timestamp: new Date().toISOString(),
      };

      res.status(ready ? 200 : 503).json(data);
    });
  }

  /**
   * Mounts custom routes provided via `options.routes`.
   * Each route must define a `path` and a compatible `router` instance.
   * Example: `{ path: "/auth", router: authRouter }`
   */
  async initCustomRoutes() {
    console.debug("initCustomRoutes", this.options.routes);
    if (Array.isArray(this.options.routes)) {
      this.options.routes.forEach(({ path, router }) => {
        console.info(`Mounting custom route at: ${path}`);
        this.app.use(path, router);
      });
    }
  }

  /**
   * Mounts versioned API routes provided via `options.versions`.
   * Each entry must define a `version` (e.g. "v1") and an Express `router`.
   * Example: `{ version: "v1", router: v1Router }` will be mounted at `/api/v1`.
   */
  async initVersionedRoutes() {
    if (Array.isArray(this.options.versions)) {
      this.options.versions.forEach(({ version, router }) => {
        const versionPath = `/api/${version}`;
        console.info(`Mounting versioned route at: ${versionPath}`);
        this.app.use(versionPath, router);
      });
    }
  }

  /**
   * Registers a catch-all handler for unmatched routes.
   * Returns a standardized 404 JSON response.
   */
  async init404Error() {
    this.app.use((req, res) => {
      res.status(404).json({ success: false, error: "Not Found" });
    });
  }

  /**
   * Registers a centralized Express error handler.
   * Logs error to tenant-specific logger if available.
   * In development, returns the error message. In production, returns a generic message.
   */
  async initErrorHandler() {
    this.app.use((err, req, res, next) => {
      req.log?.error?.(err.stack || err.message);

      const message = system.isDevelopment ? err.message : "Server Error";

      res.status(err.status || 500).json({ success: false, error: message });
    });
  }
}

module.exports = RestServer;
