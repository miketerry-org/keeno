// index.js:

"use strict";

// load all necessary modules
const MVCServer = require("./lib/mvcServer");
const NavBarRouter = require("./lib/navbarRouter");
const SystemRouter = require("./lib/systemRouter");
const UserRouter = require("./lib/user/userRouter");

module.exports = { MVCServer, NavBarRouter, SystemRouter, UserRouter };
