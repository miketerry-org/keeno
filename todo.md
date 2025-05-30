nodemaster.com
nodefreak.com
nodefanboy.com

#todo:

#keeno-config

<ul>
- export config object for just server configuration settings
- add jwt_secret to the server configuration system
- add JWT_EXPIRES_IN to server configuration
<!-- - change defineServices to createServices -->
<!-- - add server.createServices async function to server so log property can be assigned and other global services -->
<!-- - - at end of server.createServices, before making the read only  object, set log property to "console" if it is not defined by a service -->
<!-- - add tenantManager.createServices async function to create all tenant related services -->
<!-- - ensure no duplicate tenant "id" values -->
<!-- - - use process.env.node = tenant .env node to load tenants for this server node -->
<!-- - support "mode" in tenant .env files and filter only those which match NODE_EN -->
<!-- - loadServerEnv needs to validate the schema -->
<!-- - - loadTenantEnv needs to validate the tenant schema -->
- implement --generate command line parameter
- implement -encrypt command line parameter
- template (create _decrypted, _encrypted folders and server.env and 3 tenant .env files)
<!-- - - remove keeno/config/lib2 folder -->
  <!-- - in tenantManager.middleware, i need to return error if tenant is undefined -->
  <!-- - - in tenant createservice, after looping thr services, if the tenant["log"] is undefined then assign console -->
</ul>

#keeno-schema

<ul>
<!-- - finish implementation -->
</ul>

#keeno-system

<ul>
<!-- - process modules in lib_need-to-integrate -->
</ul>

- skip cli package until all others are complete
<!-- - finish keeno-config -->
- - finish keeno-express
- finish keeno-mongodb
- finish keeno-nodemailer
- implement keeno-tutorials-\*
- ***

## 🛡️ Authentication API To-Do (Node/Express + JWT + Cookies)

### ✅ Essential Endpoints

- [ ] `POST /auth/register` — Register a new user with email/password.
- [ ] `POST /auth/login` — Authenticate user, issue JWT in HTTP-only cookie.
- [ ] `POST /auth/logout` — Clear the JWT cookie and end session.
- [ ] `GET /auth/me` — Return authenticated user info based on JWT.

### 🔄 Optional but Recommended

- [ ] `POST /auth/refresh` — Issue new access token using refresh token.
- [ ] `POST /auth/request-reset` — Send password reset link via email.
- [ ] `POST /auth/reset-password` — Reset password using token from email.

### 🔐 Security Best Practices

- [ ] Use `bcrypt` to hash and compare passwords.
- [ ] Use HTTPS in production (cookies must be `Secure`).
- [ ] Store JWT in `HttpOnly`, `Secure` cookie with `SameSite=Strict` or `Lax`.
- [ ] Never store tokens in localStorage.
- [ ] Validate user input (email format, password strength).
- [ ] Implement rate limiting for `/auth/login` and `/auth/register`.
- [ ] Sign JWTs with a strong secret; keep secrets out of source control.
- [ ] Invalidate/reset refresh tokens on password change or logout.

\*\*\* auth model

// auth.model.js (Mongoose schema)

const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema({
email: {
type: String,
required: true,
unique: true,
lowercase: true,
trim: true,
},

passwordHash: {
type: String,
required: true,
},

isVerified: {
type: Boolean,
default: false,
},

verificationToken: {
type: String,
default: null,
},

resetToken: {
token: { type: String, default: null },
expires: { type: Date, default: null },
},

refreshTokens: [
{
token: String,
expires: Date,
createdAt: { type: Date, default: Date.now },
createdByIp: String,
revoked: Date,
revokedByIp: String,
replacedByToken: String,
},
],

createdAt: {
type: Date,
default: Date.now,
},

updatedAt: {
type: Date,
default: Date.now,
},
});

// Optional: automatically update `updatedAt`
AuthSchema.pre("save", function (next) {
this.updatedAt = Date.now();
next();
});

module.exports = mongoose.model("Auth", AuthSchema);
