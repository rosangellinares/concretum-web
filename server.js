import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = join(import.meta.dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

function resolveRoute(pathname) {
  const decoded = decodeURIComponent(pathname);
  const safePath = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const requested = join(PUBLIC_DIR, safePath);

  if (!requested.startsWith(PUBLIC_DIR)) return null;

  if (existsSync(requested) && statSync(requested).isFile()) return { filePath: requested };

  const indexCandidate = join(requested, "index.html");
  if (existsSync(indexCandidate)) return { filePath: indexCandidate, isDirIndex: true };

  return null;
}

const server = createServer((req, res) => {
  const [pathname, query = ""] = req.url.split(/(?=\?)/);

  // Redirect legacy /path/index.html URLs (bookmarks, old links) to the clean
  // directory form /path/, matching how the site now links internally.
  if (pathname.endsWith("/index.html")) {
    res.writeHead(301, { Location: pathname.slice(0, -"index.html".length) + query });
    res.end();
    return;
  }

  const route = resolveRoute(pathname);

  if (!route) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
    return;
  }

  // Normalize directory routes to a trailing slash so the pages' relative links
  // (../contact/, ../../) resolve against the right base path.
  if (route.isDirIndex && !pathname.endsWith("/")) {
    res.writeHead(301, { Location: pathname + "/" + query });
    res.end();
    return;
  }

  const filePath = route.filePath;

  const headers = { "Content-Type": MIME_TYPES[extname(filePath)] || "application/octet-stream" };
  headers["Cache-Control"] = filePath.endsWith("/sw.js") || filePath.endsWith("\\sw.js")
    ? "no-cache"
    : "public, max-age=3600";

  res.writeHead(200, headers);
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`concretum-web-modern listening on http://localhost:${PORT}`);
});
