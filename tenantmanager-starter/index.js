// index.js: sample usage of createTenantManager:

// load the encryption key into environment variables
require("dotenv").config();

// load all necessary modules
const createTenantManager = require("keeno-tenantmanager");

console.log("hello world");

// use immediately invokable function to handle async/await
(async () => {
  try {
    // create tenant manager by loding independant encrypted configuration .env files
    const tenantmanager = await createTenantManager({
      filemask: "./_encrypted/*.secret",
      key: process.env.ENCRYPT_KEY,
    });

    console.log("tenantmanager.length", tenantmanager.length);
  } catch (err) {
    console.error(err.message);
  }
})();
