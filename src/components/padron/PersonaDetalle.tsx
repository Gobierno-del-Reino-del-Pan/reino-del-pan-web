import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  ESTADO_BADGE,
  Expediente,
  PersonaCompleta,
  REGIMEN_LABEL,
} from "../../types/padron";

interface HistorialFila {
  id: number;
  municipio_id: number;
  domicilio: string;
  fecha_inicio: string;
  fecha_fin: string | null;
}

interface PersonaDetalleProps {
  persona: PersonaCompleta | null;
  onClose: () => void;
  onNuevoExpediente: (persona: PersonaCompleta) => void;
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PersonaDetalle({
  persona,
  onClose,
  onNuevoExpediente,
}: PersonaDetalleProps) {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [historial, setHistorial] = useState<HistorialFila[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!persona) return;

    async function cargar() {
      setLoading(true);

      const [{ data: exps }, { data: hist }] = await Promise.all([
        supabase
          .from("padron_expedientes")
          .select("*")
          .eq("padron_persona_id", persona!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("padron_historial")
          .select("*")
          .eq("padron_persona_id", persona!.id)
          .order("fecha_inicio", { ascending: false }),
      ]);

      setExpedientes((exps as Expediente[]) || []);
      setHistorial((hist as HistorialFila[]) || []);
      setLoading(false);
    }

    cargar();
  }, [persona]);

  if (!persona) return null;

  const badge = ESTADO_BADGE[persona.estado_padron];

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg h-full bg-[#0b0c10] border-l border-white/10 overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#0b0c10]/95 backdrop-blur-md border-b border-white/10 px-8 py-6 flex items-start justify-between z-10">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-accent font-bold">
              {REGIMEN_LABEL[persona.regimen_documento]}
            </span>
            <h2 className="mt-1 text-xl font-black text-white">
              {persona.nombre} {persona.apellidos}
            </h2>
            <p className="mt-1 text-xs font-mono text-white/40">{persona.dpi}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors text-xl leading-none"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Datos generales */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block mb-1">
                Estado
              </span>
              <span
                className={`inline-flex text-xs font-bold px-3 py-1 rounded-full border ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block mb-1">
                Municipio
              </span>
              <span className="text-sm text-white font-semibold">{persona.municipio}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 col-span-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block mb-1">
                Domicilio
              </span>
              <span className="text-sm text-white font-semibold">
                {persona.domicilio}
                {persona.codigo_postal ? ` · ${persona.codigo_postal}` : ""}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block mb-1">
                Fecha de alta
              </span>
              <span className="text-sm text-white font-semibold">
                {formatearFecha(persona.fecha_alta_padron)}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block mb-1">
                Última variación
              </span>
              <span className="text-sm text-white font-semibold">
                {formatearFecha(persona.fecha_ultima_variacion)}
              </span>
            </div>
            {persona.fecha_proxima_actuacion && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 col-span-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold block mb-1">
                  Próxima actuación requerida
                </span>
                <span className="text-sm text-white font-semibold">
                  {formatearFecha(persona.fecha_proxima_actuacion)}
                </span>
              </div>
            )}
            {persona.nivel_estudios_descripcion && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 col-span-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block mb-1">
                  Nivel de estudios
                </span>
                <span className="text-sm text-white font-semibold">
                  {persona.nivel_estudios_descripcion}
                </span>
              </div>
            )}
          </section>

          <button
            onClick={() => onNuevoExpediente(persona)}
            className="w-full rounded-full bg-accent px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            + Nuevo expediente
          </button>

          {/* Expedientes */}
          <section>
            <h3 className="text-xs uppercase tracking-[0.25em] text-white/50 font-bold mb-4">
              Expedientes
            </h3>
            {loading ? (
              <p className="text-xs text-white/40">Cargando…</p>
            ) : expedientes.length === 0 ? (
              <p className="text-xs text-white/40">Sin expedientes registrados.</p>
            ) : (
              <div className="space-y-3">
                {expedientes.map((e) => (
                  <div
                    key={e.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{e.tipo_expediente}</span>
                      <span className="text-[10px] font-mono text-white/40">{e.estado}</span>
                    </div>
                    <p className="text-[11px] text-white/40 font-mono mt-1">
                      {e.numero_expediente}
                    </p>
                    {e.observaciones && (
                      <p className="text-xs text-white/60 mt-2">{e.observaciones}</p>
                    )}
                    <p className="text-[10px] text-white/30 mt-2 font-mono">
                      Inicio: {formatearFecha(e.fecha_inicio)}
                      {e.fecha_resolucion ? ` · Resuelto: ${formatearFecha(e.fecha_resolucion)}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Historial padronal */}
          <section>
            <h3 className="text-xs uppercase tracking-[0.25em] text-white/50 font-bold mb-4">
              Historial de domicilios
            </h3>
            {loading ? (
              <p className="text-xs text-white/40">Cargando…</p>
            ) : historial.length === 0 ? (
              <p className="text-xs text-white/40">Sin historial registrado.</p>
            ) : (
              <div className="space-y-3">
                {historial.map((h) => (
                  <div
                    key={h.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4"
                  >
                    <p className="text-sm text-white font-semibold">{h.domicilio}</p>
                    <p className="text-[11px] text-white/40 font-mono mt-1">
                      {formatearFecha(h.fecha_inicio)} — {h.fecha_fin ? formatearFecha(h.fecha_fin) : "actual"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}