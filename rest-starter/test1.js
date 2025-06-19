const express = require("express");

function logRoutes(appOrRouter, prefix = "") {
  // If the app/router has getRoutes() use it (Express 5+)
  if (typeof appOrRouter.getRoutes === "function") {
    const routes = appOrRouter.getRoutes();
    for (const route of routes) {
      const methods = route.methods.map(m => m.toUpperCase()).join(", ");
      console.log(`${methods} ${prefix}${route.path}`);
    }
  } else if (appOrRouter.stack) {
    // For Express.Router() and some Express 4 cases
    for (const layer of appOrRouter.stack) {
      if (layer.route) {
        // Simple route layer
        const methods = Object.keys(layer.route.methods)
          .map(m => m.toUpperCase())
          .join(", ");
        console.log(`${methods} ${prefix}${layer.route.path}`);
      } else if (layer.name === "router" && layer.handle) {
        // Nested router, recurse with updated prefix
        const nestedPath = layer.path || "";
        logRoutes(layer.handle, prefix + nestedPath);
      }
    }
  } else {
    console.warn("No routes found.");
  }
}

// --- Example usage ---

const app = express();
const router = express.Router();

app.get("/users", (req, res) => res.send("Users route"));
router.get("/posts", (req, res) => res.send("Posts route"));
app.use("/api", router);

app.listen(3000, () => {
  console.log("Server started on port 3000");
  logRoutes(app._router); // pass app._router, not app itself
  console.log("here");
});
