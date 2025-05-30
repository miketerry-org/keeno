// validFloat.js:

"use strict";

// load all necessary modules
const validValue = require("./validValue");

/**
 * Validates a float and checks min/max range.
 * @param {Object} object
 * @param {string} key
 * @param {Object} rule
 * @param {number} [rule.min]
 * @param {number} [rule.max]
 * @returns {{ value: number|any, message: string|undefined }}
 */
function validFloat(object, key, rule) {
  let { value, message } = validValue(object, key, rule);

  if (!message) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      message = `"${key}" is not a valid float`;
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

module.exports = validFloat;
