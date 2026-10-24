import {Router} from 'express';
import {createClient} from '@supabase/supabase-js';
import {timingSafeEqual} from 'node:crypto';
import {games,play,freshBlackjack,publicBlackjack,advanceBlackjack} from './games.mjs';
import {syncSports} from './sports.mjs';

/**
 * Autenticación: NO se admite ID de Discord procedente del body/query/header del jugador.
 * El host debe establecer req.user o req.session a partir de OAuth Discord verificado.
 * Se puede inyectar getUserId si el proyecto usa otro middleware.
 */
function defaultUserId(req){
 const u=req.user??req.session?.passport?.user??req.session?.discordUser??req.session?.user;
 const id=(typeof u==='object'&&u!==null)?(u.discord_id??u.discordId??u.id):null;
 return typeof id==='string'&&/^\d{15,22}$/.test(id)?id:null;
}
const safeError=(e)=>{
 const s=String(e?.message??e??'Error');
 if(/Saldo insuficiente|Mercado cerrado|Idempotencia incompatible|Ronda caducada|Apuesta inválida|Parámetros inválidos|fuera de límites|Premio|Turno|Juego|Acción/i.test(s))return s;
 return 'No se ha podido completar la operación';
};
const validWager=n=>Number.isSafeInteger(n)&&n>=10&&n<=10000;
const reqId=(x)=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
const rejectStatus=e=>/Saldo insuficiente/.test(e.message)?409:/Ronda caducada|Mercado cerrado|Idempotencia/.test(e.message)?409:400;
const isSecret=(a,b)=>{if(!a||!b)return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)};
export function createBetPanRouter({getUserId=defaultUserId,db:providedDb}={}){
 const db=providedDb??createClient(process.env.SUPABASE_URL??'',process.env.SUPABASE_SERVICE_ROLE_KEY??'',{auth:{persistSession:false,autoRefreshToken:false}});
 const router=Router();
 const sameOrigin=(req,res,next)=>{
  const origin=req.headers.origin;const expected=process.env.BETPAN_ORIGIN;
  if(origin){try {const u=new URL(origin);const host=req.get('host');if((expected&&u.origin!==expected)||(!expected&&u.host!==host))return res.status(403).json({error:'Origen no permitido'});}catch{return res.status(403).json({error:'Origen inválido'})}}
  next();
 };
 router.use((req,res,next)=>req.method==='POST'?sameOrigin(req,res,next):next());
 const guard=(req,res,next)=>{const id=getUserId(req);if(!id)return res.status(401).json({error:'Inicia sesión con Discord para jugar'});req.betpanId=id;next()};
 const rate=new Map();
 const throttle=(req,res,next)=>{const key=req.betpanId;const t=Date.now(),a=(rate.get(key)??[]).filter(x=>t-x<60000);if(a.length>=25)return res.status(429).json({error:'Demasiadas acciones. Inténtalo en un minuto.'});a.push(t);rate.set(key,a);if(rate.size>2000){for(const [k,v] of rate)if(v.at(-1)<t-60000)rate.delete(k)}next()};
 const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
 router.get('/health',(_req,res)=>res.json({ok:true,moneda:'PANEDAS',dinero_real:false}));
 router.get('/state',guard,wrap(async(req,res)=>{
  const id=req.betpanId;
  const [wallet,rounds,sports,markets,openBj]=await Promise.all([
   db.from('users_economy').select('cash,bank').eq('id',id).maybeSingle(),
   db.from('betpan_rounds').select('id,game,wager,payout,status,result,created_at').eq('user_id',id).eq('status','settled').order('created_at',{ascending:false}).limit(15),
   db.from('betpan_sports_bets').select('id,event_id,pick,stake,odds,possible_payout,payout,status,created_at').eq('user_id',id).order('created_at',{ascending:false}).limit(15),
   db.from('betpan_sports_events').select('*').gte('starts_at',new Date(Date.now()-86400000).toISOString()).order('starts_at',{ascending:true}).limit(80),
   db.from('betpan_rounds').select('*').eq('user_id',id).eq('game','blackjack').eq('status','active').order('created_at',{ascending:false}).limit(1)
  ]);
  for(const q of [wallet,rounds,sports,markets,openBj])if(q.error)throw q.error;
  const pendingSports=sports.data??[];
  return res.json({wallet:{cash:String(wallet.data?.cash??0),bank:String(wallet.data?.bank??0)},
   rounds:rounds.data??[],bets:pendingSports,
   events:markets.data??[],blackjack:openBj.data?.[0]?publicBlackjack(openBj.data[0]):null,
   sportsEnabled:Boolean(process.env.FOOTBALL_DATA_TOKEN),disclaimer:'Solo Panedas ficticias. Sin euros, sin compras, sin cambio, sin retiradas.'});
 }));
 router.post('/play',guard,throttle,wrap(async(req,res)=>{
  const {game,wager,choice,requestId}=req.body??{};
  if(!validWager(wager)||!reqId(requestId))return res.status(400).json({error:'Apuesta 10–10.000 Panedas y requestId UUID obligatorios'});
  if(!games.includes(game))return res.status(400).json({error:'Juego no válido'});
  // Evitar rerolls en solicitudes duplicadas: consultar ANTES de generar aleatoriedad.
  const {data:old,error:oldErr}=await db.from('betpan_rounds').select('id,request_id,user_id,game,wager,payout,result,status').eq('request_id',requestId).maybeSingle();
  if(oldErr)throw oldErr;
  if(old){if(old.user_id!==req.betpanId||old.game!==game||Number(old.wager)!==wager)return res.status(409).json({error:'Petición ya utilizada'});return res.json({round:old,repeated:true});}
  const x=play(game,wager,choice);
  const {data,error}=await db.rpc('betpan_instant_play',{p_uid:req.betpanId,p_game:game,p_wager:wager,p_payout:x.payout,p_result:x.result,p_request_id:requestId});
  if(error)throw error;
  res.json({round:{id:data.id,game:data.game,wager:data.wager,payout:data.payout,result:data.result,status:data.status}});
 }));
 router.post('/blackjack/start',guard,throttle,wrap(async(req,res)=>{
  const {wager,requestId}=req.body??{};
  if(!validWager(wager)||!reqId(requestId))return res.status(400).json({error:'Importe o ID inválidos'});
  const {data:open,error:oerr}=await db.from('betpan_rounds').select('*').eq('user_id',req.betpanId).eq('game','blackjack').eq('status','active').limit(1);
  if(oerr)throw oerr;
  if(open.length)return res.status(409).json({error:'Termina primero tu partida de blackjack',blackjack:publicBlackjack(open[0])});
  const {data,error}=await db.rpc('betpan_blackjack_start',{p_uid:req.betpanId,p_wager:wager,p_state:freshBlackjack(),p_request_id:requestId});
  if(error)throw error;
  res.json({blackjack:publicBlackjack(data)});
 }));
 router.post('/blackjack/action',guard,throttle,wrap(async(req,res)=>{
  const {roundId,action}=req.body??{};
  if(!reqId(roundId)||!['hit','stand'].includes(action))return res.status(400).json({error:'Acción inválida'});
  const {data:round,error}=await db.from('betpan_rounds').select('*').eq('id',roundId).eq('user_id',req.betpanId).maybeSingle();
  if(error)throw error;if(!round)return res.status(404).json({error:'Partida no encontrada'});
  if(round.status!=='active')return res.status(409).json({error:'Ronda ya finalizada',blackjack:publicBlackjack(round)});
  const next=advanceBlackjack(round.state,action,Number(round.wager));
  const {data:updated,error:err}=await db.rpc('betpan_blackjack_step',{p_uid:req.betpanId,p_round_id:roundId,p_version:round.version,p_state:next.state,p_result:next.result,p_payout:next.payout,p_finish:next.finish});
  if(err)throw err;
  res.json({blackjack:publicBlackjack(updated)});
 }));
 router.post('/sports/bet',guard,throttle,wrap(async(req,res)=>{
  const {eventId,pick,stake,requestId}=req.body??{};
  if(typeof eventId!=='string'||!/^FD:PD:\d+$/.test(eventId)||!['home','draw','away'].includes(pick)||!validWager(stake)||!reqId(requestId))return res.status(400).json({error:'Apuesta deportiva inválida'});
  const {data,error}=await db.rpc('betpan_place_sport',{p_uid:req.betpanId,p_event:eventId,p_pick:pick,p_stake:stake,p_request_id:requestId});
  if(error)throw error;res.json({bet:data});
 }));
 // Protected CRON: never leave available without configured secret.
 router.get('/cron/sports',wrap(async(req,res)=>{
  const token=String(req.headers.authorization??'').replace(/^Bearer\s+/i,'');
  if(!isSecret(token,process.env.CRON_SECRET))return res.status(403).json({error:'Acceso denegado'});
  const result=await syncSports(db);res.json(result);
 }));
 router.use((err,_req,res,_next)=>{console.error('[BetPan]',err?.message??err);res.status(rejectStatus(err)).json({error:safeError(err)})});
 return router;
}
