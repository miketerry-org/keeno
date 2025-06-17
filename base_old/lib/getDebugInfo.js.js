// lib/getDebugInfo.js

"use strict";

function extractRoutes(stack, basePath = "") {
  const routes = [];

  for (const layer of stack) {
    if (layer.route && layer.route.path) {
      const fullPath = basePath + layer.route.path;
      for (const method in layer.route.methods) {
        if (layer.route.methods[method]) {
          routes.push({
            method: method.toUpperCase(),
            path: fullPath,
          });
        }
      }
    } else if (layer.name === "router" && layer.handle.stack) {
      const pathMatch = layer.regexp?.toString().match(/\\\/(.+?)\\\//);
      const mountPath = pathMatch ? `/${pathMatch[1]}` : basePath;
      routes.push(...extractRoutes(layer.handle.stack, basePath + mountPath));
    }
  }

  return routes;
}

function getDebugInfo(
  app,
  { tenants = [], mode = "unknown", models = [] } = {}
) {
  // ✅ Confirm the correct version of getDebugInfo is being used
  const banner = ">>> getDebugInfo: v1.1 route extractor active <<<";

  const routes = extractRoutes(app._router?.stack || []);

  return {
    banner,
    mode,
    routes,
    tenants: tenants.map(t => ({
      id: t.id,
      mode: t.mode,
      domain: t.domain,
      db_url: t.db_url,
    })),
    models: models.map(m => (typeof m === "function" ? m.name : String(m))),
  };
}

module.exports = getDebugInfo;
