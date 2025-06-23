// api-system-routes.test.js:

"use strict";

// load all necessary modules
const { request, describe, it, assert } = require("keeno-test");

// rest api url
const url = "http://local.mars:3000/api/system";

// data shared between api requests
let context = {};

(async () => {
  describe("/health check", async () => {
    await it("should be OK", async () => {
      await request(url, context)
        .get("/health")
        .expectStatus(200)
        .expectHeader("Content-Type", "application/json", false)
        .expectBodyField("ok", true)
        .run(false);
    });
  });

  describe("/info", async () => {
    await it("should be OK", async () => {
      await request(url, context)
        .get("/info")
        .expectStatus(200)
        .expectHeader("Content-Type", "application/json", false)
        .expectBodyField("ok", true)
        .run(false);
    });
  });

  describe("/timestamp", async () => {
    await it("should be OK", async () => {
      await request(url, context)
        .get("/timestamp")
        .expectStatus(200)
        .expectHeader("Content-Type", "application/json", false)
        .expectBodyField("ok", true)
        .run(false);
    });
  });

  describe("/routes", async () => {
    await it("should be OK", async () => {
      await request(url, context)
        .get("/routes")
        .expectStatus(200)
        .expectHeader("Content-Type", "application/json", false)
        .expectBodyField("ok", true)
        .run(false);
    });
  });
})();
