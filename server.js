import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = join(import.meta.dirname, "public");

// Carga opcional de .env (no versionado) para desarrollo local; en producción
// las variables las inyecta docker-compose vía env_file.
const ENV_PATH = join(import.meta.dirname, ".env");
if (existsSync(ENV_PATH)) {
  for (const line of readFileSync(ENV_PATH, "utf8").split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

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

function resolveFilePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const safePath = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const requested = join(PUBLIC_DIR, safePath);

  if (!requested.startsWith(PUBLIC_DIR)) return null;

  if (existsSync(requested) && statSync(requested).isFile()) return requested;

  const indexCandidate = join(requested, "index.html");
  if (existsSync(indexCandidate)) return indexCandidate;

  return null;
}

const server = createServer((req, res) => {
  const [pathname, query = ""] = req.url.split(/(?=\?)/);

  if (req.method === "POST" && pathname === "/api/notify-telegram") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      res.writeHead(204);
      res.end();
      sendTelegramAlert(body);
    });
    return;
  }

  // Canonical URL form is extensionless and slash-less (/about, not /about/ or
  // /about/index.html). Redirect the legacy/trailing-slash variants to it; the
  // pages link with absolute root-relative paths, so no trailing slash is needed.
  const canonical = pathname.replace(/\/index\.html$/, "").replace(/(.)\/$/, "$1");
  if (canonical !== pathname) {
    res.writeHead(301, { Location: (canonical || "/") + query });
    res.end();
    return;
  }

  const filePath = resolveFilePath(pathname);

  if (!filePath) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
    return;
  }

  const headers = { "Content-Type": MIME_TYPES[extname(filePath)] || "application/octet-stream" };
  headers["Cache-Control"] = filePath.endsWith("/sw.js") || filePath.endsWith("\\sw.js")
    ? "no-cache"
    : "public, max-age=3600";

  res.writeHead(200, headers);
  createReadStream(filePath).pipe(res);
});

async function sendTelegramAlert(rawBody) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID no configuradas; alerta omitida");
    return;
  }

  try {
    const { name = "", contact = "", serviceType = "" } = JSON.parse(rawBody);
    const text = `Nueva solicitud de contacto\nNombre: ${name}\nContacto: ${contact}\nServicio: ${serviceType}`;
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (err) {
    console.error("Fallo al enviar alerta de Telegram:", err.message);
  }
}

server.listen(PORT, () => {
  console.log(`concretum-web-modern listening on http://localhost:${PORT}`);
});
