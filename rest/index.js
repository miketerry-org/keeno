// index.js:

"use strict";

// load all necessary modules
const RestServer = require("./lib/restServer");
const AuthRouter = require("./lib/authRouter");

module.exports = { RestServer, AuthRouter };
