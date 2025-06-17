// authRouter.js:

"use strict";

// Load required modules
const { Router } = require("express");
const registerHelper = require("./helpers/register");

// Initialize an empty authentication router
const authRouter = Router();

/**
 * Register a new user (POST /api/register)
 */
authRouter.post("/register", async (req, res) => {
  try {
    const { code, payload } = await registerHelper(req.tenant, req.body);
    res.status(code).json(payload);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Export the router
module.exports = { authRouter };
