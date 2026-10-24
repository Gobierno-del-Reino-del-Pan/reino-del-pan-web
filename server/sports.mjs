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
