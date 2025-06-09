// validEnum.js:

"use strict";

// load all necessary modules
const validValue = require("./validValue");

/**
 * Validates that a value exists in an enumerated set.
 * @param {Object} object
 * @param {string} key
 * @param {Object} rule
 * @param {Array<any>} rule.values - Allowed values.
 * @returns {{ value: any, message: string|undefined }}
 */
function validEnum(object, key, rule) {
  let { value, message } = validValue(object, key, rule);

  if (!message) {
    const options = rule?.values;
    if (!Array.isArray(options)) {
      message = `"values" array is required in rule for "${key}"`;
    } else if (!options.includes(value)) {
      message = `"${key}" must be one of: ${options.join(", ")}`;
    }
  }

  return { value, message };
}

module.exports = validEnum;
