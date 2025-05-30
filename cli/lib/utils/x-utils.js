// fileUtils.js:

"use strict";

// load all necessary modules
const fs = require("fs");
const path = require("path");
const { minimatch } = require("minimatch");

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

      //  increment the directory counter
      dirCount++;
    }
  });

  console.log(`${dirCount} Directories created.`);

  return null;
}

function copyFiles(filelist, destPath, excludeLength) {
  console.log();
  console.log("copying Files...");

  // loop thru copying all files
  filelist.forEach(filename => {
    let partial = filename.slice(excludeLength);
    let destFile = path.join(destPath, partial);
    console.log(`Copying ${partial}`);
    fs.copyFileSync(filename, destFile);
  });

  console.log(`${filelist.length} Files copied.`);

  return null;
}

// Export the functions for use in other files
module.exports = {
  findFiles,
  extractFilePath,
  extractFileName,
  excludeLeadPath,
  createDirectories,
  copyFiles,
};
