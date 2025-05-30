// createDirectories.js

"use strict";

// load all necessary modules
const fs = require("fs");
const path = require("path");
const extractFilePath = require("./extractFilePath.js");

/**
 * Ensures that all necessary directories exist for a list of files to be copied,
 * based on their relative path structure and a common destination.
 *
 * @param {string[]} filelist - Array of absolute source file paths.
 * @param {string} destPath - Destination base directory.
 * @param {number} [excludeLength=0] - Number of characters to strip from the start of each file path
 *                                     to determine relative destination path.
 * @returns {null}
 *
 * @example
 * // Given:
 * // filelist = ['/src/project/a/b/file.js']
 * // destPath = '/dist'
 * // excludeLength = 10 (removes '/src/project')
 * //
 * // Will create directory: '/dist/a/b'
 */
function createDirectories(filelist, destPath, excludeLength = 0) {
  console.log("create Directories...");

  // initialize array to track unique destination directories
  const destDirs = [];

  // initialize directory counter
  let dirCount = 0;

  // loop thru all files
  filelist.forEach(filename => {
    // get the directories/filename common to source and destination
    let partial = filename.slice(excludeLength);

    // create the destination file name
    let destFile = path.join(destPath, partial);

    // extract the path portion of the destination file name
    let filePath = extractFilePath(destFile);

    // if not root destination and directory not in cached list
    if (filePath !== destPath && !destDirs.includes(filePath)) {
      // remember this directory
      destDirs.push(filePath);

      // if the directory does not exist
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
        console.log(`created Directory: ${filePath}`);
      } else {
        console.log(`Directory exists: ${filePath}`);
      }

      // increment the directory counter
      dirCount++;
    }
  });

  console.log(`${dirCount} Directories created.`);

  return null;
}

module.exports = createDirectories;
