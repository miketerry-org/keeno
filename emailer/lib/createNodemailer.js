// createNodemailer.js:

"use strict";

// Load all necessary modules
const nodemailer = require("nodemailer");
const { serverLog } = require("multitenant-express");

// Function to create a NodeMailer transport instance
async function createNodeMailer(tenant) {
  try {
    // Create the transport using tenant
    const transport = nodemailer.createTransport({
      host: tenant.mailer_host,
      port: tenant.mailer_port,
      secure: true, // Use SSL/TLS
      auth: {
        user: tenant.mailer_username,
        pass: tenant.mailer_password,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certs (optional)
      },
    });

    // Return the configured transport
    return transport;
  } catch (err) {
    serverLog.error(`Tenant ${tenant.tenant_id}: ${err.message}`);
    throw new Error(`Tenant ${tenant.tenant_id}: ${err.message}`);
  }
}

// Export the createNodeMailer function
module.exports = createNodeMailer;
