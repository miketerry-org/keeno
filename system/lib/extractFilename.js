// extractFilename.js:

"use strict";

// load all necessary modules
const fs = require("fs");
const path = require("path");

/**
 * Extracts the filename from a full file path.
 * @param {string} filename - The fully qualified file path
 * @returns {string} The filename portion (with extension)
 */
function extractFileName(filename) {
  return path.basename(filename);
}

module.exports = extractFileName;
