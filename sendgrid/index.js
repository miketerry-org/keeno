// index.js: keeno-sendgrid

"use strict";

const sgMail = require("@sendgrid/mail");
const { BaseEmailer } = require("./baseEmailer");

/**
 * SendGridEmailer is a concrete implementation of BaseEmailer using SendGrid's mail API.
 */
class SendGridEmailer extends BaseEmailer {
  constructor() {
    super();
    this._apiKey = null;
  }

  /**
   * Initializes SendGrid with the given API key from config.
   * @param {Object} config - Configuration object containing at least `sendgrid_api_key`.
   * @returns {Promise<void>}
   */
  async initialize(config) {
    super.initialize(config);

    const apiKey = config.sendgrid_api_key;
    if (!apiKey) {
      throw new Error("Missing sendgrid_api_key in config");
    }

    this._apiKey = apiKey;
    sgMail.setApiKey(this._apiKey);

    console.log("SendGrid initialized.");
  }

  /**
   * Sends an email using SendGrid.
   * @param {EmailMessage} message - The email message to send.
   * @param {boolean} [showDetails=false] - Whether to log the full message object.
   * @returns {Promise<{ success: boolean, message: object, info?: any }>}
   */
  async send(message, showDetails = false) {
    if (showDetails) {
      console.log("====== SENDGRID OUTGOING EMAIL ======");
      console.dir(message._message, { depth: null, colors: true });
    }

    try {
      const sendGridMsg = this._convertToSendGridFormat(message._message);
      const info = await sgMail.send(sendGridMsg);

      return {
        success: true,
        message: message._message,
        info,
      };
    } catch (error) {
      return {
        success: false,
        message: message._message,
        info: error.response?.body || error.message || error,
      };
    }
  }

  /**
   * Converts the internal message format to SendGrid's expected format.
   * @param {object} msg - The internal message object from EmailMessage.
   * @returns {object} SendGrid-compatible message object.
   */
  _convertToSendGridFormat(msg) {
    const formatAddress = ({ email, name }) =>
      name ? { email, name } : { email };

    return {
      from: formatAddress(msg.from),
      personalizations: [
        {
          to: msg.to.map(formatAddress),
          cc: msg.cc.length > 0 ? msg.cc.map(formatAddress) : undefined,
          bcc: msg.bcc.length > 0 ? msg.bcc.map(formatAddress) : undefined,
          subject: msg.subject,
        },
      ],
      replyTo: msg.replyTo ? formatAddress(msg.replyTo) : undefined,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
      headers: msg.headers,
      attachments: msg.attachments.map(att => ({
        content: require("fs").readFileSync(att.path).toString("base64"),
        filename: att.filename || att.path.split("/").pop(),
        type: "application/octet-stream",
        disposition: "attachment",
      })),
    };
  }
}

module.exports = { SendGridEmailer };
