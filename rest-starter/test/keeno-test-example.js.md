const request = require("./your-request-lib");
const context = {};

// Login and capture session cookie
await request("http://local.mars", context)
  .post("/login")
  .send({ username: "donald", password: "duck123" })
  .expectStatus(200)
  .saveCookieFromResponse("connect.sid") // <- cookie name from express-session
  .run();

// Authenticated request with session cookie
await request("http://local.mars", context)
  .post("/api/notes")
  .sendCookieFromContext()
  .send({ title: "Session Test", body: "Testing session auth." })
  .expectStatus(201)
  .run();
