// authRouter.js:

"use strict";

// Load required modules
const { BaseRouter } = require("keeno-base");
const registerHelper = require("./helpers/register");

class authRouter extends BaseRouter {
  define() {
    this.post("/register", (req, res) => {
      res.status(201).json({ ok: true, data: {} });
    });
  }
}

module.exports = authRouter;
