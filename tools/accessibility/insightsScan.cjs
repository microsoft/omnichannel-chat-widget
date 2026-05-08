#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Wrapper that serves a built Storybook locally and runs Microsoft's
 * Accessibility Insights CLI (`accessibility-insights-scan`) against it.
 *
 * Accessibility Insights uses axe-core under the hood, so its raw rule set
 * overlaps heavily with `axeScan.cjs`. The value-add is the Microsoft-curated
 * report that maps results to MAS rule IDs, plus the polished HTML output
 * suitable for sharing as a PR artifact.
 *
 * Usage (run from a package root that has `storybook-static/`):
 *   node ../tools/accessibility/insightsScan.cjs
 *
 * Options:
 *   --storybook-dir <path>   Path to built Storybook (default: ./storybook-static)
 *   --report-dir <path>      Output directory (default: ./accessibility-reports/insights)
 *   --port <number>          Port for local static server (default: 0 = random)
 *   --max-urls <number>      Crawl cap (default: 100)
 *   --fail-on-error          Exit non-zero if the CLI reports failures (default: false)
 */

const fs = require("fs");
const http = require("http");
const path = require("path");
const url = require("url");
const { spawn } = require("child_process");

function parseArgs(argv) {
    const args = {
        storybookDir: "./storybook-static",
        reportDir: "./accessibility-reports/insights",
        port: 0,
        maxUrls: 100,
        failOnError: false
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        const next = () => argv[++i];
        switch (a) {
            case "--storybook-dir": args.storybookDir = next(); break;
            case "--report-dir": args.reportDir = next(); break;
            case "--port": args.port = parseInt(next(), 10) || 0; break;
            case "--max-urls": args.maxUrls = parseInt(next(), 10) || 100; break;
            case "--fail-on-error": args.failOnError = true; break;
            case "--help":
            case "-h":
                console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 25).join("\n"));
                process.exit(0);
                break;
            default:
                if (a.startsWith("--")) console.warn(`Unknown flag: ${a}`);
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
                const rel = path.relative(path.resolve(rootDir), resolved);
                if (rel.startsWith("..") || path.isAbsolute(rel)) {
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

function resolveCli() {
    // Prefer the locally installed binary so we don't depend on global install.
    const candidates = [
        path.resolve(process.cwd(), "node_modules", ".bin", process.platform === "win32" ? "ai-scan.cmd" : "ai-scan"),
        path.resolve(process.cwd(), "node_modules", ".bin", process.platform === "win32" ? "accessibility-insights-scan.cmd" : "accessibility-insights-scan")
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
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

    const cli = resolveCli();
    if (!cli) {
        console.error("✗ accessibility-insights-scan CLI not found in node_modules/.bin.");
        console.error("  Run `yarn install` to pick up the foundation devDeps.");
        process.exit(2);
    }

    const server = await startStaticServer(storybookDir, args.port);
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : args.port;
    const baseUrl = `http://127.0.0.1:${port}/iframe.html?id=*&viewMode=story`;
    const seedUrl = `http://127.0.0.1:${port}/`;
    console.log(`🌐 Static server: ${seedUrl}`);
    console.log(`🛡️  Accessibility Insights CLI: ${cli}`);
    console.log(`📁 Report dir: ${reportDir}`);

    const cliArgs = [
        "--url", seedUrl,
        "--output", reportDir,
        "--maxUrls", String(args.maxUrls)
    ];
    console.log(`▶ ${path.basename(cli)} ${cliArgs.join(" ")}`);

    const proc = spawn(cli, cliArgs, { stdio: "inherit", shell: process.platform === "win32" });
    const exitCode = await new Promise((resolve) => {
        proc.on("close", (code) => resolve(code));
        proc.on("error", (err) => {
            console.error(`✗ Failed to spawn CLI: ${err.message}`);
            resolve(2);
        });
    });

    await new Promise((resolve) => server.close(resolve));

    console.log("");
    console.log(`Accessibility Insights CLI exited with code ${exitCode}. Report at ${reportDir}.`);
    if (args.failOnError && exitCode !== 0) {
        process.exit(exitCode);
    }
    // Foundation default: never gate on findings, just surface them.
    void baseUrl;
    process.exit(0);
})().catch((e) => {
    console.error(e && e.stack ? e.stack : e);
    process.exit(2);
});
