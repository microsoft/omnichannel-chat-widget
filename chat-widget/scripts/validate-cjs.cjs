const { JSDOM } = require("jsdom");

const window = new JSDOM(
    "<!doctype html><html><head></head><body></body></html>",
    { pretendToBeVisual: true, url: "http://localhost" }
).window;
for (const name of Object.getOwnPropertyNames(window)) {
    if (!(name in globalThis)) {
        Object.defineProperty(globalThis, name, Object.getOwnPropertyDescriptor(window, name));
    }
}
globalThis.window = window;
globalThis.self = window;
for (const name of [
    "CustomEvent",
    "Event",
    "EventTarget",
    "FocusEvent",
    "KeyboardEvent",
    "MessageEvent",
    "MouseEvent"
]) {
    globalThis[name] = window[name];
}

require("../lib/cjs/index.js");
