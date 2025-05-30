// copyFiles.js

"use strict";

// load all necessary modules
const fs = require("fs");
const path = require("path");

/**
 * Copies a list of files to a destination directory, preserving their relative paths.
 *
 * @param {string[]} filelist - Array of absolute file paths to copy.
 * @param {string} destPath - Destination base directory where files should be copied.
 * @param {number} excludeLength - Number of characters to strip from the beginning of each file path to compute relative path.
 * @returns {null}
 *
 * @example
 * // If filelist includes "/src/app/file.js" and excludeLength is 5,
 * // the file will be copied to "<destPath>/app/file.js"
 */
function copyFiles(filelist, destPath, excludeLength) {
  // loop thru copying all files
  filelist.forEach(filename => {
    let partial = filename.slice(excludeLength);
    let destFile = path.join(destPath, partial);
    console.log(`Copying ${partial}`);
    fs.copyFileSync(filename, destFile);
  });

  return null;
}

module.exports = copyFiles;
