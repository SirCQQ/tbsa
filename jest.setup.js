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
