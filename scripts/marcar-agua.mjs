// Graba el logo (marca de agua) directamente en los pixeles de las fotos de
// proyectos y servicios, para que no se pueda "quitar" guardando la imagen.
// Uso:
//   node scripts/marcar-agua.mjs --list ruta/lista.txt   (procesa esa lista)
//   node scripts/marcar-agua.mjs --test ruta/una.jpg out.jpg  (prueba 1 sola)
import { Jimp } from "jimp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const logoSvgPath = path.join(publicDir, "img-logo.svg");

function extractLogoPng() {
  const svg = fs.readFileSync(logoSvgPath, "utf8");
  const m = svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
  if (!m) throw new Error("No se encontro el PNG embebido en img-logo.svg");
  return Buffer.from(m[1], "base64");
}

async function stampImage(logo, srcPath, destPath) {
  const image = await Jimp.read(srcPath);
  const targetWidth = Math.round(image.bitmap.width * 0.28);
  const scaled = logo.clone().resize({ w: targetWidth });
  scaled.opacity(0.85);
  const margin = Math.max(10, Math.round(image.bitmap.width * 0.02));
  const x = image.bitmap.width - scaled.bitmap.width - margin;
  const y = image.bitmap.height - scaled.bitmap.height - margin;
  image.composite(scaled, x, y);
  await image.write(destPath);
}

const args = process.argv.slice(2);
const logoPng = extractLogoPng();
const logo = await Jimp.read(logoPng);

if (args[0] === "--test") {
  const [, src, out] = args;
  await stampImage(logo, src, out);
  console.log("Prueba escrita en", out);
  process.exit(0);
}

if (args[0] === "--list") {
  const listPath = args[1];
  const lines = fs
    .readFileSync(listPath, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  let done = 0;
  for (const rel of lines) {
    const abs = path.join(publicDir, rel);
    await stampImage(logo, abs, abs);
    done++;
  }
  console.log(`Marca de agua grabada en ${done} fotos.`);
  process.exit(0);
}

console.error("Uso: --test <src> <out>  |  --list <archivo-de-rutas>");
process.exit(1);
