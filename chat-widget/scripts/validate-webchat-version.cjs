const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");

const requiredVersion = "4.18.1-hotfix.20260308.b15b405";
const packageJson = JSON.parse(readFileSync(resolve(__dirname, "..", "package.json"), "utf8"));
const configuredVersion = packageJson.dependencies?.["botframework-webchat"];

if (configuredVersion !== requiredVersion) {
    console.error(
        `botframework-webchat must remain at ${requiredVersion}. Found ${configuredVersion ?? "no version"}. ` +
        "Read the WebChat dependency constraint in chat-widget/README.md."
    );
    process.exit(1);
}
