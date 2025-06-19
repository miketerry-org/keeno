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
 * @param {string} [encryptKey=""] - Optional decryption key for encrypted files.
 * @param {Object} [schema={}] - Optional schema validator object with `.validate()` method.
 * @param {Object} [options={}] - Optional settings.
 * @param {boolean} [options.verbose=false] - If true, log loaded keys per file.
 * @param {boolean} [options.suppressErrors=false] - If true, errors will not throw and loading continues.
 * @returns {Array<Object>} Array of loaded and validated config objects.
 * @throws {Error} If no files match or a config fails to load and `suppressErrors` is false.
 */
function loadEnvFiles(filemask, encryptKey = "", schema = {}, options = {}) {
  if (system.isDebugging) {
    console.log("mask", filemask);
  }

  // Resolve glob pattern relative to the absolute directory
  const files = glob.sync(filemask, { absolute: true });

  if (system.isDebugging) {
    console.debug("files", files);
  }

  // throw error if no matching environment files
  if (files.length === 0) {
    const message = `No environment files matched pattern: ${filemask}`;
    system.debug(message);
    throw new Error(message);
  }

  const configs = [];

  for (const file of files) {
    try {
      const config = loadEnvFile(file, encryptKey, schema, options);
      configs.push(config);
    } catch (err) {
      const message = `Error loading config file "${file}": ${err.message}`;
      system.debug(message);
      system.log.error(message);
      throw err;
    }
  }

  return configs;
}

module.exports = loadEnvFiles;
