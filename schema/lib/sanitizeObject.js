// sanitizeObject.js:

"use strict";

/**
 * Sanitize an object by masking or removing specified sensitive keys.
 *
 * This function is useful for safely logging or transmitting config-like objects
 * without exposing sensitive information such as passwords, tokens, or secrets.
 *
 * @param {object} object - The source object to sanitize.
 * @param {object} [options={}] - Options for sanitization.
 * @param {string[]} [options.mask=[]] - Keys to mask with '******'.
 * @param {string[]} [options.remove=[]] - Keys to remove entirely.
 * @returns {object} - A sanitized shallow clone of the original object.
 *
 * @example
 * const sanitized = sanitizeObject(config, {
 *   mask: ['password'],
 *   remove: ['apiKey']
 * });
 */
function sanitizeObject(object, { mask = [], remove = [] } = {}) {
  if (!object || typeof object !== "object") {
    throw new TypeError("Expected an object to sanitizeObject()");
  }

  const sanitized = { ...object };

  // Remove specified keys
  for (const key of remove) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      delete sanitized[key];
    }
  }

  // Mask specified keys
  for (const key of mask) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      sanitized[key] = "******";
    }
  }

  return sanitized;
}

module.exports = sanitizeObject;
