// index.js: main entry point for keeno-rest-starter

"use strict";

// Load all necessary modules
const system = require("keeno-system");
const createTenantManager = require("keeno-tenantmanager");
const { loadEncryptKey, loadEnvFile } = require("keeno-env");
const { createWinstonLog } = require("keeno-mongodb");
const { createAPIServer } = require("keeno-rest");

(async () => {
  try {
    // Attempt to load key from environment or file
    const key = process.env.ENCRYPT_KEY ?? loadEncryptKey("./_secret.key");
    if (typeof key !== "string" || !/^[a-fA-F0-9]{64}$/.test(key)) {
      throw new Error(
        "Invalid or missing encryption key. Expected a 64-character hexadecimal string via ENCRYPT_KEY or from './_secret.key'."
      );
    }

    system.debug("key", key);

    // Load the server configuration
    const config = loadEnvFile("_server.secret", key, {}, { verbose: false });
    system.debug("server.config", config);

    const tenantmanager = await createTenantManager({
      filemask: "_tenants/*.secret",
      key,
    });
    system.debug("tenantManager", tenantmanager.getAll());

    /*
    // wait for winston logger to be initialized
    const logger = await createWinstonLog(config);

    // assign the system logger
    system.setLog(logger);

    // create the rest api server
    const server = createAPIServer(config, { logger });

    // start listening for requests
    server.listen(config.port, () => {
      console.info(`Server listening on port: ${config.port}`);
    });
    */
  } catch (err) {
    system.fatal(err.message);
  }
})();
