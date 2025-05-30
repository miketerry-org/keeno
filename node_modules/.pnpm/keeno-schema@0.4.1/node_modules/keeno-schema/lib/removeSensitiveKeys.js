// removeSensitiveKeys.js:
//
// "use strict";

/**
 * Create a shallow clone of the given object, removing specified keys entirely.
 *
 * This is useful when you want to remove sensitive keys (like passwords, tokens, secrets)
 * before saving, logging, or exposing an object externally.
 *
 * @param {object} object - The source object to clone and filter.
 * @param {string[]} [keys=[]] - An array of keys to remove from the returned object.
 * @returns {object} - A shallow clone of the original object with specified keys removed.
 */
function removeSensitiveKeys(object, keys = []) {
  if (!object || typeof object !== "object") {
    throw new TypeError("Expected an object to removeSensitiveKeys()");
  }

  const result = { ...object };

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      delete result[key];
    }
  }

  return result;
}

module.exports = removeSensitiveKeys;
