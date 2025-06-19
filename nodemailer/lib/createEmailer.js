// createEmailer.js:

"use strict";

const nodemailer = require("nodemailer");
const { BaseEmailer } = require("keeno-base");
const system = require("keeno-system");
const Schema = require("keeno-schema");

const { stringType, booleanType, integerType } = Schema.types;

/**
 * NodeEmailer is a concrete implementation of BaseEmailer using the nodemailer library.
 */
class NodeEmailer extends BaseEmailer {
  /**
   * Construct and initialize the NodeEmailer instance using SMTP config.
   * @param {Object} config - SMTP configuration object.
   */
  constructor(config) {
    super();

    if (!config || typeof config !== "object") {
      throw new Error("Missing or invalid config passed to NodeEmailer.");
    }

    this._config = config;
    this._transporter = this._createTransporter(config);
  }

  /**
   * Create the nodemailer transporter and verify it.
   * @param {Object} config - SMTP config.
   * @returns {import("nodemailer").Transporter}
   */
  _createTransporter(config) {
    const smtpConfig = {
      host: config.smtp_host,
      port: parseInt(config.smtp_port, 10),
      secure: config.smtp_secure === "true" || config.smtp_secure === true,
      auth: {
        user: config.smtp_username,
        pass: config.smtp_password,
      },
    };

    const transporter = nodemailer.createTransport(smtpConfig);

    transporter
      .verify()
      .then(() => {
        system.log.info(`SMTP transport verified for ${config.smtp_username}`);
      })
      .catch(err => {
        system.log.error(`Failed to verify SMTP connection: ${err.message}`);
        throw err;
      });

    return transporter;
  }

  /**
   * Send an email message using nodemailer.
   * @param {EmailMessage} message - The email message to send.
   * @param {boolean} [showDetails=false] - Whether to log the message before sending.
   * @returns {Promise<{ success: boolean, message: object, info?: any }>}
   */
  async send(message, showDetails = false) {
    if (showDetails) {
      system.log.info("====== NODEMAILER OUTGOING EMAIL ======");
      system.log.debug(message._message);
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
      system.log.error(`Email send failed: ${error.message}`);
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
 * Validates and instantiates a NodeEmailer.
 * @param {Object} tenant - Tenant config containing SMTP values.
 * @returns {NodeEmailer}
 * @throws {Error} - If validation or creation fails.
 */
async function createEmailer(tenant) {
  const { validated, errors } = new Schema({
    smtp_host: stringType({ min: 1, max: 255, required: true }),
    smtp_port: integerType({ min: 1, max: 65535, required: true }),
    smtp_secure: booleanType({ required: true }),
    smtp_username: stringType({ min: 1, max: 255, required: true }),
    smtp_password: stringType({ min: 1, max: 255, required: true }),
  }).validate(tenant);

  if (errors.length > 0) {
    const message = errors.map(e => e.message).join(", ");
    system.log.error(`SMTP config validation failed: ${message}`);
    throw new Error(`SMTP config invalid: ${message}`);
  }

  try {
    const emailer = new NodeEmailer(validated);
    system.log.info(`NodeEmailer created for SMTP host ${validated.smtp_host}`);
    return emailer;
  } catch (err) {
    system.log.error(`NodeEmailer creation failed: ${err.message}`);
    throw new Error(`Failed to create NodeEmailer: ${err.message}`);
  }
}

module.exports = createEmailer;
