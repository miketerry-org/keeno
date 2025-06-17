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
const { create } = require("handlebars");

class BaseServer {
  #expressConfig;
  #tenantConfigs;
  #express;
  #tenants;
  #closeStack;

  constructor(expressConfig, tenantConfigs) {
    // remember the express and tenant configurations
    this.#expressConfig = expressConfig;
    this.#tenantConfigs = tenantConfigs;

    // initialize the service close stack
    this.#closeStack = [];

    // call methods to initialize express and tenants
    this.initExpress();
    this.initTenants();
  }

  async service(name, createFunc, closeFunc, apply) {
    // Normalize apply value
    apply = apply?.trim().toLowerCase();

    // Nested helper to create and assign service
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

    // Server-level service
    if (apply === "server" || apply === "both") {
      await doCreate(this, this.#expressConfig);
    }

    // Tenant-level service
    if (apply === "tenants" || apply === "both") {
      for (const tenant of this.#tenants) {
        await doCreate(tenant, tenant.config);
      }
    }

    return this;
  }

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

    return this;
  }

  router(leadPath, routerInstance) {
    this.#express.use(leadPath, routerInstance);
    return this;
  }

  middleware(handlerFunc) {
    this.#express.use(handlerFunc);
    return this;
  }

  get express() {
    return this.#express;
  }

  get tenants() {
    return this.#tenants;
  }

  initExpress() {
    this.#express = express();
    this.initSecurity();
    this.initSession();
    this.initRateLimit();
    this.initRequestLogger();
    this.initHealthCheck();
    this.init404Error();
    this.initErrorHandler();
    this.initShutdown();
  }

  initTenants() {
    // create array of tenants
    this.#tenants = [];
    this.#tenantConfigs.forEach(config => {
      this.#tenants.push({
        id: config.id,
        node: config.node,
        domain: config.domain.toLowerCase().trim(),
        config,
        models: {},
      });
    });

    // middleware to resolve tenant based on request hostname
    this.#express.use((req, res, next) => {
      const hostname = req.hostname.toLowerCase().trim();

      const tenant = this.#tenants.find(t => t.domain === hostname);

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          domain: hostname,
        });
      }

      req.tenant = tenant;
      next();
    });
  }

  initSecurity() {
    this.#express.set("trust proxy", 1);
    const limit = this.#expressConfig.body_limit || "10kb";

    this.#express.use(express.json({ limit }));
    this.#express.use(express.urlencoded({ extended: true, limit }));
    this.#express.use(helmet());
    this.#express.use(hpp());
    this.#express.use(cors({}));
  }

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
    this.express.use(session(sessionOptions));
  }

  initRateLimit() {
    const limiter = rateLimit({
      windowMs: this.#expressConfig.rate_limit_minutes * 60 * 1000,
      max: this.#expressConfig.rate_limit_requests,
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.express.use(limiter);
  }

  initRequestLogger() {
    if (system.isDebugging) {
      this.express.use(morgan("debug"));
    } else if (system.isDevelopment) {
      this.express.use(morgan("dev"));
    }
  }

  initHealthCheck() {
    throw new Error("InitHealthCheck not implemented");
  }

  init404Error() {
    throw new Error("init404Error not implemented");
  }

  initErrorHandler() {
    throw new Error("initErrorHandler not implemented");
  }

  initShutdown() {
    throw new Error("initShutDown not implemented");
  }
}

module.exports = BaseServer;
