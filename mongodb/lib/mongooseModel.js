// mongooseModel.js

"use strict";

const { DataModel } = require("keeno-rest");

class MongooseModel extends DataModel {
  #model;

  constructor(tenant, name, schema) {
    super(tenant);
    this.#model = tenant.db.models[name] || tenant.db.model(name, schema);
  }

  get model() {
    return this.#model;
  }

  async find(query = {}, projection = {}) {
    return this.#model.find(query, projection).exec();
  }

  async findOne(query = {}) {
    return this.#model.findOne(query).exec();
  }

  async findById(id) {
    return this.#model.findById(id).exec();
  }

  async create(data) {
    return this.#model.create(data);
  }

  async updateById(id, updates) {
    return this.#model.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async deleteById(id) {
    return this.#model.findByIdAndDelete(id).exec();
  }
}

module.exports = MongooseModel;
