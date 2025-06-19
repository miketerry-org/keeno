// index.js: keeno-nodemailer

"use strict";

// load all necessary modules
const createEmailer = require("./lib/createEmailer");
const closeEmailer = require("./lib/closeEmailer");

module.exports = { createEmailer, closeEmailer };
