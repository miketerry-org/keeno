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

/**
 * BaseServer provides a secure, extensible foundation for building
 * multi-tenant Express.js applications.
 */
class BaseServer {
  #expressConfig;
  #tenantConfigs;
  #express;
  #tenants;
  #routes;
  #closeStack;

  /**
   * @param {Object} expressConfig - Configuration object for the Express server.
   * @param {Array<Object>} tenantConfigs - Array of tenant configuration objects.
   */
  constructor(expressConfig, tenantConfigs) {
    this.#expressConfig = expressConfig;
    this.#tenantConfigs = tenantConfigs;
    this.#routes = [];
    this.#closeStack = [];
    this.initExpress();
    this.initTenants();
  }

  /**
   * Registers a service at the server and/or tenant level.
   * @param {string} name - Property name to assign the service to.
   * @param {Function} createFunc - Async function that returns the service instance.
   * @param {Function} [closeFunc] - Optional function to call on shutdown.
   * @param {"server"|"tenants"|"both"} apply - Where the service should be applied.
   * @returns {Promise<void>}
   */
  async service(name, createFunc, closeFunc, apply) {
    apply = apply?.trim().toLowerCase();
    if (!["server", "tenants", "both"].includes(apply)) {
      throw new Error(
        `"apply" parameter must be "server", "tenants" or "both" but was "${apply}"`
      );
    }

    if (typeof createFunc !== "function") {
      throw new Error(
        `"createFunc" must be a function but got ${typeof createFunc}`
      );
    }

    const doCreate = async (owner, config) => {
      if (owner[name]) {
        const label = owner === this ? "server" : `Tenant "${config.domain}"`;
        throw new Error(`${label} already has property "${name}"`);
      }

      const instance = await createFunc(config);
      if (typeof closeFunc === "function") {
        this.#closeStack.unshift({ instance, closeFunc });
      }
      owner[name] = instance;
    };

    if (apply === "server" || apply === "both") {
      await doCreate(this, this.#expressConfig);
    }

    if (apply === "tenants" || apply === "both") {
      await Promise.all(this.#tenants.map(t => doCreate(t, t.config)));
    }
  }

  /**
   * Registers a model for each tenant.
   * @param {string} name - The name of the model.
   * @param {Function} modelClass - Constructor/class function for the model.
   * @returns {Promise<void>}
   */
  async model(name, modelClass) {
    if (typeof modelClass !== "function") {
      throw new Error(
        `Model "${name}" must be a class or constructor function`
      );
    }

    for (const tenant of this.#tenants) {
      if (tenant.models[name]) {
        throw new Error(
          `Duplicate model "${name}" for tenant "${tenant.domain}"`
        );
      }

      const instance = new modelClass(tenant);
      tenant.models[name] = instance;

      if (typeof instance.close === "function") {
        this.#closeStack.unshift({ instance, closeFunc: instance.close });
      }
    }
  }

  /**
   * Mounts a BaseRouter at the given lead path and registers its routes.
   * @param {string} leadPath - The base path to mount the router on (e.g. "/api").
   * @param {BaseRouter} routerInstance - An instance of a subclass of BaseRouter.
   */
  router(leadPath, routerInstance) {
    const expressRouter = express.Router();
    const routes = routerInstance.getRoutes();

    for (const { method, path, handler } of routes) {
      const lowerMethod = method.toLowerCase();

      if (typeof expressRouter[lowerMethod] !== "function") {
        throw new Error(`Unsupported HTTP method "${method}"`);
      }

      expressRouter[lowerMethod](path, handler);

      // Save the route for introspection/logging
      this.#routes.push({
        method,
        path: leadPath + path,
        handler,
      });
    }

    this.#express.use(leadPath, expressRouter);
  }

  /**
   * Registers a global middleware.
   * @param {Function} handlerFunc - Middleware function.
   */
  middleware(handlerFunc) {
    this.#express.use(handlerFunc);
  }

  /**
   * Starts the Express server.
   * @param {Function} callback - Callback executed once server starts.
   */
  listen(callback) {
    // add this route handler here so they are the last ones defined before server goes live
    this.init404Error();
    this.initErrorHandler();

    // stsrt the server listenting for requests
    this.#express.listen(this.#expressConfig.port, callback);
  }

  /**
   * @returns {import("express").Express} The Express app instance.
   */
  get express() {
    return this.#express;
  }

  /**
   * @returns {Array<Object>} Array of tenant objects.
   */
  get tenants() {
    return this.#tenants;
  }

  get routes() {
    return this.#routes;
  }

  /**
   * Initializes the Express app and base middleware stack.
   */
  initExpress() {
    this.#express = express();
    this.initSecurity();
    this.initSession();
    this.initRateLimit();
    this.initRequestLogger();
    this.initShutdown();
  }

  /**
   * Initializes tenant configuration and matching middleware.
   */
  initTenants() {
    this.#tenants = [];
    for (const config of this.#tenantConfigs) {
      this.#tenants.push({
        id: config.id,
        node: config.node,
        domain: config.domain.toLowerCase().trim(),
        config,
        models: {},
      });
    }

    this.#express.use((req, res, next) => {
      const hostname = req.hostname.toLowerCase().trim();
      const tenant = this.#tenants.find(t => t.domain === hostname);
      if (!tenant) {
        return this.send404Error(hostname, res);
      }

      req.tenant = tenant;
      req.routes = this.routes;
      next();
    });
  }

  /**
   * Configures security-related middleware.
   */
  initSecurity() {
    this.#express.set("trust proxy", 1);
    const limit = this.#expressConfig.body_limit || "10kb";
    this.#express.use(express.json({ limit }));
    this.#express.use(express.urlencoded({ extended: true, limit }));
    this.#express.use(helmet());
    this.#express.use(hpp());
    this.#express.use(cors({}));
  }

  /**
   * Configures session management middleware.
   */
  initSession() {
    const sessionOptions = {
      secret: this.#expressConfig.session_secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: !system.isDevelopment,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 2,
      },
    };
    this.#express.use(session(sessionOptions));
  }

  /**
   * Configures rate limiting middleware.
   */
  initRateLimit() {
    const limiter = rateLimit({
      windowMs: this.#expressConfig.rate_limit_minutes * 60 * 1000,
      max: this.#expressConfig.rate_limit_requests,
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.#express.use(limiter);
  }

  /**
   * Configures simple request logging.
   */
  initRequestLogger() {
    console.log("initRequestLogger");
    this.#express.use((req, res, next) => {
      console.info("[request]");
      console.info(`${req.method} ${req.url}`);
      next();
    });
  }

  /**
   * Handles graceful server shutdown on exit signals.
   */
  initShutdown() {
    const shutdown = async () => {
      console.log("BaseServer: Shutdown initiated...");

      for (const { instance, closeFunc } of this.#closeStack) {
        try {
          console.log(
            `BaseServer: Closing service ${
              instance.constructor.name || "[anonymous]"
            }`
          );
          await closeFunc.call(instance);
        } catch (err) {
          console.warn(
            `BaseServer: Error while closing ${
              instance.constructor.name || "[anonymous]"
            }:`,
            err
          );
        }
      }

      console.log("BaseServer: Shutdown complete. Exiting.");
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    process.on("unhandledRejection", reason => {
      console.error("BaseServer: Unhandled Rejection:", reason);
    });

    process.on("uncaughtException", err => {
      console.error("BaseServer: Uncaught Exception:", err);
    });
  }

  /**
   * Sends a 404 error for unknown tenants.
   * @param {string} hostname - Hostname requested.
   * @param {import("express").Response} res - Express response.
   */
  send404Error(hostname, res) {
    res.status(404).json({
      error: "Tenant not found",
      domain: hostname,
    });
  }

  /**
   * Stub to be implemented in subclass.
   */
  init404Error() {
    this.notImplemented("init404Error");
  }

  /**
   * Stub to be implemented in subclass.
   */
  initErrorHandler() {
    this.notImplemented("initErrorHandler");
  }

  /**
   * Throws an error for any abstract method that was not implemented.
   * @param {string} methodName - Name of the method.
   */
  notImplemented(methodName) {
    throw new Error(
      `The "${methodName}" method must be overridden by a descendant class`
    );
  }
}

module.exports = BaseServer;
