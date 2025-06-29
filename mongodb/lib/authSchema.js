// authSchema.js:

"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const system = require("keeno-system");

// Constants
const SALT_ROUNDS = 10;
const CODE_EXPIRATION_MINUTES = 10;
const MAX_FAILED_ATTEMPTS = 5;
const ACCOUNT_LOCK_DURATION_MS = 15 * 60 * 1000;

// Utility: Generate ###-### format code
function generateCode() {
  const part1 = Math.floor(100 + Math.random() * 900).toString();
  const part2 = Math.floor(100 + Math.random() * 900).toString();
  return `${part1}-${part2}`;
}

const authSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true, // This is enough — no need for schema.index()
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

    // Email verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    authCode: {
      type: String,
      match: /^\d{3}-\d{3}$/,
    },
    authCodeExpiresAt: {
      type: Date,
    },

    // Login tracking
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },

    // Password reset
    resetCode: {
      type: String,
      match: /^\d{3}-\d{3}$/,
    },
    resetCodeExpiresAt: {
      type: Date,
    },

    // Metadata
    lastLoginAt: {
      type: Date,
    },
  },
  {
    trimstamps: true,
    strict: true,
  }
);

// ✅ Valid indexes only
authSchema.index({ authCodeExpiresAt: 1 }, { expireAfterSeconds: 0 });
authSchema.index({ resetCodeExpiresAt: 1 }, { expireAfterSeconds: 0 });
authSchema.index({ lockUntil: 1 });

// Instance methods

authSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

authSchema.methods.isAccountLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

authSchema.methods.resetLock = function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
};

authSchema.methods.incrementLoginAttempts = function () {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + ACCOUNT_LOCK_DURATION_MS);
  }
};

authSchema.methods.generateAuthCode = function () {
  const code = generateCode();
  this.authCode = code;
  this.authCodeExpiresAt = new Date(
    Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000
  );
  return code;
};

authSchema.methods.generateResetCode = function () {
  const code = generateCode();
  this.resetCode = code;
  this.resetCodeExpiresAt = new Date(
    Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000
  );
  return code;
};

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
