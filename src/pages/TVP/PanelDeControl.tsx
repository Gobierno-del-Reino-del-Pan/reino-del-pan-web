import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "../../lib/supabaseClient";

interface UserSession {
    discord_id: string;
    username: string;
    avatar_url: string;
}

export default function PanelDeControl() {
    const [, setLocation] = useLocation();

    // Estados de autenticación y carga
    const [user, setUser] = useState<UserSession | null>(null);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Estados del formulario para la tabla public.tvp_news
    const [id, setId] = useState("");
    const [type, setType] = useState("secondary");
    const [category, setCategory] = useState("POLÍTICA");
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [timeLabel, setTimeLabel] = useState("Hace 5 min");
    const [imgUrl, setImgUrl] = useState("");

    // Estados de feedback del formulario
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Configuración de IDs de Discord
    const GUILD_ID = "1381359904731693056"; // OBLIGATORIO: Reemplaza con el ID de tu servidor de Discord
    const REPORTER_ROLE_ID = "1507784487084363858";

    useEffect(() => {
        async function checkReporterAuth() {
            try {
                setLoading(true);

                // 1. Obtener la sesión actual de Supabase con los tokens de Discord
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session || !session.user) {
                    setIsAuthorized(false);
                    return;
                }

                const authUser = session.user;
                const discordId = authUser.user_metadata?.provider_id || authUser.id;

                // 2. Traer datos básicos para la interfaz desde tu tabla de usuarios
                const { data: userData } = await supabase
                    .from("usuarios")
                    .select("discord_id, username, avatar_url")
                    .eq("discord_id", discordId)
                    .maybeSingle();

                if (userData) {
                    setUser(userData);
                } else {
                    // Fallback si no está en tu tabla local pero sí está logueado en Supabase
                    setUser({
                        discord_id: discordId,
                        username: authUser.user_metadata?.full_name || authUser.user_metadata?.name || "Reportero",
                        avatar_url: authUser.user_metadata?.avatar_url || ""
                    });
                }

                // 3. CONSULTA A DISCORD: Obtener el token de acceso OAuth2 del usuario
                const providerToken = session.provider_token;

                if (!providerToken) {
                    console.error("No se encontró el token de proveedor. Asegúrate de pedir los 'scopes' correctos al iniciar sesión.");
                    setIsAuthorized(false);
                    return;
                }

                // Pedimos a Discord los datos del miembro dentro de TU servidor específico
                const discordResponse = await fetch(
                    `https://discord.com/api/v10/users/@me/guilds/${GUILD_ID}/member`,
                    {
                        headers: {
                            Authorization: `Bearer ${providerToken}`,
                        },
                    }
                );

                if (!discordResponse.ok) {
                    console.error("El usuario no pertenece al servidor o el token expiró");
                    setIsAuthorized(false);
                    return;
                }

                const memberData = await discordResponse.json();

                // Los roles del usuario vienen en un array de strings (IDs de los roles)
                const userRoles: string[] = memberData.roles || [];

                // Validamos si el ID del rol de reportero está en su lista de roles de Discord
                if (userRoles.includes(REPORTER_ROLE_ID)) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }

            } catch (err) {
                console.error("Error en la validación mediante API de Discord:", err);
                setIsAuthorized(false);
            } finally {
                setLoading(false);
            }
        }

        checkReporterAuth();
    }, []);

    const handleSubmitNews = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormMessage(null);
        setIsSubmitting(true);

        if (!id || !title || !category || !timeLabel || !imgUrl) {
            setFormMessage({ type: "error", text: "Por favor, rellena todos los campos obligatorios." });
            setIsSubmitting(false);
            return;
        }

        try {
            const { error } = await supabase
                .from("tvp_news")
                .insert([
                    {
                        id: id.trim().toLowerCase().replace(/\s+/g, "-"),
                        type,
                        category: category.toUpperCase(),
                        title,
                        summary: type === "main" ? summary : null,
                        time_label: timeLabel,
                        img_url: imgUrl,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;

            setFormMessage({ type: "success", text: "¡Noticia publicada con éxito en la base de datos de la TVP!" });

            setId("");
            setTitle("");
            setSummary("");
            setImgUrl("");
            setTimeLabel("Hace 5 min");

        } catch (err: any) {
            console.error(err);
            setFormMessage({ type: "error", text: err.message || "Error al conectar con la base de datos de Supabase." });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#07080c] text-white flex flex-col items-center justify-center font-tvp-text">
                <span className="w-8 h-8 border-4 border-[#ff4d00] border-t-transparent rounded-full animate-spin"></span>
                <p className="text-xs uppercase tracking-[0.2em] font-tvp-head text-white/50 mt-4">Sincronizando con Discord API...</p>
            </div>
        );
    }

    if (isAuthorized === false) {
        return (
            <div className="min-h-screen bg-[#07080c] text-white flex flex-col items-center justify-center px-6 text-center font-tvp-text">
                <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-xl max-w-md shadow-2xl">
                    <h2 className="font-tvp-head text-2xl font-black tracking-wide text-red-500 uppercase mb-3">Acceso Denegado</h2>
                    <p className="text-sm text-neutral-400 font-light leading-relaxed mb-6">
                        Este Panel de Control está restringido ÚNICAMENTE al cuerpo oficial de **Reporteros de la TVP**. Tu cuenta de Discord no dispone del Rol requerido en el servidor.
                    </p>
                    <Link to="/">
                        <button className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-6 py-3 rounded-full transition-all tracking-widest uppercase font-tvp-head">
                            Regresar al Portal
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#07080c] text-white flex flex-col font-tvp-text selection:bg-[#ff4d00] selection:text-white">
            <header className="w-full bg-[#0a0b10]/95 backdrop-blur-xl border-b border-white/5 px-6 md:px-12 py-5 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link to="/">
                        <a className="transition-opacity hover:opacity-80 flex items-center">
                            <img src="/logo.png" alt="Inicio" className="h-8 object-contain" />
                        </a>
                    </Link>
                    <div className="h-5 w-[1px] bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <img src="/TVP/TVP.png" alt="TVP" className="h-7 object-contain" />
                        <span className="bg-[#ff4d00] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider font-tvp-head">
                            REPORTEROS
                        </span>
                    </div>
                </div>

                {user && (
                    <div className="flex items-center gap-3 bg-white/5 pr-4 pl-2 py-1.5 rounded-full border border-white/5">
                        <img src={user.avatar_url} alt={user.username} className="w-7 h-7 rounded-full object-cover border border-white/10" />
                        <span className="text-xs font-bold text-neutral-300">@{user.username}</span>
                    </div>
                )}
            </header>

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10">
                <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div>
                        <h1 className="font-tvp-head text-2xl sm:text-4xl font-black tracking-wide text-white">
                            MESA DE REDACCIÓN
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-400 font-light mt-1">
                            Sistema Centralizado de Entrada de Noticias para el Reino del Pan.
                        </p>
                    </div>
                    <Link to="/">
                        <button className="text-xs text-[#ff4d00] font-bold uppercase tracking-wider font-tvp-head hover:underline self-start sm:self-auto">
                            ← Ver Portal Público
                        </button>
                    </Link>
                </div>

                {formMessage && (
                    <div className={`mb-8 p-4 rounded-xl border text-sm font-bold flex items-center gap-3 shadow-md animate-in fade-in duration-300 ${formMessage.type === "success" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-red-500/10 border-red-500/25 text-red-400"
                        }`}>
                        <span className="text-base">{formMessage.type === "success" ? "✓" : "⚠"}</span>
                        <p>{formMessage.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmitNews} className="bg-[#0e1017] rounded-xl border border-white/5 p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase font-tvp-head">
                                ID de la Noticia <span className="text-[#ff4d00]">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                placeholder="ej: acuerdo-ferroviario-reino-pan"
                                className="w-full bg-[#07080c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors font-mono"
                            />
                            <span className="text-[10px] text-neutral-500 font-light">Se convertirá automáticamente en la URL única / slug.</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase font-tvp-head">
                                Ubicación / Importancia <span className="text-[#ff4d00]">*</span>
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-[#07080c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors h-[46px]"
                            >
                                <option value="secondary">Noticia Secundaria</option>
                                <option value="main">Noticia Principal (Portada Grande)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase font-tvp-head">
                                Categoría Informativa <span className="text-[#ff4d00]">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="ej: POLÍTICA, DEPORTES, SOCIEDAD"
                                className="w-full bg-[#07080c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors uppercase tracking-wider"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase font-tvp-head">
                                Etiqueta Temporal <span className="text-[#ff4d00]">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={timeLabel}
                                onChange={(e) => setTimeLabel(e.target.value)}
                                placeholder="ej: Hace 12 min, En directo, Hace 1 hora"
                                className="w-full bg-[#07080c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase font-tvp-head">
                            Titular de la Noticia <span className="text-[#ff4d00]">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Escribe el titular de alto impacto aquí..."
                            className="w-full bg-[#07080c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors font-bold"
                        />
                    </div>

                    <div className="flex flex-col gap-2 transition-all">
                        <label className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase font-tvp-head flex justify-between">
                            <span>Resumen / Entradilla {type !== "main" && <span className="text-neutral-600 font-normal">(Opcional - Solo para Noticia Principal)</span>}</span>
                        </label>
                        <textarea
                            rows={4}
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            disabled={type !== "main"}
                            placeholder={type === "main" ? "Desarrolla el sumario resumido que aparecerá debajo del gran titular de portada..." : "Campo reservado para noticias de formato principal."}
                            className={`w-full bg-[#07080c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors resize-none ${type !== "main" ? "opacity-40 cursor-not-allowed" : ""}`}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase font-tvp-head">
                            URL de la Imagen de Cabecera <span className="text-[#ff4d00]">*</span>
                        </label>
                        <input
                            type="url"
                            required
                            value={imgUrl}
                            onChange={(e) => setImgUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/... o dirección CDN válida"
                            className="w-full bg-[#07080c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#ff4d00] hover:bg-[#e04300] text-black font-black uppercase text-xs sm:text-sm py-4 rounded-lg transition-all shadow-xl font-tvp-head tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                Transmitiendo a la central...
                            </>
                        ) : "Publicar e Imprimir Noticia"}
                    </button>
                </form>
            </main>
        </div>
    );
}