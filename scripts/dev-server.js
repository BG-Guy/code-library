#!/usr/bin/env node
// Zero-dependency static file server for local development.
// Serves the repo root so index.html can load assets/* via relative paths.
// Run with: npm run dev

const http = require("http");
const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const port = process.env.PORT || 5173;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  let requestPath;
  try {
    requestPath = decodeURIComponent(req.url.split("?")[0]);
  } catch (err) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("400 Bad Request");
    return;
  }

  let filePath = path.join(repoRoot, requestPath === "/" ? "index.html" : requestPath);

  // Guard against escaping the repo root via "..". Comparing against
  // repoRoot + sep (rather than a bare startsWith) stops a sibling directory
  // that merely shares repoRoot's name as a string prefix from matching.
  if (filePath !== repoRoot && !filePath.startsWith(repoRoot + path.sep)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      res.end(data);
    });
  });
});

server.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
});
