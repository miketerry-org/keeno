// validDate.js:

"use strict";

// load all necessary modules
const validValue = require("./validValue");

/**
 * Validates and converts a date string to a Date object.
 * @param {Object} object
 * @param {string} key
 * @param {Object} rule
 * @returns {{ value: Date|any, message: string|undefined }}
 */
function validDate(object, key, rule) {
  let { value, message } = validValue(object, key, rule);

  if (!message) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      message = `"${key}" is not a valid date`;
    } else {
      value = date;
    }
  }

  return { value, message };
}

module.exports = validDate;
