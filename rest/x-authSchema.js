// authSchema.js

"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const system = require("keeno-system");

const SALT_ROUNDS = 10;

const authSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: system.userRoles,
      default: system.userRoles[0],
    },
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Indexes
authSchema.index({ email: 1 }, { unique: true });
authSchema.index({ _id: 1 }, { unique: true });

// Instance methods
authSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Auto-hash on save
authSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = authSchema;
