// authModel.js

"use strict";

const { MongooseModel } = require("keeno-mongodb");
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
   * Constructs a new instance of the AuthModel.
   *
   * @param {object} tenant - The tenant object containing the Mongoose `db` instance.
   */
  constructor(tenant) {
    super(tenant, "auth", authSchema);
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
