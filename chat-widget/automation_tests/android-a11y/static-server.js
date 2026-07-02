// Zero-dependency static file server for the harness page. The Android emulator
// reaches the host machine at 10.0.2.2, so we bind on all interfaces and serve
// the ./public folder. Port is fixed so the emulator URL is stable.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.HARNESS_PORT || 8099);
const ROOT = path.resolve(__dirname, "public");

const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8"
};

const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const rel = urlPath === "/" ? "androidFocusEscape.html" : urlPath.replace(/^\/+/, "");
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT)) {
        res.writeHead(403);
        res.end("forbidden");
        return;
    }
    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("not found");
            return;
        }
        res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
        res.end(data);
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log("Harness server listening on http://0.0.0.0:" + PORT + " (emulator: http://10.0.2.2:" + PORT + ")");
});
