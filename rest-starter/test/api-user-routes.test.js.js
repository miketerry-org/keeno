// api-user-routes.test.js:

"use strict";

// load all necessary modules
const { request, describe, it, assert } = require("keeno-test");

// rest api url
const url = "http://local.mars:3000/api/user";

// data shared between api requests
let context = {};

(async () => {
  describe("post /register", async () => {
    it("should be ok", async () => {
      const data = {
        email: "support@miketerry.org",
        email2: "support@miketerry.com",
        password: "abcdef-012345",
        password2: "ABCDEF-012345",
        firstname: "Mike",
        lastname: "Terry",
      };

      await request(url, context)
        .post("/register", data)
        .expectStatus(201)
        .expectHeader("Content-Type", "application/json", false)
        .expectBodyField("ok", true)
        .run(false);
    });
  });
})();
