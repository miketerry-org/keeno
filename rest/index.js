// index.js:

"use strict";

// load all necessary modules
const RestServer = require("./lib/restServer");
const AuthRouter = require("./lib/auth/router");

module.exports = { RestServer, AuthRouter };
