// schema.test.js:

"use strict";

// load all necessary modules
const assert = require("assert");
const { describe, it } = require("node:test");
const Schema = require("../index.js");
const { data, dataSchema } = require("./data.js");

describe("test1", () => {
  it("test1.it1", () => {
    console.debug("hello");
    assert.strictEqual(true, true);
  });
});
