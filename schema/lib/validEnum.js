// validEnum.js:

"use strict";

// load all necessary modules
const validValue = require("./validValue");

/**
 * Validates that a value exists in an enumerated set.
 * If the value is undefined, defaults to the first value in the array.
 * Comparisons are case-insensitive, but returned value will be as in the array.
 * @param {Object} object
 * @param {string} key
 * @param {Object} rule
 * @param {Array<any>} rule.values - Allowed values.
 * @returns {{ value: any, message: string|undefined }}
 */
function validEnum(object, key, rule) {
  let { value } = validValue(object, key, rule);
  let message;

  const options = rule?.values;

  if (!Array.isArray(options) || options.length === 0) {
    message = `"values" array is required in rule for "${key}"`;
    return { value, message };
  }

  const normalizedOptions = options.map(opt =>
    typeof opt === "string" ? opt.toLowerCase() : opt
  );

  if (value === undefined) {
    value = options[0]; // default to first original value
  } else {
    const normalizedValue =
      typeof value === "string" ? value.toLowerCase() : value;
    const matchIndex = normalizedOptions.indexOf(normalizedValue);

    if (matchIndex === -1) {
      message = `"${key}" must be one of: ${options.join(", ")}`;
    } else {
      value = options[matchIndex]; // use the original value from the array
    }
  }

  return { value, message };
}

module.exports = validEnum;
