// index.js: // keeno-system

"use strict";

// Load all necessary modules
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
 * Absolute path to the current working directory.
 * Useful for resolving relative paths across modules.
 * @type {string}
 */
const __workdir = process.cwd();

/**
 * Global user role configuration (shared system-wide).
 * Can be overridden during app bootstrap.
 * @type {string[]}
 */
let _userRoles = ["guest", "member", "staff", "admin"];

/**
 * Global logger instance, defaults to console.
 * Can be replaced by setting `log` property.
 * @type {Console}
 */
let _logger = console;

// -------------------------------------------------------------
// User Role Accessors
// -------------------------------------------------------------

/**
 * Returns the current list of user roles.
 * @returns {string[]}
 */
function getUserRoles() {
  return _userRoles;
}

/**
 * Sets a new array of user roles.
 * @param {string[]} roles - An array of non-empty strings.
 * @throws {Error} if input is invalid.
 */
function setUserRoles(roles) {
  if (!Array.isArray(roles) || roles.length === 0) {
    throw new Error("userRoles must be a non-empty array of strings.");
  }
  if (!roles.every(r => typeof r === "string" && r.trim().length > 0)) {
    throw new Error("Each user role must be a non-empty string.");
  }

  // Normalize and freeze for safety
  _userRoles = Object.freeze(roles.map(r => r.trim().toLowerCase()));
}

// -------------------------------------------------------------
// Logger Accessors
// -------------------------------------------------------------

/**
 * Validates that an object looks like a logger.
 * @param {any} value
 * @returns {boolean}
 */
function isValidLogger(value) {
  const methods = ["log", "info", "warn", "error", "debug"];
  return value && methods.every(m => typeof value[m] === "function");
}

// -------------------------------------------------------------
// Utility Functions
// -------------------------------------------------------------

/**
 * Immediately halts the app with a fatal message.
 * @param {string} message
 */
function fatal(message) {
  console.debug("debug", message);
  console.error(`Fatal Error: ${message}`);
  process.exit(1);
}

/**
 * Halts the app with a given exit code.
 * @param {number} code
 */
function halt(code) {
  console.error(`ERROR ${code}: Terminating program execution.`);
  process.exit(code);
}

/**
 * Prints debug output if debugging is enabled.
 * @param {...any} args
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
  debug,

  findFiles,
  copyFiles,
  createDirectories,
  excludeLeadPath,
  extractFilename,
  extractFilePath,
  coercePrimitive,
  getDestinationFiles,
  runCommand,

  get userRoles() {
    return getUserRoles();
  },

  set userRoles(value) {
    setUserRoles(value);
  },

  get log() {
    return _logger;
  },

  set log(value) {
    if (!isValidLogger(value)) {
      throw new Error(
        "Logger must implement: log(), info(), warn(), error(), and debug()"
      );
    }
    _logger = value;
  },
};
