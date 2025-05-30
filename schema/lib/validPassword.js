// validPassword.js:

"use strict";

// load all necessary modules
const validValue = require("./validValue");

/**
 * Validates a password based on configurable strength rules.
 *
 * @param {Object} object - The input object (e.g., form or config).
 * @param {string} key - The key to extract and validate from the object.
 * @param {Object} rule - Validation rules for the password.
 * @param {number} [rule.minUpper=1] - Minimum required uppercase letters.
 * @param {number} [rule.minLower=1] - Minimum required lowercase letters.
 * @param {number} [rule.minDigits=1] - Minimum required digits.
 * @param {number} [rule.minSymbols=1] - Minimum required symbols.
 * @param {number} [rule.minLength=12] - Minimum total length of the password.
 * @returns {{ value: string, message: string|undefined }}
 */
function validPassword(object, key, rule) {
  let { value, message } = validValue(object, key, rule);

  if (!message && typeof value === "string") {
    const {
      minUpper = 1,
      minLower = 1,
      minDigits = 1,
      minSymbols = 1,
      minLength = 12,
    } = rule;

    const upper = (value.match(/[A-Z]/g) || []).length;
    const lower = (value.match(/[a-z]/g) || []).length;
    const digits = (value.match(/[0-9]/g) || []).length;
    const symbols = (value.match(/[!@#$%^&*()[\]{};:'",.<>/?\\|`~+=_-]/g) || [])
      .length;

    const errors = [];
    if (value.length < minLength) {
      errors.push(`must be at least ${minLength} characters`);
    }
    if (upper < minUpper) {
      errors.push(`must contain at least ${minUpper} uppercase letter(s)`);
    }
    if (lower < minLower) {
      errors.push(`must contain at least ${minLower} lowercase letter(s)`);
    }
    if (digits < minDigits) {
      errors.push(`must contain at least ${minDigits} digit(s)`);
    }
    if (symbols < minSymbols) {
      errors.push(`must contain at least ${minSymbols} symbol(s)`);
    }

    if (errors.length > 0) {
      message = `"${key}" is not a strong enough password: ${errors.join(
        "; "
      )}`;
    }
  }

  return { value, message };
}

module.exports = validPassword;
