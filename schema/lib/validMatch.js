// validMatch.js:

"use strict";

// load all necessary modules
const validValue = require("./validValue");

/**
 * Validates a value against a regular expression pattern.
 * @param {Object} object
 * @param {string} key
 * @param {Object} rule
 * @param {string} rule.pattern - Regex pattern as string.
 * @returns {{ value: string|any, message: string|undefined }}
 */
function validMatch(object, key, rule) {
  let { value, message } = validValue(object, key, rule);

  if (!message) {
    if (!rule?.pattern) {
      message = `"pattern" is required in rule for "${key}"`;
    } else {
      const regex = new RegExp(rule.pattern);
      if (!regex.test(value)) {
        message = `"${key}" does not match required pattern`;
      }
    }
  }

  return { value, message };
}

module.exports = validMatch;
