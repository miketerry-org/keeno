// validObject.js:

"use strict";

/**
 * Validates an object against a given schema using per-field validation functions.
 * - Applies default values if fields are missing and `default` is defined in the schema.
 * - Accumulates errors as objects with `field` and `message` for clarity and flexibility.
 *
 * @param {Object} input - The object to validate and coerce (e.g., form or config input).
 * @param {Object<string, Object>} schema - Validation schema defining rules for each key.
 * @param {Function} schema[].validate - The validation function to use for this field.
 * @param {boolean} [schema[].required=true] - Whether the field is required.
 * @param {*} [schema[].default] - Optional default value (or function) if field is missing.
 * @returns {{ validated: Object, errors: Array<{ field: string, message: string }> }} - The validated object and an array of error objects.
 *
 * @example
 * const schema = {
 *   email: { validate: validEmail, required: true },
 *   debug: { validate: validBoolean, default: false },
 * };
 *
 * const result = validObject({ email: "me@example.com" }, schema);
 * // => { validated: { email: "me@example.com", debug: false }, errors: [] }
 */
function validObject(input, schema) {
  const errors = [];
  const validated = { ...input }; // shallow copy to avoid mutating input

  // Loop through all rules in the schema object
  Object.keys(schema).forEach(key => {
    const rule = schema[key];

    // Skip if rule is missing or not an object
    if (!rule || typeof rule !== "object") {
      return;
    }

    // Ensure the validate function is defined
    if (typeof rule.validate !== "function") {
      errors.push({
        field: key,
        message: `${key} is missing a validation function`,
      });
      return;
    }

    // Apply default value if not present
    if (validated[key] === undefined && "default" in rule) {
      validated[key] =
        typeof rule.default === "function" ? rule.default() : rule.default;
    }

    // Call the validator
    const { value, message } = rule.validate(validated, key, rule);

    if (message) {
      errors.push({ field: key, message });
    } else {
      validated[key] = value;
    }
  });

  return { validated, errors };
}

module.exports = validObject;
