const { readFileSync } = require("node:fs");

const report = JSON.parse(readFileSync(process.argv[2], "utf8"));
const vulnerabilities = report.vulnerabilities ?? {};
const allowedAdvisories = new Set([
    "https://github.com/advisories/GHSA-5qjj-4xww-7phc",
    "https://github.com/advisories/GHSA-vccv-cmxp-4j9h",
    "https://github.com/advisories/GHSA-w5hq-g745-h8pq"
]);
const foundAdvisories = new Set();
const missingReferences = new Set();

const collectAdvisories = (name, visited = new Set()) => {
    if (visited.has(name)) {
        return;
    }
    visited.add(name);

    const vulnerability = vulnerabilities[name];
    if (!vulnerability) {
        missingReferences.add(name);
        return;
    }

    for (const via of vulnerability.via ?? []) {
        if (typeof via === "string") {
            collectAdvisories(via, visited);
        } else if (via.url) {
            foundAdvisories.add(via.url);
        }
    }
};

for (const name of Object.keys(vulnerabilities)) {
    collectAdvisories(name);
}

const unexpected = [...foundAdvisories].filter((url) => !allowedAdvisories.has(url));
if (unexpected.length || missingReferences.size) {
    console.error("Unexpected packed-consumer audit findings:");
    for (const url of unexpected) {
        console.error(`- ${url}`);
    }
    for (const name of missingReferences) {
        console.error(`- unresolved dependency reference: ${name}`);
    }
    process.exit(1);
}

if (foundAdvisories.size) {
    console.log("Only reviewed audit-only advisories remain:");
    for (const url of foundAdvisories) {
        console.log(`- ${url}`);
    }
}
