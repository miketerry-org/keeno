// validTimestamp.js:

"use strict";

const validValue = require("./validValue"); // Adjust path as needed

/**
 * Validates and parses a date/time string into a Unix timestamp (in milliseconds).
 * Accepts ISO strings and common formats parseable by JavaScript's Date.
 *
 * @param {Object} object - The input object to validate.
 * @param {string} key - The property name to validate.
 * @param {Object} rule - Validation options.
 * @returns {{ value: number|undefined, message: string|undefined }}
 */
function validTimestamp(object, key, rule) {
  let { value, message } = validValue(object, key, rule);

  if (!message && typeof value === "string") {
    const parsed = Date.parse(value);

    if (isNaN(parsed)) {
      message = `"${key}" must be a valid date/time string`;
    } else {
      value = parsed; // Returns milliseconds since Unix epoch
    }
  }

  return { value, message };
}

module.exports = validTimestamp;
