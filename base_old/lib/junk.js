
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

  async initialize() {
    await this.initSecurity();
    await this.initSession();
    await this.initRateLimit();
    await this.initLogger();
    await.initMiddlewares();
    await this.initHealthCheck();
    await this.initDebugRoute();
    await this.init404Error();
    await this.initErrorHandler();
    await this.initShutdown();
  }

  async initSecurity() {
    this.express.set("trust proxy", 1);
    const limit = this.#config.body_limit || "10kb";

    this.express.use(express.json({ limit }));
    this.express.use(express.urlencoded({ extended: true, limit }));
    this.express.use(helmet());
    this.express.use(hpp());
    this.express.use(cors(this.#options.cors || {}));
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
        maxAge: 1000 * 60 * 60 * 2,
      },
    };
    this.express.use(session(sessionOptions));
  }

  async initRateLimit() {
    const limiter = rateLimit({
      windowMs: this.#config.rate_limit_minutes * 60 * 1000,
      max: this.#config.rate_limit_requests,
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.express.use(limiter);
  }

  async initLogger() {
    if (system.isDebugging) {
      this.express.use(morgan("debug"));
    } else if (system.isDevelopment) {
      this.express.use(morgan("dev"));
    }
  }

  async initTenantManager() {
    await this.#tenantManager.initialize(
      this.tenants,
      this.services,
      this.options
    );
  }

  async initMiddlewares() {
    const middlewares = this.#options.middlewares || [];
    for (const middleware of middlewares) {
      if (typeof middleware === "function") {
        this.#app.use(middleware);
      } else {
        system.log.warn("Ignored invalid middleware (not a function).");
      }
    }
  }

  async initHealthCheck() {
    // Optional future implementation
  }

  async initRouters() {
    const routes = this.#options.routes || [];
    for (const { path, router } of routes) {
      console.info(`Mounting route at: ${path}`);
      this.express.use(path, router);
    }
  }

  async initDebugRoute() {
    if (!system.isDevelopment && !system.isDebugging) {
      return;
    }

    this.#app.get("/debug", (req, res) => {
      try {
        const debugInfo = getDebugInfo(this.#app, {
          tenants: this.#tenants,
          mode: system.envMode,
          models: this.#options.models,
        });

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Server Debug Info</title>
            <style>
              body { font-family: sans-serif; padding: 20px; background: #f9f9f9; }
              h1, h2 { color: #333; }
              ul { padding-left: 20px; }
              li { margin-bottom: 5px; }
              code { background: #eee; padding: 2px 4px; border-radius: 3px; }
            </style>
          </head>
          <body>
            <h1>Server Debug Information</h1>
            <h2>Mode</h2>
            <p><code>${debugInfo.mode}</code></p>

            <h2>Routes</h2>
            <ul>
              ${debugInfo.routes
                .map(r => `<li><code>${r.method}</code> ${r.path}</li>`)
                .join("")}
            </ul>

            <h2>Tenants</h2>
            <ul>
              ${debugInfo.tenants
                .map(
                  t => `
                <li>
                  <strong>${t.domain}</strong> (ID: ${t.id})<br/>
                  Mode: ${t.mode}<br/>
                  DB: <code>${t.db_url}</code>
                </li>
              `
                )
                .join("")}
            </ul>

            <h2>Models</h2>
            <ul>
              ${debugInfo.models
                .map(name => `<li><code>${name}</code></li>`)
                .join("")}
            </ul>
          </body>
          </html>
        `;
        res.send(html);
      } catch (err) {
        console.error("Error generating debug info:", err);
        res.status(500).send("Failed to generate debug information");
      }
    });
  }

  async init404Error() {
    this.#app.use((req, res) => {
      res.status(404).json({ success: false, error: "Not Found" });
    });
  }

  async initErrorHandler() {
    this.#app.use((err, req, res, next) => {
      console.error("Unhandled error:", err);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    });
  }

  async initShutdown() {
    const shutdown = () => {
      system.log.info("Shutting down gracefully...");
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
