// createPackageFile.js:

"use strict";

// load all necessary modules
const fs = require("fs");
const path = require("path");

function createPackageFile() {
  // get fully qualified package  filename
  const filename = path.join(process.cwd(), "package.json");

  // if the package.json file does not exist
  if (!fs.existsSync(filename)) {
    let data = {};
    data.name = path.basename(process.cwd());
    data.version = "1.0.0";
    data.description = "";
    data.main = "index.js";
    data.scripts = {};
    data.scripts.dev = `NODE_ENV=dev node ${data.main}`;
    data.scripts.test = "just --bail";
    data.repository = {};
    data.repository.type = "git";
    data.repository.url = "";
    data.keywords = [];
    data.author = "";
    data.license = "MIT";
    data.bugs = {};
    data.bugs.url = "";
    data.homePage = "";
    data.dependencies = {};
    data.devDependencies = {};

    // pretty formatthe output and write to file
    fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf-8");
    console.info(`Wrote "package.json" configuration file.`);
  }

  return null;
}

module.exports = createPackageFile;
