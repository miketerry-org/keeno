// registerUser.js: performs all steps to register a new user

"use strict";

// Load necessary modules
const system = require("keeno-system");
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
});

/**
 * Removes sensitive fields (like passwords) from the given data object.
 *
 * @param {object} data - The input data object potentially containing sensitive fields.
 * @returns {object} The sanitized data without sensitive fields.
 */
function sanitize(data) {
  delete data.password;
  delete data.password2;
  return data;
}

/**
 * Validates and transforms the registration request body.
 *
 * @param {object} body - The incoming request body.
 * @returns {{data: object, errors: string[]}} An object containing sanitized/validated data and an array of validation errors.
 */
function validateRegister(body) {
  const { validated, errors } = schema.validate(body);

  if (errors.length > 0) {
    return { data: sanitize({ ...body }), errors };
  }

  const data = {
    email: validated.email,
    passwordHash: validated.password,
    firstname: validated.firstname,
    lastname: validated.lastname,
  };

  return { data, errors: [] };
}

/**
 * Handles user registration request: validates input, creates user in DB, and returns appropriate HTTP response.
 *
 * @param {object} req - Express request object, including tenant info and body.
 * @param {object} res - Express response object with custom sendJSON method.
 * @returns {Promise<void>} Sends a JSON response and does not return a value.
 */
async function registerUser(req, res) {
  console.log("inside registerUser");
  try {
    console.log("req.headers", req.headers);
    console.log("req.body", req.body);
    const { data, errors } = validateRegister(req.body);

    if (errors.length > 0) {
      console.log("errors", errors);
      return res.sendJSON(400, data, errors);
    }

    const model = req.tenant.models.user;
    const user = await model.create(data);

    return res.sendJSON(201, { id: user.id, email: user.email }, []);
  } catch (err) {
    req.tenant.log.error(err);

    // Re-sanitize input before returning on error
    const data = sanitize({ ...req.body });

    if (err.code === 11000) {
      return res.sendJSON(409, data, ["Email already registered"]);
    }

    return res.sendJSON(500, data, ["Registration failed"]);
  }
}

module.exports = registerUser;
