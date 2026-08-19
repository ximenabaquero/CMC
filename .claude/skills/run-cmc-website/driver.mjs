#!/usr/bin/env node
// Driver headless para cmc-website: lanza Chrome/Edge en modo headless,
// se conecta por Chrome DevTools Protocol (WebSocket nativo de Node >= 22,
// sin dependencias) y ejecuta comandos leídos de stdin, uno por línea.
//
// Importante: los screenshots viajan por CDP en base64 y los escribe Node,
// nunca Chrome — el sandbox de la herramienta Bash de Claude Code deniega
// las escrituras de archivos hechas por Chrome (--screenshot da
// "Acceso denegado"), pero las de Node sí pasan.
//
// Uso:  node .claude/skills/run-cmc-website/driver.mjs <<'EOF'
//       nav http://localhost:3000
//       wait text=Nuestros productos
//       shot home.png
//       errors
//       quit
//       EOF
//
// Comandos: nav <url> | wait <css-selector>|text=<substring> | sleep <ms>
//           shot <file.png> (página completa) | shot-viewport <file.png>
//           eval <js> | click <css-selector> | fill <css-selector> <valor>
//           viewport <ancho> <alto> | errors | quit

import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline";

const CHROME_CANDIDATES = [
  process.env.CMC_CHROME,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const chromePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chromePath) {
  console.error("ERR no encontré chrome.exe/msedge.exe; define CMC_CHROME");
  process.exit(1);
}

let viewport = { width: 1440, height: 900 };
const profileDir = mkdtempSync(join(tmpdir(), "cmc-driver-"));
const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--remote-debugging-port=0",
  `--user-data-dir=${profileDir}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-extensions",
  "about:blank",
]);

function cleanup(code = 0) {
  try {
    chrome.kill();
  } catch {}
  try {
    rmSync(profileDir, { recursive: true, force: true });
  } catch {}
  process.exit(code);
}
process.on("SIGINT", () => cleanup(130));

// El puerto elegido (port=0) se anuncia en stderr: "DevTools listening on ws://..."
const wsUrl = await new Promise((resolvePromise, reject) => {
  let buf = "";
  const timer = setTimeout(
    () => reject(new Error("Chrome no anunció DevTools en 20s")),
    20000
  );
  chrome.stderr.on("data", (chunk) => {
    buf += chunk.toString();
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) {
      clearTimeout(timer);
      resolvePromise(m[1]);
    }
  });
  chrome.on("exit", () => reject(new Error("Chrome terminó antes de arrancar")));
}).catch((err) => {
  console.error(`ERR ${err.message}`);
  cleanup(1);
});

// El ws de arranque es del browser; necesitamos el target de la página.
const httpBase = wsUrl.replace(/^ws:\/\//, "http://").replace(/\/devtools.*$/, "");
const targets = await (await fetch(`${httpBase}/json/list`)).json();
const page = targets.find((t) => t.type === "page");
if (!page) {
  console.error("ERR Chrome no expone ningún target de página");
  cleanup(1);
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = () => rej(new Error("no pude conectar al WebSocket de CDP"));
});

let nextId = 1;
const pending = new Map();
const eventWaiters = new Map();
const consoleErrors = [];

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  if (data.id && pending.has(data.id)) {
    const { res, rej } = pending.get(data.id);
    pending.delete(data.id);
    data.error ? rej(new Error(data.error.message)) : res(data.result);
    return;
  }
  if (data.method) {
    if (data.method === "Runtime.consoleAPICalled" && data.params.type === "error") {
      consoleErrors.push(
        data.params.args.map((a) => a.value ?? a.description ?? "").join(" ")
      );
    }
    if (data.method === "Runtime.exceptionThrown") {
      consoleErrors.push(
        data.params.exceptionDetails.exception?.description ??
          data.params.exceptionDetails.text
      );
    }
    const waiters = eventWaiters.get(data.method);
    if (waiters) {
      eventWaiters.delete(data.method);
      waiters.forEach((w) => w());
    }
  }
};

function send(method, params = {}) {
  return new Promise((res, rej) => {
    const id = nextId++;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function onceEvent(method, timeoutMs) {
  return new Promise((res, rej) => {
    const timer = setTimeout(
      () => rej(new Error(`timeout esperando ${method} (${timeoutMs}ms)`)),
      timeoutMs
    );
    const list = eventWaiters.get(method) ?? [];
    list.push(() => {
      clearTimeout(timer);
      res();
    });
    eventWaiters.set(method, list);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function evalJs(expression) {
  const { result, exceptionDetails } = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
  });
  if (exceptionDetails) {
    throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  }
  return result.value;
}

async function applyViewport() {
  await send("Emulation.setDeviceMetricsOverride", {
    ...viewport,
    deviceScaleFactor: 1,
    mobile: false,
  });
}

await send("Page.enable");
await send("Runtime.enable");
await applyViewport();

async function screenshot(file, fullPage) {
  if (fullPage) {
    // captureBeyondViewport no sirve aquí: los `reveal` (animación al entrar
    // al viewport) quedarían en opacity 0 y las imágenes lazy de next/image
    // sin cargar. Se agranda el viewport a la altura total del contenido para
    // que todo "entre en pantalla", se espera a que carguen las imágenes y
    // asienten las transiciones, y luego se restaura.
    const { cssContentSize } = await send("Page.getLayoutMetrics");
    await send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: Math.min(Math.ceil(cssContentSize.height), 16000),
      deviceScaleFactor: 1,
      mobile: false,
    });
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      if (await evalJs("Array.from(document.images).every((i) => i.complete)")) break;
      await sleep(250);
    }
    await sleep(1200);
  }
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  if (fullPage) await applyViewport();
  const out = resolve(file);
  writeFileSync(out, Buffer.from(data, "base64"));
  return out;
}

async function waitFor(spec, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  const expr = spec.startsWith("text=")
    ? `document.body && document.body.innerText.includes(${JSON.stringify(spec.slice(5))})`
    : `!!document.querySelector(${JSON.stringify(spec)})`;
  while (Date.now() < deadline) {
    if (await evalJs(expr).catch(() => false)) return;
    await sleep(200);
  }
  throw new Error(`timeout esperando ${spec} (${timeoutMs}ms)`);
}

async function run(line) {
  const [cmd, ...rest] = line.trim().split(/\s+/);
  const arg = rest.join(" ");
  switch (cmd) {
    case "":
      return;
    case "nav": {
      const loaded = onceEvent("Page.loadEventFired", 60000);
      await send("Page.navigate", { url: arg });
      await loaded;
      console.log(`ok nav ${arg}`);
      return;
    }
    case "wait":
      await waitFor(arg);
      console.log(`ok wait ${arg}`);
      return;
    case "sleep":
      await sleep(Number(arg) || 1000);
      console.log(`ok sleep ${arg}`);
      return;
    case "shot":
      console.log(`ok shot ${await screenshot(arg, true)}`);
      return;
    case "shot-viewport":
      console.log(`ok shot-viewport ${await screenshot(arg, false)}`);
      return;
    case "eval":
      console.log(`ok eval ${JSON.stringify(await evalJs(arg))}`);
      return;
    case "click": {
      const found = await evalJs(
        `(() => { const el = document.querySelector(${JSON.stringify(arg)}); if (!el) return false; el.click(); return true; })()`
      );
      if (!found) throw new Error(`no existe ${arg}`);
      console.log(`ok click ${arg}`);
      return;
    }
    case "fill": {
      // Setter nativo + evento input para que React registre el cambio.
      const [selector, ...valueParts] = rest;
      const value = valueParts.join(" ");
      const found = await evalJs(
        `(() => {
          const el = document.querySelector(${JSON.stringify(selector)});
          if (!el) return false;
          const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
          Object.getOwnPropertyDescriptor(proto.prototype, "value").set.call(el, ${JSON.stringify(value)});
          el.dispatchEvent(new Event("input", { bubbles: true }));
          return true;
        })()`
      );
      if (!found) throw new Error(`no existe ${selector}`);
      console.log(`ok fill ${selector}`);
      return;
    }
    case "viewport": {
      const [w, h] = rest.map(Number);
      viewport = { width: w || 1440, height: h || 900 };
      await applyViewport();
      console.log(`ok viewport ${viewport.width}x${viewport.height}`);
      return;
    }
    case "errors":
      console.log(
        consoleErrors.length
          ? `ERRORES DE CONSOLA:\n${consoleErrors.map((e) => `  - ${e}`).join("\n")}`
          : "ok sin errores de consola"
      );
      return;
    case "quit":
      cleanup(0);
      return;
    default:
      console.log(`ERR comando desconocido: ${cmd}`);
  }
}

const rl = createInterface({ input: process.stdin });
for await (const line of rl) {
  try {
    await run(line);
  } catch (err) {
    console.log(`ERR ${line.trim()}: ${err.message}`);
  }
}
cleanup(0);
