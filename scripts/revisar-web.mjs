// Comprueba que el sitio de public/ no tiene nada roto: todas las paginas
// resuelven y ningun enlace, imagen, hoja de estilo o script apunta a algo
// inexistente. Resuelve las rutas igual que server.js (fichero, o <ruta>/index.html).
//
//   node scripts/revisar-web.mjs

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const PUBLIC_DIR = join(import.meta.dirname, "..", "public");

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

// Mismo criterio que resolveFilePath() en server.js.
function resolves(target) {
  if (existsSync(target) && statSync(target).isFile()) return true;
  return existsSync(join(target, "index.html"));
}

const pages = htmlFiles(PUBLIC_DIR);
const broken = [];
let checked = 0;

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);

  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/i.test(ref)) continue;

    const [path] = ref.split(/[?#]/);
    if (!path) continue;

    const target = path.startsWith("/")
      ? join(PUBLIC_DIR, path)
      : resolve(dirname(page), path);

    checked++;
    if (!resolves(target)) {
      broken.push({ page: page.replace(PUBLIC_DIR, "") || "/", ref });
    }
  }
}

const routes = pages
  .map((p) => p.replace(PUBLIC_DIR, "").replace(/\/index\.html$/, "") || "/")
  .sort();

console.log(`Paginas: ${routes.length}`);
for (const route of routes) console.log(`  ${route}`);
console.log(`\nReferencias comprobadas: ${checked}`);

if (broken.length === 0) {
  console.log("Roto: nada. Todo resuelve.");
} else {
  console.log(`\nROTO (${broken.length}):`);
  for (const { page, ref } of broken) console.log(`  ${page} -> ${ref}`);
  process.exit(1);
}
