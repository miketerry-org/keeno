// createTenantServices.js

"use strict";

/**
 * Initializes services (e.g., db, log) for a given tenant object.
 * Each service factory in the `services` object will be called
 * with the tenant and attached directly to the tenant object.
 *
 * @param {object} tenant - The tenant to enrich.
 * @param {object} services - An object of service factories (functions).
 * @returns {Promise<object>} - The enriched tenant object.
 */
async function createTenantServices(tenant, services = {}) {
  for (const key of Object.keys(services)) {
    const createService = services[key];

    if (!createService || typeof createService !== "function") {
      continue;
    }

    if (tenant[key]) {
      throw new Error(`Service "${key}" already exists on tenant.`);
    }

    // Create and attach the service
    const service = await createService(tenant);
    tenant[key] = service;
  }

  return tenant;
}

module.exports = createTenantServices;
