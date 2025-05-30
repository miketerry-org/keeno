#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const createPackageFile = require("./lib/utils/createPackageFile");
const runCommand = require("./lib/utils/runCommand");

(async () => {
  try {
    createPackageFile();

    const packages =
      "multitenant-config multitenant-express multitenant-mongodb multitenant-nodemailer";
    runCommand(`npm install ${packages}`);
  } catch (err) {
    // ✅ Cleanly handle Ctrl+C or any other error
    console.error("❌", err.message);
    process.exit(1);
  }
})();
