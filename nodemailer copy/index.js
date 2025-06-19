// index.js: keeno-nodemailer.js:

"use strict";

// load all necessary modules
const nodemailer = require("nodemailer");
const { BaseEmailer } = require("keeno-base");
const system = require("keeno-system");
const Schema = require("keeno-schema");

// destructure needed data types
const { stringType, booleanType, integerType } = Schema.types;

/**
 * NodeEmailer is a concrete implementation of BaseEmailer using the nodemailer library.
 */
class NodeEmailer extends BaseEmailer {
  constructor() {
    super();
    /** @type {import("nodemailer").Transporter} */
    this._transporter = null;
  }

  /**
   * Initialize the emailer with tenant-specific config.
   * Extracts SMTP-related properties and creates the nodemailer transporter.
   *
   * @param {Object} config - The configuration object parsed from the encrypted .env file.
   * @returns {Promise<void>}
   */
  async initialize(config) {
    super.initialize(config);

    const smtpConfig = {
      host: config.smtp_host,
      port: parseInt(config.smtp_port, 10),
      secure: config.smtp_secure === "true" || config.smtp_secure === true, // string or boolean
      auth: {
        user: config.smtp_username,
        pass: config.smtp_password,
      },
    };

    this._transporter = nodemailer.createTransport(smtpConfig);

    try {
      await this._transporter.verify();
      console.log(`SMTP transport verified for ${config.smtp_username}`);
    } catch (err) {
      console.error("Failed to verify SMTP connection:", err);
      throw err;
    }
  }

  /**
   * Send an email message using nodemailer.
   * @param {EmailMessage} message - The email message to send.
   * @param {boolean} [showDetails=false] - Whether to log the full message before sending.
   * @returns {Promise<{ success: boolean, message: object, info?: any }>}
   */
  async send(message, showDetails = false) {
    if (showDetails) {
      console.log("====== NODEMAILER OUTGOING EMAIL ======");
      console.dir(message._message, { depth: null, colors: true });
    }

    try {
      const info = await this._transporter.sendMail(
        this._convertToNodemailerFormat(message._message)
      );
      return {
        success: true,
        message: message._message,
        info,
      };
    } catch (error) {
      return {
        success: false,
        message: message._message,
        info: error,
      };
    }
  }

  /**
   * Converts internal message format to Nodemailer's expected format.
   * @param {object} msg - The internal message object from EmailMessage.
   * @returns {object} Nodemailer-compatible message object.
   */
  _convertToNodemailerFormat(msg) {
    const formatAddress = ({ email, name }) =>
      name ? `"${name}" <${email}>` : email;

    return {
      from: formatAddress(msg.from),
      to: msg.to.map(formatAddress),
      cc: msg.cc.map(formatAddress),
      bcc: msg.bcc.map(formatAddress),
      replyTo: msg.replyTo ? formatAddress(msg.replyTo) : undefined,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
      headers: msg.headers,
      attachments: msg.attachments.map(att => ({
        path: att.path,
        filename: att.filename || undefined,
      })),
    };
  }
}

/**
 * Creates and initializes a NodeEmailer instance after validating tenant config.
 * @param {Object} tenant - Tenant config containing SMTP-related values.
 * @returns {Promise<NodeEmailer>} - A ready-to-use NodeEmailer instance.
 * @throws {Error} - Throws if validation fails or emailer cannot initialize.
 */
async function CreateNodeEmailer(tenant) {
  const { validated, errors } = new Schema({
    smtp_host: stringType({ min: 1, max: 255, required: true }),
    smtp_port: numberType({ min: 1, max: 65535, required: true }),
    smtp_secure: booleanType({ required: true }),
    smtp_username: stringType({ min: 1, max: 255, required: true }),
    smtp_password: stringType({ min: 1, max: 255, required: true }),
  }).validate(tenant);

  if (errors.length > 0) {
    const message = errors.map(e => e.message).join(", ");
    system.log.error(`SMTP config validation failed: ${message}`);
    throw new Error(`SMTP config invalid: ${message}`);
  }

  const emailer = new NodeEmailer();
  try {
    await emailer.initialize(validated);
    system.log.info(
      `NodeEmailer initialized for SMTP host ${validated.smtp_host}`
    );
    return emailer;
  } catch (err) {
    system.log.error(`NodeEmailer initialization failed: ${err.message}`);
    throw new Error(`Failed to initialize NodeEmailer: ${err.message}`);
  }
}

module.exports = { NodeEmailer, CreateNodeEmailer };
