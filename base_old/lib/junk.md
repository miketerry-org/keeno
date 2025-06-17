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
    await this.initDebugRoute();
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
maxAge: 1000 _ 60 _ 60 \* 2,
},
};
this.app.use(session(sessionOptions));
}

async initRateLimit() {
const limiter = rateLimit({
windowMs: this.#config.rate_limit_minutes _ 60 _ 1000,
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
this.app.use(path, router);
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
