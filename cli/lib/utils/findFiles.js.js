// findFiles.js:

"use strict";

// Load necessary modules
const fs = require("fs");
const path = require("path");
const { minimatch } = require("minimatch");

/**
 * Recursively finds files matching a given pattern starting from a directory.
 * @param {string} startPath - The starting directory path
 * @param {string} fileMask - The glob pattern to match files (e.g., '*.env')
 * @returns {string[]} Array of fully qualified file paths
 */
function findFiles(startPath, fileMask) {
  // Result array to hold matching file paths
  const results = [];

  // Helper function to recursively scan directories
  function scanDir(currentPath) {
    // Read contents of current directory
    const entries = fs.readdirSync(currentPath);

    // Loop through each entry in the directory
    entries.forEach(entry => {
      // Build full path of current entry
      const fullPath = path.join(currentPath, entry);

      // Get file or directory stats
      const stat = fs.statSync(fullPath);

      // If it's a directory, recurse into it
      if (stat.isDirectory()) {
        scanDir(fullPath);
      }

      // If it's a file and matches the fileMask, add to results
      else if (stat.isFile() && minimatch(entry, fileMask)) {
        results.push(fullPath);
      }
    });
  }

  // Begin recursive scan from the startPath
  scanDir(startPath);

  // Return all matching file paths
  return results;
}

module.exports = findFiles;
