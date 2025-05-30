// maskSensitiveKeys.js:

"use strict";

/**
 * Create a shallow clone of the given object, replacing specified keys with masked values.
 *
 * This is useful for safely logging configuration objects without exposing sensitive values
 * like passwords, secrets, or API keys.
 *
 * @param {object} object - The source object to clone and mask.
 * @param {string[]} [keys=[]] - An array of keys to mask in the returned object.
 * @returns {object} - A shallow clone of the original object with sensitive keys masked as '******'.
 *
 */
function maskSensitiveKeys(object, keys = []) {
  if (!object || typeof object !== "object") {
    throw new TypeError("Expected an object to maskSensitiveKeys()");
  }

  const masked = { ...object };

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(masked, key)) {
      masked[key] = "******";
    }
  }

  return masked;
}

module.exports = maskSensitiveKeys;
