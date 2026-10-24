import { useEffect, useMemo, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight, ChevronRight, Crown, MessageCircle, RefreshCw,
  Search, Sparkles, Trophy, X,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* La API y los nombres de columnas existentes se mantienen. */
interface RankUser {
  posicion: number;
  id: string;
  username: string;
  level: number;
  xp: number;
  total_xp: number;
  messages: number;
  avatar: string;
}
interface LeaderboardData {
  top5: RankUser[];
  rankingCompleto: RankUser[];
  destacados: {
    masMensajes: RankUser | null;
    menosMensajes: RankUser | null;
  };
}
interface UserProfile {
  username: string;
  avatar_url: string | null;
  insta: string | null;
  tiktok: string | null;
  x_twitter: string | null;
  cantante_favorito: string | null;
  cantante_imagen: string | null;
  pokemon_favorito: string | null;
  animal_favorito: string | null;
  equipo_futbol: string | null;
}
const XP_PER_LEVEL = 500;
const DEFAULT_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";
const formatNumber = (n: number) => Number(n || 0).toLocaleString("es-ES");
const xpProgress = (xp: number) => Math.min(100, Math.max(0, (Number(xp || 0) % XP_PER_LEVEL) / XP_PER_LEVEL * 100));
const safeAvatar = (user: RankUser) => {
  const value = user.avatar?.trim();
  if (value && /^https:\/\//i.test(value) && !/\b(null|undefined)\b/i.test(value)) return value;
  if (value && user.id && /^[a-zA-Z0-9_]+$/.test(value)) {
    return `https://cdn.discordapp.com/avatars/${encodeURIComponent(user.id)}/${value}.${value.startsWith("a_") ? "gif" : "png"}?size=128`;
  }
  return DEFAULT_AVATAR;
};
function imageFallback(event: SyntheticEvent<HTMLImageElement>) {
  if (event.currentTarget.src !== DEFAULT_AVATAR) event.currentTarget.src = DEFAULT_AVATAR;
}
const animalEmojis: Record<string, string> = {
  perro: "🐶", dog: "🐶", gato: "🐱", cat: "🐱", conejo: "🐰", león: "🦁", leon: "🦁",
  tigre: "🐯", oso: "🐻", panda: "🐼", zorro: "🦊", lobo: "🐺", caballo: "🐴",
  vaca: "🐮", cerdo: "🐷", rana: "🐸", mono: "🐵", gallina: "🐔", pollo: "🐔",
  pingüino: "🐧", pinguino: "🐧", águila: "🦅", aguila: "🦅", búho: "🦉", buho: "🦉",
  delfín: "🐬", delfin: "🐬", ballena: "🐳", tiburón: "🦈", tiburon: "🦈",
  serpiente: "🐍", tortuga: "🐢", elefante: "🐘", jirafa: "🦒", koala: "🐨",
  hámster: "🐹", hamster: "🐹", ardilla: "🐿️", murciélago: "🦇", murcielago: "🦇",
  cabra: "🐐", oveja: "🐑", pato: "🦆", caballito_de_mar: "🐴",
};
const emojiFor = (value: string) => animalEmojis[value.trim().toLowerCase()] || "🐾";
function normalizedHandle(value: string) {
  return value.trim().replace(/^@/, "").replace(/[^a-zA-Z0-9_.]/g, "");
}

function Avatar({ user, className = "" }: { user: RankUser; className?: string }) {
  return <img className={`lvl-avatar ${className}`} src={safeAvatar(user)} onError={imageFallback} alt="" loading="lazy" />;
}
function XPBar({ xp }: { xp: number }) {
  return (
    <div className="lvl-xp-line" aria-label={`${Math.round(xpProgress(xp))}% de progreso hacia el siguiente nivel`}>
      <div className="lvl-xp-track"><div style={{ width: `${xpProgress(xp)}%` }} /></div>
      <span>{Math.round(xpProgress(xp))}%</span>
    </div>
  );
}
function LoadingSkeleton() {
  return <div className="lvl-skeleton-wrap" role="status" aria-label="Cargando clasificación">
    <div className="lvl-shimmer" style={{ width: "55%", height: 28, marginBottom: 22 }} />
    <div className="lvl-skeleton-grid">{[1, 2, 3].map(i => <div className="lvl-glass lvl-skeleton-card" key={i}><div className="lvl-shimmer" style={{ width: 64, height: 64, borderRadius: "50%" }} /><div className="lvl-shimmer" style={{ width: "70%", height: 18 }} /><div className="lvl-shimmer" style={{ width: "50%", height: 12 }} /></div>)}</div>
    <div className="lvl-glass lvl-skeleton-table">{[1, 2, 3, 4, 5].map(i => <div key={i} className="lvl-shimmer" style={{ height: 48 }} />)}</div>
  </div>;
}
function Podium({ top3, onUser }: { top3: RankUser[]; onUser: (id: string) => void }) {
  const order = [2, 1, 3].map(rank => top3.find(user => user.posicion === rank)).filter((v): v is RankUser => !!v);
  return <div className="lvl-podium" aria-label="Podio de los tres primeros ciudadanos">
    {order.map(user => (
      <button type="button" key={user.id} onClick={() => onUser(user.id)} className={`lvl-podium-entry lvl-podium-${user.posicion}`} aria-label={`Ver perfil de ${user.username}, posición ${user.posicion}`}>
        <div className="lvl-podium-user">
          <span className="lvl-podium-medal">{user.posicion === 1 ? <Crown size={23} /> : user.posicion === 2 ? "🥈" : "🥉"}</span>
          <Avatar user={user} />
          <strong title={user.username}>@{user.username}</strong>
          <small>Nivel {user.level}</small>
        </div>
        <div className="lvl-podium-block"><span>{user.posicion.toString().padStart(2, "0")}</span><small>{formatNumber(user.total_xp)} XP</small></div>
      </button>
    ))}
  </div>;
}
function HighlightCard({ user, label, icon, onUser }: { user: RankUser; label: string; icon: "top" | "quiet"; onUser: (id: string) => void }) {
  return <button type="button" className="lvl-highlight lvl-glass" onClick={() => onUser(user.id)}>
    <div className="lvl-highlight-icon">{icon === "top" ? <MessageCircle size={21} /> : <Sparkles size={21} />}</div>
    <div className="lvl-highlight-detail"><span>{label}</span><strong title={user.username}>@{user.username}</strong><small>{formatNumber(user.messages)} mensajes</small></div>
    <Avatar user={user} /><ChevronRight size={17} className="lvl-highlight-arrow" />
  </button>;
}

function Favorite({ label, value, image, emoji }: { label: string; value: string; image?: string | null; emoji: string }) {
  return <div className="lvl-favorite">
    {image ? <img src={image} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = "none"; }} /> : <span aria-hidden="true">{emoji}</span>}
    <div><small>{label}</small><strong>{value}</strong></div>
  </div>;
}

function UserProfileModal({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const reducedMotion = useReducedMotion();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [teamBadge, setTeamBadge] = useState<string | null>(null);
  const [pokemonSprite, setPokemonSprite] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!userId) return;
    const listener = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", listener);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.removeEventListener("keydown", listener); document.body.style.overflow = previous; };
  }, [userId, onClose]);

  useEffect(() => {
    if (!userId) { setProfile(null); setTeamBadge(null); setPokemonSprite(null); return; }
    const controller = new AbortController();
    setLoading(true); setError(false); setProfile(null); setTeamBadge(null); setPokemonSprite(null);
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !key) { setLoading(false); setError(true); return () => controller.abort(); }
    const columns = "username,avatar_url,insta,tiktok,x_twitter,cantante_favorito,cantante_imagen,pokemon_favorito,animal_favorito,equipo_futbol";
    const endpoint = `${url.replace(/\/$/, "")}/rest/v1/usuarios?discord_id=eq.${encodeURIComponent(userId)}&select=${columns}&limit=1`;
    fetch(endpoint, { signal: controller.signal, headers: { apikey: key, Authorization: `Bearer ${key}` } })
      .then(async r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((rows: UserProfile[]) => {
        if (!controller.signal.aborted) {
          if (Array.isArray(rows) && rows[0]) setProfile(rows[0]);
          else setError(true);
        }
      })
      .catch(e => { if (!controller.signal.aborted && e.name !== "AbortError") setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [userId]);

  useEffect(() => {
    if (!profile?.pokemon_favorito) return;
    const controller = new AbortController();
    fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(profile.pokemon_favorito.toLowerCase().trim())}`, { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!controller.signal.aborted) setPokemonSprite(d?.sprites?.other?.["official-artwork"]?.front_default || d?.sprites?.front_default || null); })
      .catch(() => { if (!controller.signal.aborted) setPokemonSprite(null); });
    return () => controller.abort();
  }, [profile?.pokemon_favorito]);

  useEffect(() => {
    if (!profile?.equipo_futbol) return;
    const controller = new AbortController();
    const name = profile.equipo_futbol.trim();
    const generic = () => {
      const letters = name.split(/\s+/).slice(0, 2).map(v => v[0]).join("").toUpperCase();
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(letters)}&background=630B57&color=fff&size=128&bold=true`;
    };
    async function findBadge() {
      try {
        const endpoint = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=es&format=json&origin=*&limit=1&type=item`;
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error("Wikidata unavailable");
        const data = await response.json();
        const entity = data.search?.[0]?.id;
        if (!entity) throw new Error("Not found");
        const props = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(entity)}&props=claims&format=json&origin=*`, { signal: controller.signal });
        if (!props.ok) throw new Error("Badge unavailable");
        const json = await props.json();
        const claims = json.entities?.[entity]?.claims;
        const file = claims?.P154?.[0]?.mainsnak?.datavalue?.value || claims?.P94?.[0]?.mainsnak?.datavalue?.value;
        if (file && !controller.signal.aborted) { setTeamBadge(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(String(file).replace(/ /g, "_"))}`); return; }
      } catch { /* Utilizamos un distintivo generado si la fuente externa falla. */ }
      if (!controller.signal.aborted) {
        try {
          const wp = await fetch(`https://es.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=400&origin=*`, { signal: controller.signal });
          const json = await wp.json();
          const pages = json.query?.pages || {};
          const image = Object.values(pages)[0] as { thumbnail?: { source?: string } } | undefined;
          if (image?.thumbnail?.source) { setTeamBadge(image.thumbnail.source); return; }
        } catch { /* Ignorar y continuar */ }
      }
      if (!controller.signal.aborted) {
        try {
          const db = await fetch(`https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${encodeURIComponent(name)}`, { signal: controller.signal });
          const json = await db.json();
          const badge = json.teams?.[0]?.strBadge || json.teams?.[0]?.strTeamBadge;
          if (badge) { setTeamBadge(badge); return; }
        } catch { /* Usar insignia genérica */ }
      }
      if (!controller.signal.aborted) setTeamBadge(generic());
    }
    void findBadge();
    return () => controller.abort();
  }, [profile?.equipo_futbol]);

  return <AnimatePresence>
    {userId && <motion.div className="lvl-modal-backdrop" role="presentation" key="profile-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
      <motion.section className="lvl-modal lvl-glass" role="dialog" aria-modal="true" aria-label="Perfil del ciudadano"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }} transition={{ duration: reducedMotion ? 0 : 0.2 }}
        onMouseDown={e => e.stopPropagation()}>
        <div className="lvl-modal-toolbar"><span>PERFIL CIUDADANO</span><button type="button" ref={closeRef} onClick={onClose} aria-label="Cerrar perfil"><X size={19} /></button></div>
        {loading && <div className="lvl-modal-status" role="status">Cargando perfil…</div>}
        {!loading && error && <div className="lvl-modal-status">No ha sido posible cargar el perfil de este ciudadano. Comprueba los permisos de lectura de Supabase.</div>}
        {!loading && !error && profile && <div className="lvl-modal-content">
          <img className="lvl-modal-avatar" src={profile.avatar_url || DEFAULT_AVATAR} alt="" onError={imageFallback} />
          <h2>@{profile.username}</h2>
          <p className="lvl-modal-sub">Ciudadano del ecosistema paniense</p>
          {(profile.insta || profile.tiktok || profile.x_twitter) && <div className="lvl-socials">
            {profile.insta && <a href={`https://www.instagram.com/${normalizedHandle(profile.insta)}/`} target="_blank" rel="noopener noreferrer">Instagram <ArrowUpRight size={13} /></a>}
            {profile.tiktok && <a href={`https://www.tiktok.com/@${normalizedHandle(profile.tiktok)}`} target="_blank" rel="noopener noreferrer">TikTok <ArrowUpRight size={13} /></a>}
            {profile.x_twitter && <a href={`https://x.com/${normalizedHandle(profile.x_twitter)}`} target="_blank" rel="noopener noreferrer">X <ArrowUpRight size={13} /></a>}
          </div>}
          {(profile.cantante_favorito || profile.pokemon_favorito || profile.animal_favorito || profile.equipo_futbol) && <div className="lvl-favorites">
            <h3>Gustos del ciudadano</h3>
            {profile.cantante_favorito && <Favorite label="Cantante favorito" value={profile.cantante_favorito} image={profile.cantante_imagen} emoji="🎤" />}
            {profile.pokemon_favorito && <Favorite label="Pokémon favorito" value={profile.pokemon_favorito} image={pokemonSprite} emoji="⚡" />}
            {profile.animal_favorito && <Favorite label="Animal favorito" value={profile.animal_favorito} emoji={emojiFor(profile.animal_favorito)} />}
            {profile.equipo_futbol && <Favorite label="Equipo de fútbol" value={profile.equipo_futbol} image={teamBadge} emoji="⚽" />}
          </div>}
        </div>}
      </motion.section>
    </motion.div>}
  </AnimatePresence>;
}

export default function Level() {
  const reducedMotion = useReducedMotion();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(false);
    fetch("/api/leaderboard", { signal: controller.signal })
      .then(async r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((result: LeaderboardData) => {
        if (!controller.signal.aborted) {
          if (!result || !Array.isArray(result.rankingCompleto) || !Array.isArray(result.top5)) throw new Error("Datos inválidos");
          setData(result);
        }
      })
      .catch(err => { if (!controller.signal.aborted && err.name !== "AbortError") setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [retry]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase("es-ES");
    if (!data) return [];
    return !term ? data.rankingCompleto : data.rankingCompleto.filter(u => u.username.toLocaleLowerCase("es-ES").includes(term) || u.id.includes(term));
  }, [searchTerm, data]);
  const top3 = data?.top5.filter(u => [1, 2, 3].includes(u.posicion)) || [];
  const rest = data?.top5.filter(u => u.posicion > 3) || [];
  const openProfile = (id: string) => setSelectedUserId(id);
  const closeProfile = () => setSelectedUserId(null);
  const fade = { initial: reducedMotion ? false as const : { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: reducedMotion ? 0 : 0.35 } };

  return <div className="lvl-page min-h-screen flex flex-col">
    <style>{`
      .lvl-page{--lvl-primary:#630B57;--lvl-accent:#A6659D;--lvl-ink:#342439;--lvl-muted:#786879;--lvl-line:rgba(99,11,87,.12);background:radial-gradient(ellipse 65% 42% at 50% 0%,#f0ddec 0%,transparent 75%),linear-gradient(155deg,#fdf9fc,#f6edf5 65%,#fbf8fc);color:var(--lvl-ink);font-family:var(--body-font,Inter,system-ui,sans-serif);font-size-adjust:none;overflow-x:clip}
      .lvl-page *, .lvl-page *::before,.lvl-page *::after{box-sizing:border-box;font-size-adjust:none}
      .lvl-page h1,.lvl-page h2,.lvl-page h3,.lvl-page p{margin-top:0}
      .lvl-page h1,.lvl-page h2,.lvl-page h3{font-family:var(--body-font,Inter,system-ui,sans-serif);font-size-adjust:none;letter-spacing:-.045em}
      .lvl-page button,.lvl-page input{font-family:inherit}
      .lvl-page button{cursor:pointer}
      .lvl-shell{max-width:1200px;width:100%;padding-inline:clamp(15px,3.5vw,32px);margin-inline:auto}
      .lvl-glass{background:linear-gradient(137deg,rgba(255,255,255,.92),rgba(255,255,255,.59) 55%,rgba(248,231,246,.65));border:1px solid rgba(255,255,255,.92);box-shadow:inset 0 1px 0 #fff,0 18px 44px rgba(72,16,65,.075),0 2px 5px rgba(66,15,59,.045);-webkit-backdrop-filter:blur(24px) saturate(155%);backdrop-filter:blur(24px) saturate(155%)}
      .lvl-main{padding-block:clamp(30px,5vw,66px) clamp(65px,8vw,110px)}
      .lvl-hero{text-align:center;margin:0 auto 38px;max-width:750px}
      .lvl-eyebrow{display:inline-flex;align-items:center;gap:8px;text-transform:uppercase;letter-spacing:.14em;font-weight:800;font-size:10px;color:var(--lvl-primary);border-radius:50px;padding:9px 14px;background:#fff9;border:1px solid #fff}
      .lvl-hero h1{font-size:clamp(34px,5.4vw,67px);font-weight:850;line-height:1.08;letter-spacing:-.055em;margin:20px 0 12px;overflow-wrap:break-word}
      .lvl-hero h1 span{color:var(--lvl-primary)}
      .lvl-hero p{font-size:clamp(13px,1.5vw,16px);color:var(--lvl-muted);line-height:1.7;margin:0}
      .lvl-section-title{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;margin-bottom:16px}
      .lvl-section-title h2{font-size:clamp(20px,3vw,29px);line-height:1.2;font-weight:800;margin:0}
      .lvl-section-title p{font-size:12px;line-height:1.6;color:var(--lvl-muted);margin:0}
      .lvl-eyebrow-small{display:block;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#8c4582;font-weight:800;margin-bottom:7px}
      .lvl-highlights{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:28px}
      .lvl-highlight{width:100%;min-width:0;display:flex;align-items:center;text-align:left;gap:13px;padding:17px 19px;border-radius:22px;transition:transform .2s,border-color .2s}
      .lvl-highlight:hover,.lvl-rank-row:hover{transform:translateY(-2px);border-color:#c99dc3}
      .lvl-highlight-icon{height:40px;width:40px;display:grid;place-items:center;flex-shrink:0;border-radius:14px;background:#f5e4f0;color:var(--lvl-primary)}
      .lvl-highlight-detail{min-width:0;flex:1;display:grid;gap:3px}
      .lvl-highlight-detail span{text-transform:uppercase;font-size:9px;font-weight:800;letter-spacing:.1em;color:#97628e}
      .lvl-highlight-detail strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:15px;color:var(--lvl-ink)}
      .lvl-highlight-detail small{font-size:11px;color:var(--lvl-muted)}
      .lvl-avatar{width:44px;height:44px;object-fit:cover;border-radius:14px;flex-shrink:0;background:#efdce9;border:2px solid white}
      .lvl-highlight-arrow{color:#96508b;flex-shrink:0}
      .lvl-featured{border-radius:28px;overflow:hidden;margin-bottom:30px}
      .lvl-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px clamp(16px,3vw,28px);border-bottom:1px solid var(--lvl-line)}
      .lvl-card-head strong{display:flex;align-items:center;gap:9px;color:#632052;font-size:12px;letter-spacing:.09em;text-transform:uppercase}
      .lvl-card-head small{font-size:11px;color:var(--lvl-muted)}
      .lvl-podium{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:end;gap:clamp(5px,2vw,18px);max-width:800px;margin:0 auto;padding:25px clamp(7px,3vw,30px) 0}
      .lvl-podium-entry{min-width:0;background:none;border:0;padding:0;display:flex;flex-direction:column;align-items:center;transition:transform .2s;position:relative}
      .lvl-podium-entry:hover{transform:translateY(-4px)}
      .lvl-podium-user{width:100%;display:flex;flex-direction:column;align-items:center;min-width:0}
      .lvl-podium-user .lvl-avatar{width:clamp(48px,8vw,78px);height:clamp(48px,8vw,78px);border-radius:50%;border:3px solid #c99dc3;box-shadow:0 6px 18px #630B5719}
      .lvl-podium-1 .lvl-avatar{border-color:#d4a54d;width:clamp(58px,9vw,91px);height:clamp(58px,9vw,91px)}
      .lvl-podium-medal{display:grid;place-items:center;height:32px;color:#c99636;font-size:22px;margin-bottom:4px}
      .lvl-podium-user strong{display:block;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;font-size:clamp(11px,1.4vw,15px);margin-top:10px}
      .lvl-podium-user small{color:var(--lvl-muted);font-size:11px;margin:4px 0 13px}
      .lvl-podium-block{background:linear-gradient(155deg,#b17cab,#7c3a75);color:white;width:100%;min-height:100px;border-radius:20px 20px 0 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;border-top:3px solid #cdafd0}
      .lvl-podium-1 .lvl-podium-block{min-height:155px;background:linear-gradient(155deg,#8d317f,#630B57 75%);border-top-color:#e3bd69;box-shadow:0 5px 18px #630B5720}
      .lvl-podium-3 .lvl-podium-block{min-height:78px;background:linear-gradient(155deg,#b28aa6,#977391);border-top-color:#c99b70}
      .lvl-podium-block>span{font-size:clamp(27px,5vw,44px);font-weight:800;line-height:1}
      .lvl-podium-block small{font-size:10px;opacity:.8;white-space:nowrap}
      .lvl-rank-row{display:flex;align-items:center;gap:14px;text-align:left;padding:15px clamp(14px,3vw,28px);border-top:1px solid var(--lvl-line);width:100%;background:transparent;transition:background .2s,transform .2s,border-color .2s}
      .lvl-rank-row:hover{background:#fff9}
      .lvl-rank-pos{font-size:18px;font-weight:850;color:var(--lvl-primary);width:29px;flex-shrink:0}
      .lvl-rank-name{flex:1;min-width:0}
      .lvl-rank-name strong{font-size:13px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .lvl-rank-stats{min-width:74px;text-align:right;color:var(--lvl-muted);font-size:11px}
      .lvl-rank-stats strong{color:var(--lvl-primary);display:block;font-size:12px}
      .lvl-xp-line{display:flex;align-items:center;gap:7px;margin-top:6px;max-width:225px}
      .lvl-xp-track{height:5px;background:#e9d7e6;border-radius:99px;overflow:hidden;flex:1}
      .lvl-xp-track>div{height:100%;background:linear-gradient(90deg,#b87fb0,#630B57);border-radius:99px}
      .lvl-xp-line span{font-size:10px;color:#906d8a;flex-shrink:0}
      .lvl-table-box{border-radius:28px;overflow:hidden}
      .lvl-table-toolbar{padding:19px clamp(15px,3vw,26px);border-bottom:1px solid var(--lvl-line);display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
      .lvl-table-toolbar h2{font-size:18px;font-weight:800;margin:0 0 5px}
      .lvl-table-toolbar p{color:var(--lvl-muted);font-size:11px;margin:0}
      .lvl-search{display:flex;align-items:center;gap:9px;border:1px solid rgba(99,11,87,.16);background:#fff9;border-radius:15px;padding:0 11px;color:#8c5483;min-height:42px;width:min(100%,285px)}
      .lvl-search:focus-within{outline:2px solid #b77aaf;outline-offset:1px}
      .lvl-search input{border:0;outline:none;background:transparent;min-width:0;flex:1;color:#3d2b3a;font-size:12px;width:100%}
      .lvl-search button{border:none;background:none;color:#815178;display:grid;place-items:center;padding:4px}
      .lvl-table{border-collapse:collapse;width:100%;font-size:13px}
      .lvl-table th{background:#f7edf5a9;text-align:right;text-transform:uppercase;font-size:10px;color:#8c7187;letter-spacing:.12em;font-weight:750;padding:15px 19px;white-space:nowrap}
      .lvl-table th:nth-child(2){text-align:left}.lvl-table th:first-child{text-align:center}
      .lvl-table td{padding:13px 19px;border-top:1px solid var(--lvl-line);text-align:right;vertical-align:middle}
      .lvl-table td:first-child{text-align:center;font-weight:800;color:#863278}
      .lvl-table td:nth-child(2){text-align:left}
      .lvl-table tbody tr{transition:background .2s;cursor:pointer}
      .lvl-table tbody tr:hover{background:#fff8}
      .lvl-table tbody tr:focus-visible{outline:3px solid #b477ac;outline-offset:-3px}
      .lvl-table-user{display:flex;gap:10px;align-items:center;min-width:0}
      .lvl-table-user .lvl-avatar{width:39px;height:39px;border-radius:12px}
      .lvl-table-user>span{display:block;min-width:0;flex:1}
      .lvl-table-user strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--lvl-ink);font-size:13px}
      .lvl-tag{display:inline-flex;align-items:center;justify-content:center;border-radius:99px;background:#f5e2f0;border:1px solid #eed2e6;color:#6d185f;padding:5px 9px;font-size:11px;font-weight:750;white-space:nowrap}
      .lvl-table-bottom{padding:13px 24px;border-top:1px solid var(--lvl-line);color:var(--lvl-muted);font-size:11px}
      .lvl-empty{padding:45px 18px;text-align:center;color:var(--lvl-muted);font-size:13px;line-height:1.65}
      .lvl-error{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;padding:60px 16px;max-width:520px;margin:auto}
      .lvl-error h2{margin:0;font-size:24px;line-height:1.15}
      .lvl-error p{font-size:14px;line-height:1.6;color:var(--lvl-muted)}
      .lvl-primary-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:44px;border-radius:15px;padding:10px 18px;color:white;background:#630B57;font-size:12px;font-weight:800;border:1px solid #630B57;box-shadow:0 7px 18px #630B5722}
      .lvl-primary-btn:hover{background:#802073}
      .lvl-modal-backdrop{position:fixed;inset:0;z-index:1000;display:flex;justify-content:center;align-items:center;background:rgba(24,10,25,.58);backdrop-filter:blur(13px);padding:16px}
      .lvl-modal{position:relative;width:min(100%,490px);max-height:min(90dvh,760px);overflow-y:auto;border-radius:28px;box-shadow:0 28px 85px #210d2860}
      .lvl-modal-toolbar{display:flex;justify-content:space-between;align-items:center;padding:19px 22px;border-bottom:1px solid var(--lvl-line);font-size:10px;font-weight:800;letter-spacing:.15em;color:#945e8b}
      .lvl-modal-toolbar button{width:37px;height:37px;display:grid;place-items:center;border:1px solid #e9d3e3;background:#fff9;border-radius:13px;color:#630B57}
      .lvl-modal-content{display:flex;flex-direction:column;align-items:center;padding:29px clamp(17px,4vw,30px) 32px}
      .lvl-modal-avatar{width:95px;height:95px;border:4px solid white;box-shadow:0 0 0 2px #bd92b8,0 8px 20px #630B5717;border-radius:30px;object-fit:cover}
      .lvl-modal-content h2{font-size:clamp(20px,5vw,27px);font-weight:850;line-height:1.2;margin:17px 0 5px;max-width:100%;overflow-wrap:anywhere;color:#4c1945}
      .lvl-modal-sub{font-size:12px;color:var(--lvl-muted);text-align:center;margin:0}
      .lvl-socials{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:18px}
      .lvl-socials a{display:inline-flex;gap:6px;align-items:center;color:#630B57;font-size:11px;font-weight:800;padding:8px 12px;border-radius:99px;background:#f4e3ef;border:1px solid #e9d4e5}
      .lvl-socials a:hover{background:#ecd0e7}
      .lvl-favorites{width:100%;display:flex;flex-direction:column;gap:9px;margin-top:24px}
      .lvl-favorites h3{text-align:left;text-transform:uppercase;font-size:10px;letter-spacing:.13em;color:#8e5584;font-weight:850;margin-bottom:3px}
      .lvl-favorite{display:flex;gap:12px;align-items:center;padding:11px 13px;border:1px solid #ead8e6;background:#fff9;border-radius:15px;min-width:0}
      .lvl-favorite img,.lvl-favorite>span{width:36px;height:36px;object-fit:contain;flex-shrink:0;display:grid;place-items:center;font-size:24px}
      .lvl-favorite>div{min-width:0}.lvl-favorite small{display:block;text-transform:uppercase;color:#9b7994;font-size:9px;letter-spacing:.08em}.lvl-favorite strong{display:block;font-size:13px;margin-top:3px;overflow-wrap:anywhere}
      .lvl-modal-status{padding:56px 30px;text-align:center;color:#76596f;font-size:13px;line-height:1.7}
      .lvl-shimmer{background:linear-gradient(110deg,#f3e6f0,#fff9,#f3e6f0);background-size:220% 100%;border-radius:12px;animation:lvlShimmer 1.4s linear infinite}
      .lvl-skeleton-wrap{padding:25px 0}.lvl-skeleton-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.lvl-skeleton-card{min-height:220px;border-radius:23px;display:flex;flex-direction:column;align-items:center;gap:16px;justify-content:center;padding:20px}
      .lvl-skeleton-table{margin-top:22px;border-radius:23px;padding:22px;display:grid;gap:12px}
      @keyframes lvlShimmer{to{background-position-x:-220%}}
      @media(max-width:760px){.lvl-section-title{align-items:start;flex-direction:column;gap:6px}.lvl-highlights{grid-template-columns:1fr}.lvl-table thead{display:none}.lvl-table,.lvl-table tbody,.lvl-table tr,.lvl-table td{display:block;width:100%}.lvl-table tbody{padding:7px 12px 14px}.lvl-table tbody tr{background:#fff9;border:1px solid #eadce7;border-radius:17px;margin:9px 0;padding:13px;display:grid;grid-template-columns:27px minmax(0,1fr) auto;align-items:center;gap:8px 9px}.lvl-table td{padding:0!important;border:none!important}.lvl-table td:first-child{grid-column:1;grid-row:1;text-align:center}.lvl-table td:nth-child(2){grid-column:2;grid-row:1}.lvl-table td:nth-child(3){grid-column:3;grid-row:1}.lvl-table td:nth-child(4){grid-column:1/3;grid-row:2;text-align:left;padding-top:8px!important;border-top:1px dashed #eedfeb!important;color:#766175}.lvl-table td:nth-child(5){grid-column:3;grid-row:2;text-align:right;padding-top:8px!important;border-top:1px dashed #eedfeb!important;font-weight:800}.lvl-table td:nth-child(4)::before{content:'Mensajes · ';color:#aa85a2}.lvl-table-user .lvl-xp-line{max-width:160px}.lvl-table-bottom{padding:12px 18px}}
      @media(max-width:520px){.lvl-main{padding-top:25px}.lvl-hero{margin-bottom:24px}.lvl-hero h1{font-size:clamp(32px,10vw,44px)}.lvl-highlight{padding:13px;gap:10px}.lvl-highlight .lvl-avatar{width:40px;height:40px}.lvl-highlight-icon{width:36px;height:36px}.lvl-podium{gap:5px;padding:20px 9px 0}.lvl-podium-block{min-height:82px;border-radius:13px 13px 0 0}.lvl-podium-1 .lvl-podium-block{min-height:123px}.lvl-podium-3 .lvl-podium-block{min-height:65px}.lvl-podium-block small{font-size:9px}.lvl-podium-user small{font-size:10px}.lvl-card-head{padding:16px}.lvl-card-head small{display:none}.lvl-rank-row{padding:13px}.lvl-rank-pos{width:22px}.lvl-table-toolbar{align-items:stretch}.lvl-search{width:100%}.lvl-modal{border-radius:22px}}
      @media(max-width:360px){.lvl-highlight-arrow{display:none}.lvl-highlight-detail strong{font-size:13px}.lvl-podium-block small{font-size:8px}.lvl-podium-user strong{font-size:10px}.lvl-rank-stats{min-width:60px}}
      @media(prefers-reduced-motion:reduce){.lvl-page *, .lvl-page *::before,.lvl-page *::after{transition-duration:.01ms!important;animation-duration:.01ms!important}}
    `}</style>
    <Header />
    <main className="lvl-main flex-1"><div className="lvl-shell">
      <motion.div {...fade} className="lvl-hero">
        <span className="lvl-eyebrow"><Sparkles size={14} aria-hidden="true" /> Ciudadanía digital · Artis Panis</span>
        <h1>Tabla de <span>clasificación.</span></h1>
        <p>La actividad que mueve el Estado Paniense. Descubre el podio, consulta los niveles y conoce a los ciudadanos más participativos.</p>
      </motion.div>
      <AnimatePresence mode="wait">
        {loading && <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LoadingSkeleton /></motion.div>}
        {!loading && error && <motion.div key="error" {...fade} className="lvl-error lvl-glass" style={{ borderRadius: 25 }} role="alert">
          <Trophy size={36} color="#630B57" aria-hidden="true" />
          <h2>El heraldo no responde</h2>
          <p>Ahora mismo no podemos obtener el ranking. Comprueba la conexión con el servidor e inténtalo otra vez.</p>
          <button className="lvl-primary-btn" onClick={() => setRetry(v => v + 1)}><RefreshCw size={16} /> Reintentar</button>
        </motion.div>}
        {!loading && !error && data && <motion.div key="ranking" {...fade}>
          {(data.destacados?.masMensajes || data.destacados?.menosMensajes) && <div className="lvl-highlights">
            {data.destacados.masMensajes && <HighlightCard user={data.destacados.masMensajes} label="El más charlatán" icon="top" onUser={openProfile} />}
            {data.destacados.menosMensajes && <HighlightCard user={data.destacados.menosMensajes} label="El más reservado" icon="quiet" onUser={openProfile} />}
          </div>}
          <section aria-labelledby="lvl-elite-title" className="lvl-featured lvl-glass">
            <div className="lvl-card-head"><strong id="lvl-elite-title"><Trophy size={18} /> Élite del Estado Paniense · Top 5</strong><small>Clasificación oficial de XP</small></div>
            {top3.length > 0 && <Podium top3={top3} onUser={openProfile} />}
            {rest.map(user => <button className="lvl-rank-row" type="button" key={user.id} onClick={() => openProfile(user.id)}>
              <span className="lvl-rank-pos">{user.posicion.toString().padStart(2, "0")}</span>
              <Avatar user={user} /><div className="lvl-rank-name"><strong title={user.username}>@{user.username}</strong><XPBar xp={user.xp} /></div>
              <div className="lvl-rank-stats"><strong>Nv. {user.level}</strong>{formatNumber(user.total_xp)} XP</div>
              <ChevronRight size={17} color="#86527c" aria-hidden="true" />
            </button>)}
            {data.top5.length === 0 && <div className="lvl-empty">Todavía no hay ciudadanos clasificados.</div>}
          </section>
          <section className="lvl-table-box lvl-glass" aria-labelledby="lvl-list-title">
            <div className="lvl-table-toolbar"><div><span className="lvl-eyebrow-small">Registro general de ciudadanos</span><h2 id="lvl-list-title">Clasificación completa</h2><p>{formatNumber(data.rankingCompleto.length)} ciudadanos registrados en el ranking</p></div>
              <label className="lvl-search"><Search size={17} aria-hidden="true" /><input type="search" aria-label="Buscar por nombre o ID" placeholder="Buscar ciudadano o ID…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />{searchTerm && <button type="button" onClick={() => setSearchTerm("")} aria-label="Limpiar búsqueda"><X size={17}/></button>}</label>
            </div>
            <table className="lvl-table"><thead><tr><th scope="col">#</th><th scope="col">Ciudadano</th><th scope="col">Nivel</th><th scope="col">Mensajes</th><th scope="col">XP total</th></tr></thead><tbody>
              {filtered.map(user => <tr key={user.id} tabIndex={0} role="button" aria-label={`Abrir perfil de ${user.username}`} onClick={() => openProfile(user.id)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProfile(user.id); } }}>
                <td>{user.posicion}</td>
                <td><div className="lvl-table-user"><Avatar user={user} /><span><strong title={user.username}>@{user.username}</strong><XPBar xp={user.xp} /></span></div></td>
                <td><span className="lvl-tag">Nv. {user.level}</span></td>
                <td>{formatNumber(user.messages)}</td><td>{formatNumber(user.total_xp)} XP</td>
              </tr>)}
            </tbody></table>
            {filtered.length === 0 && <div className="lvl-empty">No se han encontrado ciudadanos{searchTerm ? ` para «${searchTerm}»` : ""}.</div>}
            <div className="lvl-table-bottom">Mostrando {formatNumber(filtered.length)} de {formatNumber(data.rankingCompleto.length)} ciudadanos · Selecciona un perfil para conocerlo</div>
          </section>
        </motion.div>}
      </AnimatePresence>
    </div></main>
    <Footer />
    <UserProfileModal userId={selectedUserId} onClose={closeProfile} />
  </div>;
}
