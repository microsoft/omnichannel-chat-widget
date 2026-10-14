global.WritableStream = class {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}
    getWriter() {
        return {
            write: jest.fn(),
            close: jest.fn(),
            abort: jest.fn(),
        };
    }
};

// jsdom does not expose Node's Web Crypto API on the global, but the ACS WebChat
// adapter (>= 0.0.1-beta.8) reads `crypto.subtle` at module-load time. Without
// this polyfill, any test that transitively imports `@microsoft/omnichannel-chat-sdk`
// fails with: "TypeError: Cannot read properties of undefined (reading 'subtle')".
if (typeof global.crypto === "undefined" || typeof global.crypto.subtle === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { webcrypto } = require("crypto");
    Object.defineProperty(global, "crypto", {
        value: webcrypto,
        configurable: true,
        writable: true,
    });
}