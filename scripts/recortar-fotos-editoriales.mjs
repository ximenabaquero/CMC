#!/usr/bin/env node
/**
 * Recorte con transparencia de una foto editorial aprobada (fondo blanco puro).
 *
 * Uso:
 *   node scripts/recortar-foto-panes.mjs [--preview="RUTA_PNG"]
 *
 * Genera public/images/photos/canasta-panes-surtidos-01-recorte.webp (RGBA)
 * a partir del original de content-source/fotos-adicionales/aprobadas/ y
 * actualiza su entrada en scripts/assets-manifest.json (mismo formato que
 * import-assets.mjs; la fusión de aquel script conserva esta entrada mientras
 * el archivo exista en public/).
 *
 * Algoritmo: flood-fill desde los cuatro bordes sobre píxeles casi blancos
 * (min(r,g,b) >= 205) para aislar el fondo sin perforar brillos internos del
 * sujeto; dentro de esa región el alfa se gradúa (245→205 ⇒ 0→255) para que
 * sombras suaves y bordes anti-aliased queden semitransparentes en lugar de
 * dejar halo, y el color de esos píxeles se des-mezcla del blanco. Las
 * regiones casi blancas encerradas (fondo visto a través del asa de la
 * canasta) se suman al fondo solo si son grandes y mayoritariamente blanco
 * puro — un brillo de pan es gradual y no cumple ese criterio.
 *
 * Con --preview también escribe un PNG del recorte compuesto sobre
 * petrol-deep (#0b2d38) para inspección visual; no forma parte del sitio.
 */
import { existsSync } from "node:fs";
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INPUT = path.join(
  repoRoot,
  "content-source",
  "fotos-adicionales",
  "aprobadas",
  "canasta-panes-surtidos-01.png"
);
const OUTPUT = path.join(
  repoRoot,
  "public",
  "images",
  "photos",
  "canasta-panes-surtidos-01-recorte.webp"
);
const MANIFEST = path.join(repoRoot, "scripts", "assets-manifest.json");

// Umbrales del fondo: >= STRICT es blanco puro (alfa 0); entre LOOSE y STRICT
// se gradúa el alfa (sombras suaves y anti-aliasing). Los panes y la canasta
// tienen el canal azul muy por debajo de LOOSE, así que no se perforan.
const STRICT = 245;
const LOOSE = 205;
const OUTPUT_WIDTH = 800;
const MARGIN = 8;

function parseArgs(argv) {
  const args = { preview: null };
  for (const arg of argv) {
    if (arg.startsWith("--preview=")) args.preview = arg.slice("--preview=".length);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!existsSync(INPUT)) {
    console.error(`No existe el original aprobado: ${INPUT}`);
    process.exit(1);
  }

  const { data, info } = await sharp(INPUT).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const total = width * height;
  console.log(`Original: ${width}×${height}, ${channels} canales`);

  const minChannel = (i) => {
    const o = i * channels;
    return Math.min(data[o], data[o + 1], data[o + 2]);
  };

  // Flood-fill iterativo desde los cuatro bordes: solo el casi-blanco
  // conectado al borde es fondo (el blanco interno del sujeto se conserva).
  const flooded = new Uint8Array(total);
  const stack = new Int32Array(total);
  let top = 0;
  const seed = (i) => {
    if (!flooded[i] && minChannel(i) >= LOOSE) {
      flooded[i] = 1;
      stack[top++] = i;
    }
  };
  for (let x = 0; x < width; x++) {
    seed(x);
    seed((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    seed(y * width);
    seed(y * width + width - 1);
  }
  while (top > 0) {
    const i = stack[--top];
    const x = i % width;
    if (x > 0) seed(i - 1);
    if (x < width - 1) seed(i + 1);
    if (i >= width) seed(i - width);
    if (i < total - width) seed(i + width);
  }

  // Huecos encerrados: componentes casi blancos no conectados al borde.
  // Son fondo real (p. ej. el interior del asa) solo si son grandes y en su
  // mayoría blanco puro; así no se perfora un brillo suave del pan.
  const HOLE_MIN_SIZE = 1000;
  const HOLE_PURE_FRACTION = 0.35;
  const labels = new Int32Array(total);
  let nextLabel = 0;
  let holesConverted = 0;
  for (let start = 0; start < total; start++) {
    if (flooded[start] || labels[start] !== 0 || minChannel(start) < LOOSE) continue;
    nextLabel++;
    const members = [];
    let pure = 0;
    labels[start] = nextLabel;
    stack[top++] = start;
    while (top > 0) {
      const i = stack[--top];
      members.push(i);
      if (minChannel(i) >= STRICT) pure++;
      const x = i % width;
      const grow = (j) => {
        if (!flooded[j] && labels[j] === 0 && minChannel(j) >= LOOSE) {
          labels[j] = nextLabel;
          stack[top++] = j;
        }
      };
      if (x > 0) grow(i - 1);
      if (x < width - 1) grow(i + 1);
      if (i >= width) grow(i - width);
      if (i < total - width) grow(i + width);
    }
    if (members.length >= HOLE_MIN_SIZE && pure / members.length >= HOLE_PURE_FRACTION) {
      for (const i of members) flooded[i] = 1;
      holesConverted++;
    }
  }
  console.log(`Huecos encerrados convertidos a fondo: ${holesConverted}`);

  // RGBA de salida: alfa graduado en la región de fondo y color des-mezclado
  // del blanco en los píxeles semitransparentes (evita el halo claro).
  const rgba = Buffer.alloc(total * 4);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let i = 0; i < total; i++) {
    const o = i * channels;
    let r = data[o];
    let g = data[o + 1];
    let b = data[o + 2];
    let alpha = 255;
    if (flooded[i]) {
      const minc = Math.min(r, g, b);
      alpha =
        minc >= STRICT
          ? 0
          : Math.round((255 * (STRICT - minc)) / (STRICT - LOOSE));
      if (alpha > 0 && alpha < 255) {
        const a = alpha / 255;
        const unmix = (c) => Math.max(0, Math.min(255, Math.round((c - 255 * (1 - a)) / a)));
        r = unmix(r);
        g = unmix(g);
        b = unmix(b);
      }
    }
    const q = i * 4;
    rgba[q] = r;
    rgba[q + 1] = g;
    rgba[q + 2] = b;
    rgba[q + 3] = alpha;
    if (alpha > 0) {
      const x = i % width;
      const y = (i / width) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) {
    console.error("La imagen quedó completamente transparente; revisa los umbrales.");
    process.exit(1);
  }

  const left = Math.max(0, minX - MARGIN);
  const topEdge = Math.max(0, minY - MARGIN);
  const extract = {
    left,
    top: topEdge,
    width: Math.min(width, maxX + MARGIN + 1) - left,
    height: Math.min(height, maxY + MARGIN + 1) - topEdge,
  };
  console.log(
    `Sujeto: ${extract.width}×${extract.height} @ (${extract.left}, ${extract.top})`
  );

  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .extract(extract)
    .resize({ width: OUTPUT_WIDTH, withoutEnlargement: true })
    .webp({ quality: 85, alphaQuality: 90 })
    .toFile(OUTPUT);

  const meta = await sharp(OUTPUT).metadata();
  const size = await stat(OUTPUT);
  console.log(
    `Escrito ${path.relative(repoRoot, OUTPUT)}: ${meta.width}×${meta.height}, ${size.size} bytes`
  );

  // Entrada en el manifiesto canónico (upsert por path, orden estable).
  const publicPath =
    "/" + path.relative(path.join(repoRoot, "public"), OUTPUT).split(path.sep).join("/");
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8")).filter(
    (entry) => entry.path !== publicPath
  );
  manifest.push({
    kind: "photo",
    productSlug: null,
    path: publicPath,
    width: meta.width ?? null,
    height: meta.height ?? null,
    sizeBytes: size.size,
  });
  manifest.sort((a, b) => a.path.localeCompare(b.path));
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`Manifiesto actualizado: ${path.relative(repoRoot, MANIFEST)}`);

  if (args.preview) {
    const cutout = await sharp(OUTPUT).toBuffer();
    await sharp({
      create: {
        width: OUTPUT_WIDTH + 120,
        height: meta.height + 120,
        channels: 4,
        background: { r: 11, g: 45, b: 56, alpha: 1 },
      },
    })
      .composite([{ input: cutout, gravity: "centre" }])
      .png()
      .toFile(args.preview);
    console.log(`Vista previa sobre petrol-deep: ${args.preview}`);
  }
}

main().catch((error) => {
  console.error("Error durante el recorte:", error);
  process.exit(1);
});
