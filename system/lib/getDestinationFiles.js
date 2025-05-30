// getDestinationFilenames.js:

"use strict";

const path = require("path");

/**
 * Processes an array of filenames by replacing a specified substring in the directory path
 * and changing the file extension.
 *
 * @param {string[]} destinationFiles - The array of filenames to process.
 * @param {string} dirToReplace - The directory path substring to find.
 * @param {string} dirReplacement - The directory path substring to replace with.
 * @param {string} extToReplace - The file extension to find (including dot, e.g., '.env').
 * @param {string} extReplacement - The file extension to replace with (including dot, e.g., '.secret').
 * @returns {string[]} - The array of processed filenames.
 */
function getDestinationFiles(
  destinationFiles,
  dirToReplace,
  dirReplacement,
  extToReplace,
  extReplacement
) {
  return destinationFiles.map(file => {
    // Replace the specified directory substring
    let updatedPath = file.replace(dirToReplace, dirReplacement);

    // Change the file extension
    if (updatedPath.endsWith(extToReplace)) {
      updatedPath = updatedPath.slice(0, -extToReplace.length) + extReplacement;
    }

    return updatedPath;
  });
}

module.exports = getDestinationFiles;
