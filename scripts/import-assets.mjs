#!/usr/bin/env node
/**
 * Importador de activos oficiales del cliente hacia el repositorio.
 *
 * Uso:
 *   npm run import-assets -- --source="RUTA_DEL_MATERIAL" [--force] [--dry-run]
 *
 * `--source` debe apuntar a la carpeta "Página web CMC" entregada por el
 * cliente (contiene "Identidad de marca" y "Productos"). El script:
 *   - valida que la carpeta exista,
 *   - lista lo que va a importar antes de escribir,
 *   - no sobrescribe archivos existentes salvo con --force,
 *   - pre-dimensiona imágenes de producto (máx. 1200 px) y las convierte a WebP,
 *   - copia los logos sin recomprimir (PNG con transparencia),
 *   - escribe un manifiesto con dimensiones en scripts/assets-manifest.json,
 *   - imprime un resumen final.
 *
 * Los archivos importados quedan versionados en public/brand y
 * public/images/products (proveedor STATIC en media_assets).
 */
import { existsSync } from "node:fs";
import { mkdir, readdir, stat, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const MAX_WIDTH = 1200;
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

function parseArgs(argv) {
  const args = { source: null, force: false, dryRun: false };
  for (const arg of argv) {
    if (arg.startsWith("--source=")) args.source = arg.slice("--source=".length);
    else if (arg === "--force") args.force = true;
    else if (arg === "--dry-run") args.dryRun = true;
  }
  return args;
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function collectImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && IMAGE_EXTENSIONS.has(path.extname(e.name).toLowerCase()))
    .map((e) => path.join(dir, e.name));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.source) {
    console.error('Falta el argumento --source. Ejemplo:\n  npm run import-assets -- --source="C:\\ruta\\Página web CMC"');
    process.exit(1);
  }

  const source = path.resolve(args.source);
  if (!existsSync(source)) {
    console.error(`La carpeta de origen no existe: ${source}`);
    process.exit(1);
  }

  const brandSource = path.join(source, "Identidad de marca");
  const productsSource = path.join(source, "Productos");
  if (!existsSync(brandSource) && !existsSync(productsSource)) {
    console.error(
      'La carpeta de origen no contiene "Identidad de marca" ni "Productos". Verifica que --source apunte a la carpeta "Página web CMC".'
    );
    process.exit(1);
  }

  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const brandDest = path.join(repoRoot, "public", "brand");
  const productsDest = path.join(repoRoot, "public", "images", "products");

  /** @type {{action: string, from: string, to: string, kind: "brand"|"product", productSlug?: string}[]} */
  const jobs = [];

  if (existsSync(brandSource)) {
    for (const file of await collectImages(brandSource)) {
      const name = slugify(path.basename(file, path.extname(file))) + path.extname(file).toLowerCase();
      jobs.push({ action: "copiar", from: file, to: path.join(brandDest, name), kind: "brand" });
    }
  }

  if (existsSync(productsSource)) {
    const productDirs = (await readdir(productsSource, { withFileTypes: true })).filter((e) => e.isDirectory());
    for (const dir of productDirs) {
      const productSlug = slugify(dir.name);
      for (const file of await collectImages(path.join(productsSource, dir.name))) {
        const base = slugify(path.basename(file, path.extname(file)));
        jobs.push({
          action: "redimensionar→webp",
          from: file,
          to: path.join(productsDest, productSlug, `${base}.webp`),
          kind: "product",
          productSlug,
        });
      }
    }
  }

  if (jobs.length === 0) {
    console.log("No se encontraron imágenes para importar.");
    return;
  }

  console.log(`Se importarán ${jobs.length} archivos desde:\n  ${source}\n`);
  for (const job of jobs) {
    console.log(`  [${job.action}] ${path.relative(source, job.from)} → ${path.relative(repoRoot, job.to)}`);
  }

  if (args.dryRun) {
    console.log("\n--dry-run: no se escribió ningún archivo.");
    return;
  }

  const manifest = [];
  let written = 0;
  let skipped = 0;

  for (const job of jobs) {
    if (existsSync(job.to) && !args.force) {
      skipped++;
      continue;
    }
    await mkdir(path.dirname(job.to), { recursive: true });

    if (job.kind === "brand") {
      await copyFile(job.from, job.to);
    } else {
      await sharp(job.from)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(job.to);
    }

    const meta = await sharp(job.to).metadata();
    const info = await stat(job.to);
    manifest.push({
      kind: job.kind,
      productSlug: job.productSlug ?? null,
      path: "/" + path.relative(path.join(repoRoot, "public"), job.to).split(path.sep).join("/"),
      width: meta.width ?? null,
      height: meta.height ?? null,
      sizeBytes: info.size,
    });
    written++;
  }

  const manifestPath = path.join(repoRoot, "scripts", "assets-manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  console.log("\nResumen:");
  console.log(`  Escritos:  ${written}`);
  console.log(`  Omitidos (ya existían, usa --force para sobrescribir): ${skipped}`);
  console.log(`  Manifiesto: ${path.relative(repoRoot, manifestPath)}`);
}

main().catch((error) => {
  console.error("Error durante la importación:", error);
  process.exit(1);
});
