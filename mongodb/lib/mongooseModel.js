// mongooseModel.js:

"use strict";

const { BaseModel } = require("keeno-base");

/**
 * A base model for Mongoose documents integrated with tenant-aware databases.
 * Wraps core Mongoose operations (CRUD) in a consistent API.
 *
 * @class
 * @extends BaseModel
 */
class MongooseModel extends BaseModel {
  /** @type {import('mongoose').Model} */
  #underlyingModel;

  /**
   * Constructs a new MongooseModel.
   *
   * @param {object} tenant - The tenant object containing the Mongoose `db` instance.
   * @param {string} name - The name of the model.
   * @param {import('mongoose').Schema} schema - The Mongoose schema to use for the model.
   */
  constructor(tenant, name, schema) {
    super(tenant, name);
    this.#underlyingModel =
      tenant.db.models[name] || tenant.db.model(name, schema);
  }

  /**
   * Returns the raw underlying Mongoose model.
   *
   * @returns {import('mongoose').Model}
   */
  get underlyingModel() {
    return this.#underlyingModel;
  }

  /**
   * Finds documents matching a query.
   *
   * @param {object} [query={}] - MongoDB query object.
   * @param {object} [projection={}] - Fields to include or exclude.
   * @returns {Promise<Array<object>>}
   */
  async find(query = {}, projection = {}) {
    return this.#underlyingModel.find(query, projection).exec();
  }

  /**
   * Finds a single document matching a query.
   *
   * @param {object} [query={}] - MongoDB query object.
   * @returns {Promise<object|null>}
   */
  async findOne(query = {}) {
    return this.#underlyingModel.findOne(query).exec();
  }

  /**
   * Finds a document by its ID.
   *
   * @param {string} id - The document ID.
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return this.#underlyingModel.findById(id).exec();
  }

  /**
   * Creates a new document.
   *
   * @param {object} data - The data to create the document with.
   * @returns {Promise<object>}
   */
  async create(data) {
    return this.#underlyingModel.create(data);
  }

  /**
   * Updates a document by its ID.
   *
   * @param {string} id - The document ID.
   * @param {object} updates - The update operations.
   * @returns {Promise<object|null>} - The updated document.
   */
  async updateById(id, updates) {
    return this.#underlyingModel
      .findByIdAndUpdate(id, updates, { new: true })
      .exec();
  }

  /**
   * Deletes a document by its ID.
   *
   * @param {string} id - The document ID.
   * @returns {Promise<object|null>} - The deleted document.
   */
  async deleteById(id) {
    return this.#underlyingModel.findByIdAndDelete(id).exec();
  }
}

module.exports = MongooseModel;
