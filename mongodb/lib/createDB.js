// createDB.js: create a mongoose database connection

"use strict";

const mongoose = require("mongoose");
const system = require("keeno-system");
const Schema = require("keeno-schema");

// Destructure schema types needed by validation
const { stringType } = Schema.types;

/**
 * Asynchronously creates a MongoDB connection using Mongoose.
 * @param {Object} tenant - A tenant object containing a `db_url`.
 * @returns {Promise<mongoose.Connection>} - Resolves with the connection object.
 * @throws {Error} - Throws if validation fails or connection cannot be established.
 */
async function createDB(tenant) {
  const { validated, errors } = new Schema({
    db_url: stringType({ min: 1, max: 255, required: true }),
  }).validate(tenant);

  if (errors.length > 0) {
    throw new Error(errors.map(e => e.message).join(", "));
  }

  try {
    const connection = await mongoose
      .createConnection(validated.db_url, {
        serverSelectionTimeoutMS: 10000, // Let Mongoose handle timeout
      })
      .asPromise();

    if (system.isDebugging) {
      system.log.info(`Database connected to "${validated.db_url}"`);
    }

    connection.on("disconnected", () => {
      if (system.isDebugging) {
        system.log.info(`Database disconnected from "${connection.name}"`);
      }
    });

    return connection;
  } catch (err) {
    if (system.isDebugging) {
      system.log.error(
        `Database connection error: (${validated.db_url}) ${err.message}`
      );
    }
    throw new Error(`Failed to connect to database: ${err.message}`);
  }
}

module.exports = createDB;
