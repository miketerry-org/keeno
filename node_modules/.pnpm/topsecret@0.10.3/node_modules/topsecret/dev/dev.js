const TopSecret = require("topsecret");
console.log("ENCRYPT_KEY", process.env.ENCRYPT_KEY);

const topsecret = new TopSecret();
topsecret.key-envname = "ENCRYPT_KEY"
