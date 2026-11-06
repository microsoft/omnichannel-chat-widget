/* eslint-disable @typescript-eslint/no-var-requires */
const { existsSync } = require("node:fs");
const { execFileSync } = require("node:child_process");
const { dirname, join, resolve } = require("node:path");

const packageRoot = resolve(__dirname, "..");
const repoRoot = resolve(packageRoot, "..");

if (existsSync(join(repoRoot, ".git"))) {
    // Published consumers have no repository metadata and must not install this package's hooks.
    const huskyRoot = dirname(require.resolve("husky", { paths: [packageRoot] }));
    const huskyBin = resolve(huskyRoot, "bin.js");
    execFileSync(process.execPath, [huskyBin, "chat-widget/.husky"], {
        cwd: repoRoot,
        stdio: "inherit"
    });
}
