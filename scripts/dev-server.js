#!/usr/bin/env node
// Zero-dependency static file server for local development.
// Serves the repo root so index.html can load assets/* via relative paths.
// Run with: npm run dev

const http = require("http");
const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const startPort = Number(process.env.PORT) || 5173;
const MAX_PORT_ATTEMPTS = 10;

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

function requestHandler(req, res) {
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
}

// A fresh server instance per attempt avoids stale "listening" listeners
// piling up on a shared server object across retries — a failed .listen()
// call never fires "listening" for that attempt, so its callback would
// otherwise linger and fire alongside the next attempt's once one succeeds.
function listen(port, attemptsLeft) {
  const server = http.createServer(requestHandler);

  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" && attemptsLeft > 0 && port + 1 <= 65535) {
      console.log(`Port ${port} is already in use, trying ${port + 1}...`);
      listen(port + 1, attemptsLeft - 1);
      return;
    }
    throw err;
  });

  server.listen(port, () => {
    console.log(`Dev server running at http://localhost:${port}`);
  });
}

// attemptsLeft counts retries after the first try, so MAX_PORT_ATTEMPTS - 1
// here means startPort through startPort + MAX_PORT_ATTEMPTS - 1 get tried —
// MAX_PORT_ATTEMPTS ports total.
listen(startPort, MAX_PORT_ATTEMPTS - 1);
