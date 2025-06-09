// index.js: main entry point for keeno-rest-starter

"use strict";

// Load all necessary modules
const path = require("path");
const system = require("keeno-system");
const { loadConfigFiles } = require("keeno-base");
const { RestServer } = require("keeno-rest");
const { createDB, createWinstonLog } = require("keeno-mongodb");

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
      console.log("config", config);
      console.log("tenants", tenants);
    }

    // initialize services and options parameters
    const services = { db: createDB, log: createWinstonLog };
    const options = {};

    // initialize the rest server
    const server = new RestServer();
    await server.initialize(config, tenants, services, options);
    server.active = true;
  } catch (err) {}
})();
