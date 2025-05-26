import "@testing-library/jest-dom";

// Polyfill for TextEncoder/TextDecoder in test environment
global.TextEncoder = class {
  encode(input) {
    return new Uint8Array(Buffer.from(input, "utf8"));
  }
};

global.TextDecoder = class {
  decode(input) {
    return Buffer.from(input).toString("utf8");
  }
};
// Mock console methods to avoid noise in test output
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
};

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  console.info = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
});
// Polyfill for Web APIs
global.Request = class Request {
  constructor(input, init = {}) {
    this.url = input;
    this.method = init.method || "GET";
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body;
  }
};

global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || "OK";
    this.headers = new Map(Object.entries(init.headers || {}));
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }

  text() {
    return Promise.resolve(this.body);
  }
};

global.Headers = class Headers extends Map {
  constructor(init) {
    super();
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.set(key, value));
      } else if (typeof init === "object") {
        Object.entries(init).forEach(([key, value]) => this.set(key, value));
      }
    }
  }

  get(name) {
    return super.get(name.toLowerCase());
  }

  set(name, value) {
    return super.set(name.toLowerCase(), value);
  }

  has(name) {
    return super.has(name.toLowerCase());
  }

  delete(name) {
    return super.delete(name.toLowerCase());
  }
};

// Mock crypto.subtle for Web Crypto API
global.crypto = {
  subtle: {
    digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
  },
  getRandomValues: jest.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
};
