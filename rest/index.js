// index.js:

"use strict";

// load all necessary modules
const RestServer = require("./lib/restServer");
const systemRouter = require("./lib/systemRouter");
const authRouter = require("./lib/auth/authRouter");

module.exports = { RestServer, systemRouter, authRouter };
