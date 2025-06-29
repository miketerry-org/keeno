// validEmail.js:

"use strict";

// load all necessary modules
const validString = require("./validString");

/**
 * Validates an email address using a standard regex.
 * @param {Object} object
 * @param {string} key
 * @param {Object} rule
 * @returns {{ value: string|any, message: string|undefined }}
 */
function validEmail(object, key, rule) {
  // convert email to lower case
  rule.capitalize = "lower";

  // now verify it is a a valid string
  let { value, message } = validString(object, key, rule);

  if (!message) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof value !== "string" || !emailRegex.test(value)) {
      message = `"${key}" is not a valid email address`;
    }
  }

  return { value, message };
}

module.exports = validEmail;
