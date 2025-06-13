// authRouter.js:

"use strict";

// load all required modules
const Router = require("express").Router;
const registerHelper = require("./helpers/register");

// initialize an empty authentication router
const authRouter = new Router();

/**
 * Register a new user (POST /api/register)
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
authRouter.post("/api/register", async (req, res) => {
  const { code, payload } = await register(req.tenant, req.body);
  res.status(code).json(payload);
});

module.exports = authRouter;
