// tenantManager.js:

"use strict";

// load all necessary modules
const system = require("keeno-system");
const Schema = require("keeno-schema");
const createTenantServices = require("./createTenantServices");
const BaseModel = require("./baseModel");

const { booleanType, emailType, enumType, integerType, stringType } =
  Schema.types;

const envModes = ["development", "testing", "production"];

class TenantManager {
  constructor() {
    this._tenants = [];
    this._tenantMap = new Map();
    this.tenantNotFoundTemplate = "tenant_not_found";
    this._services = null;
    this._options = {};
    this._throwOnError = false;
  }

  get length() {
    return this._tenants.length;
  }

  async initialize(tenants = [], services = {}, options = {}) {
    this._services = services;
    this._options = options;
    this._throwOnError = options.throwOnError || false;

    this._tenants = [];
    this._tenantMap.clear();

    for (const tenant of tenants) {
      await this.add(tenant, services, options);
    }
  }

  async add(tenant, services = this._services, options = this._options) {
    if (!tenant || typeof tenant !== "object") {
      return;
    }

    const { validated, errors } = this.validate(tenant);
    if (errors && errors.length > 0) {
      const message = errors.map(err => err.message).join(", ");
      system.fatal(
        `Invalid tenant configuration, (${tenant.domain}) ${message}`
      );
    }

    try {
      const enriched = await this._enrichTenant(validated, services);
      this._tenants.push(enriched);
      this._cacheTenant(enriched);
    } catch (err) {
      const msg = `Failed to add tenant "${tenant.domain}": ${err.message}`;
      if (this._throwOnError) throw new Error(msg);
      console.error(msg);
    }
  }

  async createServices(servicesObj = {}) {
    const enrichedTenants = [];

    for (const tenant of this._tenants) {
      try {
        const enriched = await this._enrichTenant(tenant, servicesObj);
        enrichedTenants.push(enriched);
        this._cacheTenant(enriched);
      } catch (err) {
        const msg = `Failed to create services for tenant "${tenant.domain}": ${err.message}`;
        if (this._throwOnError) throw new Error(msg);
        console.error(msg);
      }
    }

    this._tenants = enrichedTenants;
  }

  getAll() {
    return [...this._tenants];
  }

  findByDomain(domain) {
    if (!domain) {
      return undefined;
    }
    return this._tenantMap.get(domain.toLowerCase());
  }

  viewMiddleware(req, res, next) {
    const tenant = this.findByDomain(req.hostname);
    if (!tenant) {
      return this._handleMissingTenant(
        res,
        "view",
        404,
        `Tenant "${req.hostname}" not found`
      );
    }
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

  restMiddleware(req, res, next) {
    const tenant = this.findByDomain(req.hostname);
    if (!tenant) {
      return this._handleMissingTenant(
        res,
        "json",
        404,
        `Tenant "${req.hostname}" not found`
      );
    }
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

  validate(tenant) {
    return new Schema(this.schemaDefinition()).validate(tenant);
  }

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

  async _enrichTenant(tenant, services) {
    const enriched = await createTenantServices(tenant, services);

    if (!enriched.log) enriched.log = console;
    if (!enriched.db) {
      throw new Error(
        `Tenant "${tenant.domain}" did not initialize a database connection`
      );
    }

    // Initialize and bind models
    if (Array.isArray(this._options.models)) {
      const modelMap = new Map();

      for (const ModelClass of this._options.models) {
        if (typeof ModelClass !== "function") {
          throw new Error(`Invalid model class in models array`);
        }

        const instance = new ModelClass(enriched);

        if (!(instance instanceof BaseModel)) {
          throw new Error(`${ModelClass.name} must extend BaseModel`);
        }

        const name = instance.name;
        if (!name || typeof name !== "string") {
          throw new Error(`Model "${ModelClass.name}" returned invalid name`);
        }

        modelMap.set(name, instance);
      }

      enriched.models = function getModel(name) {
        if (!modelMap.has(name)) {
          throw new Error(
            `Model "${name}" is not registered for tenant "${enriched.domain}"`
          );
        }
        return modelMap.get(name);
      };
    }

    return enriched;
  }

  _cacheTenant(tenant) {
    if (tenant.domain && typeof tenant.domain === "string") {
      this._tenantMap.set(tenant.domain.toLowerCase(), tenant);
    }
  }

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
