#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Story-by-story axe-core scan against a built Storybook.
 *
 * Foundation tool. Adding stories automatically expands coverage; no
 * per-component spec files required.
 *
 * Usage (run from a package root that has `storybook-static/`):
 *   node ../tools/accessibility/axeScan.cjs
 *   node ../tools/accessibility/axeScan.cjs --storybook-dir ./storybook-static --fail-on serious
 *
 * Options:
 *   --storybook-dir <path>   Path to built Storybook (default: ./storybook-static)
 *   --report-dir <path>      Directory for JSON report (default: ./accessibility-reports)
 *   --port <number>          Port for local static server (default: 0 = random)
 *   --tags <csv>             axe runOnly tags (default: wcag2a,wcag2aa,wcag21aa,best-practice)
 *   --fail-on <impact>       any|critical|serious|moderate|minor|none (default: none)
 *   --story-timeout <ms>     Per-story timeout (default: 15000)
 *   --include <regex>        Only scan stories whose id matches the pattern
 *   --exclude <regex>        Skip stories whose id matches the pattern
 *
 * Env:
 *   A11Y_SCAN_SKIP_STORIES   Comma-separated story IDs to skip.
 */

const fs = require("fs");
const http = require("http");
const path = require("path");
const url = require("url");

const FAIL_ON_RANK = { none: -1, minor: 0, moderate: 1, serious: 2, critical: 3, any: 0 };

function parseArgs(argv) {
    const args = {
        storybookDir: "./storybook-static",
        reportDir: "./accessibility-reports",
        port: 0,
        tags: "wcag2a,wcag2aa,wcag21aa,best-practice",
        failOn: "none",
        storyTimeout: 15000,
        include: null,
        exclude: null
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        const next = () => argv[++i];
        switch (a) {
            case "--storybook-dir": args.storybookDir = next(); break;
            case "--report-dir": args.reportDir = next(); break;
            case "--port": args.port = parseInt(next(), 10) || 0; break;
            case "--tags": args.tags = next(); break;
            case "--fail-on": args.failOn = next(); break;
            case "--story-timeout": args.storyTimeout = parseInt(next(), 10) || 15000; break;
            case "--include": args.include = new RegExp(next()); break;
            case "--exclude": args.exclude = new RegExp(next()); break;
            case "--help":
            case "-h":
                console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 30).join("\n"));
                process.exit(0);
                break;
            default:
                if (a.startsWith("--")) {
                    console.warn(`Unknown flag: ${a}`);
                }
        }
    }
    return args;
}

const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".map": "application/json",
    ".ico": "image/x-icon"
};

function startStaticServer(rootDir, port) {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            try {
                const parsed = url.parse(req.url || "/");
                let pathname = decodeURIComponent(parsed.pathname || "/");
                if (pathname.endsWith("/")) pathname += "index.html";
                const filePath = path.join(rootDir, pathname);
                const resolved = path.resolve(filePath);
                if (!resolved.startsWith(path.resolve(rootDir))) {
                    res.writeHead(403); res.end("Forbidden"); return;
                }
                fs.stat(resolved, (err, stat) => {
                    if (err || !stat.isFile()) {
                        res.writeHead(404); res.end("Not found"); return;
                    }
                    const ext = path.extname(resolved).toLowerCase();
                    res.writeHead(200, {
                        "Content-Type": MIME[ext] || "application/octet-stream",
                        "Cache-Control": "no-store"
                    });
                    fs.createReadStream(resolved).pipe(res);
                });
            } catch (e) {
                res.writeHead(500); res.end(String(e));
            }
        });
        server.on("error", reject);
        server.listen(port, "127.0.0.1", () => resolve(server));
    });
}

function loadStoryIndex(storybookDir) {
    const indexPath = path.join(storybookDir, "index.json");
    const legacyPath = path.join(storybookDir, "stories.json");
    let raw;
    let source;
    if (fs.existsSync(indexPath)) {
        raw = JSON.parse(fs.readFileSync(indexPath, "utf8"));
        source = "index.json";
    } else if (fs.existsSync(legacyPath)) {
        raw = JSON.parse(fs.readFileSync(legacyPath, "utf8"));
        source = "stories.json";
    } else {
        throw new Error(
            `No index.json or stories.json found under ${storybookDir}. ` +
            "Build Storybook first (yarn build-storybook). For Storybook 6.4 you " +
            "may need to pass --no-version-updates or enable buildStoriesJson."
        );
    }
    const entries = raw.entries || raw.stories || {};
    const stories = Object.values(entries).filter((entry) => {
        const type = entry.type || "story";
        return type === "story";
    }).map((entry) => ({
        id: entry.id,
        title: entry.title,
        name: entry.name
    }));
    return { stories, source };
}

async function scanStory(page, baseUrl, story, axeTags, timeoutMs) {
    const target = `${baseUrl}/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`;
    await page.goto(target, { waitUntil: "load", timeout: timeoutMs });
    // Wait for storybook root to have content. Tolerate either id.
    try {
        await page.waitForFunction(
            () => {
                const root = document.getElementById("storybook-root") || document.getElementById("root");
                return !!root && root.children.length > 0;
            },
            { timeout: timeoutMs }
        );
    } catch (e) {
        return { story, error: `story did not render within ${timeoutMs}ms` };
    }
    // Small settle to let async content render.
    await page.waitForTimeout(150);

    // Lazy-load AxeBuilder to give a clearer error message when missing.
    let AxeBuilder;
    try {
        const axePath = require.resolve("@axe-core/playwright", { paths: [process.cwd()] });
        AxeBuilder = require(axePath).default;
    } catch (e) {
        throw new Error(
            "Missing dependency '@axe-core/playwright'. Run `yarn install` in this " +
            "package to pick up the foundation devDeps."
        );
    }

    const builder = new AxeBuilder({ page });
    if (axeTags && axeTags.length) {
        builder.withTags(axeTags);
    }
    const results = await builder.analyze();
    return { story, results };
}

function summarize(perStory) {
    const counts = { critical: 0, serious: 0, moderate: 0, minor: 0, total: 0 };
    const errors = [];
    for (const item of perStory) {
        if (item.error) {
            errors.push({ id: item.story.id, error: item.error });
            continue;
        }
        for (const v of item.results.violations) {
            counts.total++;
            if (counts[v.impact] !== undefined) counts[v.impact]++;
        }
    }
    return { counts, errors };
}

function highestImpact(counts) {
    if (counts.critical) return "critical";
    if (counts.serious) return "serious";
    if (counts.moderate) return "moderate";
    if (counts.minor) return "minor";
    return "none";
}

(async function main() {
    const args = parseArgs(process.argv.slice(2));
    const cwd = process.cwd();
    const storybookDir = path.resolve(cwd, args.storybookDir);
    const reportDir = path.resolve(cwd, args.reportDir);

    if (!fs.existsSync(storybookDir)) {
        console.error(`✗ Storybook directory not found: ${storybookDir}`);
        console.error("  Run `yarn build-storybook` first.");
        process.exit(2);
    }
    fs.mkdirSync(reportDir, { recursive: true });

    let chromium;
    try {
        const pwPath = require.resolve("playwright", { paths: [cwd] });
        ({ chromium } = require(pwPath));
    } catch (e) {
        console.error("✗ 'playwright' is not installed in this package.");
        console.error("  Run `yarn install` then `yarn playwright install chromium`.");
        process.exit(2);
    }

    const { stories, source } = loadStoryIndex(storybookDir);
    const skipList = new Set((process.env.A11Y_SCAN_SKIP_STORIES || "").split(",").map((s) => s.trim()).filter(Boolean));
    const filtered = stories.filter((s) => {
        if (skipList.has(s.id)) return false;
        if (args.include && !args.include.test(s.id)) return false;
        if (args.exclude && args.exclude.test(s.id)) return false;
        return true;
    });

    console.log(`📚 Found ${stories.length} stories in ${source}; scanning ${filtered.length} after filters.`);

    const server = await startStaticServer(storybookDir, args.port);
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : args.port;
    const baseUrl = `http://127.0.0.1:${port}`;
    console.log(`🌐 Static server: ${baseUrl}`);

    const axeTags = args.tags.split(",").map((t) => t.trim()).filter(Boolean);
    console.log(`🔎 axe tags: ${axeTags.join(", ")}`);

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const perStory = [];
    let i = 0;
    for (const story of filtered) {
        i++;
        process.stdout.write(`  [${i}/${filtered.length}] ${story.id} ... `);
        try {
            const result = await scanStory(page, baseUrl, story, axeTags, args.storyTimeout);
            perStory.push(result);
            if (result.error) {
                process.stdout.write(`SKIP (${result.error})\n`);
            } else {
                const v = result.results.violations.length;
                process.stdout.write(v === 0 ? "ok\n" : `${v} violation(s)\n`);
            }
        } catch (e) {
            perStory.push({ story, error: e.message });
            process.stdout.write(`ERROR (${e.message})\n`);
        }
    }

    await context.close();
    await browser.close();
    await new Promise((resolve) => server.close(resolve));

    const summary = summarize(perStory);
    const reportPath = path.join(reportDir, "axe-report.json");
    fs.writeFileSync(reportPath, JSON.stringify({
        generatedAt: new Date().toISOString(),
        storybookDir,
        baseUrl,
        axeTags,
        summary,
        stories: perStory.map((p) => ({
            id: p.story.id,
            title: p.story.title,
            name: p.story.name,
            error: p.error || null,
            violations: p.results ? p.results.violations : []
        }))
    }, null, 2), "utf8");

    console.log("");
    console.log("═══════════════════════════════════════════");
    console.log(" axe-core scan summary");
    console.log("═══════════════════════════════════════════");
    console.log(`  stories scanned : ${filtered.length}`);
    console.log(`  load errors     : ${summary.errors.length}`);
    console.log(`  violations      : ${summary.counts.total}`);
    console.log(`    critical      : ${summary.counts.critical}`);
    console.log(`    serious       : ${summary.counts.serious}`);
    console.log(`    moderate      : ${summary.counts.moderate}`);
    console.log(`    minor         : ${summary.counts.minor}`);
    console.log(`  report          : ${reportPath}`);
    console.log("═══════════════════════════════════════════");

    const failOn = args.failOn.toLowerCase();
    const threshold = FAIL_ON_RANK[failOn];
    if (threshold === undefined) {
        console.warn(`Unknown --fail-on value '${args.failOn}'. Treating as 'none'.`);
    }
    const highest = highestImpact(summary.counts);
    const highestRank = FAIL_ON_RANK[highest];
    if (failOn !== "none" && threshold !== undefined && highestRank >= threshold && summary.counts.total > 0) {
        console.error(`✗ Failing because highest impact (${highest}) >= --fail-on (${failOn}).`);
        process.exit(1);
    }
    if (failOn !== "none" && summary.errors.length > 0 && failOn === "any") {
        console.error(`✗ Failing because ${summary.errors.length} story load error(s) occurred.`);
        process.exit(1);
    }
    process.exit(0);
})().catch((e) => {
    console.error(e && e.stack ? e.stack : e);
    process.exit(2);
});
