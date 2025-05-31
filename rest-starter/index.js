// index.js: main entry point for keeno-rest-starter

"use strict";

// Load all necessary modules
const path = require("path");
const system = require("keeno-system");
const { loadEncryptKey, loadEnvFile } = require("keeno-env");
const { createWinstonLog } = require("keeno-mongodb");
const { createAPIServer } = require("keeno-rest");
const createTenantManager = require("keeno-tenantmanager");

(async () => {
  try {
    // Attempt to load key from environment or file
    const key = process.env.ENCRYPT_KEY ?? loadEncryptKey("./_secret.key");
    if (typeof key !== "string" || !/^[a-fA-F0-9]{64}$/.test(key)) {
      throw new Error(
        "Invalid or missing encryption key. Expected a 64-character hexadecimal string via ENCRYPT_KEY or from './_secret.key'."
      );
    }

    // Load the server configuration
    const config = loadEnvFile("_server.secret", key, {});
    system.debug("server.config", config);

    // get the full file mask for where tenant env files are stored
    const filemask = path.resolve("_tenants/*.secret");
    system.debug("tenants filemask", filemask);

    // create the tenant manager
    const tenantmanager = await createTenantManager({ filemask, key });
    system.debug("tenantManager.length", tenantmanager.getAll().length);

    // wait for winston logger to be initialized
    const logger = await createWinstonLog(config);

    // assign the system logger
    system.setLog(logger);
    system.debug(`Logger for server created and assigned to "system.log".`);

    // initialize options passed when creating API server
    const options = { logger, middlewares: [tenantmanager.restMiddleware] };

    // create the rest api server
    const server = createAPIServer(config, options);

    // start listening for requests
    server.listen(config.port, () => {
      system.debug(`Server listening on port: ${config.port}`);
    });
  } catch (err) {
    system.fatal(err.message);
  }
})();
