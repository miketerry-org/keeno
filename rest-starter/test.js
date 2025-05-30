// index.js: main entry point for keeno-rest-starter

"use strict";

// load all necessary modules
const {
  loadEncryptKey,
  loadEnvFile,
  mergeIntoProcessEnv,
} = require("keeno-env");

try {
  let key = loadEncryptKey("./_secret.Key");

  console.log("key", key);
  console.log();
  console.log("same", key === process.env.ENCRYPT_KEY);
  console.log();

  let data = loadEnvFile("./_server.secret", key);
  console.log("data", data);

  mergeIntoProcessEnv(data);
  console.log("process.env", process.env);
} catch (err) {
  console.error(err);
}
