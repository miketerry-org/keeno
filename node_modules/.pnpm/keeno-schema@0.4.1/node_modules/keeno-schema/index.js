// index.js: keeno-schema

"use strict";

// Load all necessary modules
const dataTypes = require("./lib/dataTypes.js");
const maskSensitiveKeys = require("./lib/maskSensitiveKeys.js");
const removeSensitiveKeys = require("./lib/removeSensitiveKeys.js");
const sanitizeObject = require("./lib/sanitizeObject.js");
const validObject = require("./lib/validObject.js");

/**
 * Schema-based object validator.
 * Encapsulates validation rules and uses type validators for common patterns.
 *
 * @example
 * const Schema = require("keeno-schema");
 *
 * const schema = new Schema({
 *   username: { validate: Schema.types.validString, minLength: 3, maxLength: 20 },
 *   password: { validate: Schema.types.validPassword }
 * });
 *
 * const result = schema.validate({ username: "admin", password: "MyPass123!" });
 * console.log(result.errors);
 */
class Schema {
  /** @type {Object} */
  #schema;

  /**
   * Creates a new Schema instance.
   * @param {Object} schema - Schema definition mapping keys to validation rules.
   */
  constructor(schema) {
    this.#schema = schema;
  }

  /**
   * Validates an object using the schema definition provided to the constructor.
   *
   * @param {Object} object - The object to validate.
   * @returns {{ object: Object, errors: Array<{ field: string, message: string }> }}
   * Returns a copy of the object with any coerced values and an array of validation errors.
   */
  validate(object) {
    return validObject(object, this.#schema);
  }

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
  static maskSensitive = maskSensitiveKeys;

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
  static removeSensitive = removeSensitiveKeys;

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
   */
  static sanitize = sanitizeObject;

  /**
   * Provides access to the available built-in validation functions.
   *
   * @type {Object<string, Function>}
   * @example
   * Schema.types.validString(...)
   */
  static types = dataTypes;
}

module.exports = Schema;
