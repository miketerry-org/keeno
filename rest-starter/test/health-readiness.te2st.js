// health-readiness.test.js:

// load all necessary modules
const request = require("keeno-request");

// rest api url
const url = "http://local.mars:3000";

// data shared between api requests
let context = {};

describe("get /health", () => {
  it("should be 200", async () => {
    await request(url, context)
      .get("/health")
      .expectStatus(200)
      .expectHeader("Content-Type", "application/json", false)
      .expectBodyField("status", "OK")
      .expectBodyField("timestamp", undefined)
      .run(false);
  });
});

describe("get /readiness", () => {
  it("should be 200", async () => {
    await request(url, context)
      .get("/readiness")
      .expectStatus(200)
      .expectHeader("Content-Type", "application/json", false)
      .expectBodyField("status", "READY")
      .expectBodyField("tenantCount", 3)
      .expectBodyField("timestamp", undefined)
      .run(false);
  });
});
