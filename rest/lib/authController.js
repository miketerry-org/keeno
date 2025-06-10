"use strict";

// load all necessary modules
const authRegister = require("./authRegister");

/**
 * Register a new user (POST /api/register)
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
async function postRegister(req, res) {
  const { code, payload } = await authRegister(req.tenant, req.body);
  res.status(code).json(payload);
}

module.exports = { postRegister };
