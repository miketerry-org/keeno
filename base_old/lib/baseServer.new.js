"use strict";

// Load required modules
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const session = require("express-session");
const system = require("keeno-system");
const Schema = require("keeno-schema");
const TenantManager = require("./tenantManager");
const getDebugInfo = require("./getDebugInfo");

const { booleanType, emailType, enumType, integerType, stringType } =
  Schema.types;

class BaseServer {
  #app;
  #config;
  #db;
  #log;
  #server;
  #tenants;
  #active = false;

  constructor(config) {
    this.#app = express();
    this.#config = config;
    this.#log = console;
    this.#tenants = [];
  }

  get app() {
    return this.#app;
  }

  get tenants() {
    return this.#tenants;
  }

  get active() {
    return this.#active;
  }

  set active(value) {
    if (value === this.#active) {
      return;
    }

    if (value) {
      const port = this.#config.port;
      this.#server = this.#app.listen(port, () => {
        this.#active = true;
        system.log.info(`Server is listening on port: ${port}`);
      });
    } else {
      if (this.#server) {
        this.#server.close(() => {
          this.#active = false;
          system.log.info("Server has been stopped.");
        });
        this.#server = null;
      }
    }
  }

  configSchema() {
    return {
      port: integerType({ min: 1, max: 65000, required: true }),
      db_url: stringType({ minLength: 1, maxLength: 255, required: true }),
      log_collection_name: stringType({ minLength: 1, required: true }),
      log_expiration_days: integerType({ min: 1, max: 365 }),
      log_capped: booleanType(),
      log_max_size: integerType({ min: 0, max: 1000 }),
      log_max_docs: integerType({ min: 0, max: 1000000 }),
      rate_limit_minutes: integerType({ min: 1, max: 3600, required: true }),
      rate_limit_requests: integerType({ min: 1, max: 10000, required: true }),
      body_limit: stringType({ min: 1, max: 255 }),
      session_secret: stringType({ minLength: 16, required: true }),
    };
  }

  configValidation(config) {
    const schema = new Schema(this.configSchema());
    const { validated, errors } = schema.validate(config);

    if (errors.length === 0) {
      return validated;
    } else {
      const message = errors.map(err => err.message).join(", ");
      system.fatal(`Invalid server configuration, ${message}`);
    }
  }
}

module.exports = BaseServer;
