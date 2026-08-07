const { JSDOM } = require("jsdom");

const window = new JSDOM(
    "<!doctype html><html><head></head><body></body></html>",
    { pretendToBeVisual: true }
).window;
for (const name of [
    "document",
    "HTMLLinkElement",
    "HTMLStyleElement",
    "HTMLElement",
    "navigator",
    "Node",
    "window"
]) {
    globalThis[name] = window[name];
}
globalThis.self = window;

require("../lib/cjs/index.js");
