// index.js: main entry point for keeno-rest-starter

"use strict";

// load all necessary modules
const {
  loadEncryptKey,
  loadEnvFile,
  loadEnvFiles,
  mergeIntoProcessEnv,
} = require("keeno-env");

try {
  let key = loadEncryptKey("./_secret.Key");

  console.log("key", key);
  console.log();
  console.log("same", key === process.env.ENCRYPT_KEY);
  console.log();

  let data = loadEnvFiles("./_tenants/*.secret", key);
  console.log("data", data);
} catch (err) {
  console.error(err);
}
