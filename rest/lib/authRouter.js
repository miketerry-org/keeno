// authRouter.js:

"use strict";

// load all required modules
const Router = require("express").Router;
const { postRegister } = require("./authController");

const router = new Router();
router.use("/api/register", postRegister);

module.exports = router;
