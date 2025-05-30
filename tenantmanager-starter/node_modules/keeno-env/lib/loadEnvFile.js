// loadEnvFile.js:

"use strict";

const fs = require("fs");
const path = require("path");
const system = require("keeno-schema"); // assumes system.fatal exists
const TopSecret = require("topsecret");
const isJsonLike = require("./isJsonLike.js");
const { coercePrimitive } = require("keeno-system");
const createReadOnlyObject = require("./createReadOnlyObject");

/**
 * Load and validate environment configuration from a file.
 *
 * @param {string} filename - Path to the env file.
 * @param {string|null} encryptKey - Optional decryption key if file is encrypted.
 * @param {Object|null} schema - Optional schema validator with .validate().
 * @param {Object} [options] - Optional config.
 * @param {boolean} [options.verbose=false] - Print loaded keys.
 * @returns {Object} Read-only configuration object.
 */
function loadEnvFile(filename, encryptKey = null, schema = {}, options = {}) {
  // destructure verbose flag from options and use false if not specified
  const { verbose = false } = options;

  // if the filename is relative then use current working directory as root path
  const resolvedPath = path.resolve(process.cwd(), filename);

  // ensure the file exists
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found: ${resolvedPath}`);
  }

  // declare variable which is out of nested scoping
  let raw;

  // if no encryption key then read it as plain text
  if (!encryptKey) {
    raw = fs.readFileSync(resolvedPath, "utf-8");
  } else {
    // read and decrypt the file into a text buffer
    const ts = new TopSecret();
    ts.key = encryptKey;
    raw = ts.decryptBufferFromFile(resolvedPath);
  }

  // split the buffer into lines
  const lines = raw.split(/\r?\n/);

  // initialize empty JSON object for raw values
  const rawValues = {};

  // loop thru all lines in buffer
  lines.forEach(line => {
    // trim any leading or tailing spaces
    const trimmed = line.trim();

    // skip any lines beginning with comment symbol
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    // split the line at the equal sign
    const [name, ...rest] = trimmed.split("=");

    // if name is blank then move to next line
    if (!name) {
      return;
    }

    // trim any leading or tailing spaces from name and store in key variable
    const key = name.trim();

    // Strip inline comment and trim again
    let value = rest
      .join("=")
      .replace(/\s+#.*$/, "")
      .trim();

    // see if the value looks likes a JSON object
    if (isJsonLike(value)) {
      try {
        // attempt to parse the value into an object
        value = JSON.parse(value);
      } catch {
        // fallback to plain string
      }
    } else {
      // attempt to coerce string into primative value
      value = coercePrimitive(value);
    }

    // now assign the value to the raw values object
    rawValues[key] = value;
  });

  // assign raw values to validated object
  let validated = rawValues;

  // if schema specified and it has validate function
  if (schema && typeof schema.validate === "function") {
    const { validated: result, errors } = schema.validate(rawValues);

    // check to see if one or more errors
    if (errors && errors.length > 0) {
      const message = [
        `Fatal configuration error(s) detected in "${filename}":`,
        ...errors.map(err => `- ${err.field}: ${err.message}`),
      ].join("\n");
      throw new Error(message);
    }

    // assign results into validated variable
    validated = result;
  }

  // if verbose logging requested in options
  if (verbose) {
    console.log(`Loaded configuration from "${filename}":`);
    Object.entries(validated).forEach(([key, value]) => {
      const display = typeof value === "object" ? JSON.stringify(value) : value;
      console.log(`  ${key} = ${display}`);
    });
  }

  // return the validated object as a read only version
  return createReadOnlyObject(validated);
}

module.exports = loadEnvFile;
