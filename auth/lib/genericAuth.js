// genericAuth.js:

"use strict";

const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");

class GenericAuth {
  constructor() {}

  // --- Abstract methods for DB actions ---
  async createUser(userData) {
    throw new Error("createUser method not implemented");
  }

  async findUserByEmail(email) {
    throw new Error("findUserByEmail method not implemented");
  }

  async findUserById(id) {
    throw new Error("findUserById method not implemented");
  }

  async findUserByResetToken(tokenHash) {
    throw new Error("findUserByResetToken method not implemented");
  }

  async findUserByConfirmEmailToken(tokenHash) {
    throw new Error("findUserByConfirmEmailToken method not implemented");
  }

  async updateUser(id, updateData) {
    throw new Error("updateUser method not implemented");
  }

  async saveUser(user, options = {}) {
    throw new Error("saveUser method not implemented");
  }

  // --- Abstract user-specific logic wrappers ---
  getSignedJwtToken(user) {
    throw new Error("getSignedJwtToken not implemented");
  }

  generateEmailConfirmToken(user) {
    throw new Error("generateEmailConfirmToken not implemented");
  }

  getResetPasswordToken(user) {
    throw new Error("getResetPasswordToken not implemented");
  }

  async matchPassword(user, password) {
    throw new Error("matchPassword not implemented");
  }

  // --- Public methods (auth routes) ---
  async register(req, res, next) {
    const { name, email, password, role } = req.body;

    const user = await this.createUser({ name, email, password, role });

    const confirmEmailToken = this.generateEmailConfirmToken(user);

    const confirmEmailURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/confirmemail?token=${confirmEmailToken}`;

    const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to:\n\n${confirmEmailURL}`;

    await this.saveUser(user, { validateBeforeSave: false });

    await sendEmail({
      email: user.email,
      subject: "Email confirmation token",
      message,
    });

    await this.sendTokenResponse(user, 200, res);
  }

  async login(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and password", 400)
      );
    }

    const user = await this.findUserByEmail(email);
    if (!user || !(await this.matchPassword(user, password))) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    await this.sendTokenResponse(user, 200, res);
  }

  logout(req, res, next) {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({ success: true, data: {} });
  }

  async getMe(req, res, next) {
    res.status(200).json({ success: true, data: req.user });
  }

  async updateDetails(req, res, next) {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };

    const user = await this.updateUser(req.user.id, fieldsToUpdate);

    res.status(200).json({ success: true, data: user });
  }

  async updatePassword(req, res, next) {
    const user = await this.findUserById(req.user.id);

    const isMatch = await this.matchPassword(user, req.body.currentPassword);
    if (!isMatch) {
      return next(new ErrorResponse("Password is incorrect", 401));
    }

    user.password = req.body.newPassword;
    await this.saveUser(user);

    await this.sendTokenResponse(user, 200, res);
  }

  async forgotPassword(req, res, next) {
    const user = await this.findUserByEmail(req.body.email);

    if (!user) {
      return next(new ErrorResponse("There is no user with that email", 404));
    }

    const resetToken = this.getResetPasswordToken(user);

    await this.saveUser(user, { validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to:\n\n${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password reset token",
        message,
      });

      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await this.saveUser(user, { validateBeforeSave: false });

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  }

  async resetPassword(req, res, next) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await this.findUserByResetToken(tokenHash);

    if (!user) {
      return next(new ErrorResponse("Invalid token", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await this.saveUser(user);

    await this.sendTokenResponse(user, 200, res);
  }

  async confirmEmail(req, res, next) {
    const { token } = req.query;

    if (!token) {
      return next(new ErrorResponse("Invalid Token", 400));
    }

    const splitToken = token.split(".")[0];
    const tokenHash = crypto
      .createHash("sha256")
      .update(splitToken)
      .digest("hex");

    const user = await this.findUserByConfirmEmailToken(tokenHash);

    if (!user) {
      return next(new ErrorResponse("Invalid Token", 400));
    }

    user.confirmEmailToken = undefined;
    user.isEmailConfirmed = true;

    await this.saveUser(user, { validateBeforeSave: false });

    await this.sendTokenResponse(user, 200, res);
  }

  // --- Helper to generate and send JWT ---
  async sendTokenResponse(user, statusCode, res) {
    const token = this.getSignedJwtToken(user);

    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") {
      options.secure = true;
    }

    res.status(statusCode).cookie("token", token, options).json({
      success: true,
      token,
    });
  }
}

module.exports = GenericAuth;
