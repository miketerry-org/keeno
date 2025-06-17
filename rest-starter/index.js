// index.js: keeno-rest-starter main entry point

("use strict");

// Load all necessary modules
const path = require("path");
const system = require("keeno-system");
const { loadEncryptKey } = require("keeno-env");
const {
  asyncHandler,
  BaseEmailer,
  BaseModel,
  BaseServer,
  loadServerConfig,
  loadTenantConfigs,
} = require("keeno-base");
const { createDB, createLog, AuthModel } = require("keeno-mongodb");
// const { createEmailer } = require("keeno-nodemailer");

(async () => {
  try {
    // if not in production then load encryption key from file
    if (!system.isProduction) {
      process.env.ENCRYPT_KEY = loadEncryptKey("./_secret.key");
    }

    // load server and tenant configuration files
    const serverConfig = loadServerConfig();
    const tenantConfigs = loadTenantConfigs();

    // if not in production; log encrypt key, server and tenant configurations
    if (!system.isProduction) {
      console.debug("ENCRYPT_KEY", process.env.ENCRYPT_KEY);
      console.debug("serverConfig", serverConfig);
      console.debug("tenantConfigs", tenantConfigs);
    }

    let server = await new BaseServer(serverConfig, tenantConfigs)
      .service("db", createDB, closeDB, "both")
      .service("log", createLog, closeLog, "both")
      .service("emailer", CreateEmailer, closeEmailer, "both")
      .middleware((req, res, next) => {})
      .model("auth", AuthModel)
      .model("profile", ProfileModel)
      .model("appt", ApptModel)
      .model("note", noteModel)
      .router("/api", authRouter)
      .listen(() => {
        console.log(`Server is listening on port ${serverConfig.port}`);
      });
  } catch (err) {
    system.fatal(err.message);
  }
})();
