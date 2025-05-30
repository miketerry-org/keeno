// loadEnvFiles.js:

"use strict";

const path = require("path");
const glob = require("glob");
const loadEnvFile = require("./loadEnvFile");
const system = require("keeno-system");

/**
 * Load and validate environment configurations from multiple matching files.
 *
 * @param {string} filemask - Glob pattern to match env files.
 * @param {string|null} encryptKey - Optional decryption key for encrypted files.
 * @param {Object|null} schema - Optional schema validator with .validate().
 * @param {Object} [options={}] - Optional settings.
 * @param {boolean} [options.verbose=false] - Print loaded keys per file.
 * @returns {Array<Object>} Array of read-only configuration objects.
 */
function loadEnvFiles(filemask, encryptKey = "", schema = {}, options = {}) {
  const cwd = process.cwd();

  // Resolve the glob pattern to absolute file paths
  const files = glob.sync(filemask, { cwd, absolute: true });

  // if no matching files
  if (files.length === 0) {
    throw new Error(`No environment files matched pattern: ${filemask}`);
  }

  // initialize the array of tenant configuration objects
  const configs = [];

  // loop thru all files in array
  for (const file of files) {
    try {
      // load the tenant's configuration file
      const config = loadEnvFile(file, encryptKey, schema, options);

      // add the configuration object to the array
      configs.push(config);
    } catch (err) {
      system.log.error(
        `Error loading tenant configuration file "${file}": ${err.message}`
      );
      if (!options.suppressErrors) {
        throw err;
      }
    }
  }

  return configs;
}

module.exports = loadEnvFiles;
