// registerUser.js: performs all steps to register a new user

"use strict";

// Load necessary modules
const Schema = require("keeno-schema");

// Destructure needed data types from schema
const { compareType, emailType, enumType, passwordType, stringType } =
  Schema.types;

// Define the schema for the registration request
const schema = new Schema({
  email: emailType({ min: 1, max: 255, required: true }),
  email2: compareType({ compareTo: "email", required: true }),
  password: passwordType({ min: 12, max: 60, required: true }),
  password2: compareType({ compareTo: "password", required: true }),
  firstname: stringType({ min: 1, max: 20, required: true }),
  lastname: stringType({ min: 1, max: 20, required: true }),
  role: enumType({}),
});

/**
 * Validates the registration request body.
 *
 * @param {object} body - The request body.
 * @returns {object} - Object containing validated data and validation errors.
 */
function validateRegister(body) {
  let data = {};

  // Validate the request body
  const { validated, errors } = schema.validate(body);

  // If no errors, prepare data to be saved in the database
  if (errors.length === 0) {
    data = {
      email: validated.email,
      passwordHash: validated.password,
      firstname: validated.firstname,
      lastname: validated.lastname,
      role: validated.role,
    };
  } else {
    // One or more errors — return original data with passwords removed
    data = { ...body };
    delete data.password;
    delete data.password2;
  }

  return { data, errors };
}

/**
 * Registers a new user.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {object} JSON response indicating success or failure.
 */
async function registerUser(req, res) {
  try {
    // Validate the request body
    const { data, errors } = validateRegister(req.body);

    // Return error response if there are any validation issues
    if (errors.length > 0) {
      return res.sendJSON(400, data, errors);
    }

    // Get an instance of the AuthModel
    const model = req.tenant.models.auth;

    // Attempt to insert a new auth document into the database
    const auth = await model.create(data);

    // Return a successful creation response with new auth ID and email
    return res.sendJSON(201, { id: auth.id, email: auth.email }, []);
  } catch (err) {
    // Log the raw error message
    req.tenant.log.error(err);

    // Handle duplicate email error
    if (err.code === 11000) {
      return res.sendJSON(409, data, ["Email already registered"]);
    }

    // For any other error, return a generic server error
    return res.sendJSON(500, data, ["Registration failed"]);
  }
}

module.exports = registerUser;
