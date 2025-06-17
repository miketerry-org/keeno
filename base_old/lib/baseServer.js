// baseServer.js:

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

class BaseServer {
  #expressConfig;
  #tenantConfigs;
  #express;
  #tenants;
  #active = false;
  #server;

  constructor(expressConfig, tenantConfigs) {
    // remember the express and tenant configurations
    this.#expressConfig = expressConfig;
    this.#tenantConfigs = tenantConfigs;

    // call methods to initialize express and tenants
    initExpress();
    initTenants();
  }

  get express() {
    return this.#express;
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
      const port = this.#expressConfig.port;
      this.#server = this.#express.listen(port, () => {
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

  initExpress() {}

  initTenants() {}
}

module.exports = BaseServer;
