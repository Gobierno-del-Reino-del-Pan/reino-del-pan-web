import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Ministro {
    nombre_del_ministro: string | null;
    enlace_avatar: string | null;
}

interface AgendaEvento {
    id: number;
    fecha: string;
    hora: string;
    titulo: string;
    subtitulo: string | null;
    ministros: Ministro | Ministro[] | null;
}

export function AgendaStatCard() {
    const [proximoEvento, setProximoEvento] = useState<AgendaEvento | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProximoEvento() {
            const hoy = new Date().toISOString().split("T")[0];

            try {
                const { data, error } = await supabase
                    .from("agenda_gob")
                    .select(`
            id,
            fecha,
            hora,
            titulo,
            subtitulo,
            ministros!id_ministro (
              nombre_del_ministro,
              enlace_avatar
            )
          `)
                    .gte("fecha", hoy)
                    .order("fecha", { ascending: true })
                    .order("hora", { ascending: true })
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    console.error("Error en la consulta de Supabase:", error.message);
                    throw error;
                }

                // Ahora sí, el log está en el lugar correcto rastreando la info
                console.log("DATOS RECIBIDOS DE SUPABASE:", data);

                setProximoEvento(data as unknown as AgendaEvento);
            } catch (error) {
                console.error("Error cargando la agenda:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProximoEvento();
    }, []);

    // 1. Estado de carga visible mientras Supabase responde
    if (loading) {
        return (
            <div className="animate-pulse bg-gray-900/40 border border-gray-800 rounded-xl p-6 flex flex-col justify-between min-h-[140px]">
                <div className="h-4 bg-gray-800 rounded w-1/3"></div>
                <div className="h-6 bg-gray-800 rounded w-3/4 my-2"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
            </div>
        );
    }

    // 2. Si la consulta responde bien pero la tabla está vacía en el futuro
    if (!proximoEvento) {
        return (
            <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 flex flex-col justify-between min-h-[140px]">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Agenda de Gobierno</span>
                <h4 className="text-lg font-bold text-gray-400 my-1">Sin eventos próximos</h4>
                <p className="text-xs text-gray-500">Pueblo en calma. No hay convocatorias oficiales programadas.</p>
            </div>
        );
    }

    // 3. Extracción segura de los datos del ministro
    const ministroRaw = proximoEvento.ministros;
    const ministroData = Array.isArray(ministroRaw) ? ministroRaw[0] : ministroRaw;

    const avatarUrl = ministroData?.enlace_avatar;
    const nombreMinistro = ministroData?.nombre_del_ministro || "Ministro de Estado";

    return (
        <div className="relative overflow-hidden bg-gray-900/60 border border-gray-800 rounded-xl p-6 flex flex-col justify-between min-h-[140px] group transition-all duration-300 hover:border-amber-500/30">

            {/* Fondo con el avatar del ministro */}
            {avatarUrl && (
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity grayscale group-hover:scale-105 group-hover:opacity-20 transition-all duration-500"
                    style={{ backgroundImage: `url(${avatarUrl})` }}
                />
            )}

            {/* Capa de degradado interna para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent z-0" />

            {/* Contenido */}
            <div className="relative z-10 w-full flex flex-col h-full justify-between gap-2">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Próxima Cita
                    </span>
                    <span className="text-xs font-mono text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded backdrop-blur-sm">
                        {proximoEvento.fecha} - {proximoEvento.hora.slice(0, 5)}
                    </span>
                </div>

                <div>
                    <h4 className="text-base font-bold text-gray-100 line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {proximoEvento.titulo}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                        {proximoEvento.subtitulo || `Convocado por: ${nombreMinistro}`}
                    </p>
                </div>
            </div>
        </div>
    );
}