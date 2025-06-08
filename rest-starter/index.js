// index.js: main entry point for keeno-rest-starter

"use strict";

// Load all necessary modules
const path = require("path");
const system = require("keeno-system");
const { loadConfigFiles } = require("keeno-base");

(async () => {
  try {
    // load server and tenant configuration files
    let { server, tenants } = loadConfigFiles(
      path.resolve("_server.secret"),
      path.resolve("_tenants/*.secret"),
      path.resolve("_secret.key")
    );

    console.log("server", server);
    console.log("tenants", tenants);
  } catch (err) {
    system.fatal(err.message);
  }
})();
