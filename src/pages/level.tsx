import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
    TIPOS
───────────────────────────────────────────── */
interface RankUser {
    posicion: number;
    id: string; // discord_id de tu tabla usuarios
    username: string; // username de tu tabla usuarios
    level: number;
    xp: number;
    total_xp: number;
    messages: number;
    avatar: string; // Este campo recibirá el valor de avatar_url de la BD
}

interface LeaderboardData {
    top5: RankUser[];
    rankingCompleto: RankUser[];
    destacados: {
        masMensajes: RankUser | null;
        menosMensajes: RankUser | null;
    };
}

/* Perfil extendido de un usuario (tabla public.usuarios), usado en la
   ventana emergente tipo Instagram. El discord_id NUNCA se muestra. */
interface UserProfile {
    username: string;
    avatar_url: string;
    insta: string | null;
    tiktok: string | null;
    x_twitter: string | null;
    cantante_favorito: string | null;
    cantante_imagen: string | null;
    pokemon_favorito: string | null;
    animal_favorito: string | null;
    equipo_futbol: string | null;
}

/* ─────────────────────────────────────────────
    HELPERS
───────────────────────────────────────────── */
const XP_PER_LEVEL = 500;

function xpProgress(xp: number): number {
    return Math.min(100, Math.round(((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100));
}

function formatNumber(n: number): string {
    return n.toLocaleString("es-ES");
}

/**
 * Procesa el avatar_url de la tabla public.usuarios.
 * Soporta URLs completas almacenadas en la base de datos o hashes nativos de Discord.
 */
function getValidAvatar(user: RankUser): string {
    const src = user.avatar?.trim();

    // 1. Si ya viene una URL directa y válida almacenada en avatar_url
    if (src && src.startsWith("http") && !src.includes("null") && !src.includes("undefined")) {
        return src;
    }

    // 2. Si sólo se guardó el hash binario/texto del avatar de Discord, construimos su CDN usando el id
    if (src && src.length > 5 && !src.startsWith("http") && user.id) {
        return `https://cdn.discordapp.com/avatars/${user.id}/${src}.png?size=128`;
    }

    // 3. Fallback: Si no hay avatar, usamos el sistema por defecto de Discord basado en su ID
    if (user.id) {
        try {
            const lastDigit = Number(user.id.slice(-2)) || 0;
            return `https://cdn.discordapp.com/embed/avatars/${lastDigit % 6}.png`;
        } catch {
            return "https://cdn.discordapp.com/embed/avatars/0.png";
        }
    }

    return "https://cdn.discordapp.com/embed/avatars/0.png";
}

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).src = "https://cdn.discordapp.com/embed/avatars/0.png";
};

const MEDAL: Record<number, string> = { 1: "👑", 2: "🥈", 3: "🥉" };

/* Emojis para los animales favoritos del perfil de usuario */
const ANIMAL_EMOJIS: Record<string, string> = {
    perro: "🐶", dog: "🐶",
    gato: "🐱", cat: "🐱",
    conejo: "🐰", rabbit: "🐰",
    leon: "🦁", león: "🦁", lion: "🦁",
    tigre: "🐯", tiger: "🐯",
    oso: "🐻", bear: "🐻",
    panda: "🐼",
    zorro: "🦊", fox: "🦊",
    lobo: "🐺", wolf: "🐺",
    caballo: "🐴", horse: "🐴",
    vaca: "🐮", cow: "🐮",
    cerdo: "🐷", pig: "🐷",
    rana: "🐸", frog: "🐸",
    mono: "🐵", monkey: "🐵",
    pollo: "🐔", gallina: "🐔", chicken: "🐔",
    pinguino: "🐧", pingüino: "🐧", penguin: "🐧",
    aguila: "🦅", águila: "🦅", eagle: "🦅",
    buho: "🦉", búho: "🦉", owl: "🦉",
    delfin: "🐬", delfín: "🐬", dolphin: "🐬",
    ballena: "🐳", whale: "🐳",
    tiburon: "🦈", tiburón: "🦈", shark: "🦈",
    serpiente: "🐍", snake: "🐍",
    tortuga: "🐢", turtle: "🐢",
    elefante: "🐘", elephant: "🐘",
    jirafa: "🦒", giraffe: "🦒",
    koala: "🐨",
    hamster: "🐹", hámster: "🐹",
    ardilla: "🐿️", squirrel: "🐿️",
    murcielago: "🦇", murciélago: "🦇", bat: "🦇",
    cabra: "🐐", goat: "🐐",
    oveja: "🐑", sheep: "🐑",
    pato: "🦆", duck: "🦆",
    caballito_de_mar: "🐴",
};

function getAnimalEmoji(animal: string | null | undefined): string {
    if (!animal) return "🐾";
    const key = animal.trim().toLowerCase();
    return ANIMAL_EMOJIS[key] || "🐾";
}

/* ─────────────────────────────────────────────
    SKELETON
───────────────────────────────────────────── */
function SkeletonBlock({ w, h, radius = 6 }: { w: string | number; h: number; radius?: number }) {
    return (
        <div style={{
            width: w,
            height: h,
            borderRadius: radius,
            background: "linear-gradient(90deg, var(--muted) 25%, var(--secondary) 50%, var(--muted) 75%)",
            backgroundSize: "600px 100%",
            animation: "ldb-shimmer 1.5s infinite linear",
        }} />
    );
}

function LeaderboardSkeleton() {
    return (
        <>
            <style>{`@keyframes ldb-shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>
            <div style={{ width: "100%", padding: "3rem 1rem", display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <SkeletonBlock w={240} h={36} />
                    <SkeletonBlock w={180} h={12} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8, padding: "1rem 0" }}>
                    {[110, 82, 60].map((h, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
                            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(90deg, var(--muted) 25%, var(--secondary) 50%, var(--muted) 75%)", backgroundSize: "600px 100%", animation: "ldb-shimmer 1.5s infinite linear" }} />
                            <SkeletonBlock w="100%" h={h} radius={6} />
                        </div>
                    ))}
                </div>
                <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                            <SkeletonBlock w={24} h={18} />
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--muted)", flexShrink: 0 }} />
                            <SkeletonBlock w="40%" h={13} />
                            <div style={{ marginLeft: "auto" }}><SkeletonBlock w={52} h={22} radius={20} /></div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

/* ─────────────────────────────────────────────
    BARRA XP
───────────────────────────────────────────── */
function XPBar({ xp }: { xp: number }) {
    const pct = xpProgress(xp);
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", maxWidth: 200, marginTop: 4 }}>
            <div style={{ flex: 1, height: 4, background: "var(--muted)", borderRadius: 4, overflow: "hidden" }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    style={{ height: "100%", background: "linear-gradient(90deg, var(--accent), var(--primary))", borderRadius: 4 }}
                />
            </div>
            <span style={{ fontSize: 9, color: "var(--muted-foreground)", fontFamily: "var(--body-font)", whiteSpace: "nowrap" }}>
                {pct}%
            </span>
        </div>
    );
}

/* ─────────────────────────────────────────────
    PODIO TOP 3 (Modificado: 2º Centrado)
───────────────────────────────────────────── */
function Podium({ top3 }: { top3: RankUser[] }) {
    // Reordenamos el array de renderizado para que el orden visual de izquierda a derecha sea: 2º - 1º - 3º
    const order = [
        top3.find(u => u.posicion === 2),
        top3.find(u => u.posicion === 1),
        top3.find(u => u.posicion === 3),
    ].filter(Boolean) as RankUser[];

    // He modificado las alturas de los bloques para equilibrar el diseño con el 2º en el centro.
    // Ahora el 1º es el más alto (120px), el 2º es el mediano (95px) y el 3º el más bajo (70px).
    const podiumHeight: Record<number, number> = { 1: 120, 2: 95, 3: 70 };
    const avatarSize: Record<number, number> = { 1: 72, 2: 62, 3: 54 };

    const podiumBg: Record<number, string> = {
        1: "linear-gradient(180deg, var(--primary) 0%, #0a2455 100%)",
        2: "linear-gradient(180deg, var(--muted) 0%, #d4d0c8 100%)",
        3: "linear-gradient(180deg, #c8b48a 0%, #b09a70 100%)",
    };

    const topBorder: Record<number, string> = {
        1: "var(--accent)",
        2: "var(--muted-foreground)",
        3: "#b09a70",
    };

    return (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12, padding: "2rem 2rem 0", width: "100%" }}>
            {order.map((user, i) => {
                const isFirst = user.posicion === 1;
                return (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 + 0.1, type: "spring", stiffness: 200, damping: 20 }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, maxWidth: 220, width: "100%" }}
                    >
                        {/* Corona flotante para el Top 1 */}
                        <div style={{ height: 36, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                            {isFirst && (
                                <motion.span
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                                    style={{ fontSize: 24, lineHeight: 1, display: "block" }}
                                >
                                    👑
                                </motion.span>
                            )}
                        </div>

                        {/* Contenedor del Avatar */}
                        <div style={{ position: "relative", marginBottom: 10, display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <img
                                src={getValidAvatar(user)}
                                alt={user.username}
                                onError={handleImageError}
                                style={{
                                    width: avatarSize[user.posicion],
                                    height: avatarSize[user.posicion],
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: `3px solid ${topBorder[user.posicion]}`,
                                    boxShadow: isFirst ? "0 6px 24px rgba(15,50,106,0.3)" : "0 3px 10px rgba(0,0,0,0.08)",
                                    display: "block",
                                }}
                            />
                            <span style={{ position: "absolute", bottom: -4, right: -4, fontSize: 16, lineHeight: 1 }}>
                                {MEDAL[user.posicion]}
                            </span>
                        </div>

                        {/* Datos de Texto */}
                        <p style={{
                            fontSize: 13, fontWeight: 600, fontFamily: "var(--body-font)",
                            color: "var(--foreground)", textAlign: "center", marginBottom: 2,
                            width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            letterSpacing: "0.01em",
                        }}>
                            @{user.username}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "var(--body-font)", marginBottom: 12, textAlign: "center" }}>
                            Nv. {user.level}
                        </p>

                        {/* Bloque visual del podio */}
                        <div style={{
                            width: "100%",
                            height: podiumHeight[user.posicion],
                            background: podiumBg[user.posicion],
                            borderTop: `3px solid ${topBorder[user.posicion]}`,
                            borderRadius: "12px 12px 0 0",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)"
                        }}>
                            <span style={{
                                fontFamily: "var(--display-font)",
                                fontSize: isFirst ? 36 : 26,
                                color: isFirst ? "#fff" : "rgba(255,255,255,0.85)",
                                fontWeight: 400,
                                letterSpacing: "-0.02em",
                            }}>
                                {user.posicion}
                            </span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

/* ─────────────────────────────────────────────
    TARJETA DESTACADO
───────────────────────────────────────────── */
function HighlightCard({ emoji, label, user }: { emoji: string; label: string; user: RankUser }) {
    return (
        <div style={{
            padding: "20px",
            display: "flex", alignItems: "center", gap: 16,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            transition: "all 0.25s ease",
        }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(151,180,224,0.18)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.transform = "none";
            }}
        >
            <span style={{ fontSize: 28, flexShrink: 0 }}>{emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--muted-foreground)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4, fontFamily: "var(--body-font)" }}>
                    {label}
                </p>
                <p style={{ fontWeight: 600, color: "var(--primary)", fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--body-font)" }}>
                    @{user.username}
                </p>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2, fontFamily: "var(--body-font)" }}>
                    {formatNumber(user.messages)} mensajes
                </p>
            </div>
            <img
                src={getValidAvatar(user)}
                alt=""
                onError={handleImageError}
                style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }}
            />
        </div>
    );
}

/* ─────────────────────────────────────────────
    PERFIL DE USUARIO (VENTANA EMERGENTE TIPO INSTAGRAM)
───────────────────────────────────────────── */
function SocialIcon({ href, src, alt }: { href: string; src: string; alt: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "var(--muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid var(--border)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px) scale(1.06)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 16px rgba(15,50,106,0.18)";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "none";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
            }}
        >
            <img src={src} alt={alt} style={{ width: 20, height: 20, objectFit: "contain" }} />
        </a>
    );
}

function FavoriteChip({ emoji, label, value, imageSrc }: { emoji?: string; label: string; value: string; imageSrc?: string | null }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px",
            background: "var(--muted)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border)",
            width: "100%",
        }}>
            {imageSrc ? (
                <img
                    src={imageSrc}
                    alt={value}
                    onError={handleImageError}
                    style={{ width: 30, height: 30, objectFit: "contain", borderRadius: "50%", flexShrink: 0, background: "var(--card)" }}
                />
            ) : (
                <span style={{ fontSize: 20, flexShrink: 0, width: 30, textAlign: "center" }}>{emoji}</span>
            )}
            <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--muted-foreground)", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--body-font)", marginBottom: 2 }}>
                    {label}
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", fontFamily: "var(--body-font)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function UserProfileModal({ userId, onClose }: { userId: string | null; onClose: () => void }) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const [teamBadge, setTeamBadge] = useState<string | null>(null);
    const [pokemonSprite, setPokemonSprite] = useState<string | null>(null);

    // Cargar el perfil del usuario seleccionado directamente desde la tabla
    // public.usuarios de Supabase (no hace falta backend propio: todo está
    // en la tabla). El discord_id sólo se usa para la consulta, nunca se muestra.
    useEffect(() => {
        if (!userId) {
            setProfile(null);
            setTeamBadge(null);
            setPokemonSprite(null);
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setError(false);
        setProfile(null);

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
        const columns = "username,avatar_url,insta,tiktok,x_twitter,cantante_favorito,cantante_imagen,pokemon_favorito,animal_favorito,equipo_futbol";

        fetch(`${supabaseUrl}/rest/v1/usuarios?discord_id=eq.${userId}&select=${columns}`, {
            signal: controller.signal,
            headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
            },
        })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then((rows: UserProfile[]) => {
                if (Array.isArray(rows) && rows[0]) setProfile(rows[0]);
                else setError(true);
            })
            .catch(err => { if (err.name !== "AbortError") setError(true); })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [userId]);

    // Buscar el escudo del equipo de fútbol favorito (TheSportsDB, API pública gratuita)
    useEffect(() => {
        if (!profile?.equipo_futbol) { setTeamBadge(null); return; }
        const controller = new AbortController();

        fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(profile.equipo_futbol)}`, { signal: controller.signal })
            .then(r => r.json())
            .then(d => setTeamBadge(d?.teams?.[0]?.strTeamBadge ?? null))
            .catch(() => setTeamBadge(null));

        return () => controller.abort();
    }, [profile?.equipo_futbol]);

    // Buscar el sprite del Pokémon favorito (PokeAPI)
    useEffect(() => {
        if (!profile?.pokemon_favorito) { setPokemonSprite(null); return; }
        const controller = new AbortController();

        fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(profile.pokemon_favorito.trim().toLowerCase())}`, { signal: controller.signal })
            .then(r => { if (!r.ok) throw new Error("pokemon no encontrado"); return r.json(); })
            .then(d => setPokemonSprite(d?.sprites?.other?.["official-artwork"]?.front_default ?? d?.sprites?.front_default ?? null))
            .catch(() => setPokemonSprite(null));

        return () => controller.abort();
    }, [profile?.pokemon_favorito]);

    const isOpen = !!userId;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="profile-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: "fixed", inset: 0, zIndex: 100,
                        background: "rgba(15,25,45,0.55)",
                        backdropFilter: "blur(4px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "1rem",
                    }}
                >
                    <motion.div
                        key="profile-card"
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ type: "spring", stiffness: 260, damping: 24 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: "100%", maxWidth: 420,
                            maxHeight: "88vh", overflowY: "auto",
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-xl)",
                            boxShadow: "0 20px 60px rgba(15,50,106,0.25)",
                            position: "relative",
                        }}
                    >
                        <button
                            onClick={onClose}
                            aria-label="Cerrar"
                            style={{
                                position: "absolute", top: 14, right: 14,
                                width: 32, height: 32, borderRadius: "50%",
                                background: "var(--muted)", border: "1px solid var(--border)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", fontSize: 14, color: "var(--foreground)",
                                zIndex: 2,
                            }}
                        >
                            ✕
                        </button>

                        <div style={{ padding: "32px 28px 28px" }}>
                            {loading && (
                                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                        <SkeletonBlock w={88} h={88} radius={999} />
                                    </div>
                                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                        <SkeletonBlock w={140} h={16} />
                                        <SkeletonBlock w={100} h={12} />
                                    </div>
                                </div>
                            )}

                            {!loading && error && (
                                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                                    <p style={{ fontSize: 36, marginBottom: 12 }}>🧙</p>
                                    <p style={{ fontSize: 13, color: "var(--muted-foreground)", fontFamily: "var(--body-font)" }}>
                                        No fue posible cargar el perfil de este ciudadano.
                                    </p>
                                </div>
                            )}

                            {!loading && !error && profile && (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                                    <img
                                        src={profile.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png"}
                                        alt={profile.username}
                                        onError={handleImageError}
                                        style={{
                                            width: 88, height: 88, borderRadius: "50%",
                                            objectFit: "cover", border: "3px solid var(--accent)",
                                            boxShadow: "0 6px 20px rgba(15,50,106,0.2)",
                                        }}
                                    />

                                    <p style={{ fontFamily: "var(--display-font)", fontSize: 22, color: "var(--primary)", fontWeight: 400, textAlign: "center" }}>
                                        @{profile.username}
                                    </p>

                                    {(profile.insta || profile.tiktok || profile.x_twitter) && (
                                        <div style={{ display: "flex", gap: 12 }}>
                                            {profile.insta && (
                                                <SocialIcon href={`https://www.instagram.com/${profile.insta}/`} src="/logos/instagram.png" alt="Instagram" />
                                            )}
                                            {profile.tiktok && (
                                                <SocialIcon href={`https://www.tiktok.com/@${profile.tiktok}`} src="/logos/tiktok.png" alt="TikTok" />
                                            )}
                                            {profile.x_twitter && (
                                                <SocialIcon href={`https://x.com/${profile.x_twitter}`} src="/logos/x.png" alt="X" />
                                            )}
                                        </div>
                                    )}

                                    {(profile.cantante_favorito || profile.pokemon_favorito || profile.animal_favorito || profile.equipo_futbol) && (
                                        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                                            <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--muted-foreground)", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--body-font)", textAlign: "center", marginBottom: 2 }}>
                                                Gustos del ciudadano
                                            </p>

                                            {profile.cantante_favorito && (
                                                <FavoriteChip label="Cantante favorito" value={profile.cantante_favorito} imageSrc={profile.cantante_imagen} emoji="🎤" />
                                            )}
                                            {profile.pokemon_favorito && (
                                                <FavoriteChip label="Pokémon favorito" value={profile.pokemon_favorito} imageSrc={pokemonSprite} emoji="⚡" />
                                            )}
                                            {profile.animal_favorito && (
                                                <FavoriteChip label="Animal favorito" value={profile.animal_favorito} emoji={getAnimalEmoji(profile.animal_favorito)} />
                                            )}
                                            {profile.equipo_futbol && (
                                                <FavoriteChip label="Equipo de fútbol" value={profile.equipo_futbol} imageSrc={teamBadge} emoji="⚽" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ─────────────────────────────────────────────
    COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
export default function Level() {
    const [, navigate] = useLocation();
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    // discord_id del usuario cuyo perfil se muestra en la ventana emergente
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(false);

        fetch("/api/leaderboard", { signal: controller.signal })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(d => d && setData(d))
            .catch(err => { if (err.name !== "AbortError") setError(true); })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, []);

    // Filtrar rankingCompleto por nombre o ID (búsqueda case-insensitive)
    const filteredRanking = useMemo(() => {
        if (!data) return [];
        const term = searchTerm.trim().toLowerCase();
        if (term === "") return data.rankingCompleto;
        return data.rankingCompleto.filter(user =>
            user.username.toLowerCase().includes(term) ||
            user.id.toLowerCase().includes(term)
        );
    }, [data, searchTerm]);

    const top3 = data?.top5.slice(0, 3) ?? [];
    const rest = data?.top5.slice(3) ?? [];

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />

            <main className="flex-1 py-12 px-4 md:px-8">
                <div className="container mx-auto w-full space-y-10">
                    <AnimatePresence mode="wait">

                        {/* ── SKELETON ── */}
                        {loading && (
                            <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: "100%" }}>
                                <LeaderboardSkeleton />
                            </motion.div>
                        )}

                        {/* ── ERROR ── */}
                        {!loading && error && (
                            <motion.div
                                key="err"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{ textAlign: "center", padding: "6rem 1rem", maxWidth: 400, margin: "0 auto" }}
                            >
                                <p style={{ fontSize: 44, marginBottom: 16 }}>⚔️</p>
                                <h2 style={{ fontFamily: "var(--display-font)", fontSize: 24, color: "var(--primary)", marginBottom: 8, fontWeight: 400 }}>
                                    El heraldo no responde
                                </h2>
                                <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginBottom: 24, lineHeight: 1.6 }}>
                                    No fue posible obtener el ranking general en este momento.
                                </p>
                                <button onClick={() => window.location.reload()} className="btn-minimal">
                                    Recargar Página
                                </button>
                            </motion.div>
                        )}

                        {/* ── CONTENIDO REAL ── */}
                        {!loading && !error && data && (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.25 }}
                                style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}
                            >
                                {/* Encabezado */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ textAlign: "center", paddingBottom: 8 }}
                                >
                                    <h1 style={{ fontFamily: "var(--display-font)", fontSize: "clamp(32px, 6vw, 46px)", fontWeight: 400, color: "var(--primary)", letterSpacing: "-0.02em", marginBottom: 6 }}>
                                        Tabla de Clasificación
                                    </h1>
                                    <p style={{ fontSize: 11, letterSpacing: "0.32em", color: "var(--muted-foreground)", textTransform: "uppercase", fontFamily: "var(--body-font)", fontWeight: 500 }}>
                                        Los ciudadanos más influyentes del Reino
                                    </p>
                                </motion.div>

                                {/* Destacados */}
                                {(data.destacados.masMensajes || data.destacados.menosMensajes) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.08 }}
                                        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}
                                    >
                                        {data.destacados.masMensajes && (
                                            <HighlightCard emoji="🔊" label="El más charlatán" user={data.destacados.masMensajes} />
                                        )}
                                        {data.destacados.menosMensajes && (
                                            <HighlightCard emoji="📴" label="El más reservado" user={data.destacados.menosMensajes} />
                                        )}
                                    </motion.div>
                                )}

                                {/* Elitistas - Top 5 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.12 }}
                                    style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "0 4px 20px rgba(15,50,106,0.02)" }}
                                >
                                    <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "rgba(151,180,224,0.06)" }}>
                                        <p style={{ fontSize: 11, letterSpacing: "0.28em", color: "var(--primary)", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--body-font)" }}>
                                            👑 &nbsp;Élite del Reino — Top 5
                                        </p>
                                    </div>

                                    {top3.length === 3 && (
                                        <>
                                            <Podium top3={top3} />
                                            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--border), transparent)" }} />
                                        </>
                                    )}

                                    {/* Posiciones 4 y 5 restantes dentro de la Élite */}
                                    {rest.map((user, i) => (
                                        <div
                                            key={user.id}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 16,
                                                padding: "16px 24px",
                                                borderBottom: i < rest.length - 1 ? "1px solid var(--border)" : "none",
                                                transition: "background 0.2s ease",
                                            }}
                                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(151,180,224,0.06)"}
                                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                                        >
                                            <span style={{ fontFamily: "var(--display-font)", fontSize: 20, color: "var(--primary)", width: 32, textAlign: "center", flexShrink: 0 }}>
                                                {user.posicion}
                                            </span>
                                            <img
                                                src={getValidAvatar(user)}
                                                alt={user.username}
                                                onError={handleImageError}
                                                style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }}
                                            />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)", fontFamily: "var(--body-font)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    @{user.username}
                                                </p>
                                                <XPBar xp={user.xp} />
                                            </div>
                                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 44, height: 24, background: "rgba(151,180,224,0.12)", border: "1px solid rgba(151,180,224,0.3)", borderRadius: 20, fontSize: 11, color: "var(--primary)", fontFamily: "var(--body-font)", fontWeight: 600, padding: "0 10px" }}>
                                                    Nv. {user.level}
                                                </span>
                                                <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "var(--body-font)", marginTop: 4 }}>
                                                    {formatNumber(user.total_xp)} XP
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Tabla Completa Inmersiva con Buscador */}
                                <motion.div
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.18 }}
                                    style={{
                                        background: "var(--card)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "var(--radius-xl)",
                                        overflow: "hidden",
                                        boxShadow: "0 4px 20px rgba(15,50,106,0.02)"
                                    }}
                                >
                                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "rgba(151,180,224,0.06)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                                        <p style={{ fontSize: 11, letterSpacing: "0.28em", color: "var(--muted-foreground)", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--body-font)", margin: 0 }}>
                                            📋 &nbsp;Registro General de Ciudadanos
                                        </p>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                            <div style={{ position: "relative" }}>
                                                <input
                                                    type="text"
                                                    placeholder="Buscar por nombre o ID..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    style={{
                                                        padding: "6px 12px",
                                                        paddingLeft: "28px",
                                                        fontSize: "12px",
                                                        fontFamily: "var(--body-font)",
                                                        background: "var(--background)",
                                                        border: "1px solid var(--border)",
                                                        borderRadius: "40px",
                                                        color: "var(--foreground)",
                                                        outline: "none",
                                                        width: "220px",
                                                        transition: "0.2s"
                                                    }}
                                                    onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                                                    onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                                                />
                                                <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", opacity: 0.6 }}>🔍</span>
                                            </div>
                                            {searchTerm && (
                                                <button
                                                    onClick={() => setSearchTerm("")}
                                                    style={{
                                                        background: "transparent",
                                                        border: "none",
                                                        fontSize: "12px",
                                                        color: "var(--accent)",
                                                        cursor: "pointer",
                                                        fontFamily: "var(--body-font)",
                                                        padding: "4px 8px",
                                                        borderRadius: "20px",
                                                        transition: "0.2s"
                                                    }}
                                                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(151,180,224,0.1)"}
                                                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"}
                                                >
                                                    ✕ Limpiar
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Inyección de estilos CSS para manejar el responsive de la tabla sin librerías externas */}
                                    <style>{`
        @media (max-width: 640px) {
            .responsive-table thead { display: none; }
            .responsive-table tr { 
                display: flex; 
                flex-wrap: wrap; 
                padding: 12px 16px !important; 
                align-items: center;
            }
            .responsive-table td { 
                padding: 4px 0 !important; 
                border: none !important;
            }
            .cell-pos { width: 30px !important; text-align: left !important; order: 1; }
            .cell-user { width: calc(100% - 100px) !important; order: 2; padding-left: 4px !important; }
            .cell-level { width: 70px !important; text-align: right !important; order: 3; }
            .cell-stat-container {
                width: 100% !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                order: 4;
                margin-top: 8px;
                padding-top: 8px !important;
                border-top: 1px dashed rgba(224,220,211,0.4) !important;
            }
            .cell-msg, .cell-xp { width: auto !important; text-align: left !important; }
            .cell-xp { text-align: right !important; }
            .mobile-label { display: inline-block !important; font-size: 10px; uppercase; color: var(--muted-foreground); margin-right: 6px; font-weight: 500; }
        }
        @media (min-width: 641px) {
            .mobile-label { display: none; }
        }
    `}</style>

                                    <div style={{ overflowX: "auto" }}>
                                        <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                            <thead>
                                                <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(240,237,231,0.5)" }}>
                                                    {["#", "Ciudadano", "Nivel", "Mensajes", "XP Total"].map((h, i) => (
                                                        <th key={h} style={{
                                                            padding: "12px 20px",
                                                            fontSize: 10, fontWeight: 600,
                                                            letterSpacing: "0.2em", textTransform: "uppercase",
                                                            color: "var(--muted-foreground)",
                                                            fontFamily: "var(--body-font)",
                                                            textAlign: i === 0 ? "center" : i >= 2 ? "right" : "left",
                                                        }}>
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredRanking.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted-foreground)", fontFamily: "var(--body-font)", fontSize: 13 }}>
                                                            🧙 No se encontró ningún ciudadano con "{searchTerm}"
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredRanking.map((user, i) => (
                                                        <tr
                                                            key={user.id}
                                                            onClick={() => setSelectedUserId(user.id)}
                                                            style={{ borderBottom: i < filteredRanking.length - 1 ? "1px solid rgba(224,220,211,0.5)" : "none", transition: "background 0.2s ease", cursor: "pointer" }}
                                                            onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(151,180,224,0.06)"}
                                                            onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                                                        >
                                                            {/* 1. POSICIÓN */}
                                                            <td className="cell-pos" style={{ padding: "14px 20px", textAlign: "center", fontFamily: "var(--display-font)", fontSize: 16, color: "var(--primary)", width: 50 }}>
                                                                {user.posicion}
                                                            </td>

                                                            {/* 2. CIUDADANO (Avatar + Nombre + Barra) */}
                                                            <td className="cell-user" style={{ padding: "14px 20px" }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                    <img
                                                                        src={getValidAvatar(user)}
                                                                        alt={user.username}
                                                                        onError={handleImageError}
                                                                        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }}
                                                                    />
                                                                    <div style={{ minWidth: 0, width: "100%" }}>
                                                                        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)", fontFamily: "var(--body-font)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                            @{user.username}
                                                                        </p>
                                                                        <XPBar xp={user.xp} />
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* 3. NIVEL */}
                                                            <td className="cell-level" style={{ padding: "14px 20px", textAlign: "right" }}>
                                                                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 22, background: "rgba(151,180,224,0.12)", border: "1px solid rgba(151,180,224,0.25)", borderRadius: 20, fontSize: 11, color: "var(--primary)", fontFamily: "var(--body-font)", fontWeight: 600, padding: "0 8px", minWidth: 34 }}>
                                                                    {user.level}
                                                                </span>
                                                            </td>

                                                            {/* CONTENEDOR AGRUPADOR PARA MÓVIL (Mensajes + XP se ponen lado a lado abajo en mobile) */}
                                                            <td className="cell-stat-container" style={{ padding: 0, display: "contents" }}>
                                                                {/* 4. MENSAJES */}
                                                                <td className="cell-msg" style={{ padding: "14px 20px", textAlign: "right", fontSize: 12, color: "var(--muted-foreground)", fontFamily: "var(--body-font)" }}>
                                                                    <span className="mobile-label">Mensajes:</span>
                                                                    {formatNumber(user.messages)}
                                                                </td>

                                                                {/* 5. XP TOTAL */}
                                                                <td className="cell-xp" style={{ padding: "14px 20px", textAlign: "right" }}>
                                                                    <div style={{ display: "inline-block", verticalAlign: "middle", textAlign: "right" }}>
                                                                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", fontFamily: "var(--body-font)", margin: 0 }}>
                                                                            {formatNumber(user.total_xp)} <span className="mobile-label" style={{ fontSize: 9, marginLeft: 2 }}>XP</span>
                                                                        </p>
                                                                        <p className="desktop-only-xp-label" style={{ fontSize: 9, color: "var(--muted-foreground)", fontFamily: "var(--body-font)", marginTop: 1, letterSpacing: "0.1em", display: "block" }}>
                                                                            XP
                                                                        </p>
                                                                    </div>
                                                                </td>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
            <Footer />

            {/* Ventana emergente con el perfil del ciudadano seleccionado */}
            <UserProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
        </div>
    );
}