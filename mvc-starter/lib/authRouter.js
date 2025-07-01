// authRouter.js:

"use strict";

// load all required modules
const express = require("express");
const authController = require("./authController");

const authRouter = express.Router();

// define all routes
authRouter.post("/api/register", authController.postRegister);
authRouter.post("/api/login", authController.postLogin);
authRouter.post("/api/logout", authController.postLogout);
authRouter.post("/api/forgotpassword", authController.postForgotPassword);
authRouter.get("/auth/me", authController.getMe);

module.exports = authRouter;
