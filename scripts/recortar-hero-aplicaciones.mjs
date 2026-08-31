#!/usr/bin/env node
/**
 * Derivados del escenario del hero a partir de las fotos de aplicación.
 *
 * Uso:
 *   node scripts/recortar-hero-aplicaciones.mjs [--dry]
 *
 * Genera `public/images/products/<slug>/<slug>-hero-01.webp` por cada trabajo
 * de JOBS y registra las entradas en `scripts/assets-manifest.json`, igual que
 * `recortar-fotos-editoriales.mjs` con sus recortes.
 *
 * **Por qué existe.** Las fotos de aplicación vienen sobre un lienzo cuadrado
 * de 1200×1200 con el motivo centrado en una franja: medidas el 2026-08-30,
 * la tinta ocupa entre el 40 % y el 50 % del alto y deja 348–441 px de blanco
 * arriba. En el hero eso se traducía en un hueco muerto entre el sello y la
 * foto, y en un producto más pequeño de lo que el espacio permitía. Aquí se
 * recorta ese aire y se normalizan las tres a un mismo lienzo, así que en la
 * rotación las tres pesan igual y ninguna «se desinfla».
 *
 * **Encuadre.** Los aspectos de la tinta de las tres elegidas son 1.96, 2.32 y
 * 2.23; el lienzo de salida (2.14) se eligió dentro de esa familia para que
 * ninguna quede demasiado apaisada dentro de su caja: la más cuadrada llena el
 * alto y las dos más anchas llenan el ancho, todas por encima del 90 % en el
 * eje corto. La cuarta candidata obvia —DAP Repostería— quedó fuera a
 * propósito: su tinta es un 26 % del alto y su aspecto 3.72, tres objetos
 * sueltos en una línea fina en vez de un grupo compacto, y en la rotación se
 * leía como un bajón.
 *
 * El fondo es blanco puro en el original y se conserva blanco: el hero las
 * pinta con `mix-blend-multiply`, así que el blanco desaparece contra el disco
 * y no hace falta canal alfa.
 */
import { Buffer } from "node:buffer";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

/** Lienzo común de salida. 2.14:1, ver cabecera. */
const OUT_WIDTH = 1200;
const OUT_HEIGHT = 560;
/** Aire alrededor del motivo, en píxeles del lienzo de salida. */
const MARGIN = 18;
/** Un píxel cuenta como fondo si sus tres canales llegan a este valor. */
const WHITE_THRESHOLD = 238;
const WEBP_QUALITY = 82;

const JOBS = [
  "dap-alta-reposteria-ponque",
  "dap-multiproposito",
  "dap-hojaldre",
];

const MANIFEST = "scripts/assets-manifest.json";

/** Caja de tinta: primer y último píxel que no es fondo blanco. */
async function inkBox(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (data[i] < WHITE_THRESHOLD || data[i + 1] < WHITE_THRESHOLD || data[i + 2] < WHITE_THRESHOLD) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) throw new Error(`${file}: la foto es toda fondo, no hay nada que recortar`);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

async function main() {
  const dry = process.argv.includes("--dry");
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
  const entries = [];

  for (const slug of JOBS) {
    const dir = path.posix.join("public/images/products", slug);
    const source = path.posix.join(dir, `${slug}-aplicacion-01.webp`);
    const outPath = path.posix.join(dir, `${slug}-hero-01.webp`);

    const box = await inkBox(source);
    // `contain` escala el recorte dentro del lienzo sin deformarlo y centra;
    // el relleno es blanco, el mismo fondo del original.
    const buffer = await sharp(source)
      .extract({ left: box.left, top: box.top, width: box.width, height: box.height })
      .resize(OUT_WIDTH - MARGIN * 2, OUT_HEIGHT - MARGIN * 2, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255 },
      })
      .extend({
        top: MARGIN,
        bottom: MARGIN,
        left: MARGIN,
        right: MARGIN,
        background: { r: 255, g: 255, b: 255 },
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    const ratio = (box.width / box.height).toFixed(2);
    console.log(
      `${slug}: tinta ${box.width}x${box.height} (aspecto ${ratio}) → ${OUT_WIDTH}x${OUT_HEIGHT}, ${(buffer.length / 1024).toFixed(0)} KB`
    );

    entries.push({
      kind: "product",
      productSlug: slug,
      path: `/${path.posix.relative("public", outPath)}`,
      width: OUT_WIDTH,
      height: OUT_HEIGHT,
      sizeBytes: buffer.length,
    });

    if (!dry) {
      await mkdir(dir, { recursive: true });
      await writeFile(outPath, Buffer.from(buffer));
    }
  }

  if (dry) {
    console.log("\n--dry: no se escribió ningún archivo ni el manifiesto.");
    return;
  }

  // Reemplaza las entradas propias y reordena por ruta, como el manifiesto
  // que genera import-assets.mjs.
  const own = new Set(entries.map((e) => e.path));
  const merged = [...manifest.filter((e) => !own.has(e.path)), ...entries].sort((a, b) =>
    a.path.localeCompare(b.path)
  );
  await writeFile(MANIFEST, `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`\nManifiesto actualizado: ${entries.length} entradas.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
