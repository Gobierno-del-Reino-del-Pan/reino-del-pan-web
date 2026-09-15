import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { PersonaCompleta, TipoExpediente } from "../../types/padron";

interface NuevoExpedienteModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  persona: PersonaCompleta | null;
  tiposExpediente: TipoExpediente[];
  usuarioActual: string;
}

// Tipos de expediente que no tiene sentido abrir manualmente desde aquí:
// las altas ya tienen su propio flujo, y B-BC lo genera el sistema.
const TIPOS_OCULTOS = new Set(["A-OM", "A-CR", "A-NA", "B-BC"]);

export default function NuevoExpedienteModal({
  open,
  onClose,
  onCreated,
  persona,
  tiposExpediente,
  usuarioActual,
}: NuevoExpedienteModalProps) {
  const [tipo, setTipo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [marcarResuelto, setMarcarResuelto] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tiposDisponibles = useMemo(
    () => tiposExpediente.filter((t) => t.activo && !TIPOS_OCULTOS.has(t.codigo)),
    [tiposExpediente]
  );

  if (!open || !persona) return null;

  const handleSubmit = async () => {
    setError(null);

    if (!tipo) {
      setError("Selecciona el tipo de expediente.");
      return;
    }

    setSubmitting(true);

    const numeroExpediente = `PAD-${new Date().getFullYear()}-${tipo}-${persona.id}-${Date.now()}`;
    const hoy = new Date().toISOString().slice(0, 10);

    const { error: err } = await supabase.from("padron_expedientes").insert({
      numero_expediente: numeroExpediente,
      padron_persona_id: persona.id,
      tipo_expediente: tipo,
      fecha_inicio: hoy,
      fecha_resolucion: marcarResuelto ? hoy : null,
      estado: marcarResuelto ? "RESUELTO" : "ABIERTO",
      observaciones: observaciones.trim() || null,
      creado_por: usuarioActual,
      resuelto_por: marcarResuelto ? usuarioActual : null,
    });

    if (err) {
      // Los mensajes del trigger de validación (p.ej. "M-RN solo puede
      // utilizarse con documentos TPIT…") ya vienen en español y listos
      // para mostrar tal cual al funcionario.
      setError(err.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setTipo("");
    setObservaciones("");
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-lg bg-[#0e1017] border border-white/10 rounded-[28px] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-white/10">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-accent font-bold">
              {persona.nombre} {persona.apellidos}
            </span>
            <h2 className="mt-1 text-xl font-black text-white">Nuevo expediente</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors text-xl leading-none"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="px-8 py-6 space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-white/50 font-bold mb-2">
              Tipo de expediente
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            >
              <option value="">Selecciona…</option>
              {tiposDisponibles.map((t) => (
                <option key={t.codigo} value={t.codigo}>
                  {t.codigo} — {t.descripcion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-white/50 font-bold mb-2">
              Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-accent/60 resize-none"
            />
          </div>

          <label className="flex items-center gap-3 text-xs text-white/60 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={marcarResuelto}
              onChange={(e) => setMarcarResuelto(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
            Resolver el expediente ahora mismo (aplica el efecto sobre la inscripción)
          </label>

          {error && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-xs text-rose-300 font-medium">
              {error}
            </div>
          )}
        </div>

        <div className="px-8 pb-8 pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white/60 hover:text-white hover:border-white/30 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-full bg-accent px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Guardando…" : "Crear expediente"}
          </button>
        </div>
      </div>
    </div>
  );
}