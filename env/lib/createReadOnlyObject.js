// createReadOnlyObject.js:

"use strict";

function createReadOnlyObject(data) {
  if (data === null || typeof data !== "object") {
    return data; // primitives remain as-is
  }

  const result = Array.isArray(data) ? [] : {};

  for (const key of Object.keys(data)) {
    const value = data[key];
    const readOnlyValue = createReadOnlyObject(value); // recurse

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
