/**
 * BetPan — backend único (Express + lógica de juegos + sincronización deportiva).
 * TODO el JavaScript de servidor de BetPan queda en este archivo.
 * No contiene secretos. No debe cargarse desde React/browser.
 * Importar y montar en tu server.js existente SIN cambiar el resto.
 * La interfaz React permanece en su TSX con CSS incrustado.
 * Requiere: express, @supabase/supabase-js, Node >= 20; migraciones SQL 001+002 ya ejecutadas.
 * La sesión de Discord debe ser confiable: req.user/req.session provenientes de OAuth verificado.
 */
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { randomInt, timingSafeEqual } from 'node:crypto';

// ── Juegos del casino ───────────────────────────────────────────────
const pick=a=>a[randomInt(a.length)];
export const games=['roulette','slots','coin','dice','bingo','krule'];
const reds=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
function shuffled(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[j],a[i]]=[a[i],a[j]];}return a;}
export function play(game,wager,choice){
 if(!games.includes(game))throw new Error('Juego no disponible');
 if(game==='coin'){
  if(!['cara','cruz'].includes(choice))throw new Error('Selecciona cara o cruz');
  const landed=randomInt(2)===0?'cara':'cruz'; return {payout: landed===choice?wager*2:0, result:{choice,landed}};
 }
 if(game==='dice'){
  const guessed=Number(choice);if(!Number.isInteger(guessed)||guessed<1||guessed>6)throw new Error('Elige un número del 1 al 6');
  const landed=randomInt(1,7);return {payout:landed===guessed?wager*6:0,result:{choice:guessed,landed}};
 }
 if(game==='roulette'){
  const roll=randomInt(37);const colour=roll===0?'verde':reds.has(roll)?'rojo':'negro';
  const c=String(choice??''); const win= c==='rojo'||c==='negro'?colour===c:c==='par'?roll!==0&&roll%2===0:c==='impar'?roll%2===1:/^n:(?:[0-9]|[1-2][0-9]|3[0-6])$/.test(c)?Number(c.slice(2))===roll:false;
  if(!['rojo','negro','par','impar'].includes(c)&&!/^n:(?:[0-9]|[1-2][0-9]|3[0-6])$/.test(c))throw new Error('Apuesta de ruleta no válida');
  return {payout:win?wager*(c.startsWith('n:')?36:2):0,result:{choice:c,roll,colour}};
 }
 if(game==='slots'){
  const items=['🍒','🍋','🍇','🔔','7️⃣'];const reels=Array.from({length:3},()=>pick(items));const all7=reels.every(x=>x==='7️⃣'), triple=reels.every(x=>x===reels[0]);const pair=new Set(reels).size===2;
  const multiplier=all7?25:triple?12:pair?2:0;
  return {payout:wager*multiplier,result:{reels,multiplier}};
 }
 if(game==='krule'){
  const dice=Array.from({length:3},()=>randomInt(1,7));const different=new Set(dice).size;const sum=dice.reduce((a,b)=>a+b,0);const multiplier=different===1?8:different===2?2:sum>=14?1.5:0;
  return {payout:Math.floor(wager*multiplier),result:{dice,sum,multiplier,rules:'Trío x8 · pareja x2 · suma ≥14 x1,5 · otro x0'}};
 }
 if(game==='bingo'){
  const ticket=shuffled(Array.from({length:75},(_,i)=>i+1)).slice(0,5).sort((a,b)=>a-b);
  const drawn=shuffled(Array.from({length:75},(_,i)=>i+1)).slice(0,25).sort((a,b)=>a-b);
  const matches=ticket.filter(x=>drawn.includes(x));const multiplier=({2:1,3:2,4:8,5:30})[matches.length]??0;
  return {payout:wager*multiplier,result:{ticket,drawn,matches,multiplier,variant:'Bingo rápido individual'}};
 }
}
const suits=['♠','♥','♦','♣'];
function deck(){let cards=[];for(const s of suits){for(let n=1;n<=13;n++)cards.push({rank:n===1?'A':n===11?'J':n===12?'Q':n===13?'K':String(n),suit:s,value:n===1?11:Math.min(10,n)});}return shuffled(cards);}
export function score(hand){let sum=hand.reduce((a,c)=>a+c.value,0);let aces=hand.filter(c=>c.rank==='A').length;while(sum>21&&aces-- >0)sum-=10;return sum;}
export function freshBlackjack(){let d=deck();const player=[d.pop(),d.pop()],dealer=[d.pop(),d.pop()];return {deck:d,player,dealer,turn:'player'};}
export function publicBlackjack(round){if(!round)return null;const {deck,...state}=round.state??{};return {...round,state:{...state,dealer:round.status==='active'?[state.dealer?.[0],{rank:'?',suit:'',value:0}]:state.dealer},result:round.status==='active'?{}:round.result};}
export function advanceBlackjack(state,action,wager){if(!['hit','stand'].includes(action))throw new Error('Acción no válida');if(state.turn!=='player')throw new Error('Turno terminado');const s=structuredClone(state);let payout=0,result={};let finish=false;
 if(action==='hit'){
  s.player.push(s.deck.pop());if(score(s.player)>21){s.turn='finished';finish=true;result={winner:'dealer',message:'Te pasaste de 21',player:score(s.player),dealer:score(s.dealer)};}
 }else{
  while(score(s.dealer)<17)s.dealer.push(s.deck.pop());
  let p=score(s.player),d=score(s.dealer);let natural=s.player.length===2&&p===21;
  payout=d>21||p>d?Math.floor(wager*(natural?2.5:2)):p===d?wager:0;
  s.turn='finished';finish=true;result={winner:payout>wager?'player':payout===wager?'push':'dealer',message:payout>wager?'¡Ganaste!':payout===wager?'Empate':'Gana la banca',player:p,dealer:d};
 }
 return {state:s,payout,finish,result};
}

// ── Sincronización deportiva ─────────────────────────────────────────
/** Football-data.org v4: partidos de LaLiga descubiertos automáticamente.
 * Las cuotas son valores internos de fantasía y NO datos de apuestas reales.
 * Si no hay token o falla proveedor, se conserva el último estado en DB; no se inventan resultados.
 */
export async function syncSports(db,{token=process.env.FOOTBALL_DATA_TOKEN,now=new Date()}={}){
 if(!token)return {enabled:false,reason:'Configura FOOTBALL_DATA_TOKEN para activar el calendario deportivo'};
 const d=(offset)=>new Date(now.getTime()+offset*86400000).toISOString().slice(0,10);
 const url=`https://api.football-data.org/v4/competitions/PD/matches?dateFrom=${d(-5)}&dateTo=${d(16)}`;
 const response=await fetch(url,{headers:{'X-Auth-Token':token},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error(`Proveedor deportivo HTTP ${response.status}`);
 const body=await response.json(); const matches=body.matches??[];
 let scheduled=0,finished=0,settled=0,ignored=0;
 for(const m of matches){
  if(!m.id||!m.utcDate||!m.homeTeam?.name||!m.awayTeam?.name){ignored++;continue;}
  const map={SCHEDULED:'scheduled',TIMED:'scheduled',IN_PLAY:'live',PAUSED:'live',LIVE:'live',FINISHED:'finished',POSTPONED:'postponed',SUSPENDED:'postponed',CANCELLED:'cancelled'};
  const status=map[m.status];if(!status){ignored++;continue;}
  const h=m.score?.fullTime?.home,a=m.score?.fullTime?.away;
  if(status==='finished'&&(!Number.isInteger(h)||!Number.isInteger(a))){ignored++;continue;}
  const id=`FD:PD:${m.id}`;
  const payload={id,league:'LaLiga',home_team:m.homeTeam.name,away_team:m.awayTeam.name,starts_at:m.utcDate,status,
    winner:status==='finished'?(h>a?'home':h<a?'away':'draw'):null,
    home_score:status==='finished'?h:null,away_score:status==='finished'?a:null,updated_at:new Date().toISOString()};
  // Por diseño NO se reescriben cuotas existentes (las guarda el SQL al colocar cada apuesta).
  const {error}=await db.from('betpan_sports_events').upsert(payload,{onConflict:'id'});
  if(error)throw error;
  scheduled++;
  if(status==='finished'||status==='cancelled'){
   const {data,error:e}=await db.rpc('betpan_finalize_event',{p_event_id:id});if(e)throw e;
   finished++;settled+=Number(data?.settled??0);
  }
 }
 return {enabled:true,received:matches.length,updated:scheduled,finals:finished,bets_settled:settled,ignored};
}

// ── Router autenticado ───────────────────────────────────────────────
/**
 * Autenticación: NO se admite ID de Discord procedente del body/query/header del jugador.
 * El host debe establecer req.user o req.session a partir de OAuth Discord verificado.
 * Se puede inyectar getUserId si el proyecto usa otro middleware.
 */
function defaultUserId(req){
 const u=req.user??req.session?.passport?.user??req.session?.discordUser??req.session?.user;
 const id=typeof u==='string'?u:(typeof u==='object'&&u!==null)?(u.discord_id??u.discordId??u.id):null;
 return typeof id==='string'&&/^\d{15,22}$/.test(id)?id:null;
}
const safeError=(e)=>{
 const s=String(e?.message??e??'Error');
 if(/Saldo insuficiente|Mercado cerrado|Idempotencia incompatible|Ronda caducada|Apuesta inválida|Parámetros inválidos|fuera de límites|Premio|Turno|Juego|Acción|Cartera|Jugada/i.test(s))return s;
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
   db.from('betpan_rounds').select('id,game,wager,payout,status,result,wallet_source,created_at').eq('user_id',id).eq('status','settled').order('created_at',{ascending:false}).limit(15),
   db.from('betpan_sports_bets').select('id,event_id,pick,stake,odds,possible_payout,payout,status,wallet_source,created_at').eq('user_id',id).order('created_at',{ascending:false}).limit(15),
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
  const {game,wager,choice,requestId,walletSource='cash'}=req.body??{};
  if(!['cash','bank'].includes(walletSource))return res.status(400).json({error:'Elige efectivo o banco'});
  if(!validWager(wager)||!reqId(requestId))return res.status(400).json({error:'Apuesta 10–10.000 Panedas y requestId UUID obligatorios'});
  if(!games.includes(game))return res.status(400).json({error:'Juego no válido'});
  // Evitar rerolls en solicitudes duplicadas: consultar ANTES de generar aleatoriedad.
  const {data:old,error:oldErr}=await db.from('betpan_rounds').select('id,request_id,user_id,game,wager,payout,result,status,wallet_source').eq('request_id',requestId).maybeSingle();
  if(oldErr)throw oldErr;
  if(old){if(old.user_id!==req.betpanId||old.game!==game||Number(old.wager)!==wager||old.wallet_source!==walletSource)return res.status(409).json({error:'Petición ya utilizada'});return res.json({round:old,repeated:true});}
  const x=play(game,wager,choice);
  const {data,error}=await db.rpc('betpan_instant_play',{p_uid:req.betpanId,p_game:game,p_wager:wager,p_payout:x.payout,p_result:x.result,p_request_id:requestId,p_source:walletSource});
  if(error)throw error;
  res.json({round:{id:data.id,game:data.game,wager:data.wager,payout:data.payout,result:data.result,status:data.status,wallet_source:data.wallet_source}});
 }));
 router.post('/blackjack/start',guard,throttle,wrap(async(req,res)=>{
  const {wager,requestId,walletSource='cash'}=req.body??{};
  if(!['cash','bank'].includes(walletSource))return res.status(400).json({error:'Elige efectivo o banco'});
  if(!validWager(wager)||!reqId(requestId))return res.status(400).json({error:'Importe o ID inválidos'});
  const {data:open,error:oerr}=await db.from('betpan_rounds').select('*').eq('user_id',req.betpanId).eq('game','blackjack').eq('status','active').limit(1);
  if(oerr)throw oerr;
  if(open.length)return res.status(409).json({error:'Termina primero tu partida de blackjack',blackjack:publicBlackjack(open[0])});
  const {data,error}=await db.rpc('betpan_blackjack_start',{p_uid:req.betpanId,p_wager:wager,p_state:freshBlackjack(),p_request_id:requestId,p_source:walletSource});
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
  const {eventId,pick,stake,requestId,walletSource='cash'}=req.body??{};
  if(!['cash','bank'].includes(walletSource))return res.status(400).json({error:'Elige efectivo o banco'});
  if(typeof eventId!=='string'||!/^FD:PD:\d+$/.test(eventId)||!['home','draw','away'].includes(pick)||!validWager(stake)||!reqId(requestId))return res.status(400).json({error:'Apuesta deportiva inválida'});
  const {data,error}=await db.rpc('betpan_place_sport',{p_uid:req.betpanId,p_event:eventId,p_pick:pick,p_stake:stake,p_request_id:requestId,p_source:walletSource});
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
