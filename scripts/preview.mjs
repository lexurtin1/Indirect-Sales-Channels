// Local preview with the same paths as vercel.json.
// Run: node scripts/preview.mjs
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".geojson": "application/geo+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function route(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  if (clean === "/") return "/site/index.html";
  const page = clean.match(/^\/pages\/([a-z0-9-]+)\/?$/);
  if (page) return "/site/pages/" + page[1] + ".html";
  if (clean.startsWith("/shared/") || clean.startsWith("/assets/")) return "/site" + clean;
  return clean;
}

const server = http.createServer((req, res) => {
  const rel = route(req.url || "/");
  const file = path.normalize(path.join(root, rel));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(file);
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log("Preview at http://localhost:" + port);
});
