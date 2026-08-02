import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
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
  const raw = JSON.parse(readFileSync(path.resolve(__dirname, "data", "roles.json"), "utf-8"));
  const rawRoles = raw?.roles;

  if (Array.isArray(rawRoles)) {
    rolesData = { roles: rawRoles };
  } else if (rawRoles && typeof rawRoles === "object") {
    const flattened = [];
    for (const [categoria, lista] of Object.entries(rawRoles)) {
      if (Array.isArray(lista)) {
        for (const rol of lista) {
          flattened.push({ ...rol, categoria });
        }
      }
    }
    rolesData = { roles: flattened };
  } else if (Array.isArray(raw)) {
    rolesData = { roles: raw };
  } else if (raw && typeof raw === "object") {
    rolesData = {
      roles: Object.entries(raw).map(([name, discord_role_id]) => ({
        nombre: name,
        discord_role_id: String(discord_role_id),
      })),
    };
  } else {
    console.warn("⚠️ data/roles.json no tiene un formato reconocido. Usando lista vacía.");
  }
} catch (e) {
  console.warn("⚠️ No se pudo leer data/roles.json:", e.message);
}

if (!Array.isArray(rolesData.roles)) {
  rolesData.roles = [];
}

// ── Discord OAuth2 config ─────────────────────────────────────────────────────
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const PUBLIC_URL = process.env.PUBLIC_URL || "http://localhost:5174";
const DISCORD_REDIRECT_URI = `${PUBLIC_URL}/auth/discord/callback`;
const DISCORD_API = "https://discord.com/api/v10";

// ── JWT config ─────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-cambia-esto";
const JWT_EXPIRES_IN = "7d";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 días
const COOKIE_NAME = "session";

if (!process.env.JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET no está definido en las variables de entorno. Usando un valor por defecto INSEGURO.");
}

function signUserToken(user) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function setSessionCookie(res, user) {
  const token = signUserToken(user);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
  });
}

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

// ── Funciones Auxiliares de Formato ───────────────────────────────────────────
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

app.set('trust proxy', 1);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Solo servir estáticos si NO estamos en Vercel (por ejemplo, en desarrollo local con node server.js)
if (!process.env.VERCEL) {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "public", "index.html"));
  });
}

function getIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

// ── Middleware: require auth (basado en JWT en cookie) ────────────────────────
function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "No autenticado." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Sesión inválida o expirada." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH DISCORD
// ─────────────────────────────────────────────────────────────────────────────

app.get("/auth/discord", (req, res) => {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify guilds.members.read",
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

app.get("/auth/discord/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect("/?auth=error");

  try {
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

    const profileRes = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();
    if (!profile.id) throw new Error("No se pudo obtener perfil");

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

    const rolesDelUsuario = rolesData.roles.filter(r =>
      r.discord_role_id && memberRoleIds.includes(r.discord_role_id)
    );

    const { data: verificado } = await supabase
      .from("verificados")
      .select("dpi")
      .eq("discord_id", profile.id)
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

    const avatarUrl = profile.avatar
      ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(profile.id) % 5}.png`;

    // Sincronización automática de perfil en la tabla de usuarios de Supabase
    await supabase.from("usuarios").upsert({
      discord_id: profile.id,
      username: profile.username,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    });

    const userPayload = {
      id: profile.id,
      username: profile.username,
      avatar: avatarUrl,
      inGuild,
      roles: rolesDelUsuario,
      dpi: dpiData,
      verificado: !!verificado,
      matrimonio: null,
      hijos: []
    };

    setSessionCookie(res, userPayload);
    res.redirect("/carpeta");

  } catch (err) {
    console.error("[/auth/discord/callback]", err);
    res.redirect("/?auth=error");
  }
});

app.get("/auth/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  res.redirect("/");
});

// ── GET /api/me ──
app.get("/api/me", async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ user: null });

  try {
    const user = jwt.verify(token, JWT_SECRET);
    const discordId = user.id;

    const { data: levelData } = await supabase
      .from("user_levels")
      .select("level, xp, total_xp, messages")
      .eq("user_id", discordId)
      .maybeSingle();

    const { data: matrimonioData } = await supabase
      .from('matrimonios')
      .select(`
        fecha_boda,
        u1:user_id_1 (discord_id, username, avatar_url),
        u2:user_id_2 (discord_id, username, avatar_url)
      `)
      .or(`user_id_1.eq.${discordId},user_id_2.eq.${discordId}`)
      .maybeSingle();

    let matrimonio = null;
    if (matrimonioData) {
      const esU1 = matrimonioData.u1.discord_id === discordId;
      const conyuge = esU1 ? matrimonioData.u2 : matrimonioData.u1;

      matrimonio = {
        conyuge_id: conyuge.discord_id,
        conyuge_username: conyuge.username,
        conyuge_avatar: conyuge.avatar_url,
        fecha_boda: matrimonioData.fecha_boda
      };
    }

    const { data: hijosData } = await supabase
      .from('hijos')
      .select(`
        id,
        tipo,
        hijo_discord_id,
        nombre_ficticio,
        avatar_ficticio,
        usuarios:hijo_discord_id (username, avatar_url)
      `)
      .eq('padre_id', discordId);

    const hijos = (hijosData || []).map(h => {
      const esCreado = h.tipo === 'creado';
      return {
        hijo_id: esCreado ? `creado_${h.id}` : h.hijo_discord_id,
        hijo_username: esCreado ? h.nombre_ficticio : h.usuarios?.username || "Desconocido",
        hijo_avatar: esCreado ? h.avatar_ficticio : h.usuarios?.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png",
        tipo: h.tipo
      };
    });

    user.matrimonio = matrimonio;
    user.hijos = hijos;

    user.level = levelData?.level ?? 0;
    user.xp = levelData?.xp ?? 0;
    user.total_xp = levelData?.total_xp ?? 0;
    user.messages = levelData?.messages ?? 0;

    return res.json({ user });
  } catch (err) {
    return res.status(401).json({ user: null });
  }
});

// GET /api/me/refresh
app.get("/api/me/refresh", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

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

    const { data: levelData } = await supabase
      .from("user_levels")
      .select("level, xp, total_xp, messages")
      .eq("user_id", userId)
      .maybeSingle();

    const updatedUser = {
      ...req.user,
      dpi: dpiData,
      verificado: !!verificado,
      level: levelData?.level ?? 0,
      xp: levelData?.xp ?? 0,
      total_xp: levelData?.total_xp ?? 0,
      messages: levelData?.messages ?? 0,
    };

    delete updatedUser.iat;
    delete updatedUser.exp;

    setSessionCookie(res, updatedUser);
    return res.json({ user: updatedUser });
  } catch (err) {
    console.error("[/api/me/refresh]", err);
    return res.status(500).json({ error: "Error interno." });
  }
});

// ── ENDPOINT LEADERBOARD ──
app.get("/api/leaderboard", async (req, res) => {
  try {
    const { data: ranking, error: levelErr } = await supabase
      .from("user_levels")
      .select("user_id, username, level, xp, total_xp, messages")
      .order("total_xp", { ascending: false });

    if (levelErr) throw levelErr;
    if (!ranking || ranking.length === 0) {
      return res.json({
        top5: [],
        rankingCompleto: [],
        destacados: { masMensajes: null, menosMensajes: null }
      });
    }

    const userIds = ranking.map(u => u.user_id);

    const { data: dbUsuarios, error: userErr } = await supabase
      .from("usuarios")
      .select("discord_id, avatar_url")
      .in("discord_id", userIds);

    if (userErr) throw userErr;

    const avatarMap = {};
    (dbUsuarios || []).forEach(u => {
      avatarMap[u.discord_id] = u.avatar_url;
    });

    const usuariosFormateados = ranking.map((u, index) => ({
      posicion: index + 1,
      id: u.user_id,
      username: u.username,
      level: u.level,
      xp: u.xp,
      total_xp: u.total_xp,
      messages: u.messages,
      avatar: avatarMap[u.user_id] || `https://cdn.discordapp.com/embed/avatars/${index % 5}.png`
    }));

    const top5 = usuariosFormateados.slice(0, 5);
    const rankingCompleto = usuariosFormateados;

    const masMensajes = [...usuariosFormateados].sort((a, b) => b.messages - a.messages)[0] || null;
    const activos = usuariosFormateados.filter(u => u.messages > 0);
    const menosMensajes = activos.length > 0
      ? [...activos].sort((a, b) => a.messages - b.messages)[0]
      : (usuariosFormateados[usuariosFormateados.length - 1] || null);

    return res.json({
      top5,
      rankingCompleto,
      destacados: { masMensajes, menosMensajes }
    });
  } catch (err) {
    console.error("[/api/leaderboard] Error catastrófico:", err);
    return res.status(500).json({ error: "Error interno al procesar el ranking." });
  }
});

// ── DPI ENDPOINTS ─────────────────────────────────────────────────────────────

app.get("/api/dpi/verify-discord/:discordId", async (req, res) => {
  const { discordId } = req.params;
  try {
    const { data: verificado, error } = await supabase
      .from("verificados")
      .select("dpi")
      .eq("discord_id", discordId)
      .maybeSingle();

    if (error) {
      console.error("Error de Supabase al buscar verificado:", error);
      return res.status(500).send("Error interno en la base de datos.");
    }

    if (!verificado || !verificado.dpi) {
      return res.redirect("/dpi/no-verificado");
    }

    const code = encodeURIComponent(verificado.dpi.replace("DPI - ", ""));
    return res.redirect(`/api/dpi/verify/${code}`);
  } catch (err) {
    console.error("[/api/dpi/verify-discord] Error catastrófico:", err);
    return res.status(500).send("Error interno del servidor.");
  }
});

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

// ── Endpoint de Verificación Dinámica con obtención de Avatar ────────────────
app.get("/api/dpi/verify/:code", async (req, res) => {
  const raw = decodeURIComponent(req.params.code);
  const full = raw.startsWith("DPI - ") ? raw : `DPI - ${raw}`;
  const { data, error } = await supabase
    .from("dpis").select("dpi_number,nombre,apellidos,genero,fecha_nac,region,issued_at,valid_until")
    .eq("dpi_number", full).single();

  if (error || !data) return res.status(404).send(verifyHtml(null));

  let rolesDelUsuario = [];
  let userAvatarUrl = null;

  try {
    const { data: verificado } = await supabase
      .from("verificados")
      .select("discord_id")
      .eq("dpi", full)
      .maybeSingle();

    if (verificado?.discord_id) {
      const { data: dbUser } = await supabase
        .from("usuarios")
        .select("avatar_url")
        .eq("discord_id", verificado.discord_id)
        .maybeSingle();

      if (dbUser?.avatar_url) {
        userAvatarUrl = dbUser.avatar_url;
      }

      if (DISCORD_TOKEN) {
        const memberRes = await fetch(
          `${DISCORD_API}/guilds/${GUILD_ID}/members/${verificado.discord_id}`,
          { headers: { Authorization: `Bot ${DISCORD_TOKEN.trim()}` } }
        );
        if (memberRes.ok) {
          const memberData = await memberRes.json();
          const memberRoleIds = memberData.roles ?? [];
          rolesDelUsuario = rolesData.roles.filter(r =>
            r.discord_role_id && memberRoleIds.includes(r.discord_role_id)
          );
        }
      }
    }
  } catch (err) {
    console.error("[/api/dpi/verify] Error obteniendo datos del usuario:", err);
  }

  if (!userAvatarUrl) {
    userAvatarUrl = "https://cdn.discordapp.com/embed/avatars/0.png";
  }

  res.send(verifyHtml(data, rolesDelUsuario, userAvatarUrl));
});


// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS: CONSORCIO DE TRANSPORTES (REINO DEL PAN)
// ─────────────────────────────────────────────────────────────────────────────

// Asegúrate de tener DISCORD_BOT_TOKEN y GUILD_ID en tu .env)
const ROLE_CONSORCIO = "1515829072209510603";
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

/**
 * Helper para asignar el rol de Discord mediante la API REST
 */
async function asignarRolDiscord(discordId) {
  if (!DISCORD_BOT_TOKEN || !GUILD_ID) {
    console.error("[Discord] Falta DISCORD_BOT_TOKEN o GUILD_ID en las variables de entorno.");
    return false;
  }

  const url = `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}/roles/${ROLE_CONSORCIO}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        "X-Audit-Log-Reason": "Tarjeta de transporte del Consorcio emitida/renovada automáticamente",
      },
    });

    if (response.ok || response.status === 204) {
      console.log(`[Discord] Rol asignado con éxito al usuario ${discordId}`);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[Discord API Error] Status: ${response.status}`, errorData);
      return false;
    }
  } catch (err) {
    console.error("[Discord Network Error] No se pudo asignar el rol:", err);
    return false;
  }
}

/**
 * GET /api/transporte/tarjeta
 * Obtiene la tarjeta de transporte del usuario autenticado si existe.
 */
app.get("/api/transporte/tarjeta", requireAuth, async (req, res) => {
  try {
    const discordId = req.user.id;

    const { data: tarjeta, error } = await supabase
      .from("consorcio_tarjetas")
      .select("*")
      .eq("discord_id", discordId)
      .maybeSingle();

    if (error) {
      console.error("Error al obtener tarjeta de transporte:", error);
      return res.status(500).json({ error: "Error en la base de datos al buscar tu tarjeta." });
    }

    return res.json({ tarjeta });
  } catch (err) {
    console.error("[GET /api/transporte/tarjeta]", err);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

/**
 * POST /api/transporte/tarjeta/solicitar
 * Crea una tarjeta vinculando automáticamente los datos del DPI del usuario de Supabase.
 */
app.post("/api/transporte/tarjeta/solicitar", requireAuth, async (req, res) => {
  try {
    const discordId = req.user.id;

    // 1. Verificar si ya posee una tarjeta activa/registrada (La base de datos tiene una restricción UNIQUE)
    const { data: tarjetaExistente } = await supabase
      .from("consorcio_tarjetas")
      .select("id")
      .eq("discord_id", discordId)
      .maybeSingle();

    if (tarjetaExistente) {
      return res.status(400).json({ error: "Ya tienes una tarjeta de transporte vinculada a tu cuenta." });
    }

    // 2. Extraer los datos reales del DPI del usuario utilizando la tabla 'verificados' y 'dpis'
    const { data: verificado, error: vErr } = await supabase
      .from("verificados")
      .select("dpi")
      .eq("discord_id", discordId)
      .maybeSingle();

    if (vErr || !verificado?.dpi) {
      return res.status(403).json({ error: "Debes tener un DPI verificado para solicitar la tarjeta de transporte." });
    }

    const { data: dpiData, error: dpiErr } = await supabase
      .from("dpis")
      .select("dpi_number, nombre, apellidos, region")
      .eq("dpi_number", verificado.dpi)
      .maybeSingle();

    if (dpiErr || !dpiData) {
      return res.status(404).json({ error: "No se encontraron los datos de tu DPI oficial en el sistema." });
    }

    // 3. Insertar la nueva tarjeta en la base de datos
    const { data: nuevaTarjeta, error: insertErr } = await supabase
      .from("consorcio_tarjetas")
      .insert({
        dpi: dpiData.dpi_number,
        nombre: dpiData.nombre,
        apellidos: dpiData.apellidos,
        region: dpiData.region,
        discord_id: discordId
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Error al insertar tarjeta:", insertErr);
      if (insertErr.message.includes("consorcio_tarjetas_region_check")) {
        return res.status(400).json({ error: "Tu región de DPI no está autorizada por el Consorcio del Pan." });
      }
      return res.status(400).json({ error: `No se pudo emitir la tarjeta: ${insertErr.message}` });
    }

    // 4. Asignación automática del Rol en el servidor de Discord
    const rolAsignado = await asignarRolDiscord(discordId);

    let mensajeExito = "¡Tarjeta de transporte emitida con éxito!";
    if (!rolAsignado) {
      mensajeExito += " Nota: La tarjeta se creó pero hubo un problema al asignarte el rol en Discord, contacta con soporte.";
    }

    return res.json({
      success: true,
      message: mensajeExito,
      tarjeta: nuevaTarjeta
    });

  } catch (err) {
    console.error("[POST /api/transporte/tarjeta/solicitar]", err);
    return res.status(500).json({ error: "Error interno al procesar la solicitud." });
  }
});

/**
 * POST /api/transporte/tarjeta/renovar
 * Extiende la validez de la tarjeta por 1 año más e incrementa el contador de renovaciones.
 */
app.post("/api/transporte/tarjeta/renovar", requireAuth, async (req, res) => {
  try {
    const discordId = req.user.id;

    // Buscar la tarjeta actual
    const { data: tarjeta, error: findErr } = await supabase
      .from("consorcio_tarjetas")
      .select("id, renovaciones, caduca_at")
      .eq("discord_id", discordId)
      .maybeSingle();

    if (findErr || !tarjeta) {
      return res.status(444).json({ error: "No dispones de ninguna tarjeta que renovar." });
    }

    // Calcular la nueva fecha de caducidad (1 año extra desde el momento actual)
    const nuevaCaducidad = new Date();
    nuevaCaducidad.setFullYear(nuevaCaducidad.getFullYear() + 1);

    const { data: tarjetaRenovada, error: updateErr } = await supabase
      .from("consorcio_tarjetas")
      .update({
        activa: true,
        renovaciones: tarjeta.renovaciones + 1,
        ultima_renovacion: new Date().toISOString(),
        caduca_at: nuevaCaducidad.toISOString()
      })
      .eq("discord_id", discordId)
      .select()
      .single();

    if (updateErr) {
      console.error("Error al renovar tarjeta:", updateErr);
      return res.status(400).json({ error: "Error al actualizar la vigencia de la tarjeta." });
    }

    // Asegurar que conserva el rol activo tras la renovación
    await asignarRolDiscord(discordId);

    return res.json({ success: true, message: "Tarjeta renovada por 1 año adicional.", tarjeta: tarjetaRenovada });

  } catch (err) {
    console.error("[POST /api/transporte/tarjeta/renovar]", err);
    return res.status(500).json({ error: "Error interno al procesar la renovación." });
  }
});

// ── ENDPOINT PARA PUBLICAR NOTICIAS (MESA DE REDACCIÓN) ───────────────────────
app.post("/api/news", requireAuth, async (req, res) => {
  try {
    const { id, type, category, title, summary, time_label, img_url } = req.body ?? {};

    if (!id || !type || !category || !title || !time_label || !img_url) {
      return res.status(400).json({ error: "Por favor, rellena todos los campos obligatorios." });
    }

    const { data, error } = await supabase
      .from("tvp_news")
      .insert({
        id: id.trim().toLowerCase(),
        type,
        category: category.trim().toUpperCase(),
        title: title.trim(),
        summary: type === "main" ? summary?.trim() : null,
        time_label: time_label.trim(),
        img_url: img_url.trim()
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error de Supabase al insertar noticia:", error);
      return res.status(400).json({ error: `Base de datos: ${error.message}` });
    }

    return res.json({ success: true, message: "¡Noticia publicada con éxito!", data });

  } catch (err) {
    console.error("[/api/news] Error catastrófico:", err);
    return res.status(500).json({ error: "Error interno del servidor al procesar la noticia." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS DE SISTEMA ELECTORAL (INTEGRACIÓN CON ELECTORAL.PY)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/electoral/procesos
 * Lista todos los procesos electorales activos/abiertos.
 */
app.get("/api/electoral/procesos", async (req, res) => {
  try {
    const { estado, tipo } = req.query;
    let query = supabase.from("electa_procesos_electorales").select("*");

    if (estado) {
      query = query.eq("estado", estado);
    } else {
      query = query.eq("estado", "abierto");
    }

    if (tipo) {
      query = query.eq("tipo", tipo);
    }

    const { data: procesos, error } = await query.order("fecha_inicio", { ascending: false });

    if (error) throw error;
    return res.json({ procesos });
  } catch (err) {
    console.error("[GET /api/electoral/procesos]", err);
    return res.status(500).json({ error: "Error interno al obtener los procesos electorales." });
  }
});

/**
 * GET /api/electoral/procesos/:id
 * Obtiene los detalles de un proceso electoral concreto con sus candidaturas.
 */
app.get("/api/electoral/procesos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: proceso, error: pErr } = await supabase
      .from("electa_procesos_electorales")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (pErr || !proceso) {
      return res.status(404).json({ error: "Proceso electoral no encontrado." });
    }

    const { data: candidaturas, error: cErr } = await supabase
      .from("electa_candidaturas")
      .select("*")
      .eq("proceso_id", id);

    if (cErr) throw cErr;

    return res.json({ proceso, candidaturas: candidaturas || [] });
  } catch (err) {
    console.error("[GET /api/electoral/procesos/:id]", err);
    return res.status(500).json({ error: "Error interno al obtener detalle del proceso." });
  }
});

/**
 * POST /api/electoral/votar
 * Permite emitir un voto web sincronizado con la tabla `electa_votos`.
 */
app.post("/api/electoral/votar", requireAuth, async (req, res) => {
  try {
    const voterId = req.user.id;
    const { proceso_id, opcion, opcion_idx = 0, voto_publico = false } = req.body ?? {};

    if (!proceso_id || !opcion) {
      return res.status(400).json({ error: "Faltan parámetros de votación (proceso_id, opcion)." });
    }

    // 1. Validar que el proceso esté abierto
    const { data: proceso, error: pErr } = await supabase
      .from("electa_procesos_electorales")
      .select("estado, tipo")
      .eq("id", proceso_id)
      .maybeSingle();

    if (pErr || !proceso) {
      return res.status(404).json({ error: "Proceso electoral no encontrado." });
    }

    if (proceso.estado !== "abierto") {
      return res.status(400).json({ error: "Este proceso electoral no está abierto a votación." });
    }

    // 2. Insertar el voto en la tabla `electa_votos`
    const { error: insertErr } = await supabase.from("electa_votos").insert({
      proceso_id,
      voter_id: voterId,
      opcion,
      opcion_idx,
      voto_publico,
      timestamp: new Date().toISOString()
    });

    if (insertErr) {
      if (insertErr.message.includes("unique") || insertErr.message.includes("uq_electa_votos")) {
        return res.status(400).json({ error: "Ya has emitido un voto en este proceso electoral." });
      }
      throw insertErr;
    }

    // 3. Si es de tipo partido, actualizar los votos totales en la candidatura elegida
    if (proceso.tipo !== "referendum") {
      const { count, error: countErr } = await supabase
        .from("electa_votos")
        .select("id", { count: "exact", head: true })
        .eq("proceso_id", proceso_id)
        .eq("opcion", opcion);

      if (!countErr && count !== null) {
        await supabase
          .from("electa_candidaturas")
          .update({ votos_totales: count })
          .eq("id", opcion);
      }
    }

    return res.json({ success: true, message: "¡Voto registrado con éxito!" });
  } catch (err) {
    console.error("[POST /api/electoral/votar]", err);
    return res.status(500).json({ error: "Error interno al procesar el voto." });
  }
});

/**
 * GET /api/electoral/partidos
 * Lista de partidos políticos activos en el sistema.
 */
app.get("/api/electoral/partidos", async (req, res) => {
  try {
    const { data: partidos, error } = await supabase
      .from("electa_partidos")
      .select("*")
      .eq("guild_id", GUILD_ID)
      .eq("activo", true);

    if (error) throw error;
    return res.json({ partidos: partidos || [] });
  } catch (err) {
    console.error("[GET /api/electoral/partidos]", err);
    return res.status(500).json({ error: "Error interno al obtener los partidos." });
  }
});

/**
 * GET /api/electoral/partidos/:siglas
 * Muestra los detalles de un partido específico por sus siglas.
 */
app.get("/api/electoral/partidos/:siglas", async (req, res) => {
  try {
    const siglas = req.params.siglas.toUpperCase();
    const { data: partido, error } = await supabase
      .from("electa_partidos")
      .select("*")
      .eq("guild_id", GUILD_ID)
      .eq("siglas", siglas)
      .eq("activo", true)
      .maybeSingle();

    if (error || !partido) {
      return res.status(404).json({ error: "Partido no encontrado o inactivo." });
    }

    return res.json({ partido });
  } catch (err) {
    console.error("[GET /api/electoral/partidos/:siglas]", err);
    return res.status(500).json({ error: "Error interno al obtener la información del partido." });
  }
});

app.get("/health", (_req, res) => res.json({ status: "OK" }));

function escHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function verifyHtml(d, roles = [], avatarUrl = "") {
  if (!d) return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>DPI no encontrado</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#1a0a0a;color:#c0a060;text-align:center}</style></head><body><h2>DPI no encontrado</h2></body></html>`;

  const rolesHtml = roles.length > 0 ? `
    <div class="roles-row">
      ${roles.map(r => {
    const titulo = escHtml(r.nombre);
    if (r.emoji) return `<span class="role-icon" title="${titulo}">${r.emoji}</span>`;
    if (r.imagen) return `<img class="role-icon" src="${escHtml(r.imagen)}" alt="${titulo}" title="${titulo}"/>`;
    return "";
  }).join("")}
    </div>` : "";

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
    .header-logos{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem}
    .badge{display:inline-block;background:#f0ede7;color:#0F326A;font-size:.75rem;font-weight:600;letter-spacing:.12em;padding:.35rem .8rem;border-radius:9999px;text-transform:uppercase}
    .dpi-num{font-size:2.7rem;font-family:'Chillvornia',sans-serif;color:#0F326A;background:#f5f2eb;border:1px solid #e0dcd3;padding:.6rem 1rem;border-radius:.5rem;text-align:center;margin-bottom:1.5rem;line-height:1.1}
    .row{display:flex;justify-content:space-between;padding:.65rem 0;border-bottom:1px solid #e0dcd3;font-size:.92rem;gap:.5rem}
    .row:last-child{border-bottom:none}
    .label{color:#52525b;font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;flex-shrink:0;font-weight:500}
    .val{color:#1a1410;text-align:right;font-weight:600}
    .roles-row{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:.6rem;margin-top:1.4rem}
    .role-icon{width:1.7rem;height:1.7rem;font-size:1.7rem;line-height:1;display:inline-flex;align-items:center;justify-content:center;object-fit:contain}
    .valid-stamp{margin-top:1.4rem;text-align:center;font-size:.8rem;color:#166534;font-weight:600;letter-spacing:.15em;text-transform:uppercase;background:#f0fdf4;padding:.4rem;border-radius:.375rem}
    .logo{width:56px;height:56px;box-shadow:0 6px 18px rgba(15,50,106,0.08);border-radius:50%;transition:transform 220ms ease}
    .user-avatar{width:64px;height:64px;border-radius:0.5rem;object-fit:cover;border:2px solid #0F326A;box-shadow:0 4px 12px rgba(0,0,0,0.1)}
</style>
  <div class="card">
    <div class="header-logos">
      <img src="/logo.png" class="logo" alt="Logo" onerror="this.style.display='none'"/>
      <img src="${escHtml(avatarUrl)}" class="user-avatar" alt="Foto Ciudadano"/>
    </div>
    <div style="text-align:center; margin-bottom:1rem;"><span class="badge">✓ DPI Verificado</span></div>
    <div class="dpi-num">${d.dpi_number}</div>
    <div class="row"><span class="label">Nombre</span><span class="val">${escHtml(d.nombre)}</span></div>
    <div class="row"><span class="label">Apellidos</span><span class="val">${escHtml(d.apellidos)}</span></div>
    <div class="row"><span class="label">Género</span><span class="val">${escHtml(d.genero)}</span></div>
    <div class="row"><span class="label">Nacimiento</span><span class="val">${escHtml(d.fecha_nac)}</span></div>
    <div class="row"><span class="label">Región</span><span class="val">${escHtml(d.region)}</span></div>
    <div class="row"><span class="label">Expedición</span><span class="val">${escHtml(d.issued_at)}</span></div>
    <div class="row"><span class="label">Válido hasta</span><span class="val">${escHtml(d.valid_until)}</span></div>
    ${rolesHtml}
    <p class="valid-stamp">Documento válido</p>
  </div>
</body></html>`;
}

// ── PROXY DE DISCORD ─────────────────────────────────────────────────────────────

app.get("/api/roles", async (req, res) => {
  try {
    if (!DISCORD_TOKEN) {
      console.error("❌ Error: Falta la variable DISCORD_TOKEN en el archivo .env");
      return res.status(500).json({ error: "Configuración incompleta en el servidor." });
    }

    const allMembers = [];
    let after = "0";

    while (true) {
      const response = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/members?limit=1000&after=${after}`, {
        headers: { Authorization: `Bot ${DISCORD_TOKEN.trim()}` },
      });

      const page = await response.json();

      if (!response.ok) {
        console.error(`❌ Discord API respondió con código ${response.status}:`, page);
        return res.status(response.status).json(page);
      }

      if (!Array.isArray(page) || page.length === 0) break;
      allMembers.push(...page);
      if (page.length < 1000) break;
      after = page[page.length - 1].user.id;
    }

    console.log(`[/api/roles] Miembros totales obtenidos: ${allMembers.length}`);
    return res.json(allMembers);

  } catch (error) {
    console.error("❌ Error en el proxy /api/roles:", error);
    return res.status(500).json({ error: "Error interno al conectar con Discord." });
  }
});

// ✅ SOLUCIÓN:
if (!process.env.VERCEL) {
  const staticFolder = path.resolve(__dirname, "dist", "public");
  app.use(express.static(staticFolder));

  app.get('*', (req, res) => {
    res.sendFile(path.join(staticFolder, "index.html"));
  });
}

export default app;

if (!(process.env.NODE_ENV === "production" && !process.env.LOCAL_RUN)) {
  app.listen(port, () => {
    console.log(`  Server furula en http://localhost:${port}`);
  });
}