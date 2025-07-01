// index.js:

"use strict";

// load all necessary modules
const MVCServer = require("./lib/mvcServer");
const systemRouter = require("./lib/systemRouter");
const UserRouter = require("./lib/user/userRouter");

module.exports = { MVCServer, systemRouter, UserRouter };
