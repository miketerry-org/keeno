// baseModel.js:

"use strict";

class BaseModel {
  #tenant;
  #db;
  #name;

  constructor(tenant, name) {
    if (!tenant) {
      throw new Error(`"tenant" parameter is missing`);
    }
    if (!tenant.db) {
      throw new Error(
        `Tenant "${tenant.site_title}" is missing "db" connection`
      );
      if (!name || name.trim() !== "") {
        throw new Error(`Tenant "${tenant.site_title}" is missing model name`);
      }
    }

    this.#tenant = tenant;
    this.#db = tenant.db;
    this.#name = name;
  }

  get tenant() {
    return this.#tenant;
  }

  get db() {
    return this.#db;
  }

  get name() {
    return this.#name;
  }

  // Abstract interface
  async find(query = {}, projection = {}) {
    throw new Error("find() not implemented");
  }

  async findOne(query = {}) {
    throw new Error("findOne() not implemented");
  }

  async findById(id) {
    throw new Error("findById() not implemented");
  }

  async create(data) {
    throw new Error("create() not implemented");
  }

  async updateById(id, updates) {
    throw new Error("updateById() not implemented");
  }

  async deleteById(id) {
    throw new Error("deleteById() not implemented");
  }
}

module.exports = BaseModel;
