// extractFilePath.js:

"use strict";

// load all necessary modules
const fs = require("fs");
const path = require("path");

/**
 * Extracts the directory path from a full file path.
 * @param {string} filename - The fully qualified file path
 * @returns {string} The directory portion of the path
 */
function extractFilePath(filename) {
  return path.dirname(filename);
}

module.exports = extractFilePath;
