// homeRouter.js:

"use strict";

const { BaseRouter } = require("keeno-base");

class HomeRouter extends BaseRouter {
  define() {
    // GET /
    this.get("/", (req, res) => {
      res.render("home", {});
    });
  }
}

module.exports = HomeRouter;
