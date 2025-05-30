// validInteger.js:

"use strict";

// load all necessary modules
const validValue = require("./validValue");

/**
 * Validates an integer and checks min/max range.
 * @param {Object} object
 * @param {string} key
 * @param {Object} rule
 * @param {number} [rule.min]
 * @param {number} [rule.max]
 * @returns {{ value: number|any, message: string|undefined }}
 */
function validInteger(object, key, rule) {
  let { value, message } = validValue(object, key, rule);

  if (!message) {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      message = `"${key}" is not a valid integer`;
    } else {
      if (rule?.min !== undefined && num < rule.min) {
        message = `"${key}" must be at least ${rule.min}`;
      } else if (rule?.max !== undefined && num > rule.max) {
        message = `"${key}" must be at most ${rule.max}`;
      } else {
        value = num;
      }
    }
  }

  return { value, message };
}

module.exports = validInteger;
