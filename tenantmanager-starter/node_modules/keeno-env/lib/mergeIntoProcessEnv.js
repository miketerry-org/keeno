// mergeIntoProcess.env:

"use strict";

/**
 * Merge properties from an object into the process.env global variable.
 *
 * @param {Object} object - Key-value pairs to merge into process.env.
 * @param {Object} [options={}] - Optional configuration.
 * @param {boolean} [options.override=false] - If true, existing env vars will be overwritten.
 * @throws Will throw if a key already exists in process.env and override is false.
 */
function mergeIntoProcessEnv(object, options = {}) {
  const { override = false } = options;

  if (typeof object !== "object" || object === null) {
    throw new TypeError("First argument must be a non-null object");
  }

  for (const [key, value] of Object.entries(object)) {
    if (Object.prototype.hasOwnProperty.call(process.env, key)) {
      if (!override) {
        throw new Error(
          `Environment variable "${key}" already exists and override is disabled`
        );
      }
    }

    // Always store as string
    process.env[key] = String(value);
  }
}

module.exports = mergeIntoProcessEnv;
