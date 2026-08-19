#!/usr/bin/env node
/**
 * Importador de activos oficiales del cliente hacia el repositorio.
 *
 * Uso:
 *   npm run import-assets -- --source="RUTA_DEL_MATERIAL" [--force] [--dry-run]
 *
 * `--source` debe apuntar a la carpeta "Página web CMC" entregada por el
 * cliente (contiene "Identidad de marca" y "Productos"; opcionalmente
 * "fotos-adicionales/aprobadas" con las fotos editoriales ya aprobadas y
 * renombradas en kebab-case). El script:
 *   - valida que la carpeta exista,
 *   - lista lo que va a importar antes de escribir,
 *   - no sobrescribe archivos existentes salvo con --force,
 *   - pre-dimensiona imágenes de producto y fotos editoriales (máx. 1200 px)
 *     y las convierte a WebP,
 *   - copia los logos sin recomprimir (PNG con transparencia),
 *   - copia las fichas técnicas PDF (archivos "ficha-tecnica-*.pdf" por
 *     carpeta de producto) como ficha-tecnica-<slug>.pdf, sin transformar,
 *   - actualiza scripts/assets-manifest.json fusionando con el contenido
 *     previo (no descarta entradas de corridas anteriores),
 *   - imprime un resumen final.
 *
 * Los archivos importados quedan versionados en public/brand,
 * public/images/products (proveedor STATIC en media_assets) y
 * public/images/photos (fotos editoriales referenciadas por ruta en JSX,
 * sin fila en media_assets).
 */
import { existsSync } from "node:fs";
import { mkdir, readdir, stat, copyFile, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const MAX_WIDTH = 1200;
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);
// Fichas técnicas oficiales: único PDF que se importa por producto.
const TECHNICAL_SHEET_PATTERN = /^ficha[ -]?t[eé]cnica/i;

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

async function collectTechnicalSheets(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter(
      (e) =>
        e.isFile() &&
        path.extname(e.name).toLowerCase() === ".pdf" &&
        TECHNICAL_SHEET_PATTERN.test(e.name)
    )
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
  // Fotos editoriales (panes, preparaciones) aprobadas: copias renombradas de
  // los originales de content-source/fotos-adicionales/, que no se tocan.
  const photosSource = path.join(source, "fotos-adicionales", "aprobadas");
  if (!existsSync(brandSource) && !existsSync(productsSource) && !existsSync(photosSource)) {
    console.error(
      'La carpeta de origen no contiene "Identidad de marca", "Productos" ni "fotos-adicionales/aprobadas". Verifica que --source apunte a la carpeta "Página web CMC".'
    );
    process.exit(1);
  }

  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const brandDest = path.join(repoRoot, "public", "brand");
  const productsDest = path.join(repoRoot, "public", "images", "products");
  const photosDest = path.join(repoRoot, "public", "images", "photos");

  /** @type {{action: string, from: string, to: string, kind: "brand"|"product"|"document"|"photo", productSlug?: string}[]} */
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
      const sheets = await collectTechnicalSheets(path.join(productsSource, dir.name));
      if (sheets.length > 1) {
        console.error(
          `Aviso: ${dir.name} tiene ${sheets.length} fichas técnicas; se importa solo la primera (${path.basename(sheets[0])}).`
        );
      }
      if (sheets.length > 0) {
        jobs.push({
          action: "copiar",
          from: sheets[0],
          to: path.join(productsDest, productSlug, `ficha-tecnica-${productSlug}.pdf`),
          kind: "document",
          productSlug,
        });
      }
    }
  }

  if (existsSync(photosSource)) {
    for (const file of await collectImages(photosSource)) {
      const base = slugify(path.basename(file, path.extname(file)));
      jobs.push({
        action: "redimensionar→webp",
        from: file,
        to: path.join(photosDest, `${base}.webp`),
        kind: "photo",
      });
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

  const manifestPath = path.join(repoRoot, "scripts", "assets-manifest.json");
  // Fusión con el manifiesto previo: las corridas parciales no deben
  // descartar entradas anteriores (marca, archivos omitidos, etc.).
  const manifestByPath = new Map();
  if (existsSync(manifestPath)) {
    try {
      for (const entry of JSON.parse(await readFile(manifestPath, "utf8"))) {
        manifestByPath.set(entry.path, entry);
      }
    } catch {
      console.error("Aviso: no se pudo leer el manifiesto previo; se regenera desde cero.");
    }
  }

  let written = 0;
  let skipped = 0;

  for (const job of jobs) {
    if (existsSync(job.to) && !args.force) {
      skipped++;
      continue;
    }
    await mkdir(path.dirname(job.to), { recursive: true });

    if (job.kind === "product" || job.kind === "photo") {
      await sharp(job.from)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(job.to);
    } else {
      // brand y document se copian sin transformar.
      await copyFile(job.from, job.to);
    }

    const meta = job.kind === "document" ? {} : await sharp(job.to).metadata();
    const info = await stat(job.to);
    manifestByPath.set("/" + path.relative(path.join(repoRoot, "public"), job.to).split(path.sep).join("/"), {
      kind: job.kind,
      productSlug: job.productSlug ?? null,
      path: "/" + path.relative(path.join(repoRoot, "public"), job.to).split(path.sep).join("/"),
      width: meta.width ?? null,
      height: meta.height ?? null,
      sizeBytes: info.size,
    });
    written++;
  }

  // Poda: una entrada cuyo archivo ya no existe en public/ está obsoleta.
  let pruned = 0;
  const manifest = [...manifestByPath.values()]
    .filter((entry) => {
      const exists = existsSync(path.join(repoRoot, "public", ...entry.path.split("/").filter(Boolean)));
      if (!exists) pruned++;
      return exists;
    })
    .sort((a, b) => a.path.localeCompare(b.path));
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  console.log("\nResumen:");
  console.log(`  Escritos:  ${written}`);
  console.log(`  Omitidos (ya existían, usa --force para sobrescribir): ${skipped}`);
  console.log(`  Entradas obsoletas retiradas del manifiesto: ${pruned}`);
  console.log(`  Manifiesto: ${path.relative(repoRoot, manifestPath)}`);
}

main().catch((error) => {
  console.error("Error durante la importación:", error);
  process.exit(1);
});
