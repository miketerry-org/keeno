// authRouter.js:
("use strict");

// Load required modules
const { BaseRouter } = require("keeno-base");
const registerUser = require("./helpers/registerUser");

class UserRouter extends BaseRouter {
  define() {
    this.post("/register", registerUser);
  }
}

module.exports = UserRouter;
