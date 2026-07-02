// Extracts the real setAriaHiddenForSiblings function from the product source
// (chat-widget/src/common/utils.ts) and emits a tiny browser bundle that exposes
// it as window.LcwA11y. We extract rather than import the whole module because
// utils.ts pulls in the Omnichannel SDK graph (which needs Node built-ins and is
// not browser-safe). The function itself has zero imports and is pure DOM, so a
// direct extract stays byte-faithful to whatever the current source is. That is
// what makes the RED/GREEN validation honest: the harness always runs the exact
// code that ships, so reverting the source flips the harness result.
const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const utilsPath = path.resolve(__dirname, "../../src/common/utils.ts");
const src = fs.readFileSync(utilsPath, "utf8");

const marker = "export const setAriaHiddenForSiblings";
const start = src.indexOf(marker);
if (start === -1) {
    throw new Error("Could not find setAriaHiddenForSiblings in " + utilsPath);
}
const rest = src.slice(start);
const endRel = rest.indexOf("\n};");
if (endRel === -1) {
    throw new Error("Could not find the end of setAriaHiddenForSiblings (column-0 '};').");
}
let fnText = rest.slice(0, endRel + 3); // include the trailing "\n};"
fnText = fnText.replace(/^export\s+/, ""); // export const ... -> const ...

const entryTs =
    fnText +
    "\n;(window).LcwA11y = { setAriaHiddenForSiblings: setAriaHiddenForSiblings };\n";

const outDir = path.resolve(__dirname, "public");
fs.mkdirSync(outDir, { recursive: true });
const result = esbuild.transformSync(entryTs, { loader: "ts", target: "es2017" });
const outFile = path.join(outDir, "focusEscapeUtil.bundle.js");
fs.writeFileSync(outFile, result.code, "utf8");

console.log("Built " + outFile + " from source (" + fnText.length + " chars extracted).");
