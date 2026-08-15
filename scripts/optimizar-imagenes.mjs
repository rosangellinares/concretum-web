// Script puntual: recomprime las fotos de public/media y public/media.base44.com
// (mismo formato y nombre, solo menos peso) y copia el resultado a docs/ para
// que ambos mirrors del sitio queden sincronizados. No es parte del build normal.
import { readdir, stat, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE_DIRS = ["public/media", "public/media.base44.com"];
const MAX_WIDTH = 1600;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function optimize(file) {
  const ext = file.toLowerCase().split(".").pop();
  if (!["jpg", "jpeg", "png"].includes(ext)) return null;

  const before = (await stat(file)).size;
  const input = await readFile(file);
  const meta = await sharp(input).metadata();

  let pipeline = sharp(input);
  if (meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH });
  }

  const buffer =
    ext === "png"
      ? await pipeline.png({ compressionLevel: 9, effort: 10 }).toBuffer()
      : await pipeline.jpeg({ quality: 78, mozjpeg: true }).toBuffer();

  if (buffer.length >= before) return { file, before, after: before, skipped: true };

  await writeFile(file, buffer);
  return { file, before, after: buffer.length, skipped: false };
}

const results = [];
for (const dir of SOURCE_DIRS) {
  for await (const file of walk(join(ROOT, dir))) {
    const r = await optimize(file);
    if (r) results.push(r);
  }
}

let totalBefore = 0;
let totalAfter = 0;
let changed = 0;
for (const r of results) {
  totalBefore += r.before;
  totalAfter += r.after;
  if (!r.skipped) changed++;
}

console.log(`Imagenes procesadas: ${results.length}`);
console.log(`Cambiadas: ${changed}`);
console.log(
  `Peso: ${(totalBefore / 1024 / 1024).toFixed(1)} MB -> ${(totalAfter / 1024 / 1024).toFixed(1)} MB`
);

// Sincroniza docs/ (mismo binario, sin reescribir rutas)
let copied = 0;
for (const r of results) {
  if (r.skipped) continue;
  const rel = relative(join(ROOT, "public"), r.file);
  const dest = join(ROOT, "docs", rel);
  await mkdir(dirname(dest), { recursive: true });
  await copyFile(r.file, dest);
  copied++;
}
console.log(`Copiadas a docs/: ${copied}`);
