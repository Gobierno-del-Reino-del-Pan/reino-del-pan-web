/**
 * Rutas de Carpeta Ciudadana para el backend Express existente.
 * Montar con app.use('/api/citizen', createCitizenRouter({ supabaseAdmin, getViewerId, guildId }))
 * NUNCA importar aquí un cliente Supabase con clave pública para las transferencias.
 * @see ../INSTRUCCIONES.md
 */
import { Router, json, raw } from 'express';
import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const BRIDGE_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'registro_civil_bridge.py');
const DISCORD_ID = /^\d{15,22}$/;
const DEFAULT_AVATAR = 'https://cdn.discordapp.com/embed/avatars/0.png';
const STRING_FIELDS = ['cantante_favorito', 'cantante_imagen', 'animal_favorito'];
const IMAGE_BUCKET = 'carpeta-cantantes';

function appError(status, message) { const e = new Error(message); e.status = status; return e; }
function optionalHttps(value) {
  if (value == null || value === '') return null;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.toString() : null; }
  catch { return null; }
}
function asError(error) { return error instanceof Error ? error : new Error(String(error)); }
function requireResult({ data, error }) { if (error) throw error; return data; }
function originIsAllowed(req) {
  // Rechaza escrituras entre sitios, pero no exige una variable adicional
  // cuando el formulario se utiliza desde la misma web que sirve esta API.
  const origin = req.get('origin');
  if (!origin) return false;
  const allowed = [process.env.CITIZEN_PUBLIC_ORIGIN, `${req.protocol}://${req.get('host')}`]
    .filter(Boolean);
  try { return allowed.some(candidate => new URL(origin).origin === new URL(candidate).origin); }
  catch { return false; }
}

function makeCertificate(tipo, datos) {
  return new Promise((resolve, reject) => {
    // stdout son bytes PDF: mismo crear_pdf(tipo,datos) que invoca el bot Python.
    const python = process.env.REGISTRO_CIVIL_PYTHON || 'python3';
    const folder = process.env.REGISTRO_CIVIL_DIR;
    if (!folder) return reject(appError(503, 'Configura REGISTRO_CIVIL_DIR en el servidor para habilitar los PDF.'));
    const child = execFile(python, [BRIDGE_PATH], {
      encoding: 'buffer', timeout: 20000, maxBuffer: 12 * 1024 * 1024,
      env: { ...process.env, PYTHONPATH: [folder, process.env.PYTHONPATH || ''].filter(Boolean).join(path.delimiter) },
    }, (err, stdout) => {
      if (err) return reject(appError(503, 'No se pudo ejecutar el motor PDF del Registro Civil. Revisa la instalación del módulo Python.'));
      if (!Buffer.isBuffer(stdout) || stdout.subarray(0, 4).toString() !== '%PDF') return reject(appError(502, 'El Registro Civil devolvió un documento no válido.'));
      resolve(stdout);
    });
    child.stdin.on('error', () => {});
    child.stdin.end(JSON.stringify({ tipo, datos }));
  });
}

export function createCitizenRouter({ supabaseAdmin, getViewerId, guildId = process.env.GUILD_ID } = {}) {
  if (!supabaseAdmin || typeof getViewerId !== 'function') throw new Error('Faltan supabaseAdmin y getViewerId.');
  const router = Router();
  router.use(json({ limit: '12kb' }));
  router.use(async (req, res, next) => {
    try {
      // El ID se obtiene EXCLUSIVAMENTE de la sesión validada en el backend.
      const id = String(await getViewerId(req) || '');
      if (!DISCORD_ID.test(id)) throw appError(401, 'Inicia sesión con Discord.');
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !originIsAllowed(req)) {
        throw appError(403, 'Origen no permitido. Configura CITIZEN_PUBLIC_ORIGIN.');
      }
      const v = requireResult(await supabaseAdmin.from('verificados')
        .select('dpi').eq('discord_id', id).limit(1));
      if (!v?.[0]?.dpi) throw appError(403, 'Necesitas un DPI verificado.');
      const d = requireResult(await supabaseAdmin.from('dpis')
        .select('dpi_number').eq('dpi_number', v[0].dpi).limit(1));
      if (!d?.length) throw appError(403, 'El DPI vinculado no está registrado.');
      req.citizenId = id;
      next();
    } catch (error) { next(error); }
  });

  router.get('/profile', async (req, res, next) => {
    try {
      const rows = requireResult(await supabaseAdmin.from('usuarios')
        .select('cantante_favorito,cantante_imagen,animal_favorito,pokemon_favorito,equipo_futbol,insta,tiktok,x_twitter')
        .eq('discord_id', req.citizenId).limit(1));
      res.json({ profile: rows?.[0] || null });
    } catch (error) { next(error); }
  });

  router.patch('/profile', async (req, res, next) => {
    try {
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) ||
        Object.keys(req.body).some(k => !STRING_FIELDS.includes(k))) throw appError(400, 'Campos de perfil no permitidos.');
      const update = {};
      for (const field of STRING_FIELDS) {
        if (!(field in req.body)) continue;
        const v = req.body[field];
        if (typeof v !== 'string' || v.length > (field === 'cantante_imagen' ? 500 : 90)) throw appError(400, `Valor no válido: ${field}`);
        update[field] = v.trim() || null;
      }
      if (Object.keys(update).length === 0) throw appError(400, 'Sin cambios para guardar.');
      if (update.cantante_imagen && !optionalHttps(update.cantante_imagen)) throw appError(400, 'Utiliza una URL HTTPS para la imagen.');
      const data = requireResult(await supabaseAdmin.from('usuarios').update(update)
        .eq('discord_id', req.citizenId)
        .select('cantante_favorito,cantante_imagen,animal_favorito,pokemon_favorito,equipo_futbol,insta,tiktok,x_twitter'));
      if (!data?.length) throw appError(404, 'Tu perfil no existe todavía en usuarios. Usa el bot para inicializarlo.');
      res.json({ profile: data[0] });
    } catch (error) { next(error); }
  });

  // Las fotos se suben desde el dispositivo al Storage del proyecto. No se piden URLs.
  // Crear antes el bucket público `carpeta-cantantes` (SQL incluido).
  router.post('/profile/image', raw({ type: ['image/png', 'image/jpeg', 'image/webp'], limit: '2mb' }), async (req, res, next) => {
    let filePath = null;
    try {
      const buf = req.body;
      if (!Buffer.isBuffer(buf) || !buf.length || buf.length > 2 * 1024 * 1024)
        throw appError(400, 'Selecciona una imagen JPG, PNG o WebP de hasta 2 MB.');
      const ct = (req.get('content-type') || '').split(';')[0].toLowerCase();
      const png = ct === 'image/png' && buf.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
      const jpg = ct === 'image/jpeg' && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
      const webp = ct === 'image/webp' && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
      if (!png && !jpg && !webp) throw appError(400, 'El archivo no es una imagen JPG, PNG o WebP válida.');
      filePath = `${req.citizenId}/${randomUUID()}.${png ? 'png' : jpg ? 'jpg' : 'webp'}`;
      const { error: uploadError } = await supabaseAdmin.storage.from(IMAGE_BUCKET).upload(filePath, buf, {
        contentType: ct, upsert: false, cacheControl: '3600',
      });
      if (uploadError) {
        if (/not found|bucket/i.test(uploadError.message || ''))
          throw appError(503, 'Falta crear el bucket de fotos. Ejecuta el SQL de Storage incluido en el paquete.');
        throw uploadError;
      }
      const { data: urlData } = supabaseAdmin.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);
      if (!urlData?.publicUrl?.startsWith('https://')) throw appError(500, 'No se pudo obtener la imagen publicada.');
      const data = requireResult(await supabaseAdmin.from('usuarios')
        .update({ cantante_imagen: urlData.publicUrl }).eq('discord_id', req.citizenId)
        .select('cantante_favorito,cantante_imagen,animal_favorito,pokemon_favorito,equipo_futbol,insta,tiktok,x_twitter'));
      if (!data?.length) throw appError(404, 'Tu perfil aún no existe en usuarios.');
      res.json({ profile: data[0] });
    } catch (error) {
      if (filePath) await supabaseAdmin.storage.from(IMAGE_BUCKET).remove([filePath]).catch(() => {});
      next(error);
    }
  });

  // Búsqueda exclusivamente por nombre, limitada a ciudadanos con DPI validado.
  // Nunca devolvemos DPI, fechas, dinero, familia ni datos de documentos.
  router.get('/directory', async (req, res, next) => {
    try {
      const q = String(req.query.q || '').trim().replace(/^@/, '');
      if (q.length < 2) return res.json({ users: [] });
      if (q.length > 40 || /[%_*(),]/.test(q)) throw appError(400, 'Introduce al menos dos letras de usuario.');
      const people = requireResult(await supabaseAdmin.from('usuarios')
        .select('discord_id,username,avatar_url').ilike('username', `%${q}%`)
        .order('username', { ascending: true }).limit(30));
      const peopleIds = (people || []).map(p => String(p.discord_id)).filter(id => DISCORD_ID.test(id));
      if (!peopleIds.length) return res.json({ users: [] });
      const verified = requireResult(await supabaseAdmin.from('verificados')
        .select('discord_id,dpi').in('discord_id', peopleIds));
      const dpiNumbers = [...new Set((verified || []).map(row => row.dpi).filter(Boolean))];
      if (!dpiNumbers.length) return res.json({ users: [] });
      const dpIs = requireResult(await supabaseAdmin.from('dpis')
        .select('dpi_number').in('dpi_number', dpiNumbers));
      const dpiSet = new Set((dpIs || []).map(row => row.dpi_number));
      const allowed = new Set((verified || []).filter(row => dpiSet.has(row.dpi)).map(row => String(row.discord_id)));
      res.json({ users: (people || []).filter(p => allowed.has(String(p.discord_id)))
        .slice(0, 12).map(p => ({ id: String(p.discord_id), username: p.username,
          avatar: p.avatar_url || DEFAULT_AVATAR })) });
    } catch (error) { next(error); }
  });

  router.get('/public/:id', async (req, res, next) => {
    try {
      const id = String(req.params.id || '');
      if (!DISCORD_ID.test(id)) throw appError(400, 'Carpeta no válida.');
      const verified = requireResult(await supabaseAdmin.from('verificados')
        .select('dpi').eq('discord_id', id).limit(1));
      if (!verified?.[0]?.dpi) throw appError(404, 'No existe una carpeta pública verificada.');
      const dpi = requireResult(await supabaseAdmin.from('dpis')
        .select('dpi_number').eq('dpi_number', verified[0].dpi).limit(1));
      if (!dpi?.length) throw appError(404, 'No existe una carpeta pública verificada.');
      const rows = requireResult(await supabaseAdmin.from('usuarios')
        .select('username,avatar_url,cantante_favorito,cantante_imagen,animal_favorito,pokemon_favorito')
        .eq('discord_id', id).limit(1));
      if (!rows?.length) throw appError(404, 'No se ha encontrado la carpeta.');
      const levels = await supabaseAdmin.from('user_levels').select('level').eq('user_id', id).limit(1);
      const u = rows[0];
      res.setHeader('Cache-Control', 'private, no-store');
      res.json({ profile: {
        username: u.username, avatar: u.avatar_url || DEFAULT_AVATAR,
        cantante_favorito: u.cantante_favorito || null,
        cantante_imagen: u.cantante_imagen || null,
        animal_favorito: u.animal_favorito || null,
        pokemon_favorito: u.pokemon_favorito || null,
        level: levels.error ? null : Number(levels.data?.[0]?.level ?? 0),
      } });
    } catch (error) { next(error); }
  });

  // Mismo motor XP que el cog AEPT del bot: curva MEE6.
  // Python: xp_needed_for_next(level) = 5*level**2 + 50*level + 100
  //         total_xp_for_level(level) =
  //           5*level*(level-1)*(2*level-1)//6 + 25*level*(level-1) + 100*level
  //         progress_xp(total,level) = total - total_xp_for_level(level)
  // No se usan fórmulas aproximadas ni variables de entorno para la XP.
  function xpNeededForNext(level) {
    return 5 * level ** 2 + 50 * level + 100;
  }
  function totalXpForLevel(level) {
    return Math.floor(5 * level * (level - 1) * (2 * level - 1) / 6) +
      25 * level * (level - 1) + 100 * level;
  }
  function levelFromTotalXp(total) {
    let lo = 0, hi = 1;
    while (totalXpForLevel(hi) <= total) hi *= 2;
    while (lo + 1 < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (totalXpForLevel(mid) <= total) lo = mid;
      else hi = mid;
    }
    return lo;
  }
  router.get('/progress', async (req, res, next) => {
    try {
      const rows = requireResult(await supabaseAdmin.from('user_levels')
        .select('level,xp,total_xp').eq('user_id', req.citizenId).limit(1));
      const row = rows?.[0] || {};
      const total = Math.max(0, Math.floor(Number(row.total_xp) || 0));
      // El bot calcula el nivel desde el total acumulado y persiste "xp" como XP del nivel.
      // Volver a calcularlo evita mostrar datos parciales si hubo un cambio reciente de nivel.
      const level = levelFromTotalXp(total);
      const target = xpNeededForNext(level);
      const xp = Math.max(0, total - totalXpForLevel(level));
      const remaining = Math.max(0, target - xp);
      res.json({ progress: {
        level, xp, target, remaining, total_xp: total,
        percent: Math.max(0, Math.min(100, Math.round(xp * 100 / target))),
        estimated: false,
      } });
    } catch (error) { next(error); }
  });

  router.get('/registry', async (req, res, next) => {
    try {
      const id = req.citizenId;
      const actaQuery = supabaseAdmin.from('registro_civil_actas')
        .select('numero,tipo,created_at,datos')
        .or(`discord_id_1.eq.${id},discord_id_2.eq.${id}`)
        .order('created_at', { ascending: false }).limit(40);
      const scopedActas = guildId ? actaQuery.eq('guild_id', String(guildId)) : actaQuery;
      const [marriageResult, childrenResult, actasResult] = await Promise.all([
        supabaseAdmin.from('matrimonios').select('user_id_1,user_id_2,fecha_boda')
          .or(`user_id_1.eq.${id},user_id_2.eq.${id}`).limit(2),
        supabaseAdmin.from('hijos').select('id,padre_id,hijo_discord_id,nombre_ficticio,avatar_ficticio,tipo')
          .eq('padre_id', id).limit(100),
        scopedActas,
      ]);
      const marriages = requireResult(marriageResult) || [];
      const children = requireResult(childrenResult) || [];
      const actas = requireResult(actasResult) || [];
      const partnerId = marriages[0] ? String(marriages[0].user_id_1) === id ? String(marriages[0].user_id_2) : String(marriages[0].user_id_1) : null;
      const relatedIds = [partnerId, ...children.map(h => h.hijo_discord_id).filter(Boolean)].filter(Boolean).map(String);
      const people = relatedIds.length ? requireResult(await supabaseAdmin.from('usuarios')
        .select('discord_id,username,avatar_url').in('discord_id', [...new Set(relatedIds)])) : [];
      const peopleById = new Map((people || []).map(p => [String(p.discord_id), p]));
      res.json({
        matrimonio: partnerId ? {
          conyuge_id: partnerId,
          conyuge_username: peopleById.get(partnerId)?.username || `Usuario ${partnerId}`,
          conyuge_avatar: peopleById.get(partnerId)?.avatar_url || DEFAULT_AVATAR,
          fecha_boda: marriages[0].fecha_boda || null,
        } : null,
        hijos: children.map(h => {
          const person = peopleById.get(String(h.hijo_discord_id));
          return {
            hijo_id: String(h.hijo_discord_id || h.id),
            hijo_username: h.nombre_ficticio || person?.username || `Usuario ${h.hijo_discord_id || '?'}`,
            hijo_avatar: h.avatar_ficticio || person?.avatar_url || DEFAULT_AVATAR,
            tipo: h.tipo === 'creado' ? 'creado' : 'adoptivo',
          };
        }),
        actas: actas.map(a => ({ numero: a.numero, tipo: a.tipo, created_at: a.created_at,
          fecha: typeof a.datos?.fecha === 'string' ? a.datos.fecha : null })),
      });
    } catch (error) { next(error); }
  });

  router.get('/certificates/:number', async (req, res, next) => {
    try {
      const number = req.params.number;
      if (!/^[A-Za-z0-9._-]{1,128}$/.test(number)) throw appError(400, 'Número de acta no válido.');
      let query = supabaseAdmin.from('registro_civil_actas').select('numero,tipo,datos')
        .eq('numero', number)
        .or(`discord_id_1.eq.${req.citizenId},discord_id_2.eq.${req.citizenId}`)
        .limit(1);
      if (guildId) query = query.eq('guild_id', String(guildId));
      const entries = requireResult(await query);
      if (!entries?.length) throw appError(404, 'No hay un certificado autorizado con ese número.');
      const { tipo, datos } = entries[0];
      if (!['nacimiento', 'adopcion', 'matrimonio', 'divorcio'].includes(tipo)) throw appError(400, 'Tipo de acta no admitido.');
      // Vercel ejecuta la función Python como /api/registro_certificado.
      // Ella vuelve a verificar la sesión y la titularidad del acta; Node no lanza Python.
      if (process.env.VERCEL) {
        res.setHeader('Cache-Control', 'private, no-store');
        return res.redirect(302, `/api/registro_certificado?numero=${encodeURIComponent(number)}`);
      }
      const bytes = await makeCertificate(tipo, datos);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="certificado_${tipo}_${number}.pdf"`);
      res.setHeader('Cache-Control', 'private, no-store');
      res.send(bytes);
    } catch (error) { next(error); }
  });

  // Datos económicos de la cuenta: mismos registros que usa el bot, consultados en servidor.
  router.get('/economy', async (req, res, next) => {
    try {
      const [money, score] = await Promise.all([
        supabaseAdmin.from('users_economy').select('cash,bank').eq('id', req.citizenId).limit(1),
        supabaseAdmin.from('usuarios').select('puntos_elo').eq('discord_id', req.citizenId).limit(1),
      ]);
      const coins = requireResult(money)?.[0];
      const elo = requireResult(score)?.[0];
      res.json({ economy: coins ? { cash: Number(coins.cash) || 0, bank: Number(coins.bank) || 0 } : null,
        puntos_elo: elo?.puntos_elo ?? null });
    } catch (error) { next(error); }
  });

  router.get('/pokemon', async (req, res, next) => {
    try {
      // El bot inserta los campos Pokémon pero no garantiza created_at ni id.
      // Consultar 'created_at' directamente o ordenar por él provocaba HTTP 500
      // en proyectos donde esas columnas no existen.
      const rows = requireResult(await supabaseAdmin.from('capturas')
        .select('*').eq('discord_id', req.citizenId).limit(300));
      const captures = (rows || []).map(p => ({
        id: /^\d+$/.test(String(p.id ?? '')) ? Number(p.id) : null,
        pokemon_id: Number(p.pokemon_id) || 0,
        pokemon_name: String(p.pokemon_name || `Pokémon #${p.pokemon_id || '?'}`),
        level: Number(p.level) || 1,
        is_shiny: Boolean(p.is_shiny),
        ball_used: String(p.ball_used || 'pokeball'),
        created_at: p.created_at || null,
      }));
      captures.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
      res.json({ captures, canTransfer: captures.every(p => Number.isSafeInteger(p.id) && p.id > 0) });
    } catch (error) { next(error); }
  });

  router.get('/pokemon/recipient/:id', async (req, res, next) => {
    try {
      const recipientId = String(req.params.id || '');
      if (!DISCORD_ID.test(recipientId) || recipientId === req.citizenId)
        throw appError(400, 'Elige un destinatario de Discord válido y distinto de ti.');
      const verified = requireResult(await supabaseAdmin.from('verificados')
        .select('dpi').eq('discord_id', recipientId).limit(1));
      if (!verified?.[0]?.dpi) throw appError(404, 'Ese ciudadano no tiene un DPI verificado.');
      const validDpi = requireResult(await supabaseAdmin.from('dpis')
        .select('dpi_number').eq('dpi_number', verified[0].dpi).limit(1));
      if (!validDpi?.length) throw appError(404, 'El DPI del destinatario no existe.');
      const people = requireResult(await supabaseAdmin.from('usuarios')
        .select('username,avatar_url').eq('discord_id', recipientId).limit(1));
      if (!people?.length) throw appError(404, 'El destinatario aún no tiene perfil en el Reino.');
      res.json({ recipient: { id: recipientId, username: people[0].username,
        avatar: people[0].avatar_url || DEFAULT_AVATAR } });
    } catch (error) { next(error); }
  });

  router.post('/pokemon/transfer', async (req, res, next) => {
    try {
      const { captureId, recipientId } = req.body || {};
      if (!Number.isSafeInteger(captureId) || captureId <= 0 || !DISCORD_ID.test(String(recipientId || '')))
        throw appError(400, 'Selecciona una captura y un usuario válidos.');
      if (String(recipientId) === req.citizenId) throw appError(400, 'No puedes transferirte un Pokémon a ti mismo.');
      const result = await supabaseAdmin.rpc('transferir_captura_paniense', {
        p_capture_id: captureId, p_sender_id: req.citizenId, p_recipient_id: String(recipientId),
      });
      if (result.error) {
        if (result.error.code === 'P0001') throw appError(409, result.error.message);
        if (result.error.code === 'PGRST202' || result.error.code === '42883')
          throw appError(503, 'Rotomi no puede transferir: falta la función SQL transferir_captura_paniense. Ejecuta sql/001_rotomi_transferencias.sql en Supabase y comprueba capturas.id.');
        throw result.error;
      }
      res.json({ ok: true });
    } catch (error) { next(error); }
  });

  router.use((error, req, res, next) => {
    const err = asError(error);
    const code = Number(err.status) || 500;
    if (code >= 500) console.error('[Carpeta Ciudadana]', err);
    res.status(code).json({ error: code >= 500 && !(code === 503 && err.status === 503) ? 'El servicio está temporalmente indisponible.' : err.message });
  });
  return router;
}
