// validValue.js:

"use strict";

// load all necessary modules
const { coercePrimitive } = require("keeno-system");

/**
 * Validates a single value by checking for requiredness and applying primitive coercion.
 * @param {Object} object - The object containing the property.
 * @param {string} key - The property name to validate.
 * @param {Object} [rule={}] - Validation rule object.
 * @param {boolean} [rule.required=true] - Whether the field is required.
 * @returns {{ value: any, message: string|undefined }}
 */
function validValue(object, key, rule = {}) {
  let value = object[key];
  let message = undefined;

  const required = rule?.required ?? true;

  if (required && (value === undefined || value === null || value === "")) {
    message = `"${key}" is required`;
  } else if (typeof value === "string") {
    value = coercePrimitive(value);
  }

  return { value, message };
}

module.exports = validValue;
