// createEmailer.js:

"use strict";

// Load all necessary modules
const nodemailer = require("nodemailer");
const system = require("keeno-system");

// Function to create a NodeMailer transport instance
async function createEMailer(tenant) {
  try {
    // Create the transport using tenant
    const transport = nodemailer.createTransport({
      host: tenant.smtp_host,
      port: tenant.smtp_port,
      secure: true, // Use SSL/TLS
      auth: {
        user: tenant.smtp_username,
        pass: tenant.smtp_password,
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

// Export the createEmailer function
module.exports = createEmailer;
