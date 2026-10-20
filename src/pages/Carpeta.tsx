import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeftRight, BadgeCheck, Check, ChevronLeft, ChevronRight, FolderOpen, UploadCloud,
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
type Tab = "identidad" | "familia" | "rotomi" | "roles" | "carpetas";
type SearchPerson = { id: string; username: string; avatar: string };
type PublicCitizen = {
  username: string; avatar: string; level: number | null;
  cantante_favorito: string | null; cantante_imagen: string | null;
  animal_favorito: string | null; pokemon_favorito: string | null;
};
type LevelProgress = { level: number; xp: number; target: number; remaining: number; percent: number; estimated: boolean };
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
  const url = src?.startsWith("blob:") ? src : safeImageUrl(src);
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
    <header className="cp-panel-header">
      <div className="cp-panel-heading">
        {eyebrow && <p className="cp-eyebrow cp-panel-eyebrow">{eyebrow}</p>}
        <div className="cp-panel-title" role="heading" aria-level={2}>{title}</div>
      </div>
      {action && <div className="cp-panel-action">{action}</div>}
    </header>
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
  const [recipientQuery, setRecipientQuery] = useState("");
  const [recipientMatches, setRecipientMatches] = useState<SearchPerson[]>([]);
  const [recipientSearching, setRecipientSearching] = useState(false);
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryResults, setDirectoryResults] = useState<SearchPerson[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [publicCitizen, setPublicCitizen] = useState<PublicCitizen | null>(null);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState("");
  const [progress, setProgress] = useState<LevelProgress | null>(null);
  const [recipientVerified, setRecipientVerified] = useState<{ id: string; username: string; avatar: string } | null>(null);
  const [recipientChecking, setRecipientChecking] = useState(false);
  const [transferBusy, setTransferBusy] = useState(false);
  const [transferMessage, setTransferMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ cantante_favorito: "", animal_favorito: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
      try {
        const result = await api<{ progress: LevelProgress }>("/api/citizen/progress");
        if (alive) setProgress(result.progress);
      } catch (err) { if (alive) console.warn("Progreso:", err); }
      // El perfil adicional se recupera a través del mismo backend autenticado.
      try {
        const d = await api<{ profile: Profile | null }>("/api/citizen/profile");
        if (alive && d.profile) {
          setProfile(d.profile);
          setForm({ cantante_favorito: d.profile.cantante_favorito || "", animal_favorito: d.profile.animal_favorito || "" });
        }
      } catch (e) { if (alive) console.warn("Perfil ampliado:", e); }
    }).catch(e => { if (alive) { setError(e.message); } }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!imageFile) { setImagePreview(null); return; }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  useEffect(() => {
    if (tab !== "carpetas" || directorySearch.trim().length < 2) {
      setDirectoryResults([]); setDirectoryLoading(false); return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setDirectoryLoading(true);
      try {
        const response = await fetch(`/api/citizen/directory?q=${encodeURIComponent(directorySearch.trim())}`, { credentials: "same-origin", signal: controller.signal });
        if (!response.ok) throw new Error("No se pudo buscar a los ciudadanos.");
        const result = await response.json() as { users: SearchPerson[] };
        if (!controller.signal.aborted) setDirectoryResults(result.users || []);
      } catch { if (!controller.signal.aborted) setDirectoryResults([]); }
      finally { if (!controller.signal.aborted) setDirectoryLoading(false); }
    }, 260);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [directorySearch, tab]);

  useEffect(() => {
    if (!transfer || recipientQuery.trim().length < 2 || recipientVerified) {
      setRecipientMatches([]); setRecipientSearching(false); return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setRecipientSearching(true);
      try {
        const response = await fetch(`/api/citizen/directory?q=${encodeURIComponent(recipientQuery.trim())}`, { credentials: "same-origin", signal: controller.signal });
        if (!response.ok) throw new Error("Búsqueda no disponible");
        const result = await response.json() as { users: SearchPerson[] };
        if (!controller.signal.aborted) setRecipientMatches((result.users || []).filter(u => u.id !== citizen?.id));
      } catch { if (!controller.signal.aborted) setRecipientMatches([]); }
      finally { if (!controller.signal.aborted) setRecipientSearching(false); }
    }, 260);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [recipientQuery, transfer, recipientVerified, citizen?.id]);

  async function openPublicFolder(person: SearchPerson) {
    setPublicCitizen(null); setPublicError(""); setPublicLoading(true);
    try {
      const result = await api<{ profile: PublicCitizen }>(`/api/citizen/public/${person.id}`);
      setPublicCitizen(result.profile);
    } catch (e) { setPublicError(e instanceof Error ? e.message : "No se pudo abrir la carpeta."); }
    finally { setPublicLoading(false); }
  }

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
    { key: "carpetas", label: "Otras carpetas", icon: FolderOpen },
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
    setSaveMessage(""); setSaving(true);
    try {
      const result = await api<{ profile: Profile }>("/api/citizen/profile", {
        method: "PATCH", body: JSON.stringify(form),
      });
      setProfile(result.profile);
      if (imageFile) {
        const response = await fetch("/api/citizen/profile/image", {
          method: "POST", body: imageFile, headers: { "Content-Type": imageFile.type }, credentials: "same-origin",
        });
        const uploaded = await response.json().catch(() => ({})) as { profile?: Profile; error?: string };
        if (!response.ok || !uploaded.profile) throw new Error(uploaded.error || `Error al subir la imagen (${response.status})`);
        setProfile(uploaded.profile);
      }
      setImageFile(null); setEditing(false); setSaveMessage("¡Perfil actualizado!");
    } catch (e) { setSaveMessage(e instanceof Error ? e.message : "No se pudo guardar."); }
    finally { setSaving(false); }
  }
  function chooseSingerImage(file?: File) {
    setSaveMessage("");
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setSaveMessage("Elige un archivo PNG, JPG o WebP."); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveMessage("La foto debe pesar menos de 2 MB."); return;
    }
    setImageFile(file);
  }
  async function verifyRecipient(id = recipient) {
    setRecipientVerified(null); setTransferMessage("");
    if (!/^[0-9]{15,22}$/.test(id) || id === citizen?.id) {
      setTransferMessage("Selecciona otro ciudadano en la lista."); return;
    }
    setRecipientChecking(true);
    try {
      const response = await api<{ recipient: SearchPerson }>(`/api/citizen/pokemon/recipient/${id}`);
      if (response.recipient.id === id) {
        setRecipient(id); setRecipientVerified(response.recipient);
        setRecipientQuery(response.recipient.username);
        setRecipientMatches([]);
      }
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
      setTransfer(null); setRecipient(""); setRecipientQuery(""); setRecipientVerified(null); setTransferMessage("¡Transferencia completada! Rotomi ya está actualizado.");
      await refreshPc();
    } catch (e) { setTransferMessage(e instanceof Error ? e.message : "No se pudo transferir el Pokémon."); }
    finally { setTransferBusy(false); }
  }

  return <div className="cp-page">
    <style>{`
/* CARPETA 4.0 · Estado Paniense — Liquid Glass / RMNeue */
.cp-page{--cp-font:"RMNeue","RM Neue",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--cp-ink:#30263b;--cp-muted:#73687c;--cp-plum:#6e447f;--cp-frost:rgba(255,255,255,.60);--cp-edge:rgba(255,255,255,.87);--cp-focus:#8651b0;color:var(--cp-ink);min-height:100vh;overflow-x:clip;background:radial-gradient(ellipse 600px 550px at 96% 5%,rgba(198,161,242,.32),transparent 75%),radial-gradient(ellipse 580px 510px at 0% 28%,rgba(247,218,215,.38),transparent 75%),radial-gradient(ellipse 670px 510px at 65% 96%,rgba(218,203,241,.48),transparent 75%),linear-gradient(155deg,#f9f7fb 0%,#f5eff7 55%,#f4eef9 100%)}
.cp-page,.cp-page *{box-sizing:border-box;font-family:var(--cp-font)!important}
.cp-page :where(h1,h2,h3,h4,p){margin:0}
.cp-page :where(button,input,a){-webkit-tap-highlight-color:transparent}
.cp-page :where(button,a,input):focus-visible{outline:3px solid rgba(128,76,172,.55);outline-offset:3px}
.cp-page button:disabled{cursor:not-allowed;opacity:.53;transform:none!important}
.cp-page button,.cp-page a.cp-btn{box-shadow:none!important;filter:none!important;text-shadow:none!important}
.cp-main{width:min(1340px,100%);margin-inline:auto;padding:clamp(22px,3.8vw,44px) clamp(15px,3vw,32px) 92px}
.cp-glass{isolation:isolate;position:relative;min-width:0;border-radius:30px;border:1px solid var(--cp-edge);background:linear-gradient(135deg,rgba(255,255,255,.82) 0%,rgba(255,255,255,.52) 37%,rgba(250,244,255,.53) 100%);box-shadow:0 18px 56px rgba(66,47,94,.075),inset 0 1px 0 rgba(255,255,255,.97);backdrop-filter:blur(30px) saturate(165%);-webkit-backdrop-filter:blur(30px) saturate(165%)}
.cp-glass::before{content:"";pointer-events:none;position:absolute;inset:1px 1px auto 1px;height:45%;z-index:-1;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.28),transparent)}
.cp-hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(300px,.76fr);align-items:stretch;gap:clamp(21px,3vw,42px);padding:clamp(23px,3.4vw,42px);overflow:hidden}
.cp-hero::after{content:"";position:absolute;pointer-events:none;width:430px;height:430px;right:-160px;top:-180px;border-radius:50%;background:radial-gradient(circle,rgba(216,178,237,.35),transparent 70%);z-index:-1}
.cp-hero-primary{min-width:0;display:flex;flex-direction:column;gap:24px}
.cp-hero-topline{display:flex;align-items:center;flex-wrap:wrap;gap:9px;font-size:10px;font-weight:750;letter-spacing:.14em;color:#836486;text-transform:uppercase}
.cp-crest{display:grid;place-items:center;width:36px;height:36px;border:1px solid rgba(255,255,255,.9);border-radius:14px;background:linear-gradient(145deg,#fff5de,#f9e6c3);font-size:18px}
.cp-hero-split{padding:0 5px;color:#b59fbc}
.cp-edition{margin-left:auto;border:1px solid #e8d8ec;background:rgba(255,255,255,.55);padding:7px 11px;border-radius:99px;font-size:9px;letter-spacing:.11em}
.cp-hero-intro{display:grid;gap:9px;max-width:640px}
.cp-eyebrow{color:#86638b;font-size:10px;letter-spacing:.155em;font-weight:760;text-transform:uppercase;line-height:1.5}
.cp-page .cp-title{font-family:var(--cp-font)!important;color:var(--cp-ink);font-size:clamp(34px,3.5vw,52px)!important;line-height:1.045!important;font-weight:780!important;letter-spacing:-.055em!important;text-transform:none!important;margin:0!important;max-width:670px;overflow-wrap:normal}
.cp-title em{font-style:normal;color:#94619b}
.cp-hero-description,.cp-sub{color:var(--cp-muted);font-size:13px;line-height:1.65}
.cp-hero-description{max-width:480px}
.cp-identity-layout{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:15px;margin-top:auto;align-items:stretch}
.cp-identity-main{display:flex;flex-direction:column;justify-content:center;min-width:0;gap:13px}
.cp-person{display:flex;align-items:center;gap:13px;margin-top:0;min-width:0}
.cp-person-copy{min-width:0;overflow:hidden}
.cp-avatar{width:68px;height:68px;border:3px solid rgba(255,255,255,.96);border-radius:22px;object-fit:cover;flex-shrink:0;box-shadow:0 5px 14px rgba(61,39,75,.10)}
.cp-verified{display:flex;align-items:center;gap:5px;font-size:10px;line-height:1.4;letter-spacing:.06em}
.cp-page .cp-name{font-size:clamp(20px,2.05vw,28px)!important;line-height:1.2!important;letter-spacing:-.035em!important;font-weight:780!important;margin:4px 0 3px!important;overflow-wrap:anywhere}
.cp-handle{font-size:12px;color:#807388;overflow-wrap:anywhere}
.cp-role-list{display:flex;flex-wrap:wrap;gap:7px;margin-top:0}
.cp-role{display:inline-flex;align-items:center;gap:7px;min-width:0;max-width:100%;border:1px solid rgba(123,90,138,.16);border-radius:999px;background:rgba(255,255,255,.58);padding:8px 12px;font-size:11px;line-height:1.3;font-weight:680;box-shadow:none!important}
.cp-role img{width:19px;height:19px;object-fit:contain}
.cp-role-small{padding:7px 10px;font-size:10px}
.cp-featured-roles{gap:6px}
.cp-hero-pokemon{display:flex;align-items:center;justify-content:space-between;flex-direction:column;gap:8px;min-width:0;min-height:167px;padding:13px 11px;border-radius:21px;text-align:center;border:1px solid rgba(255,255,255,.90);background:linear-gradient(160deg,rgba(244,236,255,.69),rgba(255,255,255,.58));box-shadow:inset 0 1px white}
.cp-pokemon-topline{display:flex;align-items:center;justify-content:center;gap:4px;font-size:9px;color:#826389;font-weight:760;letter-spacing:.055em}
.cp-hero-pokemon .cp-favorite-poke{display:flex;flex-direction:column;gap:3px;min-width:0;border:0;padding:0;background:none;font-weight:700;font-size:12px}
.cp-hero-pokemon .cp-favorite-poke .cp-pokemon-small{width:78px;height:75px;filter:drop-shadow(0 8px 7px rgba(66,50,82,.13))}
.cp-fav-placeholder{display:flex;flex-direction:column;gap:5px;align-items:center;color:#82728a;font-size:10px;line-height:1.4}
.cp-fav-placeholder img{width:58px;height:61px;object-fit:contain}
.cp-favorite-link{border:0;background:none;display:inline-flex;align-items:center;gap:4px;padding:4px;color:#6e477a;font-size:10px;font-weight:800;cursor:pointer}
.cp-hero-side{display:grid;grid-template-rows:auto auto;gap:13px;min-width:0}
.cp-id-chip{position:relative;overflow:hidden;border-radius:24px;border:1px solid rgba(255,255,255,.15);background:linear-gradient(120deg,#42314e,#614266 61%,#81578b);padding:21px 20px 19px;color:white;box-shadow:0 12px 24px rgba(56,34,68,.12)}
.cp-id-chip::after{content:"";position:absolute;right:-83px;top:-107px;width:230px;height:230px;background:rgba(255,255,255,.075);border-radius:50%;pointer-events:none}
.cp-chip-top{display:flex;align-items:center;justify-content:space-between;gap:7px}
.cp-chip-label{display:inline-flex;align-items:center;gap:7px;font-size:10px;font-weight:730;letter-spacing:.12em;color:#f1dff5;text-transform:uppercase}
.cp-chip-symbol{font-size:23px;color:#eccbf7}
.cp-chip-number{font-size:clamp(22px,2vw,29px);font-weight:760;line-height:1.25;letter-spacing:.055em;font-variant-numeric:tabular-nums;word-break:break-word;margin:22px 0}
.cp-chip-bottom{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;font-size:10px;color:#e4cfec}
.cp-chip-bottom>span{display:flex;flex-direction:column;gap:5px;letter-spacing:.08em}
.cp-chip-bottom strong{font-size:13px;color:white;letter-spacing:0}
.cp-chip-actions{display:flex;gap:6px}
.cp-icon-btn{display:grid;place-items:center;width:36px;height:36px;border-radius:12px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);color:inherit;cursor:pointer;transition:background .18s}
.cp-icon-btn:hover{background:rgba(255,255,255,.22)}
.cp-mini-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.cp-mini{padding:17px 15px;border-radius:21px;min-width:0;border:1px solid rgba(255,255,255,.93);background:rgba(255,255,255,.52);box-shadow:inset 0 1px rgba(255,255,255,.9)}
.cp-mini-head{display:flex;align-items:center;gap:7px;color:#85678c;font-size:10px;font-weight:740;letter-spacing:.095em}
.cp-mini strong{display:block;font-size:clamp(22px,2.3vw,29px);letter-spacing:-.045em;line-height:1.1;font-weight:790;margin-top:10px;overflow-wrap:anywhere}
.cp-mini-points small{font-size:10px;color:#7b6d82;margin-top:17px;display:block;line-height:1.5}
.cp-level-progress{margin-top:13px;display:grid;gap:7px}
.cp-progress-track{height:8px;overflow:hidden;border-radius:999px;background:rgba(101,70,115,.12);border:1px solid rgba(121,84,135,.09)}
.cp-progress-track>span{height:100%;display:block;min-width:0;border-radius:999px;background:linear-gradient(90deg,#b488d9,#8f68c9 60%,#7757b4);transition:width .6s cubic-bezier(.2,.7,.1,1)}
.cp-progress-label{display:flex;align-items:center;justify-content:space-between;gap:6px;color:#796d83;font-size:10px;font-variant-numeric:tabular-nums}
.cp-level-progress small{font-size:10px;color:#795e84;line-height:1.35;letter-spacing:0;text-transform:none}
.cp-money-below{display:grid;gap:6px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(123,83,137,.15)}
.cp-money-below span{display:flex;align-items:center;gap:6px;color:#826388;letter-spacing:.06em;font-weight:750;font-size:10px}
.cp-money-below b{font-size:clamp(14px,1.5vw,18px);letter-spacing:-.02em;line-height:1.3;word-break:break-word;color:#3a2d46}
.cp-nav-intro{display:flex;justify-content:space-between;align-items:center;gap:13px;margin:25px 3px 11px}
.cp-nav-intro>div>p:last-child{font-size:12px;color:#7e7187;margin-top:4px}
.cp-tabs{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0 0 24px;padding:0}
.cp-tab{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:15px;padding:11px 16px;border:1px solid rgba(132,103,149,.20);background:rgba(255,255,255,.56);color:#604a68;font-weight:690;font-size:12px;cursor:pointer;transition:background .16s,border-color .16s,color .16s;box-shadow:none!important}
.cp-tab:hover{background:rgba(255,255,255,.85)}
.cp-tab[data-active=true]{background:#64406f;color:white;border-color:#64406f}
.cp-content{display:grid;gap:20px;min-width:0}
.cp-panel{padding:clamp(21px,2.8vw,33px);overflow:hidden}
.cp-panel-header{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:22px}
.cp-page .cp-panel h2{font-size:clamp(23px,2.55vw,33px)!important;font-weight:780!important;letter-spacing:-.045em!important;line-height:1.18!important;max-width:100%;margin:4px 0 0!important}
.cp-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:19px}
.cp-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.cp-fact{padding:15px;border-radius:17px;border:1px solid rgba(143,114,158,.13);background:rgba(255,255,255,.52);min-width:0}
.cp-fact small{display:block;font-size:10px;line-height:1.5;color:#807187;font-weight:720;text-transform:uppercase;letter-spacing:.08em}
.cp-fact strong{display:block;margin-top:8px;font-size:14px;font-weight:740;overflow-wrap:anywhere}
.cp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;text-align:center;border-radius:14px;min-height:41px;padding:10px 15px;background:#664471;color:white;text-decoration:none;border:1px solid #664471;font-size:12px;font-weight:760;cursor:pointer;line-height:1.3;transition:background .17s,border-color .17s,transform .17s;box-shadow:none!important}
.cp-btn:hover{background:#55365f;border-color:#55365f;transform:translateY(-1px)}
.cp-btn-light{background:rgba(255,255,255,.58);color:#665073;border:1px solid rgba(136,103,152,.24)}
.cp-btn-light:hover{background:rgba(255,255,255,.88);border-color:rgba(136,103,152,.35)}
.cp-btn-red{background:#9c4664;border-color:#9c4664}
.cp-notice{font-size:12px;line-height:1.65;border-radius:16px;padding:13px 15px;background:rgba(112,81,128,.07);border:1px solid rgba(112,81,128,.1);color:#634c70}
.cp-danger{background:#ffedf0;color:#8f3452;border-color:#f1c6d0}
.cp-personal{display:grid;grid-template-columns:150px minmax(0,1fr);align-items:center;gap:22px}
.cp-singer{display:block;width:100%;max-width:185px;aspect-ratio:1;object-fit:cover;border-radius:22px;border:1px solid rgba(255,255,255,.9);background:#e5d8e9;box-shadow:0 8px 24px rgba(74,46,95,.10)}
.cp-singer-placeholder{display:grid;place-items:center;font-size:48px}
.cp-form{display:grid;gap:16px;max-width:700px}
.cp-label{display:block;font-size:11px;font-weight:750;color:#66556f;margin-bottom:8px}
.cp-input{display:block;width:100%;max-width:100%;border-radius:14px;border:1px solid rgba(131,102,147,.27);background:rgba(255,255,255,.75);padding:12px 14px;outline:0;color:var(--cp-ink);font-size:13px;transition:border-color .17s,background .17s}
.cp-input:focus{background:#fff;border-color:#8660a0;outline:3px solid rgba(136,96,160,.13)}
.cp-upload-tile{display:flex;align-items:center;gap:13px;padding:16px;border-radius:18px;border:1px dashed rgba(130,99,150,.48);background:rgba(255,255,255,.53);color:#755785;cursor:pointer;position:relative}
.cp-upload-tile:hover{background:rgba(255,255,255,.85)}
.cp-upload-tile strong,.cp-upload-tile small{display:block}
.cp-upload-tile strong{font-size:13px;margin-bottom:4px}
.cp-upload-tile small{font-size:11px;color:#807587;line-height:1.5}
.cp-file-input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
.cp-upload-preview{display:flex;align-items:center;gap:13px;font-size:11px;color:#75667c;overflow-wrap:anywhere}
.cp-upload-preview .cp-singer{width:80px;max-width:80px;border-radius:15px}
.cp-pet-area{min-height:146px;border-radius:21px;position:relative;overflow:hidden;padding:16px;background:linear-gradient(180deg,rgba(226,223,248,.72),rgba(246,241,255,.79) 68%,rgba(194,220,201,.67) 69%);border:1px solid rgba(130,126,170,.19)}
.cp-pet-name{position:relative;z-index:2;display:inline-flex;border-radius:99px;padding:7px 11px;font-size:11px;font-weight:730;background:rgba(255,255,255,.72);color:#584a67;text-transform:capitalize}
.cp-pet-walker{position:absolute;bottom:19px;left:0;font-size:53px;animation:cpWalk 11s ease-in-out infinite;filter:drop-shadow(0 6px 5px rgba(35,31,45,.12));transform-origin:bottom center}
@keyframes cpWalk{0%{left:7%;transform:translateY(0) scaleX(1)}25%{transform:translateY(-8px) scaleX(1)}48%{left:76%;transform:translateY(0) scaleX(1)}52%{transform:scaleX(-1)}75%{transform:translateY(-6px) scaleX(-1)}98%{left:7%;transform:scaleX(-1)}100%{left:7%;transform:scaleX(1)}}
.cp-registry-top,.cp-rotomi-head{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.cp-registry-logo,.cp-rotomi-logo{width:78px;height:78px;object-fit:contain;padding:8px;border-radius:21px;background:rgba(255,255,255,.82);border:1px solid rgba(255,255,255,.9)}
.cp-person-row{display:flex;align-items:center;gap:12px;border:1px solid rgba(255,255,255,.84);border-radius:17px;background:rgba(255,255,255,.5);padding:14px;min-width:0}
.cp-person-row img{width:43px;height:43px;border-radius:14px;object-fit:cover}
.cp-person-row p{font-size:13px;font-weight:750;overflow-wrap:anywhere}
.cp-person-row small{display:block;margin-top:3px;color:#7d7082;font-size:11px;line-height:1.4}
.cp-certificate{display:flex;align-items:center;justify-content:space-between;gap:13px;padding:15px;border:1px solid rgba(255,255,255,.88);background:rgba(255,255,255,.52);border-radius:17px}
.cp-certificate strong{font-size:13px}
.cp-certificate small{display:block;color:#817486;font-size:11px;line-height:1.6;margin-top:4px;overflow-wrap:anywhere}
.cp-filter-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px}
.cp-search{flex:1;min-width:160px;max-width:440px}
.cp-search-wrap{position:relative;width:100%;min-width:0}
.cp-search-wrap>svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#8b7592;pointer-events:none}
.cp-search-wrap>.cp-input{padding-left:42px}
.cp-poke-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}
.cp-poke-card{position:relative;min-width:0;text-align:center;border-radius:21px;padding:15px;background:rgba(255,255,255,.57);border:1px solid rgba(255,255,255,.9);box-shadow:none}
.cp-poke-card[data-shiny=true]{background:rgba(255,247,210,.67);border-color:rgba(225,195,100,.45)}
.cp-pokemon-art{height:116px;max-width:100%;width:100%;object-fit:contain;filter:drop-shadow(0 7px 6px rgba(57,45,65,.12))}
.cp-pokemon-small{height:38px;width:38px}
.cp-poke-card h3{font-size:13px;margin:3px 0 0;font-weight:770;overflow-wrap:anywhere;text-transform:capitalize}
.cp-poke-meta{margin:8px 0 13px;color:#7f7285;font-size:11px}
.cp-shiny-label{color:#a87b36;font-size:10px;font-weight:780}
.cp-favorite-poke{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:99px;background:rgba(255,255,255,.68);font-size:12px;font-weight:750;border:1px solid rgba(255,255,255,.9);text-transform:capitalize}
.cp-pagination{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:22px}
.cp-footer-action{display:flex;justify-content:center;margin-top:10px}
.cp-overlay{position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;padding:18px;overflow-y:auto;background:rgba(35,22,44,.43);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.cp-dialog{width:min(500px,100%);max-height:calc(100vh - 36px);overflow-y:auto;padding:clamp(20px,3vw,30px);border-radius:28px;border:1px solid rgba(255,255,255,.9);background:linear-gradient(135deg,rgba(255,255,255,.96),rgba(252,245,255,.94));box-shadow:0 28px 80px rgba(39,21,52,.21);color:var(--cp-ink)}
.cp-recipient-results{display:grid;gap:7px;max-height:210px;overflow:auto;margin-top:11px}
.cp-directory-search{margin:19px 0 13px;max-width:550px}
.cp-directory-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
.cp-public-result{display:flex;align-items:center;gap:11px;width:100%;min-width:0;text-align:left;padding:12px;border-radius:18px;border:1px solid rgba(255,255,255,.95);background:rgba(255,255,255,.54);color:var(--cp-ink);cursor:pointer;transition:background .16s,border-color .16s}
.cp-public-result:hover{background:rgba(255,255,255,.94);border-color:rgba(146,114,161,.40)}
.cp-public-result img{width:44px;height:44px;border-radius:15px;object-fit:cover;flex-shrink:0}
.cp-public-result>span{display:grid;min-width:0;gap:4px;flex:1}
.cp-public-result strong{font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cp-public-result small{font-size:11px;color:#857489}
.cp-public-result>svg{color:#8b7394}
.cp-public-hero{display:flex;align-items:center;gap:16px;padding:14px;border-radius:19px;background:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.82)}
.cp-public-hero>img{width:73px;height:73px;object-fit:cover;border-radius:24px}
.cp-public-hero h3{font-size:25px;letter-spacing:-.04em;margin:4px 0}
.cp-public-favorites{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin-top:17px}
.cp-public-favorites>div{min-width:0;padding:15px;background:rgba(255,255,255,.52);border:1px solid rgba(255,255,255,.83);border-radius:19px}
.cp-public-favorite{display:flex;align-items:center;gap:11px;margin-top:12px;overflow-wrap:anywhere}
.cp-public-favorite .cp-singer{width:58px;height:58px;max-width:58px;border-radius:16px;flex-shrink:0;font-size:27px}
.cp-public-favorite strong,.cp-public-animal strong{font-size:12px;overflow-wrap:anywhere}
.cp-public-pokemon{margin-top:15px}
.cp-public-animal{display:flex;align-items:center;gap:12px;margin-top:8px}
.cp-public-animal>span{font-size:36px}
.cp-public-privacy{display:flex;align-items:flex-start;gap:8px;margin-top:18px;padding:12px 14px;font-size:11px;line-height:1.6;color:#675772;background:rgba(122,103,139,.075);border-radius:14px}
.cp-public-privacy svg{flex-shrink:0;margin-top:1px}
@media(max-width:1050px){.cp-hero{grid-template-columns:minmax(0,1fr) minmax(295px,.85fr);gap:22px}.cp-identity-layout{grid-template-columns:1fr}.cp-hero-pokemon{flex-direction:row;min-height:75px;text-align:left}.cp-hero-pokemon .cp-favorite-poke{flex-direction:row}.cp-hero-pokemon .cp-favorite-poke .cp-pokemon-small{width:44px;height:47px}.cp-fav-placeholder{flex-direction:row}.cp-fav-placeholder img{width:35px;height:37px}}
@media(max-width:800px){.cp-hero{grid-template-columns:1fr}.cp-identity-layout{grid-template-columns:minmax(0,1fr) minmax(130px,170px)}.cp-hero-pokemon{flex-direction:column;text-align:center}.cp-hero-pokemon .cp-favorite-poke{flex-direction:column}.cp-hero-pokemon .cp-fav-placeholder{flex-direction:column}.cp-hero-side{grid-template-columns:1.05fr .95fr;grid-template-rows:auto;align-items:stretch}.cp-mini-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.cp-three{grid-template-columns:repeat(2,minmax(0,1fr))}.cp-poke-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.cp-public-favorites{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:620px){.cp-main{padding:18px 12px 65px}.cp-hero{padding:23px 18px;gap:18px;border-radius:25px}.cp-page .cp-title{font-size:clamp(31px,8vw,43px)!important}.cp-hero-primary{gap:20px}.cp-identity-layout{grid-template-columns:1fr}.cp-hero-pokemon{flex-direction:row;min-height:92px;text-align:left}.cp-hero-pokemon .cp-favorite-poke{flex-direction:row}.cp-hero-pokemon .cp-fav-placeholder{flex-direction:row}.cp-hero-side{grid-template-columns:1fr}.cp-hero-topline{font-size:9px}.cp-edition{display:none}.cp-two,.cp-three,.cp-directory-grid{grid-template-columns:1fr}.cp-poke-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.cp-personal{grid-template-columns:95px minmax(0,1fr);gap:14px}.cp-singer{max-width:110px;border-radius:17px}.cp-avatar{width:62px;height:62px}.cp-page .cp-name{font-size:22px!important}.cp-certificate{flex-wrap:wrap}.cp-nav-intro{align-items:flex-start;flex-direction:column}.cp-nav-intro .cp-btn{width:100%}.cp-tabs{flex-wrap:nowrap;overflow-x:auto;padding-bottom:6px;scrollbar-width:thin}.cp-tab{flex-shrink:0}.cp-panel{border-radius:24px}.cp-public-favorites{grid-template-columns:1fr}.cp-chip-number{font-size:25px}.cp-mini{min-height:0}}
@media(prefers-reduced-motion:reduce){.cp-page *, .cp-page *::before,.cp-page *::after{animation:none!important;transition:none!important}.cp-pet-walker{left:38%}}

/* 4.1 — CORRECCIONES DE COMPOSICIÓN: reserva espacios reales entre rótulos y títulos.
   Los títulos son nodos con rol heading para que el CSS global del proyecto no los vuelva gigantes. */
.cp-page .cp-panel-header{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:clamp(14px,2.5vw,26px)!important;flex-wrap:wrap!important;margin-bottom:clamp(18px,2.5vw,26px)!important;min-width:0}
.cp-page .cp-panel-heading{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:clamp(10px,1.4vw,14px)!important;min-width:0;flex:1 1 260px;padding:0!important;margin:0!important;position:static!important;transform:none!important}
.cp-page .cp-panel-eyebrow{display:block!important;position:static!important;inset:auto!important;transform:none!important;line-height:1.5!important;min-height:15px!important;margin:0!important;padding:0!important;white-space:normal;overflow-wrap:anywhere}
.cp-page .cp-panel-title{display:block!important;position:static!important;inset:auto!important;transform:none!important;max-width:100%!important;min-width:0;font-size:clamp(27px,3.0vw,39px)!important;font-weight:750!important;letter-spacing:-.042em!important;line-height:1.14!important;margin:0!important;padding:0!important;color:var(--cp-ink)!important;overflow-wrap:anywhere!important;text-wrap:balance}
.cp-page .cp-panel-action{flex:0 0 auto;min-width:0;align-self:center;display:flex;align-items:center;justify-content:flex-end;max-width:100%}
.cp-page .cp-hero-intro{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:clamp(12px,1.7vw,18px)!important;padding:6px 0 12px!important;min-width:0}
.cp-page .cp-hero-intro>.cp-eyebrow{display:block!important;position:static!important;line-height:1.5!important;margin:0!important;padding:0!important;transform:none!important;max-width:100%}
.cp-page .cp-hero-intro>.cp-title{display:block!important;position:static!important;transform:none!important;inset:auto!important;font-size:clamp(34px,3.5vw,50px)!important;font-weight:760!important;line-height:1.09!important;letter-spacing:-.045em!important;max-width:100%!important;min-width:0!important;overflow-wrap:break-word!important;margin:0!important;padding:0!important;text-wrap:balance}
.cp-page .cp-hero-description{position:static!important;margin:0!important;line-height:1.6!important}
.cp-page .cp-progress-label{font-size:11px;line-height:1.45;flex-wrap:wrap}
.cp-page .cp-level-progress small{font-size:11px;line-height:1.5}
.cp-page .cp-mini-stats{align-items:stretch}
.cp-page .cp-mini{display:flex;flex-direction:column;gap:0}
.cp-page .cp-money-below{margin-top:auto;padding-top:14px}
@media(max-width:620px){.cp-page .cp-panel-title{font-size:clamp(26px,7.2vw,34px)!important}.cp-page .cp-hero-intro>.cp-title{font-size:clamp(33px,8.5vw,43px)!important}.cp-page .cp-panel-action{align-self:flex-start}.cp-page .cp-panel-heading{flex-basis:100%}.cp-page .cp-hero-intro{gap:11px!important}}
    `}</style>
    <Header />
    <main className="cp-main">
      {loading ? <Panel title="Cargando tu carpeta..." eyebrow="Estado Paniense"><p className="cp-sub">Verificando la sesión y el Registro Civil.</p></Panel>
      : error ? <Panel title="No se pudo abrir tu carpeta" eyebrow="Acceso"><p className="cp-notice cp-danger">{error}</p><a className="cp-btn" style={{ marginTop: 15 }} href="/auth/discord">Entrar con Discord</a></Panel>
      : !citizen ? null
      : !citizen.inGuild ? <Panel title="Únete al Estado Paniense" eyebrow="Acceso ciudadano"><p className="cp-sub">Para acceder necesitas pertenecer al servidor oficial de Discord.</p><a className="cp-btn" style={{ marginTop: 17 }} href="https://discord.gg/reino-del-pan-1381359904731693056" target="_blank" rel="noreferrer">Unirme al Estado</a></Panel>
      : !citizen.dpi ? <Panel title="Todavía no tienes DPI" eyebrow="Registro de identidad"><p className="cp-sub">Crea tu documento, verifícalo en Discord y regresa a esta carpeta.</p><Link className="cp-btn" style={{ marginTop: 16 }} href="/dpi/create">Crear mi DPI</Link></Panel>
      : <>
        <motion.section className="cp-glass cp-hero" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="cp-hero-primary">
            <div className="cp-hero-topline"><span className="cp-crest">🍞</span><span>ESTADO PANIENSE <span className="cp-hero-split">/</span> PORTAL CIUDADANO</span><span className="cp-edition">MI ESPACIO</span></div>
            <div className="cp-hero-intro">
              <p className="cp-eyebrow">Tu hogar digital en el Estado</p>
              <div className="cp-title" role="heading" aria-level={1}>Tu rincón, <em>a tu manera.</em></div>
              <p className="cp-hero-description">Tu identidad, tus recuerdos y tus Pokémon. Todo en un mismo lugar.</p>
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
                  {featuredRoles.length ? featuredRoles.map(r => <RoleBadge key={r.discord_role_id} role={r} compact />) : <span className="cp-role cp-role-small">🪪 Ciudadano del Estado</span>}
                </div>
              </div>
              <div className="cp-hero-pokemon" aria-label="Pokémon favorito">
                <span className="cp-pokemon-topline"><Zap size={13} /> MI COMPAÑERO POKÉMON</span>
                {profile?.pokemon_favorito
                  ? <FavoritePokemon name={profile.pokemon_favorito} />
                  : <div className="cp-fav-placeholder"><img src="/rotomi.png" alt="Rotomi" /><span>Tu Pokémon favorito aparecerá aquí</span></div>}
                <button type="button" className="cp-favorite-link" onClick={() => setTab("rotomi")}>Ver mi PC <ChevronRight size={14} /></button>
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
              <div className="cp-mini cp-mini-level"><div className="cp-mini-head"><Award size={16} /><span>NIVEL</span></div><strong>{fmtNum(progress?.level ?? citizen.level)}</strong>
                <div className="cp-level-progress" aria-label="Progreso de experiencia al siguiente nivel">
                  <div className="cp-progress-track" role="progressbar" aria-valuenow={progress?.percent ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso al siguiente nivel"><span style={{ width: `${progress?.percent ?? 0}%` }} /></div>
                  <div className="cp-progress-label"><span>{progress ? `${fmtNum(progress.xp)} / ${fmtNum(progress.target)} XP` : "Cargando XP"}</span><span>{progress ? `${progress.percent}%` : "—"}</span></div>
                  <small>{progress ? `${fmtNum(progress.remaining)} XP para nivel ${progress.level + 1}` : "Sincronizando nivel"}</small>
                </div>
                <div className="cp-money-below"><span><Wallet size={14} /> DINERO TOTAL</span><b>{citizen.economy ? `${fmtNum((citizen.economy.cash || 0) + (citizen.economy.bank || 0))} Ᵽ` : "—"}</b></div>
              </div>
              <div className="cp-mini cp-mini-points"><div className="cp-mini-head"><Star size={16} /><span>PUNTOS BASE</span></div><strong>{fmtNum(pbValue(citizen.puntos_elo))}</strong><small>Tu progreso en el Estado</small></div>
            </div>
          </aside>
        </motion.section>

        <div className="cp-nav-intro"><div><p className="cp-eyebrow">Tu espacio digital</p><p>Explora tus secciones y descubre a otros ciudadanos.</p></div><button className="cp-btn cp-btn-light" type="button" onClick={() => setTab("carpetas")}><FolderOpen size={16} /> Buscar carpetas</button></div>
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
              {editing ? <div className="cp-form cp-editing">
                <label><span className="cp-label">Cantante favorito</span><input className="cp-input" maxLength={90} value={form.cantante_favorito} onChange={e => setForm({ ...form, cantante_favorito: e.target.value })} placeholder="Ej. Aitana" /></label>
                <label className="cp-upload-tile"><UploadCloud size={21} /><span><strong>Foto del cantante</strong><small>Selecciona una imagen de tu dispositivo · JPG, PNG o WebP · máximo 2 MB</small></span><input className="cp-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={e => chooseSingerImage(e.currentTarget.files?.[0])} /></label>
                {(imagePreview || profile?.cantante_imagen) && <div className="cp-upload-preview"><SingerImage src={imagePreview || profile?.cantante_imagen} alt="Vista previa del cantante" /><span>{imageFile ? `Nueva foto: ${imageFile.name}` : "Foto actual del perfil"}</span></div>}
                <label><span className="cp-label">Animal favorito (se animará en el jardín)</span><input className="cp-input" list="cp-pets" maxLength={60} value={form.animal_favorito} onChange={e => setForm({ ...form, animal_favorito: e.target.value })} placeholder="Ej. Gato, perro, delfín..." /><datalist id="cp-pets">{PETS.map(p => <option key={p.label} value={p.words[0]} />)}</datalist></label>
                <div><button className="cp-btn" onClick={() => void saveProfile()} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button></div>
              </div> : <div className="cp-two" style={{ alignItems: "center" }}>
                <div className="cp-personal">
                  <SingerImage src={profile?.cantante_imagen} alt={`Imagen de ${profile?.cantante_favorito || "cantante"}`} />
                  <div><p className="cp-eyebrow">La banda sonora de tu vida</p><p style={{ fontSize: 21, fontWeight: 850, marginTop: 8 }}>{profile?.cantante_favorito || "Sin cantante favorito"}</p><p className="cp-sub">Tu música, tus favoritos y tu pequeño mundo.</p></div>
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
            <Panel title="Registro Civil del Estado" eyebrow="Patrocinado por el Registro Civil" action={<button className="cp-btn cp-btn-light" onClick={() => void refreshFamily()} disabled={familyLoading}><RefreshCw size={15} />Actualizar</button>}>
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
                  <button className="cp-btn cp-btn-light" style={{ width: "100%", padding: "9px 7px" }} disabled={typeof c.id !== "number" || !Number.isSafeInteger(c.id) || c.id <= 0} title={!c.id ? "Falta ID de captura en Supabase" : "Transferir Pokémon"} onClick={() => { setTransfer(c); setRecipient(""); setRecipientQuery(""); setRecipientVerified(null); setTransferMessage(""); }}><ArrowLeftRight size={13} /> Transferir</button>
                </article>)}</div>
                {!visible.length && <p className="cp-notice">{captures.length ? "No hay Pokémon que coincidan con los filtros." : "Tu PC está vacío. ¡Captura Pokémon con el bot para llenar las cajas!"}</p>}
                {totalPages > 1 && <div className="cp-pagination"><button className="cp-btn cp-btn-light" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} aria-label="Página anterior"><ChevronLeft size={18} /></button><span className="cp-sub">Caja {page + 1} de {totalPages}</span><button className="cp-btn cp-btn-light" disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} aria-label="Página siguiente"><ChevronRight size={18} /></button></div>}
              </>}
              {transferMessage && !transfer && <p className="cp-notice" role="status" style={{ marginTop: 13 }}>{transferMessage}</p>}
            </Panel>
          </>}

          {tab === "roles" && <Panel title="Mis distintivos y roles" eyebrow="Identidad dentro del Estado" action={<Award color="#9d6290" size={26} />}>
            <p className="cp-sub" style={{ marginBottom: 18 }}>Los emblemas especiales y de equipos son los mismos que aparecen junto a tu nombre de ciudadano registrado.</p>
            {roles.length ? Object.entries(groupedRoles).sort(([a], [b]) => (a === "equipos" ? -1 : b === "equipos" ? 1 : a === "especiales" ? -1 : b === "especiales" ? 1 : 0)).map(([category, group]) => <div key={category} style={{ marginBottom: 23 }}><p className="cp-eyebrow" style={{ marginBottom: 10 }}>{CATEGORY_TITLES[category] || category}</p><div className="cp-role-list">{group.map(r => <RoleBadge key={r.discord_role_id} role={r} />)}</div></div>) : <p className="cp-notice">Todavía no tienes roles registrados.</p>}
          </Panel>}
          {tab === "carpetas" && <>
            <Panel title="Carpetas ciudadanas" eyebrow="Directorio del Estado Paniense" action={<FolderOpen size={26} color="#8b6696" />}>
              <p className="cp-sub">Busca por nombre de usuario de Discord. Solo se muestran perfiles verificados con información pública limitada.</p>
              <div className="cp-directory-search cp-search-wrap"><Search size={18} /><input className="cp-input" placeholder="Escribe un nombre de usuario..." maxLength={40} value={directorySearch} onChange={e => { setDirectorySearch(e.target.value); setPublicCitizen(null); setPublicError(""); }} autoComplete="off" aria-label="Buscar carpetas por nombre de usuario" /></div>
              {directoryLoading && <p className="cp-sub">Buscando ciudadanos...</p>}
              {directoryResults.length > 0 && <div className="cp-directory-grid">
                {directoryResults.map(person => <button type="button" className="cp-public-result" key={person.id} onClick={() => void openPublicFolder(person)}><AvatarImage src={person.avatar} alt="" /><span><strong>@{person.username}</strong><small>Carpeta pública</small></span><ChevronRight size={16} /></button>)}
              </div>}
              {directorySearch.trim().length > 1 && !directoryLoading && directoryResults.length === 0 && <p className="cp-notice" style={{ marginTop: 15 }}>No hay ciudadanos verificados que coincidan con esa búsqueda.</p>}
              {publicLoading && <p className="cp-notice">Abriendo carpeta pública...</p>}
              {publicError && <p className="cp-notice cp-danger" role="alert">{publicError}</p>}
            </Panel>
            {publicCitizen && <Panel title={`La carpeta de @${publicCitizen.username}`} eyebrow="Vista pública · Privacidad protegida" action={<button type="button" className="cp-btn cp-btn-light" onClick={() => setPublicCitizen(null)}><X size={15} /> Cerrar</button>}>
              <div className="cp-public-hero"><AvatarImage src={publicCitizen.avatar} alt={`Avatar de ${publicCitizen.username}`} /><div><p className="cp-eyebrow">Ciudadano del Estado Paniense</p><h3>@{publicCitizen.username}</h3><p className="cp-sub">{publicCitizen.level !== null ? `Nivel ${publicCitizen.level}` : "Ciudadano verificado"}</p></div></div>
              <div className="cp-public-favorites">
                <div><p className="cp-eyebrow">Su música</p><div className="cp-public-favorite"><SingerImage src={publicCitizen.cantante_imagen} alt="Cantante favorito" /><strong>{publicCitizen.cantante_favorito || "Sin definir"}</strong></div></div>
                <div><p className="cp-eyebrow">Su compañero Pokémon</p><div className="cp-public-pokemon">{publicCitizen.pokemon_favorito ? <FavoritePokemon name={publicCitizen.pokemon_favorito} /> : <span>⚡ Sin elegir</span>}</div></div>
                <div><p className="cp-eyebrow">Su animal favorito</p><div className="cp-public-animal"><span>{petEmoji(publicCitizen.animal_favorito || "")}</span><strong>{publicCitizen.animal_favorito || "Sin elegir"}</strong></div></div>
              </div>
              <p className="cp-public-privacy"><LockKeyhole size={15} /> Por privacidad, no se publican DPI, datos de nacimiento, domicilio, economía, relaciones familiares ni documentos del Registro Civil.</p>
            </Panel>}
          </>}
          <div className="cp-footer-action"><a href="/auth/logout" className="cp-btn cp-btn-light"><LogOut size={15} /> Cerrar sesión de Discord</a></div>
        </div>
      </>}
    </main>
    <Footer />
    {transfer && <div className="cp-overlay" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget && !transferBusy) setTransfer(null); }}>
      <section className="cp-dialog" role="dialog" aria-modal="true" aria-labelledby="cp-transfer-title">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><div><p className="cp-eyebrow">Rotomi · Transferencia segura</p><h2 id="cp-transfer-title" style={{ fontSize: 24, fontWeight: 850, marginTop: 5 }}>Enviar un Pokémon</h2></div><button className="cp-btn cp-btn-light" style={{ padding: 9 }} onClick={() => setTransfer(null)} disabled={transferBusy} aria-label="Cerrar"><X size={18} /></button></div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "18px 0" }}><PokemonArt id={transfer.pokemon_id} shiny={transfer.is_shiny} label={transfer.pokemon_name} size="small" /><div><strong style={{ textTransform: "capitalize" }}>{transfer.pokemon_name} {transfer.is_shiny ? "✨" : ""}</strong><p className="cp-sub">Nivel {transfer.level} · Captura #{transfer.id}</p></div></div>
        <label><span className="cp-label">Buscar destinatario por nombre de usuario</span><div className="cp-search-wrap"><Search size={18} /><input className="cp-input" placeholder="Busca a alguien de Discord, por ejemplo Alex" value={recipientQuery} maxLength={40} autoComplete="off" disabled={transferBusy || recipientChecking} onChange={e => { setRecipientQuery(e.target.value); setRecipient(""); setRecipientVerified(null); setTransferMessage(""); }} /></div></label>
        {recipientSearching && <p className="cp-sub" style={{ marginTop: 10 }}>Buscando ciudadanos...</p>}
        {!!recipientMatches.length && <div className="cp-recipient-results">{recipientMatches.map(person => <button type="button" className="cp-public-result" key={person.id} onClick={() => void verifyRecipient(person.id)} disabled={recipientChecking}><AvatarImage src={person.avatar} alt="" /><span><strong>@{person.username}</strong><small>Seleccionar destinatario</small></span><ChevronRight size={17} /></button>)}</div>}
        {recipientChecking && <p className="cp-sub" style={{ marginTop: 10 }}>Comprobando destinatario y DPI...</p>}
        {recipientQuery.trim().length >= 2 && !recipientSearching && !recipientMatches.length && !recipientVerified && !recipientChecking && <p className="cp-sub" style={{ marginTop: 10 }}>Si no aparece, comprueba su nombre de usuario y que tenga DPI verificado.</p>}
        {recipientVerified && <div className="cp-person-row" style={{ marginTop: 12 }}>
          <AvatarImage src={recipientVerified.avatar} alt="" />
          <div><p>{recipientVerified.username}</p><small>Cuenta verificada · Confirma que es la persona correcta</small></div>
        </div>}
        <p className="cp-notice" style={{ marginTop: 13 }}>La transferencia es definitiva. El Pokémon desaparecerá de tu PC y pasará al del destinatario; no se duplicará.</p>
        {transferMessage && <p role="alert" className="cp-notice cp-danger" style={{ marginTop: 12 }}>{transferMessage}</p>}
        <button className="cp-btn" style={{ width: "100%", marginTop: 16 }} onClick={() => void transferPokemon()} disabled={transferBusy || !recipientVerified || recipientVerified.id !== recipient || recipient === citizen?.id}><ArrowLeftRight size={16} />{transferBusy ? "Procesando..." : "Confirmar transferencia"}</button>
      </section>
    </div>}
  </div>;
}
