// index.js:

"use strict";

// load all necessary modules
const loadServerConfig = require("./lib/loadServerConfig");
const loadTenantConfigs = require("./lib/loadTenantConfigs");
const RestServer = require("./lib/restServer");
const { authRouter } = require("./lib/auth/authRouter");

module.exports = {
  loadServerConfig,
  loadTenantConfigs,
  RestServer,
  authRouter,
};
