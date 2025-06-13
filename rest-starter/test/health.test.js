const request = require("keeno-test");

const url = "http://local.mars:3000";

// data shared between api requests
let context = {};

describe("get /health", () => {
  it("should be 200", async () => {
    await request(url, context)
      .get("/health")
      .expectStatus(200)
      .expectHeader("Content-Type", "application/json")
      .expectBodyField("message", undefined)
      .run();
  });
});
