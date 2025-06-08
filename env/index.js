// index.js: keeno-env entry point

("use strict");

// load all necessary modules
const { Tenants } = require("multitenant-express");
// load all necessary modules
const loadEncryptKey = require("./lib/loadEncryptKey");
const loadEnvFile = require("./lib/loadEnvFile");
const loadEnvFiles = require("./lib/loadEnvFiles");

module.exports = {
  loadEncryptKey,
  loadEnvFile,
  loadEnvFiles,
};
