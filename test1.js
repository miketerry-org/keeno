function logRoutes(appOrRouter) {
  const stack =
    appOrRouter.stack || (appOrRouter._router && appOrRouter._router.stack);

  if (!stack) {
    console.warn(
      "No routes found. Make sure routes are defined before calling logRoutes()."
    );
    return;
  }

  function inspect(stack, prefix = "") {
    for (const layer of stack) {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .map(m => m.toUpperCase())
          .join(", ");
        console.log(`${methods} ${prefix}${layer.route.path}`);
      } else if (layer.name === "router" && layer.handle.stack) {
        const nestedPath = layer.path || "";
        inspect(layer.handle.stack, prefix + nestedPath);
      }
    }
  }

  inspect(stack);
}

const express = require("express");
const app = express();
const router = express.Router();

app.get("/users", (req, res) => res.send("Users"));
router.get("/posts", (req, res) => res.send("Posts"));
app.use("/api", router);

app.listen(3000, () => {
  console.log("Server started");
  logRoutes(app); // ✅ logs all routes
});
