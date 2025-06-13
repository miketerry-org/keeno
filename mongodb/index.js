// index.js: // keeno-mongodb

"use strict";

// load all necessary modules
const createDB = require("./lib/createDB");
const createLog = require("./lib/createLog");
const AuthModel = require("./lib/authModel");

module.exports = { createDB, createLog, AuthModel };
