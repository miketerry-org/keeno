// validTime.js:

"use strict";

// load all necessary moddules
const validValue = require("./validValue"); // Adjust path as needed

/**
 * Validates and parses a time string in HH:mm or HH:mm:ss format.
 * Converts the time into total seconds since midnight.
 *
 * @param {Object} object - The input object containing the value.
 * @param {string} key - The property name to validate.
 * @param {Object} rule - Validation options.
 * @returns {{ value: number|undefined, message: string|undefined }}
 */
function validTime(object, key, rule) {
  let { value, message } = validValue(object, key, rule);

  if (!message && typeof value === "string") {
    const parts = value.split(":").map(Number);

    if (parts.length < 2 || parts.length > 3 || parts.some(isNaN)) {
      message = `"${key}" must be in HH:mm or HH:mm:ss format`;
    } else {
      const [hours, minutes, seconds = 0] = parts;

      if (
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59 ||
        seconds < 0 ||
        seconds > 59
      ) {
        message = `"${key}" has invalid time values`;
      } else {
        value = hours * 3600 + minutes * 60 + seconds;
      }
    }
  }

  return { value, message };
}

module.exports = validTime;
