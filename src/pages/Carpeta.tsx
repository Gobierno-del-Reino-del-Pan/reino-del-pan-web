import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeftRight, BadgeCheck, Check, ChevronLeft, ChevronRight,
  Copy, Download, Eye, EyeOff, FileBadge2, Filter, ImagePlus, LockKeyhole,
  LogOut, RefreshCw, Search, ShieldCheck, Star, Users, Wallet,
  X, Zap, Database, ScrollText, Gem, Award,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Esta página usa /api/me (existente) y /api/citizen/* (router adjunto).
// Los cambios de propietario de un Pokémon NUNCA se hacen desde el navegador.

type DPIData = {
  dpi_number: string; nombre: string; apellidos: string; genero?: string;
  fecha_nac?: string; region?: string; issued_at?: string; valid_until?: string;
};
type Rol = {
  id: string; nombre: string; descripcion?: string; emoji?: string; imagen?: string | null;
  categoria?: string; discord_role_id: string;
};
type Matrimonio = { conyuge_id: string; conyuge_username: string; conyuge_avatar?: string; fecha_boda?: string };
type Hijo = { hijo_id: string; hijo_username: string; hijo_avatar?: string; tipo: "adoptivo" | "creado" };
type Profile = {
  cantante_favorito: string | null; cantante_imagen: string | null; animal_favorito: string | null;
  pokemon_favorito: string | null; equipo_futbol: string | null;
  insta: string | null; tiktok: string | null; x_twitter: string | null;
};
type Citizen = {
  id: string; username: string; avatar: string; inGuild: boolean; verificado: boolean;
  dpi: DPIData | null; roles: Rol[]; matrimonio: Matrimonio | null; hijos: Hijo[];
  level?: number; xp?: number; total_xp?: number; messages?: number;
  economy?: { cash: number; bank: number } | null; puntos_elo?: string | number | null;
};
type Acta = { numero: string; tipo: string; created_at: string | null; fecha: string | null };
type FamilyState = { matrimonio: Matrimonio | null; hijos: Hijo[]; actas: Acta[] };
type PokemonCatch = {
  id: number | null; pokemon_id: number; pokemon_name: string; level: number;
  is_shiny: boolean; ball_used: string; created_at: string | null;
};
type Tab = "identidad" | "familia" | "rotomi" | "roles";
const UNKNOWN_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";
const CATEGORY_TITLES: Record<string, string> = {
  profesiones: "💼 Profesiones", regiones: "🗺️ Regiones", estado_ciudadano: "🪪 Estado ciudadano",
  equipos: "🏟️ Equipos", especiales: "✨ Roles especiales", mafia: "🕶️ Registros de familia / mafia",
  servicios: "🛎️ Servicios", otros: "🏅 Otros roles",
};
const PETS: Array<{ words: string[]; emoji: string; label: string }> = [
  { words: ["perro", "dog", "can"], emoji: "🐕", label: "Perrito" },
  { words: ["gato", "cat", "felino"], emoji: "🐈", label: "Gatito" },
  { words: ["conejo"], emoji: "🐇", label: "Conejito" },
  { words: ["zorro"], emoji: "🦊", label: "Zorro" },
  { words: ["panda"], emoji: "🐼", label: "Panda" },
  { words: ["lobo"], emoji: "🐺", label: "Lobo" },
  { words: ["leon", "león"], emoji: "🦁", label: "León" },
  { words: ["tigre"], emoji: "🐅", label: "Tigre" },
  { words: ["oso"], emoji: "🐻", label: "Oso" },
  { words: ["caballo"], emoji: "🐎", label: "Caballo" },
  { words: ["mariposa"], emoji: "🦋", label: "Mariposa" },
  { words: ["delfin", "delfín"], emoji: "🐬", label: "Delfín" },
  { words: ["tortuga"], emoji: "🐢", label: "Tortuga" },
  { words: ["pinguino", "pingüino"], emoji: "🐧", label: "Pingüino" },
  { words: ["hamster", "hámster"], emoji: "🐹", label: "Hámster" },
  { words: ["ajolote", "axolotl"], emoji: "🦎", label: "Ajolote" },
  { words: ["abeja"], emoji: "🐝", label: "Abeja" },
  { words: ["elefante"], emoji: "🐘", label: "Elefante" },
  { words: ["serpiente"], emoji: "🐍", label: "Serpiente" },
  { words: ["vaca"], emoji: "🐄", label: "Vaca" },
  { words: ["dragon", "dragón"], emoji: "🐉", label: "Dragón" },
];
function petEmoji(name: string) {
  const normal = name.toLocaleLowerCase("es").trim();
  return PETS.find(p => p.words.some(word => normal.includes(word)))?.emoji || "🐾";
}
function safeImageUrl(input: string | null | undefined) {
  if (!input) return null;
  if (input.startsWith("/")) return input.startsWith("//") ? null : input;
  try {
    const url = new URL(input);
    // Los adjuntos efímeros de Discord caducan: no intentar cargar URLs rotas.
    if (url.hostname === "cdn.discordapp.com" && url.pathname.startsWith("/ephemeral-attachments/")) return null;
    return url.protocol === "https:" ? url.toString() : null;
  } catch { return null; }
}
function AvatarImage({ src, alt, className = "" }: { src?: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  return <img className={className} src={!failed ? (safeImageUrl(src) || UNKNOWN_AVATAR) : UNKNOWN_AVATAR}
    alt={alt} onError={e => { if (!failed) setFailed(true); else e.currentTarget.style.opacity = "0.35"; }} />;
}
function SingerImage({ src, alt, className = "cp-singer" }: { src?: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const url = safeImageUrl(src);
  return url && !failed ? <img className={className} src={url} alt={alt} onError={() => setFailed(true)} />
    : <div className={`${className} cp-singer-placeholder`} role="img" aria-label={alt}>🎤</div>;
}
function fmtDate(input?: string | null) {
  if (!input) return "No consta";
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? input : new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}
function fmtNum(value?: number | null) { return new Intl.NumberFormat("es-ES").format(value || 0); }
function pbValue(input?: number | string | null) { return Number(String(input ?? "0").split(",")[0]) || 0; }
function maskDpi(value: string) { return value.length < 5 ? "••••" : `${"•".repeat(Math.min(9, value.length - 4))}${value.slice(-4)}`; }
async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, credentials: "same-origin", headers: { ...(options?.body ? { "Content-Type": "application/json" } : {}), ...options?.headers }, cache: "no-store" });
  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof json?.error === "string" ? json.error : `Error HTTP ${response.status}`);
  return json as T;
}
function RoleBadge({ role, compact = false }: { role: Rol; compact?: boolean }) {
  const discordEmoji = role.emoji?.match(/^<a?:\w+:(\d+)>$/);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [role.emoji, role.imagen]);
  const iconUrl = imageFailed ? null : discordEmoji ? `https://cdn.discordapp.com/emojis/${discordEmoji[1]}.png` : safeImageUrl(role.imagen);
  const fallback = role.categoria === "equipos" ? "⚽" : role.categoria === "especiales" ? "✨" : "🎖️";
  return (
    <span className={`cp-role ${compact ? "cp-role-small" : ""}`} title={role.descripcion || role.nombre}>
      {iconUrl ? <img src={iconUrl} alt="" loading="lazy" onError={() => setImageFailed(true)} />
        : <span aria-hidden="true">{role.emoji && !discordEmoji ? role.emoji : fallback}</span>}
      <span>{role.nombre}</span>
    </span>
  );
}
const pokemonArtCache = new Map<string, string>();
function PokemonArt({ id, shiny, label, size = "large" }: { id: number; shiny: boolean; label: string; size?: "large" | "small" }) {
  const cacheKey = `${id}-${shiny}`;
  const [source, setSource] = useState<string | null>(() => pokemonArtCache.get(cacheKey) || null);
  useEffect(() => {
    setSource(pokemonArtCache.get(cacheKey) || null);
    if (!id || pokemonArtCache.has(cacheKey)) return;
    const controller = new AbortController();
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error("PokéAPI"); return r.json(); })
      .then(data => {
        const s = data?.sprites;
        const image = (shiny ? s?.other?.["official-artwork"]?.front_shiny || s?.front_shiny : s?.other?.["official-artwork"]?.front_default || s?.other?.home?.front_default || s?.front_default) as string | undefined;
        if (image && !controller.signal.aborted) { pokemonArtCache.set(cacheKey, image); setSource(image); }
      }).catch(() => {});
    return () => controller.abort();
  }, [id, shiny, cacheKey]);
  return <img loading="lazy" className={`cp-pokemon-art ${size === "small" ? "cp-pokemon-small" : ""}`}
    src={source || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shiny ? "shiny/" : ""}${id}.png`}
    alt={label} onError={e => { e.currentTarget.style.opacity = "0.2"; }} />;
}
function FavoritePokemon({ name }: { name: string }) {
  const [info, setInfo] = useState<{ id: number; shiny: boolean } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    setInfo(null);
    const key = name.trim().toLowerCase().replace(/\s+/g, "-");
    fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(key)}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error("Sin Pokémon"); return r.json(); })
      .then(data => { if (!controller.signal.aborted) setInfo({ id: data.id, shiny: false }); }).catch(() => {});
    return () => controller.abort();
  }, [name]);
  return <span className="cp-favorite-poke">{info ? <PokemonArt id={info.id} shiny={false} label={name} size="small" /> : "⚡"}<span>{name}</span></span>;
}
function Panel({ title, eyebrow, children, action, className = "" }: { title: string; eyebrow?: string; children: ReactNode; action?: React.ReactNode; className?: string }) {
  return <section className={`cp-glass cp-panel ${className}`}>
    <header className="cp-panel-header"><div>{eyebrow && <p className="cp-eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action}</header>
    {children}
  </section>;
}
export default function Carpeta() {
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("identidad");
  const [dpiVisible, setDpiVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [family, setFamily] = useState<FamilyState>({ matrimonio: null, hijos: [], actas: [] });
  const [familyLoading, setFamilyLoading] = useState(false);
  const [familyError, setFamilyError] = useState("");
  const [certBusy, setCertBusy] = useState<string | null>(null);
  const [captures, setCaptures] = useState<PokemonCatch[]>([]);
  const [pcLoading, setPcLoading] = useState(false);
  const [pcError, setPcError] = useState("");
  const [search, setSearch] = useState("");
  const [onlyShiny, setOnlyShiny] = useState(false);
  const [page, setPage] = useState(0);
  const [transfer, setTransfer] = useState<PokemonCatch | null>(null);
  const [recipient, setRecipient] = useState("");
  const [recipientVerified, setRecipientVerified] = useState<{ id: string; username: string; avatar: string } | null>(null);
  const [recipientChecking, setRecipientChecking] = useState(false);
  const [transferBusy, setTransferBusy] = useState(false);
  const [transferMessage, setTransferMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ cantante_favorito: "", cantante_imagen: "", animal_favorito: "" });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    let alive = true;
    api<{ user: Citizen }>("/api/me").then(async data => {
      if (!alive) return;
      if (!data?.user?.id) throw new Error("No se ha encontrado tu sesión.");
      setCitizen(data.user);
      // Consulta económica mediante la sesión del propio servidor: sin problemas de RLS del navegador.
      try {
        const result = await api<{ economy: { cash: number; bank: number } | null; puntos_elo: number | string | null }>("/api/citizen/economy");
        if (alive) setCitizen(previous => previous?.id === data.user.id ? {
          ...previous, economy: result.economy, puntos_elo: result.puntos_elo,
        } : previous);
      } catch (err) { if (alive) console.warn("Economía:", err); }
      // El perfil adicional se recupera a través del mismo backend autenticado.
      try {
        const d = await api<{ profile: Profile | null }>("/api/citizen/profile");
        if (alive && d.profile) {
          setProfile(d.profile);
          setForm({ cantante_favorito: d.profile.cantante_favorito || "", cantante_imagen: d.profile.cantante_imagen || "", animal_favorito: d.profile.animal_favorito || "" });
        }
      } catch (e) { if (alive) console.warn("Perfil ampliado:", e); }
    }).catch(e => { if (alive) { setError(e.message); } }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  async function refreshFamily() {
    setFamilyLoading(true); setFamilyError("");
    try { setFamily(await api<FamilyState>("/api/citizen/registry")); }
    catch (e) { setFamilyError(e instanceof Error ? e.message : "No se pudo consultar el Registro Civil."); }
    finally { setFamilyLoading(false); }
  }
  async function refreshPc() {
    setPcLoading(true); setPcError("");
    try { const result = await api<{ captures: PokemonCatch[] }>("/api/citizen/pokemon"); setCaptures(result.captures || []); }
    catch (e) { setPcError(e instanceof Error ? e.message : "Rotomi no está disponible."); }
    finally { setPcLoading(false); }
  }
  useEffect(() => { if (citizen?.dpi && tab === "familia") void refreshFamily(); }, [tab, citizen?.id]);
  useEffect(() => { if (citizen?.dpi && tab === "rotomi") void refreshPc(); }, [tab, citizen?.id]);
  const roles = citizen?.roles || [];
  const featuredRoles = roles.filter(r => ["equipos", "especiales"].includes(r.categoria || ""));
  const groupedRoles = useMemo(() => roles.reduce<Record<string, Rol[]>>((acc, r) => {
    const category = r.categoria || "otros";
    (acc[category] ||= []).push(r);
    return acc;
  }, {}), [roles]);
  const filtered = useMemo(() => captures.filter(c => (!onlyShiny || c.is_shiny) &&
    (!search.trim() || `${c.pokemon_name} ${c.pokemon_id}`.toLowerCase().includes(search.trim().toLowerCase()))), [captures, search, onlyShiny]);
  const perPage = 12;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice(Math.min(page, totalPages - 1) * perPage, (Math.min(page, totalPages - 1) + 1) * perPage);
  const tabList: Array<{ key: Tab; label: string; icon: typeof ShieldCheck }> = [
    { key: "identidad", label: "Mi identidad", icon: BadgeCheck },
    { key: "familia", label: "Registro Civil", icon: Users },
    { key: "rotomi", label: "Rotomi PC", icon: Database },
    { key: "roles", label: "Mis roles", icon: Award },
  ];

  async function downloadCertificate(acta: Acta) {
    setCertBusy(acta.numero); setFamilyError("");
    try {
      const response = await fetch(`/api/citizen/certificates/${encodeURIComponent(acta.numero)}`, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) {
        const e = await response.json().catch(() => ({}));
        throw new Error(response.status === 404 && !e.error
          ? "No se encontró la función PDF en Vercel. Revisa api/registro_certificado.py y las rutas de vercel.json."
          : e.error || `Error HTTP ${response.status}`);
      }
      const blob = await response.blob();
      if (blob.type !== "application/pdf") throw new Error("El servidor no devolvió un PDF.");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `RegistroCivil_${acta.tipo}_${acta.numero}.pdf`; a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (e) { setFamilyError(e instanceof Error ? e.message : "No se pudo generar el certificado."); }
    finally { setCertBusy(null); }
  }
  async function saveProfile() {
    setSaveMessage("");
    if (/cdn\.discordapp\.com\/ephemeral-attachments\//i.test(form.cantante_imagen)) {
      setSaveMessage("Las imágenes temporales de Discord caducan. Usa una URL de imagen permanente."); return;
    }
    if (form.cantante_imagen && !safeImageUrl(form.cantante_imagen)) { setSaveMessage("La imagen debe ser una URL HTTPS válida."); return; }
    setSaving(true);
    try {
      const result = await api<{ profile: Profile }>("/api/citizen/profile", { method: "PATCH", body: JSON.stringify(form) });
      setProfile(result.profile); setEditing(false); setSaveMessage("¡Perfil actualizado!");
    } catch (e) { setSaveMessage(e instanceof Error ? e.message : "No se pudo guardar."); }
    finally { setSaving(false); }
  }
  async function verifyRecipient() {
    const id = recipient.trim();
    setRecipientVerified(null);
    setTransferMessage("");
    if (!/^[0-9]{15,22}$/.test(id) || id === citizen?.id) {
      setTransferMessage("Introduce el ID de Discord de otra persona."); return;
    }
    setRecipientChecking(true);
    try {
      const response = await api<{ recipient: { id: string; username: string; avatar: string } }>(`/api/citizen/pokemon/recipient/${id}`);
      if (response.recipient.id === id) setRecipientVerified(response.recipient);
    } catch (e) { setTransferMessage(e instanceof Error ? e.message : "No se pudo verificar el destinatario."); }
    finally { setRecipientChecking(false); }
  }
  async function transferPokemon() {
    if (!transfer || !recipientVerified || recipientVerified.id !== recipient.trim() || !/^[0-9]{15,22}$/.test(recipient.trim()) || recipient.trim() === citizen?.id) {
      setTransferMessage("Introduce el ID de Discord válido de otro ciudadano."); return;
    }
    setTransferBusy(true); setTransferMessage("");
    try {
      await api("/api/citizen/pokemon/transfer", { method: "POST", body: JSON.stringify({ captureId: transfer.id, recipientId: recipient.trim() }) });
      setTransfer(null); setRecipient(""); setRecipientVerified(null); setTransferMessage("¡Transferencia completada! Rotomi ya está actualizado.");
      await refreshPc();
    } catch (e) { setTransferMessage(e instanceof Error ? e.message : "No se pudo transferir el Pokémon."); }
    finally { setTransferBusy(false); }
  }

  return <div className="cp-page">
    <style>{`
      .cp-page{--cp-purple:#79356d;--cp-ink:#2e2332;--cp-border:rgba(255,255,255,.76);--cp-mute:#756c7a;color:var(--cp-ink);background:radial-gradient(ellipse at 85% 1%,#e5d1f7 0%,transparent 32%),radial-gradient(ellipse at 0% 52%,#f3d5e8 0%,transparent 32%),linear-gradient(160deg,#f9f5ff,#f7edf5 70%,#eae0f1);min-height:100vh;overflow-x:clip}
      .cp-main{width:min(1240px,100%);margin:auto;padding:35px clamp(16px,3vw,32px) 90px}
      .cp-glass{position:relative;isolation:isolate;border:1px solid var(--cp-border);background:linear-gradient(137deg,rgba(255,255,255,.82) 0%,rgba(255,255,255,.46) 44%,rgba(255,255,255,.35) 100%);box-shadow:inset 0 1px rgba(255,255,255,.98),inset 1px 0 rgba(255,255,255,.46),0 16px 45px rgba(70,33,79,.085),0 2px 8px rgba(70,33,79,.06);backdrop-filter:blur(23px) saturate(155%);-webkit-backdrop-filter:blur(23px) saturate(155%);border-radius:27px}
      .cp-glass::before{content:"";position:absolute;inset:0 0 auto 0;height:48%;pointer-events:none;z-index:-1;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.28),transparent)}
      .cp-hero{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(260px,.7fr);gap:28px;align-items:center;padding:clamp(25px,4vw,43px);overflow:hidden}
      .cp-hero::after{content:"";pointer-events:none;position:absolute;right:-70px;top:-100px;height:370px;width:370px;border-radius:50%;background:linear-gradient(140deg,rgba(229,179,230,.6),rgba(255,255,255,.15));filter:blur(7px);z-index:-1}
      .cp-eyebrow{text-transform:uppercase;letter-spacing:.21em;font-size:10px;font-weight:850;color:#8a5687}
      .cp-title{font-size:clamp(30px,4.6vw,51px);font-weight:880;letter-spacing:-.057em;line-height:1.08;margin:10px 0;color:#35223c}
      .cp-sub{color:var(--cp-mute);font-size:13px;line-height:1.7}
      .cp-avatar{width:78px;height:78px;object-fit:cover;border:4px solid rgba(255,255,255,.9);box-shadow:0 8px 23px #6b376228;border-radius:24px;flex-shrink:0}
      .cp-person{display:flex;gap:19px;align-items:center;margin-top:25px}
      .cp-name{font-size:clamp(20px,2.8vw,29px);font-weight:850;letter-spacing:-.04em}
      .cp-role-list{display:flex;flex-wrap:wrap;gap:7px;margin-top:18px}
      .cp-role{display:inline-flex;gap:7px;align-items:center;max-width:100%;border:1px solid rgba(143,90,141,.2);border-radius:999px;background:rgba(255,255,255,.56);padding:8px 11px;font-size:12px;font-weight:740;box-shadow:inset 0 1px #fff;line-height:1.4}
      .cp-role img{width:20px;height:20px;object-fit:contain}.cp-role-small{font-size:11px;padding:6px 9px}
      .cp-hero-side{display:grid;gap:13px}.cp-id-chip{padding:18px 19px;background:rgba(54,26,60,.88);border:1px solid #ffffff37;border-radius:20px;color:#fff;box-shadow:0 10px 26px #36173a30;position:relative;overflow:hidden}
      .cp-id-chip::after{content:"";position:absolute;width:200px;height:200px;border-radius:50%;background:#b679ac30;right:-80px;top:-115px;pointer-events:none}
      .cp-chip-label{display:flex;align-items:center;gap:8px;font-size:10px;letter-spacing:.17em;color:#f2d3ef;text-transform:uppercase;font-weight:800}
      .cp-chip-number{font-size:25px;letter-spacing:.09em;font-weight:850;font-variant-numeric:tabular-nums;margin-top:15px;word-break:break-word}
      .cp-chip-bottom{display:flex;gap:10px;justify-content:space-between;align-items:center;margin-top:13px;font-size:11px;color:#e0c6e1}
      .cp-icon-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;border-radius:11px;padding:9px;border:1px solid #ffffff54;background:#ffffff20;color:inherit;transition:background .2s}
      .cp-icon-btn:hover{background:#ffffff45}.cp-icon-btn:focus-visible,.cp-btn:focus-visible,.cp-tab:focus-visible{outline:3px solid #b362a3;outline-offset:3px}
      .cp-mini-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .cp-mini{padding:15px;border:1px solid #ffffffbb;background:#ffffff8f;border-radius:17px}.cp-mini small{display:block;color:#836d83;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.cp-mini strong{display:block;margin-top:6px;font-size:21px;color:#462448;font-weight:850}
      .cp-tabs{display:flex;gap:9px;overflow-x:auto;scrollbar-width:thin;margin:22px 0;padding:5px}.cp-tab{white-space:nowrap;display:flex;align-items:center;gap:8px;border:1px solid rgba(112,59,107,.16);border-radius:15px;padding:12px 17px;background:#ffffff8a;color:#5b4a60;font-weight:780;font-size:12px;cursor:pointer;transition:.2s}
      .cp-tab[data-active="true"]{background:#60305f;color:white;border-color:#60305f;box-shadow:0 7px 17px #51264a3b}
      .cp-content{display:grid;gap:19px;min-width:0}.cp-panel{padding:clamp(20px,3vw,29px);min-width:0}.cp-panel-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:22px}.cp-panel h2{font-weight:850;letter-spacing:-.04em;font-size:clamp(22px,3vw,29px);margin:5px 0}
      .cp-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.cp-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}
      .cp-fact{padding:14px;border:1px solid #d2bad033;background:#ffffff63;border-radius:16px;min-width:0}.cp-fact small{display:block;color:#7e7180;font-size:10px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}.cp-fact strong{display:block;font-size:14px;margin-top:8px;word-wrap:break-word}
      .cp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:13px;padding:11px 15px;background:#633261;color:#fff;font-weight:800;font-size:12px;border:1px solid #633261;cursor:pointer;transition:transform .2s,opacity .2s}.cp-btn:hover{transform:translateY(-1px)}.cp-btn:disabled{opacity:.45;cursor:not-allowed;transform:none}.cp-btn-light{background:#ffffffa6;color:#643563;border:1px solid #be9ab7}.cp-btn-red{background:#9e3a54;border-color:#9e3a54}
      .cp-notice{font-size:13px;line-height:1.65;border-radius:15px;padding:13px 16px;background:rgba(109,57,111,.075);border:1px solid rgba(109,57,111,.13);color:#644866}.cp-danger{background:#ffe8ee;color:#9a3450;border-color:#eeb2c4}
      .cp-personal{display:grid;grid-template-columns:180px 1fr;gap:19px;align-items:center}.cp-singer{width:100%;aspect-ratio:1;object-fit:cover;border-radius:23px;border:2px solid #fff;box-shadow:0 14px 30px #643c7422;background:#dec8df}
      .cp-input{width:100%;padding:12px 13px;font-size:13px;border-radius:13px;border:1px solid #d1b7cf;background:#ffffffc9;color:#2d2634;outline-offset:2px}.cp-input:focus{outline:2px solid #ac74ac}.cp-label{display:block;margin-bottom:7px;color:#69576b;font-size:11px;font-weight:800}.cp-form{display:grid;gap:15px}
      .cp-pet-area{min-height:120px;position:relative;border-radius:18px;overflow:hidden;background:linear-gradient(180deg,#e2ddf9,#fcf7ff 66%,#d5eecf 67%);border:1px solid #c9b9d9;padding:14px}.cp-pet-walker{font-size:52px;position:absolute;bottom:19px;left:0;animation:cpWalk 11s ease-in-out infinite;filter:drop-shadow(0 8px 5px #251a2922);transform-origin:bottom center}.cp-pet-name{position:relative;z-index:2;font-size:11px;color:#4a405b;font-weight:850;text-transform:capitalize;background:#ffffffad;border-radius:30px;padding:6px 10px;display:inline-flex}
      @keyframes cpWalk{0%{left:5%;transform:translateY(0) scaleX(1)}25%{transform:translateY(-9px) scaleX(1)}48%{left:78%;transform:translateY(0) scaleX(1)}52%{transform:scaleX(-1)}75%{transform:translateY(-6px) scaleX(-1)}98%{left:5%;transform:scaleX(-1)}100%{left:5%;transform:scaleX(1)}}
      .cp-registry-top{display:flex;align-items:center;gap:20px;flex-wrap:wrap}.cp-registry-logo{width:78px;height:78px;object-fit:contain;border-radius:18px;background:#fff;padding:10px;border:1px solid #fff;box-shadow:0 5px 20px #42204d18}
      .cp-person-row{display:flex;align-items:center;gap:13px;padding:14px;background:#ffffff7a;border:1px solid #fff;border-radius:17px}.cp-person-row img{width:44px;height:44px;object-fit:cover;border-radius:13px}.cp-person-row p{font-weight:750;font-size:13px}.cp-person-row small{display:block;font-size:11px;color:#786b7b;margin-top:3px}
      .cp-certificate{display:flex;align-items:center;gap:14px;justify-content:space-between;background:#ffffff94;border:1px solid #fff;border-radius:17px;padding:15px}.cp-certificate strong{font-size:13px}.cp-certificate small{display:block;color:#827084;font-size:11px;margin-top:5px}
      .cp-rotomi-head{display:flex;gap:17px;align-items:center}.cp-rotomi-logo{width:78px;height:78px;object-fit:contain;background:#ffffffb0;padding:6px;border-radius:20px;border:1px solid white}
      .cp-filter-row{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:20px}.cp-search{flex:1;min-width:170px;max-width:420px}.cp-search-wrap{position:relative}.cp-search-wrap svg{position:absolute;left:12px;top:14px;color:#8a758b}.cp-search-wrap input{padding-left:38px}
      .cp-poke-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}.cp-poke-card{position:relative;text-align:center;min-width:0;padding:13px;border:1px solid #ffffffeb;border-radius:19px;background:linear-gradient(140deg,#ffffffcb,#f6eafa91);box-shadow:0 7px 18px #52314b0c}
      .cp-poke-card[data-shiny="true"]{background:linear-gradient(140deg,#fff8d0,#fffcef80);border-color:#e8c36c}.cp-pokemon-art{height:113px;max-width:100%;width:100%;object-fit:contain;filter:drop-shadow(0 9px 6px #563b501c)}.cp-pokemon-small{width:32px;height:32px}
      .cp-poke-card h3{font-size:13px;font-weight:850;text-transform:capitalize;overflow-wrap:anywhere;margin-top:2px}.cp-poke-meta{font-size:11px;color:#817083;margin:7px 0 13px}.cp-shiny-label{font-size:10px;font-weight:800;color:#9e692c}
      .cp-favorite-poke{display:inline-flex;align-items:center;gap:6px;background:#ffffffac;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:780;text-transform:capitalize;border:1px solid #fff}
      .cp-pagination{display:flex;align-items:center;gap:12px;justify-content:center;margin-top:20px}.cp-footer-action{margin-top:22px;display:flex;justify-content:center}.cp-overlay{position:fixed;z-index:10001;inset:0;background:#180e20bd;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px)}.cp-dialog{background:#fff;max-width:460px;width:100%;padding:27px;border-radius:26px;box-shadow:0 30px 95px #0006;color:#302638}
      @media(max-width:900px){.cp-hero{grid-template-columns:1fr}.cp-poke-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.cp-three{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:620px){.cp-main{padding-top:18px}.cp-hero{padding:20px}.cp-two,.cp-three{grid-template-columns:1fr}.cp-poke-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.cp-personal{grid-template-columns:1fr}.cp-singer{max-width:185px}.cp-certificate{flex-wrap:wrap}.cp-chip-number{font-size:20px}.cp-person{align-items:flex-start}.cp-avatar{height:65px;width:65px}}

      /* CARPETA 3.0 · cabecera rediseñada, tipografía controlada frente a estilos globales */
      .cp-page,.cp-page *{box-sizing:border-box}
      .cp-page :where(h1,h2,h3,p){margin:0}
      .cp-page{--cp-ink:#35263f;--cp-purple:#75437a;--cp-mute:#716779;background:radial-gradient(ellipse at 8% 2%,#fff7ef 0%,transparent 37%),radial-gradient(ellipse at 92% 7%,#e8d5f5 0%,transparent 36%),linear-gradient(155deg,#faf7ff,#f7eefa 78%,#f0e8f6)}
      .cp-main{width:min(1330px,100%);padding-top:32px}
      .cp-glass{border-radius:28px;box-shadow:inset 0 1px rgba(255,255,255,.98),0 20px 56px rgba(67,36,79,.09),0 3px 9px rgba(67,36,79,.035)}
      .cp-hero{grid-template-columns:minmax(0,1.46fr) minmax(306px,.8fr);align-items:stretch;gap:clamp(22px,3.2vw,46px);padding:clamp(23px,3.5vw,42px);background:linear-gradient(110deg,rgba(255,255,255,.87),rgba(255,255,255,.51) 54%,rgba(250,232,255,.46))}
      .cp-hero::after{z-index:-1;opacity:.64;filter:blur(22px)}
      .cp-hero-primary{min-width:0;display:flex;flex-direction:column;gap:22px}
      .cp-hero-topline{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:10px;font-weight:800;letter-spacing:.13em;color:#8c648c}
      .cp-crest{display:grid;place-items:center;height:31px;width:31px;border-radius:11px;background:linear-gradient(135deg,#fff7d9,#f7dfb2);font-size:18px;box-shadow:0 4px 14px #bca07f3a}
      .cp-hero-split{color:#d4b9d6;padding:0 4px}.cp-edition{margin-left:auto;border:1px solid #d9bfdd;padding:5px 9px;border-radius:99px;font-size:9px;background:#ffffff90}
      .cp-hero-intro{display:grid;gap:8px}.cp-hero-intro .cp-eyebrow{font-size:10px;letter-spacing:.14em;color:#966f91}
      .cp-page .cp-title{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif!important;font-size:clamp(29px,3.1vw,44px)!important;line-height:1.14!important;letter-spacing:-.052em!important;font-weight:810!important;text-transform:none!important;max-width:100%;margin:0!important;color:#35253d}
      .cp-title em{font-style:normal;background:linear-gradient(100deg,#9e6c9d,#70447a);background-clip:text;-webkit-background-clip:text;color:transparent}
      .cp-hero-description{font-size:13px;line-height:1.55;color:#77697f;max-width:520px}
      .cp-identity-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(145px,200px);gap:15px;align-items:stretch;margin-top:auto}
      .cp-identity-main{display:flex;flex-direction:column;justify-content:center;gap:13px;min-width:0}
      .cp-identity-main .cp-person{margin:0;gap:12px;align-items:center}.cp-person-copy{min-width:0}
      .cp-avatar{width:66px;height:66px;border:3px solid #fff;border-radius:21px}
      .cp-verified{display:flex;align-items:center;gap:5px;letter-spacing:.08em;font-size:9px;line-height:1.4}
      .cp-page .cp-name{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif!important;font-size:clamp(20px,2.15vw,27px)!important;line-height:1.19!important;font-weight:840!important;letter-spacing:-.04em!important;overflow-wrap:anywhere;margin:6px 0 2px!important}
      .cp-handle{font-size:12px;color:#867589;overflow-wrap:anywhere}.cp-featured-roles{margin-top:0;gap:6px}.cp-featured-roles .cp-role{padding:6px 9px;font-size:10px;background:#fff9;border-color:#e5d5e9}
      .cp-hero-pokemon{display:flex;flex-direction:column;justify-content:space-between;align-items:center;min-width:0;text-align:center;padding:12px;border-radius:21px;background:linear-gradient(140deg,rgba(250,241,255,.83),rgba(255,255,255,.69));border:1px solid #fff;box-shadow:inset 0 1px white,0 8px 23px #794d7b12;gap:6px}
      .cp-pokemon-topline{font-size:9px;color:#815781;font-weight:900;letter-spacing:.06em;display:flex;align-items:center;gap:5px;text-align:center}
      .cp-hero-pokemon .cp-favorite-poke{display:flex;flex-direction:column;gap:3px;border:0;background:transparent;min-width:0;padding:0;font-size:11px;font-weight:800}
      .cp-hero-pokemon .cp-favorite-poke .cp-pokemon-small{width:75px;height:70px;filter:drop-shadow(0 8px 5px #70527833)}
      .cp-fav-placeholder{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10px;line-height:1.25;color:#8e7b93}
      .cp-fav-placeholder img{width:60px;height:59px;object-fit:contain}
      .cp-favorite-link{display:inline-flex;gap:4px;align-items:center;background:none;border:0;color:#835b8d;font-size:10px;font-weight:850;cursor:pointer;padding:3px}
      .cp-hero-side{grid-template-rows:auto 1fr;gap:12px;min-width:0}
      .cp-id-chip{padding:20px 20px 17px;border-radius:22px;background:linear-gradient(125deg,#4e304f 0%,#563256 63%,#764676 100%);box-shadow:0 13px 24px #47264a20}
      .cp-chip-top{display:flex;align-items:center;justify-content:space-between;gap:6px}.cp-chip-label{font-size:9px;letter-spacing:.1em;gap:6px}.cp-chip-symbol{font-size:19px;color:#d3aedb}
      .cp-chip-number{font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:clamp(19px,2vw,26px);line-height:1.25;letter-spacing:.04em;margin-top:22px;margin-bottom:20px}
      .cp-chip-bottom{margin-top:0;gap:7px;font-size:10px}.cp-chip-bottom span{display:flex;flex-direction:column;gap:4px;letter-spacing:.08em}.cp-chip-bottom strong{font-size:12px;color:white;letter-spacing:0}.cp-chip-actions{display:flex;gap:6px}
      .cp-mini-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
      .cp-mini{border:1px solid #fff;background:linear-gradient(135deg,#ffffffca,#fff7ff8f);border-radius:20px;padding:15px;min-width:0}
      .cp-mini-head{display:flex;align-items:center;gap:6px;color:#8d688d;font-size:10px;font-weight:850;letter-spacing:.08em}
      .cp-mini strong{font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:clamp(21px,2.3vw,29px);letter-spacing:-.04em;overflow-wrap:anywhere;line-height:1.15;margin-top:12px}
      .cp-mini-points small{display:block;font-size:10px;letter-spacing:0;text-transform:none;margin-top:18px;line-height:1.4}
      .cp-money-below{display:flex;flex-direction:column;gap:5px;padding-top:10px;margin-top:9px;border-top:1px solid #dccbdf}
      .cp-money-below span{display:flex;align-items:center;gap:5px;color:#815f85;font-size:9px;font-weight:900;letter-spacing:.055em}
      .cp-money-below b{font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:clamp(14px,1.35vw,18px);letter-spacing:-.025em;color:#3d2d47;font-weight:850;overflow-wrap:anywhere}
      .cp-singer-placeholder{display:grid;place-items:center;font-size:55px}
      .cp-page .cp-panel h2{font-family:Inter,ui-sans-serif,system-ui,sans-serif!important;line-height:1.25!important}
      @media(max-width:1020px){.cp-hero{grid-template-columns:minmax(0,1.1fr) minmax(270px,.85fr);gap:20px}.cp-identity-layout{grid-template-columns:1fr}.cp-hero-pokemon{flex-direction:row;justify-content:space-between;align-items:center;gap:10px}.cp-hero-pokemon .cp-favorite-poke{flex-direction:row}.cp-hero-pokemon .cp-favorite-poke .cp-pokemon-small{width:42px;height:43px}.cp-fav-placeholder{flex-direction:row}.cp-fav-placeholder img{width:37px;height:38px}}
      @media(max-width:790px){.cp-hero{grid-template-columns:1fr}.cp-identity-layout{grid-template-columns:minmax(0,1fr) minmax(135px,185px)}.cp-hero-pokemon{flex-direction:column}.cp-hero-pokemon .cp-favorite-poke{flex-direction:column}.cp-hero-side{grid-template-columns:1.25fr 1fr;align-items:stretch}.cp-mini-stats{gap:8px}.cp-id-chip{min-height:197px}}
      @media(max-width:575px){.cp-main{padding:18px 13px 65px}.cp-hero{padding:19px;gap:17px}.cp-page .cp-title{font-size:30px!important}.cp-hero-topline{gap:7px;font-size:9px}.cp-edition{display:none}.cp-identity-layout{grid-template-columns:1fr}.cp-identity-main{gap:12px}.cp-hero-pokemon{flex-direction:row}.cp-hero-pokemon .cp-favorite-poke{flex-direction:row}.cp-hero-pokemon .cp-favorite-poke .cp-pokemon-small{width:48px;height:44px}.cp-hero-side{grid-template-columns:1fr}.cp-mini-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.cp-chip-number{font-size:24px}.cp-hero-description{font-size:12px}.cp-mini-points small{margin-top:15px}}

      @media(prefers-reduced-motion:reduce){.cp-pet-walker{animation:none;left:40%}.cp-tab,.cp-btn{transition:none}}
    `}</style>
    <Header />
    <main className="cp-main">
      {loading ? <Panel title="Cargando tu carpeta..." eyebrow="Reino del Pan"><p className="cp-sub">Verificando la sesión y el Registro Civil.</p></Panel>
      : error ? <Panel title="No se pudo abrir tu carpeta" eyebrow="Acceso"><p className="cp-notice cp-danger">{error}</p><a className="cp-btn" style={{ marginTop: 15 }} href="/auth/discord">Entrar con Discord</a></Panel>
      : !citizen ? null
      : !citizen.inGuild ? <Panel title="Únete al Reino del Pan" eyebrow="Acceso ciudadano"><p className="cp-sub">Para acceder necesitas pertenecer al servidor oficial de Discord.</p><a className="cp-btn" style={{ marginTop: 17 }} href="https://discord.gg/reino-del-pan-1381359904731693056" target="_blank" rel="noreferrer">Unirme al Reino</a></Panel>
      : !citizen.dpi ? <Panel title="Todavía no tienes DPI" eyebrow="Registro de identidad"><p className="cp-sub">Crea tu documento, verifícalo en Discord y regresa a esta carpeta.</p><Link className="cp-btn" style={{ marginTop: 16 }} href="/dpi/create">Crear mi DPI</Link></Panel>
      : <>
        <motion.section className="cp-glass cp-hero" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="cp-hero-primary">
            <div className="cp-hero-topline"><span className="cp-crest">🍞</span><span>REINO DEL PAN <span className="cp-hero-split">/</span> PORTAL CIUDADANO</span><span className="cp-edition">MI ESPACIO</span></div>
            <div className="cp-hero-intro">
              <p className="cp-eyebrow">Tu hogar digital en el Reino</p>
              <h1 className="cp-title">Tu rincón, <em>a tu manera.</em></h1>
              <p className="cp-hero-description">Tu identidad, tu familia y tus Pokémon. Todo en un mismo lugar.</p>
            </div>
            <div className="cp-identity-layout">
              <div className="cp-identity-main">
                <div className="cp-person">
                  <AvatarImage className="cp-avatar" src={citizen.avatar} alt="Avatar de Discord" />
                  <div className="cp-person-copy"><p className="cp-eyebrow cp-verified"><BadgeCheck size={13} /> Ciudadano registrado {citizen.verificado ? "· Verificado" : ""}</p>
                    <p className="cp-name">{citizen.dpi.nombre} {citizen.dpi.apellidos}</p>
                    <p className="cp-handle">@{citizen.username}</p></div>
                </div>
                <div className="cp-role-list cp-featured-roles">
                  {featuredRoles.length ? featuredRoles.map(r => <RoleBadge key={r.discord_role_id} role={r} compact />) : <span className="cp-role cp-role-small">🪪 Ciudadano del Reino</span>}
                </div>
              </div>
              <div className="cp-hero-pokemon" aria-label="Pokémon favorito">
                <span className="cp-pokemon-topline"><Zap size={13} /> MI COMPAÑERO POKÉMON</span>
                {profile?.pokemon_favorito
                  ? <FavoritePokemon name={profile.pokemon_favorito} />
                  : <div className="cp-fav-placeholder"><img src="/rotomi.png" alt="Rotomi" /><span>Tu Pokémon favorito aparecerá aquí</span></div>}
                <button type="button" className="cp-favorite-link" onClick={() => setTab("rotomi")}>Abrir mi PC <ChevronRight size={14} /></button>
              </div>
            </div>
          </div>
          <aside className="cp-hero-side" aria-label="Resumen ciudadano">
            <div className="cp-id-chip">
              <div className="cp-chip-top"><span className="cp-chip-label"><FileBadge2 size={15} /> DOCUMENTO DE IDENTIDAD PANIENSE</span><span className="cp-chip-symbol">✦</span></div>
              <p className="cp-chip-number">{dpiVisible ? citizen.dpi.dpi_number : maskDpi(citizen.dpi.dpi_number)}</p>
              <div className="cp-chip-bottom"><span>REGIÓN <strong>{citizen.dpi.region || "—"}</strong></span><div className="cp-chip-actions">
                <button type="button" className="cp-icon-btn" aria-label={dpiVisible ? "Ocultar DPI" : "Mostrar DPI"} title="Mostrar u ocultar DPI" onClick={() => setDpiVisible(v => !v)}>{dpiVisible ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                <button type="button" className="cp-icon-btn" aria-label="Copiar número DPI" title="Copiar DPI" onClick={() => { void navigator.clipboard?.writeText(citizen.dpi!.dpi_number).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1800); }).catch(() => {}); }}>{copied ? <Check size={16} /> : <Copy size={16} />}</button>
              </div></div>
            </div>
            <div className="cp-mini-stats">
              <div className="cp-mini cp-mini-level"><div className="cp-mini-head"><Award size={16} /><span>NIVEL</span></div><strong>{fmtNum(citizen.level)}</strong>
                <div className="cp-money-below"><span><Wallet size={14} /> DINERO TOTAL</span><b>{citizen.economy ? `${fmtNum((citizen.economy.cash || 0) + (citizen.economy.bank || 0))} Ᵽ` : "—"}</b></div>
              </div>
              <div className="cp-mini cp-mini-points"><div className="cp-mini-head"><Star size={16} /><span>PUNTOS BASE</span></div><strong>{fmtNum(pbValue(citizen.puntos_elo))}</strong><small>Tu progreso en el Reino</small></div>
            </div>
          </aside>
        </motion.section>

        <nav className="cp-tabs" aria-label="Secciones de carpeta ciudadana">
          {tabList.map(t => <button key={t.key} className="cp-tab" data-active={tab === t.key} aria-current={tab === t.key ? "page" : undefined} onClick={() => { setTab(t.key); setTransferMessage(""); }}><t.icon size={16} />{t.label}</button>)}
        </nav>
        <div className="cp-content">
          {tab === "identidad" && <>
            <div className="cp-two">
              <Panel title="Mi DPI" eyebrow="Identificación ciudadana" action={<BadgeCheck size={25} color="#9d6290" />}>
                <div className="cp-two"><div className="cp-fact"><small>Nombre</small><strong>{citizen.dpi.nombre} {citizen.dpi.apellidos}</strong></div><div className="cp-fact"><small>Región</small><strong>{citizen.dpi.region || "—"}</strong></div><div className="cp-fact"><small>Fecha de nacimiento</small><strong>{fmtDate(citizen.dpi.fecha_nac)}</strong></div><div className="cp-fact"><small>Género</small><strong>{citizen.dpi.genero || "—"}</strong></div><div className="cp-fact"><small>Emisión</small><strong>{fmtDate(citizen.dpi.issued_at)}</strong></div><div className="cp-fact"><small>Validez</small><strong>{fmtDate(citizen.dpi.valid_until)}</strong></div></div>
                <p className="cp-sub" style={{ marginTop: 15 }}><LockKeyhole size={13} style={{ display: "inline" }} /> El número de DPI está oculto inicialmente para proteger tu privacidad.</p>
              </Panel>
              <Panel title="Economía y trayectoria" eyebrow="Resumen del ciudadano" action={<Wallet size={25} color="#9d6290" />}>
                <div className="cp-two"><div className="cp-fact"><small>Banco Paniense</small><strong>{fmtNum(citizen.economy?.bank)} Ᵽ</strong></div><div className="cp-fact"><small>Efectivo</small><strong>{fmtNum(citizen.economy?.cash)} Ᵽ</strong></div><div className="cp-fact"><small>Experiencia</small><strong>{fmtNum(citizen.total_xp ?? citizen.xp)} XP</strong></div><div className="cp-fact"><small>Roles</small><strong>{roles.length} asignados</strong></div></div>
                <div style={{ marginTop: 16, display: "flex", gap: 9, flexWrap: "wrap" }}><img src="/LaboralBank/LPB.png" alt="Banco Paniense" style={{ width: 35, height: 35, objectFit: "contain" }} onError={e => { e.currentTarget.style.display = "none"; }} /></div>
              </Panel>
            </div>
            <Panel title="Tu pequeño universo" eyebrow="Personalización de perfil" action={<button className="cp-btn cp-btn-light" onClick={() => { setEditing(e => !e); setSaveMessage(""); }}><ImagePlus size={15} />{editing ? "Cerrar editor" : "Personalizar"}</button>}>
              {editing ? <div className="cp-form">
                <label><span className="cp-label">Cantante favorito</span><input className="cp-input" maxLength={90} value={form.cantante_favorito} onChange={e => setForm({ ...form, cantante_favorito: e.target.value })} placeholder="Ej. Aitana" /></label>
                <label><span className="cp-label">Imagen del cantante (URL permanente HTTPS, no adjuntos temporales de Discord)</span><input className="cp-input" type="url" maxLength={500} value={form.cantante_imagen} onChange={e => setForm({ ...form, cantante_imagen: e.target.value })} placeholder="https://.../foto.jpg" /></label>
                {safeImageUrl(form.cantante_imagen) && <SingerImage src={form.cantante_imagen} alt="Previsualización de cantante" />}
                <label><span className="cp-label">Animal favorito (se animará en el jardín)</span><input className="cp-input" list="cp-pets" maxLength={60} value={form.animal_favorito} onChange={e => setForm({ ...form, animal_favorito: e.target.value })} placeholder="Ej. Gato, perro, delfín..." /><datalist id="cp-pets">{PETS.map(p => <option key={p.label} value={p.words[0]} />)}</datalist></label>
                <div><button className="cp-btn" onClick={() => void saveProfile()} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button></div>
              </div> : <div className="cp-two" style={{ alignItems: "center" }}>
                <div className="cp-personal">
                  <SingerImage src={profile?.cantante_imagen} alt={`Imagen de ${profile?.cantante_favorito || "cantante"}`} />
                  <div><p className="cp-eyebrow">La banda sonora de tu vida</p><p style={{ fontSize: 21, fontWeight: 850, marginTop: 8 }}>{profile?.cantante_favorito || "Sin cantante favorito"}</p><p className="cp-sub">Pon una URL de imagen para personalizar tu perfil.</p></div>
                </div>
                <div className="cp-pet-area"><span className="cp-pet-name">{profile?.animal_favorito ? `🐾 ${profile.animal_favorito}` : "Elige a tu mascota favorita"}</span><span className="cp-pet-walker" role="img" aria-label={`Animal favorito: ${profile?.animal_favorito || "sin elegir"}`}>{petEmoji(profile?.animal_favorito || "")}</span></div>
              </div>}
              {saveMessage && <p role="status" className={`cp-notice ${saveMessage.includes("actualizado") ? "" : "cp-danger"}`} style={{ marginTop: 13 }}>{saveMessage}</p>}
            </Panel>
            <Panel title="Tus próximos destinos" eyebrow="Acceso rápido"><div className="cp-three">
              <button className="cp-btn cp-btn-light" onClick={() => setTab("familia")}><Users size={16} />Mi núcleo familiar</button>
              <button className="cp-btn cp-btn-light" onClick={() => setTab("rotomi")}><Zap size={16} />Mi PC Pokémon</button>
              <button className="cp-btn cp-btn-light" onClick={() => setTab("roles")}><Star size={16} />Mis distintivos</button>
            </div></Panel>
          </>}

          {tab === "familia" && <>
            <Panel title="Registro Civil del Reino" eyebrow="Patrocinado por el Registro Civil" action={<button className="cp-btn cp-btn-light" onClick={() => void refreshFamily()} disabled={familyLoading}><RefreshCw size={15} />Actualizar</button>}>
              <div className="cp-registry-top"><img src="/reg.png" className="cp-registry-logo" alt="Emblema del Registro Civil" />
                <div><p style={{ fontSize: 17, fontWeight: 850 }}>Tu núcleo familiar oficial</p><p className="cp-sub">Matrimonios, hijos inscritos y actas emitidas desde el mismo registro que utiliza el bot.</p></div></div>
              {familyError && <p className="cp-notice cp-danger" role="alert" style={{ marginTop: 17 }}>{familyError}</p>}
              {familyLoading && <p className="cp-sub" style={{ marginTop: 15 }}>Consultando asientos del Registro...</p>}
            </Panel>
            <Panel title="Mi familia" eyebrow="Vínculos familiares">
              {(family.matrimonio || citizen.matrimonio) && <div className="cp-person-row" style={{ marginBottom: 11 }}><span style={{ fontSize: 29 }}>💍</span><AvatarImage src={(family.matrimonio || citizen.matrimonio)?.conyuge_avatar} alt="Cónyuge" /><div><p>{(family.matrimonio || citizen.matrimonio)?.conyuge_username}</p><small>Mi pareja · Matrimonio desde {fmtDate((family.matrimonio || citizen.matrimonio)?.fecha_boda)}</small></div></div>}
              <div className="cp-two">{(family.hijos.length ? family.hijos : citizen.hijos || []).map((h, i) => <div className="cp-person-row" key={`${h.hijo_id}-${i}`}><span style={{ fontSize: 25 }}>{h.tipo === "creado" ? "🍼" : "🧒"}</span><AvatarImage src={h.hijo_avatar} alt="" /><div><p>{h.hijo_username}</p><small>{h.tipo === "creado" ? "Hijo ficticio inscrito" : "Hijo adoptivo"}</small></div></div>)}</div>
              {!family.matrimonio && !citizen.matrimonio && !family.hijos.length && !(citizen.hijos || []).length && !familyLoading && <p className="cp-notice">Todavía no constan vínculos familiares. Puedes iniciar trámites en el bot del Registro Civil de Discord.</p>}
            </Panel>
            <Panel title="Mis certificados" eyebrow="Documentos registrales" action={<ScrollText size={25} color="#9d6290" />}>
              {family.actas.length ? <div style={{ display: "grid", gap: 11 }}>{family.actas.map(acta => <div className="cp-certificate" key={acta.numero}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}><FileBadge2 color="#8b6084" size={23} /><div><strong style={{ textTransform: "capitalize" }}>Certificado de {acta.tipo}</strong><small>N.º {acta.numero} · {fmtDate(acta.fecha || acta.created_at)}</small></div></div>
                <button className="cp-btn" disabled={certBusy !== null} onClick={() => void downloadCertificate(acta)}><Download size={15} />{certBusy === acta.numero ? "Generando" : "PDF"}</button>
              </div>)}</div> : <p className="cp-notice">{familyLoading ? "Buscando certificados..." : familyError ? "No se pudieron comprobar las actas." : "No hay actas emitidas a tu nombre en el registro consultado."}</p>}
              <p className="cp-sub" style={{ marginTop: 12 }}>Los certificados solo se descargan para la cuenta autenticada y se generan con el mismo módulo Python del bot cuando está configurado en el servidor.</p>
            </Panel>
          </>}

          {tab === "rotomi" && <>
            <Panel title="Rotomi · Mi PC Pokémon" eyebrow="Sistema de almacenamiento oficial" action={<button className="cp-btn cp-btn-light" onClick={() => void refreshPc()} disabled={pcLoading}><RefreshCw size={15} />Actualizar</button>}>
              <div className="cp-rotomi-head"><img src="/rotomi.png" alt="Rotomi" className="cp-rotomi-logo" /><div><p className="cp-sub">Tus capturas reales, sincronizadas con la tabla <strong>capturas</strong> del bot.</p><div className="cp-role-list"><span className="cp-role cp-role-small">📦 {captures.length} Pokémon</span><span className="cp-role cp-role-small">✨ {captures.filter(c => c.is_shiny).length} shiny</span><span className="cp-role cp-role-small">🧬 {new Set(captures.map(c => c.pokemon_id)).size} especies</span></div></div></div>
              <p className="cp-sub" style={{ marginTop: 12 }}>Arte de los Pokémon mediante PokéAPI. Se muestran hasta 300 capturas recientes por consulta.</p>
            </Panel>
            <Panel title="Mi colección" eyebrow="Cajas Rotomi" action={<Gem color="#ad8a40" size={25} />}>
              <div className="cp-filter-row"><div className="cp-search cp-search-wrap"><Search size={16} /><input className="cp-input" placeholder="Buscar Pokémon por nombre o número" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} /></div>
                <button className={`cp-btn ${onlyShiny ? "" : "cp-btn-light"}`} onClick={() => { setOnlyShiny(v => !v); setPage(0); }}><Filter size={14} />{onlyShiny ? "✨ Solo shiny" : "Todos / shiny"}</button></div>
              {pcError && <p className="cp-notice cp-danger" role="alert">{pcError}</p>}
              {!pcLoading && captures.some(c => !c.id) && <p className="cp-notice" role="status" style={{ marginBottom: 14 }}>Tu colección se puede consultar, pero algunas capturas no tienen ID único. Para transferirlas, revisa el esquema de <code>public.capturas</code> en Supabase.</p>}
              {pcLoading ? <p className="cp-notice">Rotomi está sincronizando tus cajas...</p> : <>
                <div className="cp-poke-grid">{visible.map((c, i) => <article key={`${c.id ?? 'sin-id'}-${c.pokemon_id}-${i}`} className="cp-poke-card" data-shiny={c.is_shiny}>
                  {c.is_shiny && <span className="cp-shiny-label">✨ SHINY</span>}
                  <PokemonArt id={c.pokemon_id} shiny={c.is_shiny} label={c.pokemon_name} />
                  <h3>{c.pokemon_name}</h3><p className="cp-poke-meta">#{c.pokemon_id} · Nv. {c.level} · {c.ball_used}</p>
                  <button className="cp-btn cp-btn-light" style={{ width: "100%", padding: "9px 7px" }} disabled={!Number.isSafeInteger(c.id) || c.id <= 0} title={!c.id ? "Falta ID de captura en Supabase" : "Transferir Pokémon"} onClick={() => { setTransfer(c); setRecipient(""); setRecipientVerified(null); setTransferMessage(""); }}><ArrowLeftRight size={13} /> Transferir</button>
                </article>)}</div>
                {!visible.length && <p className="cp-notice">{captures.length ? "No hay Pokémon que coincidan con los filtros." : "Tu PC está vacío. ¡Captura Pokémon con el bot para llenar las cajas!"}</p>}
                {totalPages > 1 && <div className="cp-pagination"><button className="cp-btn cp-btn-light" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} aria-label="Página anterior"><ChevronLeft size={18} /></button><span className="cp-sub">Caja {page + 1} de {totalPages}</span><button className="cp-btn cp-btn-light" disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} aria-label="Página siguiente"><ChevronRight size={18} /></button></div>}
              </>}
              {transferMessage && !transfer && <p className="cp-notice" role="status" style={{ marginTop: 13 }}>{transferMessage}</p>}
            </Panel>
          </>}

          {tab === "roles" && <Panel title="Mis distintivos y roles" eyebrow="Identidad dentro del Reino" action={<Award color="#9d6290" size={26} />}>
            <p className="cp-sub" style={{ marginBottom: 18 }}>Los emblemas especiales y de equipos son los mismos que aparecen junto a tu nombre de ciudadano registrado.</p>
            {roles.length ? Object.entries(groupedRoles).sort(([a], [b]) => (a === "equipos" ? -1 : b === "equipos" ? 1 : a === "especiales" ? -1 : b === "especiales" ? 1 : 0)).map(([category, group]) => <div key={category} style={{ marginBottom: 23 }}><p className="cp-eyebrow" style={{ marginBottom: 10 }}>{CATEGORY_TITLES[category] || category}</p><div className="cp-role-list">{group.map(r => <RoleBadge key={r.discord_role_id} role={r} />)}</div></div>) : <p className="cp-notice">Todavía no tienes roles registrados.</p>}
          </Panel>}
          <div className="cp-footer-action"><a href="/auth/logout" className="cp-btn cp-btn-light"><LogOut size={15} /> Cerrar sesión de Discord</a></div>
        </div>
      </>}
    </main>
    <Footer />
    {transfer && <div className="cp-overlay" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget && !transferBusy) setTransfer(null); }}>
      <section className="cp-dialog" role="dialog" aria-modal="true" aria-labelledby="cp-transfer-title">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><div><p className="cp-eyebrow">Rotomi · Transferencia segura</p><h2 id="cp-transfer-title" style={{ fontSize: 24, fontWeight: 850, marginTop: 5 }}>Enviar un Pokémon</h2></div><button className="cp-btn cp-btn-light" style={{ padding: 9 }} onClick={() => setTransfer(null)} disabled={transferBusy} aria-label="Cerrar"><X size={18} /></button></div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "18px 0" }}><PokemonArt id={transfer.pokemon_id} shiny={transfer.is_shiny} label={transfer.pokemon_name} size="small" /><div><strong style={{ textTransform: "capitalize" }}>{transfer.pokemon_name} {transfer.is_shiny ? "✨" : ""}</strong><p className="cp-sub">Nivel {transfer.level} · Captura #{transfer.id}</p></div></div>
        <label><span className="cp-label">ID de Discord del destinatario (debe tener DPI verificado)</span><input className="cp-input" inputMode="numeric" placeholder="123456789012345678" value={recipient} maxLength={22} onChange={e => { setRecipient(e.target.value.replace(/\D/g, "")); setRecipientVerified(null); setTransferMessage(""); }} /></label>
        <button className="cp-btn cp-btn-light" type="button" style={{ marginTop: 12, width: "100%" }} onClick={() => void verifyRecipient()}
          disabled={recipientChecking || !/^[0-9]{15,22}$/.test(recipient) || recipient === citizen?.id}>
          <ShieldCheck size={16} />{recipientChecking ? "Verificando destinatario..." : "Verificar destinatario"}
        </button>
        {recipientVerified && <div className="cp-person-row" style={{ marginTop: 12 }}>
          <AvatarImage src={recipientVerified.avatar} alt="" />
          <div><p>{recipientVerified.username}</p><small>DPI verificado · Confirma que es la persona correcta</small></div>
        </div>}
        <p className="cp-notice" style={{ marginTop: 13 }}>La transferencia es definitiva. El Pokémon desaparecerá de tu PC y pasará al del destinatario; no se duplicará.</p>
        {transferMessage && <p role="alert" className="cp-notice cp-danger" style={{ marginTop: 12 }}>{transferMessage}</p>}
        <button className="cp-btn" style={{ width: "100%", marginTop: 16 }} onClick={() => void transferPokemon()} disabled={transferBusy || !recipientVerified || recipientVerified.id !== recipient || recipient === citizen?.id}><ArrowLeftRight size={16} />{transferBusy ? "Procesando..." : "Confirmar transferencia"}</button>
      </section>
    </div>}
  </div>;
}
