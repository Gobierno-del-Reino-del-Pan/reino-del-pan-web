import { randomInt } from 'node:crypto';
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
