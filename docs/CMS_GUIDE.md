# Guía del panel administrativo (CMS)

Guía para administrar el contenido del sitio **sin conocimientos técnicos**.

## Ingresar al panel

1. Abre `https://TU-SITIO/admin` (en pruebas: `http://localhost:3000/admin`).
2. Escribe tu correo y contraseña de administrador.
3. Para salir, usa el botón **Cerrar sesión** en el menú lateral.

> ¿Olvidaste la contraseña? La persona a cargo del proyecto puede
> restablecerla desde el panel de Supabase (Authentication → Users →
> tu usuario → «Send password recovery» o «Update password»).

## Conceptos básicos

- **Borrador**: el contenido se guarda pero NO aparece en el sitio público.
- **Publicado**: visible para todos los visitantes.
- Al guardar cualquier cambio, el sitio público se actualiza
  automáticamente en unos segundos.
- Antes de eliminar algo, el sistema siempre pide confirmación. Las
  eliminaciones no se pueden deshacer.
- Algunos contenidos tienen una **nota interna** (solo visible en el
  panel) que explica por qué están en revisión.

## Secciones del panel

### Inicio (dashboard)

Resumen de cuántos productos, artículos y preguntas están publicados o en
borrador.

### Contenido de la empresa

Textos de las páginas de **Inicio** y **Nosotros**: portada, ¿quiénes
somos?, pilares, propuesta de valor, etc. Cada bloque se edita por separado
(título, texto y estado). En el bloque de pilares puedes agregar, editar o
quitar pilares.

> El bloque «Certificación ISO 22000» está en borrador a propósito: no debe
> publicarse hasta tener la evidencia del certificado.

### Información de contacto

Teléfono, WhatsApp, correo, dirección, horario, redes sociales y datos SEO
del sitio. **El sitio público solo muestra los campos que tengan datos**:
si dejas un campo vacío, ese canal se oculta sin dañar el diseño.

### Productos

- **Crear**: botón «+ Nuevo producto» → nombre y slug → se crea en borrador.
- **Editar**: clic en un producto → completa descripción, categoría,
  presentación, características (pares título/valor, ej. «Vida útil»),
  SEO y estado.
- **Imágenes**: en la sección «Imágenes» puedes subir fotos (JPEG, PNG,
  WebP o AVIF), marcar una como **principal**, o quitarlas. El **texto
  alternativo** es obligatorio: describe la imagen para personas con
  lectores de pantalla y para los buscadores.
- **Vista previa**: muestra el producto tal como se verá publicado, aunque
  esté en borrador.
- Mientras no haya productos publicados, el sitio muestra
  «Catálogo en preparación».

### Blog

Igual que productos: crear en borrador, escribir, subir portada, vista
previa y publicar. El contenido usa un formato de texto sencillo:

- `## Subtítulo` → subtítulo
- `**texto**` → **negrita**
- Línea que empieza con `- ` → lista con viñetas
- Párrafos separados por una línea en blanco

El botón «Ver cómo se verá» muestra el resultado mientras escribes.

### Preguntas frecuentes

Crear, editar, ordenar (campo «Orden»: menor número aparece primero) y
marcar como **Destacada** (aparece también en la página de Inicio).

## Si el panel muestra «No se pudo conectar con la base de datos»

El plan gratuito de Supabase pausa el proyecto tras varios días sin
actividad. El **sitio público sigue funcionando** con la última versión
generada. Para reactivar:

1. Entra a <https://supabase.com/dashboard> con la cuenta de la empresa.
2. Abre el proyecto y pulsa **Restore** si aparece pausado.
3. Espera 1-2 minutos y recarga el panel.

## Crear el primer administrador

Procedimiento seguro (lo realiza la persona técnica; no hay contraseñas
guardadas en el código):

1. En el dashboard de Supabase: **Authentication → Users → Add user →
   Create new user**.
2. Escribe el correo corporativo del administrador y una **contraseña
   fuerte generada con un gestor de contraseñas** (no la reutilices ni la
   envíes por canales inseguros). Marca «Auto Confirm User» para no
   depender del envío de correo de confirmación.
3. Copia el **User UID** del usuario creado.
4. En **SQL Editor**, ejecuta (reemplazando UID y correo):

   ```sql
   insert into public.profiles (id, email, full_name, role)
   values ('UID-COPIADO', 'correo@empresa.com', 'Nombre Apellido', 'ADMIN');
   ```

5. Verifica el rol:

   ```sql
   select id, email, role from public.profiles;
   ```

   Debe mostrar `ADMIN` para ese usuario.
6. Verifica que **Authentication → Sign In / Up → Allow new users to sign
   up** esté **desactivado** (no debe existir registro público).
7. Prueba iniciar sesión en `/admin` y entrega la contraseña al
   administrador por un canal seguro, pidiéndole cambiarla en el primer
   uso (Supabase → recovery) si se generó por terceros.
