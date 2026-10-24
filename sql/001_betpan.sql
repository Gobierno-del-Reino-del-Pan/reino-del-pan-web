-- BETPAN 1.0 - Solo Panedas ficticias, sin dinero real.
-- Ejecutar desde SQL Editor de Supabase, revisar y probar antes de habilitar a todos.
-- Todos los cambios de saldo se hacen en transacciones PostgreSQL.
create extension if not exists pgcrypto;

create table if not exists public.betpan_rounds (
 id uuid primary key default gen_random_uuid(),
 user_id text not null references public.users_economy(id),
 request_id uuid not null unique,
 game text not null check(game in ('roulette','slots','coin','dice','bingo','krule','blackjack')),
 wager bigint not null check(wager between 10 and 10000),
 payout bigint not null default 0 check(payout>=0),
 status text not null check(status in ('active','settled')),
 state jsonb not null default '{}'::jsonb,
 result jsonb not null default '{}'::jsonb,
 version integer not null default 0,
 created_at timestamptz not null default now(),
 finished_at timestamptz
);
create index if not exists betpan_rounds_user_idx on public.betpan_rounds(user_id,created_at desc);
create unique index if not exists betpan_one_active_blackjack_user on public.betpan_rounds(user_id) where game='blackjack' and status='active';

create table if not exists public.betpan_ledger (
 id bigint generated always as identity primary key,
 user_id text not null references public.users_economy(id),
 operation_key text not null unique,
 delta bigint not null,
 balance_after bigint not null,
 reason text not null,
 created_at timestamptz not null default now()
);
create index if not exists betpan_ledger_user_idx on public.betpan_ledger(user_id,created_at desc);

create table if not exists public.betpan_sports_events (
 id text primary key,
 league text not null,
 home_team text not null,
 away_team text not null,
 starts_at timestamptz not null,
 status text not null check(status in ('scheduled','live','finished','postponed','cancelled')),
 winner text check(winner in ('home','draw','away') or winner is null),
 home_score integer,
 away_score integer,
 odds_home numeric(7,2) not null default 2.70,
 odds_draw numeric(7,2) not null default 3.20,
 odds_away numeric(7,2) not null default 2.70,
 updated_at timestamptz not null default now()
);
create index if not exists betpan_sports_events_date_idx on public.betpan_sports_events(starts_at,status);

create table if not exists public.betpan_sports_bets (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null unique,
 user_id text not null references public.users_economy(id),
 event_id text not null references public.betpan_sports_events(id),
 pick text not null check(pick in ('home','draw','away')),
 stake bigint not null check(stake between 10 and 10000),
 odds numeric(7,2) not null,
 possible_payout bigint not null,
 payout bigint not null default 0,
 status text not null default 'pending' check(status in ('pending','won','lost','refunded')),
 created_at timestamptz not null default now(),
 resolved_at timestamptz
);
create index if not exists betpan_sports_bets_user_idx on public.betpan_sports_bets(user_id,created_at desc);
create index if not exists betpan_sports_bets_event_idx on public.betpan_sports_bets(event_id,status);

-- Acceso solo desde funciones en servidor con service_role; nunca exponer claves.
alter table public.betpan_rounds enable row level security;
alter table public.betpan_ledger enable row level security;
alter table public.betpan_sports_events enable row level security;
alter table public.betpan_sports_bets enable row level security;
revoke all on public.betpan_rounds, public.betpan_ledger, public.betpan_sports_events, public.betpan_sports_bets from anon, authenticated;
grant select,insert,update,delete on public.betpan_rounds,public.betpan_ledger,public.betpan_sports_events,public.betpan_sports_bets to service_role;
grant usage,select on sequence public.betpan_ledger_id_seq to service_role;

-- Cada API RPC usa service_role desde backend de confianza.
create or replace function public.betpan_instant_play(p_uid text,p_game text,p_wager bigint,p_payout bigint,p_result jsonb,p_request_id uuid)
returns public.betpan_rounds language plpgsql security invoker set search_path = public as $$
declare r public.betpan_rounds; b bigint; limit_multiplier int;
begin
 if p_uid is null or p_request_id is null or p_result is null or p_game not in ('roulette','slots','coin','dice','bingo','krule') then raise exception 'Jugada inválida'; end if;
 if p_wager is null or p_wager < 10 or p_wager > 10000 then raise exception 'Apuesta fuera de límites'; end if;
 limit_multiplier := case p_game when 'roulette' then 36 when 'slots' then 25 when 'dice' then 6 when 'bingo' then 30 when 'krule' then 8 else 2 end;
 if p_payout is null or p_payout < 0 or p_payout > p_wager * limit_multiplier then raise exception 'Premio inválido'; end if;
 select * into r from public.betpan_rounds where request_id=p_request_id;
 if found then
   if r.user_id != p_uid or r.game != p_game or r.wager != p_wager then raise exception 'Idempotencia incompatible'; end if;
   return r;
 end if;
 insert into public.users_economy(id,cash,bank) values(p_uid,0,0) on conflict(id) do nothing;
 insert into public.betpan_rounds(user_id,request_id,game,wager,payout,status,result,finished_at)
 values(p_uid,p_request_id,p_game,p_wager,p_payout,'settled',p_result,now()) returning * into r;
 update public.users_economy set cash=coalesce(cash,0)-p_wager+p_payout,
   total_spent=coalesce(total_spent,0)+p_wager,
   total_earned=coalesce(total_earned,0)+p_payout,
   updated_at=now()
 where id=p_uid and coalesce(cash,0)>=p_wager returning cash into b;
 if not found then raise exception 'Saldo insuficiente'; end if;
 insert into public.betpan_ledger(user_id,operation_key,delta,balance_after,reason)
 values(p_uid,r.id::text||':stake',-p_wager,b-p_payout,'betpan:'||p_game||':apuesta');
 if p_payout>0 then
  insert into public.betpan_ledger(user_id,operation_key,delta,balance_after,reason)
  values(p_uid,r.id::text||':win',p_payout,b,'betpan:'||p_game||':premio');
 end if;
 return r;
end; $$;

create or replace function public.betpan_blackjack_start(p_uid text,p_wager bigint,p_state jsonb,p_request_id uuid)
returns public.betpan_rounds language plpgsql security invoker set search_path = public as $$
declare r public.betpan_rounds; b bigint;
begin
 if p_uid is null or p_request_id is null or p_state is null or p_wager is null or p_wager<10 or p_wager>10000 then raise exception 'Parámetros inválidos'; end if;
 select * into r from public.betpan_rounds where request_id=p_request_id;
 if found then
  if r.user_id<>p_uid or r.game<>'blackjack' or r.wager<>p_wager then raise exception 'Idempotencia incompatible'; end if;
  return r;
 end if;
 insert into public.users_economy(id,cash,bank) values(p_uid,0,0) on conflict(id) do nothing;
 insert into public.betpan_rounds(user_id,request_id,game,wager,payout,status,state)
 values(p_uid,p_request_id,'blackjack',p_wager,0,'active',p_state) returning * into r;
 update public.users_economy set cash=coalesce(cash,0)-p_wager,total_spent=coalesce(total_spent,0)+p_wager,updated_at=now()
 where id=p_uid and coalesce(cash,0)>=p_wager returning cash into b;
 if not found then raise exception 'Saldo insuficiente'; end if;
 insert into public.betpan_ledger(user_id,operation_key,delta,balance_after,reason)
 values(p_uid,r.id::text||':stake',-p_wager,b,'betpan:blackjack:apuesta');
 return r;
end; $$;

create or replace function public.betpan_blackjack_step(p_uid text,p_round_id uuid,p_version int,p_state jsonb,p_result jsonb,p_payout bigint,p_finish boolean)
returns public.betpan_rounds language plpgsql security invoker set search_path = public as $$
declare r public.betpan_rounds; b bigint;
begin
 select * into r from public.betpan_rounds where id=p_round_id for update;
 if not found or r.user_id<>p_uid or r.game<>'blackjack' or r.status<>'active' or r.version<>p_version then raise exception 'Ronda caducada o no autorizada'; end if;
 if p_payout is null or p_payout<0 or p_payout > floor(r.wager*2.5)::bigint then raise exception 'Premio no permitido'; end if;
 if not p_finish and p_payout<>0 then raise exception 'No se pueden dar premios a rondas abiertas'; end if;
 update public.betpan_rounds set state=p_state,result=coalesce(p_result,'{}'::jsonb),payout=case when p_finish then p_payout else 0 end,
 status=case when p_finish then 'settled' else 'active' end,version=version+1,
 finished_at=case when p_finish then now() else null end where id=r.id returning * into r;
 if p_finish and p_payout>0 then
  update public.users_economy set cash=coalesce(cash,0)+p_payout,total_earned=coalesce(total_earned,0)+p_payout,updated_at=now()
  where id=p_uid returning cash into b;
  insert into public.betpan_ledger(user_id,operation_key,delta,balance_after,reason)
  values(p_uid,r.id::text||':win',p_payout,b,'betpan:blackjack:premio');
 end if;
 return r;
end; $$;

create or replace function public.betpan_place_sport(p_uid text,p_event text,p_pick text,p_stake bigint,p_request_id uuid)
returns public.betpan_sports_bets language plpgsql security invoker set search_path = public as $$
declare b public.betpan_sports_bets; e public.betpan_sports_events; wallet bigint; price numeric; total bigint;
begin
 if p_uid is null or p_request_id is null or p_pick not in ('home','draw','away') or p_stake is null or p_stake<10 or p_stake>10000 then raise exception 'Apuesta inválida'; end if;
 select * into b from public.betpan_sports_bets where request_id=p_request_id;
 if found then
  if b.user_id<>p_uid or b.event_id<>p_event or b.pick<>p_pick or b.stake<>p_stake then raise exception 'Idempotencia incompatible'; end if;
  return b;
 end if;
 select * into e from public.betpan_sports_events where id=p_event for update;
 if not found or e.status<>'scheduled' or e.starts_at<=now()+interval '2 minutes' then raise exception 'Mercado cerrado'; end if;
 price:=case p_pick when 'home' then e.odds_home when 'draw' then e.odds_draw else e.odds_away end;
 total:=floor(p_stake*price)::bigint;
 insert into public.users_economy(id,cash,bank) values(p_uid,0,0) on conflict(id) do nothing;
 insert into public.betpan_sports_bets(request_id,user_id,event_id,pick,stake,odds,possible_payout)
 values(p_request_id,p_uid,p_event,p_pick,p_stake,price,total) returning * into b;
 update public.users_economy set cash=coalesce(cash,0)-p_stake,total_spent=coalesce(total_spent,0)+p_stake,updated_at=now()
 where id=p_uid and coalesce(cash,0)>=p_stake returning cash into wallet;
 if not found then raise exception 'Saldo insuficiente'; end if;
 insert into public.betpan_ledger(user_id,operation_key,delta,balance_after,reason)
 values(p_uid,b.id::text||':stake',-p_stake,wallet,'betpan:deportes:apuesta');
 return b;
end; $$;

create or replace function public.betpan_finalize_event(p_event_id text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare e public.betpan_sports_events; b public.betpan_sports_bets; v_payout bigint; wallet bigint; count_bets int:=0;
begin
 select * into e from public.betpan_sports_events where id=p_event_id for update;
 if not found or e.status not in ('finished','cancelled') then return jsonb_build_object('settled',0,'skipped',true); end if;
 if e.status='finished' and e.winner is null then raise exception 'Falta resultado final'; end if;
 for b in select * from public.betpan_sports_bets where event_id=p_event_id and status='pending' order by created_at for update loop
  v_payout:=case when e.status='cancelled' then b.stake when b.pick=e.winner then b.possible_payout else 0 end;
  update public.betpan_sports_bets set status=case when e.status='cancelled' then 'refunded' when v_payout>0 then 'won' else 'lost' end,
  payout=v_payout,resolved_at=now() where id=b.id;
  if v_payout>0 then
   update public.users_economy set cash=coalesce(cash,0)+v_payout,
     total_earned=coalesce(total_earned,0)+case when e.status='cancelled' then 0 else v_payout end,
     total_spent=coalesce(total_spent,0)-case when e.status='cancelled' then b.stake else 0 end,
     updated_at=now()
   where id=b.user_id returning cash into wallet;
   insert into public.betpan_ledger(user_id,operation_key,delta,balance_after,reason)
   values(b.user_id,b.id::text||':settlement',v_payout,wallet,
     case when e.status='cancelled' then 'betpan:deportes:reembolso' else 'betpan:deportes:premio' end);
  end if;
  count_bets:=count_bets+1;
 end loop;
 return jsonb_build_object('settled',count_bets,'event',p_event_id);
end; $$;

-- Mantener RPC inaccesibles a usuarios con anon o authenticated.
revoke all on function public.betpan_instant_play(text,text,bigint,bigint,jsonb,uuid) from public,anon,authenticated;
revoke all on function public.betpan_blackjack_start(text,bigint,jsonb,uuid) from public,anon,authenticated;
revoke all on function public.betpan_blackjack_step(text,uuid,int,jsonb,jsonb,bigint,boolean) from public,anon,authenticated;
revoke all on function public.betpan_place_sport(text,text,text,bigint,uuid) from public,anon,authenticated;
revoke all on function public.betpan_finalize_event(text) from public,anon,authenticated;
grant execute on function public.betpan_instant_play(text,text,bigint,bigint,jsonb,uuid) to service_role;
grant execute on function public.betpan_blackjack_start(text,bigint,jsonb,uuid) to service_role;
grant execute on function public.betpan_blackjack_step(text,uuid,int,jsonb,jsonb,bigint,boolean) to service_role;
grant execute on function public.betpan_place_sport(text,text,text,bigint,uuid) to service_role;
grant execute on function public.betpan_finalize_event(text) to service_role;
-- Nota de RLS: users_economy existente necesita proteger sus políticas para no permitir ediciones directas de cash/bank desde clientes.
