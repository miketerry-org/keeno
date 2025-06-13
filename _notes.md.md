# /api/register — User Registration Flow

### 1. User navigates to home page `/`

- User sees landing page or call to action.

### 2. User clicks "Register"

- UI presents registration form.

### 3. Client collects input

- Required fields: `firstname`, `lastname`, `email`, `password`.

### 4. Client sends data to server

- POST `/api/register`
- Payload: `{ firstname, lastname, email, password }`
- Form validation and HTTPS assumed.

### 5. Server checks for existing email

- If email already exists (case-insensitive):
  - Respond with error: `409 Conflict - Email already registered`
  - Consider rate limiting to prevent enumeration attacks.

### 6. Server generates a verification code

- Format: `###-###` (e.g., `123-456`)
- Code is short-lived: expires in `10 minutes` (configurable via constant)

### 7. Server sets verification code expiration

- Adds `authCodeExpiresAt` timestamp field
- Optionally adds `status: "pending"` or `isVerified: false`

### 8. Server saves new `auth` document

- Collection: `auth`
- Fields include: `email`, `passwordHash`, `firstname`, `lastname`, `role`, `authCode`, `authCodeExpiresAt`, `status`

### 9. Server sends verification email

- Contains the 6-digit code and expiration info
- Avoids revealing whether the email was previously registered

### 10. Client shows verification code input form

- User enters code
- Client prepares for retry or expiration handling

### 11. User enters the code

- Code input UI
- Includes resend option and expiration warning (optional)

### 12. Client sends email and code to server

- POST `/api/verify-code`
- Payload: `{ email, authCode }`

### 13. Server verifies email/code and expiration

- If invalid or expired:
  - Respond with generic error: `400 Invalid or expired verification code`
  - Do not disclose which part failed

### 14. If valid, server updates auth document

- Sets `status: "verified"` or `isVerified: true`
- Optionally removes `authCode` and `authCodeExpiresAt`

### 15. Server creates session and returns cookie

- Sets secure, HTTP-only cookie (e.g., `sid`, `auth_id`)
- Includes `SameSite`, `Secure` flags
- Could use session or JWT depending on architecture

### 16. Client uses session to request profile

- GET `/api/profile` with session cookie
- Server reads `auth_id` from session

### 17. If profile does not exist, server creates one

- Collection: `profile`
- Uses matching `_id` from auth document
- Populates from `firstname`, `lastname`, etc.
- Supports pluggable or dynamic schema for industry-specific fields

### 18. Server returns profile to client

- Response includes full `profile` object
- May also include session context (e.g., role, permissions)

# /api/login — User Login Flow

### 1. User navigates to home page `/`

- User lands on the app

### 2. User clicks "Login"

- UI displays login form

### 3. Client shows email/password input

- Fields: `email`, `password`

### 4. User enters email and password

- Client validates input locally

### 5. Client sends credentials to server

- POST `/api/login`
- Payload: `{ email, password }`

### 6. Server fetches auth document by email

- Normalize input: `email.trim().toLowerCase()`
- If not found, respond with generic error (do not reveal user existence)

### 7. If account is locked:

- If `lockUntil` exists and has **expired**:
  - Reset `failedLoginAttempts` to 0
  - Clear `lockUntil`
  - Optionally set `status: 'active'`
- If `lockUntil` **not yet expired**:
  - Respond with `403 Forbidden - Account locked`
  - Include retry-after time if safe

### 8. Server verifies password

- Use `bcrypt.compare(password, passwordHash)`
- If invalid:
  - Increment `failedLoginAttempts`
  - If under limit:
    - Respond with `401 Unauthorized - Invalid credentials`
  - If at or over `MAX_FAILED_ATTEMPTS`:
    - Set `lockUntil = now + LOCK_DURATION_MS`
    - Respond with `403 Forbidden - Account locked due to too many attempts`

### 9. If credentials are valid:

- Reset `failedLoginAttempts` and `lockUntil`
- Update `lastLoginAt` (optional)
- Create session (cookie or token)
- Set secure, HTTP-only cookie (e.g., `auth_id`)
- Fetch profile document by `auth._id`
- Return profile object and optionally session metadata

# /api/forgot-password — Forgot Password Flow

### 1. User clicks "Forgot Password"

- From login page or entry point
- Navigates to `/forgot-password` route

### 2. Client shows email input form

- User enters their email address

### 3. Client sends email to server

- POST `/api/forgot-password`
- Payload: `{ email }`

### 4. Server normalizes and validates email

- Converts email to lowercase and trims
- If email not found:
  - Respond with **generic success** (do not reveal if user exists)
  - Log internally if abuse is suspected

### 5. Server generates reset code

- Format: `###-###` (6-digit code)
- Set `resetCode` and `resetCodeExpiresAt` fields on the `auth` document
- Optional: Clear existing reset codes if present

### 6. Server sends reset code via email

- Message includes:
  - The reset code
  - Expiration info (e.g., "valid for 10 minutes")
  - Reminder: If user didn’t request it, ignore this email

### 7. Client shows reset code + new password input form

- Fields:
  - `email`
  - `resetCode`
  - `newPassword`
  - `confirmPassword`

### 8. User submits reset form

- POST `/api/reset-password`
- Payload: `{ email, resetCode, newPassword }`

### 9. Server verifies reset code and expiration

- Look up user by `email`
- Check:
  - `resetCode === user.resetCode`
  - `resetCodeExpiresAt > Date.now()`
- If invalid or expired:
  - Respond with `400 Invalid or expired code`

### 10. Server updates password

- Hash the new password
- Save it to `passwordHash`
- Clear `resetCode` and `resetCodeExpiresAt` fields
- Optionally:
  - Reset failed login attempts
  - Invalidate all sessions (security best practice)
  - Send password reset confirmation email

### 11. Server creates session and returns profile

- Optionally log the user in
- Set secure HTTP-only cookie (`auth_id`)
- Fetch and return the user’s `profile`

# /api/logout — User Logout Flow (Session-Based)

### 1. User initiates logout

- Triggered by:
  - Clicking "Logout" button
  - Automatic logout due to inactivity
  - Account settings or admin action

### 2. Client sends logout request to server

- POST `/api/logout`
- Request automatically includes session cookie (e.g., `auth_id` or default session cookie)

---

## 🔐 Server-Side Session Logout

### 3. Server reads session cookie from request

- Example: `req.cookies['auth_id']` (or default session cookie)
- Looks up session in session store (e.g., memory, Redis, or DB)
- Validates session exists

### 4. Server destroys the session

- Invalidates the session on the server side:
  ```js
  req.session.destroy((err) => { ... });
  ```
