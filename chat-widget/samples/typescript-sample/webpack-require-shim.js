// Simple require shim for browser environment
// This provides a basic require function that can handle simple module requests

function requireShim(moduleName) {
    // Handle Node.js built-in modules with polyfills
    const polyfills = {
        "crypto": require("crypto-browserify"),
        "stream": require("stream-browserify"),
        "path": require("path-browserify"),
        "os": require("os-browserify/browser"),
        "util": require("util"),
        "buffer": require("buffer"),
        "process": require("process/browser.js"),
        "assert": require("assert"),
        "url": require("url"),
        "querystring": require("querystring-es3"),
        "fs": {},
        "module": {}
    };

    if (polyfills[moduleName]) {
        return polyfills[moduleName];
    }

    // For unknown modules, try to use the webpack require
    try {
        return __webpack_require__(moduleName);
    } catch (e) {
        console.warn(`Module '${moduleName}' not found, returning empty object`);
        return {};
    }
}

module.exports = requireShim;
