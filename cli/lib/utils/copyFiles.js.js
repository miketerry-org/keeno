// copyFiles.js:

"use strict";

// load all necessary modules
const fs = require("fs");
const path = require("path");

function copyFiles(filelist, destPath, excludeLength) {
  console.log();
  console.log("copying Files...");

  // loop thru copying all files
  filelist.forEach(filename => {
    let partial = filename.slice(excludeLength);
    let destFile = path.join(destPath, partial);
    console.log(`Copying ${partial}`);
    fs.copyFileSync(filename, destFile);
  });

  console.log(`${filelist.length} Files copied.`);

  return null;
}

module.exports = copyFiles;
