// index.js: keeno-rest-starter main entry point

("use strict");

// Load all necessary modules
const path = require("path");
const system = require("keeno-system");
const { loadConfigFiles } = require("keeno-base");
const { RestServer } = require("keeno-rest");
const { createDB, createLog, AuthModel } = require("keeno-mongodb");
const authRouter = require("./lib/authRouter");

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

    // create services object
    const services = {
      db: createDB,
      log: createLog,
    };

    // initialize options with middlewares, models, and routers
    const options = {
      // middlewares: [],
      models: [AuthModel],
      routers: [authRouter],
    };

    // create the rest api server
    let server = await RestServer.create(config, tenants, services, options);

    // stsart the server
    server.active = true;
  } catch (err) {
    system.fatal(err.message);
  }
})();
