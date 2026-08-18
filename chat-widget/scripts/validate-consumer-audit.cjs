/* eslint-disable @typescript-eslint/no-var-requires */
const { existsSync, readFileSync } = require("node:fs");
const { dirname, join, parse, resolve } = require("node:path");

const reportPath = resolve(process.argv[2]);
const consumerRoot = dirname(reportPath);
const report = JSON.parse(readFileSync(reportPath, "utf8"));
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
const WEBCHAT = "botframework-webchat";
const CHAT_SDK = "@microsoft/omnichannel-chat-sdk";
const allowedAdvisories = new Map([
    ["linkify-it@4.0.1 -> https://github.com/advisories/GHSA-22p9-wv53-3rq4", [WEBCHAT]], // Fuzzy-link quadratic scan.
    ["linkify-it@4.0.1 -> https://github.com/advisories/GHSA-v245-v573-v5vm", [WEBCHAT]], // Mailto quadratic scan.
    ["markdown-it@13.0.2 -> https://github.com/advisories/GHSA-38c4-r59v-3vqw", [WEBCHAT]], // ReDoS in markdown parsing.
    ["markdown-it@13.0.2 -> https://github.com/advisories/GHSA-6v5v-wf23-fmfq", [WEBCHAT]], // Smartquotes quadratic scan.
    ["@babel/runtime@7.14.8 -> https://github.com/advisories/GHSA-968p-4wvh-cqc8", [WEBCHAT]], // Named-capture replacement ReDoS.
    ["@babel/runtime@7.15.4 -> https://github.com/advisories/GHSA-968p-4wvh-cqc8", [WEBCHAT]], // Named-capture replacement ReDoS.
    ["@babel/runtime@7.19.0 -> https://github.com/advisories/GHSA-968p-4wvh-cqc8", [WEBCHAT]], // Named-capture replacement ReDoS.
    ["@babel/runtime-corejs3@7.20.13 -> https://github.com/advisories/GHSA-968p-4wvh-cqc8", [WEBCHAT]], // Named-capture replacement ReDoS.
    ["sanitize-html@2.14.0 -> https://github.com/advisories/GHSA-vccv-cmxp-4j9h", [WEBCHAT]], // URI scheme validation gap.
    ["swiper@8.4.7 -> https://github.com/advisories/GHSA-hmx5-qpq5-p643", [WEBCHAT]], // Prototype pollution.
    ["valibot@1.1.0 -> https://github.com/advisories/GHSA-5qjj-4xww-7phc", [WEBCHAT]], // Inherited-key flatten failure.
    ["valibot@1.1.0 -> https://github.com/advisories/GHSA-vqpr-j7v3-hqw9", [WEBCHAT]], // Emoji validation ReDoS.
    ["uuid@3.4.0 -> https://github.com/advisories/GHSA-w5hq-g745-h8pq", [WEBCHAT]], // Out-of-bounds buffer writes.
    ["uuid@8.3.2 -> https://github.com/advisories/GHSA-w5hq-g745-h8pq", [WEBCHAT, CHAT_SDK]], // Shared WebChat and Azure Signaling path.
    ["uuid@9.0.1 -> https://github.com/advisories/GHSA-w5hq-g745-h8pq", [WEBCHAT]] // Out-of-bounds buffer writes.
]);
const foundAdvisories = new Set();
const unexpected = new Set();
const missingReferences = new Set();
const dependencyOwners = new Map();
const widgetRoot = resolve(consumerRoot, "node_modules", "@microsoft", "omnichannel-chat-widget");

const resolveInstalledDependency = (packageRoot, dependencyName) => {
    let current = packageRoot;
    const root = parse(current).root;

    while (current !== root) {
        const candidate = resolve(current, "node_modules", dependencyName);
        if (existsSync(resolve(candidate, "package.json"))) {
            return candidate;
        }
        current = dirname(current);
    }

    return undefined;
};

if (!resolveInstalledDependency(widgetRoot, WEBCHAT)) {
    console.error("Packed consumer does not contain botframework-webchat.");
    process.exit(1);
}

const collectDependencyPaths = (packageRoot, owner, visited = new Set()) => {
    const normalizedRoot = resolve(packageRoot);
    const owners = dependencyOwners.get(normalizedRoot) ?? new Set();
    owners.add(owner);
    dependencyOwners.set(normalizedRoot, owners);

    if (visited.has(normalizedRoot)) {
        return;
    }
    visited.add(normalizedRoot);

    const packageJson = JSON.parse(readFileSync(join(normalizedRoot, "package.json"), "utf8"));
    const optionalDependencies = packageJson.optionalDependencies ?? {};
    const dependencies = {
        ...packageJson.dependencies,
        ...optionalDependencies
    };

    for (const dependencyName of Object.keys(dependencies)) {
        const dependencyRoot = resolveInstalledDependency(normalizedRoot, dependencyName);
        if (dependencyRoot) {
            collectDependencyPaths(dependencyRoot, owner, visited);
        } else if (!(dependencyName in optionalDependencies)) {
            throw new Error(`Cannot resolve ${dependencyName} from ${packageJson.name}@${packageJson.version}.`);
        }
    }
};

const widgetPackageJson = JSON.parse(readFileSync(join(widgetRoot, "package.json"), "utf8"));
for (const dependencyName of Object.keys(widgetPackageJson.dependencies ?? {})) {
    const dependencyRoot = resolveInstalledDependency(widgetRoot, dependencyName);
    if (!dependencyRoot) {
        throw new Error(`Cannot resolve ${dependencyName} from ${widgetPackageJson.name}@${widgetPackageJson.version}.`);
    }
    collectDependencyPaths(dependencyRoot, dependencyName);
}

for (const [name, vulnerability] of Object.entries(vulnerabilities)) {
    for (const via of vulnerability.via ?? []) {
        if (typeof via === "string") {
            if (!vulnerabilities[via]) {
                missingReferences.add(`${name} -> ${via}`);
            }
        } else if (via.url) {
            const nodes = vulnerability.nodes ?? [];
            if (!nodes.length) {
                unexpected.add(`${name}@unknown -> ${via.url} (no installed node)`);
            }

            for (const node of nodes) {
                const installedPath = resolve(consumerRoot, node);
                const installedPackage = JSON.parse(readFileSync(resolve(installedPath, "package.json"), "utf8"));
                const finding = `${installedPackage.name}@${installedPackage.version} -> ${via.url}`;
                const allowedOwners = allowedAdvisories.get(finding) ?? [];
                const actualOwners = [...(dependencyOwners.get(installedPath) ?? [])];
                const hasOnlyAllowedOwners = actualOwners.length > 0
                    && actualOwners.every((owner) => allowedOwners.includes(owner));

                if (allowedOwners.length && hasOnlyAllowedOwners) {
                    foundAdvisories.add(finding);
                } else {
                    unexpected.add(`${finding} (${node}; owners: ${actualOwners.join(", ") || "unknown"})`);
                }
            }
        }
    }
}

if (unexpected.size) {
    console.error("Unexpected packed-consumer audit findings:");
    for (const finding of unexpected) {
        console.error(`- ${finding}`);
    }
    process.exit(1);
}

if (foundAdvisories.size) {
    console.log("Only reviewed audit-only advisories remain:");
    for (const finding of foundAdvisories) {
        console.log(`- ${finding}`);
    }
}

if (missingReferences.size) {
    console.warn("Audit report omitted referenced dependency entries:");
    for (const reference of missingReferences) {
        console.warn(`- ${reference}`);
    }
}
