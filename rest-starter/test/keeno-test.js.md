const fetch = require("node-fetch");

/**
 * Create a new test request instance.
 * @param {string} baseURL - The base URL of the API server.
 * @param {Object} [context={}] - Optional shared context object for managing state like cookies.
 * @returns {TestRequest}
 */
function request(baseURL, context = {}) {
  return new TestRequest(baseURL, context);
}

class TestRequest {
  /**
   * @param {string} baseURL
   * @param {Object} context
   */
  constructor(baseURL, context = {}) {
    this.baseURL = baseURL;
    this.context = context;
    this.method = "GET";
    this.path = "/";
    this.queryParams = "";
    this.body = null;
    this.headers = {};
    this.assertions = [];
  }

  /** @param {string} path */
  get(path) {
    this.method = "GET";
    this.path = path;
    return this;
  }

  /** @param {string} path */
  post(path) {
    this.method = "POST";
    this.path = path;
    return this;
  }

  /** @param {string} path */
  put(path) {
    this.method = "PUT";
    this.path = path;
    return this;
  }

  /** @param {string} path */
  patch(path) {
    this.method = "PATCH";
    this.path = path;
    return this;
  }

  /** @param {string} path */
  delete(path) {
    this.method = "DELETE";
    this.path = path;
    return this;
  }

  /**
   * Add query parameters to the request.
   * @param {Object} params - Key-value pairs for the query string.
   * @returns {TestRequest}
   */
  query(params) {
    const str = new URLSearchParams(params).toString();
    this.queryParams += (this.queryParams ? "&" : "?") + str;
    return this;
  }

  /**
   * Set a JSON request body.
   * @param {Object} body - The JSON payload to send.
   * @returns {TestRequest}
   */
  send(body) {
    this.body = JSON.stringify(body);
    this.headers["Content-Type"] = "application/json";
    return this;
  }

  /**
   * Set a request header.
   * @param {string} key
   * @param {string} value
   * @returns {TestRequest}
   */
  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  /**
   * Attach stored cookie from context to request.
   * @returns {TestRequest}
   */
  sendCookieFromContext() {
    if (this.context.cookie) {
      this.headers["Cookie"] = this.context.cookie;
    }
    return this;
  }

  /**
   * Assert the expected HTTP status code.
   * @param {number} code
   * @returns {TestRequest}
   */
  expectStatus(code) {
    this.assertions.push(async res => {
      if (res.status !== code) {
        throw new Error(`Expected status ${code}, got ${res.status}`);
      }
    });
    return this;
  }

  /**
   * Assert that a response header equals an expected value.
   * @param {string} key
   * @param {string} expected
   * @returns {TestRequest}
   */
  expectHeader(key, expected) {
    this.assertions.push(async res => {
      const actual = res.headers.get(key.toLowerCase());
      if (actual !== expected) {
        throw new Error(
          `Expected header '${key}' = '${expected}', got '${actual}'`
        );
      }
    });
    return this;
  }

  /**
   * Assert a specific field in the JSON body.
   * @param {string} key - Field to check.
   * @param {*} [expected] - Optional value to match against.
   * @returns {TestRequest}
   */
  expectBodyField(key, expected) {
    this.assertions.push(async (res, json) => {
      if (!(key in json)) throw new Error(`Expected body to have key '${key}'`);
      if (expected !== undefined && json[key] !== expected) {
        throw new Error(
          `Expected body['${key}'] = '${expected}', got '${json[key]}'`
        );
      }
    });
    return this;
  }

  /**
   * Deep-equality check of the entire JSON body.
   * @param {Object} expected
   * @returns {TestRequest}
   */
  expectBodyEquals(expected) {
    this.assertions.push(async (res, json) => {
      const actualStr = JSON.stringify(json);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(
          `Expected full body to equal:\n${expectedStr}\nBut got:\n${actualStr}`
        );
      }
    });
    return this;
  }

  /**
   * Assert a raw text body response.
   * @param {string} expectedText
   * @returns {TestRequest}
   */
  expectTextBody(expectedText) {
    this.assertions.push(async (res, _) => {
      const text = await res.text();
      if (text !== expectedText) {
        throw new Error(
          `Expected text body to equal:\n${expectedText}\nBut got:\n${text}`
        );
      }
    });
    return this;
  }

  /**
   * Add a custom expectation function.
   * @param {(res: Response, json: Object) => Promise<void> | void} fn
   * @returns {TestRequest}
   */
  expect(fn) {
    this.assertions.push(fn);
    return this;
  }

  /**
   * Save a value from the JSON body to the context.
   * @param {string} bodyKey - The JSON field to read.
   * @param {string} contextKey - The key to store in context.
   * @returns {TestRequest}
   */
  saveBodyFieldToContext(bodyKey, contextKey) {
    this.assertions.push(async (res, json) => {
      this.context[contextKey] = json[bodyKey];
    });
    return this;
  }

  /**
   * Save a specific cookie from the Set-Cookie response header into context.
   * @param {string} cookieName
   * @returns {TestRequest}
   */
  saveCookieFromResponse(cookieName) {
    this.assertions.push(async res => {
      const raw = res.headers.raw()["set-cookie"];
      if (!raw) return;
      const cookie = raw.find(c => c.startsWith(`${cookieName}=`));
      if (cookie) {
        this.context.cookie = cookie.split(";")[0]; // e.g. connect.sid=abc123
      }
    });
    return this;
  }

  /**
   * Execute the request and run all chained assertions.
   * @returns {Promise<{res: Response, json: Object, context: Object}>}
   */
  async run() {
    const url = `${this.baseURL}${this.path}${this.queryParams}`;
    const res = await fetch(url, {
      method: this.method,
      headers: this.headers,
      body: this.body,
    });

    let json = {};
    try {
      json = await res.clone().json();
    } catch {
      // Not JSON, that's fine
    }

    for (const assertFn of this.assertions) {
      await assertFn(res, json);
    }

    return { res, json, context: this.context };
  }
}

module.exports = request;
