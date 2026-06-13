import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import session from "express-session";
import { readFileSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { realtime: { transport: ws } }
);

// ── Roles desde JSON ──────────────────────────────────────────────────────────
let rolesData = { roles: [] };
try {
  rolesData = JSON.parse(readFileSync(path.resolve(__dirname, "data", "roles.json"), "utf-8"));
} catch (e) {
  console.warn("⚠️ No se pudo leer data/roles.json:", e.message);
}

// ── Discord OAuth2 config ─────────────────────────────────────────────────────
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const PUBLIC_URL = process.env.PUBLIC_URL || "http://localhost:5174";
const DISCORD_REDIRECT_URI = `${PUBLIC_URL}/auth/discord/callback`;
const DISCORD_API = "https://discord.com/api/v10";

// ── Rate-limit en RAM ─────────────────────────────────────────────────────────
const ipStore = new Map();
const IDLE_TTL_MS = 60 * 60 * 1000;
const SOFT_LIMIT = 5;
const SOFT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const HARD_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function getIpEntry(ip) {
  return ipStore.get(ip) ?? { count: 0, firstAt: null, blockedUntil: null, cleanTimer: null };
}
function scheduleClean(ip) {
  const entry = ipStore.get(ip);
  if (!entry) return;
  clearTimeout(entry.cleanTimer);
  entry.cleanTimer = setTimeout(() => {
    const e = ipStore.get(ip);
    if (e && (!e.blockedUntil || Date.now() > e.blockedUntil)) ipStore.delete(ip);
  }, IDLE_TTL_MS);
}
function checkRateLimit(ip) {
  const now = Date.now();
  const entry = getIpEntry(ip);
  if (entry.blockedUntil && now < entry.blockedUntil)
    return { allowed: false, retryAfterMs: entry.blockedUntil - now };
  if (entry.blockedUntil && now >= entry.blockedUntil) {
    entry.count = 0; entry.firstAt = null; entry.blockedUntil = null;
  }
  return { allowed: true, retryAfterMs: 0, entry };
}
function recordUsage(ip) {
  const now = Date.now();
  let entry = getIpEntry(ip);
  entry.count = (entry.count || 0) + 1;
  if (!entry.firstAt) entry.firstAt = now;
  if (entry.count >= SOFT_LIMIT * 2) entry.blockedUntil = now + HARD_COOLDOWN_MS;
  else if (entry.count >= SOFT_LIMIT) entry.blockedUntil = now + SOFT_COOLDOWN_MS;
  ipStore.set(ip, entry);
  scheduleClean(ip);
}

// ── Generador atómico de DPI ──────────────────────────────────────────────────
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
async function getNextDPINumber() {
  const { data, error } = await supabase.rpc("increment_dpi_counter");
  if (error) throw new Error("Error al obtener número DPI: " + error.message);
  const seq = data;
  const num = String(seq).padStart(6, "0");
  const letter = LETTERS[seq % LETTERS.length];
  return `DPI - ${num}${letter}`;
}

// ── Express ───────────────────────────────────────────────────────────────────
const app = express();
const port = process.env.PORT || 3344;
const staticFolder = path.resolve(__dirname, "dist", "public");

// 🔧 FIX: confiar en el proxy (necesario para HTTPS en duckdns.org)
app.set('trust proxy', 1);

app.use(express.json({ limit: "1mb" }));

// ── Sesiones con configuración mejorada ────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: 'auto',        // 'auto' detecta si la conexión es HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  },
}));

app.use(express.static(staticFolder));

function getIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

// ── Middleware: require auth ──────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  return res.status(401).json({ error: "No autenticado." });
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH DISCORD
// ─────────────────────────────────────────────────────────────────────────────

// GET /auth/discord → redirige a Discord
app.get("/auth/discord", (req, res) => {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify guilds.members.read",
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

// GET /auth/discord/callback → intercambia code por token, carga datos
app.get("/auth/discord/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect("/?auth=error");

  try {
    // 1. Obtener token de acceso
    const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("Sin access_token");

    const accessToken = tokenData.access_token;

    // 2. Obtener perfil Discord
    const profileRes = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();
    if (!profile.id) throw new Error("No se pudo obtener perfil");

    // 3. Comprobar si está en el guild y obtener roles
    const memberRes = await fetch(
      `${DISCORD_API}/users/@me/guilds/${GUILD_ID}/member`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    let memberRoleIds = [];
    let inGuild = false;

    if (memberRes.ok) {
      const memberData = await memberRes.json();
      memberRoleIds = memberData.roles ?? [];
      inGuild = true;
    }

    // 4. Cruzar roles de Discord con roles.json
    const rolesDelUsuario = rolesData.roles.filter(r =>
      r.discord_role_id && memberRoleIds.includes(r.discord_role_id)
    );

    // 5. Buscar en tabla verificados
    const { data: verificado } = await supabase
      .from("verificados")
      .select("dpi")
      .eq("discord_id", profile.id)
      .maybeSingle();

    // 6. Si tiene DPI verificado, buscar datos del DPI
    let dpiData = null;
    if (verificado?.dpi) {
      const { data: dpi } = await supabase
        .from("dpis")
        .select("dpi_number, nombre, apellidos, genero, fecha_nac, region, issued_at, valid_until")
        .eq("dpi_number", verificado.dpi)
        .maybeSingle();
      dpiData = dpi;
    }

    // 7. Guardar en sesión los datos del usuario
    req.session.user = {
      id: profile.id,
      username: profile.username,
      avatar: profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=128`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(profile.id) % 5}.png`,
      inGuild,
      roles: rolesDelUsuario,
      dpi: dpiData,
      verificado: !!verificado,
    };

    // 🔧 FIX: Forzar el guardado de la sesión antes de redirigir
    req.session.save((err) => {
      if (err) {
        console.error("Error guardando la sesión:", err);
        return res.redirect("/?auth=error");
      }
      // Redirigir a la carpeta del ciudadano
      res.redirect("/carpeta");
    });

  } catch (err) {
    console.error("[/auth/discord/callback]", err);
    res.redirect("/?auth=error");
  }
});

// GET /auth/logout
app.get("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// GET /api/me → devuelve datos de sesión al frontend
app.get("/api/me", (req, res) => {
  if (!req.session?.user) return res.status(401).json({ user: null });
  return res.json({ user: req.session.user });
});

// GET /api/me/refresh → refresca datos de sesión (roles y DPI actualizados)
app.get("/api/me/refresh", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const { data: verificado } = await supabase
      .from("verificados")
      .select("dpi")
      .eq("discord_id", userId)
      .maybeSingle();

    let dpiData = null;
    if (verificado?.dpi) {
      const { data: dpi } = await supabase
        .from("dpis")
        .select("dpi_number, nombre, apellidos, genero, fecha_nac, region, issued_at, valid_until")
        .eq("dpi_number", verificado.dpi)
        .maybeSingle();
      dpiData = dpi;
    }

    req.session.user.dpi = dpiData;
    req.session.user.verificado = !!verificado;

    return res.json({ user: req.session.user });
  } catch (err) {
    console.error("[/api/me/refresh]", err);
    return res.status(500).json({ error: "Error interno." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DPI ENDPOINTS (existentes)
// ─────────────────────────────────────────────────────────────────────────────

app.post("/api/dpi/create", async (req, res) => {
  const ip = getIP(req);
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    const hours = Math.ceil(retryAfterMs / 3_600_000);
    return res.status(429).json({ error: "Demasiados DPIs creados. Inténtalo más tarde.", retryAfterMs, retryAfterHours: hours });
  }
  const { nombre, apellidos, genero, fecha, region } = req.body ?? {};
  if (!nombre || !apellidos || !genero || !fecha || !region)
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  try {
    const dpiNumber = await getNextDPINumber();
    const today = new Date();
    const expDate = formatDate(today);
    const valDate = addMonths(today, 14);
    const qrUrl = buildQrUrl(dpiNumber);
    const { error: dbErr } = await supabase.from("dpis").insert({
      dpi_number: dpiNumber, nombre: nombre.trim().toUpperCase(),
      apellidos: apellidos.trim().toUpperCase(), genero, fecha_nac: fecha,
      region: region.trim().toUpperCase(), issued_at: expDate,
      valid_until: valDate, ip_address: ip, qr_url: qrUrl,
    });
    if (dbErr) throw new Error(dbErr.message);
    recordUsage(ip);
    return res.json({ dpiNumber, issuedAt: expDate, validUntil: valDate, qrUrl });
  } catch (err) {
    console.error("[/api/dpi/create]", err);
    return res.status(500).json({ error: "Error interno. Intenta de nuevo." });
  }
});

app.post("/api/dpi/restore", async (req, res) => {
  const { dpi, discord } = req.body ?? {};
  const DPI_REGEX = /^DPI - \d{1,6}[A-Z]$/;
  const SAFE_DISCORD = /^[a-zA-Z0-9_.#\-]{2,32}$|^\d{17,20}$/;
  const cleanDPI = (dpi ?? "").replace(/[\x00-\x1F\x7F<>"'`;]/g, "").trim().toUpperCase().replace(/\s*-\s*/g, " - ");
  const cleanDiscord = (discord ?? "").replace(/[\x00-\x1F\x7F<>"'`;]/g, "").trim();
  if (!DPI_REGEX.test(cleanDPI)) return res.status(400).json({ error: "Formato de DPI inválido." });
  if (!SAFE_DISCORD.test(cleanDiscord)) return res.status(400).json({ error: "Usuario de Discord no válido." });
  try {
    const isId = /^\d{17,20}$/.test(cleanDiscord);
    const query = supabase.from("verificados").select("discord_id, discord_username, dpi").eq("dpi", cleanDPI);
    const { data: verificado, error: vErr } = await (
      isId ? query.eq("discord_id", cleanDiscord) : query.ilike("discord_username", `${cleanDiscord}%`)
    ).maybeSingle();
    if (vErr) throw new Error(vErr.message);
    if (!verificado) return res.status(404).json({ error: "No hemos encontrado ningún DPI asociado a esa persona, o ese DPI no te pertenece." });
    const { data: dpiRow, error: dpiErr } = await supabase
      .from("dpis").select("dpi_number, nombre, apellidos, genero, fecha_nac, region, issued_at, valid_until, qr_url")
      .eq("dpi_number", cleanDPI).maybeSingle();
    if (dpiErr) throw new Error(dpiErr.message);
    if (!dpiRow) return res.status(404).json({ error: "DPI no encontrado en el registro." });
    return res.json(dpiRow);
  } catch (err) {
    console.error("[/api/dpi/restore]", err);
    return res.status(500).json({ error: "Error interno. Intenta de nuevo." });
  }
});

app.get("/api/dpi/verify/:code", async (req, res) => {
  const raw = decodeURIComponent(req.params.code);
  const full = raw.startsWith("DPI - ") ? raw : `DPI - ${raw}`;
  const { data, error } = await supabase
    .from("dpis").select("dpi_number,nombre,apellidos,genero,fecha_nac,region,issued_at,valid_until")
    .eq("dpi_number", full).single();
  if (error || !data) return res.status(404).send(verifyHtml(null));
  res.send(verifyHtml(data));
});

app.get("/health", (_req, res) => res.json({ status: "OK" }));

// ── HTML verificación QR ──────────────────────────────────────────────────────
function verifyHtml(d) {
  if (!d) return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>DPI no encontrado</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#1a0a0a;color:#c0a060;text-align:center}</style>
    </head><body><h2>DPI no encontrado</h2></body></html>`;
  return `<!DOCTYPE html>
<html lang="es"><head>
  <meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Verificación DPI · ${d.dpi_number}</title>
<style>
    @font-face{font-family:'Chillvornia';src:url('/Chillvornia-Regular.otf') format('opentype');font-weight:400;font-style:normal;font-display:swap}
    @font-face{font-family:'RMNeue';src:url('/RMNeueTRIAL-Regular.otf') format('opentype');font-weight:400;font-style:normal;font-display:swap}
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:linear-gradient(135deg, #faf9f5 0%, #f5f2eb 100%);color:#1a1410;font-family:'RMNeue','Playfair Display',serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;letter-spacing:0.3px;-webkit-font-smoothing:antialiased}
    .card{background:#ffffff;border:1px solid #e0dcd3;border-radius:0.75rem;max-width:380px;width:100%;padding:2rem;box-shadow:0 10px 30px rgba(15,50,106,0.08), 0 1px 3px rgba(0,0,0,0.02)}
    .badge{display:inline-block;background:#f0ede7;color:#0F326A;font-size:.75rem;font-weight:600;letter-spacing:.12em;padding:.35rem .8rem;border-radius:9999px;margin-bottom:1.5rem;text-transform:uppercase}
    .dpi-num{font-size:2.7rem;font-family:'Chillvornia',sans-serif;color:#0F326A;background:#f5f2eb;border:1px solid #e0dcd3;padding:.6rem 1rem;border-radius:.5rem;text-align:center;margin-bottom:1.5rem;line-height:1.1}
    .row{display:flex;justify-content:space-between;padding:.65rem 0;border-bottom:1px solid #e0dcd3;font-size:.92rem;gap:.5rem}
    .row:last-child{border-bottom:none}
    .label{color:#52525b;font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;flex-shrink:0;font-weight:500}
    .val{color:#1a1410;text-align:right;font-weight:600}
    .valid-stamp{margin-top:1.6rem;text-align:center;font-size:.8rem;color:#166534;font-weight:600;letter-spacing:.15em;text-transform:uppercase;background:#f0fdf4;padding:.4rem;border-radius:.375rem}
    .logo{display:block;margin:0 auto 1.2rem;width:56px;box-shadow:0 6px 18px rgba(15,50,106,0.08);border-radius:50%;transition:transform 220ms ease,filter 0.25s ease}
    .logo:hover{transform:translateY(-2px) rotate(-2deg);filter:drop-shadow(0 0 12px rgba(151,180,224,0.45))}
  </style>


  <div class="card">
    <img src="/logo.png" class="logo" alt="Logo" onerror="this.style.display='none'"/>
    <div style="text-align:center"><span class="badge">✓ DPI Verificado</span></div>
    <div class="dpi-num">${d.dpi_number}</div>
    <div class="row"><span class="label">Nombre</span><span class="val">${d.nombre}</span></div>
    <div class="row"><span class="label">Apellidos</span><span class="val">${d.apellidos}</span></div>
    <div class="row"><span class="label">Género</span><span class="val">${d.genero}</span></div>
    <div class="row"><span class="label">Nacimiento</span><span class="val">${d.fecha_nac}</span></div>
    <div class="row"><span class="label">Región</span><span class="val">${d.region}</span></div>
    <div class="row"><span class="label">Expedición</span><span class="val">${d.issued_at}</span></div>
    <div class="row"><span class="label">Válido hasta</span><span class="val">${d.valid_until}</span></div>
    <p class="valid-stamp">Documento válido</p>
  </div>
</body></html>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(d) {
  return [String(d.getDate()).padStart(2, "0"), String(d.getMonth() + 1).padStart(2, "0"), d.getFullYear()].join("/");
}
function addMonths(base, months) {
  const d = new Date(base); d.setMonth(d.getMonth() + months); return formatDate(d);
}
function buildQrUrl(dpiNumber) {
  const code = encodeURIComponent(dpiNumber.replace("DPI - ", ""));
  return `${PUBLIC_URL}/api/dpi/verify/${code}`;
}

// ── Fallback SPA ──────────────────────────────────────────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(path.join(staticFolder, "index.html"));
});

// export default siempre al top-level (requerido por ESM)
// En Vercel Serverless la plataforma usa este export; en local se ignora
export default app;

// Solo levantamos el servidor HTTP cuando NO estamos en Vercel Serverless
if (!(process.env.NODE_ENV === "production" && !process.env.LOCAL_RUN)) {
  app.listen(port, () => {
    console.log(`  Server furula en http://localhost:${port}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PROXY DE DISCORD (Para la lista de miembros usando el Bot)
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/roles", async (req, res) => {
  try {
    if (!DISCORD_TOKEN) {
      console.error("❌ Error: Falta la variable DISCORD_TOKEN en el archivo .env");
      return res.status(500).json({ error: "Configuración incompleta en el servidor." });
    }

    // Hacemos la petición a Discord firmando como BOT con tu token 'MTUwNT...'
    const response = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/members?limit=1000`, {
      headers: {
        Authorization: `Bot ${DISCORD_TOKEN.trim()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Discord API respondió con código ${response.status}:`, data);
      return res.status(response.status).json(data);
    }

    // Si todo va bien, le devolvemos la lista completa de miembros a tu Frontend
    return res.json(data);

  } catch (error) {
    console.error("❌ Error en el proxy /api/roles:", error);
    return res.status(500).json({ error: "Error interno al conectar con Discord." });
  }
});