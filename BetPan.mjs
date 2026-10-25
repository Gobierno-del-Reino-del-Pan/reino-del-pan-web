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

// ── Calendario deportivo multi-competición ──────────────────────────
/** Códigos del proveedor football-data.org v4. UCL=Conference League (NO Champions). */
export const SPORT_COMPETITIONS=Object.freeze([
 {code:'PD',name:'LaLiga'},
 {code:'PL',name:'Premier League'},
 {code:'FL1',name:'Ligue 1'},
 {code:'CL',name:'UEFA Champions League'},
 {code:'EL',name:'UEFA Europa League'},
 {code:'UCL',name:'UEFA Conference League'}
]);
const validHttps=u=>typeof u==='string'&&/^https:\/\/[^\s]+$/i.test(u)?u:null;
const crestUrl=(team)=> validHttps(team?.crest) || (Number.isSafeInteger(team?.id)&&team.id>0?`https://crests.football-data.org/${team.id}.svg`:null);
export function normalizeSportMatch(m,competition,now=new Date()){
 if(!m?.id||!m.utcDate||!m.homeTeam?.name||!m.awayTeam?.name)return null;
 const statuses={SCHEDULED:'scheduled',TIMED:'scheduled',IN_PLAY:'live',PAUSED:'live',LIVE:'live',EXTRA_TIME:'live',PENALTY_SHOOTOUT:'live',FINISHED:'finished',POSTPONED:'postponed',SUSPENDED:'postponed',CANCELLED:'cancelled'};
 const status=statuses[m.status];if(!status)return null;
 const h=m.score?.fullTime?.home,a=m.score?.fullTime?.away;
 if(status==='finished'&&(!Number.isInteger(h)||!Number.isInteger(a)))return null;
 const code=competition.code;
 const result={id:`FD:${code}:${m.id}`,league:competition.name,league_code:code,
  league_emblem:validHttps(m.competition?.emblem)||`https://crests.football-data.org/${code}.png`,
  home_team:m.homeTeam.name,away_team:m.awayTeam.name,
  home_team_id:Number.isSafeInteger(m.homeTeam.id)?m.homeTeam.id:null,
  away_team_id:Number.isSafeInteger(m.awayTeam.id)?m.awayTeam.id:null,
  home_crest:crestUrl(m.homeTeam),away_crest:crestUrl(m.awayTeam),
  starts_at:m.utcDate,status,winner:status==='finished'?(h>a?'home':h<a?'away':'draw'):null,
  home_score:status==='finished'?h:null,away_score:status==='finished'?a:null,
  matchday:Number.isInteger(m.matchday)?m.matchday:null,updated_at:now.toISOString()};
 return result;
}
/** Six requests or fewer; run concurrently to stay under serverless timeouts.
 * A 403/429 in a restricted competition does not block the others.
 * All results are settled with the existing atomic, idempotent SQL RPC.
 */
export async function syncSports(db,{token=process.env.FOOTBALL_DATA_TOKEN,now=new Date(),fetcher=fetch}={}){
 if(!token)return {enabled:false,reason:'Configura FOOTBALL_DATA_TOKEN para activar el calendario deportivo'};
 const d=offset=>new Date(now.getTime()+offset*86400000).toISOString().slice(0,10);
 const query=`dateFrom=${d(-7)}&dateTo=${d(20)}`;
 const results=await Promise.all(SPORT_COMPETITIONS.map(async competition=>{
  const url=`https://api.football-data.org/v4/competitions/${competition.code}/matches?${query}`;
  try{
   const response=await fetcher(url,{headers:{'X-Auth-Token':token},signal:AbortSignal.timeout(12000)});
   if(!response.ok){
    return {competition:competition.code,status:response.status===403?'restricted':response.status===429?'rate_limited':'error',http:response.status,matches:[]};
   }
   const body=await response.json();
   return {competition:competition.code,status:'ok',matches:Array.isArray(body.matches)?body.matches:[]};
  }catch(e){return {competition:competition.code,status:'error',message:String(e?.message??e).slice(0,120),matches:[]};}
 }));
 const ok=results.filter(r=>r.status==='ok');
 if(!ok.length) return {enabled:true,updated:0,received:0,finals:0,bets_settled:0,ignored:0,
  competitions:results.map(({competition,status,http})=>({code:competition,status,http})),
  warning:'El proveedor no devolvió ninguna competición. Comprueba la clave, los permisos o el límite de solicitudes.'};
 let ignored=0,finals=0,settled=0,updated=0;
 const payloads=[];
 for(const c of ok){
  const competition=SPORT_COMPETITIONS.find(x=>x.code===c.competition);
  for(const match of c.matches){
   const mapped=normalizeSportMatch(match,competition,now);
   if(mapped)payloads.push(mapped);else ignored++;
  }
 }
 // Paginar escrituras en Supabase: evita una petición por cada partido.
 for(let index=0;index<payloads.length;index+=40){
  const part=payloads.slice(index,index+40);
  const {error}=await db.from('betpan_sports_events').upsert(part,{onConflict:'id'});
  if(error)throw error;
  updated+=part.length;
 }
 // La cuota de cada boleto se conserva: el upsert NO modifica odds_*.
 // La función SQL sólo abona pendientes y protege la repetición del cron.
 for(const m of payloads){
  if(m.status==='finished'||m.status==='cancelled'){
   const {data,error}=await db.rpc('betpan_finalize_event',{p_event_id:m.id});
   if(error)throw error;
   finals++;settled+=Number(data?.settled??0);
  }
 }
 return {enabled:true,received:results.reduce((n,r)=>n+r.matches.length,0),updated,finals,bets_settled:settled,ignored,
  competitions:results.map(({competition,status,http})=>({code:competition,status,http}))};
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
 if(/Saldo insuficiente|Mercado cerrado|Idempotencia incompatible|Ronda caducada|Apuesta inválida|Parámetros inválidos|fuera de límites|Premio|Turno|Juego|Acción|Cartera|Jugada|sala|jugadores|participas|insuficientes/i.test(s))return s;
 return 'No se ha podido completar la operación';
};
const validWager=n=>Number.isSafeInteger(n)&&n>=10&&n<=10000;
const reqId=(x)=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
const rejectStatus=e=>/Saldo insuficiente/.test(e.message)?409:/Ronda caducada|Mercado cerrado|Idempotencia/.test(e.message)?409:400;
const isSecret=(a,b)=>{if(!a||!b)return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)};
// ── BetPan Social · sorteo compartido, verificado por backend ─────────────
const ROOM_GAMES=['roulette','slots','coin','dice','krule','bingo','blackjack'];
const roomMinimum=g=>g==='bingo'?5:2;
export function makeBingoTicket(){
 const cards=[];
 for(let col=0;col<5;col++){
  const n=shuffled(Array.from({length:15},(_,i)=>i+1+15*col)).slice(0,5);
  for(let row=0;row<5;row++)cards[row*5+col]=n[row];
 }
 cards[12]=0;return cards;
}
const bingoLines=[
 ...Array.from({length:5},(_,r)=>Array.from({length:5},(_,c)=>r*5+c)),
 ...Array.from({length:5},(_,c)=>Array.from({length:5},(_,r)=>r*5+c)),
 [0,6,12,18,24],[4,8,12,16,20]
];
const bingoLine=(ticket,called)=>bingoLines.some(l=>l.every(idx=>ticket[idx]===0||called.has(ticket[idx])));
const bingoFull=(ticket,called)=>ticket.every(n=>n===0||called.has(n));
function dividePool(pool,players){
 if(!players.length)return [];
 const ordered=[...players].sort((a,b)=>String(a.id).localeCompare(String(b.id)));
 const weight=ordered.reduce((a,p)=>a+Number(p.wager),0);
 let used=0;
 const out=ordered.map(p=>{const amount=Math.floor(pool*Number(p.wager)/weight);used+=amount;return {id:p.id,amount};});
 for(let i=0;i<pool-used;i++)out[i%out.length].amount++;
 return out;
}
export function createRoomResult(game,participants){
 if(!ROOM_GAMES.includes(game))throw new Error('Juego no válido');
 const awards=participants.map(p=>({id:p.id,payout:0}));
 const awardMap=new Map(awards.map(a=>[a.id,a]));
 let outcome={};let duration=5200;
 if(game==='bingo'){
  const draw=shuffled(Array.from({length:75},(_,i)=>i+1));
  const check=(fn)=>{
   const s=new Set();
   for(let i=0;i<draw.length;i++){
    s.add(draw[i]);const winners=participants.filter(p=>fn(p.ticket,s));
    if(winners.length)return {at:i+1,winners};
   }
   return {at:75,winners:participants};
  };
  const line=check(bingoLine),full=check(bingoFull);
  const pool=participants.reduce((s,p)=>s+Number(p.wager),0);
  const linePot=Math.floor(pool*.20);const fullPot=pool-linePot;
  for(const share of dividePool(linePot,line.winners))awardMap.get(share.id).payout+=share.amount;
  for(const share of dividePool(fullPot,full.winners))awardMap.get(share.id).payout+=share.amount;
  outcome={drawn:draw.slice(0,full.at),lineAt:line.at,bingoAt:full.at,
   lineWinners:line.winners.map(p=>p.id),bingoWinners:full.winners.map(p=>p.id),pot:pool};
  duration=Math.min(119000,full.at*1400+2200);
 } else if(game==='blackjack'){
  const dealerDeck=deck();const dealer=[dealerDeck.pop(),dealerDeck.pop()];
  while(score(dealer)<17)dealer.push(dealerDeck.pop());
  const dScore=score(dealer);const playerHands={};
  for(const p of participants){const cards=deck();const hand=[cards.pop(),cards.pop()];
   const target=Math.min(20,Math.max(16,Number(p.choice)||17));
   while(score(hand)<target&&score(hand)<=21)hand.push(cards.pop());
   const total=score(hand);const natural=hand.length===2&&total===21;
   const payout=total>21?0:dScore>21||total>dScore?Math.floor(p.wager*(natural?2.5:2)):total===dScore?p.wager:0;
   awardMap.get(p.id).payout=payout;playerHands[p.id]={cards:hand,total,target};
  }
  outcome={dealer,dScore,playerHands};duration=7800;
 }else{
  if(game==='roulette')outcome={roll:randomInt(37)};
  if(game==='coin')outcome={landed:randomInt(2)===0?'cara':'cruz'};
  if(game==='dice')outcome={landed:randomInt(1,7)};
  if(game==='slots')outcome={reels:Array.from({length:3},()=>pick(['🍒','🍋','🍇','🔔','7️⃣']))};
  if(game==='krule')outcome={dice:Array.from({length:3},()=>randomInt(1,7))};
  for(const p of participants){let mult=0;
   if(game==='roulette'){
    const n=outcome.roll,c=String(p.choice),colour=n===0?'verde':reds.has(n)?'rojo':'negro';
    mult=c.startsWith('n:')?Number(c.slice(2))===n?36:0:c==='par'&&n!==0&&n%2===0||c==='impar'&&n%2===1||c===colour?2:0;
   }
   if(game==='coin')mult=p.choice===outcome.landed?2:0;
   if(game==='dice')mult=Number(p.choice)===outcome.landed?6:0;
   if(game==='slots'){const r=outcome.reels;mult=r.every(x=>x==='7️⃣')?25:r.every(x=>x===r[0])?12:new Set(r).size===2?2:0;}
   if(game==='krule'){const r=outcome.dice;mult=new Set(r).size===1?8:new Set(r).size===2?2:r.reduce((a,b)=>a+b,0)>=14?1.5:0;}
   awardMap.get(p.id).payout=Math.floor(Number(p.wager)*mult);
  }
 }
 return {outcome,awards,duration};
}
async function advanceSocialRoom(db,roomId){
 const {data:room,error}=await db.from('betpan_rooms').select('*').eq('id',roomId).maybeSingle();
 if(error)throw error;
 if(!room)return null;
 let current=room;
 if(room.status==='joining'&&Date.parse(room.starts_at)<=Date.now()){
  const {data:players,error:pe}=await db.from('betpan_room_players').select('*').eq('room_id',room.id);
  if(pe)throw pe;
  // Resultado solo generado después de que se cierre la inscripción.
  const result=players.length>=roomMinimum(room.game)?createRoomResult(room.game,players):{};
  const {data:newRoom,error:e}=await db.rpc('betpan_room_begin',{
   p_room:room.id,p_result:result,p_duration_ms:result.duration??5200
  });
  if(e)throw e;current=newRoom;
 }
 if((current.status==='drawing'&&Date.parse(current.draw_ends_at)<=Date.now())||current.status==='cancelled'){
  const {data:newRoom,error:e}=await db.rpc('betpan_room_finalize',{p_room:current.id});
  if(e)throw e;current=newRoom;
 }
 return current;
}
async function socialRoomView(db,roomId,myId){
 const room=await advanceSocialRoom(db,roomId);if(!room)return null;
 const {data:players,error}=await db.from('betpan_room_players')
  .select('id,user_id,wager,choice,ticket,payout,status,wallet_source,joined_at')
  .eq('room_id',room.id).order('joined_at',{ascending:true});if(error)throw error;
 const my=players.find(p=>p.user_id===myId);
 const ids=players.map(p=>p.user_id);
 const {data:profiles,error:profileError}=ids.length?await db.from('usuarios')
  .select('discord_id,username,avatar_url').in('discord_id',ids):{data:[],error:null};
 if(profileError)throw profileError;
 const publicProfiles=new Map((profiles??[]).map(p=>[p.discord_id,p]));
 const visible=room.status==='settled';const ongoing=room.status==='drawing';
 const result=room.result??{};
 const startAt=Date.parse(room.draw_ends_at??'')-Number((result.outcome?.drawn?.length??0)*1400+2200);
 const drawCount=visible?result.outcome?.drawn?.length??0:ongoing?
  Math.max(0,Math.min(result.outcome?.drawn?.length??0,Math.floor((Date.now()-startAt)/1400))):0;
 let safeOutcome=visible?result.outcome:ongoing&&room.game==='bingo'?{drawn:(result.outcome?.drawn??[]).slice(0,drawCount)}:null;
 if(room.game==='bingo'&&safeOutcome){
  const at=Number(result.outcome?.lineAt??0);
  safeOutcome={...safeOutcome,
   lineAt:visible||(ongoing&&drawCount>=at)?at:null,
   lineWinnerSeats:visible||(ongoing&&drawCount>=at)?(result.outcome?.lineWinners??[]).map(pid=>players.findIndex(p=>p.id===pid)+1):[],
   bingoWinnerSeats:visible?(result.outcome?.bingoWinners??[]).map(pid=>players.findIndex(p=>p.id===pid)+1):[]};
  delete safeOutcome.lineWinners;delete safeOutcome.bingoWinners;
 }
 if(visible&&room.game==='blackjack'&&safeOutcome){
  safeOutcome={dealer:safeOutcome.dealer,dScore:safeOutcome.dScore,
   yourHand:safeOutcome.playerHands?.[my?.id]??null};
 }
 const safePlayers=players.map((p,i)=>({seat:i+1,isMe:p.user_id===myId,
  label:p.user_id===myId?'Tú':String(publicProfiles.get(p.user_id)?.username??`Jugador ${i+1}`).slice(0,32),
  avatar:/^https:\/\//.test(publicProfiles.get(p.user_id)?.avatar_url??'')?publicProfiles.get(p.user_id)?.avatar_url:null,
  wager:p.wager,
  choice:room.status==='joining'?null:p.choice,status:p.status,payout:visible||room.status==='cancelled'?p.payout:null}));
 return {id:room.id,game:room.game,status:room.status,starts_at:room.starts_at,
  draw_ends_at:room.draw_ends_at,finished_at:room.finished_at,minPlayers:roomMinimum(room.game),
  players:safePlayers,my:my?{id:my.id,wager:my.wager,ticket:room.game==='bingo'?my.ticket:null,
    choice:my.choice,wallet_source:my.wallet_source,status:my.status,payout:visible||room.status==='cancelled'?my.payout:null}:null,
  outcome:safeOutcome,message:result.message??null,now:new Date().toISOString()};
}

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
   db.from('betpan_sports_bets').select('id,event_id,pick,stake,odds,possible_payout,payout,base_payout,pool_bonus,status,wallet_source,created_at,resolved_at').eq('user_id',id).order('created_at',{ascending:false}).limit(50),
   db.from('betpan_sports_events').select('*').gte('starts_at',new Date(Date.now()-10*86400000).toISOString()).lte('starts_at',new Date(Date.now()+21*86400000).toISOString()).order('starts_at',{ascending:true}).limit(700),
   db.from('betpan_rounds').select('*').eq('user_id',id).eq('game','blackjack').eq('status','active').order('created_at',{ascending:false}).limit(1)
  ]);
  for(const q of [wallet,rounds,sports,markets,openBj])if(q.error)throw q.error;
  const pendingSports=sports.data??[];
  // Completar datos de apuestas incluso si el partido es anterior a la ventana del panel.
  const indexed=new Map((markets.data??[]).map(e=>[e.id,e]));
  const missing=[...new Set(pendingSports.map(b=>b.event_id).filter(eid=>!indexed.has(eid)))];
  if(missing.length){const {data:oldMatches,error:oe}=await db.from('betpan_sports_events').select('*').in('id',missing);if(oe)throw oe;
    for(const e of oldMatches??[])indexed.set(e.id,e);
  }
  const enrichedBets=pendingSports.map(b=>({...b,event:indexed.get(b.event_id)??null}));
  const eventIds=(markets.data??[]).map(e=>e.id);
  const sportsStats={};
  if(eventIds.length){
   // Fragmentar el IN para no generar URLs demasiado largas con seis ligas.
   for(let i=0;i<eventIds.length;i+=80){
    const {data:allBets,error:se}=await db.from('betpan_sports_bets')
      .select('event_id,pick,stake,status').in('event_id',eventIds.slice(i,i+80)).limit(1000);
    if(se)throw se;
    for(const b of allBets??[]){const z=sportsStats[b.event_id]??{participants:0,stakes:{home:0,draw:0,away:0},total:0};
     z.participants++;z.total+=Number(b.stake);z.stakes[b.pick]+=Number(b.stake);sportsStats[b.event_id]=z;
    }
   }
  }
  return res.json({wallet:{cash:String(wallet.data?.cash??0),bank:String(wallet.data?.bank??0)},
   rounds:rounds.data??[],bets:enrichedBets,sportsStats,
   events:markets.data??[],blackjack:openBj.data?.[0]?publicBlackjack(openBj.data[0]):null,
   sportsEnabled:Boolean(process.env.FOOTBALL_DATA_TOKEN),disclaimer:'Solo Panedas ficticias. Sin euros, sin compras, sin cambio, sin retiradas.'});
 }));
 // ── Salas sociales: cada ruta usa sesión Discord firmada y cliente service_role del servidor.
 router.get('/rooms/live',guard,wrap(async(req,res)=>{
  const {data:rooms,error}=await db.from('betpan_rooms').select('id,game,status,starts_at,draw_ends_at,created_at')
   .in('status',['joining','drawing']).gte('created_at',new Date(Date.now()-3600000).toISOString())
   .order('created_at',{ascending:false}).limit(35);
  if(error)throw error;
  const {data:members,error:pe}=(rooms??[]).length?await db.from('betpan_room_players')
   .select('room_id,user_id').in('room_id',rooms.map(r=>r.id)):{data:[],error:null};
  if(pe)throw pe;
  res.json({rooms:(rooms??[]).map(r=>({...r,minPlayers:roomMinimum(r.game),
   participants:(members??[]).filter(p=>p.room_id===r.id).length,
   joined:(members??[]).some(p=>p.room_id===r.id&&p.user_id===req.betpanId)}))});
 }));
 router.get('/rooms/mine',guard,wrap(async(req,res)=>{
  const {data:entries,error}=await db.from('betpan_room_players')
   .select('room_id,wager,payout,status,choice,wallet_source,joined_at')
   .eq('user_id',req.betpanId).order('joined_at',{ascending:false}).limit(40);
  if(error)throw error;
  const ids=[...new Set((entries??[]).map(p=>p.room_id))];
  const {data:rooms,error:e}=ids.length?await db.from('betpan_rooms')
   .select('id,game,status,starts_at,finished_at').in('id',ids):{data:[],error:null};
  if(e)throw e;
  const index=new Map((rooms??[]).map(r=>[r.id,r]));
  res.json({entries:(entries??[]).map(p=>({...p,room:index.get(p.room_id)??null}))});
 }));
 router.post('/rooms/join',guard,throttle,wrap(async(req,res)=>{
  const {game,wager,choice='',walletSource='cash',requestId}=req.body??{};
  if(!ROOM_GAMES.includes(game)||!validWager(wager)||!reqId(requestId)||!['cash','bank'].includes(walletSource))
   return res.status(400).json({error:'Sala, importe o cartera inválidos'});
  const c=String(choice??'');
  const validChoice=game==='coin'?['cara','cruz'].includes(c):
   game==='dice'?/^[1-6]$/.test(c):
   game==='roulette'?['rojo','negro','par','impar'].includes(c)||/^n:(?:[0-9]|[1-2][0-9]|3[0-6])$/.test(c):
   game==='blackjack'?['16','17','18','19','20'].includes(c):true;
  if(!validChoice)return res.status(400).json({error:'Elección de mesa no válida'});
  const ticket=game==='bingo'?makeBingoTicket():[];
  const {data:member,error}=await db.rpc('betpan_room_join',{
   p_uid:req.betpanId,p_game:game,p_wager:wager,p_choice:c,p_source:walletSource,
   p_request_id:requestId,p_ticket:ticket
  });
  if(error)throw error;
  res.json({room:await socialRoomView(db,member.room_id,req.betpanId)});
 }));
 router.get('/rooms/:id',guard,wrap(async(req,res)=>{
  if(!reqId(req.params.id))return res.status(400).json({error:'Identificador de sala inválido'});
  const room=await socialRoomView(db,req.params.id,req.betpanId);
  if(!room)return res.status(404).json({error:'Sala no encontrada'});
  res.json({room});
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
  if(typeof eventId!=='string'||!/^FD:(?:PD|PL|FL1|CL|EL|UCL):\d+$/.test(eventId)||!['home','draw','away'].includes(pick)||!validWager(stake)||!reqId(requestId))return res.status(400).json({error:'Apuesta deportiva inválida'});
  const {data,error}=await db.rpc('betpan_place_sport',{p_uid:req.betpanId,p_event:eventId,p_pick:pick,p_stake:stake,p_request_id:requestId,p_source:walletSource});
  if(error)throw error;res.json({bet:data});
 }));
 // Protected CRON: never leave available without configured secret.
 router.get('/cron/sports',wrap(async(req,res)=>{
  const token=String(req.headers.authorization??'').replace(/^Bearer\s+/i,'');
  if(!isSecret(token,process.env.CRON_SECRET))return res.status(403).json({error:'Acceso denegado'});
  const {data:oldRooms,error:re}=await db.from('betpan_rooms').select('id').in('status',['joining','drawing'])
    .lt('starts_at',new Date().toISOString()).order('starts_at',{ascending:true}).limit(40);
  if(re)throw re;
  let roomsProcessed=0;
  for(const r of oldRooms??[]){await advanceSocialRoom(db,r.id);roomsProcessed++;}
  const result=await syncSports(db);res.json({...result,roomsProcessed});
 }));
 router.use((err,_req,res,_next)=>{console.error('[BetPan]',err?.message??err);res.status(rejectStatus(err)).json({error:safeError(err)})});
 return router;
}
