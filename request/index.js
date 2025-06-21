// index.js: keeno-rest

"use strict";

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

  query(params) {
    const str = new URLSearchParams(params).toString();
    this.queryParams += (this.queryParams ? "&" : "?") + str;
    return this;
  }

  send(body) {
    this.body = JSON.stringify(body);
    this.headers["Content-Type"] = "application/json";
    return this;
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  sendCookieFromContext() {
    if (this.context.cookie) {
      this.headers["Cookie"] = this.context.cookie;
    }
    return this;
  }

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
      const actual = res.headers.get(key.toLowerCase());
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

  expect(fn) {
    this.assertions.push(fn);
    return this;
  }

  saveBodyFieldToContext(bodyKey, contextKey) {
    this.assertions.push(async (res, json) => {
      this.context[contextKey] = json[bodyKey];
    });
    return this;
  }

  saveCookieFromResponse(cookieName) {
    this.assertions.push(async res => {
      const raw = res.headers.raw()["set-cookie"];
      if (!raw) return;
      const cookie = raw.find(c => c.startsWith(`${cookieName}=`));
      if (cookie) {
        this.context.cookie = cookie.split(";")[0];
      }
    });
    return this;
  }

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

    // console.log("requestOptions", requestOptions);
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

module.exports = request;
