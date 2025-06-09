// createReadOnlyObject.js:

"use strict";

/**
 * Recursively creates a deeply read-only clone of an object.
 * Circular references are safely handled.
 *
 * @param {Object} data - The input object to freeze.
 * @param {WeakMap} [seen=new WeakMap()] - Tracks already visited objects.
 * @returns {Object} Read-only version of the input.
 */
function createReadOnlyObject(data, seen = new WeakMap()) {
  if (data === null || typeof data !== "object") {
    return data; // primitives remain as-is
  }

  if (seen.has(data)) {
    return seen.get(data); // return already processed reference
  }

  const result = Array.isArray(data) ? [] : {};
  seen.set(data, result); // mark this object as seen

  for (const key of Object.keys(data)) {
    const value = data[key];
    const readOnlyValue = createReadOnlyObject(value, seen);

    Object.defineProperty(result, key, {
      value: readOnlyValue,
      writable: false,
      configurable: false,
      enumerable: true,
    });
  }

  return result;
}

module.exports = createReadOnlyObject;
