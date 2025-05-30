// dataTypes.js: Defines schema fragments for supported data types

"use strict";

// Load all necessary validator functions
const validBoolean = require("./validBoolean");
const validCompare = require("./validCompare");
const validDate = require("./validDate");
const validEmail = require("./validEmail");
const validEnumerated = require("./validEnumerated");
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
function boolean(options = {}) {
  return define("boolean", options, validBoolean);
}

function compare(options = {}) {
  return define("compare", options, validCompare);
}

function date(options = {}) {
  return define("date", options, validDate);
}

function email(options = {}) {
  return define("email", options, validEmail);
}

function enumerated(options = {}) {
  return define("enumerated", options, validEnumerated);
}

function float(options = {}) {
  return define("float", options, validFloat);
}

function integer(options = {}) {
  return define("integer", options, validInteger);
}

function match(options = {}) {
  return define("match", options, validMatch);
}

function password(options = {}) {
  return define("password", options, validPassword);
}

function string(options = {}) {
  return define("string", options, validString);
}

function time(options = {}) {
  return define("time", options, validTime);
}

function timestamp(options = {}) {
  return define("timestamp", options, validTimestamp);
}

// Export all type builders
module.exports = {
  boolean,
  compare,
  date,
  email,
  enumerated,
  float,
  integer,
  match,
  password,
  string,
  time,
  timestamp,
};
