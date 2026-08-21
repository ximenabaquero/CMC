# Guía del panel administrativo (CMS)

Guía para administrar el contenido del sitio **sin conocimientos técnicos**.

## Ingresar al panel

1. Abre `https://TU-SITIO/admin` (en pruebas: `http://localhost:3000/admin`),
   o usa el botón **Admin** en la esquina derecha del pie de página del sitio.
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
- Cada vez que guardas, subes o eliminas algo, aparece una **notificación
  flotante** en la parte superior que confirma el resultado («Producto
  guardado», «La imagen se cargó correctamente», etc.). Desaparece sola a
  los pocos segundos; también puedes cerrarla con la ✕.
- Si algo sale mal, la notificación es roja y el error aparece además
  **debajo del campo que hay que corregir**. Lo que escribiste no se
  pierde.
- Mientras una operación está en curso, el botón se desactiva y muestra
  «Guardando…», «Subiendo…» o «Eliminando…»; así no se envía dos veces.
- Si editas un formulario y aún no guardas, verás la nota «Cambios sin
  guardar» junto al botón Guardar.
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
  WebP o AVIF; máx. 5 MB), quitarlas y **editar el texto alternativo** de
  cada una (obligatorio: describe la imagen para personas con lectores de
  pantalla y para los buscadores).
  - La imagen marcada como **Principal** es la que se usa en las tarjetas
    del catálogo y de la página de inicio, y siempre ocupa la primera
    posición de la galería. Para cambiarla usa «Usar como principal»: el
    sistema reordena el resto automáticamente.
  - Las demás imágenes se reordenan con los botones **↑ Subir / ↓ Bajar**.
  - Recomendación: la **caja del empaque sola** como principal y las fotos
    con panes o preparaciones después.
- **Ficha técnica (PDF)**: cada producto puede tener una ficha técnica.
  En la sección «Ficha técnica (PDF)» puedes **cargarla, descargarla,
  reemplazarla o eliminarla** (solo PDF, máx. 10 MB); se muestra el nombre
  del documento y su fecha de actualización. Si el producto tiene ficha,
  el sitio público muestra el botón «Descargar ficha técnica (PDF)» en la
  página del producto; si no, el botón no aparece.
- **Vista previa**: muestra el producto tal como se verá publicado, aunque
  esté en borrador (incluido el botón de la ficha técnica). Desde el
  2026-08-19 la vista previa incluye la galería interactiva del sitio
  público: las miniaturas cambian la imagen grande y al pulsarla se abre un
  visor ampliado (se cierra con Escape o con la ✕).
- Mientras no haya productos publicados, el sitio muestra
  «Catálogo en preparación».

### Marcas

Logos de las marcas que la compañía maneja, mostrados como carrusel en la
página de Inicio.

- **Crear**: botón «+ Nueva marca» → nombre → se crea en borrador.
- **Logo**: súbelo en la sección «Logo» (JPEG, PNG, WebP o AVIF, con texto
  alternativo). Es **obligatorio para poder publicar** la marca; si quitas
  el logo de una marca publicada, vuelve a borrador automáticamente.
- **Sitio web** (opcional): si lo indicas, el logo enlaza a esa dirección.
- **Orden**: menor número aparece primero en el carrusel.
- **Vista previa**: en la lista de marcas se muestra el carrusel tal como
  se verá, incluyendo borradores.
- Mientras no haya marcas publicadas, la sección **no aparece** en el
  sitio público.
- Importante: antes de publicar el logo de un cliente, asegúrate de contar
  con su **autorización escrita**. Puedes anotar el estado del permiso en
  la «Nota interna» de cada marca.

### Blog

Igual que productos: crear en borrador, escribir, subir portada, vista
previa y publicar. El contenido usa un formato de texto sencillo:

- `## Subtítulo` → subtítulo
- `**texto**` → **negrita**
- Línea que empieza con `- ` → lista con viñetas
- Párrafos separados por una línea en blanco

El botón «Ver cómo se verá» muestra el resultado mientras escribes.

**Fotos dentro del artículo** (además de la portada): en la sección
«Imágenes dentro del artículo», justo debajo del editor, sube la foto con su
texto alternativo. Aparecerá en la lista; entonces haz clic en el texto, en el
punto exacto donde quieras la foto, y pulsa **«Insertar en el texto»**. Se
inserta un código como `![descripción](/api/media/…)`: ese es tu foto. Guarda
el artículo para que se vea en el sitio.

- El texto entre corchetes es la descripción para personas con lectores de
  pantalla; puedes cambiarla ahí mismo.
- Para quitar una foto del artículo, bórrala del texto, guarda, y luego usa
  «Quitar» en la lista de imágenes (mientras siga en el texto, el panel no te
  dejará borrarla para no dejar un hueco roto).
- Sube las fotos ya recortadas y a un tamaño razonable: el panel las guarda
  tal cual, sin reducirlas.

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
