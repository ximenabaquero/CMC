/**
 * Elimina la extensión de aplicación NETSCAPE2.0 de un GIF para que la
 * animación se reproduzca UNA sola vez (sin loop) y quede en el último frame.
 *
 * Uso: node scripts/patch-gif-loop.mjs <entrada.gif> <salida.gif>
 */
import { readFileSync, writeFileSync } from "node:fs";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Uso: node scripts/patch-gif-loop.mjs <entrada.gif> <salida.gif>");
  process.exit(1);
}

const gif = readFileSync(input);
const marker = Buffer.from("NETSCAPE2.0", "ascii");

// El bloque completo es: 0x21 0xFF 0x0B "NETSCAPE2.0" + sub-bloques + 0x00.
const idx = gif.indexOf(marker);
if (idx < 3 || gif[idx - 3] !== 0x21 || gif[idx - 2] !== 0xff || gif[idx - 1] !== 0x0b) {
  console.log(`${input}: no tiene extensión de loop; se copia sin cambios.`);
  writeFileSync(output, gif);
  process.exit(0);
}

const start = idx - 3;
let end = idx + marker.length;
// Recorre los sub-bloques (tamaño + datos) hasta el terminador 0x00.
while (gif[end] !== 0x00) {
  end += gif[end] + 1;
}
end += 1; // incluye el terminador

const patched = Buffer.concat([gif.subarray(0, start), gif.subarray(end)]);
writeFileSync(output, patched);
console.log(
  `${output}: ${patched.length} bytes (se eliminaron ${gif.length - patched.length} bytes de loop).`
);
