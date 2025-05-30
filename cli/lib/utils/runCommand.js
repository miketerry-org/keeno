// lib/utils/runCommand.js

"use strict";

// load all necessary modules
const { spawn } = require("child_process");

function runCommand(cmdline) {
  return new Promise((resolve, reject) => {
    const [command, ...args] = cmdline.split(" ");
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on("error", err => {
      reject(err);
    });
  });
}

module.exports = runCommand;
