// auth-register.test.js:

// load all necessary modules
const request = require("keeno-request");

// rest api url
const url = "http://local.mars:3000";

// data shared between api requests
let context = {};

describe("post /auth/register", () => {
  it("should be 201", async () => {
    await request(url, context)
      .post("/api/auth/register")
      .send({})
      .expectStatus(200)
      .expectHeader("Content-Type", "application/json", false)
      .expectBodyField("status", "OK")
      // .expectBodyField("timestamp", undefined)
      .run(true);
  });
});
