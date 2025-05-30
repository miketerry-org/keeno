// createTenantServices.js

"use strict";

const createReadOnlyObject = require("./createReadOnlyObject");

async function createTenantServices(tenant, services = {}) {
  for (const key of Object.keys(services)) {
    const createService = services[key];

    if (!createService || typeof createService !== "function") {
      continue;
    }

    if (tenant[key]) {
      throw new Error(`Service "${key}" already exists on tenant.`);
    }

    // invoke the service creation
    const service = await createService(tenant);

    // assign the initialized service to the tenant
    tenant[key] = service;
  }

  // return a read only version of the tenant object
  return createReadOnlyObject(tenant);
}

module.exports = createTenantServices;
