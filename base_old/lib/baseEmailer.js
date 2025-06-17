// baseEmailer.js:

"use strict";

const fs = require("fs");
const Handlebars = require("handlebars");

/**
 * BaseEmailer is an abstract base class that defines the structure and flow for sending emails.
 * Concrete implementations like NodeEmailer or SendGridEmailer should extend this class.
 */
class BaseEmailer {
  constructor() {
    /** @type {Object} */
    this._config = {};
  }

  /**
   * Initialize the emailer with configuration values.
   * @param {Object} config - Configuration options specific to the concrete implementation.
   * @returns {Promise<void>}
   */
  async initialize(config) {
    this._config = config;
  }

  /**
   * Create a new EmailMessage instance bound to this emailer.
   * @returns {EmailMessage}
   */
  createMessage() {
    return new EmailMessage(this);
  }

  /**
   * Send an email message. Subclasses should override this method.
   * This base implementation logs the message if showDetails is true.
   * @param {EmailMessage} message - The email message to send.
   * @param {boolean} [showDetails=false] - Whether to log the full message object.
   * @returns {Promise<{ success: boolean, message: object, info?: string }>}
   */
  async send(message, showDetails = false) {
    if (showDetails) {
      console.log("====== EMAIL MESSAGE ======");
      console.dir(message._message, { depth: null, colors: true });
    }

    return {
      success: false,
      message: message._message,
      info: "Send not implemented in BaseEmailer",
    };
  }
}

/**
 * EmailMessage provides a fluent interface to build an email message
 * that can be sent through a BaseEmailer instance.
 */
class EmailMessage {
  /**
   * @param {BaseEmailer} emailer - The emailer instance that will be used to send this message.
   */
  constructor(emailer) {
    this._emailer = emailer;
    this._message = {
      from: {},
      to: [],
      cc: [],
      bcc: [],
      replyTo: null,
      subject: "",
      text: "",
      html: "",
      attachments: [],
      headers: {},
    };
  }

  /**
   * Set the sender of the email.
   * @param {string} email - Sender email address.
   * @param {string} [name=""] - Optional sender name.
   * @returns {EmailMessage}
   */
  from(email, name = "") {
    this._message.from = { email, name };
    return this;
  }

  /**
   * Add a recipient (To) to the email.
   * @param {string} email - Recipient email address.
   * @param {string} [name=""] - Optional recipient name.
   * @returns {EmailMessage}
   */
  to(email, name = "") {
    this._message.to.push({ email, name });
    return this;
  }

  /**
   * Add a CC recipient.
   * @param {string} email - CC email address.
   * @param {string} [name=""] - Optional name.
   * @returns {EmailMessage}
   */
  cc(email, name = "") {
    this._message.cc.push({ email, name });
    return this;
  }

  /**
   * Add a BCC recipient.
   * @param {string} email - BCC email address.
   * @param {string} [name=""] - Optional name.
   * @returns {EmailMessage}
   */
  bcc(email, name = "") {
    this._message.bcc.push({ email, name });
    return this;
  }

  /**
   * Set the Reply-To address.
   * @param {string} email - Reply-to email address.
   * @param {string} [name=""] - Optional name.
   * @returns {EmailMessage}
   */
  replyTo(email, name = "") {
    this._message.replyTo = { email, name };
    return this;
  }

  /**
   * Set the subject line of the email.
   * @param {string} text - The subject text.
   * @returns {EmailMessage}
   */
  subject(text) {
    this._message.subject = text;
    return this;
  }

  /**
   * Set the plain text body of the email, optionally using Handlebars templating.
   *
   * @param {string} template - Plain text content or filename if fromFile is true.
   * @param {Object} [data=undefined] - Optional data to render the template using Handlebars.
   * @param {boolean} [fromFile=false] - If true, treat the template as a file path.
   * @returns {EmailMessage}
   */
  textBody(template, data = undefined, fromFile = false) {
    let content = template;

    if (fromFile) {
      content = fs.readFileSync(template, "utf-8");
    }

    this._message.text = data ? Handlebars.compile(content)(data) : content;
    return this;
  }

  /**
   * Set the HTML body of the email, optionally using Handlebars templating.
   *
   * @param {string} template - HTML content or filename if fromFile is true.
   * @param {Object} [data=undefined] - Optional data to render the template using Handlebars.
   * @param {boolean} [fromFile=false] - If true, treat the template as a file path.
   * @returns {EmailMessage}
   */
  htmlBody(template, data = undefined, fromFile = false) {
    let content = template;

    if (fromFile) {
      content = fs.readFileSync(template, "utf-8");
    }

    this._message.html = data ? Handlebars.compile(content)(data) : content;
    return this;
  }

  /**
   * Add custom headers to the email.
   * @param {Object.<string, string>} headersObj - Key-value pairs of headers.
   * @returns {EmailMessage}
   */
  headers(headersObj) {
    this._message.headers = { ...this._message.headers, ...headersObj };
    return this;
  }

  /**
   * Add an attachment to the email.
   * @param {string} path - File path to attach.
   * @param {string} [filename=null] - Optional name to show in the email.
   * @returns {EmailMessage}
   */
  file(path, filename = null) {
    this._message.attachments.push({ path, filename });
    return this;
  }

  /**
   * Send the email using the associated emailer.
   * @param {boolean} [showDetails=false] - Whether to print the message before sending.
   * @returns {Promise<{ success: boolean, message: object, info?: any }>}
   */
  async send(showDetails = false) {
    return await this._emailer.send(this, showDetails);
  }
}

module.exports = { BaseEmailer, EmailMessage };
