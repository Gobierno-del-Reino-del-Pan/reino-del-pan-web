import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

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

export default function Level() {
    const [, navigate] = useLocation();
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/leaderboard")
            .then((r) => {
                if (r.status === 401) {
                    window.location.href = "/auth/discord";
                    return null;
                }
                return r.json();
            })
            .then((d) => {
                if (d) setData(d);
            })
            .catch(() => navigate("/"))
            .finally(() => setLoading(false));
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <div className="w-12 h-12 border-4 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin mx-auto" />
                        <p className="text-foreground/50 text-sm font-[var(--body-font)]">Cargando el Registro de Niveles…</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-[var(--body-font)]">
            <Header />

            <main className="flex-1 py-12 px-4 md:px-0">
                <div className="container mx-auto max-w-2xl space-y-10">

                    {/* Encabezado Principal */}
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl text-[var(--primary)] font-[var(--display-font)]">Tabla de Clasificación</h1>
                        <p className="text-sm text-[var(--muted-foreground)] uppercase tracking-widest">Los ciudadanos más influyentes del Reino</p>
                    </div>

                    {/* SECCIÓN 1: LOS + Y LOS - (Destacados) */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {data.destacados.masMensajes && (
                            <div className="p-5 rounded-2xl border border-[var(--border)] bg-card flex items-center gap-4">
                                <div className="text-3xl">🔊</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium">El más charlatán</p>
                                    <h3 className="text-base font-semibold text-[var(--primary)] truncate">@{data.destacados.masMensajes.username}</h3>
                                    <p className="text-xs text-[var(--muted-foreground)] font-mono">{data.destacados.masMensajes.messages} mensajes</p>
                                </div>
                                <img src={data.destacados.masMensajes.avatar} alt="Avatar" className="w-12 h-12 rounded-full border border-[var(--accent)]/30 object-cover" />
                            </div>
                        )}

                        {data.destacados.menosMensajes && (
                            <div className="p-5 rounded-2xl border border-[var(--border)] bg-card flex items-center gap-4">
                                <div className="text-3xl">📴</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium">El más reservado</p>
                                    <h3 className="text-base font-semibold text-[var(--primary)] truncate">@{data.destacados.menosMensajes.username}</h3>
                                    <p className="text-xs text-[var(--muted-foreground)] font-mono">{data.destacados.menosMensajes.messages} mensajes</p>
                                </div>
                                <img src={data.destacados.menosMensajes.avatar} alt="Avatar" className="w-12 h-12 rounded-full border border-[var(--accent)]/30 object-cover" />
                            </div>
                        )}
                    </motion.div>

                    {/* SECCIÓN 2: TOP 5 (Podio y Honor) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl border border-[var(--border)] bg-card overflow-hidden shadow-sm"
                    >
                        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--accent)]/5">
                            <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)] font-semibold">
                                👑 Élite del Reino (Top 5)
                            </p>
                        </div>
                        <div className="px-6 py-2 divide-y divide-[var(--border)]/60">
                            {data.top5.map((user) => (
                                <div key={user.id} className="flex items-center justify-between py-4 gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <span className="text-2xl font-normal w-6 text-center text-[var(--primary)] font-[var(--display-font)]">
                                            {user.posicion === 1 ? "🥇" : user.posicion === 2 ? "🥈" : user.posicion === 3 ? "🥉" : user.posicion}
                                        </span>
                                        <img src={user.avatar} alt={user.username} className="w-11 h-11 rounded-full border-2 border-[var(--accent)]/40 object-cover" />
                                        <div className="truncate">
                                            <h4 className="font-semibold text-[var(--foreground)] truncate">@{user.username}</h4>
                                            <p className="text-[10px] text-[var(--muted-foreground)] font-mono uppercase tracking-wider">Total XP: {user.total_xp}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] block">Nivel</span>
                                        <span className="text-2xl font-normal text-[var(--primary)] font-[var(--display-font)]">{user.level}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* SECCIÓN 3: RANKING COMPLETO */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl border border-[var(--border)] bg-card overflow-hidden shadow-sm"
                    >
                        <div className="px-6 py-4 border-b border-[var(--border)]">
                            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] font-medium">
                                📋 Registro General de Ciudadanos
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[var(--border)] bg-[var(--secondary)]/40 text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium">
                                        <th className="py-3 px-6 w-16 text-center">Pos</th>
                                        <th className="py-3 px-4">Ciudadano</th>
                                        <th className="py-3 px-4 text-center">Nivel</th>
                                        <th className="py-3 px-4 text-right hidden sm:table-cell">Mensajes</th>
                                        <th className="py-3 px-6 text-right">XP Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]/40 text-sm">
                                    {data.rankingCompleto.map((user) => (
                                        <tr key={user.id} className="hover:bg-[var(--accent)]/5 transition-colors group">
                                            <td className="py-3.5 px-6 text-center font-[var(--display-font)] text-lg text-[var(--primary)]">
                                                {user.posicion}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full object-cover border border-[var(--border)]" />
                                                    <span className="font-medium text-[var(--foreground)] truncate">@{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-[var(--display-font)] text-xl text-[var(--primary)]">
                                                {user.level}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-mono text-xs text-[var(--muted-foreground)] hidden sm:table-cell">
                                                {user.messages}
                                            </td>
                                            <td className="py-3.5 px-6 text-right font-mono text-xs font-semibold text-[var(--foreground)]">
                                                {user.total_xp}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                </div>
            </main>

            <Footer />
        </div>
    );
}