// validBoolean.js:

"use strict";

// load all necessary modules
const validValue = require("./validValue");

/**
 * Validates a boolean value, with support for custom truthy/falsy values.
 * @param {Object} object
 * @param {string} key
 * @param {Object} [rule={}]
 * @param {Array<any>} [rule.trueValues]
 * @param {Array<any>} [rule.falseValues]
 * @returns {{ value: boolean|any, message: string|undefined }}
 * */
function validBoolean(object, key, rule) {
  let { value, message } = validValue(object, key, rule);
  if (message) {
    return { value, message };
  }

  const trueValues = rule?.trueValues ?? [true, "true", 1, "1"];
  const falseValues = rule?.falseValues ?? [false, "false", 0, "0"];

  if (trueValues.includes(value)) {
    value = true;
  } else if (falseValues.includes(value)) {
    value = false;
  } else {
    const showTrue = trueValues.map(v => JSON.stringify(v)).join(", ");
    const showFalse = falseValues.map(v => JSON.stringify(v)).join(", ");
    message = `"${key}" must be a boolean. Allowed true values: ${showTrue}. Allowed false values: ${showFalse}.`;
  }

  return { value, message };
}

module.exports = validBoolean;
