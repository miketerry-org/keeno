// api-system-routes.test.js:

"use strict";

// load all necessary modules
const request = require("keeno-request");
const { test } = require("node:test");

// rest api url
const url = "http://local.mars:3000/api/system";

// data shared between api requests
let context = {};

(async () => {
  test("health check", async () => {
    await test("should be OK", async () => {
      await request(url, context)
        .get("/health")
        .expectStatus(200)
        .expectHeader("Content-Type", "application/json", false)
        .expectBodyField("ok", true)
        // .expectBodyField("timestamp", undefined)
        .run(true);
    });
  });
})();
