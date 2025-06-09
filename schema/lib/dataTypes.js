// dataTypes.js: Defines schema fragments for supported data types

"use strict";

// Load all necessary validator functions
const validBoolean = require("./validBoolean");
const validCompare = require("./validCompare");
const validDate = require("./validDate");
const validEmail = require("./validEmail");
const validEnum = require("./validEnum");
const validFloat = require("./validFloat");
const validInteger = require("./validInteger");
const validMatch = require("./validMatch");
const validPassword = require("./validPassword");
const validString = require("./validString");
const validTime = require("./validTime");
const validTimestamp = require("./validTimestamp");

// Generic field definition helper
function define(type, options, validate) {
  return {
    type,
    ...options,
    validate,
  };
}

// Type factory functions
function booleanType(options = {}) {
  return define("boolean", options, validBoolean);
}

function compareType(options = {}) {
  return define("compare", options, validCompare);
}

function dateType(options = {}) {
  return define("date", options, validDate);
}

function emailType(options = {}) {
  return define("email", options, validEmail);
}

function enumType(options = {}) {
  return define("enum", options, validEnum);
}

function floatType(options = {}) {
  return define("float", options, validFloat);
}

function integerType(options = {}) {
  return define("integer", options, validInteger);
}

function matchType(options = {}) {
  return define("match", options, validMatch);
}

function passwordType(options = {}) {
  return define("password", options, validPassword);
}

function stringType(options = {}) {
  return define("string", options, validString);
}

function timeType(options = {}) {
  return define("time", options, validTime);
}

function timestampType(options = {}) {
  return define("timestamp", options, validTimestamp);
}

// Export all type builders
module.exports = {
  booleanType,
  compareType,
  dateType,
  emailType,
  enumType,
  floatType,
  integerType,
  matchType,
  passwordType,
  stringType,
  timeType,
  timestampType,
};
