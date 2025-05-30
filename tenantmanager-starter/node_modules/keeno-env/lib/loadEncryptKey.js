// loadEncryptKey.js:  load encryption key from file into process.env

"use strict";

// load all necessary modules
const path = require("path");
const fs = require("fs");
const system = require("keeno-schema");

/**
 * Load the encryption key into process.env.ENCRYPT_KEY (if not in production).
 *
 * @param {string} [filename="_secret.key"] - Path or name of file containing the key.
 * @returns {string} The encryption key.
 */
function loadEncryptKey(filename = "_secret.key") {
  if (!system.isProduction) {
    // If filename is not an absolute path, resolve it from process.cwd()
    const resolvedPath = path.isAbsolute(filename)
      ? filename
      : path.resolve(process.cwd(), filename);

    // Load key from file if it exists
    if (fs.existsSync(resolvedPath)) {
      const key = fs.readFileSync(resolvedPath, "utf-8").trim();
      process.env.ENCRYPT_KEY = key;
    }
  }

  // Validate the encryption key
  const key = process.env.ENCRYPT_KEY;
  if (!key || key.length !== 64) {
    throw new Error(
      "Encryption key used for configuration files is undefined or invalid"
    );
  }

  return key;
}

module.exports = loadEncryptKey;
