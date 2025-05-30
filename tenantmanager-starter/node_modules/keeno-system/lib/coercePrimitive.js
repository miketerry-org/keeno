// coercePrimitive.js:

"use strict";

/**
 * Coerces primitive-like string values to appropriate types.
 * @param {string} value
 * @returns {string|number|boolean|null}
 */
function coercePrimitive(value) {
  const trimmed = value.trim().toLowerCase();

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;

  const num = Number(value);
  if (!isNaN(num) && value !== "") return num;

  return value;
}

module.exports = coercePrimitive;
