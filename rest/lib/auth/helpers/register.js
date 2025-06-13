// register.js: performs all steps to register a new user

"use strict";

// Load necessary modules
const { response } = require("keeno-system");
const Schema = require("keeno-schema");

/**
 * Validates the registration request body.
 *
 * @param {object} body - The request body.
 * @returns {object} - Object containing validated data and errors.
 */
function validateRegister(body) {
  const { passwordType, stringType, emailType, enumType } = Schema.types;

  // Define the schema for the register request
  const schema = new Schema({
    email: emailType({ min: 1, max: 255, required: true }),
    password: passwordType({ min: 12, max: 60, required: true }),
    firstname: stringType({ min: 1, max: 20, required: true }),
    lastname: stringType({ min: 1, max: 20, required: true }),
    role: enumType({}),
  });

  // Validate the body against the schema
  let { validated, errors } = schema.validate(body);

  // If validation is successful, map to the required structure
  if (errors.length === 0) {
    validated = {
      email: validated.email,
      passwordHash: validated.password,
      firstname: validated.firstname,
      lastname: validated.lastname,
      role: validated.role,
    };
  }

  return { validated, errors };
}

/**
 * Registers a new user.
 *
 * @param {object} tenant - The tenant object containing models and logging.
 * @param {object} body - The request body containing user details.
 * @returns {object} - The response object indicating success or failure.
 */
async function register(tenant, body) {
  try {
    // Validate the request body
    const { validated, errors } = validateRegister(body);
    if (errors.length > 0) {
      return response(400, undefined, errors);
    }

    // Get the authentication model
    const model = tenant.models("auth");

    // Attempt to create a new authentication document
    let auth = await model.create(validated);

    // Return success response with user ID and email
    const data = { id: auth.id, email: auth.email };
    return response(201, data, undefined);
  } catch (err) {
    // Log the error
    tenant.log.error(err);

    // Handle duplicate email error
    if (err.code === 11000) {
      return response(409, undefined, ["Email already registered"]);
    }

    // Handle other errors
    return response(500, undefined, ["Registration failed"]);
  }
}

module.exports = register;
