// isJsonLike.js:

"use script";

/**
 * Determines if a string looks like a JSON object or array.
 * @param {string} value
 * @returns {boolean}
 */
function isJsonLike(value) {
  const trimmed = value.trim();
  return (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  );
}

module.exports = isJsonLike;
