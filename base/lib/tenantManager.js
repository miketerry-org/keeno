"use strict";

// Load all necessary modules
const system = require("keeno-system");
const Schema = require("keeno-schema");
const createTenantServices = require("./createTenantServices");

// Destructure necessary data types
const { booleanType, emailType, enumType, integerType, stringType } =
  Schema.types;

//!!Mike this should be moved to keeno-system and support full and abbreviated names
const envModes = ["development", "testing", "production"];

/**
 * Manages multi-tenant initialization, lookup, and middleware support.
 */
class TenantManager {
  constructor() {
    this._tenants = [];
    this._tenantMap = new Map();
    this.tenantNotFoundTemplate = "tenant_not_found";
    this._services = null;
    this._throwOnError = false;
  }

  /**
   * Returns the number of tenants currently registered.
   * @returns {number}
   */
  get length() {
    return this._tenants.length;
  }

  /**
   * Initializes the tenant manager with tenants, shared services, and options.
   * @param {Object[]} tenants - Array of tenant configuration objects.
   * @param {Object} [services={}] - Services to be applied to all tenants.
   * @param {Object} [options={}] - Additional options like `throwOnError`.
   */
  async initialize(tenants = [], services = {}, options = {}) {
    this._services = services;
    this._throwOnError = options.throwOnError || false;

    // Clear any previous state
    this._tenants = [];
    this._tenantMap.clear();

    // Add tenants with the shared services object
    for (const tenant of tenants) {
      await this.add(tenant, services);
    }
  }

  /**
   * Applies new services to all tenants currently registered.
   * @param {Object} servicesObj - The services object to apply.
   */
  async createServices(servicesObj = {}) {
    const enrichedTenants = [];

    for (const tenant of this._tenants) {
      try {
        const enriched = await this._enrichTenant(tenant, servicesObj);
        enrichedTenants.push(enriched);
        this._cacheTenant(enriched);
      } catch (err) {
        const msg = `Failed to create services for tenant "${tenant.domain}": ${err.message}`;
        if (this._throwOnError) {
          throw new Error(msg);
        }
        console.error(msg);
      }
    }

    this._tenants = enrichedTenants;
  }

  /**
   * Returns a shallow copy of all registered tenants.
   * @returns {Object[]}
   */
  getAll() {
    return [...this._tenants];
  }

  /**
   * Finds a tenant by its domain name.
   * @param {string} domain - The domain to search for.
   * @returns {Object|undefined}
   */
  findByDomain(domain) {
    // Check input validity
    if (!domain) {
      return undefined;
    }

    return this._tenantMap.get(domain.toLowerCase());
  }

  /**
   * Adds a single tenant to the manager, enriching it with services.
   * Can override global services per tenant.
   * @param {Object} tenant - A tenant configuration object.
   * @param {Object} [services=this._services] - Optional services specific to this tenant.
   */
  async add(tenant, services = this._services) {
    // Validate input type
    if (!tenant || typeof tenant !== "object") {
      return;
    }

    // Validate tenant schema
    const { validated, errors } = this.validate(tenant);
    if (errors && errors.length > 0) {
      const message = errors.map(err => err.message).join(", ");
      system.fatal(
        `Invalid tenant configuration, (${tenant.domain}) ${message}`
      );
    }

    try {
      const enriched = services
        ? await this._enrichTenant(validated, services)
        : validated;
      this._tenants.push(enriched);
      this._cacheTenant(enriched);
    } catch (err) {
      const msg = `Failed to add tenant "${tenant.domain}": ${err.message}`;
      if (this._throwOnError) {
        throw new Error(msg);
      }
      console.error(msg);
    }
  }

  /**
   * Returns a validation schema definition for tenant config.
   * Subclasses may override or extend this.
   */
  schemaDefinition() {
    return {
      id: integerType({ min: 1, max: 100000, required: true }),
      node: integerType({ min: 1, max: 1000, required: true }),
      mode: enumType({ values: envModes, required: true }),
      domain: stringType({ min: 1, max: 255, required: true }),
      db_url: stringType({ min: 1, max: 255, required: true }),
      log_collection_name: stringType({ min: 1, max: 255, required: true }),
      log_expiration_days: integerType({ min: 1, max: 365, required: true }),
      log_capped: booleanType({ required: true }),
      log_max_size: integerType({ min: 0, max: 1000, required: true }),
      log_max_docs: integerType({ min: 0, max: 1000000, required: true }),
      site_title: stringType({ min: 1, max: 255, required: true }),
      site_slogan: stringType({ min: 1, max: 255, required: true }),
      site_owner: stringType({ min: 1, max: 255, required: true }),
      site_author: stringType({ min: 1, max: 255, required: true }),
      site_copyright: integerType({ min: 2025, required: true }),
      site_support_email: emailType({ min: 1, max: 255, required: true }),
      site_support_url: stringType({ min: 1, max: 255, required: true }),
    };
  }

  /**
   * Validates a tenant config using the defined schema.
   * @param {Object} tenant - The tenant config object.
   * @returns {{ validated: Object, errors: Array }}
   */
  validate(tenant) {
    return new Schema(this.schemaDefinition()).validate(tenant);
  }

  /**
   * Express middleware for view-based routes. Attaches tenant to `req.tenant`.
   * Sends 404 or 500 view if tenant is not found or misconfigured.
   */
  viewMiddleware(req, res, next) {
    const tenant = this.findByDomain(req.hostname);

    // Handle not found
    if (!tenant) {
      return this._handleMissingTenant(
        res,
        "view",
        404,
        `Tenant "${req.hostname}" not found`
      );
    }

    // Handle misconfigured (no DB)
    if (!tenant.db) {
      return this._handleMissingTenant(
        res,
        "view",
        500,
        `Tenant "${tenant.domain}" is misconfigured (missing database)`
      );
    }

    req.tenant = tenant;
    next();
  }

  /**
   * Express middleware for API routes. Attaches tenant to `req.tenant`.
   * Sends 404 or 500 JSON if tenant is not found or misconfigured.
   */
  restMiddleware(req, res, next) {
    const tenant = this.findByDomain(req.hostname);

    // Handle not found
    if (!tenant) {
      return this._handleMissingTenant(
        res,
        "json",
        404,
        `Tenant "${req.hostname}" not found`
      );
    }

    // Handle misconfigured (no DB)
    if (!tenant.db) {
      return this._handleMissingTenant(
        res,
        "json",
        500,
        `Tenant "${tenant.domain}" is misconfigured (missing database)`
      );
    }

    req.tenant = tenant;
    next();
  }

  /**
   * Internal helper: enriches a tenant with services and validates required properties.
   * @private
   * @param {Object} tenant - Raw tenant configuration object.
   * @param {Object} services - Services to apply to the tenant.
   * @returns {Promise<Object>} - The enriched tenant.
   */
  async _enrichTenant(tenant, services) {
    const enriched = await createTenantServices(tenant, services);

    if (!enriched.log) {
      enriched.log = console;
    }

    if (!enriched.db) {
      throw new Error(
        `Tenant "${tenant.domain}" did not initialize a database connection`
      );
    }

    return enriched;
  }

  /**
   * Internal helper: caches the tenant using its domain (lowercased) as the key.
   * @private
   * @param {Object} tenant - Enriched tenant with a `.domain` property.
   */
  _cacheTenant(tenant) {
    if (tenant.domain && typeof tenant.domain === "string") {
      this._tenantMap.set(tenant.domain.toLowerCase(), tenant);
    }
  }

  /**
   * Internal helper: handles rendering or JSON error response depending on context.
   * @private
   * @param {Object} res - Express response object.
   * @param {"view"|"json"} type - Response type to send.
   * @param {number} status - HTTP status code.
   * @param {string} message - Error message.
   */
  _handleMissingTenant(res, type, status, message) {
    if (type === "view" && typeof res.render === "function") {
      return res
        .status(status)
        .render(this.tenantNotFoundTemplate, { error: message });
    }

    if (type === "json") {
      return res.status(status).json({ error: message });
    }

    return res.status(status).send(message);
  }
}

module.exports = TenantManager;
