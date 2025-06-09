// baseEmailer.js:

"use strict";

// load all necessary modules
const system = require("keeno-system");

class BaseEmailer {
  constructor() {}

  async initialize(config) {}

  async send(message = {}) {}
}

module.exports = BaseEmailer;
