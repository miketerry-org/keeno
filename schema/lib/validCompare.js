// validCompare.js:

"use strict";

// load all necessary modules
const validValue = require("./validValue");

/**
 * Compares the value of one field against another.
 * @param {Object} object
 * @param {string} key
 * @param {Object} rule
 * @param {string} rule.compareTo - The field to compare with.
 * @returns {{ value: any, message: string|undefined }}
 */
function validCompare(object, key, rule) {
  let { value, message } = validValue(object, key, rule);
  if (message) {
    return { value, message };
  }

  const compareKey = rule?.compareTo;
  if (!compareKey) {
    return { value, message: `"compareTo" is required in rule for "${key}"` };
  }

  const compareResult = validValue(object, compareKey, {
    required: rule.required,
  });
  const compareValue = compareResult.value;

  if (compareResult.message || value !== compareValue) {
    message = `"${key}" must match "${compareKey}"`;
  }

  return { value, message };
}

module.exports = validCompare;
