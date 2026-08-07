import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { motion, AnimatePresence } from "framer-motion";

// ── INTERFACES ──
interface DPIData {
    dpi_number: string;
    nombre: string;
    apellidos: string;
    region: string;
}

interface DiscordUser {
    id: string;
    username: string;
    avatar: string;
    inGuild: boolean;
    verificado: boolean;
    dpi: DPIData | null;
}

interface ProcesoElectoral {
    id: string;
    titulo: string;
    descripcion?: string;
    tipo: "referendum" | "generales" | "regionales";
    estado: "abierto" | "finalizado";
    region_id?: string;
    fecha_inicio: string;
}

interface CandidatosJson {
    user_id: string;
    rol: string;
    posicion: number;
}

interface Candidatura {
    id: string;
    proceso_id: string;
    partido_id: string;
    siglas: string;
    candidato_user_id: string;
    vicepresidente_user_id?: string;
    region_id?: string;
    candidatos?: CandidatosJson[];
    votos_totales: number;
    votos_por_region?: Record<string, number>;
}

const REGIONES_NOMBRES: Record<string, string> = {
    BAGUETTE: "Baguette 🥖",
    PIMBO: "Pimbo 🍞",
    PRETZEL: "Pretzel 🥨",
    CROISSANT: "Croissant 🥐",
    SINGLUTEN: "Sin Glúten 🌾",
    PANPLANO: "Pan Plano/Arepa 🫓",
};

const ESCAÑOS_POR_REGION: Record<string, number> = {
    BAGUETTE: 5,
    PIMBO: 5,
    PRETZEL: 4,
    CROISSANT: 4,
    SINGLUTEN: 3,
    PANPLANO: 3,
};

export default function Electa() {
    const [, navigate] = useLocation();
    const [user, setUser] = useState<DiscordUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Estado para la alerta modal tipo macOS / iOS
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(true);

    // Estados del módulo Electoral
    const [procesos, setProcesos] = useState<ProcesoElectoral[]>([]);
    const [procesoSeleccionado, setProcesoSeleccionado] = useState<ProcesoElectoral | null>(null);
    const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);

    // Estado de votación
    const [votoSeleccionado, setVotoSeleccionado] = useState<string | null>(null);
    const [yaVoto, setYaVoto] = useState<boolean>(false);
    const [votando, setVotando] = useState<boolean>(false);
    const [mensajeForm, setMensajeForm] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

    // 1. Cargar Usuario desde Auth (Discord)
    useEffect(() => {
        fetch("/api/me")
            .then((r) => {
                if (r.status === 401) {
                    window.location.href = "/auth/discord";
                    return null;
                }
                return r.json();
            })
            .then((d) => {
                if (!d) return;
                if (!d.user) {
                    navigate("/");
                    return;
                }
                setUser(d.user);
            })
            .catch(() => navigate("/"))
            .finally(() => setLoading(false));
    }, [navigate]);

    // 2. Cargar Procesos Electorales Abiertos
    useEffect(() => {
        if (!user || !user.inGuild || !user.dpi) return;

        fetch("/api/electoral/procesos-abiertos")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setProcesos(data);
                    if (data.length > 0) {
                        setProcesoSeleccionado(data[0]);
                    }
                }
            })
            .catch((err) => console.error("Error al cargar procesos:", err));
    }, [user]);

    // 3. Cargar Datos del Proceso Seleccionado
    useEffect(() => {
        if (!procesoSeleccionado) return;

        setVotoSeleccionado(null);
        setMensajeForm(null);

        // Comprobar si el usuario ya ha votado en este proceso
        fetch(`/api/electoral/comprobar-voto?proceso_id=${procesoSeleccionado.id}`)
            .then((res) => res.json())
            .then((d) => setYaVoto(!!d.haVotado))
            .catch(() => setYaVoto(false));

        // Cargar candidaturas si no es un referéndum
        if (procesoSeleccionado.tipo !== "referendum") {
            fetch(`/api/electoral/candidaturas?proceso_id=${procesoSeleccionado.id}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setCandidaturas(data);
                    } else {
                        setCandidaturas([]);
                    }
                })
                .catch((err) => console.error("Error al cargar candidaturas:", err));
        } else {
            setCandidaturas([]);
        }
    }, [procesoSeleccionado]);

    // ── CÁLCULO DE LEY D'HONDT Y ESTADÍSTICAS POR REGIÓN ──
    const resultadosCalculados = useMemo(() => {
        if (!candidaturas || candidaturas.length === 0) return null;

        const totalVotosGlobales = candidaturas.reduce((acc, c) => acc + (c.votos_totales || 0), 0);
        const regionesKeys = Object.keys(REGIONES_NOMBRES);

        const escañosPorRegionYPartido: Record<string, Record<string, number>> = {};
        const escañosTotalesPartido: Record<string, number> = {};

        candidaturas.forEach((c) => (escañosTotalesPartido[c.id] = 0));

        regionesKeys.forEach((regKey) => {
            const numEscañosRegion = ESCAÑOS_POR_REGION[regKey] || 3;
            escañosPorRegionYPartido[regKey] = {};
            candidaturas.forEach((c) => (escañosPorRegionYPartido[regKey][c.id] = 0));

            const cocientes: { candidaturaId: string; valor: number }[] = [];

            candidaturas.forEach((cand) => {
                const votosRegion = cand.votos_por_region?.[regKey] || 0;
                for (let i = 1; i <= numEscañosRegion; i++) {
                    cocientes.push({
                        candidaturaId: cand.id,
                        valor: votosRegion / i,
                    });
                }
            });

            cocientes.sort((a, b) => b.valor - a.valor);

            for (let i = 0; i < numEscañosRegion; i++) {
                if (cocientes[i] && cocientes[i].valor > 0) {
                    const candWinner = cocientes[i].candidaturaId;
                    escañosPorRegionYPartido[regKey][candWinner] += 1;
                    escañosTotalesPartido[candWinner] += 1;
                }
            }
        });

        return {
            totalVotosGlobales,
            escañosPorRegionYPartido,
            escañosTotalesPartido,
        };
    }, [candidaturas]);

    // Emitir Voto
    const handleVotar = async () => {
        if (!votoSeleccionado || !procesoSeleccionado) return;

        setVotando(true);
        setMensajeForm(null);

        try {
            // Se envía según lo configurado en server.js
            const bodyPayload = procesoSeleccionado.tipo === "referendum"
                ? { proceso_id: procesoSeleccionado.id, opcion: votoSeleccionado }
                : { proceso_id: procesoSeleccionado.id, candidatura_id: votoSeleccionado };

            const res = await fetch("/api/electoral/votar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyPayload),
            });

            const data = await res.json();

            if (res.ok) {
                setYaVoto(true);
                setMensajeForm({ tipo: "ok", texto: "¡Tu voto ha sido emitido e inscrito en las urnas con éxito!" });

                // Recargar candidaturas para reflejar los votos actualizados
                if (procesoSeleccionado.tipo !== "referendum") {
                    const updatedCands = await fetch(`/api/electoral/candidaturas?proceso_id=${procesoSeleccionado.id}`).then(r => r.json());
                    if (Array.isArray(updatedCands)) setCandidaturas(updatedCands);
                }
            } else {
                setMensajeForm({ tipo: "error", texto: data.message || "No se pudo emitir el voto." });
            }
        } catch {
            setMensajeForm({ tipo: "error", texto: "Error de conexión con el tribunal electoral." });
        } finally {
            setVotando(false);
        }
    };

    const handleLogout = () => {
        window.location.href = "/auth/logout";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
                        <p className="text-foreground/50 text-sm">Validando credenciales en Discord...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!user) return null;

    if (!user.inGuild) {
        return (
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header />
                <main className="flex-1 flex items-center justify-center py-16 px-4">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center space-y-6">
                        <div className="text-5xl">🍞</div>
                        <h1 className="text-2xl font-bold">Acceso Denegado a Electa</h1>
                        <p className="text-foreground/60 text-sm leading-relaxed">
                            Para ejercer tu derecho al voto en el Reino del Pan necesitas formar parte del servidor oficial de Discord.
                        </p>
                        <div className="space-y-3">
                            <a
                                href="https://discord.gg/reino-del-pan-1381359904731693056"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm"
                                style={{ background: "#5865F2", color: "#fff" }}
                            >
                                Unirme al servidor
                            </a>
                            <button onClick={handleLogout} className="w-full py-3 rounded-xl border border-border text-foreground/60 text-sm hover:border-accent/50 transition">
                                Cerrar sesión
                            </button>
                        </div>
                    </motion.div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!user.dpi) {
        return (
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header />
                <main className="flex-1 flex items-center justify-center py-16 px-4">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center space-y-6">
                        <div className="text-5xl">📋</div>
                        <h1 className="text-2xl font-bold">Padrón Electoral no Registrado</h1>
                        <p className="text-foreground/60 text-sm leading-relaxed">
                            Hola <strong className="text-foreground">{user.username}</strong>, para votar en el sistema <strong>Electa</strong> necesitas contar con tu Documento Personal de Identificación (DPI).
                        </p>
                        <div className="space-y-3">
                            <Link
                                href="/dpi/create"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-accent bg-accent text-background font-semibold text-sm hover:opacity-90 transition"
                            >
                                Crear mi DPI
                            </Link>
                            <button onClick={handleLogout} className="w-full py-3 rounded-xl border border-border text-foreground/60 text-sm hover:border-red-500/50 hover:text-red-400 transition">
                                Cerrar sesión
                            </button>
                        </div>
                    </motion.div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground relative">
            <Header />

            {/* 🍎 MODAL ADVERTENCIA TIPO MAC / IPHONE */}
            <AnimatePresence>
                {showMaintenanceModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                            className="w-full max-w-[320px] rounded-[22px] bg-[rgba(250,250,250,0.85)] dark:bg-[rgba(30,30,30,0.85)] backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl text-center overflow-hidden font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif]"
                        >
                            <div className="p-6 space-y-3">
                                {/* Icono de Alerta / Mantenimiento macOS */}
                                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500 text-2xl">
                                    ⚠️
                                </div>
                                <h3 className="text-[17px] font-semibold tracking-tight text-slate-900 dark:text-white leading-snug">
                                    Aviso del Sistema
                                </h3>
                                <p className="text-[13px] text-slate-600 dark:text-neutral-300 leading-relaxed font-normal">
                                    El sistema electa está en mantenimiento y solo puede ver el frontend. Tiene dos opciones: Ver electa o Volver a su perfil (/carpeta).
                                </p>
                            </div>

                            {/* Botones estilo iOS / macOS Alert */}
                            <div className="border-t border-slate-300/60 dark:border-neutral-700/60 flex flex-col">
                                <button
                                    onClick={() => setShowMaintenanceModal(false)}
                                    className="w-full py-3 text-[15px] font-medium text-blue-600 dark:text-blue-400 active:bg-slate-200/50 dark:active:bg-neutral-700/50 transition-colors border-b border-slate-300/60 dark:border-neutral-700/60"
                                >
                                    Ver electa
                                </button>
                                <button
                                    onClick={() => navigate("/carpeta")}
                                    className="w-full py-3 text-[15px] font-semibold text-blue-600 dark:text-blue-400 active:bg-slate-200/50 dark:active:bg-neutral-700/50 transition-colors"
                                >
                                    Volver a su perfil (/carpeta)
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-1 py-12 px-4 md:px-0">
                <div className="container mx-auto max-w-4xl space-y-8">

                    {/* Logo Oficial de Electa y Cabecera */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center text-center space-y-3"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl scale-125" />
                            <img
                                src="/electa/electa.png"
                                alt="Logo Electa"
                                className="relative w-20 h-20 object-contain drop-shadow-md"
                            />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Tribunal Electoral • Electa</h1>
                        <p className="text-sm text-foreground/60 max-w-md">
                            Escrutinio público, votación directa y asignación proporcional de escaños mediante el sistema D'Hondt.
                        </p>
                    </motion.div>

                    {/* Ficha Electoral del Ciudadano */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row items-center justify-between gap-5 p-6 rounded-2xl border border-border bg-card shadow-sm"
                    >
                        <div className="flex items-center gap-5">
                            <img
                                src={user.avatar}
                                alt={user.username}
                                className="w-14 h-14 rounded-full border-2 border-accent/30 object-cover"
                            />
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold">
                                    Censo Electoral Registrado
                                </p>
                                <h2 className="mt-1 text-xl font-bold text-foreground">
                                    {user.dpi.nombre} {user.dpi.apellidos}
                                </h2>
                                <p className="text-xs text-foreground/50 font-mono mt-0.5">
                                    DPI: {user.dpi.dpi_number} • Región: {REGIONES_NOMBRES[user.dpi.region] || user.dpi.region}
                                </p>
                            </div>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Elector Habilitado
                        </div>
                    </motion.div>

                    {/* Selección de Proceso Electoral */}
                    <section className="space-y-4">
                        <h2 className="text-xs uppercase tracking-[0.3em] text-accent font-medium">
                            Procesos Electorales Activos
                        </h2>

                        {procesos.length === 0 ? (
                            <div className="p-8 rounded-2xl border border-border bg-card text-center space-y-2">
                                <p className="text-2xl">🏛️</p>
                                <p className="text-foreground/70 font-medium">No hay votaciones abiertas en este momento.</p>
                                <p className="text-xs text-foreground/40">Los Notificadores anunciarán el inicio de nuevos referéndums o elecciones.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {procesos.map((p) => {
                                    const isSelected = procesoSeleccionado?.id === p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => setProcesoSeleccionado(p)}
                                            className={`p-4 rounded-xl border text-left transition-all duration-200 ${isSelected
                                                ? "border-accent bg-accent/10 shadow-sm"
                                                : "border-border bg-card hover:border-accent/40"
                                                }`}
                                        >
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-accent block mb-1">
                                                {p.tipo}
                                            </span>
                                            <p className="font-semibold text-sm line-clamp-1">{p.titulo}</p>
                                            {p.region_id && (
                                                <p className="text-xs text-foreground/50 mt-1">
                                                    📍 {REGIONES_NOMBRES[p.region_id] || p.region_id}
                                                </p>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Panel de Votación y Candidatos */}
                    {procesoSeleccionado && (
                        <motion.div
                            key={procesoSeleccionado.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl border border-border bg-card space-y-6"
                        >
                            <div>
                                <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
                                    Cabina de Votación
                                </span>
                                <h2 className="text-2xl font-bold mt-1">{procesoSeleccionado.titulo}</h2>
                                {procesoSeleccionado.descripcion && (
                                    <p className="text-sm text-foreground/70 mt-2 leading-relaxed">
                                        {procesoSeleccionado.descripcion}
                                    </p>
                                )}
                            </div>

                            {yaVoto ? (
                                <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/10 text-center space-y-2">
                                    <span className="text-3xl">🗳️</span>
                                    <h3 className="text-lg font-bold text-green-400">Ya has emitido tu voto</h3>
                                    <p className="text-xs text-foreground/60">
                                        Tu participación en este proceso electoral ha quedado registrada de forma segura en las urnas del Reino.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {procesoSeleccionado.tipo === "referendum" ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {[
                                                { id: "SI", label: "✅ SÍ", color: "hover:border-green-500 hover:bg-green-500/10" },
                                                { id: "NO", label: "❌ NO", color: "hover:border-red-500 hover:bg-red-500/10" },
                                                { id: "ABSTENCION", label: "⬜ ABSTENCIÓN", color: "hover:border-gray-400 hover:bg-gray-500/10" },
                                            ].map((op) => (
                                                <button
                                                    key={op.id}
                                                    onClick={() => setVotoSeleccionado(op.id)}
                                                    className={`p-4 rounded-xl border font-bold text-sm transition-all ${op.color} ${votoSeleccionado === op.id
                                                        ? "border-accent bg-accent/20 ring-2 ring-accent"
                                                        : "border-border bg-background/50"
                                                        }`}
                                                >
                                                    {op.label}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-xs text-foreground/60 font-medium">Selecciona la candidatura de tu elección:</p>
                                            {candidaturas.length === 0 ? (
                                                <p className="text-sm text-foreground/40 italic">No hay candidaturas oficiales registradas para este proceso.</p>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {candidaturas.map((c) => {
                                                        const isSelected = votoSeleccionado === c.id;
                                                        const regionTxt = c.region_id ? REGIONES_NOMBRES[c.region_id] : "🌍 Circunscripción General";

                                                        return (
                                                            <div
                                                                key={c.id}
                                                                onClick={() => setVotoSeleccionado(c.id)}
                                                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isSelected
                                                                    ? "border-accent bg-accent/15 ring-1 ring-accent"
                                                                    : "border-border bg-background/40 hover:border-accent/40"
                                                                    }`}
                                                            >
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-lg text-accent">{c.siglas}</span>
                                                                        <span className="text-[10px] bg-border px-2 py-0.5 rounded-full text-foreground/70">
                                                                            {regionTxt}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-xs text-foreground/70 space-y-0.5">
                                                                        <p>👤 <strong>Candidato / Presidente</strong>: <span className="font-mono text-accent">{`<@${c.candidato_user_id}>`}</span></p>
                                                                        {c.vicepresidente_user_id && (
                                                                            <p>👤 <strong>Vicepresidente</strong>: <span className="font-mono text-accent">{`<@${c.vicepresidente_user_id}>`}</span></p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-accent bg-accent text-background" : "border-border"}`}>
                                                                    {isSelected && <span className="text-xs font-bold">✓</span>}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Botón de Emisión */}
                                    <div className="pt-4 border-t border-border flex flex-col items-center gap-3">
                                        <button
                                            disabled={!votoSeleccionado || votando}
                                            onClick={handleVotar}
                                            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-accent text-background font-bold text-sm hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {votando ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                                    Depositando voto...
                                                </>
                                            ) : (
                                                "Emitir Voto Oficial"
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {mensajeForm && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    className={`text-xs font-medium ${mensajeForm.tipo === "ok" ? "text-green-400" : "text-red-400"}`}
                                                >
                                                    {mensajeForm.texto}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* 📊 PANEL DE RESULTADOS, PORCENTAJES Y LEY D'HONDT */}
                    {procesoSeleccionado && procesoSeleccionado.tipo !== "referendum" && resultadosCalculados && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl border border-border bg-card/60 space-y-6"
                        >
                            <div className="border-b border-border pb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <span>📊</span> Escrutinio y Ley D'Hondt
                                    </h3>
                                    <p className="text-xs text-foreground/50 mt-1">
                                        Simulación y porcentaje de voto en tiempo real según el reparto por regiones.
                                    </p>
                                </div>
                                <span className="text-xs bg-accent/10 border border-accent/20 text-accent font-mono px-3 py-1 rounded-full">
                                    Total Votos: {resultadosCalculados.totalVotosGlobales}
                                </span>
                            </div>

                            {/* Resumen Global por Partido */}
                            <div className="space-y-3">
                                <h4 className="text-xs uppercase tracking-wider font-semibold text-accent">Resumen de Escaños Globales</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {candidaturas.map((c) => {
                                        const votos = c.votos_totales || 0;
                                        const pct = resultadosCalculados.totalVotosGlobales > 0
                                            ? ((votos / resultadosCalculados.totalVotosGlobales) * 100).toFixed(1)
                                            : "0.0";
                                        const escaños = resultadosCalculados.escañosTotalesPartido[c.id] || 0;

                                        return (
                                            <div key={c.id} className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-extrabold text-accent">{c.siglas}</span>
                                                    <span className="text-xs bg-accent/20 text-accent font-bold px-2 py-0.5 rounded-md">
                                                        {escaños} escaños
                                                    </span>
                                                </div>
                                                <div className="text-xs text-foreground/60 flex justify-between items-center">
                                                    <span>{votos} votos</span>
                                                    <span>{pct}%</span>
                                                </div>
                                                <div className="w-full bg-border/50 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-accent h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tabla de Votos y Escaños por Región */}
                            <div className="space-y-3 pt-2">
                                <h4 className="text-xs uppercase tracking-wider font-semibold text-accent">Desglose Territorial por Regiones</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-border text-foreground/50 font-mono uppercase">
                                                <th className="py-2 px-3">Región</th>
                                                <th className="py-2 px-3 text-center">Escaños Región</th>
                                                {candidaturas.map((c) => (
                                                    <th key={c.id} className="py-2 px-3 text-center text-accent font-bold">{c.siglas}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {Object.keys(REGIONES_NOMBRES).map((regKey) => {
                                                const totalEscañosReg = ESCAÑOS_POR_REGION[regKey] || 3;
                                                return (
                                                    <tr key={regKey} className="hover:bg-accent/5">
                                                        <td className="py-2.5 px-3 font-medium">{REGIONES_NOMBRES[regKey]}</td>
                                                        <td className="py-2.5 px-3 text-center font-mono">{totalEscañosReg}</td>
                                                        {candidaturas.map((c) => {
                                                            const vReg = c.votos_por_region?.[regKey] || 0;
                                                            const eReg = resultadosCalculados.escañosPorRegionYPartido[regKey]?.[c.id] || 0;
                                                            return (
                                                                <td key={c.id} className="py-2.5 px-3 text-center">
                                                                    <span className="font-bold">{eReg} esc.</span>
                                                                    <span className="text-foreground/40 block text-[10px]">{vReg} votos</span>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {/* Cierre de Sesión */}
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/30 hover:text-red-400 transition-colors duration-200"
                        >
                            Cerrar sesión
                        </button>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}