---
name: run-cmc-website
description: Arrancar, correr y verificar cmc-website localmente. Usar para iniciar el dev server, tomar screenshots del sitio, verificar visualmente un cambio de UI, o interactuar con la app corriendo (navegar, click, llenar formularios).
---

Sitio Next.js 15 (App Router) con dev server en `localhost:3000`. Se maneja con
el driver CDP `.claude/skills/run-cmc-website/driver.mjs` (Chrome/Edge headless
por DevTools Protocol, sin dependencias — usa el `WebSocket` global de Node 22+).
No hay `chromium-cli` ni Playwright en esta máquina: no los busques, el driver
es el camino.

Rutas relativas a la raíz del repo. Entorno: Windows 11 de la usuaria, con
Chrome y Edge instalados (el driver los autodetecta; override con `CMC_CHROME`).

## Prerrequisitos

Ya presentes en esta máquina: Node 24, Chrome/Edge, dependencias instaladas
(`node_modules/` existe; si faltara, `npm install`). El dev server lee la
config de Supabase dev de `.env.local` (ya en el working tree, gitignored).

## Run (camino del agente)

1. **Arrancar el dev server** (herramienta Bash, en background, sondeando el
   puerto — no uses `sleep` fijo):

```bash
(npm run dev > /tmp/cmc-dev.log 2>&1 &) && timeout 60 bash -c 'until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done' && echo "server up"
```

2. **Manejar la app con el driver** — comandos por stdin, uno por línea.
   Los screenshots se resuelven contra el cwd: haz `cd` al scratchpad o pasa
   rutas absolutas. Flujo representativo (verificado):

```bash
cd "<scratchpad>" && node /c/Users/sarax/Dev/cmc-website/.claude/skills/run-cmc-website/driver.mjs <<'EOF'
nav http://localhost:3000
wait text=Nuestros productos
shot home.png
click a[href="/productos"]
wait text=Margarinas industriales
shot productos.png
errors
quit
EOF
```

   **Mira el screenshot** (herramienta Read). Una franja en blanco donde
   debería haber contenido = fallo, no éxito.

3. **Detener el dev server** (matar al proceso dueño del puerto; matar el
   wrapper de npm no basta):

```bash
powershell.exe -NoProfile -Command 'Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force }'
```

   (Comillas simples obligatorias: con dobles, Git Bash expande `$_` antes de
   que PowerShell lo vea.)

### Comandos del driver

| comando | qué hace |
|---|---|
| `nav <url>` | navega y espera el evento load (timeout 60 s — la primera compilación de Next es lenta) |
| `wait <css>` / `wait text=<substr>` | sondea hasta 30 s a que exista el selector o el texto |
| `shot <file.png>` | screenshot de página completa (agranda el viewport al alto del contenido, espera imágenes y transiciones, restaura) |
| `shot-viewport <file.png>` | screenshot solo del viewport actual (1440×900 por defecto) |
| `click <css>` | `el.click()` — dispara la navegación client-side de Next |
| `fill <css> <valor>` | setter nativo + evento `input` (compatible con inputs controlados de React); el selector no puede llevar espacios |
| `eval <js>` | evalúa JS y imprime el resultado como JSON |
| `viewport <w> <h>` | cambia el tamaño del viewport |
| `sleep <ms>` | pausa fija (p. ej. dejar terminar un GIF "una-vez") |
| `errors` | imprime los errores de consola/excepciones acumulados — revísalo antes de declarar éxito |
| `quit` | cierra Chrome y sale |

## Run (camino humano)

`npm run dev` → abrir `http://localhost:3000` → Ctrl-C para parar.
`npm run preview` compila con OpenNext y levanta workerd real (más lento).

## Test

No hay suite JS. La verificación mínima tras cualquier cambio:

```bash
npm run lint && npm run typecheck
```

Ambos deben salir limpios y en silencio. (RLS se prueba aparte:
`supabase/tests/rls_checks.sql` en el SQL Editor de Supabase.)

## Gotchas

- **Chrome no puede escribir archivos bajo el sandbox de la herramienta Bash.**
  `chrome.exe --screenshot=...` falla con `Failed to write file ...: Acceso
  denegado. (0x5)`. Por eso el driver captura vía CDP en base64 y el archivo
  lo escribe Node. No uses `--screenshot` directo desde Bash; desde la
  herramienta PowerShell sí funciona, pero el driver es mejor camino.
- **Página completa ≠ `captureBeyondViewport`.** El sitio usa animaciones
  `reveal` al entrar al viewport y `next/image` lazy: capturar más allá del
  viewport deja franjas vacías (opacity 0, imágenes sin cargar). El comando
  `shot` ya lo resuelve agrandando el viewport al alto real del contenido;
  tarda unos segundos por diseño.
- **Los GIFs "una-vez"** (hero, catálogo) quedan en su frame final tras ~2 s.
  La espera interna de `shot` suele bastar; si sale a medio animar, añade
  `sleep 2500` antes.
- **`/admin` requiere sesión** (perfil ADMIN en Supabase). El driver puede
  llenar el login (`fill input[type=email] ...`), pero no hay credenciales
  documentadas en el repo; la verificación del panel autenticado sigue siendo
  manual.
- **stderr de Chrome trae ruido benigno** (`DEPRECATED_ENDPOINT`, rechazos
  mojo, `installwebapp?usp=chrome_default ... reason 21`). Ignóralo; el driver
  solo usa stderr para leer la URL de DevTools.

## Troubleshooting

- **`EADDRINUSE` / el server no arranca**: quedó un listener viejo en el
  puerto 3000. Ejecuta la línea de detener del paso 3 y relanza.
- **`nav` o `wait` expiran justo tras arrancar el server**: Next compila las
  rutas bajo demanda; la primera petición puede tardar 10–30 s. Reintenta el
  mismo bloque una vez con el server ya caliente.
- **`ERR no encontré chrome.exe/msedge.exe`**: define `CMC_CHROME` con la ruta
  completa al ejecutable del navegador.
