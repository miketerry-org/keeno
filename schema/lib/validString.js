// validString.js:

"use strict";

const validValue = require("./validValue"); // Adjust as needed

/**
 * Validates and optionally transforms a string based on length and casing rules.
 *
 * @param {Object} object - The input object to validate.
 * @param {string} key - The property key in the object.
 * @param {Object} rule - The validation rule configuration.
 * @param {number} [rule.minLength] - Minimum length of the string.
 * @param {number} [rule.maxLength] - Maximum length of the string.
 * @param {"upper"|"lower"|"firstcap"|"title"} [rule.capitalize] - Case transformation to apply.
 * @returns {{ value: string, message: string|undefined }}
 */
function validString(object, key, rule) {
  let { value, message } = validValue(object, key, rule);

  if (!message && typeof value === "string") {
    const { minLength, maxLength, capitalize } = rule;

    if (minLength && value.length < minLength) {
      message = `"${key}" must be at least ${minLength} characters`;
    } else if (maxLength && value.length > maxLength) {
      message = `"${key}" must be no more than ${maxLength} characters`;
    } else if (capitalize) {
      switch (capitalize) {
        case "upper":
          value = value.toUpperCase();
          break;
        case "lower":
          value = value.toLowerCase();
          break;
        case "firstcap":
          value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
          break;
        case "title":
          value = value
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());
          break;
        default:
          message = `"${key}" has an unknown capitalize rule: "${capitalize}"`;
          break;
      }
    }
  }

  return { value, message };
}

module.exports = validString;
