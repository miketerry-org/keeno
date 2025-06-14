// index.js: keeno-nodemailer.js:

"use strict";

// load all necessary modules
const nodemailer = require("nodemailer");
const { BaseEmailer } = require("./baseEmailer");

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

module.exports = { NodeEmailer };
