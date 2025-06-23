// index.js: keeno-rest-starter main entry point

("use strict");

// Load all necessary modules
const path = require("path");
const system = require("keeno-system");
const { loadEncryptKey } = require("keeno-env");
const { loadServerConfig, loadTenantConfigs } = require("keeno-base");
const { RestServer, systemRouter, authRouter } = require("keeno-rest");
const {
  createDB,
  closeDB,
  createLog,
  closeLog,
  AuthModel,
} = require("keeno-mongodb");
// const { createEmailer, closeEmailer } = require("keeno-nodemailer");

(async () => {
  try {
    // if not in production then load encryption key from file
    if (!system.isProduction) {
      process.env.ENCRYPT_KEY = loadEncryptKey("./_secret.key");
    }

    // load server and tenant configuration files
    const serverConfig = loadServerConfig();
    const tenantConfigs = loadTenantConfigs();

    // if in debug; log encrypt key, server and tenant configurations

    if (system.isDebugging) {
      console.debug("ENCRYPT_KEY", process.env.ENCRYPT_KEY);
      console.debug("serverConfig", serverConfig);
      console.debug("tenantConfigs", tenantConfigs);
    }

    // instanciate the rest server
    let server = new RestServer(serverConfig, tenantConfigs);

    // define all services for server and tenants
    await server.service("db", createDB, closeDB, "both");
    await server.service("log", createLog, closeLog, "both");
    // console.log("createEmailer", createEmailer);
    // await server.service("emailer", createEmailer, closeEmailer, "tenants");

    // assign all models to each tenant
    await server.model("auth", AuthModel);
    // await server.model("profile", ProfileModel);
    // await server.model("appt", ApptModel);
    // await server.model("note", noteModel);

    // assign all routers
    server.router("/api/system", new systemRouter());
    server.router("/api/auth", new authRouter());
    console.log("routes", server.routes);

    // start listening for requests
    server.listen(() => {
      console.log(`Server is listening on port ${serverConfig.port}`);
    });
  } catch (err) {
    // halt program if any error
    system.fatal(err.message);
  }
})();
