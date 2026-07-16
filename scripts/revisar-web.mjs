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
}

// Fundamentos de SEO por pagina: title, meta description, canonical, un solo
// H1, e imagenes con alt. /unknown es la pagina de error interna del crawler
// (ver CLAUDE.md) y no se le exige nada de esto.
const seoIssues = [];

for (const page of pages) {
  const route = page.replace(PUBLIC_DIR, "").replace(/[\\/]index\.html$/, "") || "/";
  if (route.replace(/\\/g, "/") === "/unknown") continue;

  const html = readFileSync(page, "utf8");

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  if (!title) seoIssues.push({ route, issue: "sin <title>" });
  else if (title.length < 10 || title.length > 70)
    seoIssues.push({ route, issue: `<title> de ${title.length} caracteres (objetivo 50-60)` });

  const descMatch = html.match(/<meta\s+content="([^"]*)"\s+name="description"/);
  const desc = descMatch?.[1];
  if (!desc) seoIssues.push({ route, issue: "sin meta description" });
  else if (desc.length < 50 || desc.length > 160)
    seoIssues.push({ route, issue: `meta description de ${desc.length} caracteres (objetivo 120-160)` });

  const hasCanonical = /rel="canonical"/.test(html);
  if (!hasCanonical) seoIssues.push({ route, issue: "sin <link rel=\"canonical\">" });

  const h1Count = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1Count !== 1) seoIssues.push({ route, issue: `${h1Count} etiquetas <h1> (debe haber exactamente 1)` });

  const imgTags = [...html.matchAll(/<img\s[^>]*>/g)].map((m) => m[0]);
  for (const img of imgTags) {
    if (img.includes('id="co-lightbox') || /src="\s*"/.test(img)) continue; // placeholder del visor
    const alt = img.match(/alt="([^"]*)"/)?.[1];
    if (!alt || !alt.trim()) {
      const src = img.match(/src="([^"]*)"/)?.[1] ?? "?";
      seoIssues.push({ route, issue: `imagen sin alt: ${src}` });
    }
  }
}

if (seoIssues.length === 0) {
  console.log("\nSEO: todas las paginas tienen title, meta description, canonical, un H1 y alt en las imagenes.");
} else {
  console.log(`\nSEO (${seoIssues.length} avisos):`);
  for (const { route, issue } of seoIssues) console.log(`  ${route} -> ${issue}`);
}

if (broken.length > 0 || seoIssues.length > 0) process.exit(1);
