import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
    TIPOS
───────────────────────────────────────────── */
interface RankUser {
    posicion: number;
    id: string; // user_id de Supabase / Discord
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

function getValidAvatar(user: RankUser): string {
    const src = user.avatar?.trim();

    // Si viene una URL directa y válida (que no sea null/undefined en formato string)
    if (src && src.startsWith("http") && !src.includes("null") && !src.includes("undefined")) {
        return src;
    }

    // Si sólo es un hash de avatar de Discord, construimos la URL real del CDN usando su ID
    if (src && src.length > 5 && !src.startsWith("http") && user.id) {
        return `https://cdn.discordapp.com/avatars/${user.id}/${src}.png?size=128`;
    }

    // Fallback definitivo oficial: Sistema de avatares por defecto basado en el ID de usuario de Discord
    if (user.id) {
        try {
            // Evaluamos los últimos dígitos del ID de forma segura para calcular el índice (0 a 5)
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
                    {[82, 110, 60].map((h, i) => (
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
    PODIO TOP 3
───────────────────────────────────────────── */
function Podium({ top3 }: { top3: RankUser[] }) {
    const order = [
        top3.find(u => u.posicion === 2),
        top3.find(u => u.posicion === 1),
        top3.find(u => u.posicion === 3),
    ].filter(Boolean) as RankUser[];

    const podiumHeight: Record<number, number> = { 1: 120, 2: 90, 3: 70 };
    const avatarSize: Record<number, number> = { 1: 72, 2: 60, 3: 54 };

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
                        {/* Corona flotante para el Top 1 — altura fija compartida por los 3 */}
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
    COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
export default function Level() {
    const [, navigate] = useLocation();
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

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

                                {/* Tabla Completa Inmersiva */}
                                <motion.div
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.18 }}
                                    style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "0 4px 20px rgba(15,50,106,0.02)" }}
                                >
                                    <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
                                        <p style={{ fontSize: 11, letterSpacing: "0.28em", color: "var(--muted-foreground)", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--body-font)" }}>
                                            📋 &nbsp;Registro General de Ciudadanos
                                        </p>
                                    </div>

                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                            <thead>
                                                <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(240,237,231,0.5)" }}>
                                                    {["#", "Ciudadano", "Nivel", "Mensajes", "XP Total"].map((h, i) => (
                                                        <th key={h} style={{
                                                            padding: "14px 24px",
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
                                                {data.rankingCompleto.map((user, i) => (
                                                    <tr
                                                        key={user.id}
                                                        style={{ borderBottom: i < data.rankingCompleto.length - 1 ? "1px solid rgba(224,220,211,0.5)" : "none", transition: "background 0.2s ease" }}
                                                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(151,180,224,0.06)"}
                                                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                                                    >
                                                        <td style={{ padding: "14px 24px", textAlign: "center", fontFamily: "var(--display-font)", fontSize: 18, color: "var(--primary)", width: 50 }}>
                                                            {user.posicion}
                                                        </td>
                                                        <td style={{ padding: "14px 24px" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                                <img
                                                                    src={getValidAvatar(user)}
                                                                    alt={user.username}
                                                                    onError={handleImageError}
                                                                    style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }}
                                                                />
                                                                <div style={{ minWidth: 0, width: "100%" }}>
                                                                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)", fontFamily: "var(--body-font)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                        @{user.username}
                                                                    </p>
                                                                    <XPBar xp={user.xp} />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: "14px 24px", textAlign: "right" }}>
                                                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 24, background: "rgba(151,180,224,0.12)", border: "1px solid rgba(151,180,224,0.25)", borderRadius: 20, fontSize: 11, color: "var(--primary)", fontFamily: "var(--body-font)", fontWeight: 600, padding: "0 10px", minWidth: 38 }}>
                                                                {user.level}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: "14px 24px", textAlign: "right", fontSize: 12, color: "var(--muted-foreground)", fontFamily: "var(--body-font)" }}>
                                                            {formatNumber(user.messages)}
                                                        </td>
                                                        <td style={{ padding: "14px 24px", textAlign: "right" }}>
                                                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", fontFamily: "var(--body-font)" }}>
                                                                {formatNumber(user.total_xp)}
                                                            </p>
                                                            <p style={{ fontSize: 9, color: "var(--muted-foreground)", fontFamily: "var(--body-font)", marginTop: 1, letterSpacing: "0.1em" }}>
                                                                XP
                                                            </p>
                                                        </td>
                                                    </tr>
                                                ))}
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
        </div>
    );
}