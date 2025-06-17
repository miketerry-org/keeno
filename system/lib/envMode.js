// envMode.js:

"use strict";

// Grab raw NODE_ENV and normalize to lowercase
const rawEnv = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : null;

// Supported environment aliases mapped to canonical values
const map = {
  dev: "development",
  development: "development",
  prod: "production",
  production: "production",
  test: "test",
  testing: "test",
  debug: "debug",
  debugging: "debug",
};

// Fatal error if NODE_ENV is not defined
if (!rawEnv) {
  console.error(
    "Fatal: NODE_ENV is not set. Please specify the environment mode explicitly."
  );
  process.exit(1);
}

// Canonical environment mode
const envMode = map[rawEnv];

if (!envMode) {
  console.error(
    `Fatal: Unrecognized NODE_ENV value "${rawEnv}". Allowed values are: ${Object.keys(
      map
    ).join(", ")}`
  );
  process.exit(1);
}

// Boolean flags for easy conditional logic
const isDevelopment = envMode === "development";
const isProduction = envMode === "production";
const isTesting = envMode === "test";
const isDebugging = envMode === "debug";

module.exports = {
  envMode,
  isDevelopment,
  isProduction,
  isTesting,
  isDebugging,
};
