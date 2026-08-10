const { readFileSync } = require("node:fs");

const report = JSON.parse(readFileSync(process.argv[2], "utf8"));
if (
    report.error ||
    typeof report.vulnerabilities !== "object" ||
    report.vulnerabilities === null ||
    Array.isArray(report.vulnerabilities)
) {
    console.error("Packed-consumer audit did not return a valid vulnerability report.");
    process.exit(1);
}

const vulnerabilities = report.vulnerabilities;
const allowedAdvisories = new Set([
    "https://github.com/advisories/GHSA-22p9-wv53-3rq4",
    "https://github.com/advisories/GHSA-38c4-r59v-3vqw",
    "https://github.com/advisories/GHSA-5qjj-4xww-7phc",
    "https://github.com/advisories/GHSA-6v5v-wf23-fmfq",
    "https://github.com/advisories/GHSA-968p-4wvh-cqc8",
    "https://github.com/advisories/GHSA-hmx5-qpq5-p643",
    "https://github.com/advisories/GHSA-v245-v573-v5vm",
    "https://github.com/advisories/GHSA-vccv-cmxp-4j9h",
    "https://github.com/advisories/GHSA-vqpr-j7v3-hqw9",
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
