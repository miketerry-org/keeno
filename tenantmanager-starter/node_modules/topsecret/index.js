// index.js:

"use strict";

// load necessary packages
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

class TopSecret {
  /**
   * Creates an instance of the TopSecret class.
   * Initializes key and password as null.
   */
  constructor() {
    this._key = null; // Will hold the key for encryption/decryption
    this._password = null; // Will hold the user-defined password
  }

  /**
   * Generates a random 256-bit key (32 bytes) for encryption.
   * @returns {Buffer} The generated 256-bit AES key.
   */
  generateKey() {
    this._key = crypto.randomBytes(32);
    return this._key.toString("hex");
  }

  /**
   * Encrypt a buffer with the current key (256-bit AES).
   * @param {Buffer} buffer - The buffer to encrypt.
   * @returns {Buffer} The encrypted buffer, including the IV and ciphertext.
   * @throws {Error} If the key is not set.
   */
  encryptBuffer(buffer) {
    if (!this._key) {
      throw new Error("Key is not set.");
    }

    // Generate a random Initialization Vector (IV)
    const iv = crypto.randomBytes(16); // 16 bytes IV for AES-256-CBC

    // Create AES cipher with the current key and IV
    const cipher = crypto.createCipheriv("aes-256-cbc", this._key, iv);

    // Encrypt the buffer and return the IV + ciphertext as a Buffer
    let encrypted = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    return encrypted;
  }

  /**
   * Decrypt a buffer with the current key (256-bit AES).
   * @param {Buffer} buffer - The encrypted buffer, including the IV and ciphertext.
   * @returns {string} The decrypted plaintext as a string.
   * @throws {Error} If the key is not set.
   */
  decryptBuffer(buffer) {
    if (!this._key) {
      throw new Error("Key is not set.");
    }

    // Extract the IV from the first 16 bytes of the buffer
    const iv = buffer.slice(0, 16);
    const encryptedText = buffer.slice(16);

    // Create AES decipher with the current key and IV
    const decipher = crypto.createDecipheriv("aes-256-cbc", this._key, iv);

    // Decrypt the buffer and return the plaintext as a string
    let decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    // Convert the decrypted buffer to a UTF-8 string
    return decrypted.toString("utf-8");
  }

  /**
   * Decrypts environment variables from an encrypted file and sets them to `process.env`.
   * @param {string} filename - The path to the encrypted file.
   * @throws {Error} If the decryption or file reading fails.
   */
  decryptEnvFromFile(filename) {
    if (!this._key) {
      throw new Error("Key is not set.");
    }

    try {
      // Load the encrypted file into memory
      const encryptedBuffer = fs.readFileSync(filename);

      // Decrypt the file buffer
      const decryptedText = this.decryptBuffer(encryptedBuffer);

      // Split the decrypted text into lines
      const lines = decryptedText.split("\n");

      // Iterate over each line and parse the name and value for environment variables
      lines.forEach(line => {
        if (line.trim()) {
          const [name, value] = line.split("=");

          if (name && value) {
            process.env[name.trim()] = value.trim();
          }
        }
      });
    } catch (error) {
      console.error("Failed to decrypt and load environment variables:", error);
      throw new Error("Failed to decrypt and load environment variables.");
    }
  }

  /**
   * Encrypt a file using the current key (256-bit AES).
   * Reads the file, encrypts its contents, and saves the encrypted data to a destination file.
   * @param {string} srcFilename - The path to the source file to encrypt.
   * @param {string} dstFilename - The path to the destination file to save the encrypted content.
   * @throws {Error} If file reading or encryption fails.
   */
  encryptFile(srcFilename, dstFilename) {
    try {
      // Read the file's content into a buffer
      const buffer = fs.readFileSync(srcFilename);

      // Encrypt the buffer
      const encryptedBuffer = this.encryptBuffer(buffer);

      // Save the encrypted buffer to the destination file
      fs.writeFileSync(dstFilename, encryptedBuffer);
    } catch (error) {
      console.error("Failed to encrypt file:", error);
      throw new Error("Failed to encrypt file.");
    }
  }

  /**
   * Decrypt a file using the current key (256-bit AES).
   * Reads the encrypted file, decrypts its contents, and saves the decrypted data to a destination file.
   * @param {string} srcFilename - The path to the source file to decrypt.
   * @param {string} dstFilename - The path to the destination file to save the decrypted content.
   * @throws {Error} If file reading or decryption fails.
   */
  decryptFile(srcFilename, dstFilename) {
    try {
      // Read the encrypted file's content into a buffer
      const encryptedBuffer = fs.readFileSync(srcFilename);

      // Decrypt the buffer
      const decryptedBuffer = this.decryptBuffer(encryptedBuffer);

      // Save the decrypted buffer to the destination file
      fs.writeFileSync(dstFilename, decryptedBuffer);
    } catch (error) {
      console.error("Failed to decrypt file:", error);
      throw new Error("Failed to decrypt file.");
    }
  }

  /**
   * Encrypt a JSON object with the current key (256-bit AES).
   * The object is first serialized to a string and then encrypted.
   * @param {Object} data - The JSON object to encrypt.
   * @returns {string} The encrypted data, base64 encoded.
   * @throws {Error} If the key is not set.
   */
  encryptJSON(data) {
    if (!this._key) {
      throw new Error("Key is not set.");
    }

    // Convert the object to a string
    const jsonString = JSON.stringify(data);

    // Encrypt the string buffer
    const encryptedBuffer = this.encryptBuffer(Buffer.from(jsonString, "utf8"));

    // Return the base64 encoded encrypted buffer
    return encryptedBuffer.toString("base64");
  }

  /**
   * Decrypt a base64-encoded, encrypted JSON object with the current key (256-bit AES).
   * The decrypted data is then parsed as a JSON object.
   * @param {string} encryptedData - The base64-encoded encrypted JSON data.
   * @returns {Object} The decrypted JSON object.
   * @throws {Error} If the key is not set.
   */
  decryptJSON(encryptedData) {
    if (!this._key) {
      throw new Error("Key is not set.");
    }

    // Decode the base64-encoded string to an encrypted buffer
    const encryptedBuffer = Buffer.from(encryptedData, "base64");

    // Decrypt the buffer
    const decryptedBuffer = this.decryptBuffer(encryptedBuffer);

    // Convert the decrypted buffer back to a JSON object
    return JSON.parse(decryptedBuffer.toString("utf8"));
  }

  /**
   * Encrypts a JSON object and saves it to a file.
   * This method converts the JSON object to a string, encrypts it using the current key,
   * and writes the encrypted buffer to the specified file.
   *
   * @param {Object} data - The JSON object to encrypt.
   * @param {string} filename - The path to the file where the encrypted data will be saved.
   * @throws {Error} If the key is not set or if the encryption fails.
   */
  encryptJSONToFile(data, filename) {
    if (!this._key) {
      throw new Error("Key is not set.");
    }

    // Convert the object to a string
    const jsonString = JSON.stringify(data);

    // Encrypt the string buffer
    const encryptedBuffer = this.encryptBuffer(Buffer.from(jsonString, "utf8"));

    // Save the encrypted buffer to the destination file
    fs.writeFileSync(filename, encryptedBuffer);
  }

  /**
   * Loads an encrypted file, decrypts its content, and return a string buffer.
   * This method reads the encrypted file, decrypts the content using the current key,
   * and parses the decrypted buffer back into a string buffer.
   *
   * @param {string} filename - The path to the encrypted file.
   * @returns {strringThe decrypted buffer.
   * @throws {Error} If the key is not set or if decryption fails.
   */
  decryptBufferFromFile(filename) {
    if (!this._key) {
      throw new Error("Key is not set.");
    }

    // Read the encrypted buffer from the file
    const encryptedBuffer = fs.readFileSync(filename);

    // Decrypt the buffer
    return this.decryptBuffer(encryptedBuffer);
  }

  /**
   * Loads an encrypted file, decrypts its content, and parses it into a JSON object.
   * This method reads the encrypted file, decrypts the content using the current key,
   * and parses the decrypted buffer back into a JSON object.
   *
   * @param {string} filename - The path to the encrypted file.
   * @returns {Object} The decrypted and parsed JSON object.
   * @throws {Error} If the key is not set or if decryption fails.
   */
  decryptJSONFromFile(filename) {
    // load from file and Decrypt the buffer
    const decryptedBuffer = this.decryptBufferFromFile(filename);

    // Convert the decrypted buffer back to a JSON object
    return JSON.parse(decryptedBuffer.toString("utf8"));
  }

  /**
   * Getter for the key.
   * @returns {Buffer} The current AES key.
   */
  get key() {
    return this._key.toString("hex");
  }

  /**
   * Setter for the key.
   * @param {Buffer} value - The 256-bit AES key to set.
   * @throws {Error} If the key is not 32 bytes long.
   */
  set key(value) {
    if (value && value.length === 64) {
      this._key = Buffer.from(value, "hex");
    } else {
      throw new Error("Key must be 64 bytes long.");
    }
  }

  /**
   * Getter for the password.
   * @returns {string|null} The current password or null.
   */
  get password() {
    return this._password;
  }

  /**
   * Setter for the password.
   * Converts the password into a 256-bit AES key using SHA-256.
   * @param {string} value - The password string to set.
   * @throws {Error} If the password is not a non-empty string.
   */
  set password(value) {
    if (typeof value !== "string" || value.length === 0) {
      throw new Error("Password must be a non-empty string.");
    }

    // Use SHA-256 to convert the password into a 256-bit key
    this._password = value;
    this._key = crypto.createHash("sha256").update(value).digest();
  }

  /**
   * Loads an encrypted buffer from a file, decrypts it, and returns it.
   * @param {string} filename - The path to the file to read from.
   * @returns {Buffer} The decrypted buffer.
   * @throws {Error} If file reading or decryption fails.
   */
  decryptBufferFromFile(filename) {
    try {
      // Read the encrypted buffer from the file
      const encryptedBuffer = fs.readFileSync(filename);

      // Decrypt the buffer and return it
      return this.decryptBuffer(encryptedBuffer);
    } catch (error) {
      console.error("Failed to load buffer from file:", error);
      throw new Error("Failed to load buffer from file.");
    }
  }

  /**
   * Loads an encrypted JSON string from a file, decrypts it, and parses it.
   * @param {string} filename - The path to the file to read from.
   * @returns {Object} The decrypted JSON object.
   * @throws {Error} If file reading or decryption fails.
   */
  loadJSONFromFile(filename) {
    try {
      // Read the encrypted data from the file
      const encryptedData = fs.readFileSync(filename, "utf8");

      // Decrypt and parse the data
      return this.decryptJSON(encryptedData);
    } catch (error) {
      console.error("Failed to load JSON from file:", error);
      throw new Error("Failed to load JSON from file.");
    }
  }

  /**
   * Saves an encrypted buffer to a file.
   * @param {string} filename - The path to the file to save to.
   * @param {Buffer} buffer - The buffer to save after encryption.
   * @throws {Error} If file writing fails.
   */
  saveBufferToFile(filename, buffer) {
    try {
      // Encrypt the buffer
      const encryptedBuffer = this.encryptBuffer(buffer);

      // Write the encrypted buffer to the file
      fs.writeFileSync(filename, encryptedBuffer);
    } catch (error) {
      console.error("Failed to save buffer to file:", error);
      throw new Error("Failed to save buffer to file.");
    }
  }

  /**
   * Saves a  JSON object to an encrypted file.
   * @param {string} filename - The path to the file to save to.
   * @param {Object} data - The JSON object to save after encryption.
   * @throws {Error} If file writing fails.
   */
  saveJSONToFile(filename, data) {
    try {
      // Encrypt the JSON object
      const encryptedData = this.encryptJSON(data);

      // Write the encrypted data to the file
      fs.writeFileSync(filename, encryptedData);
    } catch (error) {
      console.error("Failed to save JSON to file:", error);
      throw new Error("Failed to save JSON to file.");
    }
  }
}

// Export TopSecret class
module.exports = TopSecret;
