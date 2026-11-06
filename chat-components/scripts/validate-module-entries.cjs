const { readFileSync } = require("node:fs");

const esm = readFileSync("lib/esm/components/prechatsurveypane/PreChatSurveyPane.js", "utf8");
const cjs = readFileSync("lib/cjs/components/prechatsurveypane/PreChatSurveyPane.js", "utf8");

if (!esm.includes('from "adaptivecards"') || esm.includes("adaptivecards/dist/adaptivecards.js")) {
    throw new Error("ESM build must keep the tree-shakeable Adaptive Cards entry.");
}

if (!cjs.includes('require("adaptivecards/dist/adaptivecards.js")')) {
    throw new Error("CommonJS build must use the Adaptive Cards UMD entry.");
}
