"use strict";

const { AuthModel } = require("keeno-mongodb");

/**
 * Register a new user (POST /api/register)
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
async function postRegister(req, res) {
  // extract the required auth properties from the request body
  const { email, password, firstname, lastname, role } = req.body;

  if (!email || !password || !firstname || !lastname) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields" });
  }

  try {
    const auth = new AuthModel(req.tenant);
    let user = await auth.create({
      email,
      passwordHash: password,
      firstname,
      lastname,
      role,
    });

    return res.status(201).json({
      success: true,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    tenant.log?.error(err);

    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, error: "Email already registered" });
    }

    return res
      .status(500)
      .json({ success: false, error: "Registration failed" });
  }
}

/**
 * Log in a user (POST /api/login)
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
async function postLogin(req, res) {
  const tenant = req.tenant;
  const Auth = AuthModel(tenant);
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Missing email or password" });
  }

  try {
    const user = await Auth.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    req.session.regenerate(err => {
      if (err) {
        req.log?.error("Session regenerate failed", err);
        return res.status(500).json({ success: false, error: "Login failed" });
      }

      req.session.user = {
        user_id: user._id.toString(),
        tenant_id: tenant.id,
        role: user.role,
      };

      res.json({
        success: true,
        user: { id: user._id, email: user.email },
      });
    });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ success: false, error: "Login failed" });
  }
}

/**
 * Log out the current user (POST /api/logout)
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
function postLogout(req, res) {
  req.session.destroy(err => {
    if (err) {
      req.log?.error("Logout error:", err);
      return res.status(500).json({ success: false, error: "Logout failed" });
    }

    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
}

/**
 * Handle password reset (POST /api/forgotpassword)
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
async function postForgotPassword(req, res) {
  const tenant = req.tenant;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  // TODO: generate token, save it, send reset email
  res.json({
    success: true,
    message: "If the account exists, a reset email will be sent.",
  });
}

/**
 * Get current logged-in user (GET /auth/me)
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
async function getMe(req, res) {
  if (!req.session?.user) {
    return res.status(401).json({ success: false, error: "Not logged in" });
  }

  const tenant = req.tenant;
  const Auth = createAuthModel(tenant);

  try {
    const user = await Auth.findById(req.session.user.user_id).select(
      "-passwordHash"
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
}

module.exports = {
  postRegister,
  postLogin,
  postLogout,
  postForgotPassword,
  getMe,
};
