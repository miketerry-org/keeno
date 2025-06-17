// index.js: keeno-rest-starter main entry point

("use strict");

// Load all necessary modules
const path = require("path");
const system = require("keeno-system");
const { loadConfigFiles } = require("keeno-base");
const { createDB, createLog, AuthModel } = require("keeno-mongodb");
const { createNodeEmailer } = require("keeno-nodemailer");

(async () => {
  try {
    // load server and tenant configuration files
    let { config, tenants } = loadConfigFiles(
      path.resolve("_server.secret"),
      path.resolve("_tenants/*.secret"),
      path.resolve("_secret.key")
    );

    // log config and tenants to console if in development mode
    if (system.isDevelopment) {
      console.info("config", config);
      console.info("tenants", tenants);
    }
  } catch (err) {
    system.fatal(err.message);
  }
})();
