/* eslint-disable @typescript-eslint/no-var-requires */
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");

const packageRoot = resolve(__dirname, "..");
const packageJson = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8"));
const readme = readFileSync(resolve(packageRoot, "README.md"), "utf8");
const requiredVersion = readme.match(/must use `botframework-webchat@([^`]+)`/)?.[1];
const configuredVersion = packageJson.dependencies?.["botframework-webchat"];
const installedVersion = JSON.parse(
    readFileSync(resolve(packageRoot, "node_modules", "botframework-webchat", "package.json"), "utf8")
).version;

if (!requiredVersion || configuredVersion !== requiredVersion || installedVersion !== requiredVersion) {
    console.error(
        `botframework-webchat must match the README constraint (${requiredVersion ?? "missing"}). ` +
        `Configured: ${configuredVersion ?? "missing"}. Installed: ${installedVersion ?? "missing"}. ` +
        "Read the WebChat dependency constraint in chat-widget/README.md."
    );
    process.exit(1);
}
