/* eslint-disable @typescript-eslint/no-var-requires */
const { writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

writeFileSync(resolve(__dirname, "..", "lib", "cjs", "package.json"), "{\"type\":\"commonjs\"}\n");
