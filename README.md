# Reino del Pan - Sitio Web Oficial

Sitio web oficial del **Reino del Pan**, una nación digital dedicada a la paz, la ecología activa, la democracia directa y la participación ciudadana.

## Descripción del Proyecto

**Reino del Pan** es una plataforma web moderna y responsiva que presenta los valores, servicios y oportunidades de una nación digital soberana. El sitio permite a los ciudadanos potenciales:

- Conocer los fundamentos y visión del Reino del Pan
- Solicitar el Documento Personal de Identidad (DPI)
- Recuperar un DPI ya existente
- Acceder a información sobre gobierno y políticas
- Consultar la política actual
- Realizar donaciones para apoyar la iniciativa
- Revisar políticas de privacidad y términos de servicio

---

## Arquitectura Técnica

### Stack Tecnológico

- **Frontend Framework**: React 18+ con TypeScript
- **Bundler**: Vite (desarrollo y producción)
- **Routing**: Wouter (ligero y moderno)
- **Estilos**: Tailwind CSS v4 + CSS personalizado
- **Animaciones**: Framer Motion
- **Tipografía**: Playfair Display (titulares) + Inter (cuerpo)
- **Backend**: Express.js (servidor de producción)
- **Base de datos**: Supabase (PostgreSQL)
- **Bot de Discord**: Discord.js v14 + Supabase
- **UI Components**: Radix UI (accesibilidad completa)
- **QR**: qrcode (generación client-side)
- **PDF**: jsPDF (generación client-side)

---

## Estructura del Proyecto

```
reino-del-pan/
│
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Stats.tsx
│   │   ├── GetInvolved.tsx
│   │   ├── WhyGetInvolved.tsx
│   │   ├── News.tsx
│   │   └── Newsletter.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── DPI.tsx               
│   │   ├── CreateDPI.tsx         
│   │   ├── RestoreDPI.tsx       
│   │   ├── Gobierno.tsx
│   │   ├── News.tsx
│   │   ├── Donations.tsx
│   │   ├── Privacy.tsx
│   │   ├── Terms.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── public/
│   ├── logo.png
│   └── templates/
│       ├── delante.jpg           
│       └── detras.jpg            
│
│
├── supabasetablas.md  
│
├── index.html
├── server.js                    
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Rutas Web

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Home | Landing page |
| `/about` | About | Información sobre el Reino del Pan |
| `/dpi` | DPI | Hub del DPI |
| `/dpi/crear` | CreateDPI | Crear nuevo DPI |
| `/dpi/recuperar` | RestoreDPI | Recuperar DPI existente |
| `/gobierno` | Gobierno | Estructura y políticas |
| `/news` | News | Noticias y actualizaciones |
| `/donations` | Donations | Donaciones |
| `/privacy` | Privacy | Política de privacidad |
| `/terms` | Terms | Términos y condiciones |

---

## API REST (`server.js`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/dpi/create` | Crea un nuevo DPI (rate-limited por IP) |
| `POST` | `/api/dpi/restore` | Recupera datos de un DPI existente por número + Discord |
| `GET`  | `/api/dpi/verify/:code` | Página de verificación pública (destino del QR) |

### POST `/api/dpi/create`
**Body:**
```json
{
  "nombre": "Gabriel",
  "apellidos": "García López",
  "genero": "Hombre",
  "fecha": "1995-04-20",
  "region": "Baguete"
}
```
**Respuesta:**
```json
{
  "dpiNumber": "DPI - 000001A",
  "issuedAt": "02/06/2026",
  "validUntil": "02/08/2027",
  "qrUrl": "https://tudominio.com/api/dpi/verify/000001A"
}
```

**Rate limit:**
- 5 DPIs por IP → cooldown 24 h
- 10 DPIs por IP → cooldown 7 días

### POST `/api/dpi/restore`
**Body:**
```json
{
  "dpi": "DPI - 000001A",
  "discord": "manuel#0001"
}
```
El campo `discord` acepta username (`manuel`, `manuel#0001`) o ID numérico de Discord (`123456789012345678`).

**Respuesta:** todos los campos de la tabla `dpis` para ese número.

**Errores:**
- `400` — formato de DPI o Discord inválido
- `404` — DPI no encontrado o no pertenece a ese usuario
- `500` — error interno


---

## Base de datos (Supabase)

Ver **`supabasetablas.md`** para el SQL completo.

---

## Diseño y Estilo

### Paleta de Colores

| Variable | Valor | Uso |
|----------|-------|-----|
| `--accent` | `#d4af37` | Color principal (dorado) |
| `--foreground` | `#1a1410` | Texto principal |
| `--background` | `#faf9f5` | Fondo |
| `--border` | `#e0d8c8` | Bordes |

### Tipografía

- **Playfair Display** — títulos y encabezados
- **Inter** — cuerpo y contenido
- **Courier New** — número de DPI (monospace)
- **Times New Roman** — datos en las plantillas del DPI

---

## Generación del DPI (client-side)

El DPI se genera completamente en el navegador. La foto y la firma **nunca salen del dispositivo del usuario**.

1. El servidor devuelve: número de DPI, fechas y URL del QR
2. El cliente renderiza la delantera y trasera sobre `<canvas>` usando las plantillas `/templates/delante.jpg` y `/templates/detras.jpg`
3. El usuario descarga las imágenes en JPG o en PDF (A4 landscape)

En la **recuperación** de DPI la foto y firma no aparecen (no se almacenan), pero todos los datos textuales y el QR se regeneran correctamente.

---

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo (Vite + HMR)
npm run dev

# Build de producción
npm run build

# Servidor de producción (Express, puerto 3000)
node server.js

```

---

## Variables de Entorno (`server.js`)

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_KEY` | Service role key de Supabase |
| `PUBLIC_URL` | URL pública del servidor (para los QR) |
| `PORT` | Puerto del servidor (por defecto `3000`) |

---

## Contacto

- **X (Twitter)**: [@gov_pan](https://x.com/gov_pan)
- **TikTok**: [@gov_pan](https://www.tiktok.com/@gov_pan)

---

*Última actualización: junio 2026*

Postdata, si os lo preguntais, si, este md lo ha hecho claude pq me daba
una pereza criminal escribir todo, xd