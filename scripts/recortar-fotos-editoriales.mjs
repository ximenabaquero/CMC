#!/usr/bin/env node
/**
 * Recorte con transparencia de las fotos editoriales aprobadas (fondo blanco puro).
 *
 * Uso:
 *   node scripts/recortar-fotos-editoriales.mjs [--solo=<slug>] [--previews[=DIR]]
 *
 * Genera public/images/photos/<slug>-recorte.webp (RGBA) por cada trabajo de
 * la tabla JOBS a partir de los originales de
 * content-source/fotos-adicionales/aprobadas/, y actualiza sus entradas en
 * scripts/assets-manifest.json (mismo formato que import-assets.mjs; la
 * fusión de aquel script conserva estas entradas mientras los archivos
 * existan en public/; si el manifiesto se regenerara desde cero, volver a
 * ejecutar este script).
 *
 * Algoritmo por foto: flood-fill desde los cuatro bordes sobre píxeles casi
 * blancos (min(r,g,b) >= loose) para aislar el fondo sin perforar brillos
 * internos del sujeto; dentro de esa región el alfa se gradúa
 * (strict→loose ⇒ 0→255) para que sombras suaves y bordes anti-aliased
 * queden semitransparentes en lugar de dejar halo, y el color de esos
 * píxeles se des-mezcla del blanco. Con `detectHoles` (solo la canasta: el
 * interior del asa) las regiones casi blancas encerradas se suman al fondo
 * si son grandes y mayoritariamente blanco puro — un brillo de pan es
 * gradual y no cumple ese criterio.
 *
 * Con --previews escribe además <slug>-preview.png: el recorte compuesto
 * sobre un lienzo dividido — mitad superior el fondo real donde vivirá la
 * foto (hero-cream/hueso) y mitad inferior petrol-deep, donde cualquier
 * halo blanco salta a la vista. Las previews son solo para QA, no forman
 * parte del sitio.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(repoRoot, "content-source", "fotos-adicionales", "aprobadas");
const OUTPUT_DIR = path.join(repoRoot, "public", "images", "photos");
const MANIFEST = path.join(repoRoot, "scripts", "assets-manifest.json");

// Fondos reales del sitio para las previews (tokens de globals.css).
const HERO_CREAM = { r: 248, g: 242, b: 228 }; // --hero-cream #f8f2e4
const HUESO = { r: 253, g: 252, b: 250 }; // --background #fdfcfa
const PETROL_DEEP = { r: 11, g: 45, b: 56 }; // --petrol-deep #0b2d38

// Umbrales del fondo: >= strict es blanco puro (alfa 0); entre loose y
// strict se gradúa el alfa (sombras suaves y anti-aliasing). Los sujetos
// horneados tienen el canal azul muy por debajo de loose. `loose`/`strict`
// por trabajo son solo ajustes de rescate (p. ej. subir loose si el
// flood-fill se comiera un plato blanco).
const DEFAULT_LOOSE = 205;
const DEFAULT_STRICT = 245;
const MARGIN = 8;

// detectHoles solo donde hay fondo real encerrado (el asa de la canasta);
// apagado evita perforar brillos internos (azúcar, bol metálico).
const JOBS = [
  { slug: "palmerita-hojaldre-01", outputWidth: 800, detectHoles: false, previewBg: HERO_CREAM },
  { slug: "amasijo-bunuelo-01", outputWidth: 800, detectHoles: false, previewBg: HERO_CREAM },
  { slug: "canasta-panes-surtidos-01", outputWidth: 800, detectHoles: true, previewBg: HERO_CREAM },
  { slug: "composicion-surtido-amasijos-01", outputWidth: 800, detectHoles: false, previewBg: HUESO },
  { slug: "composicion-hojaldres-dap-hero-01", outputWidth: 1200, detectHoles: false, previewBg: HUESO },
];

function parseArgs(argv) {
  const args = { solo: null, previews: null };
  for (const arg of argv) {
    if (arg.startsWith("--solo=")) args.solo = arg.slice("--solo=".length);
    else if (arg === "--previews") args.previews = path.join(os.tmpdir(), "cmc-recortes-previews");
    else if (arg.startsWith("--previews=")) args.previews = arg.slice("--previews=".length);
  }
  return args;
}

/** Recorta una foto y devuelve la entrada de manifiesto de su derivado. */
async function processJob(job, previewsDir) {
  const input = path.join(SOURCE_DIR, `${job.slug}.png`);
  const output = path.join(OUTPUT_DIR, `${job.slug}-recorte.webp`);
  const loose = job.loose ?? DEFAULT_LOOSE;
  const strict = job.strict ?? DEFAULT_STRICT;
  if (!existsSync(input)) {
    throw new Error(`No existe el original aprobado: ${input}`);
  }

  const { data, info } = await sharp(input).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const total = width * height;
  console.log(`\n${job.slug}: original ${width}×${height}, ${channels} canales`);

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
    if (!flooded[i] && minChannel(i) >= loose) {
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

  if (job.detectHoles) {
    // Huecos encerrados: componentes casi blancos no conectados al borde.
    // Son fondo real (p. ej. el interior del asa) solo si son grandes y en
    // su mayoría blanco puro; así no se perfora un brillo suave del pan.
    const HOLE_MIN_SIZE = 1000;
    const HOLE_PURE_FRACTION = 0.35;
    const labels = new Int32Array(total);
    let nextLabel = 0;
    let holesConverted = 0;
    for (let start = 0; start < total; start++) {
      if (flooded[start] || labels[start] !== 0 || minChannel(start) < loose) continue;
      nextLabel++;
      const members = [];
      let pure = 0;
      labels[start] = nextLabel;
      stack[top++] = start;
      while (top > 0) {
        const i = stack[--top];
        members.push(i);
        if (minChannel(i) >= strict) pure++;
        const x = i % width;
        const grow = (j) => {
          if (!flooded[j] && labels[j] === 0 && minChannel(j) >= loose) {
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
    console.log(`  Huecos encerrados convertidos a fondo: ${holesConverted}`);
  }

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
      alpha = minc >= strict ? 0 : Math.round((255 * (strict - minc)) / (strict - loose));
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
    throw new Error(`${job.slug}: la imagen quedó completamente transparente; revisa los umbrales.`);
  }

  const left = Math.max(0, minX - MARGIN);
  const topEdge = Math.max(0, minY - MARGIN);
  const extract = {
    left,
    top: topEdge,
    width: Math.min(width, maxX + MARGIN + 1) - left,
    height: Math.min(height, maxY + MARGIN + 1) - topEdge,
  };
  console.log(`  Sujeto: ${extract.width}×${extract.height} @ (${extract.left}, ${extract.top})`);

  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .extract(extract)
    .resize({ width: job.outputWidth, withoutEnlargement: true })
    .webp({ quality: 85, alphaQuality: 90 })
    .toFile(output);

  const meta = await sharp(output).metadata();
  const size = await stat(output);
  console.log(
    `  Escrito ${path.relative(repoRoot, output)}: ${meta.width}×${meta.height}, ${size.size} bytes`
  );

  if (previewsDir) {
    // Lienzo dividido: mitad superior el fondo destino real, mitad inferior
    // petrol-deep (delator de halos); el recorte cruza ambas mitades.
    const previewPath = path.join(previewsDir, `${job.slug}-preview.png`);
    const canvasW = meta.width + 120;
    const canvasH = meta.height + 120;
    const bottomHalf = await sharp({
      create: {
        width: canvasW,
        height: Math.ceil(canvasH / 2),
        channels: 4,
        background: { ...PETROL_DEEP, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    const cutout = await readFile(output);
    await sharp({
      create: { width: canvasW, height: canvasH, channels: 4, background: { ...job.previewBg, alpha: 1 } },
    })
      .composite([
        { input: bottomHalf, left: 0, top: Math.floor(canvasH / 2) },
        { input: cutout, gravity: "centre" },
      ])
      .png()
      .toFile(previewPath);
    console.log(`  Preview: ${previewPath}`);
  }

  const publicPath =
    "/" + path.relative(path.join(repoRoot, "public"), output).split(path.sep).join("/");
  return {
    kind: "photo",
    productSlug: null,
    path: publicPath,
    width: meta.width ?? null,
    height: meta.height ?? null,
    sizeBytes: size.size,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const jobs = args.solo ? JOBS.filter((j) => j.slug === args.solo) : JOBS;
  if (jobs.length === 0) {
    console.error(`--solo=${args.solo} no coincide con ningún trabajo. Slugs: ${JOBS.map((j) => j.slug).join(", ")}`);
    process.exit(1);
  }
  if (args.previews) await mkdir(args.previews, { recursive: true });

  const entries = [];
  for (const job of jobs) {
    entries.push(await processJob(job, args.previews));
  }

  // Entradas en el manifiesto canónico (upsert por path, orden estable).
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8")).filter(
    (entry) => !entries.some((e) => e.path === entry.path)
  );
  manifest.push(...entries);
  manifest.sort((a, b) => a.path.localeCompare(b.path));
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`\nManifiesto actualizado (${entries.length} derivados): ${path.relative(repoRoot, MANIFEST)}`);
}

main().catch((error) => {
  console.error("Error durante el recorte:", error);
  process.exit(1);
});
