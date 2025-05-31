// index.js: keeno-system

"use strict";

// load all necessary modules
const coercePrimitive = require("./lib/coercePrimitive");
const copyFiles = require("./lib/copyFiles");
const findFiles = require("./lib/findFiles");
const createDirectories = require("./lib/createDirectories");
const excludeLeadPath = require("./lib/excludeLeadPath");
const extractFilename = require("./lib/extractFilename");
const extractFilePath = require("./lib/extractFilePath");
const getDestinationFiles = require("./lib/getDestinationFiles");
const runCommand = require("./lib/runCommand");
const {
  envMode,
  isDebugging,
  isDevelopment,
  isProduction,
  isTesting,
} = require("./lib/envMode");

// -------------------------------------------------------------
// Global Constants & State
// -------------------------------------------------------------

/**
 * Absolute path to the current working directory where the Node.js
 * process was started (i.e., `process.cwd()`).
 * This is useful for resolving relative paths consistently across modules.
 * @type {string}
 */
const __workdir = process.cwd();

/**
 * Global logging object, defaulting to the built-in `console`.
 * Can be replaced via `setLog()` for custom logging.
 * @type {Console}
 */
let log = console;

// -------------------------------------------------------------
// Utility Functions
// -------------------------------------------------------------

/**
 * Replaces the global logger used throughout the system package.
 * This is useful for redirecting logs to a file, buffer, or other logging service.
 * @param {Console} value - A compatible logger object.
 * @returns {Console} The new logger that was set.
 */
function setLog(value) {
  log = value;
  return log;
}

/**
 * Logs a fatal error message and exits the process with exit code 1.
 * @param {string} message - The error message to display.
 */
function fatal(message) {
  console.error(`Fatal Error: ${message}`);
  process.exit(1);
}

/**
 * Immediately halts the program with a custom exit code.
 * @param {number} code - The numeric exit code.
 */
function halt(code) {
  console.error(`ERROR ${code}: Terminating program execution.`);
  process.exit(code);
}

/**
 * Logs debug output if debug mode is active.
 * Accepts any number of arguments, just like `console.debug`.
 * @param {...any} args - Values to be logged.
 */
function debug(...args) {
  if (isDebugging) {
    console.debug("[debug]");
    console.debug(...args);
    console.debug(); // blank line
  }
}

// -------------------------------------------------------------
// Module Exports
// -------------------------------------------------------------

module.exports = {
  __workdir,
  envMode,
  isDebugging,
  isDevelopment,
  isProduction,
  isTesting,
  fatal,
  halt,
  findFiles,
  copyFiles,
  createDirectories,
  excludeLeadPath,
  extractFilename,
  extractFilePath,
  coercePrimitive,
  getDestinationFiles,
  log,
  setLog,
  runCommand,
  debug,
};
