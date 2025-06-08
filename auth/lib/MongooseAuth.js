"use strict";

const GenericAuth = require("./genericAuth");
const User = require("../models/User"); // Adjust path as needed

class MongooseAuth extends GenericAuth {
  constructor() {
    super();
  }

  // --- Implement DB actions ---
  async createUser(userData) {
    return await User.create(userData);
  }

  async findUserByEmail(email) {
    return await User.findOne({ email }).select("+password");
  }

  async findUserById(id) {
    return await User.findById(id);
  }

  async findUserByResetToken(tokenHash) {
    return await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });
  }

  async findUserByConfirmEmailToken(tokenHash) {
    return await User.findOne({
      confirmEmailToken: tokenHash,
    });
  }

  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async saveUser(user, options = {}) {
    return await user.save(options);
  }

  // --- Implement user-specific logic wrappers ---
  getSignedJwtToken(user) {
    return user.getSignedJwtToken(); // assumed to be a method on your user schema
  }

  generateEmailConfirmToken(user) {
    return user.generateEmailConfirmToken(); // should set `confirmEmailToken` and return the raw token
  }

  getResetPasswordToken(user) {
    return user.getResetPasswordToken(); // should set `resetPasswordToken` and `resetPasswordExpire`, and return the raw token
  }

  async matchPassword(user, password) {
    return await user.matchPassword(password); // assumed instance method on user schema
  }
}

module.exports = MongooseAuth;
