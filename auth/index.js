// index.js:

"use strict";

// load all necessary modules

class GenericAuth {
  #config;
  #options;
  #db;

  constructor(config, options = {}) {
    this.#config = config;
    this.#options = options;
    this.#db = options.db;
  }

asyc  register(req, res, next) {
    console.debug("postRegister");

      const { name, email, password, role } = req.body;

  // Create user
  const user = await createUser({name,email,password,role})

  // grab token and send to email
  const confirmEmailToken = user.generateEmailConfirmToken();

  // Create reset url
  const confirmEmailURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/auth/confirmemail?token=${confirmEmailToken}`;

  const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${confirmEmailURL}`;

  user.save({ validateBeforeSave: false });

  const sendResult = await sendEmail({
    email: user.email,
    subject: 'Email confirmation token',
    message,
  });

  sendTokenResponse(user, 200, res);

  }

  loginasync (req, res, next) {
    console.debug("postLogin");
  }

  logoutasync (req, res, next) {
    console.debug("postLogout");
  }

  async forgotPassword(req, res, next) {
    console.debug("postForgotPassword");
  }

  async protect(req, res, next) {
    console.log("protect middleware");
  }

  get db() {
    return this.#db;
  }
}
