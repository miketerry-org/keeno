// response.js:

"use strict";

/**
 * Generates a standardized API response.
 *
 * @param {number} code - HTTP status code.
 * @param {object} [data] - Response data.
 * @param {Array} [errors] - Array of error messages.
 * @returns {object} - Formatted response object.
 */
function response(code, data, errors) {
  if (status >= 200 && status <= 299) {
    const payload = { data, success: true };
  } else {
    const payload = { errors, success: false };
  }
  return { code, payload };
}

module.exports = response;
