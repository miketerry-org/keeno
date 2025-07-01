// systemRouter.js:

"use strict";

const os = require("os");
const { BaseRouter } = require("keeno-base");

/**
 * Returns system-level and tenant-level diagnostic information.
 */
function getSystemInfo() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const cpus = os.cpus();

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    totalMem,
    usedMem,
    memUsedPercent: ((usedMem / totalMem) * 100).toFixed(2),
    cpuModel: cpus[0]?.model || "unknown",
    cpuCores: cpus.length,
    ip: getLocalIP(),
    uptimeSeconds: os.uptime(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    currentTime: new Date().toISOString(),
  };
}

/**
 * Attempts to retrieve the primary non-internal IPv4 address.
 */
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "unknown";
}

/**
 * SystemRouter exposes tenant-aware diagnostic endpoints.
 *
 * Routes:
 *   GET /api/system/health     → Simple health status and uptime
 *   GET /api/system/readiness  → Readiness probe
 *   GET /api/system/info       → System-level info (CPU, memory, IP, etc.)
 *   GET /api/system/timestamp  → Current server time in multiple formats
 *   GET /api/system/routes     → Per-route metrics for current tenant
 */
class SystemRouter extends BaseRouter {
  define() {
    // GET /api/system/health
    this.get("/health", (req, res) => {
      res.status(200).json({
        ok: true,
        message: "health check",
        started: req.tenant.metrics?.startTime || null,
        uptimeSeconds: process.uptime(),
        now: new Date().toISOString(),
      });
    });

    // GET /api/system/readiness
    this.get("/readiness", (req, res) => {
      res.status(200).json({ ok: true, message: "ready" });
    });

    // GET /api/system/info
    this.get("/info", (req, res) => {
      const system = getSystemInfo();
      const tenant = req.tenant;
      const metrics = tenant.metrics ?? {};

      res.status(200).json({
        ok: true,
        ...system,
        tenant: tenant.domain,
        started: metrics.startTime || null,
        totalRequests: metrics.totalRequests || 0,
        totalErrors: metrics.totalErrors || 0,
      });
    });

    // GET /api/system/timestamp
    this.get("/timestamp", (req, res) => {
      const now = new Date();
      res.status(200).json({
        ok: true,
        iso: now.toISOString(),
        utc: now.toUTCString(),
        local: now.toString(),
        timestamp: now.getTime(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offsetMinutes: now.getTimezoneOffset(),
      });
    });

    // GET /api/system/routes
    this.get("/routes", (req, res) => {
      const metrics = req.tenant.metrics ?? {};
      const routeStats = metrics.routes ?? {};

      const routes = Object.entries(routeStats).map(([routeKey, data]) => ({
        route: routeKey,
        calls: data.count,
        avgResponseMs: data.count
          ? +(data.totalTimeMs / data.count).toFixed(2)
          : 0,
      }));

      res.status(200).json({
        ok: true,
        tenant: req.tenant.domain,
        totalRequests: metrics.totalRequests || 0,
        totalErrors: metrics.totalErrors || 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        routes,
      });
    });
  }
}

module.exports = SystemRouter;
