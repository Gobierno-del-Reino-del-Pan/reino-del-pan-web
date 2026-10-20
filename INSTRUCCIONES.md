# Registro Civil · Integración real con Vercel (octubre de 2026)

Este complemento se instala **sobre** la Carpeta 2.0. Conserva intactos el `server.js`, el diseño de `Carpeta.tsx` y las otras APIs.

## Archivos y destino

| Archivo en el ZIP | Destino en el repositorio Vercel |
| --- | --- |
| `server.js` | Raíz, exactamente el entregado en Carpeta 2.0 (sin cambios adicionales) |
| `citizenRoutes.js` | Raíz, reemplaza solo este módulo del paquete previo |
| `Carpeta.tsx` | `src/pages/Carpeta.tsx` (idéntico al paquete previo) |
| `api/registro_civil.py` | `api/registro_civil.py` (motor del bot adaptado desde el texto que compartiste) |
| `api/registro_certificado.py` | `api/registro_certificado.py` (función Python Vercel) |
| `requirements.txt` | Raíz (añadir esas dos dependencias si ya tienes un fichero) |
| `api/src/gob.png` y `api/src/reg.png` | Copia tus logos desde `public/gob.png` y `public/reg.png` |

El archivo `registro_civil.py` corresponde al motor que acabas de compartir, eliminando escapes Markdown y espacios Unicode introducidos al pegarlo; las funciones y la plantilla PDF están preservadas. **No necesitas subir el bot completo.**

El módulo `citizenRoutes.js` cambia **únicamente** el comportamiento de la descarga PDF cuando se ejecuta en Vercel: redirige `/api/citizen/certificates/NUMERO` a `/api/registro_certificado?numero=NUMERO`. La función Python hace de nuevo la autenticación y la comprobación de titularidad. Las otras rutas continúan como estaban; no se toca el servidor Express existente.

## Variables de entorno en Vercel

Configura en **Vercel > Project > Settings > Environment Variables** para Production y, si procede, Preview:

- `JWT_SECRET`: el MISMO secreto que usa el servidor Express para la cookie `session`. Obligatorio.
- `SUPABASE_URL`: la misma URL que ya usa `server.js`.
- `SUPABASE_SERVICE_KEY`: la clave del servidor, **nunca** `VITE_*` ni en el navegador.
- `GUILD_ID`: ID del servidor Discord que guarda las actas.

**Elimina / no configures** `REGISTRO_CIVIL_DIR` ni `REGISTRO_CIVIL_PYTHON` en Vercel; son solo del modo local anterior. No añadas rutas de Windows.

**Dependencias:** Añade las dos líneas del `requirements.txt` proporcionado al tuyo si ya existe. `PyJWT` valida la cookie como la valida tu servidor Node y `reportlab` genera el PDF.

## Reglas de Vercel que hay que comprobar

Vercel permite archivos Python dentro de `/api` como funciones individuales, en un proyecto sin framework Python preconfigurado.

- El endpoint final es **`/api/registro_certificado?numero=RC-...`**.
- Si tu `vercel.json` tiene un rewrite general hacia el frontend o el `server.js` (por ejemplo `/api/(.*)`), coloca primero una excepción que permita llegar a la función Python; **no sustituyas tus reglas actuales**. El orden exacto depende de tu archivo actual, que no se ha facilitado. Puedes verificarlo entrando sin sesión a `/api/registro_certificado?numero=RC-PRUEBA`: debe responder un JSON con **401**, no el HTML de React. No uses actas reales en esa prueba pública.
- No crees un nuevo `server.js` ni un servidor Python permanente.
- Si Vercel tiene establecido un Python framework preset en el mismo proyecto, puede priorizarlo sobre las funciones por archivo: usa el preset React/Vite del proyecto (no el de Flask/FastAPI).

## Comprobación

1. Copia `public/gob.png` y `public/reg.png` a `api/src/` (el motor original buscaba los logos en una carpeta `src` junto al módulo).
2. Sube los cambios a tu repositorio o desplega desde Vercel.
3. Abre `/api/registro_certificado?numero=RC-DEMO-000001` sin sesión: debe devolver `401` con JSON (para un número válido).
4. Inicia sesión en `/carpeta`, ve a Registro Civil y descarga un certificado realmente emitido por el bot.
5. Confirma que el PDF incluye los logos y el aviso «DOCUMENTO FICTICIO».

Si obtienes `404` con HTML en el paso 3, revisa los rewrites de `vercel.json` o que se haya incluido la función Python. Si obtienes `503`, revisa las variables. Si obtienes `502`, revisa permisos de consulta de Supabase, la base de datos y los logs de la función.

## Notas de seguridad

El PDF no se genera a partir de datos enviados por el navegador: se consulta el asiento original `registro_civil_actas` por número y por ID de la sesión. Se comprueba que exista un DPI válido en `verificados` + `dpis` antes de autorizar la descarga. El nombre del archivo se valida antes de colocarlo en `Content-Disposition`. La respuesta no se cachea.

**Importante:** No se ha probado una petición contra tu proyecto real de Vercel/Supabase; las verificaciones realizadas son locales. La clave de servicio se utiliza exclusivamente en la función Python. Asegúrate de no exponerla en código frontend.

## Rotomi y el resto de Carpeta 2.0

Se conserva el funcionamiento del paquete original: `Carpeta.tsx` utiliza `/api/citizen/` para el DPI, perfil, familia y Rotomi. Las transferencias Pokémon siguen necesitando ejecutar `sql/001_rotomi_transferencias.sql` en Supabase **una sola vez**, tras revisar los tipos de las columnas `capturas.id`, `capturas.pokemon_id` y `capturas.discord_id`.

Si deseas comprobar los tipos antes de ejecutar la migración:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'capturas'
  and column_name in ('id','pokemon_id','discord_id');
```

Los sprites del PC proceden de PokéAPI y los logos principales del sitio se guardan en `public/reg.png` y `public/rotomi.png`. Los assets adicionales `api/src/` son únicamente para el motor Python al generar PDFs.

**Desarrollo local:** `npm run dev` sirve la web Vite, pero no inicia automáticamente el backend Express ni la función Python. Para una prueba completa usa `vercel dev` con las variables adecuadas; alternativamente, sigue utilizando el flujo local del servidor Express y su puente Python como antes. No uses rutas de Windows como variables de entorno de producción Vercel.
