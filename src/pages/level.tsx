import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────── */
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

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

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
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "3rem 1rem", display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <SkeletonBlock w={240} h={36} />
                    <SkeletonBlock w={180} h={12} />
                </div>
                {/* Podio */}
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8, padding: "1rem 0" }}>
                    {[82, 110, 60].map((h, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
                            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(90deg, var(--muted) 25%, var(--secondary) 50%, var(--muted) 75%)", backgroundSize: "600px 100%", animation: "ldb-shimmer 1.5s infinite linear" }} />
                            <SkeletonBlock w="100%" h={h} radius={6} />
                        </div>
                    ))}
                </div>
                {/* Filas */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ flex: 1, height: 3, background: "var(--muted)", borderRadius: 4, overflow: "hidden", minWidth: 60 }}>
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

    const podiumHeight: Record<number, number> = { 1: 96, 2: 70, 3: 52 };
    const avatarSize: Record<number, number> = { 1: 64, 2: 52, 3: 48 };

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
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6, padding: "1.5rem 1rem 0" }}>
            {order.map((user, i) => {
                const isFirst = user.posicion === 1;
                return (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 + 0.1, type: "spring", stiffness: 200, damping: 20 }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, maxWidth: 180 }}
                    >
                        {/* Corona flotante */}
                        {isFirst && (
                            <motion.span
                                animate={{ y: [0, -4, 0] }}
                                transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                                style={{ fontSize: 20, marginBottom: 4, display: "block" }}
                            >
                                👑
                            </motion.span>
                        )}

                        {/* Avatar */}
                        <div style={{ position: "relative", marginBottom: 10 }}>
                            <img
                                src={user.avatar}
                                alt={user.username}
                                style={{
                                    width: avatarSize[user.posicion],
                                    height: avatarSize[user.posicion],
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: `3px solid ${topBorder[user.posicion]}`,
                                    boxShadow: isFirst ? "0 4px 20px rgba(15,50,106,0.25)" : "0 2px 8px rgba(0,0,0,0.08)",
                                    display: "block",
                                }}
                            />
                            <span style={{
                                position: "absolute", bottom: -6, right: -6,
                                fontSize: 14, lineHeight: 1,
                            }}>
                                {MEDAL[user.posicion]}
                            </span>
                        </div>

                        {/* Nombre */}
                        <p style={{
                            fontSize: 11, fontWeight: 600, fontFamily: "var(--body-font)",
                            color: "var(--foreground)", textAlign: "center", marginBottom: 2,
                            maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            letterSpacing: "0.01em",
                        }}>
                            @{user.username}
                        </p>
                        <p style={{
                            fontSize: 10, color: "var(--muted-foreground)", fontFamily: "var(--body-font)", marginBottom: 8,
                        }}>
                            Nv. {user.level}
                        </p>

                        {/* Bloque podio */}
                        <div style={{
                            width: "100%",
                            height: podiumHeight[user.posicion],
                            background: podiumBg[user.posicion],
                            borderTop: `3px solid ${topBorder[user.posicion]}`,
                            borderRadius: "8px 8px 0 0",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <span style={{
                                fontFamily: "var(--display-font)",
                                fontSize: isFirst ? 30 : 22,
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
            padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 14,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            transition: "border-color 0.2s, box-shadow 0.2s",
        }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(151,180,224,0.15)";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
        >
            <span style={{ fontSize: 24, flexShrink: 0 }}>{emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 9, letterSpacing: "0.25em", color: "var(--muted-foreground)", textTransform: "uppercase", fontWeight: 600, marginBottom: 3, fontFamily: "var(--body-font)" }}>
                    {label}
                </p>
                <p style={{ fontWeight: 600, color: "var(--primary)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--body-font)" }}>
                    @{user.username}
                </p>
                <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2, fontFamily: "var(--body-font)" }}>
                    {formatNumber(user.messages)} mensajes
                </p>
            </div>
            <img src={user.avatar} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }} />
        </div>
    );
}

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
export default function Level() {
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const retryRef = useRef(0);

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
    }, [retryRef.current]); // eslint-disable-line react-hooks/exhaustive-deps

    const top3 = data?.top5.slice(0, 3) ?? [];
    const rest = data?.top5.slice(3) ?? [];

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />

            <main className="flex-1 py-12 px-4">
                <AnimatePresence mode="wait">

                    {/* ── SKELETON ── */}
                    {loading && (
                        <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                            style={{ textAlign: "center", padding: "4rem 1rem", maxWidth: 400, margin: "0 auto" }}
                        >
                            <p style={{ fontSize: 40, marginBottom: 16 }}>⚔️</p>
                            <h2 style={{ fontFamily: "var(--display-font)", fontSize: 22, color: "var(--primary)", marginBottom: 8, fontWeight: 400 }}>
                                El heraldo no responde
                            </h2>
                            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 24, lineHeight: 1.6 }}>
                                No fue posible obtener el ranking en este momento.
                            </p>
                            <button
                                onClick={() => retryRef.current++}
                                className="btn-minimal"
                            >
                                Reintentar
                            </button>
                        </motion.div>
                    )}

                    {/* ── CONTENIDO ── */}
                    {!loading && !error && data && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.25 }}
                            style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}
                        >
                            {/* Encabezado */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ textAlign: "center", paddingBottom: 4 }}
                            >
                                <h1 style={{ fontFamily: "var(--display-font)", fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 400, color: "var(--primary)", letterSpacing: "-0.02em", marginBottom: 6 }}>
                                    Tabla de Clasificación
                                </h1>
                                <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--muted-foreground)", textTransform: "uppercase", fontFamily: "var(--body-font)", fontWeight: 500 }}>
                                    Los ciudadanos más influyentes del Reino
                                </p>
                            </motion.div>

                            {/* Destacados */}
                            {(data.destacados.masMensajes || data.destacados.menosMensajes) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.08 }}
                                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
                                >
                                    {data.destacados.masMensajes && (
                                        <HighlightCard emoji="🔊" label="El más charlatán" user={data.destacados.masMensajes} />
                                    )}
                                    {data.destacados.menosMensajes && (
                                        <HighlightCard emoji="📴" label="El más reservado" user={data.destacados.menosMensajes} />
                                    )}
                                </motion.div>
                            )}

                            {/* Top 5 */}
                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.12 }}
                                style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}
                            >
                                {/* Header sección */}
                                <div style={{ padding: "13px 20px", borderBottom: "1px solid var(--border)", background: "rgba(151,180,224,0.06)" }}>
                                    <p style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--primary)", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--body-font)" }}>
                                        👑 &nbsp;Élite del Reino — Top 5
                                    </p>
                                </div>

                                {/* Podio */}
                                {top3.length === 3 && (
                                    <>
                                        <Podium top3={top3} />
                                        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--border), transparent)", margin: "0" }} />
                                    </>
                                )}

                                {/* Posiciones 4 y 5 */}
                                {rest.map((user, i) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.22 + i * 0.06 }}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 12,
                                            padding: "13px 20px",
                                            borderBottom: i < rest.length - 1 ? "1px solid var(--border)" : "none",
                                            transition: "background 0.15s",
                                        }}
                                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(151,180,224,0.06)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                                    >
                                        <span style={{ fontFamily: "var(--display-font)", fontSize: 18, color: "var(--primary)", width: 28, textAlign: "center", flexShrink: 0 }}>
                                            {user.posicion}
                                        </span>
                                        <img src={user.avatar} alt={user.username} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", fontFamily: "var(--body-font)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                @{user.username}
                                            </p>
                                            <XPBar xp={user.xp} />
                                        </div>
                                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 40, height: 22, background: "rgba(151,180,224,0.12)", border: "1px solid rgba(151,180,224,0.3)", borderRadius: 20, fontSize: 11, color: "var(--primary)", fontFamily: "var(--body-font)", fontWeight: 600, padding: "0 8px" }}>
                                                Nv. {user.level}
                                            </span>
                                            <p style={{ fontSize: 10, color: "var(--muted-foreground)", fontFamily: "var(--body-font)", marginTop: 3 }}>
                                                {formatNumber(user.total_xp)} XP
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Ranking completo */}
                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.18 }}
                                style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}
                            >
                                <div style={{ padding: "13px 20px", borderBottom: "1px solid var(--border)" }}>
                                    <p style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--muted-foreground)", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--body-font)" }}>
                                        📋 &nbsp;Registro General de Ciudadanos
                                    </p>
                                </div>

                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(240,237,231,0.5)" }}>
                                                {["#", "Ciudadano", "Nivel", "Mensajes", "XP Total"].map((h, i) => (
                                                    <th key={h} style={{
                                                        padding: "10px 16px",
                                                        fontSize: 9, fontWeight: 600,
                                                        letterSpacing: "0.2em", textTransform: "uppercase",
                                                        color: "var(--muted-foreground)",
                                                        fontFamily: "var(--body-font)",
                                                        textAlign: i === 0 ? "center" : i >= 2 ? "right" : "left",
                                                        display: i === 3 ? undefined : undefined,
                                                    }}>
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.rankingCompleto.map((user, i) => (
                                                <motion.tr
                                                    key={user.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.22 + i * 0.035 }}
                                                    style={{ borderBottom: i < data.rankingCompleto.length - 1 ? "1px solid rgba(224,220,211,0.6)" : "none", transition: "background 0.15s" }}
                                                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(151,180,224,0.06)"}
                                                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                                                >
                                                    <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "var(--display-font)", fontSize: 16, color: "var(--primary)", width: 40 }}>
                                                        {user.posicion}
                                                    </td>
                                                    <td style={{ padding: "12px 16px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                            <img src={user.avatar} alt={user.username} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }} />
                                                            <div style={{ minWidth: 0 }}>
                                                                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", fontFamily: "var(--body-font)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                                                                    @{user.username}
                                                                </p>
                                                                <XPBar xp={user.xp} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 22, background: "rgba(151,180,224,0.12)", border: "1px solid rgba(151,180,224,0.25)", borderRadius: 20, fontSize: 11, color: "var(--primary)", fontFamily: "var(--body-font)", fontWeight: 600, padding: "0 9px", minWidth: 34 }}>
                                                            {user.level}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 11, color: "var(--muted-foreground)", fontFamily: "var(--body-font)" }}>
                                                        {formatNumber(user.messages)}
                                                    </td>
                                                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                                        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground)", fontFamily: "var(--body-font)" }}>
                                                            {formatNumber(user.total_xp)}
                                                        </p>
                                                        <p style={{ fontSize: 9, color: "var(--muted-foreground)", fontFamily: "var(--body-font)", marginTop: 2, letterSpacing: "0.1em" }}>
                                                            XP
                                                        </p>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
}