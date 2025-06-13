// authModel.js:

"use strict";

// Load all necessary modules
const MongooseModel = require("./mongooseModel");
const authSchema = require("./authSchema");

/**
 * AuthModel provides access to the "auth" collection
 * for a specific tenant using the shared MongooseModel base class.
 *
 * Includes additional convenience methods for authentication-specific queries.
 *
 * @class
 * @extends MongooseModel
 */
class AuthModel extends MongooseModel {
  /**
   * Returns the Mongoose schema used for the "auth" model.
   * Overrides the abstract schema() method defined in MongooseModel.
   *
   * @returns {import('mongoose').Schema} The Mongoose schema instance.
   */
  schema() {
    return authSchema;
  }

  /**
   * Finds a user document by email.
   *
   * @param {string} email - The email address to search for.
   * @returns {Promise<object|null>} - The matched document or `null` if not found.
   * @throws {TypeError} If email is not a string.
   */
  async findByEmail(email) {
    if (typeof email !== "string") {
      throw new TypeError("Email must be a string");
    }
    return this.findOne({ email: email.trim().toLowerCase() });
  }
}

module.exports = AuthModel;
