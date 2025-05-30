// schema.js: function to initialize a schema specification

"use strict";

// load all necessary modules
const dataTypes = require("./dataTypes.js");
const validObject = require("./validObject.js");

class Schema {
  #schema;

  constructor(schema) {
    this.#schema = schema;
  }

  validate(object) {
    return validObject(object, this.#schema);
  }

  static types = dataTypes;
}

module.exports = Schema;
