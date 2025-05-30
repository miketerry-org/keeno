// createDB.js:

"use strict";

const mongoose = require("mongoose");
const system = require("keeno-system");
const Schema = require("keeno-schema");

const { string } = Schema.types;

function createDB(config) {
  const { validated, errors } = new Schema({
    db_url: string({ min: 1, max: 255, required: true }),
  }).validate(config);

  if (errors.length > 0) {
    throw new Error(errors.map(e => e.message).join(", "));
  }

  const timeoutMs = 10000;

  const connection = mongoose.createConnection(validated.db_url, {});

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      connection.removeAllListeners();
      reject(
        new Error(
          `Database connection timed out after ${timeoutMs} milliseconds`
        )
      );
    }, timeoutMs);

    connection.once("connected", () => {
      clearTimeout(timer);
      system.log.info(`Database connected to "${connection.name}"`);
      resolve(connection);
    });

    connection.once("error", err => {
      clearTimeout(timer);
      system.log.error(err.message);
      reject(new Error(err.message));
    });

    connection.on("disconnected", () => {
      system.log.info(`Database disconnected from "${connection.name}"`);
    });
  });
}

module.exports = createDB;
