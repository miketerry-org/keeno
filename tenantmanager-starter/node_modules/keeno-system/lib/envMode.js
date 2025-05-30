// envMode.js:

"use strict";

// if environment specified then convert to lowercase
let envMode;
if (process.env.envMode) {
  envMode = process.env.NODE_ENV.toLowerCase();
} else {
  // use development as default
  envMode = "dev";
}

// initialize boolean flags for development, production and testing modes
const isDevelopment = envMode === "dev" || envMode === "development";
const isProduction = envMode === "prod" || envMode === "production";
const isTesting = envMode === "test" || envMode === "testing";

module.exports = { envMode, isDevelopment, isProduction, isTesting };
