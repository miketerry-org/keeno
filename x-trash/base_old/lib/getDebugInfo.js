"use strict";

function getDebugInfo(app, { tenants = [], mode = "unknown", models = [] }) {
  console.log("inside");
  process.exit(1);

  const routes = [];

  function walk(stack, prefix = "") {
    for (const layer of stack) {
      if (layer.route) {
        // It's a real route
        for (const method in layer.route.methods) {
          routes.push({
            method: method.toUpperCase(),
            path: prefix + layer.route.path,
          });
        }
      } else if (layer.name === "router" && layer.handle.stack) {
        // It's a nested router
        const match = layer.regexp?.source || "";
        let routePath = "";

        // Attempt to extract the mount path
        const pathMatch = match.match(/^\\\/(.+?)\\\/\?/);
        if (pathMatch) {
          routePath = "/" + pathMatch[1].replace(/\\\//g, "/");
        }

        walk(layer.handle.stack, prefix + routePath);
      }
    }
  }

  if (app && app._router && app._router.stack) {
    walk(app._router.stack);
  }

  const modelInfo = models.map(m => m.name || "unknown");

  return {
    mode,
    routes,
    tenants: tenants.map(t => ({
      id: t.id,
      mode: t.mode,
      domain: t.domain,
      db_url: t.db_url,
    })),
    models: modelInfo,
  };
}

module.exports = getDebugInfo;
