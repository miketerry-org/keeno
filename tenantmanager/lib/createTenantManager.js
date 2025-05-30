// createTenantManager.js:

"use strict";

// Load required modules
const path = require.resolve("keeno-env");
console.log("path", path); // Full absolute path to the module file

const { loadEnvFiles } = require("keeno-env");
const createTenantServices = require("./createTenantServices");

/**
 * Creates a dynamic tenant manager from .env files or a provided array.
 *
 * @param {Object} options - Configuration options.
 * @param {string} [options.filemask] - Glob pattern to scan for tenant .env files.
 * @param {string} [options.key] - Decryption key for encrypted files.
 * @param {Object[]} [options.tenants] - Array of tenant configuration objects.
 * @param {Object} [options.services] - Services to initialize with tenants.
 * @param {boolean} [options.throwOnError=false] - Whether to throw on tenant service errors.
 * @param {Object} [options.schema] - Optional schema validation.
 * @returns {Promise<Object>} Tenant manager instance.
 */
async function createTenantManager(options = {}) {
  console.log("ctm1");
  const {
    filemask,
    key = "",
    tenants = null,
    services = null,
    throwOnError = false,
    schema = {},
  } = options;
  console.log("ctm2");

  console.log("filemask", filemask);

  let _tenants = [];

  // Load tenant configurations from .env files if filemask is provided
  if (filemask) {
    console.log("here1");
    console.log("loadEnvFiles", loadEnvFiles.name);
    _tenants = loadEnvFiles(filemask, key, schema, options);
    console.log("here2");
    console.log("here2");
  }
  // Otherwise use provided array of tenant objects
  else if (Array.isArray(tenants)) {
    _tenants = [...tenants];
  } else {
    throw new Error(
      `"Options" must either contain "a filemask" or "tenants" property`
    );
  }

  const _tenantMap = new Map();

  const manager = {
    /**
     * Template name to use when tenant is not found in view middleware.
     * @type {string}
     */
    tenantNotFoundTemplate: "tenant_not_found",

    /**
     * Number of tenants currently loaded.
     * @type {number}
     */
    get length() {
      return _tenants.length;
    },

    /**
     * Injects service instances into each tenant using provided factory functions.
     *
     * @param {Object<string, Function>} servicesObj - Keyed object of service factories.
     * @returns {Promise<void>}
     */
    async createServices(servicesObj = {}) {
      const enhanced = [];

      for (const tenant of _tenants) {
        try {
          const enriched = await createTenantServices(tenant, servicesObj);

          // Fallback logger if none provided
          if (!enriched.log) enriched.log = console;

          enhanced.push(enriched);

          // Map tenant by domain name (case-insensitive)
          if (typeof enriched.domain === "string") {
            _tenantMap.set(enriched.domain.toLowerCase(), enriched);
          }
        } catch (err) {
          const msg = `Failed to create services for tenant "${tenant.domain}": ${err.message}`;
          if (throwOnError) throw new Error(msg);
          console.error(msg);
        }
      }

      _tenants = enhanced;
    },

    /**
     * Get all loaded tenant objects.
     *
     * @returns {Object[]} Array of tenant objects.
     */
    getAll() {
      return [..._tenants];
    },

    /**
     * Find a tenant by its domain name.
     *
     * @param {string} name - The domain name to look for.
     * @returns {Object|undefined} - The matching tenant or undefined.
     */
    findByDomain(name) {
      if (!name) return undefined;
      return _tenantMap.get(name.toLowerCase());
    },

    /**
     * Add a new tenant to the manager. If services were provided at init,
     * the tenant will be enriched automatically.
     *
     * @param {Object} tenant - The tenant config object to add.
     * @returns {Promise<void>}
     */
    async add(tenant) {
      if (!tenant || typeof tenant !== "object") return;

      try {
        let enriched = tenant;

        // If services were defined at init, enrich this tenant too
        if (services && typeof services === "object") {
          enriched = await createTenantServices(tenant, services);
          if (!enriched.log) enriched.log = console;
        }

        _tenants.push(enriched);

        // Add to internal domain lookup map
        if (enriched.domain) {
          _tenantMap.set(enriched.domain.toLowerCase(), enriched);
        }
      } catch (err) {
        const msg = `Failed to add tenant "${tenant.domain}": ${err.message}`;
        if (throwOnError) throw new Error(msg);
        console.error(msg);
      }
    },

    /**
     * Express middleware for multi-tenant view/template rendering.
     * Injects the matching tenant into req.tenant or shows not-found view.
     *
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    viewMiddleware(req, res, next) {
      const tenant = manager.findByDomain(req.hostname);

      if (!tenant) {
        const data = { error: `Tenant "${req.hostname}" not found` };
        if (typeof res.render === "function") {
          res.status(404).render(manager.tenantNotFoundTemplate, data);
        } else {
          res.status(404).send(data.error);
        }
        return;
      }

      req.tenant = tenant;
      next();
    },

    /**
     * Express middleware for multi-tenant REST APIs.
     * Injects the matching tenant into req.tenant or returns 404 JSON.
     *
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    restMiddleware(req, res, next) {
      const tenant = manager.findByDomain(req.hostname);

      if (!tenant) {
        res.status(404).json({ error: `Tenant "${req.hostname}" not found` });
        return;
      }

      req.tenant = tenant;
      next();
    },
  };

  // If services were provided during init, enrich all current tenants
  if (services && typeof services === "object") {
    await manager.createServices(services);
  }

  return manager;
}

module.exports = createTenantManager;
