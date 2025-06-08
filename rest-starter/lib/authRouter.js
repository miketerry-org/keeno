// authRouter.js:

"use strict";

// load all required modules
const express = require("express");
const authController = require("./authController");

const router = express.Router();

router.post("/api/register", authController.postRegister);
router.post("/api/login", authController.postLogin);
router.post("/api/logout", authController.postLogout);
router.post("/api/forgotpassword", authController.postForgotPassword);
router.get("/auth/me", authController.getMe);

module.exports = router;
