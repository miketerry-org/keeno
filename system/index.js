// index.js:

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
  isDevelopment,
  isProduction,
  isTesting,
} = require("./lib/envMode");

// convenient global variable for application start directory
const __workdir = process.cwd();

// global logging object
let log = console;

// replace the global logger
function setLog(value) {
  log = value;
  return log;
}

// display error message and exit process with an error code
function fatal(message) {
  console.error(`Fatal Error: ${message}`);
  process.exit(1);
}

// display error message and exit process with specific error code
function halt(code) {
  console.error(`ERROR ${code}: Terminating program execution .`);
  process.exit(code);
}

// export all constants and functions
module.exports = {
  __workdir,
  envMode,
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
};
