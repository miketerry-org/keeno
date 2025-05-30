// excludeLeadPath.js:

"use strict";

// load all necessary modules
const fs = require("fs");
const path = require("path");

/**
 * Removes the leadPath portion from the beginning of the filename.
 * @param {string} leadPath - The base path to strip
 * @param {string} filename - The full file path
 * @returns {string} The path relative to leadPath
 */
function excludeLeadPath(leadPath, filename) {
  // Resolve both paths to absolute form
  const absoluteLead = path.resolve(leadPath);
  const absoluteFile = path.resolve(filename);

  // Use path.relative to get the relative portion
  const relativePath = path.relative(absoluteLead, absoluteFile);

  // Return the relative path
  return relativePath;
}

module.exports = excludeLeadPath;
