// lib/runCommand.js

const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

/**
 * Executes a shell command and returns its output.
 * @param {string} cmdline - The command line to execute
 * @returns {Promise<{stdout: string, stderr: string}>} - The command's stdout and stderr
 */
async function runCommand(cmdline) {
  console.debug("cmdline", cmdline);
  try {
    const { stdout, stderr } = await execAsync(cmdline);
    return { stdout, stderr };
  } catch (error) {
    throw new Error(`Command failed: ${error.message}`);
  }
}

module.exports = runCommand;
