// validValue.js Used by all data types to get basic value

"use strict";

// load all necessary modules
const { coercePrimitive } = require("keeno-system");

/**
 * Validates a single value by checking for requiredness, optional trimming, and applying primitive coercion.
 *
 * @param {Object} object - The object containing the property.
 * @param {string} key - The property name to validate.
 * @param {Object} [rule={}] - Validation rule object.
 * @param {boolean} [rule.required=true] - Whether the field is required.
 * @param {"both"|"lead"|"trail"|"none"} [rule.trim="both"] - Specifies how to trim whitespace from string values:
 *   - "both": Trim leading and trailing whitespace (default)
 *   - "lead": Trim only leading whitespace
 *   - "trail": Trim only trailing whitespace
 *   - "none": Do not trim
 * @returns {{ value: any, message: string|undefined }} The validated and possibly trimmed/coerced value, along with an optional message.
 */
function validValue(object, key, rule = {}) {
  let value = object[key];
  let message = undefined;

  const required = rule?.required ?? true;
  const trim = rule?.trim ?? "both";

  if (required && (value === undefined || value === null || value === "")) {
    message = `"${key}" is required`;
  } else if (typeof value === "string") {
    switch (trim) {
      case "lead":
        value = value.replace(/^\s+/, "");
        break;
      case "trail":
        value = value.replace(/\s+$/, "");
        break;
      case "none":
        // no trimming
        break;
      case "both":
      default:
        value = value.trim();
        break;
    }

    value = coercePrimitive(value);
  }

  return { value, message };
}

module.exports = validValue;
