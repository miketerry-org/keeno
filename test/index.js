// index.js: keeno-test

"use strict";

const { test } = require("node:test");
const assert = require("assert");

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

  get(path) {
    this.method = "GET";
    this.path = path;
    return this;
  }

  post(path) {
    this.method = "POST";
    this.path = path;
    return this;
  }

  put(path) {
    this.method = "PUT";
    this.path = path;
    return this;
  }

  patch(path) {
    this.method = "PATCH";
    this.path = path;
    return this;
  }

  delete(path) {
    this.method = "DELETE";
    this.path = path;
    return this;
  }

  /**
   * Append query parameters to the request.
   * @param {Object} params
   * @returns {TestRequest}
   */
  query(params) {
    const str = new URLSearchParams(params).toString();
    this.queryParams += (this.queryParams ? "&" : "?") + str;
    return this;
  }

  /**
   * Set the request body. If given a string, sends it raw. Otherwise, sends JSON.
   * @param {Object|string} body
   * @returns {TestRequest}
   */
  send(body) {
    if (typeof body === "string") {
      this.body = body;
    } else {
      this.body = JSON.stringify(body);
      this.headers["Content-Type"] = "application/json";
    }
    return this;
  }

  /**
   * Set an HTTP header.
   * @param {string} key
   * @param {string} value
   * @returns {TestRequest}
   */
  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  /**
   * Sends cookie from saved context if available.
   * @returns {TestRequest}
   */
  sendCookieFromContext() {
    if (this.context.cookie) {
      this.headers["Cookie"] = this.context.cookie;
    }
    return this;
  }

  /**
   * Expect a specific HTTP status code.
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
   * Assert that a response header equals or includes an expected value.
   * @param {string} key
   * @param {string} expected
   * @param {boolean} [exact=true] - If false, allows partial match (e.g., Content-Type).
   * @returns {TestRequest}
   */
  expectHeader(key, expected, exact = true) {
    this.assertions.push(async res => {
      const actual = res.headers.get(key);
      const match = exact ? actual === expected : actual?.includes(expected);
      if (!match) {
        throw new Error(
          `Expected header '${key}' ${
            exact ? "=" : "to include"
          } '${expected}', got '${actual}'`
        );
      }
    });
    return this;
  }

  /**
   * Expect a specific field in the JSON body.
   * @param {string} key
   * @param {*} expected - Optional value to match.
   * @returns {TestRequest}
   */
  expectBodyField(key, expected) {
    this.assertions.push(async (res, json) => {
      if (!(key in json)) {
        throw new Error(`Expected body to have key '${key}'`);
      }
      if (expected !== undefined && json[key] !== expected) {
        throw new Error(
          `Expected body['${key}'] = '${expected}', got '${json[key]}'`
        );
      }
    });
    return this;
  }

  /**
   * Assert the entire JSON body matches the expected object.
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
   * Assert that response body is exact text match.
   * @param {string} expectedText
   * @returns {TestRequest}
   */
  expectTextBody(expectedText) {
    this.assertions.push(async res => {
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
   * Add a custom assertion function.
   * @param {Function} fn - Function of shape (res, json) => Promise<void>
   * @returns {TestRequest}
   */
  expect(fn) {
    this.assertions.push(fn);
    return this;
  }

  /**
   * Save a field from the response body to the shared context.
   * @param {string} bodyKey
   * @param {string} contextKey
   * @returns {TestRequest}
   */
  saveBodyFieldToContext(bodyKey, contextKey) {
    this.assertions.push(async (res, json) => {
      this.context[contextKey] = json[bodyKey];
    });
    return this;
  }

  /**
   * Save a cookie from the response headers to the context.
   * @param {string} cookieName
   * @returns {TestRequest}
   */
  saveCookieFromResponse(cookieName) {
    this.assertions.push(async res => {
      const setCookie = res.headers.get("set-cookie");
      if (!setCookie) return;
      const match = setCookie
        .split(/,(?=\s*\w+=)/) // split by commas unless inside a cookie value
        .find(c => c.trim().startsWith(`${cookieName}=`));
      if (match) {
        this.context.cookie = match.split(";")[0];
      }
    });
    return this;
  }

  /**
   * Execute the request and run all assertions.
   * @param {boolean} [showDetails=false] - Print request/response info for debugging.
   * @returns {Promise<{ res: Response, json: Object, context: Object }>}
   */
  async run(showDetails = false) {
    const url = `${this.baseURL}${this.path}${this.queryParams}`;

    const requestOptions = {
      method: this.method,
      headers: this.headers,
      body: this.body,
    };

    if (showDetails) {
      console.log("====== REQUEST ======");
      console.log("METHOD:", this.method);
      console.log("URL:", url);
      console.log("HEADERS:", this.headers);
      if (this.body) {
        try {
          console.log("BODY:", JSON.parse(this.body));
        } catch {
          console.log("BODY:", this.body);
        }
      }
      if (this.context.cookie) {
        console.log("COOKIE:", this.context.cookie);
      }
    }

    const res = await fetch(url, requestOptions);

    let json = {};
    let text = "";
    try {
      json = await res.clone().json();
    } catch {
      text = await res.clone().text();
    }

    if (showDetails) {
      console.log("====== RESPONSE ======");
      console.log("STATUS:", res.status);
      console.log("HEADERS:", Object.fromEntries(res.headers.entries()));
      if (Object.keys(json).length > 0) {
        console.log("JSON BODY:", json);
      } else if (text) {
        console.log("TEXT BODY:", text);
      } else {
        console.log("BODY: <empty>");
      }
    }

    for (const assertFn of this.assertions) {
      await assertFn(res, json);
    }

    return { res, json, context: this.context };
  }
}

// alias test to describe and it
const describe = test.describe;
const it = test;

module.exports = {
  request,
  test,
  describe,
  it,
  assert,
};
