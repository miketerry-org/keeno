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
const Schema = require("keeno-schema");
const TenantManager = require("./tenantManager");

const { booleanType, emailType, enumType, integerType, stringType } =
  Schema.types;

/**
 * Base HTTP server providing core middleware, security,
 * session handling, rate limiting, error handling,
 * and multi-tenant support via `TenantManager`.
 *
 * Extend this class to build specialized servers (e.g., REST, GraphQL).
 */
class BaseServer {
  #app;
  #tenantManager;
  #config;
  #tenants;
  #services;
  #options;
  #active = false;
  #server = null;

  constructor() {
    this.#app = express();
    this.#tenantManager = new TenantManager();
    this.#config = {};
    this.#tenants = [];
    this.#services = {};
    this.#options = {};
  }

  static async create(config, tenants = [], services = {}, options = {}) {
    const server = new this();
    await server.initialize(config, tenants, services, options);
    return server;
  }

  get app() {
    return this.#app;
  }

  get options() {
    return this.#options;
  }

  get services() {
    return this.#services;
  }

  get tenantManager() {
    return this.#tenantManager;
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

  async initialize(config, tenants = [], services = {}, options = {}) {
    this.#config = this.configValidation(config);
    this.#tenants = tenants;
    this.#services = services;
    this.#options = options;

    await this.initSecurity();
    await this.initSession();
    await this.initRateLimit();
    await this.initLogger();
    await this.initTenantManager();
    await this.initMiddlewares();
    await this.initHealthCheck();
    await this.initRouters();
    await this.init404Error();
    await this.initErrorHandler();
    await this.initShutdown();
  }

  async initSecurity() {
    this.app.set("trust proxy", 1);
    const limit = this.#config.body_limit || "10kb";

    this.app.use(express.json({ limit }));
    this.app.use(express.urlencoded({ extended: true, limit }));
    this.app.use(helmet());
    this.app.use(hpp());
    this.app.use(cors(this.#options.cors || {}));
  }

  async initSession() {
    const sessionOptions = {
      secret: this.#config.session_secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: !system.isDevelopment,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 2, // 2 hours
      },
    };
    this.app.use(session(sessionOptions));
  }

  async initRateLimit() {
    const limiter = rateLimit({
      windowMs: this.#config.rate_limit_minutes * 60 * 1000,
      max: this.#config.rate_limit_requests,
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);
  }

  async initLogger() {
    if (system.isDebugging) {
      this.app.use(morgan("debug"));
    } else if (system.isDevelopment) {
      this.app.use(morgan("dev"));
    }
  }

  async initTenantManager() {
    await this.#tenantManager.initialize(
      this.tenants,
      this.services,
      this.options
    );
  }

  /**
   * Registers any user-defined Express middlewares.
   * Expects `services.middlewares` to be an array of functions (if defined).
   */
  async initMiddlewares() {
    const { middlewares } = this.#services;

    if (Array.isArray(middlewares)) {
      for (const middleware of middlewares) {
        if (typeof middleware === "function") {
          this.#app.use(middleware);
        } else {
          system.log.warn("Ignored invalid middleware (not a function).");
        }
      }
    }
  }

  async initHealthCheck() {
    console.log("health check");
  }

  async initRouters() {
    // To be implemented: project-specific routes
  }

  async init404Error() {
    // To be implemented: catch-all route for 404 errors
  }

  async initErrorHandler() {
    // To be implemented: centralized error handling middleware
  }

  async initShutdown() {
    const shutdown = () => {
      system.log.info?.("Shutting down gracefully...");
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  }

  configSchema() {
    return {
      port: integerType({ min: 1, max: 65000, required: true }),
      db_url: stringType({ minLength: 1, maxLength: 255, required: true }),
      log_collection_name: stringType({
        minLength: 1,
        maxLength: 255,
        required: true,
      }),
      log_expiration_days: integerType({ min: 1, max: 365 }),
      log_capped: booleanType(),
      log_max_size: integerType({ min: 0, max: 1000 }),
      log_max_docs: integerType({ min: 0, max: 1000000 }),
      rate_limit_minutes: integerType({ min: 1, max: 3600, required: true }),
      rate_limit_requests: integerType({ min: 1, max: 10000, required: true }),
      body_limit: stringType({ min: 1, max: 255 }),
      session_secret: stringType({
        minLength: 16,
        maxLength: 256,
        required: true,
      }),
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
