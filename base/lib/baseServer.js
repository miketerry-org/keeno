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
const TenantManager = require("./lib/tenantManager");

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

  constructor() {
    this.#app = express();
    this.#tenantManager = new TenantManager();
    this.#config = {};
    this.#tenants = [];
    this.#services = {};
    this.#options = {};
  }

  /**
   * Gets the Express application instance.
   * @returns {import('express').Express}
   */
  get app() {
    return this.#app;
  }

  /**
   * Gets the raw configuration options object.
   * @returns {Object}
   */
  get options() {
    return this.#options;
  }

  /**
   * Gets the services registered with the server.
   * @returns {Object}
   */
  get services() {
    return this.#services;
  }

  /**
   * Gets the tenant manager instance.
   * @returns {TenantManager}
   */
  get tenantManager() {
    return this.#tenantManager;
  }

  /**
   * Gets the tenant configuration array.
   * @returns {Object[]}
   */
  get tenants() {
    return this.#tenants;
  }

  /**
   * Initializes the full server stack.
   *
   * @param {Object} config - Required configuration object validated against a schema.
   * @param {Object[]} tenants - List of tenant definitions.
   * @param {Object} services - Services object shared across tenants.
   * @param {Object} options - Additional server options (e.g., custom routes, CORS).
   */
  async initialize(config, tenants = [], services = {}, options = {}) {
    // Validate and store config
    this.#config = this.configValidation(config);

    // Store shared inputs for use across init methods
    this.#tenants = tenants;
    this.#services = services;
    this.#options = options;

    // Sequentially initialize all parts of the server
    await this.initSecurity();
    await this.initSession();
    await this.initRateLimit();
    await this.initLogger();
    await this.initTenantManager();
    await this.initMiddlewares();
    await this.initHealthCheck();
    await this.initCustomRoutes();
    await this.initVersionedRoutes();
    await this.init404Error();
    await this.initErrorHandler();
    await this.initShutdown();
  }

  /**
   * Initializes core security middleware (CORS, HPP, Helmet, JSON body limits).
   */
  async initSecurity() {
    this.app.set("trust proxy", 1);
    const limit = this.#config.body_limit || "10kb";

    this.app.use(express.json({ limit }));
    this.app.use(express.urlencoded({ extended: true, limit }));
    this.app.use(helmet());
    this.app.use(hpp());
    this.app.use(cors(this.#options.cors || {}));
  }

  /**
   * Configures session middleware using the secret from configuration.
   */
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

  /**
   * Initializes rate limiting based on the configuration values.
   */
  async initRateLimit() {
    const limiter = rateLimit({
      windowMs: this.#config.rate_limit_minutes * 60 * 1000,
      max: this.#config.rate_limit_requests,
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);
  }

  /**
   * Adds logging middleware based on the current environment.
   */
  async initLogger() {
    if (system.isDebugging) {
      this.app.use(morgan("debug"));
    } else if (system.isDevelopment) {
      this.app.use(morgan("dev"));
    }
  }

  /**
   * Initializes the tenant manager with tenants and services.
   */
  async initTenantManager() {
    await this.#tenantManager.initialize(
      this.tenants,
      this.services,
      this.options
    );
  }

  /**
   * Hook for subclasses to define additional middlewares.
   * Override in subclasses.
   */
  async initMiddlewares() {}

  /**
   * Hook for subclasses to define health check routes.
   * Override in subclasses.
   */
  async initHealthCheck() {}

  /**
   * Hook for subclasses to define custom (non-versioned) routes.
   * Override in subclasses.
   */
  async initCustomRoutes() {}

  /**
   * Hook for subclasses to define versioned API routes (e.g., `/api/v1`).
   * Override in subclasses.
   */
  async initVersionedRoutes() {}

  /**
   * Hook for subclasses to handle 404 (not found) errors.
   * Override in subclasses.
   */
  async init404Error() {}

  /**
   * Hook for subclasses to register centralized error handling.
   * Override in subclasses.
   */
  async initErrorHandler() {}

  /**
   * Sets up graceful shutdown on process exit signals.
   */
  async initShutdown() {
    const shutdown = () => {
      system.log.info?.("Shutting down gracefully...");
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  }

  /**
   * Returns the schema definition used to validate the configuration.
   * Can be overridden by subclasses.
   * @returns {Object} schema definition object
   */
  configSchema() {
    return {
      port: integer({ min: 1, max: 65000, required: true }),
      db_url: string({ minLength: 1, maxLength: 255, required: true }),
      log_collection_name: string({
        minLength: 1,
        maxLength: 255,
        required: true,
      }),
      log_expiration_days: integer({ min: 1, max: 365 }),
      log_capped: boolean(),
      log_max_size: integer({ min: 0, max: 1000 }),
      log_max_docs: integer({ min: 0, max: 1000000 }),
      rate_limit_minutes: integer({ min: 1, max: 3600, required: true }),
      rate_limit_requests: integer({ min: 1, max: 10000, required: true }),
      body_limit: string({ min: 1, max: 255 }),
      session_secret: string({ minLength: 16, maxLength: 256, required: true }),
    };
  }

  /**
   * Validates and returns the cleaned configuration.
   * Logs and exits if validation fails.
   * @param {Object} config - Raw configuration object
   * @returns {Object} Validated configuration
   */
  configValidation(config) {
    const schema = new Schema(this.configSchema());
    const { validated, errors } = schema.validate(config);

    if (errors.length === 0) {
      return validated;
    } else {
      const message = errors.map(err => err.message).join(", ");
      system.fatal("configValidation", message);
    }
  }
}

module.exports = BaseServer;
