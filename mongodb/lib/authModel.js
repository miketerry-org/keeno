// authModel.js

"use strict";

const { MongooseModel } = require("keeno-mongodb");
const authSchema = require("./authSchema");

class AuthModel extends MongooseModel {
  constructor(tenant) {
    super(tenant, "auth", authSchema);
  }

  async findByEmail(email) {
    if (typeof email !== "string") {
      throw new TypeError("Email must be a string");
    }
    return this.findOne({ email: email.trim().toLowerCase() });
  }
}

module.exports = AuthModel;
