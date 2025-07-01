// loadConfigFiles.js:

"use strict";

// load all necessary packages
const { loadEncryptKey, loadEnvFile, loadEnvFiles } = require("keeno-env");

function loadConfigFiles(serverFile, tenantFilemask, keyFile) {
  const encryptKey = loadEncryptKey(keyFile);
  const config = loadEnvFile(serverFile, encryptKey);
  const tenants = loadEnvFiles(tenantFilemask, encryptKey);
  return { config, tenants };
}

module.exports = loadConfigFiles;
