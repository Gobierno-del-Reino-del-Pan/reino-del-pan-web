/**
 * Rutas de Carpeta Ciudadana para el backend Express existente.
 * Montar con app.use('/api/citizen', createCitizenRouter({ supabaseAdmin, getViewerId, guildId }))
 * NUNCA importar aquí un cliente Supabase con clave pública para las transferencias.
 * @see ../INSTRUCCIONES.md
 */
import { Router, json } from 'express';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const BRIDGE_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'registro_civil_bridge.py');
const DISCORD_ID = /^\d{15,22}$/;
const DEFAULT_AVATAR = 'https://cdn.discordapp.com/embed/avatars/0.png';
const STRING_FIELDS = ['cantante_favorito', 'cantante_imagen', 'animal_favorito'];

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

  router.get('/pokemon', async (req, res, next) => {
    try {
      const rows = requireResult(await supabaseAdmin.from('capturas')
        .select('id,pokemon_id,pokemon_name,level,is_shiny,ball_used,created_at')
        .eq('discord_id', req.citizenId)
        .order('created_at', { ascending: false }).limit(300));
      res.json({ captures: (rows || []).map(p => ({ id: p.id, pokemon_id: p.pokemon_id, pokemon_name: p.pokemon_name,
        level: p.level, is_shiny: Boolean(p.is_shiny), ball_used: p.ball_used, created_at: p.created_at })) });
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
      const result = await supabaseAdmin.rpc('transferir_captura_paniana', {
        p_capture_id: captureId, p_sender_id: req.citizenId, p_recipient_id: String(recipientId),
      });
      if (result.error) {
        if (result.error.code === 'P0001') throw appError(409, result.error.message);
        throw result.error;
      }
      res.json({ ok: true });
    } catch (error) { next(error); }
  });

  router.use((error, req, res, next) => {
    const err = asError(error);
    const code = Number(err.status) || 500;
    if (code >= 500) console.error('[Carpeta Ciudadana]', err);
    res.status(code).json({ error: code >= 500 ? 'El servicio está temporalmente indisponible.' : err.message });
  });
  return router;
}
