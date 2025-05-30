// findFiles.js:

"use strict";

// load all necessary modules
const fs = require("fs");
const path = require("path");

/**
 * Recursively searches for files matching a file mask within a directory and its subdirectories.
 *
 * @param {string} filemask - The file mask to search for (e.g., "*.txt", "report_*.log").
 *                            Wildcards like "*" are supported.
 * @param {string} [startDir=process.cwd()] - The starting directory for the search. Defaults to the current working directory.
 * @returns {string[]} An array of absolute paths to the matching files.
 */
function findFiles(filemask, startDir = process.cwd()) {
  // initialize empty list of files
  const matchingFiles = [];

  // Convert filemask to a regular expression for flexible matching
  // Escape dots (.) and convert asterisks (*) to match any character zero or more times (.*)
  const filemaskRegex = new RegExp(
    "^" + filemask.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"
  );

  /**
   * Helper function to recursively search a directory.
   * @param {string} currentDir - The current directory being searched.
   */
  function searchDirectory(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir); // Read contents of the current directory

      for (const entry of entries) {
        const entryPath = path.join(currentDir, entry); // Get the full path of the entry
        const stats = fs.statSync(entryPath); // Get information about the entry

        if (stats.isFile()) {
          // If it's a file, check if it matches the filemask
          if (filemaskRegex.test(entry)) {
            matchingFiles.push(entryPath); // Add the absolute path to the results
          }
        } else if (stats.isDirectory()) {
          // If it's a directory, recursively search it
          searchDirectory(entryPath);
        }
      }
    } catch (err) {
      // Log an error if a directory cannot be accessed (e.g., due to permissions)
      console.error(`Error accessing directory ${currentDir}: ${err.message}`);
    }
  }

  // Start the recursive search from the specified starting directory
  searchDirectory(startDir);

  return matchingFiles; // Return the array of matching file paths
}

module.exports = findFiles;
