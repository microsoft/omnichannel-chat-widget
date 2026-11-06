const { writeFileSync } = require("node:fs");

writeFileSync("lib/cjs/package.json", "{\"type\":\"commonjs\"}\n");
